package vn.cas.ordering.model;

public record PreparationOptionRow(long orderItemId, String groupName, String optionName,
        int quantityPerItem) {
}
