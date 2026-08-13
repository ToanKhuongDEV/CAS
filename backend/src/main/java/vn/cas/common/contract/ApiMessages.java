package vn.cas.common.contract;

public final class ApiMessages {

    public static final String SERVICE_STATUS_UP = "UP";

    public static final String VALIDATION_FAILED_CODE = "VALIDATION_FAILED";
    public static final String VALIDATION_FAILED = "Request validation failed";
    public static final String INVALID_REQUEST_CODE = "INVALID_REQUEST";
    public static final String INVALID_REQUEST = "Request is invalid";
    public static final String UNAUTHENTICATED_CODE = "UNAUTHENTICATED";
    public static final String UNAUTHENTICATED = "Authentication is required";
    public static final String FORBIDDEN_CODE = "FORBIDDEN";
    public static final String FORBIDDEN = "You do not have permission for this operation";
    public static final String INTERNAL_ERROR_CODE = "INTERNAL_ERROR";
    public static final String INTERNAL_ERROR = "An unexpected error occurred";

    public static final String INVALID_FIREBASE_TOKEN = "Firebase ID Token is invalid";
    public static final String FIREBASE_CREDENTIALS_UNAVAILABLE = "Firebase Admin credentials are unavailable";
    public static final String OPERATIONAL_ACCOUNT_UNAVAILABLE = "Operational account is unavailable";

    private ApiMessages() {
    }
}
