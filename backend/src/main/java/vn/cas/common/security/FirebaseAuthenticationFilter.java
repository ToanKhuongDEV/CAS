package vn.cas.common.security;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import vn.cas.operation.service.firebase.FirebaseTokenVerifier;
import vn.cas.operation.mapper.OperationalAccountMapper;
import vn.cas.common.constants.ApiMessages;

@Component
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final FirebaseTokenVerifier firebaseTokenVerifier;
    private final OperationalAccountMapper operationalAccountMapper;
    private final ApiAuthenticationEntryPoint authenticationEntryPoint;

    public FirebaseAuthenticationFilter(
            FirebaseTokenVerifier firebaseTokenVerifier,
            OperationalAccountMapper operationalAccountMapper,
            ApiAuthenticationEntryPoint authenticationEntryPoint) {
        this.firebaseTokenVerifier = firebaseTokenVerifier;
        this.operationalAccountMapper = operationalAccountMapper;
        this.authenticationEntryPoint = authenticationEntryPoint;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String token = extractBearerToken(request);
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String firebaseUid = firebaseTokenVerifier.verifyAndGetUid(token);
            var account = operationalAccountMapper.findActiveByFirebaseUid(firebaseUid)
                    .orElseThrow(() -> new BadCredentialsException(ApiMessages.OPERATIONAL_ACCOUNT_UNAVAILABLE));
            var principal = OperationalPrincipal.from(account);
            var authentication = new UsernamePasswordAuthenticationToken(
                    principal,
                    null,
                    AuthorityUtils.createAuthorityList("ROLE_" + principal.role()));
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            operationalAccountMapper.updateLastLoginAt(account.id(), LocalDateTime.now(BUSINESS_ZONE));
            filterChain.doFilter(request, response);
        } catch (AuthenticationException exception) {
            SecurityContextHolder.clearContext();
            authenticationEntryPoint.commence(request, response, exception);
        }
    }

    private String extractBearerToken(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith(BEARER_PREFIX)) {
            return null;
        }
        String token = authorization.substring(BEARER_PREFIX.length()).trim();
        return token.isEmpty() ? null : token;
    }
}
