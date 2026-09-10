package vn.cas.operation.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.dto.AuditLogCommand;
import vn.cas.operation.mapper.ServiceBookingMapper;
import vn.cas.operation.model.ServiceBookingRecord;
import vn.cas.operation.model.ServiceBookingView;
import vn.cas.store.dto.CreateClientAccountCommand;

@Service
public class ServiceBookingService {
    private final ServiceBookingMapper bookings;
    private final AuditLogService auditLogs;

    public ServiceBookingService(ServiceBookingMapper bookings, AuditLogService auditLogs) {
        this.bookings = bookings;
        this.auditLogs = auditLogs;
    }

    @Transactional(readOnly = true)
    public List<ServiceBookingView> findAll(OperationalPrincipal principal) {
        return bookings.findAllByStoreId(principal.storeId());
    }

    @Transactional
    public ServiceBookingView create(OperationalPrincipal principal, String clientName,
            String clientPhone, String serviceName, String note, BigDecimal agreedPrice,
            String paymentStatus) {
        long clientAccountId = findOrCreateClient(principal.storeId(), clientName, clientPhone);
        String publicId = UUID.randomUUID().toString();
        if (bookings.insert(publicId, principal.storeId(), clientAccountId, serviceName, note,
                agreedPrice, paymentStatus, principal.accountId(), principal.displayName()) != 1)
            throw new ApiException(HttpStatus.CONFLICT, "Không thể tạo dịch vụ đặt trước.");
        ServiceBookingView booking = requireBooking(principal.storeId(), publicId);
        audit(principal, "SERVICE_BOOKING_CREATED", booking.id(), publicId,
                "Tạo dịch vụ đặt trước.");
        return booking;
    }

    @Transactional
    public ServiceBookingView confirm(OperationalPrincipal principal, String publicId) {
        ServiceBookingRecord booking = requireRecord(principal.storeId(), publicId);
        if ("PAID".equals(booking.paymentStatus()))
            return requireBooking(principal.storeId(), publicId);
        if (!"PENDING".equals(booking.paymentStatus()) || bookings.confirm(booking.id(),
                principal.accountId(), principal.displayName()) != 1)
            throw new ApiException(HttpStatus.CONFLICT,
                    "Dịch vụ không ở trạng thái chờ xác nhận thanh toán.");
        audit(principal, "SERVICE_BOOKING_PAYMENT_CONFIRMED", booking.id(), publicId,
                "Xác nhận thanh toán dịch vụ.");
        return requireBooking(principal.storeId(), publicId);
    }

    @Transactional
    public ServiceBookingView update(OperationalPrincipal principal, String publicId,
            String clientName, String serviceName, String note, BigDecimal agreedPrice) {
        ServiceBookingRecord booking = requireRecord(principal.storeId(), publicId);
        if (!"PAY_LATER".equals(booking.paymentStatus())
                && !"PENDING".equals(booking.paymentStatus()))
            throw new ApiException(HttpStatus.CONFLICT, "Dịch vụ không thể cập nhật.");
        bookings.updateClientAccountName(booking.clientAccountId(), clientName);
        if (bookings.update(booking.id(), serviceName, note, agreedPrice) != 1)
            throw new ApiException(HttpStatus.CONFLICT, "Không thể cập nhật dịch vụ.");
        audit(principal, "SERVICE_BOOKING_UPDATED", booking.id(), publicId,
                "Cập nhật dịch vụ đặt trước.");
        return requireBooking(principal.storeId(), publicId);
    }

    @Transactional
    public ServiceBookingView cancel(OperationalPrincipal principal, String publicId) {
        ServiceBookingRecord booking = requireRecord(principal.storeId(), publicId);
        if (!"PAY_LATER".equals(booking.paymentStatus())
                && !"PENDING".equals(booking.paymentStatus()))
            throw new ApiException(HttpStatus.CONFLICT, "Dịch vụ không thể hủy.");
        if (bookings.cancel(booking.id()) != 1)
            throw new ApiException(HttpStatus.CONFLICT, "Không thể hủy dịch vụ.");
        audit(principal, "SERVICE_BOOKING_CANCELLED", booking.id(), publicId,
                "Hủy dịch vụ đặt trước.");
        return requireBooking(principal.storeId(), publicId);
    }

    private long findOrCreateClient(long storeId, String clientName, String clientPhone) {
        Long existingId = bookings.findClientAccountIdByStoreIdAndPhone(storeId, clientPhone);
        if (existingId != null) {
            bookings.updateClientAccountName(existingId, clientName);
            return existingId;
        }
        CreateClientAccountCommand command = new CreateClientAccountCommand(storeId, clientName,
                clientPhone);
        if (bookings.insertClientAccount(command) != 1)
            throw new ApiException(HttpStatus.CONFLICT, "Không thể tạo tài khoản khách.");
        return command.getId();
    }

    private ServiceBookingRecord requireRecord(long storeId, String publicId) {
        ServiceBookingRecord booking = bookings.findRecordByPublicIdForUpdate(storeId, publicId);
        if (booking == null)
            throw new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy dịch vụ đặt trước.");
        return booking;
    }

    private ServiceBookingView requireBooking(long storeId, String publicId) {
        ServiceBookingView booking = bookings.findByPublicId(storeId, publicId);
        if (booking == null)
            throw new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy dịch vụ đặt trước.");
        return booking;
    }

    private void audit(OperationalPrincipal principal, String action, long bookingId,
            String publicId, String description) {
        auditLogs.record(new AuditLogCommand(principal.storeId(), UUID.randomUUID(), action,
                "SERVICE_BOOKING", bookingId, publicId, "{}", principal.accountId(),
                principal.displayName(), description));
    }
}
