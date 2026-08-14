package vn.cas.common.contract;

public final class ApiPaths {

    public static final String API_PREFIX = "/api";
    public static final String API_V1_PREFIX = API_PREFIX + "/v1";
    public static final String STATUS = API_V1_PREFIX + "/status";
    public static final String ADMIN_STORE_SETTINGS_LONG_WAIT_WARNING =
            API_V1_PREFIX + "/admin/store/settings/long-wait-warning";
    public static final String ADMIN_PATTERN = API_V1_PREFIX + "/admin/**";
    public static final String OPERATION_PATTERN = API_V1_PREFIX + "/operation/**";
    public static final String ACTUATOR_HEALTH = "/actuator/health";
    public static final String ACTUATOR_INFO = "/actuator/info";

    private ApiPaths() {
    }
}
