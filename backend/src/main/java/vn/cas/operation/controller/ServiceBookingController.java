package vn.cas.operation.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.constants.ApiPaths;
import vn.cas.common.response.ApiResponse;
import vn.cas.common.response.ApiResponses;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.model.ServiceBookingView;
import vn.cas.operation.service.ServiceBookingService;

@RestController
@RequestMapping(ApiPaths.ServiceBooking.OPERATOR)
public class ServiceBookingController {
    private final ServiceBookingService bookings;

    public ServiceBookingController(ServiceBookingService bookings) {
        this.bookings = bookings;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceBookingView>>> findAll(
            @AuthenticationPrincipal OperationalPrincipal principal, HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, ApiMessages.SERVICE_BOOKINGS_RETRIEVED,
                bookings.findAll(principal), request);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ServiceBookingView>> create(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @Valid @RequestBody CreateServiceBookingRequest body, HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.CREATED, ApiMessages.SERVICE_BOOKING_CREATED,
                bookings.create(principal, body.clientName().trim(), body.clientPhone().trim(),
                        body.serviceName().trim(), normalize(body.note()), body.agreedPrice(),
                        body.paymentStatus()),
                request);
    }

    @PutMapping("/{serviceBookingId}")
    public ResponseEntity<ApiResponse<ServiceBookingView>> update(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @PathVariable String serviceBookingId,
            @Valid @RequestBody UpdateServiceBookingRequest body, HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, ApiMessages.SERVICE_BOOKING_UPDATED,
                bookings.update(principal, serviceBookingId, body.clientName().trim(),
                        body.serviceName().trim(), normalize(body.note()), body.agreedPrice()),
                request);
    }

    @PostMapping("/{serviceBookingId}/confirm")
    public ResponseEntity<ApiResponse<ServiceBookingView>> confirm(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @PathVariable String serviceBookingId, HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, ApiMessages.SERVICE_BOOKING_PAYMENT_CONFIRMED,
                bookings.confirm(principal, serviceBookingId), request);
    }

    @PostMapping("/{serviceBookingId}/cancel")
    public ResponseEntity<ApiResponse<ServiceBookingView>> cancel(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @PathVariable String serviceBookingId, HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, ApiMessages.SERVICE_BOOKING_CANCELLED,
                bookings.cancel(principal, serviceBookingId), request);
    }

    private static String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    public record CreateServiceBookingRequest(@NotBlank @Size(max = 150) String clientName,
            @NotBlank @Pattern(regexp = "[0-9]{1,20}") String clientPhone,
            @NotBlank @Size(max = 255) String serviceName, @Size(max = 65535) String note,
            @NotNull @DecimalMin("0.00") @DecimalMax("9999999999999.99") @Digits(integer = 13, fraction = 2) BigDecimal agreedPrice,
            @NotBlank @Pattern(regexp = "PAY_LATER|PENDING") String paymentStatus) {
    }

    public record UpdateServiceBookingRequest(@NotBlank @Size(max = 150) String clientName,
            @NotBlank @Size(max = 255) String serviceName, @Size(max = 65535) String note,
            @NotNull @DecimalMin("0.00") @DecimalMax("9999999999999.99") @Digits(integer = 13, fraction = 2) BigDecimal agreedPrice) {
    }
}
