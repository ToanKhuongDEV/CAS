package vn.cas.common.response;

import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import vn.cas.common.web.RequestId;

public final class ApiResponses {

    private ApiResponses() {
    }

    public static <T> ResponseEntity<ApiResponse<T>> success(HttpStatus status, String message,
            T data, HttpServletRequest request) {
        UUID requestId = (UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME);
        return ResponseEntity.status(status).body(new ApiResponse<>(status.value(), message, data,
                requestId == null ? null : requestId.toString()));
    }
}
