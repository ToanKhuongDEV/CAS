package vn.cas.store.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalTime;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.cas.catalog.service.CloudinarySignatureService;
import vn.cas.common.constants.ApiPaths;
import vn.cas.common.response.*;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.common.web.RequestId;
import vn.cas.store.model.StoreSettings;
import vn.cas.store.service.StoreSettingsService;

@RestController
public class StoreSettingsController {
    private final StoreSettingsService service;
    private final CloudinarySignatureService cloudinary;

    public StoreSettingsController(StoreSettingsService service, CloudinarySignatureService cloudinary) {
        this.service = service;
        this.cloudinary = cloudinary;
    }

    @GetMapping(ApiPaths.Store.SETTINGS)
    public ResponseEntity<ApiResponse<StoreSettings>> get(@AuthenticationPrincipal OperationalPrincipal p,
            HttpServletRequest r) {
        return ApiResponses.success(HttpStatus.OK, "Đã lấy thông tin cửa hàng.", service.get(p.storeId()), r);
    }

    @PutMapping(ApiPaths.Store.SETTINGS)
    public ResponseEntity<ApiResponse<StoreSettings>> update(@AuthenticationPrincipal OperationalPrincipal p,
            @Valid @RequestBody UpdateStoreSettingsRequest b, HttpServletRequest r) {
        var data = service.update(p, b.toModel(p.storeId()), (UUID) r.getAttribute(RequestId.ATTRIBUTE_NAME));
        return ApiResponses.success(HttpStatus.OK, "Đã cập nhật thông tin cửa hàng.", data, r);
    }

    @PostMapping(ApiPaths.Store.LOGO_UPLOAD_SIGNATURE)
    public ResponseEntity<ApiResponse<CloudinarySignatureService.UploadSignature>> sign(
            @AuthenticationPrincipal OperationalPrincipal p, HttpServletRequest r) {
        return ApiResponses.success(HttpStatus.OK, "Đã cấp chữ ký tải logo.", cloudinary.signStoreLogo(p.storeId()), r);
    }

    public record UpdateStoreSettingsRequest(@NotBlank @Size(max = 150) String name,
            @NotBlank @Size(max = 500) String address, @NotBlank @Size(max = 20) String phone,
            @NotBlank @Size(max = 254) String email, @Size(max = 2048) String logoUrl,
            @Size(max = 2048) String googleMapsLocation, LocalTime openTime, LocalTime closeTime,
            @Size(max = 500) String welcomeSlogan, @Pattern(regexp = "ACTIVE|INACTIVE") String status) {
        StoreSettings toModel(long id) { return new StoreSettings(id, name, address, phone, email, logoUrl,
                googleMapsLocation, openTime, closeTime, welcomeSlogan, status); }
    }
}
