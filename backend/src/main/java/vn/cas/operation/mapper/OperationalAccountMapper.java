package vn.cas.operation.mapper;

import java.time.LocalDateTime;
import java.util.Optional;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import vn.cas.operation.dto.CreateAdminAccountCommand;
import vn.cas.operation.dto.CreateOperatorAccountCommand;
import vn.cas.operation.model.OperationalAccount;

@Mapper
public interface OperationalAccountMapper {

    Optional<OperationalAccount> findActiveByFirebaseUid(@Param("firebaseUid") String firebaseUid);

    int updateLastLoginAt(@Param("accountId") long accountId, @Param("lastLoginAt") LocalDateTime lastLoginAt);

    boolean existsByFirebaseUid(@Param("firebaseUid") String firebaseUid);

    int insertOperatorAccount(CreateOperatorAccountCommand command);

    int insertAdminAccount(CreateAdminAccountCommand command);

    int deactivateOperatorAccount(@Param("accountId") long accountId, @Param("storeId") long storeId);
}
