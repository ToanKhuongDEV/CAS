package vn.cas.common.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import vn.cas.common.web.RequestId;
import vn.cas.operation.mapper.OperationalAccountMapper;
import vn.cas.operation.model.AccountRole;
import vn.cas.operation.model.OperationalAccount;
import vn.cas.operation.service.firebase.FirebaseTokenVerifier;

class FirebaseAuthenticationFilterTest {

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldAuthenticateUsingRoleLoadedFromOperationalAccount() throws Exception {
        FirebaseTokenVerifier tokenVerifier = token -> "firebase-user-1";
        OperationalAccountMapper accountMapper = mock(OperationalAccountMapper.class);
        when(accountMapper.findActiveByFirebaseUid("firebase-user-1")).thenReturn(Optional
                .of(new OperationalAccount(7L, 2L, "firebase-user-1", "operator@example.com",
                        "0901234567", "Operator One", AccountRole.OPERATOR)));
        var filter = new FirebaseAuthenticationFilter(tokenVerifier, accountMapper,
                new ApiAuthenticationEntryPoint(new ObjectMapper().findAndRegisterModules()));
        var request = authenticatedRequest();
        var response = new MockHttpServletResponse();
        var chainCalled = new AtomicBoolean();
        var requestPrincipal = new AtomicReference<Object>();

        filter.doFilter(request, response, (servletRequest, servletResponse) -> {
            chainCalled.set(true);
            requestPrincipal.set(servletRequest.getAttribute(OperationalPrincipal.class.getName()));
        });

        assertThat(chainCalled).isTrue();
        assertThat(requestPrincipal.get()).isInstanceOf(OperationalPrincipal.class);
        assertThat(SecurityContextHolder.getContext().getAuthentication().getAuthorities())
                .extracting("authority").containsExactly("ROLE_OPERATOR");
        verify(accountMapper).updateLastLoginAt(any(Long.class), any());
    }

    @Test
    void shouldRejectTokenWhenNoActiveOperationalAccountExists() throws Exception {
        FirebaseTokenVerifier tokenVerifier = token -> "unknown-user";
        OperationalAccountMapper accountMapper = mock(OperationalAccountMapper.class);
        when(accountMapper.findActiveByFirebaseUid("unknown-user")).thenReturn(Optional.empty());
        var filter = new FirebaseAuthenticationFilter(tokenVerifier, accountMapper,
                new ApiAuthenticationEntryPoint(new ObjectMapper().findAndRegisterModules()));
        var request = authenticatedRequest();
        var response = new MockHttpServletResponse();
        var chainCalled = new AtomicBoolean();

        filter.doFilter(request, response,
                (servletRequest, servletResponse) -> chainCalled.set(true));

        assertThat(chainCalled).isFalse();
        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getContentAsString()).contains("Vui lòng đăng nhập để tiếp tục.");
    }

    private MockHttpServletRequest authenticatedRequest() {
        var request = new MockHttpServletRequest("GET", "/api/v1/operation/example");
        request.addHeader("Authorization", "Bearer firebase-token");
        request.setAttribute(RequestId.ATTRIBUTE_NAME, UUID.randomUUID());
        return request;
    }
}
