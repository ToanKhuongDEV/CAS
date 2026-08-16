package vn.cas.store.mapper;

import java.util.Optional;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface StoreSettingsMapper {

    Optional<Integer> findLongWaitWarningMinutesByStoreId(@Param("storeId") long storeId);

    int updateLongWaitWarningMinutes(
            @Param("storeId") long storeId,
            @Param("longWaitWarningMinutes") int longWaitWarningMinutes);
}
