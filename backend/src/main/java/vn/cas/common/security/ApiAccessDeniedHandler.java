package vn.cas.common.security;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import vn.cas.common.constants.ApiMessages;
import vn.cas.common.web.RequestId;

@Component
public class ApiAccessDeniedHandler implements AccessDeniedHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(ApiAccessDeniedHandler.class);

    private final ApiAuthenticationEntryPoint errorWriter;

    public ApiAccessDeniedHandler(ApiAuthenticationEntryPoint errorWriter) {
        this.errorWriter = errorWriter;
    }

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException) throws IOException, ServletException {
        LOGGER.warn(
                "Access denied: requestId={}, method={}, path={}",
                request.getAttribute(RequestId.ATTRIBUTE_NAME),
                request.getMethod(),
                request.getRequestURI());
        errorWriter.writeError(
                response,
                request,
                HttpStatus.FORBIDDEN,
                ApiMessages.FORBIDDEN);
    }
}
