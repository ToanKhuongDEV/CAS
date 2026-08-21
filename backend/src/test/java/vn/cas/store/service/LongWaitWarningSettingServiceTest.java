package vn.cas.store.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.dto.AuditLogCommand;
import vn.cas.operation.service.AuditLogService;
import vn.cas.store.mapper.StoreSettingsMapper;

class LongWaitWarningSettingServiceTest {

  private final StoreSettingsMapper storeSettingsMapper = mock(StoreSettingsMapper.class);
  private final AuditLogService auditLogService = mock(AuditLogService.class);
  private final LongWaitWarningSettingService service =
      new LongWaitWarningSettingService(storeSettingsMapper, auditLogService);

  @Test
  void shouldUseStoredLongWaitWarningMinutesWhenValueIsValid() {
    when(storeSettingsMapper.findLongWaitWarningMinutesByStoreId(2L)).thenReturn(Optional.of(0));

    var setting = service.get(2L);

    assertThat(setting.longWaitWarningMinutes()).isZero();
  }

  @Test
  void shouldUseFallbackWhenStoredLongWaitWarningMinutesIsUnavailable() {
    when(storeSettingsMapper.findLongWaitWarningMinutesByStoreId(2L)).thenReturn(Optional.empty());

    var setting = service.get(2L);

    assertThat(setting.longWaitWarningMinutes())
        .isEqualTo(LongWaitWarningSettingService.FALLBACK_LONG_WAIT_WARNING_MINUTES);
  }

  @Test
  void shouldUpdateSettingAndRecordAuditLog() {
    var principal = new OperationalPrincipal(7L, 2L, "firebase-user-1", "Admin One", "ADMIN");
    UUID requestId = UUID.randomUUID();

    var setting = service.update(principal, 30, requestId);

    assertThat(setting.longWaitWarningMinutes()).isEqualTo(30);
    verify(storeSettingsMapper).updateLongWaitWarningMinutes(2L, 30);

    ArgumentCaptor<AuditLogCommand> auditCommandCaptor =
        ArgumentCaptor.forClass(AuditLogCommand.class);
    verify(auditLogService).record(auditCommandCaptor.capture());
    var auditCommand = auditCommandCaptor.getValue();
    assertThat(auditCommand.storeId()).isEqualTo(2L);
    assertThat(auditCommand.requestId()).isEqualTo(requestId);
    assertThat(auditCommand.action()).isEqualTo("UPDATE");
    assertThat(auditCommand.entityType()).isEqualTo("STORE_SETTINGS");
    assertThat(auditCommand.changeData()).isEqualTo("{\"longWaitWarningMinutes\":30}");
    assertThat(auditCommand.actorAccountId()).isEqualTo(7L);
  }
}
