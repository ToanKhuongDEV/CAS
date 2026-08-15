package vn.cas.operation.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.cas.common.contract.ApiMessages;
import vn.cas.common.contract.ApiPaths;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.common.web.ApiResponse;
import vn.cas.common.web.ApiResponses;
import vn.cas.common.web.RequestId;
import vn.cas.operation.application.OperatorManagementService;

@RestController
@RequestMapping(ApiPaths.Operator.OPERATOR_COMMON)
public class OperatorManagementController {
    private final OperatorManagementService operatorService;

    public OperatorManagementController(OperatorManagementService operatorService) {
        this.operatorService = operatorService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OperatorResponse>> create(@AuthenticationPrincipal OperationalPrincipal principal,
            @Valid @RequestBody CreateOperatorRequest body, HttpServletRequest request) {
        var operator = operatorService.create(
                principal,
                body.email(),
                body.initialPassword(),
                body.displayName(),
                (java.util.UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME));
        return ApiResponses.success(HttpStatus.CREATED, ApiMessages.OPERATOR_CREATED,
                new OperatorResponse(operator.id(), operator.firebaseUid(), operator.displayName(), operator.status()), request);
    }

    @DeleteMapping("/{operatorId}")
    public ResponseEntity<ApiResponse<Void>> delete(@AuthenticationPrincipal OperationalPrincipal principal, @PathVariable long operatorId, HttpServletRequest request) {
        operatorService.deactivate(principal, operatorId, (java.util.UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME));
        return ApiResponses.success(HttpStatus.OK, ApiMessages.OPERATOR_DEACTIVATED, null, request);
    }

    public record CreateOperatorRequest(
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(min = 6, max = 128) String initialPassword,
            @NotBlank @Size(max = 150) String displayName) { }

    public record OperatorResponse(long id, String firebaseUid, String displayName, String status) { }
}
