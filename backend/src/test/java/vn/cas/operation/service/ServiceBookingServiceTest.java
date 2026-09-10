package vn.cas.operation.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.mapper.ServiceBookingMapper;
import vn.cas.operation.model.ServiceBookingRecord;
import vn.cas.operation.model.ServiceBookingView;

class ServiceBookingServiceTest {
    private final ServiceBookingMapper bookings = mock(ServiceBookingMapper.class);
    private final AuditLogService auditLogs = mock(AuditLogService.class);
    private final ServiceBookingService service = new ServiceBookingService(bookings, auditLogs);
    private final OperationalPrincipal operator = new OperationalPrincipal(2L, 3L, "uid",
            "Operator", "OPERATOR");

    @Test
    void shouldCreateBookingAndClientWhenPhoneIsNew() {
        when(bookings.findClientAccountIdByStoreIdAndPhone(3L, "0901234567")).thenReturn(null);
        when(bookings.insertClientAccount(any())).thenAnswer(invocation -> {
            ((vn.cas.store.dto.CreateClientAccountCommand) invocation.getArgument(0)).setId(8L);
            return 1;
        });
        when(bookings.insert(any(), anyLong(), anyLong(), any(), any(), any(), any(), anyLong(),
                any())).thenReturn(1);
        when(bookings.findByPublicId(anyLong(), any())).thenReturn(view("PAY_LATER"));

        ServiceBookingView result = service.create(operator, "Khach A", "0901234567", "Dat tiec",
                null, new BigDecimal("120000"), "PAY_LATER");

        assertThat(result.publicId()).isEqualTo("booking-1");
        verify(auditLogs).record(any());
    }

    @Test
    void shouldConfirmOnlyPendingBooking() {
        when(bookings.findRecordByPublicIdForUpdate(3L, "booking-1"))
                .thenReturn(new ServiceBookingRecord(9L, "booking-1", 8L, "PENDING"));
        when(bookings.confirm(9L, 2L, "Operator")).thenReturn(1);
        when(bookings.findByPublicId(3L, "booking-1")).thenReturn(view("PAID"));

        assertThat(service.confirm(operator, "booking-1").paymentStatus()).isEqualTo("PAID");
        verify(auditLogs).record(any());
    }

    @Test
    void shouldUpdatePendingBooking() {
        when(bookings.findRecordByPublicIdForUpdate(3L, "booking-1"))
                .thenReturn(new ServiceBookingRecord(9L, "booking-1", 8L, "PENDING"));
        when(bookings.update(9L, "Dat tiec moi", "Ghi chu", new BigDecimal("150000")))
                .thenReturn(1);
        when(bookings.findByPublicId(3L, "booking-1")).thenReturn(view("PENDING"));

        assertThat(service.update(operator, "booking-1", "Khach moi", "Dat tiec moi", "Ghi chu",
                new BigDecimal("150000")).paymentStatus()).isEqualTo("PENDING");
        verify(bookings).updateClientAccountName(8L, "Khach moi");
        verify(auditLogs).record(any());
    }

    @Test
    void shouldRejectCancellingPaidBooking() {
        when(bookings.findRecordByPublicIdForUpdate(3L, "booking-1"))
                .thenReturn(new ServiceBookingRecord(9L, "booking-1", 8L, "PAID"));

        assertThatThrownBy(() -> service.cancel(operator, "booking-1"))
                .isInstanceOf(ApiException.class)
                .extracting(error -> ((ApiException) error).status())
                .isEqualTo(HttpStatus.CONFLICT);
    }

    private static ServiceBookingView view(String status) {
        return new ServiceBookingView(9L, "booking-1", "Khach A", "0901234567", "Dat tiec", null,
                new BigDecimal("120000"), status, "Operator", null, null,
                LocalDateTime.of(2026, 9, 10, 10, 0));
    }
}
