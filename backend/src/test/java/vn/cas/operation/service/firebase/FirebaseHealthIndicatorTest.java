package vn.cas.operation.service.firebase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.Test;

class FirebaseHealthIndicatorTest {

    private final FirebaseAdminTokenVerifier tokenVerifier = mock(FirebaseAdminTokenVerifier.class);
    private final FirebaseHealthIndicator healthIndicator = new FirebaseHealthIndicator(tokenVerifier);

    @Test
    void shouldReportUpWhenFirebaseAuthIsAvailable() {
        var health = healthIndicator.health();

        assertThat(health.getStatus().getCode()).isEqualTo("UP");
        verify(tokenVerifier).verifyAvailability();
    }

    @Test
    void shouldReportDownWhenFirebaseAuthIsUnavailable() {
        doThrow(new IllegalStateException("Firebase unavailable"))
                .when(tokenVerifier).verifyAvailability();

        var health = healthIndicator.health();

        assertThat(health.getStatus().getCode()).isEqualTo("DOWN");
    }
}
