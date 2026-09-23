package vn.cas.store.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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

@RestController
@RequestMapping(ApiPaths.CustomerSalesSession.COMMON)
public class CustomerSalesSessionController {

    public static final String CUSTOMER_SESSION_COOKIE = "cas_customer_session";

    private final SalesSessionService customerSalesSessionService;

    public CustomerSalesSessionController(SalesSessionService customerSalesSessionService) {
        this.customerSalesSessionService = customerSalesSessionService;
    }

    @PostMapping("/resolve-qr")
    public ResponseEntity<ApiResponse<CustomerSalesSessionResponse>> resolveQr(
            @Valid @RequestBody ResolveQrRequest resolveQrRequest, HttpServletRequest request,
            HttpServletResponse response) {
        var resolution = customerSalesSessionService.resolveQr(new SalesSessionResolutionCommand(
                resolveQrRequest.qrToken(), normalize(resolveQrRequest.customerName()),
                normalize(resolveQrRequest.customerPhone())));
        if (resolution.sessionPublicId() != null) {
            response.addHeader(HttpHeaders.SET_COOKIE,
                    customerSessionCookie(resolution.sessionPublicId(), request.isSecure())
                            .toString());
        }
        return ApiResponses.success(HttpStatus.OK, ApiMessages.CUSTOMER_SALES_SESSION_RESOLVED,
                CustomerSalesSessionResponse.from(resolution), request);
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

    private static String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static ResponseCookie customerSessionCookie(String sessionPublicId, boolean secure) {
        return ResponseCookie.from(CUSTOMER_SESSION_COOKIE, sessionPublicId).httpOnly(true)
                .secure(secure).sameSite("Lax").path(ApiPaths.API_CUSTOMER_PREFIX).build();
    }

    public record ResolveQrRequest(@NotBlank @Size(max = 64) String qrToken,
            @Size(max = 150) String customerName, @Size(max = 20) String customerPhone) {
    }

    public record CustomerSalesSessionResponse(boolean customerInformationRequired,
            String sessionStatus, Long tableCode) {

        static CustomerSalesSessionResponse from(SalesSessionResolution resolution) {
            return new CustomerSalesSessionResponse(resolution.requiresCustomerInformation(),
                    resolution.status().name(), resolution.tableCode());
        }
    }
}
