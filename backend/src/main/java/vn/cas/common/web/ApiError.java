package vn.cas.common.web;

import java.time.OffsetDateTime;
import java.util.Map;

public record ApiError(
        OffsetDateTime timestamp,
        int status,
        String code,
        String message,
        String path,
        String requestId,
        Map<String, String> fieldErrors) {
}
