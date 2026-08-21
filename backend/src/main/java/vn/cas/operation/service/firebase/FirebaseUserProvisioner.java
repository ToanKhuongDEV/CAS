package vn.cas.operation.service.firebase;

import com.google.firebase.auth.AuthErrorCode;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.stereotype.Component;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.exception.ApiException;

@Component
@Slf4j
public class FirebaseUserProvisioner {

    private final FirebaseAdminTokenVerifier firebaseAdminTokenVerifier;

    public FirebaseUserProvisioner(FirebaseAdminTokenVerifier firebaseAdminTokenVerifier) {
        this.firebaseAdminTokenVerifier = firebaseAdminTokenVerifier;
    }

    public String createUser(String email, String initialPassword, String displayName) {
        try {
            return firebaseAdminTokenVerifier.firebaseAuth()
                    .createUser(new UserRecord.CreateRequest().setEmail(email)
                            .setPassword(initialPassword).setDisplayName(displayName)
                            .setEmailVerified(false).setDisabled(false))
                    .getUid();
        } catch (FirebaseAuthException exception) {
            if (AuthErrorCode.EMAIL_ALREADY_EXISTS.equals(exception.getAuthErrorCode())) {
                log.warn(
                        "Operator account provisioning failed: email is already registered in Firebase Authentication");
                throw new ApiException(HttpStatus.CONFLICT,
                        ApiMessages.OPERATOR_EMAIL_ALREADY_EXISTS);
            }
            log.error(
                    "Operator account provisioning failed because Firebase Authentication is unavailable",
                    exception);
            throw new AuthenticationServiceException(ApiMessages.FIREBASE_AUTH_UNAVAILABLE,
                    exception);
        }
    }

    public void deleteUser(String firebaseUid) {
        try {
            firebaseAdminTokenVerifier.firebaseAuth().deleteUser(firebaseUid);
        } catch (FirebaseAuthException exception) {
            log.error("Firebase user compensation deletion failed", exception);
            throw new AuthenticationServiceException(ApiMessages.FIREBASE_AUTH_UNAVAILABLE,
                    exception);
        }
    }
}
