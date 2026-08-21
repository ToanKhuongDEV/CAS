package vn.cas.common.web;

import java.util.UUID;

public final class RequestId {

    public static final String HEADER_NAME = "X-Request-Id";
    public static final String ATTRIBUTE_NAME = RequestId.class.getName();

    private RequestId() {
    }

    public static UUID from(String value) {
        if (value == null || value.isBlank()) {
            return UUID.randomUUID();
        }

        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException exception) {
            return UUID.randomUUID();
        }
    }
}
