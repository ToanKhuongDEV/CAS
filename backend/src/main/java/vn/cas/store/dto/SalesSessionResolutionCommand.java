package vn.cas.store.dto;

public record SalesSessionResolutionCommand(String qrToken, String customerName,
        String customerPhone) {
}
