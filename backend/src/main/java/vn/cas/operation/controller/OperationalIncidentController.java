package vn.cas.operation.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.constants.ApiPaths;
import vn.cas.common.response.ApiResponse;
import vn.cas.common.response.ApiResponses;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.common.web.RequestId;
import vn.cas.operation.model.OperationalIncident;
import vn.cas.operation.service.OperationalIncidentService;

@RestController
public class OperationalIncidentController {
    private final OperationalIncidentService incidents;

    public OperationalIncidentController(OperationalIncidentService incidents) {
        this.incidents = incidents;
    }

    @PostMapping(ApiPaths.OperationalIncident.OPERATOR)
    public ResponseEntity<ApiResponse<OperationalIncident>> create(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @Valid @RequestBody CreateOperationalIncidentRequest body, HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.CREATED, ApiMessages.OPERATIONAL_INCIDENT_CREATED,
                incidents.create(principal, body.reporterName().trim(), body.description().trim(),
                        (UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME)),
                request);
    }

    @GetMapping(ApiPaths.OperationalIncident.ADMIN)
    public ResponseEntity<ApiResponse<List<OperationalIncident>>> findAllForAdmin(
            @AuthenticationPrincipal OperationalPrincipal principal, HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, ApiMessages.OPERATIONAL_INCIDENTS_RETRIEVED,
                incidents.findAllForAdmin(principal), request);
    }

    public record CreateOperationalIncidentRequest(@NotBlank @Size(max = 150) String reporterName,
            @NotBlank @Size(max = 65535) String description) {
    }
}
