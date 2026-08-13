package vn.cas.common.security;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import vn.cas.common.web.ApiError;
import vn.cas.common.web.RequestId;
import vn.cas.common.contract.ApiMessages;

@Component
public class ApiAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final ObjectMapper objectMapper;

    public ApiAuthenticationEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authenticationException) throws IOException {
        writeError(
                response,
                request,
                HttpStatus.UNAUTHORIZED,
                ApiMessages.UNAUTHENTICATED);
    }

    void writeError(
            HttpServletResponse response,
            HttpServletRequest request,
            HttpStatus status,
            String message) throws IOException {
        UUID requestId = (UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME);
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), new ApiError(
                OffsetDateTime.now(BUSINESS_ZONE),
                status.value(),
                message,
                request.getRequestURI(),
                requestId == null ? null : requestId.toString(),
                Map.of()));
    }
}
