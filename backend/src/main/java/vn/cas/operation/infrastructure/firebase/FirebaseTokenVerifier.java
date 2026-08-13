package vn.cas.operation.infrastructure.firebase;

public interface FirebaseTokenVerifier {

    String verifyAndGetUid(String idToken);
}
