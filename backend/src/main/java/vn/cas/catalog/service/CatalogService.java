package vn.cas.catalog.service;

import java.math.BigDecimal;
import java.util.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cas.catalog.mapper.CatalogMapper;
import vn.cas.catalog.model.*;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.dto.AuditLogCommand;
import vn.cas.operation.service.AuditLogService;

@Service
public class CatalogService {
    private final CatalogMapper mapper;
    private final AuditLogService audit;
    private final CloudinarySignatureService cloudinary;

    public CatalogService(CatalogMapper mapper, AuditLogService audit,
            CloudinarySignatureService cloudinary) {
        this.mapper = mapper;
        this.audit = audit;
        this.cloudinary = cloudinary;
    }

    @Transactional(readOnly = true)
    public List<CatalogCategory> categories(long storeId, boolean published) {
        return mapper.findCategories(storeId, published, published);
    }

    @Transactional(readOnly = true)
    public List<CatalogTag> tags(long storeId, boolean published) {
        return mapper.findTags(storeId, published);
    }

    @Transactional(readOnly = true)
    public List<CatalogOptionGroup> optionGroups(long storeId, boolean published) {
        return mapper.findOptionGroups(storeId, published).stream()
                .map(group -> withValues(group, published)).toList();
    }

    @Transactional(readOnly = true)
    public List<CatalogMenuItem> items(long storeId, boolean published) {
        return mapper.findMenuItems(storeId, published).stream().map(this::withLinks).toList();
    }

    @Transactional(readOnly = true)
    public CatalogMenuItem item(long storeId, long id, boolean published) {
        var value = mapper.findMenuItem(storeId, id, published);
        if (value == null)
            throw notFound();
        return withLinks(value);
    }

    @Transactional
    public void createCategory(OperationalPrincipal p, String n, String d, String t, int o,
            String s, UUID r) {
        mapper.insertCategory(p.storeId(), n, d, t, o, s, p.accountId());
        log(p, r, "CREATE", "CATEGORY", n);
    }

    @Transactional
    public void updateCategory(OperationalPrincipal p, long id, String n, String d, int o, String s,
            UUID r) {
        required(mapper.updateCategory(p.storeId(), id, n, d, o, s, p.accountId()));
        log(p, r, "UPDATE", "CATEGORY", n);
    }

    @Transactional
    public void deleteCategory(OperationalPrincipal p, long id, UUID r) {
        try {
            required(mapper.deleteCategory(p.storeId(), id));
            log(p, r, "DELETE", "CATEGORY", String.valueOf(id));
        } catch (DataIntegrityViolationException e) {
            throw inUse();
        }
    }

    @Transactional
    public void createTag(OperationalPrincipal p, String n, String s, UUID r) {
        mapper.insertTag(p.storeId(), n, s);
        log(p, r, "CREATE", "TAG", n);
    }

    @Transactional
    public void updateTag(OperationalPrincipal p, long id, String n, String s, UUID r) {
        required(mapper.updateTag(p.storeId(), id, n, s));
        log(p, r, "UPDATE", "TAG", n);
    }

    @Transactional
    public void deleteTag(OperationalPrincipal p, long id, UUID r) {
        try {
            required(mapper.deleteTag(p.storeId(), id));
            log(p, r, "DELETE", "TAG", String.valueOf(id));
        } catch (DataIntegrityViolationException e) {
            throw inUse();
        }
    }

    @Transactional
    public void createGroup(OperationalPrincipal p, String n, String t, int min, Integer max, int o,
            String s, UUID r) {
        validGroup(t, min, max);
        mapper.insertOptionGroup(p.storeId(), n, t, min, max, o, s, p.accountId());
        log(p, r, "CREATE", "OPTION_GROUP", n);
    }

    @Transactional
    public void updateGroup(OperationalPrincipal p, long id, String n, String t, int min,
            Integer max, int o, String s, UUID r) {
        validGroup(t, min, max);
        required(mapper.updateOptionGroup(p.storeId(), id, n, t, min, max, o, s, p.accountId()));
        log(p, r, "UPDATE", "OPTION_GROUP", n);
    }

    @Transactional
    public void deleteGroup(OperationalPrincipal p, long id, UUID r) {
        try {
            required(mapper.deleteOptionGroup(p.storeId(), id));
            log(p, r, "DELETE", "OPTION_GROUP", String.valueOf(id));
        } catch (DataIntegrityViolationException e) {
            throw inUse();
        }
    }

    @Transactional
    public void createValue(OperationalPrincipal p, long groupId, String n, BigDecimal price,
            boolean def, int o, String s, UUID r) {
        if (mapper.findOptionGroup(p.storeId(), groupId) == null)
            throw notFound();
        mapper.insertOptionValue(groupId, n, price, def, o, s, p.accountId());
        log(p, r, "CREATE", "OPTION_VALUE", n);
    }

