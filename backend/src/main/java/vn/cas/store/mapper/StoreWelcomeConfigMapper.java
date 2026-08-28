package vn.cas.store.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import vn.cas.store.model.StoreWelcomeConfig;

@Mapper
public interface StoreWelcomeConfigMapper {
    StoreWelcomeConfig findByStoreId(@Param("storeId") long storeId);

    StoreWelcomeConfig findActiveByStoreId(@Param("storeId") long storeId);

    int insert(StoreWelcomeConfig config);

    int update(StoreWelcomeConfig config);

    int deleteByStoreId(@Param("storeId") long storeId);
}
