package vn.cas.payment.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.dto.AuditLogCommand;
import vn.cas.operation.service.AuditLogService;
import vn.cas.ordering.service.CustomerOrderingService;
import vn.cas.payment.mapper.BillAdjustmentMapper;
import vn.cas.payment.mapper.PaymentMapper;
import vn.cas.payment.model.BillAdjustment;
import vn.cas.promotion.service.PromotionService;
import vn.cas.store.model.SalesSessionLookup;
import vn.cas.store.service.SalesSessionService;

@Service
public class BillAdjustmentService {
    private final BillAdjustmentMapper adjustments;
    private final PaymentMapper payments;
    private final SalesSessionService sessions;
    private final CustomerOrderingService orders;
    private final PromotionService promotions;
    private final AuditLogService audit;
    private final ObjectMapper json;

    public BillAdjustmentService(BillAdjustmentMapper adjustments, PaymentMapper payments,
            SalesSessionService sessions, CustomerOrderingService orders,
            PromotionService promotions, AuditLogService audit, ObjectMapper json) {
        this.adjustments = adjustments;
        this.payments = payments;
        this.sessions = sessions;
        this.orders = orders;
        this.promotions = promotions;
        this.audit = audit;
        this.json = json;
    }

    public List<BillAdjustment> list(long sessionId) {
        return adjustments.findBySessionId(sessionId);
    }

    public static BigDecimal total(BigDecimal base, List<BillAdjustment> items) {
        return base
                .add(items.stream()
                        .map(item -> "INCREASE".equals(item.adjustmentType())
                                ? item.amount()
                                : item.amount().negate())
                        .reduce(BigDecimal.ZERO, BigDecimal::add))
                .max(BigDecimal.ZERO);
    }

    @Transactional(readOnly = true)
    public List<BillAdjustment> list(OperationalPrincipal principal, String sessionId) {
        var session = sessions.requireCurrent(sessionId);
        checkStore(principal, session);
        return list(session.sessionId());
    }

    @Transactional(readOnly = true)
    public List<BillAdjustment> listForCustomer(String sessionId) {
        return list(sessions.requireCurrent(sessionId).sessionId());
    }

    @Transactional(readOnly = true)
    public String paymentSession(OperationalPrincipal principal, String paymentId) {
        String session = payments.findSessionPublicId(principal.storeId(), paymentId);
        if (session == null)
            throw new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy payment.");
        return session;
    }

    @Transactional
    public List<BillAdjustment> add(OperationalPrincipal principal, String sessionId, UUID id,
            String type, BigDecimal amount, String reason) {
        var session = locked(principal, sessionId);
        var existing = list(session.sessionId()).stream()
                .filter(item -> item.publicId().equals(id.toString())).findFirst();
        if (existing.isPresent()) {
            var item = existing.get();
            if (!item.adjustmentType().equals(type) || item.amount().compareTo(amount) != 0
                    || !item.reason().equals(reason.trim()))
                throw new ApiException(HttpStatus.CONFLICT, "Mã yêu cầu đã được sử dụng.");
            return list(session.sessionId());
        }
        if ("DECREASE".equals(type) && amount.compareTo(currentAmount(session)) > 0)
            throw new ApiException(HttpStatus.CONFLICT, "Số tiền giảm vượt số tiền phải trả.");
        adjustments.insert(id.toString(), session.sessionId(), type, amount, reason.trim(),
                principal.accountId());
        record(principal, session, id.toString(), "BILL_ADJUSTMENT_ADDED", type, amount, reason);
        updatePendingPayment(session);
        return list(session.sessionId());
    }

    @Transactional
    public List<BillAdjustment> edit(OperationalPrincipal principal, String sessionId, String id,
            String type, BigDecimal amount, String reason) {
        requireAdmin(principal);
        var session = locked(principal, sessionId);
        var existing = list(session.sessionId());
        if (existing.stream().noneMatch(item -> item.publicId().equals(id)))
            throw new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy điều chỉnh.");
        var remaining = existing.stream().filter(item -> !item.publicId().equals(id)).toList();
        if ("DECREASE".equals(type) && amount.compareTo(total(baseAmount(session), remaining)) > 0)
            throw new ApiException(HttpStatus.CONFLICT, "Số tiền giảm vượt số tiền phải trả.");
        adjustments.update(session.sessionId(), id, type, amount, reason.trim());
        record(principal, session, id, "BILL_ADJUSTMENT_UPDATED", type, amount, reason);
        updatePendingPayment(session);
        return list(session.sessionId());
    }

