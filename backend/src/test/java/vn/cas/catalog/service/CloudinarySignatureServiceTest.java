package vn.cas.catalog.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.*;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import vn.cas.catalog.mapper.CatalogMapper;
import vn.cas.common.exception.ApiException;

class CloudinarySignatureServiceTest {

    private final CatalogMapper mapper = mock(CatalogMapper.class);
    private final CloudinarySignatureService service = new CloudinarySignatureService("cas-cloud",
            "api-key", "api-secret", "catalog-signed", "cas/menu", mapper);

    @Test
    void checksForRemainingReferencesBeforeDeletingAnImage() {
        when(mapper.isAssetInUse("cas/menu/8/8_item")).thenReturn(true);
        TransactionSynchronizationManager.initSynchronization();
        try {
            service.deleteAfterCommit(8, "cas/menu/8/8_item", null);
            TransactionSynchronizationManager.getSynchronizations()
                    .forEach(sync -> sync.afterCommit());
            verify(mapper).isAssetInUse("cas/menu/8/8_item");
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void signsEveryUploadParameterSentByTheBrowser() throws Exception {
        var signature = service.sign(8L, CloudinarySignatureService.UploadPurpose.MENU_ITEM);

        var value = "folder=" + signature.folder() + "&public_id=" + signature.publicId()
                + "&timestamp=" + signature.timestamp() + "&upload_preset="
                + signature.uploadPreset() + "api-secret";
        var expected = HexFormat.of().formatHex(
                MessageDigest.getInstance("SHA-1").digest(value.getBytes(StandardCharsets.UTF_8)));

        assertThat(signature.signature()).isEqualTo(expected);
        assertThat(signature.folder()).isEqualTo("cas/menu/8");
        assertThat(signature.publicId()).startsWith("8_");
    }

    @Test
    void acceptsOnlyAssetsFromTheConfiguredStoreFolder() {
        service.validateAsset(8L,
                "https://res.cloudinary.com/cas-cloud/image/upload/v1/cas/menu/8/8_item.jpg",
                "cas/menu/8/8_item");

        assertThatThrownBy(() -> service.validateAsset(8L,
                "https://res.cloudinary.com/cas-cloud/image/upload/v1/cas/menu/9/9_item.jpg",
                "cas/menu/9/9_item")).isInstanceOf(ApiException.class);
    }

    @Test
    void choosesFolderFromUploadPurpose() {
        assertThat(service.sign(8L, CloudinarySignatureService.UploadPurpose.BRAND_LOGO).folder())
                .isEqualTo("cas/brand");
        assertThat(service.sign(8L, CloudinarySignatureService.UploadPurpose.WELCOME).folder())
                .isEqualTo("cas/welcome/8");
    }
}
