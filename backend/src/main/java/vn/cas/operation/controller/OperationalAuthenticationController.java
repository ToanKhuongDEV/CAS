package vn.cas.operation.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.cas.common.constants.ApiPaths;
import vn.cas.common.response.ApiResponse;
import vn.cas.common.response.ApiResponses;
import vn.cas.common.security.OperationalPrincipal;

@RestController
@RequestMapping(ApiPaths.Auth.CURRENT_ACCOUNT)
public class OperationalAuthenticationController {

  @GetMapping
  public ResponseEntity<ApiResponse<CurrentOperationalAccountResponse>> getCurrentAccount(
      @AuthenticationPrincipal OperationalPrincipal principal, HttpServletRequest request) {
    return ApiResponses.success(
        HttpStatus.OK,
        "Current operational account retrieved.",
        new CurrentOperationalAccountResponse(
            principal.accountId(), principal.storeId(), principal.displayName(), principal.role()),
        request);
  }

  public record CurrentOperationalAccountResponse(
      long accountId, long storeId, String displayName, String role) {}
}
