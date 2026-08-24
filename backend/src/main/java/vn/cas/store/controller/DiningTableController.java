package vn.cas.store.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Positive;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
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
import vn.cas.store.service.DiningTableService;

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
        var diningTable = diningTableService.create(principal, createRequest.code(),
                createRequest.capacity(),
                (java.util.UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME));
        return ApiResponses
                .success(HttpStatus.CREATED, ApiMessages.DINING_TABLE_CREATED,
                        new DiningTableResponse(diningTable.id(), diningTable.code(),
                                diningTable.capacity(), diningTable.activeQrToken(), null),
                        request);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<java.util.List<DiningTableResponse>>> list(
            @AuthenticationPrincipal OperationalPrincipal principal, HttpServletRequest request) {
        var tables = diningTableService.list(principal).stream()
                .map(table -> new DiningTableResponse(table.id(), table.code(), table.capacity(),
                        table.activeQrToken(), table.sessionStatus()))
                .toList();
        return ApiResponses.success(HttpStatus.OK, ApiMessages.DINING_TABLES_RETRIEVED, tables,
                request);
    }

    @GetMapping("/{tableId}/qr")
    public ResponseEntity<ApiResponse<ActiveTableQrCodeResponse>> activeQrCode(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @Positive @PathVariable long tableId, HttpServletRequest request) {
        var qrCode = diningTableService.activeQrCode(principal, tableId);
        return ApiResponses.success(HttpStatus.OK, ApiMessages.ACTIVE_TABLE_QR_CODE_RETRIEVED,
                new ActiveTableQrCodeResponse(qrCode.tableId(), qrCode.tableCode(), qrCode.token()),
                request);
    }

    @DeleteMapping("/{tableId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @Positive @PathVariable long tableId, HttpServletRequest request) {
        diningTableService.delete(principal, tableId,
                (java.util.UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME));
        return ApiResponses.success(HttpStatus.OK, ApiMessages.DINING_TABLE_DELETED, null, request);
    }

    public record CreateDiningTableRequest(@Positive @Max(4_294_967_295L) long code,
            @Positive @Max(65_535) Integer capacity) {
    }

    public record DiningTableResponse(long id, long code, Integer capacity, String activeQrToken,
            String sessionStatus) {
    }

    public record ActiveTableQrCodeResponse(long tableId, long tableCode, String token) {
    }
}
