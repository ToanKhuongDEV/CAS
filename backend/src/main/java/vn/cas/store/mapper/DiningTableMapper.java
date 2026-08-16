package vn.cas.store.mapper;

import java.time.LocalDateTime;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import vn.cas.store.dto.CreateDiningTableCommand;

@Mapper
public interface DiningTableMapper {

    boolean existsByStoreIdAndCode(@Param("storeId") long storeId, @Param("code") long code);

    int insertDiningTable(CreateDiningTableCommand command);

    int insertActiveQrCode(
            @Param("tableId") long tableId,
            @Param("token") String token,
            @Param("issuedAt") LocalDateTime issuedAt);
}
