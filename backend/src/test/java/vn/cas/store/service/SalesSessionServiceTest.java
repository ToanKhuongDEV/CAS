package vn.cas.store.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import vn.cas.store.dto.CreateClientAccountCommand;
import vn.cas.store.dto.SalesSessionResolutionCommand;
import vn.cas.store.mapper.DiningTableMapper;
import vn.cas.store.model.SalesSessionLookup;
import vn.cas.store.model.SalesSessionResolution.ResolutionStatus;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.service.AuditLogService;

class SalesSessionServiceTest {

    private final DiningTableMapper diningTableMapper = mock(DiningTableMapper.class);
    private final AuditLogService auditLogService = mock(AuditLogService.class);
    private final SalesSessionService service = new SalesSessionService(diningTableMapper,
            auditLogService);

    @Test
    void shouldRequireCustomerInformationWhenTableHasNoOpenSession() {
        when(diningTableMapper.findTableByActiveQrTokenForUpdate("a".repeat(64)))
                .thenReturn(new vn.cas.store.model.QrTableLookup(9L, 2L, 5L));
        when(diningTableMapper.findJoinableDineInSessionsByTableId(9L))
                .thenReturn(java.util.List.of());

        var result = service.resolveQr(
                new SalesSessionResolutionCommand("a".repeat(64), null, null, null, null));

        assertThat(result.status()).isEqualTo(ResolutionStatus.CUSTOMER_INFORMATION_REQUIRED);
        assertThat(result.tableCode()).isEqualTo(5L);
        verify(diningTableMapper, never()).insertClientAccount(any());
    }

    @Test
    void shouldRequireSessionSelectionWhenTableHasAnOpenSession() {
        when(diningTableMapper.findTableByActiveQrTokenForUpdate("a".repeat(64)))
                .thenReturn(new vn.cas.store.model.QrTableLookup(9L, 2L, 5L));
        when(diningTableMapper.findJoinableDineInSessionsByTableId(9L)).thenReturn(
                java.util.List.of(new vn.cas.store.model.JoinableSalesSession("session-public-id",
                        "Customer One", "OPEN")));

        var result = service.resolveQr(
                new SalesSessionResolutionCommand("a".repeat(64), null, null, null, null));

        assertThat(result.status()).isEqualTo(ResolutionStatus.JOIN_SESSION_REQUIRED);
        assertThat(result.joinableSessions()).singleElement()
                .extracting(vn.cas.store.model.JoinableSalesSession::customerName)
                .isEqualTo("Customer One");
        verify(diningTableMapper, never()).insertClientAccount(any());
    }

    @Test
    void shouldCreateOpenSessionForFirstCustomer() {
        when(diningTableMapper.findTableByActiveQrTokenForUpdate("a".repeat(64)))
                .thenReturn(new vn.cas.store.model.QrTableLookup(9L, 2L, 5L));
        when(diningTableMapper.findJoinableDineInSessionsByTableId(9L))
                .thenReturn(java.util.List.of());
        doAnswer(invocation -> {
            invocation.getArgument(0, CreateClientAccountCommand.class).setId(23L);
            return 1;
        }).when(diningTableMapper).insertClientAccount(any());

        var result = service.resolveQr(new SalesSessionResolutionCommand("a".repeat(64),
                "Customer One", "0901234567", "DINE_IN", null));

        assertThat(result.status()).isEqualTo(ResolutionStatus.OPEN);
        assertThat(result.sessionPublicId()).isNotBlank();
        verify(diningTableMapper).insertOpenDineInSalesSession(anyLong(), any(), anyLong(), any(),
                any());
    }

    @Test
    void shouldJoinTheSelectedSessionAtTheTable() {
        when(diningTableMapper.findTableByActiveQrTokenForUpdate("a".repeat(64)))
                .thenReturn(new vn.cas.store.model.QrTableLookup(9L, 2L, 5L));
        when(diningTableMapper.findJoinableDineInSessionsByTableId(9L)).thenReturn(
                java.util.List.of(new vn.cas.store.model.JoinableSalesSession("session-public-id",
                        "Customer One", "OPEN")));

        var result = service.resolveQr(new SalesSessionResolutionCommand("a".repeat(64), null, null,
                null, "session-public-id"));

        assertThat(result.status()).isEqualTo(ResolutionStatus.OPEN);
        assertThat(result.sessionPublicId()).isEqualTo("session-public-id");
        verify(diningTableMapper, never()).insertClientAccount(any());
    }

    @Test
    void shouldCreateTakeawaySessionFromTheTableQrWhenPhoneIsProvided() {
        when(diningTableMapper.findTableByActiveQrTokenForUpdate("a".repeat(64)))
                .thenReturn(new vn.cas.store.model.QrTableLookup(9L, 2L, 5L));
        when(diningTableMapper.findJoinableDineInSessionsByTableId(9L))
                .thenReturn(java.util.List.of());
        when(diningTableMapper.findClientAccountIdByStoreIdAndPhone(2L, "0901234567"))
                .thenReturn(23L);

        var result = service.resolveQr(new SalesSessionResolutionCommand("a".repeat(64),
                "Customer One", "0901234567", "TAKEAWAY", null));

        assertThat(result.status()).isEqualTo(ResolutionStatus.OPEN);
        verify(diningTableMapper).insertOpenTakeawaySalesSession(eq(2L), any(), eq(23L),
                eq("Customer One"), eq("0901234567"));
    }

