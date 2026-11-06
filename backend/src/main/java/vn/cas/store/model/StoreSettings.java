package vn.cas.store.model;

import java.math.BigDecimal;
import java.time.LocalTime;

public record StoreSettings(long id, String branchName, String address, String phone, String email,
        String logoUrl, String logoStorageKey, String googleMapsLocation, BigDecimal latitude,
        BigDecimal longitude, LocalTime openTime, LocalTime closeTime, String welcomeSlogan,
        String status, String brandName) {
}