    @Transactional
    public void deleteValue(OperationalPrincipal p, long id, UUID r) {
        try {
            required(mapper.deleteOptionValue(p.storeId(), id));
            log(p, r, "DELETE", "OPTION_VALUE", String.valueOf(id));
        } catch (DataIntegrityViolationException e) {
            throw inUse();
        }
    }

    @Transactional
    public void createItem(OperationalPrincipal p, MenuCommand c, UUID r) {
        validItem(p.storeId(), c);
        mapper.insertMenuItem(p.storeId(), c.categoryId(), c.name(), c.description(), c.price(),
                c.imageUrl(), c.imageStorageKey(), c.availabilityStatus(), c.displayOrder(),
                p.accountId());
        links(p.storeId(), mapper.lastInsertId(), c);
        log(p, r, "CREATE", "MENU_ITEM", c.name());
    }

    @Transactional
    public void updateItem(OperationalPrincipal p, long id, MenuCommand c, UUID r) {
        var current = mapper.findMenuItem(p.storeId(), id, false);
        if (current == null)
            throw notFound();
        validItem(p.storeId(), c);
        required(mapper.updateMenuItem(p.storeId(), id, c.categoryId(), c.name(), c.description(),
                c.price(), c.imageUrl(), c.imageStorageKey(), c.availabilityStatus(),
                c.displayOrder(), p.accountId()));
        mapper.deleteMenuItemTags(id);
        mapper.deleteMenuItemOptionGroups(id);
        links(p.storeId(), id, c);
        cloudinary.deleteAfterCommit(p.storeId(), current.imageStorageKey(), c.imageStorageKey());
        log(p, r, "UPDATE", "MENU_ITEM", c.name());
    }

    @Transactional
    public void bulkStatus(OperationalPrincipal p, List<Long> ids, String status, UUID r) {
        if (ids.isEmpty())
            throw new ApiException(HttpStatus.BAD_REQUEST, ApiMessages.INVALID_REQUEST);
        mapper.bulkUpdateMenuItemStatus(p.storeId(), ids, status, p.accountId());
        log(p, r, "UPDATE", "MENU_ITEM", "Bulk status");
    }

    private void validItem(long storeId, MenuCommand c) {
        if (mapper.findCategory(storeId, c.categoryId()) == null)
            throw notFound();
        cloudinary.validateAsset(storeId, c.imageUrl(), c.imageStorageKey());
        for (Long tag : c.tagIds())
            if (mapper.findTag(storeId, tag) == null)
                throw notFound();
        for (OptionGroupLink group : c.optionGroups())
            if (mapper.findOptionGroup(storeId, group.optionGroupId()) == null)
                throw notFound();
    }

    private void links(long storeId, long itemId, MenuCommand c) {
        for (Long tag : c.tagIds())
            mapper.insertMenuItemTag(itemId, tag, storeId);
        for (OptionGroupLink group : c.optionGroups())
            mapper.insertMenuItemOptionGroup(itemId, group.optionGroupId(), storeId,
                    group.displayOrder());
    }

    private CatalogMenuItem withLinks(CatalogMenuItem item) {
        return new CatalogMenuItem(item.id(), item.categoryId(), item.name(), item.description(),
                item.price(), item.imageUrl(), item.imageStorageKey(), item.availabilityStatus(),
                item.displayOrder(), mapper.findMenuItemTags(item.id()),
                mapper.findMenuItemOptionGroups(item.id()).stream()
                        .map(group -> withValues(group, true)).toList());
    }

    private CatalogOptionGroup withValues(CatalogOptionGroup group, boolean activeOnly) {
        return new CatalogOptionGroup(group.id(), group.name(), group.selectionType(),
                group.minSelect(), group.maxSelect(), group.displayOrder(), group.status(),
                mapper.findOptionValuesByGroupId(group.id(), activeOnly));
    }

    private static void validGroup(String t, int min, Integer max) {
        if (("SINGLE".equals(t) && ((max != null && max > 1) || min > 1))
                || (max != null && min > max))
            throw new ApiException(HttpStatus.BAD_REQUEST, ApiMessages.INVALID_REQUEST);
    }

    private void required(int count) {
        if (count != 1)
            throw notFound();
    }

    private ApiException notFound() {
        return new ApiException(HttpStatus.NOT_FOUND, ApiMessages.CATALOG_RESOURCE_NOT_FOUND);
    }

    private ApiException inUse() {
        return new ApiException(HttpStatus.CONFLICT, ApiMessages.CATALOG_RESOURCE_IN_USE);
    }

    private void log(OperationalPrincipal p, UUID r, String action, String type, String target) {
        audit.record(new AuditLogCommand(p.storeId(), r, action, type, 0L, target, "{}",
                p.accountId(), p.displayName(), action + " " + type));
    }

    public record OptionGroupLink(long optionGroupId, int displayOrder) {
    }

    public record MenuCommand(long categoryId, String name, String description, BigDecimal price,
            String imageUrl, String imageStorageKey, String availabilityStatus, int displayOrder,
            List<Long> tagIds, List<OptionGroupLink> optionGroups) {
    }
}
