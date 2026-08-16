package vn.cas.operation.service.firebase;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Component;

import vn.cas.common.constants.ApiMessages;

@Component
public class FirebaseAdminTokenVerifier implements FirebaseTokenVerifier {

    private final String serviceAccountPath;

    public FirebaseAdminTokenVerifier(
            @Value("${cas.firebase.service-account-path:}") String serviceAccountPath) {
        this.serviceAccountPath = serviceAccountPath;
    }

    @Override
    public String verifyAndGetUid(String idToken) {
        try {
            return firebaseAuth().verifyIdToken(idToken).getUid();
        } catch (FirebaseAuthException exception) {
            throw new BadCredentialsException(ApiMessages.INVALID_FIREBASE_TOKEN, exception);
        }
    }

    public void verifyAvailability() {
        try {
            firebaseAuth().listUsers(null, 1);
        } catch (FirebaseAuthException exception) {
            throw new AuthenticationServiceException(ApiMessages.FIREBASE_AUTH_UNAVAILABLE, exception);
        }
    }

    FirebaseAuth firebaseAuth() {
        synchronized (FirebaseAdminTokenVerifier.class) {
            if (FirebaseApp.getApps().isEmpty()) {
                try {
                    FirebaseApp.initializeApp(FirebaseOptions.builder()
                            .setCredentials(firebaseCredentials())
                            .build());
                } catch (IOException exception) {
                    throw new AuthenticationServiceException(ApiMessages.FIREBASE_CREDENTIALS_UNAVAILABLE, exception);
                }
            }
            return FirebaseAuth.getInstance();
        }
    }

    private GoogleCredentials firebaseCredentials() throws IOException {
        if (serviceAccountPath.isBlank()) {
            return GoogleCredentials.getApplicationDefault();
        }
        try (InputStream inputStream = Files.newInputStream(Path.of(serviceAccountPath))) {
            return GoogleCredentials.fromStream(inputStream);
        }
    }
}
