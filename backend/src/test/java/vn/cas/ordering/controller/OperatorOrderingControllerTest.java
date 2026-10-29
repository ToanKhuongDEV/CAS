package vn.cas.ordering.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.ordering.service.CustomerOrderingService;
import vn.cas.store.model.AdminDiningTable;
import vn.cas.store.model.JoinableSalesSession;
import vn.cas.store.model.OperatorTableSession;
import vn.cas.store.service.DiningTableService;
import vn.cas.store.service.SalesSessionService;

class OperatorOrderingControllerTest {
    @Test
    void listsDineInAndTakeawaySessionsForTheOperatorsStore() {
        var sessions = mock(SalesSessionService.class);
        var tables = mock(DiningTableService.class);
        var principal = new OperationalPrincipal(1, 2, "user", "Operator", "OPERATOR");
        when(sessions.findActiveDineInSessions(2))
                .thenReturn(List.of(new OperatorTableSession(5, "table-session", "An", "OPEN")));
        when(sessions.findActiveTakeawaySessions(2))
                .thenReturn(List.of(new JoinableSalesSession("takeaway-session", "Bình", "OPEN")));
        when(tables.list(principal))
                .thenReturn(List.of(new AdminDiningTable(5, 5, 4, null, null, null)));
        var controller = new OperatorOrderingController(sessions,
                mock(CustomerOrderingService.class), tables);

        var result = controller.listTables(principal, new MockHttpServletRequest()).getBody()
                .data();
        assertThat(result.tables().getFirst().sessions().getFirst().sessionId())
                .isEqualTo("table-session");
        assertThat(result.takeawaySessions().getFirst().sessionId()).isEqualTo("takeaway-session");
    }
}
