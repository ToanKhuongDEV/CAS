package vn.cas.operation.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
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
import vn.cas.operation.application.EmployeeManagementService;

@RestController
@RequestMapping(ApiPaths.Employee.EMPLOYEE_COMMON)
public class EmployeeManagementController {
    private final EmployeeManagementService employeeService;
    public EmployeeManagementController(EmployeeManagementService employeeService) { this.employeeService = employeeService; }
    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeResponse>> create(@AuthenticationPrincipal OperationalPrincipal principal,
            @Valid @RequestBody CreateEmployeeRequest body, HttpServletRequest request) {
        var employee = employeeService.create(principal, body.firebaseUid(), body.displayName(), (java.util.UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME));
        return ApiResponses.success(HttpStatus.CREATED, ApiMessages.EMPLOYEE_CREATED,
                new EmployeeResponse(employee.id(), employee.firebaseUid(), employee.displayName(), employee.status()), request);
    }
    @DeleteMapping("/{employeeId}")
    public ResponseEntity<ApiResponse<Void>> delete(@AuthenticationPrincipal OperationalPrincipal principal, @PathVariable long employeeId, HttpServletRequest request) {
        employeeService.deactivate(principal, employeeId, (java.util.UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME));
        return ApiResponses.success(HttpStatus.OK, ApiMessages.EMPLOYEE_DEACTIVATED, null, request);
    }
    public record CreateEmployeeRequest(@NotBlank @Size(max = 128) String firebaseUid, @NotBlank @Size(max = 150) String displayName) { }
    public record EmployeeResponse(long id, String firebaseUid, String displayName, String status) { }
}
