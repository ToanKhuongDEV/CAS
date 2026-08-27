package vn.cas.store.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import vn.cas.store.dto.CreateClientAccountCommand;
import vn.cas.store.dto.CustomerTableSessionResolutionCommand;
import vn.cas.store.mapper.DiningTableMapper;
import vn.cas.store.model.CustomerTableSessionLookup;
import vn.cas.store.model.CustomerTableSessionResolution.ResolutionStatus;

class CustomerTableSessionServiceTest {

    private final DiningTableMapper diningTableMapper = mock(DiningTableMapper.class);
    private final CustomerTableSessionService service = new CustomerTableSessionService(
            diningTableMapper);

    @Test
    void shouldRequireCustomerInformationWhenTableHasNoOpenSession() {
        when(diningTableMapper.findTableSessionByActiveQrTokenForUpdate("a".repeat(64)))
                .thenReturn(new CustomerTableSessionLookup(1L, 9L, 2L, 5L, null, null));

        var result = service
                .resolveQr(new CustomerTableSessionResolutionCommand("a".repeat(64), null, null));

        assertThat(result.status()).isEqualTo(ResolutionStatus.CUSTOMER_INFORMATION_REQUIRED);
        assertThat(result.tableCode()).isEqualTo(5L);
        verify(diningTableMapper, never()).insertClientAccount(any());
    }

    @Test
    void shouldJoinExistingOpenSessionWithoutCustomerInformation() {
        when(diningTableMapper.findTableSessionByActiveQrTokenForUpdate("a".repeat(64))).thenReturn(
                new CustomerTableSessionLookup(1L, 9L, 2L, 5L, "session-public-id", "OPEN"));

        var result = service
                .resolveQr(new CustomerTableSessionResolutionCommand("a".repeat(64), null, null));

        assertThat(result.status()).isEqualTo(ResolutionStatus.OPEN);
        assertThat(result.sessionPublicId()).isEqualTo("session-public-id");
        verify(diningTableMapper, never()).insertClientAccount(any());
    }

    @Test
    void shouldCreateOpenSessionForFirstCustomer() {
        when(diningTableMapper.findTableSessionByActiveQrTokenForUpdate("a".repeat(64)))
                .thenReturn(new CustomerTableSessionLookup(1L, 9L, 2L, 5L, null, null));
        doAnswer(invocation -> {
            invocation.getArgument(0, CreateClientAccountCommand.class).setId(23L);
            return 1;
        }).when(diningTableMapper).insertClientAccount(any());

        var result = service.resolveQr(new CustomerTableSessionResolutionCommand("a".repeat(64),
                "Customer One", "0901234567"));

        assertThat(result.status()).isEqualTo(ResolutionStatus.OPEN);
        assertThat(result.sessionPublicId()).isNotBlank();
        verify(diningTableMapper).insertOpenCustomerTableSession(anyLong(), any(), anyLong(), any(),
                any());
    }

    @Test
    void shouldReturnCurrentSessionFromItsPublicId() {
        when(diningTableMapper.findCurrentTableSessionByPublicId("session-public-id")).thenReturn(
                new CustomerTableSessionLookup(1L, 9L, 2L, 5L, "session-public-id", "OPEN"));

        var result = service.getCurrent("session-public-id");

        assertThat(result.status()).isEqualTo(ResolutionStatus.OPEN);
        assertThat(result.tableCode()).isEqualTo(5L);
    }
}
