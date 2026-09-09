package vn.cas.payment.mapper;

import java.time.LocalDateTime;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import vn.cas.payment.model.PaymentView;
import vn.cas.payment.model.UnpaidRecordView;
import vn.cas.payment.model.UnpaidSessionView;

@Mapper
public interface PaymentMapper {
    PaymentView findBySessionId(@Param("sessionId") long sessionId);
    PaymentView findByPublicId(@Param("storeId") long storeId, @Param("publicId") String publicId);
    List<PaymentView> findPending(@Param("storeId") long storeId);
    List<PaymentView> findPaidBetween(@Param("storeId") long storeId,
            @Param("confirmedAtStart") LocalDateTime confirmedAtStart,
            @Param("confirmedAtEnd") LocalDateTime confirmedAtEnd);
    long countPending(@Param("storeId") long storeId);
    int insert(@Param("publicId") String publicId, @Param("sessionId") long sessionId,
            @Param("amount") java.math.BigDecimal amount, @Param("snapshot") String snapshot);
    long lastInsertId();
    int confirm(@Param("id") long id, @Param("accountId") long accountId,
            @Param("name") String name);

    int removePendingPaymentDiscount(@Param("id") long id,
            @Param("amount") java.math.BigDecimal amount, @Param("snapshot") String snapshot);

    int removeOpenUnpaidRecordDiscount(@Param("sessionId") long sessionId,
            @Param("amount") java.math.BigDecimal amount, @Param("snapshot") String snapshot);

    boolean hasOpenUnpaidRecord(@Param("sessionId") long sessionId);

    int resolveOpenUnpaidRecord(@Param("sessionId") long sessionId,
            @Param("paymentId") long paymentId);

    List<UnpaidRecordView> findUnpaidRecords(@Param("storeId") long storeId,
            @Param("status") String status);

    UnpaidRecordView findUnpaidRecordByPublicId(@Param("storeId") long storeId,
            @Param("publicId") String publicId);

    List<UnpaidSessionView> findEligibleUnpaidSessions(@Param("storeId") long storeId,
            @Param("minimumOpenMinutes") int minimumOpenMinutes);

    int insertUnpaidRecord(@Param("publicId") String publicId, @Param("sessionId") long sessionId,
            @Param("amount") java.math.BigDecimal amount,
            @Param("billSnapshot") String billSnapshot, @Param("reason") String reason,
            @Param("reportedBy") long reportedBy, @Param("reportedByName") String reportedByName);
}
