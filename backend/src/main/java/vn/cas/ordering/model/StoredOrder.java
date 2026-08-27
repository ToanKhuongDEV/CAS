package vn.cas.ordering.model;

import java.math.BigDecimal;

public record StoredOrder(String publicId, String requestFingerprint, BigDecimal payableAmount) {
}
