package vn.cas.catalog.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.cas.catalog.model.*;
import vn.cas.catalog.service.*;
import vn.cas.common.constants.ApiPaths;
import vn.cas.common.response.*;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.common.web.RequestId;
import vn.cas.store.service.CustomerTableSessionService;

@RestController
public class CatalogController {
  private final CatalogService catalog;
  private final CloudinarySignatureService cloudinary;
  private final CustomerTableSessionService sessions;

  public CatalogController(
      CatalogService catalog,
      CloudinarySignatureService cloudinary,
      CustomerTableSessionService sessions) {
    this.catalog = catalog;
    this.cloudinary = cloudinary;
    this.sessions = sessions;
  }

  @GetMapping(ApiPaths.Catalog.ADMIN + "/categories")
  public ResponseEntity<ApiResponse<List<CatalogCategory>>> adminCategories(
      @AuthenticationPrincipal OperationalPrincipal p, HttpServletRequest r) {
    return ok(catalog.categories(p.storeId(), false), r);
  }

  @PostMapping(ApiPaths.Catalog.ADMIN + "/categories")
  public ResponseEntity<ApiResponse<Void>> createCategory(
      @AuthenticationPrincipal OperationalPrincipal p,
      @Valid @RequestBody CategoryRequest b,
      HttpServletRequest r) {
    catalog.createCategory(
        p, b.name(), b.description(), b.categoryType(), b.displayOrder(), b.status(), rid(r));
    return created(r);
  }

  @PutMapping(ApiPaths.Catalog.ADMIN + "/categories/{id}")
  public ResponseEntity<ApiResponse<Void>> updateCategory(
      @AuthenticationPrincipal OperationalPrincipal p,
      @Positive @PathVariable long id,
      @Valid @RequestBody UpdateCategoryRequest b,
      HttpServletRequest r) {
    catalog.updateCategory(p, id, b.name(), b.description(), b.displayOrder(), b.status(), rid(r));
    return ok(null, r);
  }

  @DeleteMapping(ApiPaths.Catalog.ADMIN + "/categories/{id}")
  public ResponseEntity<ApiResponse<Void>> deleteCategory(
      @AuthenticationPrincipal OperationalPrincipal p,
      @Positive @PathVariable long id,
      HttpServletRequest r) {
    catalog.deleteCategory(p, id, rid(r));
    return ok(null, r);
  }

  @GetMapping(ApiPaths.Catalog.ADMIN + "/tags")
  public ResponseEntity<ApiResponse<List<CatalogTag>>> adminTags(
      @AuthenticationPrincipal OperationalPrincipal p, HttpServletRequest r) {
    return ok(catalog.tags(p.storeId(), false), r);
  }

  @PostMapping(ApiPaths.Catalog.ADMIN + "/tags")
  public ResponseEntity<ApiResponse<Void>> createTag(
      @AuthenticationPrincipal OperationalPrincipal p,
      @Valid @RequestBody TagRequest b,
      HttpServletRequest r) {
    catalog.createTag(p, b.name(), b.status(), rid(r));
    return created(r);
  }

  @PutMapping(ApiPaths.Catalog.ADMIN + "/tags/{id}")
  public ResponseEntity<ApiResponse<Void>> updateTag(
      @AuthenticationPrincipal OperationalPrincipal p,
      @Positive @PathVariable long id,
      @Valid @RequestBody TagRequest b,
      HttpServletRequest r) {
    catalog.updateTag(p, id, b.name(), b.status(), rid(r));
    return ok(null, r);
  }

  @DeleteMapping(ApiPaths.Catalog.ADMIN + "/tags/{id}")
  public ResponseEntity<ApiResponse<Void>> deleteTag(
      @AuthenticationPrincipal OperationalPrincipal p,
      @Positive @PathVariable long id,
      HttpServletRequest r) {
    catalog.deleteTag(p, id, rid(r));
    return ok(null, r);
  }

  @GetMapping(ApiPaths.Catalog.ADMIN + "/option-groups")
  public ResponseEntity<ApiResponse<List<CatalogOptionGroup>>> groups(
      @AuthenticationPrincipal OperationalPrincipal p, HttpServletRequest r) {
    return ok(catalog.optionGroups(p.storeId(), false), r);
  }

  @PostMapping(ApiPaths.Catalog.ADMIN + "/option-groups")
  public ResponseEntity<ApiResponse<Void>> createGroup(
      @AuthenticationPrincipal OperationalPrincipal p,
      @Valid @RequestBody OptionGroupRequest b,
      HttpServletRequest r) {
    catalog.createGroup(
        p,
        b.name(),
        b.selectionType(),
        b.minSelect(),
        b.maxSelect(),
        b.displayOrder(),
        b.status(),
        rid(r));
    return created(r);
  }

  @PutMapping(ApiPaths.Catalog.ADMIN + "/option-groups/{id}")
  public ResponseEntity<ApiResponse<Void>> updateGroup(
      @AuthenticationPrincipal OperationalPrincipal p,
      @Positive @PathVariable long id,
      @Valid @RequestBody OptionGroupRequest b,
      HttpServletRequest r) {
    catalog.updateGroup(
        p,
        id,
        b.name(),
        b.selectionType(),
        b.minSelect(),
        b.maxSelect(),
        b.displayOrder(),
        b.status(),
        rid(r));
    return ok(null, r);
  }

