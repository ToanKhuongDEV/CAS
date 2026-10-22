package vn.cas.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import vn.cas.common.constants.ApiMessages;
import vn.cas.operation.mapper.OperationalAccountMapper;
import vn.cas.store.mapper.StoreSettingsMapper;
import vn.cas.operation.service.firebase.FirebaseTokenVerifier;

@Component
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final FirebaseTokenVerifier firebaseTokenVerifier;
    private final OperationalAccountMapper operationalAccountMapper;
    private final StoreSettingsMapper storeSettingsMapper;
    private final ApiAuthenticationEntryPoint authenticationEntryPoint;

    public FirebaseAuthenticationFilter(FirebaseTokenVerifier firebaseTokenVerifier,
            OperationalAccountMapper operationalAccountMapper,
            StoreSettingsMapper storeSettingsMapper,
            ApiAuthenticationEntryPoint authenticationEntryPoint) {
        this.firebaseTokenVerifier = firebaseTokenVerifier;
        this.operationalAccountMapper = operationalAccountMapper;
        this.storeSettingsMapper = storeSettingsMapper;
        this.authenticationEntryPoint = authenticationEntryPoint;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String token = extractBearerToken(request);
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String firebaseUid = firebaseTokenVerifier.verifyAndGetUid(token);
            var account = operationalAccountMapper.findActiveByFirebaseUid(firebaseUid).orElseThrow(
                    () -> new BadCredentialsException(ApiMessages.OPERATIONAL_ACCOUNT_UNAVAILABLE));
            var principal = selectedStorePrincipal(request, OperationalPrincipal.from(account));
            request.setAttribute(OperationalPrincipal.class.getName(), principal);
            var authentication = new UsernamePasswordAuthenticationToken(principal, null,
                    AuthorityUtils.createAuthorityList("ROLE_" + principal.role()));
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            operationalAccountMapper.updateLastLoginAt(account.id(),
                    LocalDateTime.now(BUSINESS_ZONE));
            filterChain.doFilter(request, response);
        } catch (AuthenticationException exception) {
            SecurityContextHolder.clearContext();
            authenticationEntryPoint.commence(request, response, exception);
        }
    }

    private OperationalPrincipal selectedStorePrincipal(HttpServletRequest request,
            OperationalPrincipal principal) {
        String selectedStore = request.getHeader("X-CAS-Store-Id");
        if (selectedStore == null || selectedStore.isBlank())
            return principal;
        if (!"SUPER_ADMIN".equals(principal.role()))
            throw new BadCredentialsException("Chỉ SUPER_ADMIN được đổi cơ sở quản trị.");
        try {
            long storeId = Long.parseLong(selectedStore);
            if (storeId <= 0 || storeSettingsMapper.findByStoreId(storeId) == null)
                throw new BadCredentialsException("Không tìm thấy cơ sở được chọn.");
            return new OperationalPrincipal(principal.accountId(), storeId, principal.firebaseUid(),
                    principal.displayName(), principal.role());
        } catch (NumberFormatException exception) {
            throw new BadCredentialsException("Cơ sở được chọn không hợp lệ.", exception);
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
