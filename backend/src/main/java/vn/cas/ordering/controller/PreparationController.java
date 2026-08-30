package vn.cas.ordering.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.constants.ApiPaths;
import vn.cas.common.response.ApiResponse;
import vn.cas.common.response.ApiResponses;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.common.web.RequestId;
import vn.cas.ordering.service.PreparationService;

@RestController
@RequestMapping(ApiPaths.Preparation.COMMON)
public class PreparationController {
    private final PreparationService preparations;

    public PreparationController(PreparationService preparations) {
        this.preparations = preparations;
    }

    @GetMapping("/long-wait-tables")
    public ResponseEntity<ApiResponse<List<PreparationService.LongWaitTable>>> longWaitTables(
            @AuthenticationPrincipal OperationalPrincipal principal, HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK,
                ApiMessages.PREPARATION_LONG_WAIT_TABLES_RETRIEVED,
                preparations.longWaitTables(principal), request);
    }

    @GetMapping("/groups")
    public ResponseEntity<ApiResponse<List<PreparationService.PreparationGroup>>> groups(
            @AuthenticationPrincipal OperationalPrincipal principal, HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, ApiMessages.PREPARATION_GROUPS_RETRIEVED,
                preparations.groups(principal), request);
    }

    @PostMapping("/groups/{groupKey}/completions")
    public ResponseEntity<ApiResponse<PreparationService.BatchCompletion>> complete(
            @AuthenticationPrincipal OperationalPrincipal principal, @PathVariable String groupKey,
            @Valid @RequestBody CompleteBatchRequest body, HttpServletRequest request) {
        var completion = preparations.complete(principal, groupKey, body.idempotencyKey(),
                body.quantity(), (UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME));
        return ApiResponses.success(HttpStatus.CREATED, ApiMessages.PREPARATION_BATCH_COMPLETED,
                completion, request);
    }

    public record CompleteBatchRequest(@NotBlank String idempotencyKey, @Positive int quantity) {
    }
}
