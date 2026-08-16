package vn.cas.operation.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.constants.ApiPaths;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.common.response.ApiResponse;
import vn.cas.common.response.ApiResponses;
import vn.cas.common.web.RequestId;
import vn.cas.operation.service.AdminAccountService;

@RestController
@RequestMapping(ApiPaths.AdminAccount.ADMIN_COMMON)
public class AdminAccountController {
    private final AdminAccountService adminAccountService;
    public AdminAccountController(AdminAccountService adminAccountService) { this.adminAccountService = adminAccountService; }
    @PostMapping
    public ResponseEntity<ApiResponse<AdminResponse>> create(@AuthenticationPrincipal OperationalPrincipal principal,
            @Valid @RequestBody CreateAdminRequest body, HttpServletRequest request) {
        var admin = adminAccountService.create(
                principal,
                body.firebaseUid(),
                body.email(),
                body.phone(),
                body.displayName(),
                (java.util.UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME));
        return ApiResponses.success(HttpStatus.CREATED, ApiMessages.ADMIN_CREATED, new AdminResponse(admin.id(), admin.firebaseUid(), admin.displayName()), request);
    }
    public record CreateAdminRequest(
            @NotBlank @Size(max = 128) String firebaseUid,
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(max = 20) String phone,
            @NotBlank @Size(max = 150) String displayName) { }
    public record AdminResponse(long id, String firebaseUid, String displayName) { }
}
