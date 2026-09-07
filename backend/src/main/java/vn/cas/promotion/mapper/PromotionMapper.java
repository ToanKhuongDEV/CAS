package vn.cas.promotion.mapper;

import java.math.BigDecimal;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import vn.cas.promotion.model.Promotion;
import vn.cas.promotion.model.PromotionCode;
import vn.cas.promotion.model.PromotionTarget;

@Mapper
public interface PromotionMapper {
    List<Promotion> findByStoreId(@Param("storeId") long storeId);
    Promotion findByPublicId(@Param("storeId") long storeId, @Param("publicId") String publicId);
    Promotion findById(@Param("storeId") long storeId, @Param("id") long id);
    List<PromotionCode> findCodes(@Param("promotionId") long promotionId);
    List<PromotionTarget> findTargets(@Param("promotionId") long promotionId);
    List<PromotionTargetName> findTargetNames(@Param("promotionId") long promotionId);
    PromotionCode findCode(@Param("promotionId") long promotionId, @Param("id") long id);
    long countCompletedRedemptions(@Param("promotionId") long promotionId);
    long countCompletedRedemptionsByCode(@Param("promotionCodeId") long promotionCodeId);
    long countCompletedRedemptionsByPromotionAndCustomer(@Param("promotionId") long promotionId,
            @Param("clientAccountId") long clientAccountId);
    List<PromotionRedemptionView> findRedemptions(@Param("promotionId") long promotionId,
            @Param("limit") int limit, @Param("offset") int offset);
    long countRedemptions(@Param("promotionId") long promotionId);
    int insert(@Param("publicId") String publicId, @Param("storeId") long storeId,
            @Param("promotion") Promotion promotion);
    long lastInsertId();
    int update(@Param("storeId") long storeId, @Param("id") long id,
            @Param("promotion") Promotion promotion);
    int updateStatus(@Param("storeId") long storeId, @Param("id") long id,
            @Param("status") String status);
    int deleteCodes(@Param("promotionId") long promotionId);
    int insertCode(@Param("storeId") long storeId, @Param("promotionId") long promotionId,
            @Param("code") String code, @Param("maxRedemptions") Integer maxRedemptions);
    int deleteTargets(@Param("promotionId") long promotionId);
    int insertTarget(@Param("storeId") long storeId, @Param("promotionId") long promotionId,
            @Param("targetType") String targetType, @Param("targetId") long targetId);
    boolean existsMenuItem(@Param("storeId") long storeId, @Param("id") long id);
    boolean existsCategory(@Param("storeId") long storeId, @Param("id") long id);
    int setSelection(@Param("sessionId") long sessionId, @Param("promotionId") long promotionId,
            @Param("codeId") Long codeId);
    int clearSelection(@Param("sessionId") long sessionId);
    BigDecimal currentPayableAmount(@Param("sessionId") long sessionId);
    BigDecimal targetedPayableAmount(@Param("sessionId") long sessionId,
            @Param("promotionId") long promotionId);
    int insertBillDiscount(@Param("storeId") long storeId, @Param("sessionId") long sessionId,
            @Param("paymentId") long paymentId, @Param("promotion") Promotion promotion,
            @Param("codeId") Long codeId, @Param("code") String code,
            @Param("amount") BigDecimal amount, @Param("snapshot") String snapshot);
    int insertRedemptionFromDiscount(@Param("paymentId") long paymentId);

    record PromotionRedemptionView(long id, String customerName, BigDecimal discountAmount,
            java.time.LocalDateTime paidAt, String status) {
    }
    record PromotionTargetName(String targetType, String targetName) {
    }
}
