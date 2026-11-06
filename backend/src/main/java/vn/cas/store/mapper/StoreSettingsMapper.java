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

    java.util.List<StoreSettings> findAllActive();

    java.util.List<StoreSettings> findAll();

    int updateStoreSettings(@Param("storeId") long storeId, @Param("branchName") String branchName,
            @Param("address") String address, @Param("phone") String phone,
            @Param("email") String email, @Param("googleMapsLocation") String googleMapsLocation,
            @Param("openTime") java.time.LocalTime openTime,
            @Param("closeTime") java.time.LocalTime closeTime, @Param("status") String status);
}
