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
import org.springframework.transaction.annotation.Isolation;
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
import vn.cas.store.service.SalesSessionService;
import vn.cas.store.mapper.DiningTableMapper;

@Service
public class PaymentService {
    private final PaymentMapper payments;
    private final SalesSessionService sessions;
    private final DiningTableMapper tables;
    private final CustomerOrderingService orders;
    private final OrderingMapper ordering;
    private final AuditLogService auditLogs;
    private final ObjectMapper json;
    private final PromotionService promotions;
    private final BillAdjustmentService adjustments;
    @Autowired
    public PaymentService(PaymentMapper payments, SalesSessionService sessions,
            DiningTableMapper tables, CustomerOrderingService orders, OrderingMapper ordering,
            AuditLogService auditLogs, ObjectMapper json, PromotionService promotions,
            BillAdjustmentService adjustments) {
        this.payments = payments;
        this.sessions = sessions;
        this.tables = tables;
        this.orders = orders;
        this.ordering = ordering;
        this.auditLogs = auditLogs;
        this.json = json;
        this.promotions = promotions;
        this.adjustments = adjustments;
    }
    public PaymentService(PaymentMapper payments, SalesSessionService sessions,
            DiningTableMapper tables, CustomerOrderingService orders, OrderingMapper ordering,
            AuditLogService auditLogs, ObjectMapper json, PromotionService promotions) {
        this(payments, sessions, tables, orders, ordering, auditLogs, json, promotions, null);
    }
    public PaymentService(PaymentMapper payments, SalesSessionService sessions,
            DiningTableMapper tables, CustomerOrderingService orders, OrderingMapper ordering,
            AuditLogService auditLogs, ObjectMapper json) {
        this(payments, sessions, tables, orders, ordering, auditLogs, json, null);
    }
    @Transactional(isolation = Isolation.READ_COMMITTED, noRollbackFor = PromotionUnavailableException.class)
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
        var discount = promotions == null ? null : promotions.selectedForPayment(session);
        if (promotions != null && session.selectedPromotionId() != null && discount == null) {
            promotions.clear(sessionPublicId);
            throw new PromotionUnavailableException();
        }
        var amount = discount == null ? bill.payableAmount() : discount.payableAmount();
        var billAdjustments = adjustments == null
                ? java.util.List.<vn.cas.payment.model.BillAdjustment>of()
                : adjustments.list(session.sessionId());
        amount = BillAdjustmentService.total(amount, billAdjustments);
        if (amount.signum() < 0)
            throw new ApiException(HttpStatus.CONFLICT, "Bill có số tiền không hợp lệ.");
        try {
            var snapshot = new LinkedHashMap<String, Object>();
            snapshot.put("bill", bill);
            snapshot.put("discount", discount);
            snapshot.put("adjustments", billAdjustments);
            String snapshotValue = json.writeValueAsString(snapshot);
            payments.insert(UUID.randomUUID().toString(), session.sessionId(), amount,
                    snapshotValue);
            long paymentId = payments.lastInsertId();
            if (promotions != null) {
                promotions.snapshot(session, paymentId, discount, snapshotValue);
                if (discount != null)
                    promotions.reserve(paymentId);
            }
            tables.moveSessionToPaymentPending(session.sessionId());
            return payments.findBySessionId(session.sessionId());
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
    }
    @Transactional(isolation = Isolation.READ_COMMITTED, noRollbackFor = PromotionUnavailableException.class)
    public PaymentView createForOperator(OperationalPrincipal principal, String sessionPublicId,
            UUID requestId) {
        var session = sessions.requireCurrentForUpdate(sessionPublicId);
        if (session.storeId() != principal.storeId())
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "Không có quyền tạo yêu cầu thanh toán cho phiên bàn này.");
        var existing = payments.findBySessionId(session.sessionId());
        var payment = create(sessionPublicId);
        if (existing == null) {
            auditLogs.record(new AuditLogCommand(principal.storeId(), requestId,
                    "PAYMENT_REQUESTED_FOR_CUSTOMER", "PAYMENT", payment.id(), payment.publicId(),
                    "{}", principal.accountId(), principal.displayName(),
                    "Nhân viên tạo yêu cầu thanh toán hộ khách."));
        }
        return payment;
    }

    private static final class PromotionUnavailableException extends ApiException {
        private PromotionUnavailableException() {
            super(HttpStatus.CONFLICT,
                    "Khuyến mãi đã không còn khả dụng. Vui lòng chọn lại khuyến mãi.");
        }
    }
    @Transactional(readOnly = true)
    public PaymentView current(String id) {
        var payment = id == null || id.isBlank() ? null : payments.findCustomerPayment(id);
        if (payment != null)
            return payment;
        sessions.requireCurrent(id);
        return null;
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
            payment = createUnpaidPayment(sessionPublicId, session);
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

    private PaymentView createUnpaidPayment(String sessionPublicId,
            vn.cas.store.model.SalesSessionLookup session) {
        if (!"OPEN".equals(session.sessionStatus()))
            throw new ApiException(HttpStatus.CONFLICT,
                    "Phiên bàn không thể ghi nhận chưa thanh toán.");
        var bill = orders.currentBill(sessionPublicId);
        var billAdjustments = adjustments == null
                ? java.util.List.<vn.cas.payment.model.BillAdjustment>of()
                : adjustments.list(session.sessionId());
        var amount = BillAdjustmentService.total(bill.payableAmount(), billAdjustments);
        if (bill.payableAmount().signum() < 0)
            throw new ApiException(HttpStatus.CONFLICT, "Bill có số tiền không hợp lệ.");
        try {
            var snapshot = new LinkedHashMap<String, Object>();
            snapshot.put("bill", bill);
            snapshot.put("discount", null);
            snapshot.put("adjustments", billAdjustments);
            payments.insert(UUID.randomUUID().toString(), session.sessionId(), amount,
                    json.writeValueAsString(snapshot));
            tables.moveSessionToPaymentPending(session.sessionId());
            return payments.findBySessionId(session.sessionId());
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public PaymentView confirm(OperationalPrincipal p, String publicId) {
        return confirm(p, publicId, null);
    }
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public PaymentView confirm(OperationalPrincipal p, String publicId, String expectedSnapshot) {
        return confirm(p, publicId, expectedSnapshot, null, null, null);
    }
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public PaymentView confirm(OperationalPrincipal p, String publicId, String expectedSnapshot,
            List<AdjustmentChange> additions, List<AdjustmentChange> updates,
            List<UUID> deletions) {
        var v = payments.findByPublicId(p.storeId(), publicId);
        if (v == null)
            throw new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy payment.");
        payments.lockSession(v.salesSessionId());
        v = payments.findByPublicId(p.storeId(), publicId);
        boolean hasChanges = (additions != null && !additions.isEmpty())
                || (updates != null && !updates.isEmpty())
                || (deletions != null && !deletions.isEmpty());
        if (!"PENDING".equals(v.status()) && hasChanges)
            throw new ApiException(HttpStatus.CONFLICT,
                    "Payment đã được xác nhận. Vui lòng tải lại hóa đơn.");
        if ("PENDING".equals(v.status())) {
            if (expectedSnapshot != null && !expectedSnapshot.equals(v.billSnapshot()))
                throw new ApiException(HttpStatus.CONFLICT,
                        "Hóa đơn đã thay đổi. Vui lòng tải lại trước khi xác nhận.");
            if (hasChanges) {
                String sessionId = adjustments.paymentSession(p, publicId);
                if (deletions != null)
                    for (var id : deletions)
                        adjustments.delete(p, sessionId, id.toString());
                if (updates != null)
                    for (var item : updates)
                        adjustments.edit(p, sessionId, item.id().toString(), item.adjustmentType(),
                                item.amount(), item.reason());
                if (additions != null)
                    for (var item : additions)
                        adjustments.add(p, sessionId, item.id(), item.adjustmentType(),
                                item.amount(), item.reason());
                v = payments.findByPublicId(p.storeId(), publicId);
            }
            boolean collectingRecordedUnpaidPayment = payments
                    .hasOpenUnpaidRecord(v.salesSessionId());
            if (collectingRecordedUnpaidPayment)
                v = removePromotionFromRecordedUnpaidPayment(v);
            if (payments.confirm(v.id(), p.accountId(), p.displayName()) != 1)
                throw new ApiException(HttpStatus.CONFLICT, "Không thể xác nhận payment.");
            payments.resolveOpenUnpaidRecord(v.salesSessionId(), v.id());
            if (promotions != null && !collectingRecordedUnpaidPayment
                    && hasDiscount(v.billSnapshot()))
                promotions.complete(v.id());
            tables.closePaymentSession(v.salesSessionId());
            auditLogs.record(new AuditLogCommand(p.storeId(), UUID.randomUUID(),
                    "PAYMENT_CONFIRMED", "PAYMENT", v.id(), v.publicId(), "{}", p.accountId(),
                    p.displayName(), "Xác nhận payment thủ công."));
        }
        return payments.findByPublicId(p.storeId(), publicId);
    }
    private EligibleUnpaidSession eligibleUnpaidSession(UnpaidSessionView session) {
        var payment = payments.findBySessionId(session.sessionId());
        BigDecimal amount = payment == null
                ? BillAdjustmentService.total(
                        orders.currentBill(session.sessionPublicId()).payableAmount(),
                        adjustments == null
                                ? java.util.List.of()
                                : adjustments.list(session.sessionId()))
                : payment.amount();
        return new EligibleUnpaidSession(session.sessionPublicId(), session.tableCode(), amount,
                session.sessionStatus(), session.openedAt());
    }

    private PaymentView removePromotionFromUnpaidPayment(String sessionPublicId,
            PaymentView payment) {
        if (!hasDiscount(payment.billSnapshot()))
            return payment;
        try {
            var bill = orders.currentBill(sessionPublicId);
            var billAdjustments = adjustments == null
                    ? java.util.List.<vn.cas.payment.model.BillAdjustment>of()
                    : adjustments.list(payment.salesSessionId());
            var amount = BillAdjustmentService.total(bill.payableAmount(), billAdjustments);
            var snapshot = new LinkedHashMap<String, Object>();
            snapshot.put("bill", bill);
            snapshot.put("discount", null);
            snapshot.put("adjustments", billAdjustments);
            String snapshotValue = json.writeValueAsString(snapshot);
            if (payments.removePendingPaymentDiscount(payment.id(), amount, snapshotValue) != 1)
                throw new ApiException(HttpStatus.CONFLICT,
                        "Không thể bỏ khuyến mãi khỏi khoản không thanh toán.");
            if (promotions != null)
                promotions.forfeit(payment.id());
            return new PaymentView(payment.id(), payment.publicId(), payment.salesSessionId(),
                    payment.tableCode(), amount, snapshotValue, payment.status(),
                    payment.confirmedByName(), payment.confirmedAt(), payment.createdAt());
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
    }

    private PaymentView removePromotionFromRecordedUnpaidPayment(PaymentView payment) {
        if (!hasDiscount(payment.billSnapshot()))
            return payment;
        try {
            var snapshot = json.readTree(payment.billSnapshot());
            if (!(snapshot instanceof ObjectNode root) || !root.path("bill").isObject()
                    || !root.path("bill").hasNonNull("payableAmount"))
                throw new ApiException(HttpStatus.CONFLICT,
                        "Bill snapshot của khoản không thanh toán không hợp lệ.");
            BigDecimal amount = root.path("bill").path("payableAmount").decimalValue();
            var items = root.path("adjustments");
            if (items.isArray()) {
                for (var item : items) {
                    if (!item.path("amount").isNumber()
                            || !("INCREASE".equals(item.path("adjustmentType").asText())
                                    || "DECREASE".equals(item.path("adjustmentType").asText())))
                        throw new ApiException(HttpStatus.CONFLICT, "Bill snapshot không hợp lệ.");
                    var value = item.path("amount").decimalValue();
                    amount = amount.add("INCREASE".equals(item.path("adjustmentType").asText())
                            ? value
                            : value.negate());
                }
                amount = amount.max(BigDecimal.ZERO);
            }
            if (amount.signum() < 0)
                throw new ApiException(HttpStatus.CONFLICT,
                        "Bill snapshot của khoản không thanh toán không hợp lệ.");
            root.putNull("discount");
            String snapshotValue = json.writeValueAsString(root);
            if (payments.removePendingPaymentDiscount(payment.id(), amount, snapshotValue) != 1
                    || payments.removeOpenUnpaidRecordDiscount(payment.salesSessionId(), amount,
                            snapshotValue) != 1)
                throw new ApiException(HttpStatus.CONFLICT,
                        "Không thể bỏ khuyến mãi khỏi khoản không thanh toán.");
            if (promotions != null)
                promotions.forfeit(payment.id());
            return new PaymentView(payment.id(), payment.publicId(), payment.salesSessionId(),
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

    private boolean hasDiscount(String snapshotValue) {
        try {
            var snapshot = json.readTree(snapshotValue);
            return snapshot instanceof ObjectNode root && root.hasNonNull("discount");
        } catch (JsonProcessingException e) {
            throw new ApiException(HttpStatus.CONFLICT, "Bill snapshot không hợp lệ.");
        }
    }
    public record EligibleUnpaidSession(String sessionId, Long tableCode, BigDecimal amount,
            String sessionStatus, java.time.LocalDateTime openedAt) {
    }
    public record AdjustmentChange(UUID id, String adjustmentType, BigDecimal amount,
            String reason) {
    }
}
