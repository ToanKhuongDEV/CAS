package vn.cas.operation.service.firebase;

public interface FirebaseTokenVerifier {

    String verifyAndGetUid(String idToken);
}
