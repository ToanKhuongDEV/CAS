package vn.cas.common.web;

import java.util.UUID;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public final class ApiResponses {

    private ApiResponses() {
    }

    public static <T> ResponseEntity<ApiResponse<T>> success(
            HttpStatus status,
            String message,
            T data,
            HttpServletRequest request) {
        UUID requestId = (UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME);
        return ResponseEntity.status(status).body(new ApiResponse<>(
                status.value(),
                message,
                data,
                requestId == null ? null : requestId.toString()));
    }
}
