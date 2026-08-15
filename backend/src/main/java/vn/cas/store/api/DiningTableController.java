package vn.cas.store.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Positive;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
import vn.cas.store.application.DiningTableService;

@RestController
@RequestMapping(ApiPaths.Table.TABLE_COMMON)
public class DiningTableController {

    private final DiningTableService diningTableService;

    public DiningTableController(DiningTableService diningTableService) {
        this.diningTableService = diningTableService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DiningTableResponse>> create(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @Valid @RequestBody CreateDiningTableRequest createRequest,
            HttpServletRequest request) {
        var diningTable = diningTableService.create(
                principal,
                createRequest.code(),
                createRequest.capacity(),
                (java.util.UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME));
        return ApiResponses.success(
                HttpStatus.CREATED,
                ApiMessages.DINING_TABLE_CREATED,
                new DiningTableResponse(
                        diningTable.id(),
                        diningTable.code(),
                        diningTable.capacity(),
                        diningTable.activeQrToken()),
                request);
    }

    public record CreateDiningTableRequest(
            @Positive @Max(4_294_967_295L) long code,
            @Positive @Max(65_535) Integer capacity) {
    }

    public record DiningTableResponse(long id, long code, Integer capacity, String activeQrToken) {
    }
}
