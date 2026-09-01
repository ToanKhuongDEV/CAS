package vn.cas.payment.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.ordering.service.CustomerOrderingService;
import vn.cas.payment.mapper.PaymentMapper;
import vn.cas.payment.model.PaymentView;
import vn.cas.store.service.CustomerTableSessionService;
import vn.cas.store.mapper.DiningTableMapper;

@Service
public class PaymentService {
    private final PaymentMapper payments;
    private final CustomerTableSessionService sessions;
    private final DiningTableMapper tables;
    private final CustomerOrderingService orders;
    private final ObjectMapper json;
    public PaymentService(PaymentMapper payments, CustomerTableSessionService sessions,
            DiningTableMapper tables, CustomerOrderingService orders, ObjectMapper json) {
        this.payments = payments;
        this.sessions = sessions;
        this.tables = tables;
        this.orders = orders;
        this.json = json;
    }
    @Transactional
    public PaymentView create(String sessionPublicId) {
        var session = sessions.requireCurrentForUpdate(sessionPublicId);
        var current = payments.findBySessionId(session.sessionId());
        if (current != null)
            return current;
        var bill = orders.currentBill(sessionPublicId);
        if (bill.payableAmount().signum() <= 0)
            throw new ApiException(HttpStatus.CONFLICT, "Bill không có số tiền cần thanh toán.");
        try {
            payments.insert(UUID.randomUUID().toString(), session.sessionId(), bill.payableAmount(),
                    json.writeValueAsString(bill));
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
    @Transactional
    public PaymentView confirm(OperationalPrincipal p, String publicId) {
        var v = payments.findByPublicId(p.storeId(), publicId);
        if (v == null)
            throw new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy payment.");
        if ("PENDING".equals(v.status())) {
            payments.confirm(v.id(), p.accountId(), p.displayName());
            tables.closePaymentSession(v.tableSessionId());
        }
        return payments.findByPublicId(p.storeId(), publicId);
    }
}
