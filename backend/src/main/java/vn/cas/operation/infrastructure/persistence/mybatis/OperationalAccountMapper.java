package vn.cas.operation.infrastructure.persistence.mybatis;

import java.time.LocalDateTime;
import java.util.Optional;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import vn.cas.operation.domain.OperationalAccount;

@Mapper
public interface OperationalAccountMapper {

    Optional<OperationalAccount> findActiveByFirebaseUid(@Param("firebaseUid") String firebaseUid);

    int updateLastLoginAt(@Param("accountId") long accountId, @Param("lastLoginAt") LocalDateTime lastLoginAt);
}
