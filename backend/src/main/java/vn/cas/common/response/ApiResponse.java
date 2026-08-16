package vn.cas.common.response;

public record ApiResponse<T>(
        int status,
        String message,
        T data,
        String requestId) {
}
