package vn.cas.store.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import vn.cas.common.constants.ApiPaths;
import vn.cas.common.response.ApiResponse;
import vn.cas.common.response.ApiResponses;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.common.web.RequestId;
import vn.cas.store.model.PublicStoreWelcomeConfig;
import vn.cas.store.model.StoreWelcomeConfig;
import vn.cas.store.service.StoreWelcomeConfigService;

@RestController
public class StoreWelcomeConfigController {
    private final StoreWelcomeConfigService service;

    public StoreWelcomeConfigController(StoreWelcomeConfigService service) {
        this.service = service;
    }

    @GetMapping(ApiPaths.Store.WELCOME)
    public ResponseEntity<ApiResponse<StoreWelcomeConfig>> get(
            @AuthenticationPrincipal OperationalPrincipal principal, HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, "Đã lấy cấu hình Welcome.",
                service.get(principal.storeId()), request);
    }

    @PutMapping(ApiPaths.Store.WELCOME)
    public ResponseEntity<ApiResponse<StoreWelcomeConfig>> save(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @Valid @RequestBody SaveStoreWelcomeConfigRequest body, HttpServletRequest request) {
        var config = service.save(principal, body.toModel(principal),
                (UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME));
        return ApiResponses.success(HttpStatus.OK, "Đã lưu cấu hình Welcome.", config, request);
    }

    @DeleteMapping(ApiPaths.Store.WELCOME)
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal OperationalPrincipal principal, HttpServletRequest request) {
        service.delete(principal, (UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME));
        return ApiResponses.success(HttpStatus.OK, "Đã xóa cấu hình Welcome.", null, request);
    }

    @GetMapping(ApiPaths.PublicStore.WELCOME)
    public ResponseEntity<ApiResponse<PublicStoreWelcomeConfig>> getPublic(
            @PathVariable long storeId, HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, "Đã lấy cấu hình Welcome.",
                service.getPublic(storeId), request);
    }

    public record SaveStoreWelcomeConfigRequest(@Size(max = 2048) String heroPrimaryImageUrl,
            @Size(max = 512) String heroPrimaryImageStorageKey,
            @Size(max = 2048) String heroSecondaryImageUrl,
            @Size(max = 512) String heroSecondaryImageStorageKey,
            @Size(max = 2048) String menuPreview1ImageUrl,
            @Size(max = 512) String menuPreview1ImageStorageKey,
            @Size(max = 2048) String menuPreview2ImageUrl,
            @Size(max = 512) String menuPreview2ImageStorageKey,
            @Size(max = 2048) String menuPreview3ImageUrl,
            @Size(max = 512) String menuPreview3ImageStorageKey,
            @Size(max = 2048) String menuPreview4ImageUrl,
            @Size(max = 512) String menuPreview4ImageStorageKey,
            @Size(max = 2048) String menuPreview5ImageUrl,
            @Size(max = 512) String menuPreview5ImageStorageKey,
            @Size(max = 2048) String bannerImageUrl, @Size(max = 512) String bannerImageStorageKey,
            @NotNull @Pattern(regexp = "ACTIVE|INACTIVE") String status) {
        StoreWelcomeConfig toModel(OperationalPrincipal principal) {
            return new StoreWelcomeConfig(0L, principal.storeId(), heroPrimaryImageUrl,
                    heroPrimaryImageStorageKey, heroSecondaryImageUrl, heroSecondaryImageStorageKey,
                    menuPreview1ImageUrl, menuPreview1ImageStorageKey, menuPreview2ImageUrl,
                    menuPreview2ImageStorageKey, menuPreview3ImageUrl, menuPreview3ImageStorageKey,
                    menuPreview4ImageUrl, menuPreview4ImageStorageKey, menuPreview5ImageUrl,
                    menuPreview5ImageStorageKey, bannerImageUrl, bannerImageStorageKey, status,
                    principal.accountId(), principal.accountId());
        }
    }
}
