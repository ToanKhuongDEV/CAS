package vn.cas.store.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import vn.cas.common.constants.ApiPaths;
import vn.cas.common.response.ApiResponse;
import vn.cas.common.response.ApiResponses;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.common.web.RequestId;
import vn.cas.store.model.BrandSettings;
import vn.cas.store.service.BrandSettingsService;

@RestController
public class BrandSettingsController {
    private final BrandSettingsService service;

    public BrandSettingsController(BrandSettingsService service) {
        this.service = service;
    }

    @GetMapping(ApiPaths.Brand.SETTINGS)
    public ResponseEntity<ApiResponse<BrandSettings>> get(
            @AuthenticationPrincipal OperationalPrincipal principal, HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, "Đã lấy cấu hình thương hiệu.",
                service.get(principal), request);
    }

    @PutMapping(ApiPaths.Brand.SETTINGS)
    public ResponseEntity<ApiResponse<BrandSettings>> update(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @Valid @RequestBody UpdateBrandSettingsRequest body, HttpServletRequest request) {
        var settings = new BrandSettings(body.name(), body.logoUrl(), body.logoStorageKey(),
                body.welcomeSlogan());
        return ApiResponses
                .success(
                        HttpStatus.OK, "Đã cập nhật thương hiệu chung.", service.update(principal,
                                settings, (UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME)),
                        request);
    }

    public record UpdateBrandSettingsRequest(@NotBlank @Size(max = 150) String name,
            @Size(max = 2048) String logoUrl, @Size(max = 512) String logoStorageKey,
            @Size(max = 500) String welcomeSlogan) {
    }
}
