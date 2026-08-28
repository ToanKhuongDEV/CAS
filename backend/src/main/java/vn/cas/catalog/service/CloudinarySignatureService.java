package vn.cas.catalog.service;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Collection;
import java.util.HashSet;
import java.util.UUID;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.exception.ApiException;

@Service
public class CloudinarySignatureService {
    private static final Logger log = LoggerFactory.getLogger(CloudinarySignatureService.class);
    private static final HttpClient HTTP_CLIENT = HttpClient.newHttpClient();
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

    public UploadSignature sign(long storeId, UploadPurpose purpose) {
        return sign(storeId, switch (purpose) {
            case MENU_ITEM -> rootFolder;
            case STORE_LOGO -> "cas/stores";
            case WELCOME -> "cas/welcome";
        });
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

    public void deleteAfterCommit(long storeId, String oldStorageKey, String newStorageKey) {
        if (oldStorageKey == null || oldStorageKey.equals(newStorageKey))
            return;
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                delete(storeId, oldStorageKey);
            }
        });
    }

    public void deleteUnusedAfterCommit(long storeId, Collection<String> oldStorageKeys,
            Collection<String> retainedStorageKeys) {
        var unused = new HashSet<>(oldStorageKeys);
        unused.remove(null);
        unused.removeAll(retainedStorageKeys);
        unused.forEach(storageKey -> deleteAfterCommit(storeId, storageKey, null));
    }

    private void delete(long storeId, String storageKey) {
        if (cloudName.isBlank() || apiKey.isBlank() || apiSecret.isBlank()
                || !storageKey.startsWith(storeId + "_")) {
            log.warn("Skipping Cloudinary asset deletion for storeId={}, storageKey={}", storeId,
                    storageKey);
            return;
        }
        long timestamp = Instant.now().getEpochSecond();
        String signature = sha1(
                "invalidate=true&public_id=" + storageKey + "&timestamp=" + timestamp + apiSecret);
        String form = "api_key=" + encode(apiKey) + "&public_id=" + encode(storageKey)
                + "&timestamp=" + timestamp + "&invalidate=true&signature=" + signature;
        try {
            var request = HttpRequest
                    .newBuilder(URI.create(
                            "https://api.cloudinary.com/v1_1/" + cloudName + "/image/destroy"))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(form)).build();
            var response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.discarding());
            if (response.statusCode() < 200 || response.statusCode() >= 300)
                log.warn("Cloudinary asset deletion failed: storeId={}, storageKey={}, status={}",
                        storeId, storageKey, response.statusCode());
        } catch (Exception e) {
            log.warn("Cloudinary asset deletion failed: storeId={}, storageKey={}", storeId,
                    storageKey, e);
        }
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private static String sha1(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-1")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Cannot sign Cloudinary request", e);
        }
    }

    private ApiException invalidImage() {
        return new ApiException(HttpStatus.BAD_REQUEST, ApiMessages.INVALID_CATALOG_IMAGE);
    }

    public record UploadSignature(String cloudName, String apiKey, long timestamp, String folder,
            String publicId, String signature, String uploadPreset) {
    }

    public enum UploadPurpose {
        MENU_ITEM, STORE_LOGO, WELCOME
    }
}