  @DeleteMapping(ApiPaths.Catalog.ADMIN + "/option-groups/{id}")
  public ResponseEntity<ApiResponse<Void>> deleteGroup(
      @AuthenticationPrincipal OperationalPrincipal p,
      @Positive @PathVariable long id,
      HttpServletRequest r) {
    catalog.deleteGroup(p, id, rid(r));
    return ok(null, r);
  }

  @PostMapping(ApiPaths.Catalog.ADMIN + "/option-groups/{id}/values")
  public ResponseEntity<ApiResponse<Void>> createValue(
      @AuthenticationPrincipal OperationalPrincipal p,
      @Positive @PathVariable long id,
      @Valid @RequestBody OptionValueRequest b,
      HttpServletRequest r) {
    catalog.createValue(
        p, id, b.name(), b.extraPrice(), b.isDefault(), b.displayOrder(), b.status(), rid(r));
    return created(r);
  }

  @DeleteMapping(ApiPaths.Catalog.ADMIN + "/option-values/{id}")
  public ResponseEntity<ApiResponse<Void>> deleteValue(
      @AuthenticationPrincipal OperationalPrincipal p,
      @Positive @PathVariable long id,
      HttpServletRequest r) {
    catalog.deleteValue(p, id, rid(r));
    return ok(null, r);
  }

  @GetMapping(ApiPaths.Catalog.ADMIN + "/items")
  public ResponseEntity<ApiResponse<List<CatalogMenuItem>>> items(
      @AuthenticationPrincipal OperationalPrincipal p, HttpServletRequest r) {
    return ok(catalog.items(p.storeId(), false), r);
  }

  @GetMapping(ApiPaths.Catalog.ADMIN + "/items/{id}")
  public ResponseEntity<ApiResponse<CatalogMenuItem>> item(
      @AuthenticationPrincipal OperationalPrincipal p,
      @Positive @PathVariable long id,
      HttpServletRequest r) {
    return ok(catalog.item(p.storeId(), id, false), r);
  }

  @PostMapping(ApiPaths.Catalog.ADMIN + "/items")
  public ResponseEntity<ApiResponse<Void>> createItem(
      @AuthenticationPrincipal OperationalPrincipal p,
      @Valid @RequestBody MenuItemRequest b,
      HttpServletRequest r) {
    catalog.createItem(p, b.command(), rid(r));
    return created(r);
  }

  @PutMapping(ApiPaths.Catalog.ADMIN + "/items/{id}")
  public ResponseEntity<ApiResponse<Void>> updateItem(
      @AuthenticationPrincipal OperationalPrincipal p,
      @Positive @PathVariable long id,
      @Valid @RequestBody MenuItemRequest b,
      HttpServletRequest r) {
    catalog.updateItem(p, id, b.command(), rid(r));
    return ok(null, r);
  }

  @PatchMapping(ApiPaths.Catalog.ADMIN + "/items/bulk-status")
  public ResponseEntity<ApiResponse<Void>> bulk(
      @AuthenticationPrincipal OperationalPrincipal p,
      @Valid @RequestBody BulkStatusRequest b,
      HttpServletRequest r) {
    catalog.bulkStatus(p, b.itemIds(), b.status(), rid(r));
    return ok(null, r);
  }

  @PostMapping(ApiPaths.Catalog.ADMIN + "/images/upload-signature")
  public ResponseEntity<ApiResponse<CloudinarySignatureService.UploadSignature>> sign(
      @AuthenticationPrincipal OperationalPrincipal p, HttpServletRequest r) {
    return ok(cloudinary.sign(p.storeId()), r);
  }

  @GetMapping(ApiPaths.Catalog.OPERATOR + "/items")
  public ResponseEntity<ApiResponse<List<CatalogMenuItem>>> operatorItems(
      @AuthenticationPrincipal OperationalPrincipal p, HttpServletRequest r) {
    return ok(catalog.items(p.storeId(), true), r);
  }

  @GetMapping(ApiPaths.Catalog.OPERATOR + "/categories")
  public ResponseEntity<ApiResponse<List<CatalogCategory>>> operatorCategories(
      @AuthenticationPrincipal OperationalPrincipal p, HttpServletRequest r) {
    return ok(catalog.categories(p.storeId(), true), r);
  }

  @GetMapping(ApiPaths.Catalog.OPERATOR + "/tags")
  public ResponseEntity<ApiResponse<List<CatalogTag>>> operatorTags(
      @AuthenticationPrincipal OperationalPrincipal p, HttpServletRequest r) {
    return ok(catalog.tags(p.storeId(), true), r);
  }

  @GetMapping(ApiPaths.Catalog.OPERATOR + "/items/{id}")
  public ResponseEntity<ApiResponse<CatalogMenuItem>> operatorItem(
      @AuthenticationPrincipal OperationalPrincipal p,
      @Positive @PathVariable long id,
      HttpServletRequest r) {
    return ok(catalog.item(p.storeId(), id, true), r);
  }

