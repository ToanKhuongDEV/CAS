package vn.cas.common.web;

public record ApiResponse<T>(
        int status,
        String message,
        T data,
        String requestId) {
}