    @Transactional
    public List<BillAdjustment> delete(OperationalPrincipal principal, String sessionId,
            String id) {
        requireAdmin(principal);
        var session = locked(principal, sessionId);
        var item = list(session.sessionId()).stream().filter(value -> value.publicId().equals(id))
                .findFirst().orElseThrow(
                        () -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy điều chỉnh."));
        long adjustmentId = adjustments.findId(session.sessionId(), id);
        adjustments.delete(session.sessionId(), id);
        record(principal, session, id, adjustmentId, "BILL_ADJUSTMENT_DELETED",
                item.adjustmentType(), item.amount(), item.reason());
        updatePendingPayment(session);
        return list(session.sessionId());
    }

    private SalesSessionLookup locked(OperationalPrincipal principal, String sessionId) {
        var session = sessions.requireCurrentForUpdate(sessionId);
        checkStore(principal, session);
        return session;
    }

    private void checkStore(OperationalPrincipal principal, SalesSessionLookup session) {
        if (session.storeId() != principal.storeId())
            throw new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy phiên bàn.");
    }

    private void requireAdmin(OperationalPrincipal principal) {
        if (!"ADMIN".equals(principal.role()) && !"SUPER_ADMIN".equals(principal.role()))
            throw new ApiException(HttpStatus.FORBIDDEN, "Không có quyền sửa điều chỉnh.");
    }

    private BigDecimal currentAmount(SalesSessionLookup session) {
        return total(baseAmount(session), list(session.sessionId()));
    }

    private BigDecimal baseAmount(SalesSessionLookup session) {
        var payment = payments.findBySessionId(session.sessionId());
        if (payment != null) {
            try {
                var snapshot = json.readTree(payment.billSnapshot());
                var discount = snapshot.path("discount");
                var base = discount.isObject()
                        ? discount.path("payableAmount")
                        : snapshot.path("bill").path("payableAmount");
                if (!base.isNumber())
                    throw new ApiException(HttpStatus.CONFLICT, "Bill snapshot không hợp lệ.");
                return base.decimalValue();
            } catch (JsonProcessingException e) {
                throw new ApiException(HttpStatus.CONFLICT, "Bill snapshot không hợp lệ.");
            }
        }
        var promotion = promotions.selected(session);
        return promotion == null
                ? orders.currentBill(session.sessionPublicId()).payableAmount()
                : promotion.payableAmount();
    }

    private void updatePendingPayment(SalesSessionLookup session) {
        var payment = payments.findBySessionId(session.sessionId());
        if (payment == null)
            return;
        if (!"PENDING".equals(payment.status()))
            throw new ApiException(HttpStatus.CONFLICT, "Payment không còn chờ xác nhận.");
        try {
            var root = (ObjectNode) json.readTree(payment.billSnapshot());
            var items = list(session.sessionId());
            root.set("adjustments", json.valueToTree(items));
            if (payments.removePendingPaymentDiscount(payment.id(),
                    total(baseAmount(session), items), json.writeValueAsString(root)) != 1)
                throw new ApiException(HttpStatus.CONFLICT, "Không thể cập nhật payment.");
        } catch (JsonProcessingException e) {
            throw new ApiException(HttpStatus.CONFLICT, "Bill snapshot không hợp lệ.");
        }
    }

    private void record(OperationalPrincipal principal, SalesSessionLookup session, String id,
            String action, String type, BigDecimal amount, String reason) {
        record(principal, session, id, adjustments.findId(session.sessionId(), id), action, type,
                amount, reason);
    }

    private void record(OperationalPrincipal principal, SalesSessionLookup session, String id,
            long adjustmentId, String action, String type, BigDecimal amount, String reason) {
        try {
            String change = json.writeValueAsString(
                    java.util.Map.of("type", type, "amount", amount, "reason", reason.trim()));
            audit.record(new AuditLogCommand(principal.storeId(), UUID.randomUUID(), action,
                    "BILL_ADJUSTMENT", adjustmentId, id, change, principal.accountId(),
                    principal.displayName(), "Điều chỉnh hóa đơn."));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
    }
}
