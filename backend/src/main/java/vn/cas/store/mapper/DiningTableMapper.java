package vn.cas.store.mapper;

import java.time.LocalDateTime;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import vn.cas.store.dto.CreateClientAccountCommand;
import vn.cas.store.dto.CreateDiningTableCommand;
import vn.cas.store.model.ActiveTableQrCode;
import vn.cas.store.model.AdminDiningTable;
import vn.cas.store.model.CustomerTableSessionLookup;

@Mapper
public interface DiningTableMapper {

    boolean existsByStoreIdAndCode(@Param("storeId") long storeId, @Param("code") long code);

    int insertDiningTable(CreateDiningTableCommand command);

    int insertActiveQrCode(@Param("tableId") long tableId, @Param("token") String token,
            @Param("issuedAt") LocalDateTime issuedAt);

    java.util.List<AdminDiningTable> findAdminDiningTablesByStoreId(@Param("storeId") long storeId);

    ActiveTableQrCode findActiveQrCodeByStoreIdAndTableId(@Param("storeId") long storeId,
            @Param("tableId") long tableId);

    int deleteTableQrCodes(@Param("storeId") long storeId, @Param("tableId") long tableId);

    int deleteDiningTable(@Param("storeId") long storeId, @Param("tableId") long tableId);

    CustomerTableSessionLookup findTableSessionByActiveQrTokenForUpdate(
            @Param("qrToken") String qrToken);

    CustomerTableSessionLookup findCurrentTableSessionByPublicId(
            @Param("sessionPublicId") String sessionPublicId);

    CustomerTableSessionLookup findCurrentTableSessionByPublicIdForUpdate(
            @Param("sessionPublicId") String sessionPublicId);

    CustomerTableSessionLookup findTableSessionByStoreIdAndTableIdForUpdate(
            @Param("storeId") long storeId, @Param("tableId") long tableId);

    boolean hasOrders(@Param("sessionId") long sessionId);

    int closeSessionWithoutOrders(@Param("sessionId") long sessionId);

    Long findClientAccountIdByStoreIdAndPhone(@Param("storeId") long storeId,
            @Param("phone") String phone);

    int insertClientAccount(CreateClientAccountCommand command);

    int insertOpenCustomerTableSession(@Param("tableId") long tableId,
            @Param("publicId") String publicId, @Param("clientAccountId") long clientAccountId,
            @Param("customerName") String customerName,
            @Param("customerPhone") String customerPhone);
}
