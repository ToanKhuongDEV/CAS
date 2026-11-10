package vn.cas.catalog.service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cas.catalog.mapper.CatalogMapper;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.dto.AuditLogCommand;
import vn.cas.operation.service.AuditLogService;

@Service
public class CatalogCopyService {
    private final CatalogMapper mapper;
    private final AuditLogService audit;

    public CatalogCopyService(CatalogMapper mapper, AuditLogService audit) {
        this.mapper = mapper;
        this.audit = audit;
    }

    @Transactional
    public void copy(OperationalPrincipal principal, long sourceId, long targetId, UUID requestId) {
        if (!"SUPER_ADMIN".equals(principal.role()))
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "Chỉ SUPER_ADMIN có quyền sao chép thực đơn.");
        if (sourceId == targetId)
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cơ sở nguồn và đích phải khác nhau.");
        if (mapper.lockStore(Math.min(sourceId, targetId)) == null
                || mapper.lockStore(Math.max(sourceId, targetId)) == null)
            throw new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy cơ sở.");
        if (!mapper.findCategories(targetId, false, false).isEmpty()
                || !mapper.findTags(targetId, false).isEmpty()
                || !mapper.findOptionGroups(targetId, false).isEmpty()
                || !mapper.findMenuItems(targetId, false).isEmpty())
            throw new ApiException(HttpStatus.CONFLICT, "Cơ sở đích đã có thực đơn.");

        Map<Long, Long> categories = new HashMap<>();
        for (var category : mapper.findCategories(sourceId, false, false)) {
            mapper.insertCategory(targetId, category.name(), category.description(),
                    category.categoryType(), category.displayOrder(), category.status(),
                    principal.accountId());
            categories.put(category.id(), mapper.lastInsertId());
        }
        Map<Long, Long> tags = new HashMap<>();
        for (var tag : mapper.findTags(sourceId, false)) {
            mapper.insertTag(targetId, tag.name(), tag.status());
            tags.put(tag.id(), mapper.lastInsertId());
        }
        Map<Long, Long> groups = new HashMap<>();
        for (var group : mapper.findOptionGroups(sourceId, false)) {
            mapper.insertOptionGroup(targetId, group.name(), group.selectionType(),
                    group.minSelect(), group.maxSelect(), group.displayOrder(), group.status(),
                    principal.accountId());
            long groupId = mapper.lastInsertId();
            groups.put(group.id(), groupId);
            for (var value : mapper.findOptionValuesByGroupId(group.id(), false))
                mapper.insertOptionValue(groupId, value.name(), value.extraPrice(),
                        value.isDefault(), value.displayOrder(), value.status(),
                        principal.accountId());
        }
        for (var item : mapper.findMenuItems(sourceId, false)) {
            mapper.insertMenuItem(targetId, categories.get(item.categoryId()), item.name(),
                    item.description(), item.price(), item.imageUrl(), item.imageStorageKey(),
                    item.availabilityStatus(), item.displayOrder(), principal.accountId());
            long itemId = mapper.lastInsertId();
            for (var tag : mapper.findMenuItemTags(item.id()))
                mapper.insertMenuItemTag(itemId, tags.get(tag.id()), targetId);
            for (var group : mapper.findMenuItemOptionGroups(item.id()))
                mapper.insertMenuItemOptionGroup(itemId, groups.get(group.id()), targetId,
                        group.displayOrder());
        }
        audit.record(new AuditLogCommand(targetId, requestId, "COPY_MENU", "STORE", targetId, "",
                "{\"sourceStoreId\":" + sourceId + "}", principal.accountId(),
                principal.displayName(), "Copied store menu"));
    }
}
