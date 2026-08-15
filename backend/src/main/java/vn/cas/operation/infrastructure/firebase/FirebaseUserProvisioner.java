package vn.cas.operation.infrastructure.firebase;

import com.google.firebase.auth.AuthErrorCode;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.stereotype.Component;
import vn.cas.common.contract.ApiMessages;
import vn.cas.common.web.ApiException;

@Component
public class FirebaseUserProvisioner {

    private final FirebaseAdminTokenVerifier firebaseAdminTokenVerifier;

    public FirebaseUserProvisioner(FirebaseAdminTokenVerifier firebaseAdminTokenVerifier) {
        this.firebaseAdminTokenVerifier = firebaseAdminTokenVerifier;
    }

    public String createUser(String email, String initialPassword, String displayName) {
        try {
            return firebaseAdminTokenVerifier.firebaseAuth().createUser(new UserRecord.CreateRequest()
                    .setEmail(email)
                    .setPassword(initialPassword)
                    .setDisplayName(displayName)
                    .setEmailVerified(false)
                    .setDisabled(false))
                    .getUid();
        } catch (FirebaseAuthException exception) {
            if (AuthErrorCode.EMAIL_ALREADY_EXISTS.equals(exception.getAuthErrorCode())) {
                throw new ApiException(HttpStatus.CONFLICT, ApiMessages.OPERATOR_EMAIL_ALREADY_EXISTS);
            }
            throw new AuthenticationServiceException(ApiMessages.FIREBASE_AUTH_UNAVAILABLE, exception);
        }
    }

    public void deleteUser(String firebaseUid) {
        try {
            firebaseAdminTokenVerifier.firebaseAuth().deleteUser(firebaseUid);
        } catch (FirebaseAuthException exception) {
            throw new AuthenticationServiceException(ApiMessages.FIREBASE_AUTH_UNAVAILABLE, exception);
        }
    }
}
