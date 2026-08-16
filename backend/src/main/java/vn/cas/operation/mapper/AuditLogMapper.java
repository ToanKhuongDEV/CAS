package vn.cas.operation.mapper;

import org.apache.ibatis.annotations.Mapper;

import vn.cas.operation.dto.AuditLogCommand;

@Mapper
public interface AuditLogMapper {

    int insert(AuditLogCommand command);
}
