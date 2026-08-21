package vn.cas.catalog.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import vn.cas.catalog.model.*;

@Mapper
public interface CatalogMapper {
  List<CatalogCategory> findCategories(
      @Param("storeId") long storeId,
      @Param("activeOnly") boolean activeOnly,
      @Param("regularOnly") boolean regularOnly);

  CatalogCategory findCategory(@Param("storeId") long storeId, @Param("id") long id);

  int insertCategory(
      @Param("storeId") long storeId,
      @Param("name") String name,
      @Param("description") String description,
      @Param("categoryType") String categoryType,
      @Param("displayOrder") int displayOrder,
      @Param("status") String status,
      @Param("actorId") long actorId);

  int updateCategory(
      @Param("storeId") long storeId,
      @Param("id") long id,
      @Param("name") String name,
      @Param("description") String description,
      @Param("displayOrder") int displayOrder,
      @Param("status") String status,
      @Param("actorId") long actorId);

  int deleteCategory(@Param("storeId") long storeId, @Param("id") long id);

  List<CatalogTag> findTags(
      @Param("storeId") long storeId, @Param("activeOnly") boolean activeOnly);

  CatalogTag findTag(@Param("storeId") long storeId, @Param("id") long id);

  int insertTag(
      @Param("storeId") long storeId, @Param("name") String name, @Param("status") String status);

  int updateTag(
      @Param("storeId") long storeId,
      @Param("id") long id,
      @Param("name") String name,
      @Param("status") String status);

  int deleteTag(@Param("storeId") long storeId, @Param("id") long id);

  List<CatalogOptionGroup> findOptionGroups(
      @Param("storeId") long storeId, @Param("activeOnly") boolean activeOnly);

  CatalogOptionGroup findOptionGroup(@Param("storeId") long storeId, @Param("id") long id);

  int insertOptionGroup(
      @Param("storeId") long storeId,
      @Param("name") String name,
      @Param("selectionType") String selectionType,
      @Param("minSelect") int minSelect,
      @Param("maxSelect") Integer maxSelect,
      @Param("displayOrder") int displayOrder,
      @Param("status") String status,
      @Param("actorId") long actorId);

  int updateOptionGroup(
      @Param("storeId") long storeId,
      @Param("id") long id,
      @Param("name") String name,
      @Param("selectionType") String selectionType,
      @Param("minSelect") int minSelect,
      @Param("maxSelect") Integer maxSelect,
      @Param("displayOrder") int displayOrder,
      @Param("status") String status,
      @Param("actorId") long actorId);

  int deleteOptionGroup(@Param("storeId") long storeId, @Param("id") long id);

  int insertOptionValue(
      @Param("groupId") long groupId,
      @Param("name") String name,
      @Param("extraPrice") java.math.BigDecimal extraPrice,
      @Param("isDefault") boolean isDefault,
      @Param("displayOrder") int displayOrder,
      @Param("status") String status,
      @Param("actorId") long actorId);

  int deleteOptionValue(@Param("storeId") long storeId, @Param("id") long id);

  List<CatalogMenuItem> findMenuItems(
      @Param("storeId") long storeId, @Param("publicOnly") boolean publicOnly);

  CatalogMenuItem findMenuItem(
      @Param("storeId") long storeId,
      @Param("id") long id,
      @Param("publicOnly") boolean publicOnly);

  List<CatalogTag> findMenuItemTags(@Param("menuItemId") long menuItemId);

  List<CatalogOptionGroup> findMenuItemOptionGroups(@Param("menuItemId") long menuItemId);

  int insertMenuItem(
      @Param("storeId") long storeId,
      @Param("categoryId") long categoryId,
      @Param("name") String name,
      @Param("description") String description,
      @Param("price") java.math.BigDecimal price,
      @Param("imageUrl") String imageUrl,
      @Param("imageStorageKey") String imageStorageKey,
      @Param("availabilityStatus") String availabilityStatus,
      @Param("displayOrder") int displayOrder,
      @Param("actorId") long actorId);

  int updateMenuItem(
      @Param("storeId") long storeId,
      @Param("id") long id,
      @Param("categoryId") long categoryId,
      @Param("name") String name,
      @Param("description") String description,
      @Param("price") java.math.BigDecimal price,
      @Param("imageUrl") String imageUrl,
      @Param("imageStorageKey") String imageStorageKey,
      @Param("availabilityStatus") String availabilityStatus,
      @Param("displayOrder") int displayOrder,
      @Param("actorId") long actorId);

  int bulkUpdateMenuItemStatus(
      @Param("storeId") long storeId,
      @Param("ids") List<Long> ids,
      @Param("status") String status,
      @Param("actorId") long actorId);

  long lastInsertId();

  int deleteMenuItemTags(@Param("menuItemId") long menuItemId);

  int deleteMenuItemOptionGroups(@Param("menuItemId") long menuItemId);

  int insertMenuItemTag(
      @Param("menuItemId") long menuItemId,
      @Param("tagId") long tagId,
      @Param("storeId") long storeId);

  int insertMenuItemOptionGroup(
      @Param("menuItemId") long menuItemId,
      @Param("optionGroupId") long optionGroupId,
      @Param("storeId") long storeId,
      @Param("displayOrder") int displayOrder);
}
