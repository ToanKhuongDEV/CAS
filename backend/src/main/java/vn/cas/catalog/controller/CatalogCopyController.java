package vn.cas.catalog.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import vn.cas.catalog.service.CatalogCopyService;
import vn.cas.common.response.ApiResponse;
import vn.cas.common.response.ApiResponses;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.common.web.RequestId;

@RestController
public class CatalogCopyController {
    private final CatalogCopyService service;

    public CatalogCopyController(CatalogCopyService service) {
        this.service = service;
    }

    @PostMapping("/api/v1/admin/stores/{targetStoreId}/menu-copy")
    public ResponseEntity<ApiResponse<Void>> copy(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @Positive @PathVariable long targetStoreId, @Valid @RequestBody CopyMenuRequest body,
            HttpServletRequest request) {
        service.copy(principal, body.sourceStoreId(), targetStoreId,
                (UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME));
        return ApiResponses.success(HttpStatus.OK, "Đã sao chép thực đơn.", null, request);
    }

    public record CopyMenuRequest(@Positive long sourceStoreId) {
    }
}