  @GetMapping(ApiPaths.Catalog.CUSTOMER + "/items")
  public ResponseEntity<ApiResponse<List<CatalogMenuItem>>> customerItems(
      @CookieValue(name = "cas_customer_session", required = false) String s,
      HttpServletRequest r) {
    return ok(catalog.items(sessions.getCurrentStoreId(s), true), r);
  }

  @GetMapping(ApiPaths.Catalog.CUSTOMER + "/categories")
  public ResponseEntity<ApiResponse<List<CatalogCategory>>> customerCategories(
      @CookieValue(name = "cas_customer_session", required = false) String s,
      HttpServletRequest r) {
    return ok(catalog.categories(sessions.getCurrentStoreId(s), true), r);
  }

  @GetMapping(ApiPaths.Catalog.CUSTOMER + "/tags")
  public ResponseEntity<ApiResponse<List<CatalogTag>>> customerTags(
      @CookieValue(name = "cas_customer_session", required = false) String s,
      HttpServletRequest r) {
    return ok(catalog.tags(sessions.getCurrentStoreId(s), true), r);
  }

  @GetMapping(ApiPaths.Catalog.CUSTOMER + "/items/{id}")
  public ResponseEntity<ApiResponse<CatalogMenuItem>> customerItem(
      @CookieValue(name = "cas_customer_session", required = false) String s,
      @Positive @PathVariable long id,
      HttpServletRequest r) {
    return ok(catalog.item(sessions.getCurrentStoreId(s), id, true), r);
  }

  private static UUID rid(HttpServletRequest r) {
    return (UUID) r.getAttribute(RequestId.ATTRIBUTE_NAME);
  }

  private static <T> ResponseEntity<ApiResponse<T>> ok(T d, HttpServletRequest r) {
    return ApiResponses.success(HttpStatus.OK, "Thành công.", d, r);
  }

  private static ResponseEntity<ApiResponse<Void>> created(HttpServletRequest r) {
    return ApiResponses.success(HttpStatus.CREATED, "Đã lưu dữ liệu thực đơn.", null, r);
  }

  public record CategoryRequest(
      @NotBlank @Size(max = 150) String name,
      @Size(max = 65535) String description,
      @Pattern(regexp = "REGULAR|OPTION") String categoryType,
      @PositiveOrZero int displayOrder,
      @Pattern(regexp = "ACTIVE|INACTIVE") String status) {}

  public record UpdateCategoryRequest(
      @NotBlank @Size(max = 150) String name,
      @Size(max = 65535) String description,
      @PositiveOrZero int displayOrder,
      @Pattern(regexp = "ACTIVE|INACTIVE") String status) {}

  public record TagRequest(
      @NotBlank @Size(max = 150) String name, @Pattern(regexp = "ACTIVE|INACTIVE") String status) {}

  public record OptionGroupRequest(
      @NotBlank @Size(max = 150) String name,
      @Pattern(regexp = "SINGLE|MULTIPLE") String selectionType,
      @PositiveOrZero int minSelect,
      @PositiveOrZero Integer maxSelect,
      @PositiveOrZero int displayOrder,
      @Pattern(regexp = "ACTIVE|INACTIVE") String status) {}

  public record OptionValueRequest(
      @NotBlank @Size(max = 150) String name,
      @NotNull @DecimalMin("0.00") BigDecimal extraPrice,
      boolean isDefault,
      @PositiveOrZero int displayOrder,
      @Pattern(regexp = "ACTIVE|INACTIVE") String status) {}

  public record MenuItemRequest(
      @Positive long categoryId,
      @NotBlank @Size(max = 150) String name,
      @Size(max = 65535) String description,
      @NotNull @DecimalMin("0.00") BigDecimal price,
      @Size(max = 2048) String imageUrl,
      @Size(max = 512) String imageStorageKey,
      @Pattern(regexp = "ACTIVE|INACTIVE|SOLD_OUT") String availabilityStatus,
      @PositiveOrZero int displayOrder,
      List<@Positive Long> tagIds,
      List<@Valid OptionGroupLinkRequest> optionGroups) {
    CatalogService.MenuCommand command() {
      return new CatalogService.MenuCommand(
          categoryId,
          name,
          description,
          price,
          imageUrl,
          imageStorageKey,
          availabilityStatus,
          displayOrder,
          tagIds == null ? List.of() : tagIds,
          optionGroups == null
              ? List.of()
              : optionGroups.stream()
                  .map(x -> new CatalogService.OptionGroupLink(x.optionGroupId(), x.displayOrder()))
                  .toList());
    }
  }

  public record OptionGroupLinkRequest(
      @Positive long optionGroupId, @PositiveOrZero int displayOrder) {}

  public record BulkStatusRequest(
      @NotEmpty List<@Positive Long> itemIds,
      @Pattern(regexp = "ACTIVE|INACTIVE|SOLD_OUT") String status) {}
}
