package vn.cas.operation.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import vn.cas.operation.dto.CreateOperationalIncidentCommand;
import vn.cas.operation.model.OperationalIncident;

@Mapper
public interface OperationalIncidentMapper {
    int insert(CreateOperationalIncidentCommand command);

    OperationalIncident findByPublicId(@Param("storeId") long storeId,
            @Param("publicId") String publicId);

    List<OperationalIncident> findAllByStoreId(@Param("storeId") long storeId);
}
