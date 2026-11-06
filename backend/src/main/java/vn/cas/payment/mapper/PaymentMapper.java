package vn.cas.payment.mapper;

import java.time.LocalDateTime;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import vn.cas.payment.model.PaymentView;
import vn.cas.payment.model.PaymentListView;
import vn.cas.payment.model.UnpaidRecordView;
import vn.cas.payment.model.UnpaidSessionView;

@Mapper
public interface PaymentMapper {
    @Select("SELECT id FROM sales_sessions WHERE id = #{sessionId} FOR UPDATE")
    Long lockSession(@Param("sessionId") long sessionId);
    @Select("SELECT sales_sessions.public_id FROM sales_sessions INNER JOIN payments ON payments.sales_session_id = sales_sessions.id WHERE payments.public_id = #{paymentId} AND sales_sessions.store_id = #{storeId}")
    String findSessionPublicId(@Param("storeId") long storeId,
            @Param("paymentId") String paymentId);
    PaymentView findBySessionId(@Param("sessionId") long sessionId);
    PaymentView findCustomerPayment(@Param("sessionPublicId") String sessionPublicId);
    PaymentView findByPublicId(@Param("storeId") long storeId, @Param("publicId") String publicId);
    List<PaymentListView> findPending(@Param("storeId") long storeId);
    List<PaymentListView> findPaidBetween(@Param("storeId") long storeId,
            @Param("confirmedAtStart") LocalDateTime confirmedAtStart,
            @Param("confirmedAtEnd") LocalDateTime confirmedAtEnd);
    long countPending(@Param("storeId") long storeId);
    int insert(@Param("publicId") String publicId, @Param("sessionId") long sessionId,
            @Param("amount") java.math.BigDecimal amount, @Param("snapshot") String snapshot);
    long lastInsertId();
    int confirm(@Param("id") long id, @Param("accountId") long accountId,
            @Param("name") String name);

    int updatePaidAdjustment(@Param("id") long id, @Param("amount") java.math.BigDecimal amount,
            @Param("snapshot") String snapshot);

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
