package vn.cas.store.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.constants.ApiPaths;
import vn.cas.common.response.ApiResponse;
import vn.cas.common.response.ApiResponses;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.common.web.RequestId;
import vn.cas.store.service.LongWaitWarningSettingService;

@RestController
@RequestMapping(ApiPaths.Store.LONG_WAIT_WARNING)
public class LongWaitWarningSettingController {

  private final LongWaitWarningSettingService settingService;

  public LongWaitWarningSettingController(LongWaitWarningSettingService settingService) {
    this.settingService = settingService;
  }

  @GetMapping
  public ResponseEntity<ApiResponse<LongWaitWarningSettingResponse>> get(
      @AuthenticationPrincipal OperationalPrincipal principal, HttpServletRequest request) {
    var setting = settingService.get(principal.storeId());
    return ApiResponses.success(
        HttpStatus.OK,
        ApiMessages.LONG_WAIT_WARNING_SETTING_RETRIEVED,
        new LongWaitWarningSettingResponse(setting.longWaitWarningMinutes()),
        request);
  }

  @PutMapping
  public ResponseEntity<ApiResponse<LongWaitWarningSettingResponse>> update(
      @AuthenticationPrincipal OperationalPrincipal principal,
      @Valid @RequestBody UpdateLongWaitWarningSettingRequest updateRequest,
      HttpServletRequest request) {
    var setting =
        settingService.update(
            principal,
            updateRequest.longWaitWarningMinutes(),
            (java.util.UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME));
    return ApiResponses.success(
        HttpStatus.OK,
        ApiMessages.LONG_WAIT_WARNING_SETTING_UPDATED,
        new LongWaitWarningSettingResponse(setting.longWaitWarningMinutes()),
        request);
  }

  public record UpdateLongWaitWarningSettingRequest(
      @NotNull @Min(0) @Max(1440) Integer longWaitWarningMinutes) {}

  public record LongWaitWarningSettingResponse(int longWaitWarningMinutes) {}
}
