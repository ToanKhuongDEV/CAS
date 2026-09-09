package vn.cas.payment.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.time.LocalDate;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.UUID;
import java.math.BigDecimal;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.dto.AuditLogCommand;
import vn.cas.operation.service.AuditLogService;
import vn.cas.ordering.mapper.OrderingMapper;
import vn.cas.ordering.service.CustomerOrderingService;
import vn.cas.payment.mapper.PaymentMapper;
import vn.cas.payment.model.PaymentView;
import vn.cas.payment.model.UnpaidRecordView;
import vn.cas.payment.model.UnpaidSessionView;
import vn.cas.promotion.service.PromotionService;
import vn.cas.store.service.CustomerTableSessionService;
import vn.cas.store.mapper.DiningTableMapper;

@Service
public class PaymentService {
    private final PaymentMapper payments;
    private final CustomerTableSessionService sessions;
    private final DiningTableMapper tables;
    private final CustomerOrderingService orders;
    private final OrderingMapper ordering;
    private final AuditLogService auditLogs;
    private final ObjectMapper json;
    private final PromotionService promotions;
    @Autowired
    public PaymentService(PaymentMapper payments, CustomerTableSessionService sessions,
            DiningTableMapper tables, CustomerOrderingService orders, OrderingMapper ordering,
            AuditLogService auditLogs, ObjectMapper json, PromotionService promotions) {
        this.payments = payments;
        this.sessions = sessions;
        this.tables = tables;
        this.orders = orders;
        this.ordering = ordering;
        this.auditLogs = auditLogs;
        this.json = json;
        this.promotions = promotions;
    }
    public PaymentService(PaymentMapper payments, CustomerTableSessionService sessions,
            DiningTableMapper tables, CustomerOrderingService orders, OrderingMapper ordering,
            AuditLogService auditLogs, ObjectMapper json) {
        this(payments, sessions, tables, orders, ordering, auditLogs, json, null);
    }
    @Transactional
    public PaymentView create(String sessionPublicId) {
        var session = sessions.requireCurrentForUpdate(sessionPublicId);
        var current = payments.findBySessionId(session.sessionId());
        if (current != null)
            return current;
        if (!"OPEN".equals(session.sessionStatus()))
            throw new ApiException(HttpStatus.CONFLICT, "Phiên bàn không thể yêu cầu thanh toán.");
        if (ordering.hasPendingCancellationRequests(session.sessionId()))
            throw new ApiException(HttpStatus.CONFLICT,
                    "Vui lòng chờ xử lý các yêu cầu hủy món trước khi thanh toán.");
        var bill = orders.currentBill(sessionPublicId);
        var discount = promotions == null ? null : promotions.selected(session);
        var amount = discount == null ? bill.payableAmount() : discount.payableAmount();
        if (amount.signum() < 0)
            throw new ApiException(HttpStatus.CONFLICT, "Bill có số tiền không hợp lệ.");
        try {
            var snapshot = new LinkedHashMap<String, Object>();
            snapshot.put("bill", bill);
            snapshot.put("discount", discount);
            String snapshotValue = json.writeValueAsString(snapshot);
            payments.insert(UUID.randomUUID().toString(), session.sessionId(), amount,
                    snapshotValue);
            if (promotions != null)
                promotions.snapshot(session, payments.lastInsertId(), discount, snapshotValue);
            tables.moveSessionToPaymentPending(session.sessionId());
            return payments.findBySessionId(session.sessionId());
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
    }
    @Transactional(readOnly = true)
    public PaymentView current(String id) {
        return payments.findBySessionId(sessions.requireCurrent(id).sessionId());
    }
    @Transactional(readOnly = true)
    public List<PaymentView> pending(OperationalPrincipal p) {
        return payments.findPending(p.storeId());
    }
    @Transactional(readOnly = true)
    public List<PaymentView> paidToday(OperationalPrincipal p) {
        var today = LocalDate.now();
        return payments.findPaidBetween(p.storeId(), today.atStartOfDay(),
                today.plusDays(1).atStartOfDay());
    }
    @Transactional(readOnly = true)
    public long pendingCount(OperationalPrincipal p) {
        return payments.countPending(p.storeId());
    }
    @Transactional(readOnly = true)
    public List<UnpaidRecordView> unpaidRecords(OperationalPrincipal principal, String status) {
        return payments.findUnpaidRecords(principal.storeId(), status);
    }
    @Transactional(readOnly = true)
    public List<EligibleUnpaidSession> eligibleUnpaidSessions(OperationalPrincipal principal,
            int minimumOpenMinutes) {
        return payments.findEligibleUnpaidSessions(principal.storeId(), minimumOpenMinutes).stream()
                .map(session -> eligibleUnpaidSession(session)).toList();
    }
    @Transactional
    public UnpaidRecordView recordUnpaid(OperationalPrincipal principal, String sessionPublicId,
            String reason) {
        var session = sessions.requireCurrentForUpdate(sessionPublicId);
        if (session.storeId() != principal.storeId())
            throw new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy phiên bàn.");
        if (!tables.hasOrders(session.sessionId()))
            throw new ApiException(HttpStatus.CONFLICT,
                    "Phiên bàn chưa có món để ghi nhận chưa thanh toán.");
        if (ordering.hasPendingCancellationRequests(session.sessionId()))
            throw new ApiException(HttpStatus.CONFLICT,
                    "Vui lòng chờ xử lý các yêu cầu hủy món trước khi ghi nhận chưa thanh toán.");
        var payment = payments.findBySessionId(session.sessionId());
        if (payment == null) {
            payment = create(sessionPublicId);
        }
        if (!"PENDING".equals(payment.status()))
            throw new ApiException(HttpStatus.CONFLICT,
                    "Payment không còn ở trạng thái chờ xác nhận.");
        payment = removePromotionFromUnpaidPayment(sessionPublicId, payment);
        String publicId = UUID.randomUUID().toString();
        if (payments.insertUnpaidRecord(publicId, session.sessionId(), payment.amount(),
                payment.billSnapshot(), normalize(reason), principal.accountId(),
                principal.displayName()) != 1)
            throw new ApiException(HttpStatus.CONFLICT,
                    "Phiên bàn đã được ghi nhận chưa thanh toán.");
        if (tables.closePaymentSession(session.sessionId()) != 1)
            throw new ApiException(HttpStatus.CONFLICT, "Không thể đóng phiên bàn.");
        auditLogs.record(new AuditLogCommand(principal.storeId(), UUID.randomUUID(),
                "UNPAID_RECORDED", "UNPAID_RECORD", session.sessionId(), publicId, "{}",
                principal.accountId(), principal.displayName(), "Ghi nhận phiên chưa thanh toán."));
        return payments.findUnpaidRecordByPublicId(principal.storeId(), publicId);
    }
    @Transactional
    public PaymentView confirm(OperationalPrincipal p, String publicId) {
        var v = payments.findByPublicId(p.storeId(), publicId);
        if (v == null)
            throw new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy payment.");
        if ("PENDING".equals(v.status())) {
            boolean collectingRecordedUnpaidPayment = payments
                    .hasOpenUnpaidRecord(v.tableSessionId());
            if (collectingRecordedUnpaidPayment)
                v = removePromotionFromRecordedUnpaidPayment(v);
            if (payments.confirm(v.id(), p.accountId(), p.displayName()) == 1) {
                payments.resolveOpenUnpaidRecord(v.tableSessionId(), v.id());
                if (promotions != null && !collectingRecordedUnpaidPayment
                        && !v.billSnapshot().contains("\"discount\":null"))
                    promotions.redeem(v.id());
                tables.closePaymentSession(v.tableSessionId());
                auditLogs.record(new AuditLogCommand(p.storeId(), UUID.randomUUID(),
                        "PAYMENT_CONFIRMED", "PAYMENT", v.id(), v.publicId(), "{}", p.accountId(),
                        p.displayName(), "Xác nhận payment thủ công."));
            }
        }
        return payments.findByPublicId(p.storeId(), publicId);
    }
    private EligibleUnpaidSession eligibleUnpaidSession(UnpaidSessionView session) {
        var payment = payments.findBySessionId(session.sessionId());
        BigDecimal amount = payment == null
                ? orders.currentBill(session.sessionPublicId()).payableAmount()
                : payment.amount();
        return new EligibleUnpaidSession(session.sessionPublicId(), session.tableCode(), amount,
                session.sessionStatus(), session.openedAt());
    }

    private PaymentView removePromotionFromUnpaidPayment(String sessionPublicId,
            PaymentView payment) {
        if (!payment.billSnapshot().contains("\"discount\":")
                || payment.billSnapshot().contains("\"discount\":null"))
            return payment;
        try {
            var bill = orders.currentBill(sessionPublicId);
            var snapshot = new LinkedHashMap<String, Object>();
            snapshot.put("bill", bill);
            snapshot.put("discount", null);
            String snapshotValue = json.writeValueAsString(snapshot);
            if (payments.removePendingPaymentDiscount(payment.id(), bill.payableAmount(),
                    snapshotValue) != 1)
                throw new ApiException(HttpStatus.CONFLICT,
                        "Không thể bỏ khuyến mãi khỏi khoản không thanh toán.");
            return new PaymentView(payment.id(), payment.publicId(), payment.tableSessionId(),
                    payment.tableCode(), bill.payableAmount(), snapshotValue, payment.status(),
                    payment.confirmedByName(), payment.confirmedAt(), payment.createdAt());
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
    }

    private PaymentView removePromotionFromRecordedUnpaidPayment(PaymentView payment) {
        if (!payment.billSnapshot().contains("\"discount\":")
                || payment.billSnapshot().contains("\"discount\":null"))
            return payment;
        try {
            var snapshot = json.readTree(payment.billSnapshot());
            if (!(snapshot instanceof ObjectNode root) || !root.path("bill").isObject()
                    || !root.path("bill").hasNonNull("payableAmount"))
                throw new ApiException(HttpStatus.CONFLICT,
                        "Bill snapshot của khoản không thanh toán không hợp lệ.");
            BigDecimal amount = root.path("bill").path("payableAmount").decimalValue();
            if (amount.signum() < 0)
                throw new ApiException(HttpStatus.CONFLICT,
                        "Bill snapshot của khoản không thanh toán không hợp lệ.");
            root.putNull("discount");
            String snapshotValue = json.writeValueAsString(root);
            if (payments.removePendingPaymentDiscount(payment.id(), amount, snapshotValue) != 1
                    || payments.removeOpenUnpaidRecordDiscount(payment.tableSessionId(), amount,
                            snapshotValue) != 1)
                throw new ApiException(HttpStatus.CONFLICT,
                        "Không thể bỏ khuyến mãi khỏi khoản không thanh toán.");
            return new PaymentView(payment.id(), payment.publicId(), payment.tableSessionId(),
                    payment.tableCode(), amount, snapshotValue, payment.status(),
                    payment.confirmedByName(), payment.confirmedAt(), payment.createdAt());
        } catch (JsonProcessingException e) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Bill snapshot của khoản không thanh toán không hợp lệ.");
        }
    }

    private static String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
    public record EligibleUnpaidSession(String sessionId, long tableCode, BigDecimal amount,
            String sessionStatus, java.time.LocalDateTime openedAt) {
    }
}
