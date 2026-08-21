package vn.cas.store.dto;

public record CustomerTableSessionResolutionCommand(
    String qrToken, String customerName, String customerPhone) {}
