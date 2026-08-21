package vn.cas.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.response.ApiError;
import vn.cas.common.web.RequestId;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiError> handleApiException(ApiException exception,
            HttpServletRequest request) {
        logExpectedFailure(exception.status(), request, exception.getClass().getSimpleName());
        return response(exception.status(), exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException exception,
            HttpServletRequest request) {
        logExpectedFailure(HttpStatus.BAD_REQUEST, request, exception.getClass().getSimpleName());
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError error : exception.getBindingResult().getFieldErrors()) {
            fieldErrors.putIfAbsent(error.getField(), error.getDefaultMessage());
        }
        return response(HttpStatus.BAD_REQUEST, ApiMessages.VALIDATION_FAILED, request,
                fieldErrors);
    }

    @ExceptionHandler({ConstraintViolationException.class, HttpMessageNotReadableException.class})
    public ResponseEntity<ApiError> handleBadRequest(Exception exception,
            HttpServletRequest request) {
        logExpectedFailure(HttpStatus.BAD_REQUEST, request, exception.getClass().getSimpleName());
        return response(HttpStatus.BAD_REQUEST, ApiMessages.INVALID_REQUEST, request, Map.of());
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuthentication(AuthenticationException exception,
            HttpServletRequest request) {
        logExpectedFailure(HttpStatus.UNAUTHORIZED, request, exception.getClass().getSimpleName());
        return response(HttpStatus.UNAUTHORIZED, ApiMessages.UNAUTHENTICATED, request, Map.of());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException exception,
            HttpServletRequest request) {
        logExpectedFailure(HttpStatus.FORBIDDEN, request, exception.getClass().getSimpleName());
        return response(HttpStatus.FORBIDDEN, ApiMessages.FORBIDDEN, request, Map.of());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception exception,
            HttpServletRequest request) {
        LOGGER.error("Unhandled application error: requestId={}, method={}, path={}",
                request.getAttribute(RequestId.ATTRIBUTE_NAME), request.getMethod(),
                request.getRequestURI(), exception);
        return response(HttpStatus.INTERNAL_SERVER_ERROR, ApiMessages.INTERNAL_ERROR, request,
                Map.of());
    }

    private ResponseEntity<ApiError> response(HttpStatus status, String message,
            HttpServletRequest request, Map<String, String> fieldErrors) {
        UUID requestId = (UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME);
        return ResponseEntity.status(status)
                .body(new ApiError(OffsetDateTime.now(BUSINESS_ZONE), status.value(), message,
                        request.getRequestURI(), requestId == null ? null : requestId.toString(),
                        fieldErrors));
    }

    private void logExpectedFailure(HttpStatus status, HttpServletRequest request,
            String exceptionType) {
        LOGGER.warn(
                "API request failed: requestId={}, method={}, path={}, status={}, exceptionType={}",
                request.getAttribute(RequestId.ATTRIBUTE_NAME), request.getMethod(),
                request.getRequestURI(), status.value(), exceptionType);
    }
}
