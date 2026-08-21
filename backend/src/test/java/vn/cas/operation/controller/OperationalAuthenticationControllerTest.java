package vn.cas.operation.controller;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import vn.cas.common.security.OperationalPrincipal;

class OperationalAuthenticationControllerTest {

  @Test
  void shouldReturnAuthenticatedOperationalAccount() {
    var controller = new OperationalAuthenticationController();
    var principal = new OperationalPrincipal(7L, 2L, "firebase-user-1", "Admin One", "ADMIN");

    var response = controller.getCurrentAccount(principal, new MockHttpServletRequest());

    assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().data())
        .extracting(
            OperationalAuthenticationController.CurrentOperationalAccountResponse::accountId,
            OperationalAuthenticationController.CurrentOperationalAccountResponse::storeId,
            OperationalAuthenticationController.CurrentOperationalAccountResponse::displayName,
            OperationalAuthenticationController.CurrentOperationalAccountResponse::role)
        .containsExactly(7L, 2L, "Admin One", "ADMIN");
  }
}
