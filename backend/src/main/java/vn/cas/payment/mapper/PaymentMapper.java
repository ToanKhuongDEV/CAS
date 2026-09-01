package vn.cas.payment.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import vn.cas.payment.model.PaymentView;

@Mapper
public interface PaymentMapper {
    PaymentView findBySessionId(@Param("sessionId") long sessionId);
    PaymentView findByPublicId(@Param("storeId") long storeId, @Param("publicId") String publicId);
    List<PaymentView> findPending(@Param("storeId") long storeId);
    int insert(@Param("publicId") String publicId, @Param("sessionId") long sessionId,
            @Param("amount") java.math.BigDecimal amount, @Param("snapshot") String snapshot);
    int confirm(@Param("id") long id, @Param("accountId") long accountId,
            @Param("name") String name);
}