    @Test
    void shouldRejectTakeawaySessionWithoutPhone() {
        when(diningTableMapper.findTableByActiveQrTokenForUpdate("a".repeat(64)))
                .thenReturn(new vn.cas.store.model.QrTableLookup(9L, 2L, 5L));
        when(diningTableMapper.findJoinableDineInSessionsByTableId(9L))
                .thenReturn(java.util.List.of());

        assertThatThrownBy(() -> service.resolveQr(new SalesSessionResolutionCommand("a".repeat(64),
                "Customer One", null, "TAKEAWAY", null))).isInstanceOf(ApiException.class);
    }

    @Test
    void shouldReturnCurrentSessionFromItsPublicId() {
        when(diningTableMapper.findCurrentSalesSessionByPublicId("session-public-id"))
                .thenReturn(new SalesSessionLookup(1L, 9L, 2L, 5L, "session-public-id", "OPEN"));

        var result = service.getCurrent("session-public-id");

        assertThat(result.status()).isEqualTo(ResolutionStatus.OPEN);
        assertThat(result.tableCode()).isEqualTo(5L);
    }

    @Test
    void shouldCloseOpenSessionWithoutOrders() {
        when(diningTableMapper.findCurrentSalesSessionByPublicIdForUpdate("session-public-id"))
                .thenReturn(new SalesSessionLookup(1L, 9L, 2L, 5L, "session-public-id", "OPEN"));
        when(diningTableMapper.hasOrders(1L)).thenReturn(false);
        when(diningTableMapper.closeSessionWithoutOrders(1L)).thenReturn(1);

        service.cancelCurrent("session-public-id");

        verify(diningTableMapper).closeSessionWithoutOrders(1L);
    }

    @Test
    void shouldRejectCancellingSessionThatAlreadyHasOrders() {
        when(diningTableMapper.findCurrentSalesSessionByPublicIdForUpdate("session-public-id"))
                .thenReturn(new SalesSessionLookup(1L, 9L, 2L, 5L, "session-public-id", "OPEN"));
        when(diningTableMapper.hasOrders(1L)).thenReturn(true);

        assertThatThrownBy(() -> service.cancelCurrent("session-public-id"))
                .isInstanceOf(ApiException.class);
        verify(diningTableMapper, never()).closeSessionWithoutOrders(anyLong());
    }

    @Test
    void shouldOpenSessionForOperatorWhenTableIsAvailable() {
        when(diningTableMapper.findSalesSessionByStoreIdAndTableIdForUpdate(2L, 9L))
                .thenReturn(new SalesSessionLookup(null, 9L, 2L, 5L, null, null));
        doAnswer(invocation -> {
            invocation.getArgument(0, CreateClientAccountCommand.class).setId(23L);
            return 1;
        }).when(diningTableMapper).insertClientAccount(any());

        var session = service.openOrGetForOperator(2L, 9L, "Customer One", null);

        assertThat(session.sessionPublicId()).isNotBlank();
        verify(diningTableMapper).insertOpenDineInSalesSession(anyLong(), any(), anyLong(), any(),
                any());
    }

    @Test
    void shouldOpenIndependentSessionForOperatorWhenTableAlreadyHasAnOpenSession() {
        when(diningTableMapper.findSalesSessionByStoreIdAndTableIdForUpdate(2L, 9L))
                .thenReturn(new SalesSessionLookup(1L, 9L, 2L, 5L, "existing-session", "OPEN"));
        doAnswer(invocation -> {
            invocation.getArgument(0, CreateClientAccountCommand.class).setId(24L);
            return 1;
        }).when(diningTableMapper).insertClientAccount(any());

        var session = service.openOrGetForOperator(2L, 9L, "Customer Two", null);

        assertThat(session.sessionPublicId()).isNotEqualTo("existing-session");
        verify(diningTableMapper).insertOpenDineInSalesSession(eq(9L), any(), eq(24L),
                eq("Customer Two"), eq(null));
    }

    @Test
    void shouldOpenTakeawayForOperatorWithCustomerIdentity() {
        when(diningTableMapper.findClientAccountIdByStoreIdAndPhone(2L, "0901234567"))
                .thenReturn(null);
        doAnswer(invocation -> {
            invocation.getArgument(0, CreateClientAccountCommand.class).setId(23L);
            return 1;
        }).when(diningTableMapper).insertClientAccount(any());
        when(diningTableMapper.findCurrentSalesSessionByPublicIdForUpdate(any()))
                .thenReturn(new SalesSessionLookup(1L, null, 2L, null, 23L, null, null,
                        "takeaway-session", "OPEN", "TAKEAWAY"));

        var session = service.openTakeawayForOperator(2L, "Customer One", "0901234567");

        assertThat(session.sessionType()).isEqualTo("TAKEAWAY");
        verify(diningTableMapper).insertOpenTakeawaySalesSession(eq(2L), any(), eq(23L),
                eq("Customer One"), eq("0901234567"));
    }

    @Test
    void shouldAllowOperatorToCloseOwnOpenSessionWithoutOrders() {
        when(diningTableMapper.findCurrentSalesSessionByPublicIdForUpdate("session-public-id"))
                .thenReturn(new SalesSessionLookup(1L, 9L, 2L, 5L, "session-public-id", "OPEN"));
        when(diningTableMapper.hasOrders(1L)).thenReturn(false);
        when(diningTableMapper.closeSessionWithoutOrders(1L)).thenReturn(1);

        service.cancelForOperator(
                new OperationalPrincipal(7L, 2L, "firebase-user-1", "Operator One", "OPERATOR"),
                "session-public-id", java.util.UUID.randomUUID());

        verify(diningTableMapper).closeSessionWithoutOrders(1L);
        verify(auditLogService).record(any());
    }
}
