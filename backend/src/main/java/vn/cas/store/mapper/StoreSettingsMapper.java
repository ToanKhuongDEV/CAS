package vn.cas.store.mapper;

import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import vn.cas.store.model.StoreSettings;

@Mapper
public interface StoreSettingsMapper {

    Optional<Integer> findLongWaitWarningMinutesByStoreId(@Param("storeId") long storeId);

    int updateLongWaitWarningMinutes(@Param("storeId") long storeId,
            @Param("longWaitWarningMinutes") int longWaitWarningMinutes);

    StoreSettings findByStoreId(@Param("storeId") long storeId);

    StoreSettings findActiveByStoreId(@Param("storeId") long storeId);

    int updateStoreSettings(@Param("storeId") long storeId, @Param("name") String name,
            @Param("address") String address, @Param("phone") String phone,
            @Param("email") String email, @Param("logoUrl") String logoUrl,
            @Param("logoStorageKey") String logoStorageKey,
            @Param("googleMapsLocation") String googleMapsLocation,
            @Param("openTime") java.time.LocalTime openTime,
            @Param("closeTime") java.time.LocalTime closeTime,
            @Param("welcomeSlogan") String welcomeSlogan, @Param("status") String status);
}
