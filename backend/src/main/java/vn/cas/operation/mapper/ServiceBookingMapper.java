package vn.cas.operation.mapper;

import java.math.BigDecimal;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import vn.cas.operation.model.ServiceBookingRecord;
import vn.cas.operation.model.ServiceBookingView;
import vn.cas.store.dto.CreateClientAccountCommand;

@Mapper
public interface ServiceBookingMapper {
    List<ServiceBookingView> findAllByStoreId(@Param("storeId") long storeId);
    ServiceBookingView findByPublicId(@Param("storeId") long storeId,
            @Param("publicId") String publicId);
    ServiceBookingRecord findRecordByPublicIdForUpdate(@Param("storeId") long storeId,
            @Param("publicId") String publicId);
    Long findClientAccountIdByStoreIdAndPhone(@Param("storeId") long storeId,
            @Param("phone") String phone);
    int insertClientAccount(CreateClientAccountCommand command);
    int updateClientAccountName(@Param("id") long id, @Param("name") String name);
    int insert(@Param("publicId") String publicId, @Param("storeId") long storeId,
            @Param("clientAccountId") long clientAccountId,
            @Param("serviceName") String serviceName, @Param("note") String note,
            @Param("agreedPrice") BigDecimal agreedPrice,
            @Param("paymentStatus") String paymentStatus,
            @Param("createdByAccountId") long createdByAccountId,
            @Param("createdByName") String createdByName);
    int update(@Param("id") long id, @Param("serviceName") String serviceName,
            @Param("note") String note, @Param("agreedPrice") BigDecimal agreedPrice);
    int confirm(@Param("id") long id, @Param("accountId") long accountId,
            @Param("name") String name);
    int cancel(@Param("id") long id);
}
