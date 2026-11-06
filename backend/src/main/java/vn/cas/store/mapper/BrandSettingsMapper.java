package vn.cas.store.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import vn.cas.store.model.BrandSettings;

@Mapper
public interface BrandSettingsMapper {

    BrandSettings find();

    int update(@Param("name") String name, @Param("logoUrl") String logoUrl,
            @Param("logoStorageKey") String logoStorageKey,
            @Param("welcomeSlogan") String welcomeSlogan);
}
