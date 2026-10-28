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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.constants.ApiPaths;
import vn.cas.common.response.ApiResponse;
import vn.cas.common.response.ApiResponses;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.common.web.RequestId;
import vn.cas.operation.service.AdminAccountService;
import vn.cas.operation.mapper.AdminAccountView;

@RestController
@RequestMapping(ApiPaths.AdminAccount.ADMIN_COMMON)
public class AdminAccountController {
    private final AdminAccountService adminAccountService;

    public AdminAccountController(AdminAccountService adminAccountService) {
        this.adminAccountService = adminAccountService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminResponse>> create(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @Valid @RequestBody CreateAdminRequest body, HttpServletRequest request) {
        var admin = adminAccountService.create(principal, body.email(), body.phone(),
                body.displayName(),
                (java.util.UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME));
        return ApiResponses.success(HttpStatus.CREATED, ApiMessages.ADMIN_CREATED,
                new AdminResponse(admin.id(), admin.firebaseUid(), admin.displayName()), request);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<java.util.List<AdminAccountView>>> findAll(
            @AuthenticationPrincipal OperationalPrincipal principal, HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, "Đã lấy danh sách tài khoản quản trị viên.",
                adminAccountService.findAll(principal), request);
    }

    @DeleteMapping("/{adminId}")
    public ResponseEntity<ApiResponse<Void>> deactivate(
            @AuthenticationPrincipal OperationalPrincipal principal, @PathVariable long adminId,
            HttpServletRequest request) {
        adminAccountService.deactivate(principal, adminId,
                (java.util.UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME));
        return ApiResponses.success(HttpStatus.OK, "Đã khóa tài khoản quản trị viên.", null,
                request);
    }

    @PostMapping("/{adminId}/activate")
    public ResponseEntity<ApiResponse<Void>> activate(
            @AuthenticationPrincipal OperationalPrincipal principal, @PathVariable long adminId,
            HttpServletRequest request) {
        adminAccountService.activate(principal, adminId,
                (java.util.UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME));
        return ApiResponses.success(HttpStatus.OK, "Đã kích hoạt tài khoản quản trị viên.", null,
                request);
    }

    public record CreateAdminRequest(@NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(max = 20) String phone, @NotBlank @Size(max = 150) String displayName) {
    }

    public record AdminResponse(long id, String firebaseUid, String displayName) {
    }
}
