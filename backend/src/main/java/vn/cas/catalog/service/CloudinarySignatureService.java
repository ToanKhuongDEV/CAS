package vn.cas.catalog.service;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.exception.ApiException;

@Service
public class CloudinarySignatureService {
    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;
    private final String preset;
    private final String rootFolder;

    public CloudinarySignatureService(@Value("${cas.cloudinary.cloud-name:}") String cloudName,
            @Value("${cas.cloudinary.api-key:}") String apiKey,
            @Value("${cas.cloudinary.api-secret:}") String apiSecret,
            @Value("${cas.cloudinary.upload-preset:}") String preset,
            @Value("${cas.cloudinary.root-folder:cas/menu}") String rootFolder) {
        this.cloudName = cloudName;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.preset = preset;
        this.rootFolder = rootFolder;
    }

    public UploadSignature sign(long storeId) {
        return sign(storeId, rootFolder);
    }

    public UploadSignature signStoreLogo(long storeId) {
        return sign(storeId, "cas/stores");
    }

    private UploadSignature sign(long storeId, String folderRoot) {
        if (cloudName.isBlank() || apiKey.isBlank() || apiSecret.isBlank() || preset.isBlank())
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    ApiMessages.CLOUDINARY_NOT_CONFIGURED);
        long timestamp = Instant.now().getEpochSecond();
        String folder = folderRoot + "/" + storeId;
        String publicId = storeId + "_" + UUID.randomUUID();
        String value = "folder=" + folder + "&public_id=" + publicId + "&timestamp=" + timestamp
                + "&upload_preset=" + preset + apiSecret;
        try {
            String signature = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-1")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
            return new UploadSignature(cloudName, apiKey, timestamp, folder, publicId, signature,
                    preset);
        } catch (Exception e) {
            throw new IllegalStateException("Cannot sign Cloudinary upload", e);
        }
    }

    public void validateAsset(long storeId, String imageUrl, String storageKey) {
        if (imageUrl == null && storageKey == null)
            return;
        if (imageUrl == null || storageKey == null || cloudName.isBlank())
            throw invalidImage();
        try {
            URI uri = URI.create(imageUrl);
            String path = uri.getPath();
            String fileName = path.substring(path.lastIndexOf('/') + 1);
            int extensionIndex = fileName.lastIndexOf('.');
            String publicIdFromUrl = extensionIndex < 0
                    ? fileName
                    : fileName.substring(0, extensionIndex);
            if (!"https".equals(uri.getScheme()) || !"res.cloudinary.com".equals(uri.getHost())
                    || !path.contains("/" + cloudName + "/image/upload/")
                    || !storageKey.startsWith(storeId + "_") || !storageKey.equals(publicIdFromUrl))
                throw invalidImage();
        } catch (IllegalArgumentException e) {
            throw invalidImage();
        }
    }

    private ApiException invalidImage() {
        return new ApiException(HttpStatus.BAD_REQUEST, ApiMessages.INVALID_CATALOG_IMAGE);
    }

    public record UploadSignature(String cloudName, String apiKey, long timestamp, String folder,
            String publicId, String signature, String uploadPreset) {
    }
}
