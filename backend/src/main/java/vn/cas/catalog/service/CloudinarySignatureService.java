package vn.cas.catalog.service;

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
    private final String cloudName; private final String apiKey; private final String apiSecret; private final String preset; private final String rootFolder;
    public CloudinarySignatureService(@Value("${cas.cloudinary.cloud-name:}") String cloudName, @Value("${cas.cloudinary.api-key:}") String apiKey, @Value("${cas.cloudinary.api-secret:}") String apiSecret, @Value("${cas.cloudinary.upload-preset:}") String preset, @Value("${cas.cloudinary.root-folder:cas/menu}") String rootFolder) { this.cloudName=cloudName; this.apiKey=apiKey; this.apiSecret=apiSecret; this.preset=preset; this.rootFolder=rootFolder; }
    public UploadSignature sign(long storeId) {
        if (cloudName.isBlank() || apiKey.isBlank() || apiSecret.isBlank() || preset.isBlank()) throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, ApiMessages.CLOUDINARY_NOT_CONFIGURED);
        long timestamp=Instant.now().getEpochSecond(); String folder=rootFolder + "/" + storeId; String publicId=UUID.randomUUID().toString();
        String value="folder="+folder+"&public_id="+publicId+"&timestamp="+timestamp+apiSecret;
        try { String signature=HexFormat.of().formatHex(MessageDigest.getInstance("SHA-1").digest(value.getBytes(StandardCharsets.UTF_8))); return new UploadSignature(cloudName,apiKey,timestamp,folder,publicId,signature,preset); }
        catch (Exception e) { throw new IllegalStateException("Cannot sign Cloudinary upload",e); }
    }
    public record UploadSignature(String cloudName,String apiKey,long timestamp,String folder,String publicId,String signature,String uploadPreset) { }
}
