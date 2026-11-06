package vn.cas.store.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.constants.ApiPaths;
import vn.cas.common.response.ApiResponse;
import vn.cas.common.response.ApiResponses;
import vn.cas.store.dto.SalesSessionResolutionCommand;
import vn.cas.store.model.SalesSessionResolution;
import vn.cas.store.service.SalesSessionService;
import vn.cas.store.service.StoreSettingsService;

@RestController
@RequestMapping(ApiPaths.CustomerSalesSession.COMMON)
public class CustomerSalesSessionController {

    public static final String CUSTOMER_SESSION_COOKIE = "cas_customer_session";

    private final SalesSessionService customerSalesSessionService;
    private final StoreSettingsService storeSettingsService;

    public CustomerSalesSessionController(SalesSessionService customerSalesSessionService,
            StoreSettingsService storeSettingsService) {
        this.customerSalesSessionService = customerSalesSessionService;
        this.storeSettingsService = storeSettingsService;
    }

    @PostMapping("/resolve-qr")
    public ResponseEntity<ApiResponse<CustomerSalesSessionResponse>> resolveQr(
            @Valid @RequestBody ResolveQrRequest resolveQrRequest, HttpServletRequest request,
            HttpServletResponse response) {
        var resolution = customerSalesSessionService.resolveQr(new SalesSessionResolutionCommand(
                resolveQrRequest.qrToken(), normalize(resolveQrRequest.customerName()),
                normalize(resolveQrRequest.customerPhone()), resolveQrRequest.sessionType(),
                normalize(resolveQrRequest.joinSessionId()), resolveQrRequest.storeId()));
        if (resolution.sessionPublicId() != null) {
            response.addHeader(HttpHeaders.SET_COOKIE,
                    customerSessionCookie(resolution.sessionPublicId(), request.isSecure())
                            .toString());
        }
        return ApiResponses.success(HttpStatus.OK, ApiMessages.CUSTOMER_SALES_SESSION_RESOLVED,
                CustomerSalesSessionResponse.from(resolution), request);
    }

    @PostMapping("/resolve-table")
    public ResponseEntity<ApiResponse<CustomerSalesSessionResponse>> resolveTable(
            @Valid @RequestBody ResolveTableRequest resolveTableRequest, HttpServletRequest request,
            HttpServletResponse response) {
        var resolution = customerSalesSessionService.resolveTable(resolveTableRequest.storeId(),
                resolveTableRequest.tableCode(),
                new SalesSessionResolutionCommand(null,
                        normalize(resolveTableRequest.customerName()),
                        normalize(resolveTableRequest.customerPhone()), "DINE_IN",
                        normalize(resolveTableRequest.joinSessionId()),
                        resolveTableRequest.storeId()));
        if (resolution.sessionPublicId() != null) {
            response.addHeader(HttpHeaders.SET_COOKIE,
                    customerSessionCookie(resolution.sessionPublicId(), request.isSecure())
                            .toString());
        }
        return ApiResponses.success(HttpStatus.OK, ApiMessages.CUSTOMER_SALES_SESSION_RESOLVED,
                CustomerSalesSessionResponse.from(resolution), request);
    }

    @PostMapping("/takeaway")
    public ResponseEntity<ApiResponse<CustomerSalesSessionResponse>> openTakeaway(
            @Valid @RequestBody OpenTakeawayRequest body, HttpServletRequest request,
            HttpServletResponse response) {
        storeSettingsService.getPublic(body.storeId());
        var session = customerSalesSessionService.openTakeawayForOperator(body.storeId(),
                normalize(body.customerName()), normalize(body.customerPhone()));
        response.addHeader(HttpHeaders.SET_COOKIE,
                customerSessionCookie(session.sessionPublicId(), request.isSecure()).toString());
        return ApiResponses.success(HttpStatus.CREATED, ApiMessages.CUSTOMER_SALES_SESSION_RESOLVED,
                new CustomerSalesSessionResponse(false, false, session.sessionStatus(), null,
                        List.of()),
                request);
    }

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<CustomerSalesSessionResponse>> getCurrent(
            @CookieValue(name = CUSTOMER_SESSION_COOKIE, required = false) String sessionPublicId,
            HttpServletRequest request) {
        var resolution = customerSalesSessionService.getCurrent(sessionPublicId);
        return ApiResponses.success(HttpStatus.OK, ApiMessages.CUSTOMER_SALES_SESSION_RESOLVED,
                CustomerSalesSessionResponse.from(resolution), request);
    }

    @DeleteMapping("/current")
    public ResponseEntity<ApiResponse<Void>> cancelCurrent(
            @CookieValue(name = CUSTOMER_SESSION_COOKIE, required = false) String sessionPublicId,
            HttpServletRequest request) {
        customerSalesSessionService.cancelCurrent(sessionPublicId);
        return ApiResponses.success(HttpStatus.OK, ApiMessages.CUSTOMER_SALES_SESSION_CANCELLED,
                null, request);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = CUSTOMER_SESSION_COOKIE, required = false) String sessionPublicId,
            HttpServletRequest request, HttpServletResponse response) {
        customerSalesSessionService.logout(sessionPublicId);
        response.addHeader(HttpHeaders.SET_COOKIE,
                ResponseCookie.from(CUSTOMER_SESSION_COOKIE, "").httpOnly(true)
                        .secure(request.isSecure()).sameSite("Lax")
                        .path(ApiPaths.API_CUSTOMER_PREFIX).maxAge(0).build().toString());
        return ApiResponses.success(HttpStatus.OK, "Đã thoát phiên khách.", null, request);
    }

    private static String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static ResponseCookie customerSessionCookie(String sessionPublicId, boolean secure) {
        return ResponseCookie.from(CUSTOMER_SESSION_COOKIE, sessionPublicId).httpOnly(true)
                .secure(secure).sameSite("Lax").path(ApiPaths.API_CUSTOMER_PREFIX).build();
    }

    public record ResolveQrRequest(@NotBlank @Size(max = 64) String qrToken,
            @Size(max = 150) String customerName, @Size(max = 20) String customerPhone,
            @Pattern(regexp = "DINE_IN|TAKEAWAY") String sessionType,
            @Size(max = 36) String joinSessionId, @Positive Long storeId) {
    }

    public record ResolveTableRequest(@Positive long storeId, @Positive long tableCode,
            @Size(max = 150) String customerName, @Size(max = 20) String customerPhone,
            @Size(max = 36) String joinSessionId) {
    }

    public record OpenTakeawayRequest(@Positive long storeId,
            @NotBlank @Size(max = 150) String customerName,
            @NotBlank @Size(max = 20) String customerPhone) {
    }

    public record CustomerSalesSessionResponse(boolean customerInformationRequired,
            boolean joinSessionRequired, String sessionStatus, Long tableCode,
            List<JoinableSalesSessionResponse> joinableSessions) {

        static CustomerSalesSessionResponse from(SalesSessionResolution resolution) {
            return new CustomerSalesSessionResponse(resolution.requiresCustomerInformation(),
                    resolution.requiresSessionSelection(), resolution.status().name(),
                    resolution.tableCode(),
                    resolution.joinableSessions().stream()
                            .map(session -> new JoinableSalesSessionResponse(
                                    session.sessionPublicId(), session.customerName(),
                                    session.sessionStatus()))
                            .toList());
        }
    }

    public record JoinableSalesSessionResponse(String sessionId, String customerName,
            String sessionStatus) {
    }
}
