package vn.cas.operation.infrastructure.persistence.mybatis;

import org.apache.ibatis.annotations.Mapper;

import vn.cas.operation.application.AuditLogCommand;

@Mapper
public interface AuditLogMapper {

    int insert(AuditLogCommand command);
}
