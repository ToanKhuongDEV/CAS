package vn.cas.common.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.response.ApiError;
import vn.cas.common.web.RequestId;

@Component
public class ApiAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final Logger LOGGER = LoggerFactory.getLogger(ApiAuthenticationEntryPoint.class);

    private final ObjectMapper objectMapper;

    public ApiAuthenticationEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException authenticationException) throws IOException {
        LOGGER.warn("Authentication failed: requestId={}, method={}, path={}, reason={}",
                request.getAttribute(RequestId.ATTRIBUTE_NAME), request.getMethod(),
                request.getRequestURI(), authenticationException.getClass().getSimpleName());
        writeError(response, request, HttpStatus.UNAUTHORIZED, ApiMessages.UNAUTHENTICATED);
    }

    void writeError(HttpServletResponse response, HttpServletRequest request, HttpStatus status,
            String message) throws IOException {
        UUID requestId = (UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME);
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(),
                new ApiError(OffsetDateTime.now(BUSINESS_ZONE), status.value(), message,
                        request.getRequestURI(), requestId == null ? null : requestId.toString(),
                        Map.of()));
    }
}
