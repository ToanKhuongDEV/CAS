package vn.cas.store.infrastructure.persistence.mybatis;

import java.time.LocalDateTime;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface DiningTableMapper {

    boolean existsByStoreIdAndCode(@Param("storeId") long storeId, @Param("code") long code);

    int insertDiningTable(CreateDiningTableCommand command);

    int insertActiveQrCode(
            @Param("tableId") long tableId,
            @Param("token") String token,
            @Param("issuedAt") LocalDateTime issuedAt);
}
