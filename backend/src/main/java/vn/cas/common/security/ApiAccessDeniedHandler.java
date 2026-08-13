package vn.cas.common.security;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import vn.cas.common.contract.ApiMessages;

@Component
public class ApiAccessDeniedHandler implements AccessDeniedHandler {

    private final ApiAuthenticationEntryPoint errorWriter;

    public ApiAccessDeniedHandler(ApiAuthenticationEntryPoint errorWriter) {
        this.errorWriter = errorWriter;
    }

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException) throws IOException, ServletException {
        errorWriter.writeError(
                response,
                request,
                HttpStatus.FORBIDDEN,
                ApiMessages.FORBIDDEN);
    }
}
