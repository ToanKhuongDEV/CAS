package vn.cas.common.contract;

public final class ApiMessages {

    public static final String SERVICE_STATUS_UP = "UP";
    public static final String SERVICE_STATUS_RETRIEVED = "Service status retrieved.";
    public static final String LONG_WAIT_WARNING_SETTING_RETRIEVED = "Long-wait warning setting retrieved.";
    public static final String LONG_WAIT_WARNING_SETTING_UPDATED = "Long-wait warning setting updated.";

    public static final String VALIDATION_FAILED = "Request validation failed";
    public static final String INVALID_REQUEST = "Request is invalid";
    public static final String UNAUTHENTICATED = "Authentication is required";
    public static final String FORBIDDEN = "You do not have permission for this operation";
    public static final String INTERNAL_ERROR = "An unexpected error occurred";

    public static final String INVALID_FIREBASE_TOKEN = "Firebase ID Token is invalid";
    public static final String FIREBASE_CREDENTIALS_UNAVAILABLE = "Firebase Admin credentials are unavailable";
    public static final String OPERATIONAL_ACCOUNT_UNAVAILABLE = "Operational account is unavailable";

    private ApiMessages() {
    }
}
