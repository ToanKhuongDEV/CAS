package vn.cas.payment.mapper;

import java.math.BigDecimal;
import java.util.List;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import vn.cas.payment.model.BillAdjustment;

@Mapper
public interface BillAdjustmentMapper {
    @Select("SELECT public_id AS publicId, adjustment_type AS adjustmentType, amount, reason, created_at AS createdAt FROM bill_adjustments WHERE sales_session_id = #{sessionId} ORDER BY id")
    List<BillAdjustment> findBySessionId(long sessionId);

    @Select("SELECT id FROM bill_adjustments WHERE sales_session_id = #{sessionId} AND public_id = #{publicId}")
    Long findId(@Param("sessionId") long sessionId, @Param("publicId") String publicId);

    @Insert("INSERT INTO bill_adjustments (public_id, sales_session_id, adjustment_type, amount, reason, created_by) VALUES (#{publicId}, #{sessionId}, #{type}, #{amount}, #{reason}, #{accountId})")
    int insert(@Param("publicId") String publicId, @Param("sessionId") long sessionId,
            @Param("type") String type, @Param("amount") BigDecimal amount,
            @Param("reason") String reason, @Param("accountId") long accountId);

    @Update("UPDATE bill_adjustments SET adjustment_type = #{type}, amount = #{amount}, reason = #{reason} WHERE sales_session_id = #{sessionId} AND public_id = #{publicId}")
    int update(@Param("sessionId") long sessionId, @Param("publicId") String publicId,
            @Param("type") String type, @Param("amount") BigDecimal amount,
            @Param("reason") String reason);

    @Delete("DELETE FROM bill_adjustments WHERE sales_session_id = #{sessionId} AND public_id = #{publicId}")
    int delete(@Param("sessionId") long sessionId, @Param("publicId") String publicId);
}
