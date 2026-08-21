package vn.cas.operation.service.firebase;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component("firebaseHealthIndicator")
public class FirebaseHealthIndicator implements HealthIndicator {

    private static final Logger LOGGER = LoggerFactory.getLogger(FirebaseHealthIndicator.class);

    private final FirebaseAdminTokenVerifier firebaseAdminTokenVerifier;

    public FirebaseHealthIndicator(FirebaseAdminTokenVerifier firebaseAdminTokenVerifier) {
        this.firebaseAdminTokenVerifier = firebaseAdminTokenVerifier;
    }

    @Override
    public Health health() {
        try {
            firebaseAdminTokenVerifier.verifyAvailability();
            return Health.up().build();
        } catch (RuntimeException exception) {
            LOGGER.warn("Firebase health check failed: {}: {}",
                    exception.getClass().getSimpleName(), exception.getMessage());
            return Health.down().build();
        }
    }
}
