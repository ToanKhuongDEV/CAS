package vn.cas.common.web;

import java.time.OffsetDateTime;
import java.time.ZoneId;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import vn.cas.common.contract.ApiMessages;
import vn.cas.common.contract.ApiPaths;

@RestController
@RequestMapping(ApiPaths.STATUS)
public class SystemStatusController {

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final String applicationName;

    public SystemStatusController(@Value("${spring.application.name}") String applicationName) {
        this.applicationName = applicationName;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<SystemStatusResponse>> getStatus(HttpServletRequest request) {
        return ApiResponses.success(
                HttpStatus.OK,
                ApiMessages.SERVICE_STATUS_RETRIEVED,
                new SystemStatusResponse(
                        applicationName,
                        ApiMessages.SERVICE_STATUS_UP,
                        OffsetDateTime.now(BUSINESS_ZONE)),
                request);
    }

    public record SystemStatusResponse(
            String service,
            String status,
            OffsetDateTime timestamp) {
    }
}
