package vn.cas.common.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import vn.cas.common.security.OperationalPrincipal;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class HttpAccessLogFilter extends OncePerRequestFilter {

    private static final Logger LOGGER = LoggerFactory.getLogger(HttpAccessLogFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        long startedAt = System.nanoTime();
        try {
            filterChain.doFilter(request, response);
        } finally {
            OperationalPrincipal principal = (OperationalPrincipal) request
                    .getAttribute(OperationalPrincipal.class.getName());
            LOGGER.info(
                    "HTTP request completed: requestId={}, method={}, path={}, status={}, durationMs={}, accountId={}, storeId={}",
                    request.getAttribute(RequestId.ATTRIBUTE_NAME), request.getMethod(),
                    request.getRequestURI(), response.getStatus(),
                    TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startedAt),
                    principal == null ? null : principal.accountId(),
                    principal == null ? null : principal.storeId());
        }
    }
}
