package vn.cas.store.model;

import java.time.LocalTime;

public record StoreSettings(long id, String name, String address, String phone, String email,
        String logoUrl, String googleMapsLocation, LocalTime openTime, LocalTime closeTime,
        String welcomeSlogan, String status) {
}
