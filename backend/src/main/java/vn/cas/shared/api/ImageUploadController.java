package vn.cas.shared.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import vn.cas.catalog.service.CloudinarySignatureService;
import vn.cas.catalog.service.CloudinarySignatureService.UploadPurpose;
import vn.cas.common.constants.ApiPaths;
import vn.cas.common.response.ApiResponse;
import vn.cas.common.response.ApiResponses;
import vn.cas.common.security.OperationalPrincipal;

@RestController
public class ImageUploadController {
    private final CloudinarySignatureService cloudinary;

    public ImageUploadController(CloudinarySignatureService cloudinary) {
        this.cloudinary = cloudinary;
    }

    @PostMapping(ApiPaths.Images.UPLOAD_SIGNATURE)
    public ResponseEntity<ApiResponse<CloudinarySignatureService.UploadSignature>> sign(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @Valid @RequestBody UploadSignatureRequest request, HttpServletRequest servletRequest) {
        return ApiResponses.success(HttpStatus.OK, "Đã cấp chữ ký tải ảnh.",
                cloudinary.sign(principal.storeId(), request.purpose()), servletRequest);
    }

    public record UploadSignatureRequest(@NotNull UploadPurpose purpose) {
    }
}
