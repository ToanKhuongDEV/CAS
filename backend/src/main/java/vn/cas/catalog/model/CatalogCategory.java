package vn.cas.catalog.model;

public record CatalogCategory(long id, String name, String description, String categoryType, int displayOrder, String status) { }
