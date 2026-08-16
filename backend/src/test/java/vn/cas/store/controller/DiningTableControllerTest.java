package vn.cas.store.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import vn.cas.common.constants.ApiMessages;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.common.web.RequestId;
import vn.cas.store.service.DiningTableService;
import vn.cas.store.model.DiningTable;

class DiningTableControllerTest {

    private final DiningTableService diningTableService = mock(DiningTableService.class);
    private final DiningTableController controller = new DiningTableController(diningTableService);
    private final OperationalPrincipal principal = new OperationalPrincipal(
            7L, 2L, "firebase-user-1", "Admin One", "ADMIN");

    @Test
    void shouldCreateDiningTable() {
        when(diningTableService.create(any(), any(Long.class), any(), any()))
                .thenReturn(new DiningTable(11L, 5L, 4, "a".repeat(64)));
        var request = new MockHttpServletRequest();
        request.setAttribute(RequestId.ATTRIBUTE_NAME, UUID.randomUUID());

        var response = controller.create(
                principal,
                new DiningTableController.CreateDiningTableRequest(5L, 4),
                request);

        assertThat(response.getStatusCodeValue()).isEqualTo(201);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message()).isEqualTo(ApiMessages.DINING_TABLE_CREATED);
        assertThat(response.getBody().data())
                .extracting(
                        DiningTableController.DiningTableResponse::id,
                        DiningTableController.DiningTableResponse::code,
                        DiningTableController.DiningTableResponse::capacity)
                .containsExactly(11L, 5L, 4);
    }
}
