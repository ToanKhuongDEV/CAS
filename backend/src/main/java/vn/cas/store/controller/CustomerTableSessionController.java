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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import vn.cas.common.constants.ApiMessages;
import vn.cas.common.constants.ApiPaths;
import vn.cas.common.response.ApiResponse;
import vn.cas.common.response.ApiResponses;
import vn.cas.store.dto.CustomerTableSessionResolutionCommand;
import vn.cas.store.model.CustomerTableSessionResolution;
import vn.cas.store.service.CustomerTableSessionService;

@RestController
@RequestMapping(ApiPaths.CustomerTableSession.RESOLVE_QR)
public class CustomerTableSessionController {

    static final String CUSTOMER_SESSION_COOKIE = "cas_customer_session";

    private final CustomerTableSessionService customerTableSessionService;

    public CustomerTableSessionController(CustomerTableSessionService customerTableSessionService) {
        this.customerTableSessionService = customerTableSessionService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerTableSessionResponse>> resolveQr(
            @Valid @RequestBody ResolveQrRequest resolveQrRequest,
            HttpServletRequest request,
            HttpServletResponse response) {
        var resolution = customerTableSessionService.resolveQr(new CustomerTableSessionResolutionCommand(
                resolveQrRequest.qrToken(),
                normalize(resolveQrRequest.customerName()),
                normalize(resolveQrRequest.customerPhone())));
        if (resolution.sessionPublicId() != null) {
            response.addHeader(HttpHeaders.SET_COOKIE, customerSessionCookie(resolution.sessionPublicId(), request.isSecure()).toString());
        }
        return ApiResponses.success(
                HttpStatus.OK,
                ApiMessages.CUSTOMER_TABLE_SESSION_RESOLVED,
                CustomerTableSessionResponse.from(resolution),
                request);
    }

    private static String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static ResponseCookie customerSessionCookie(String sessionPublicId, boolean secure) {
        return ResponseCookie.from(CUSTOMER_SESSION_COOKIE, sessionPublicId)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path(ApiPaths.API_CUSTOMER_PREFIX)
                .build();
    }

    public record ResolveQrRequest(
            @NotBlank @Size(max = 64) String qrToken,
            @Size(max = 150) String customerName,
            @Size(max = 20) String customerPhone) {
    }

    public record CustomerTableSessionResponse(
            boolean customerInformationRequired,
            String sessionStatus,
            Long tableCode) {

        static CustomerTableSessionResponse from(CustomerTableSessionResolution resolution) {
            return new CustomerTableSessionResponse(
                    resolution.requiresCustomerInformation(),
                    resolution.status().name(),
                    resolution.tableCode());
        }
    }
}
