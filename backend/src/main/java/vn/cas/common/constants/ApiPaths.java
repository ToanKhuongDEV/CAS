package vn.cas.common.constants;

public final class ApiPaths {

    public static final String API_PREFIX = "/api";
    public static final String API_V1_PREFIX = API_PREFIX + "/v1";
    public static final String API_ADMIN_PREFIX = API_V1_PREFIX + "/admin";
    public static final String API_OPERATOR_PREFIX = API_V1_PREFIX + "/operator";
    public static final String API_CUSTOMER_PREFIX = API_V1_PREFIX + "/customer";
    public static final String API_AUTH_PREFIX = API_V1_PREFIX + "/auth";

    public static final String STATUS = API_V1_PREFIX + "/status";
    public static final String PUBLIC_STORE = API_V1_PREFIX + "/public/stores/{storeId}";
    public static final String ADMIN_PATTERN = API_ADMIN_PREFIX + "/**";
    public static final String OPERATOR_PATTERN = API_OPERATOR_PREFIX + "/**";
    public static final String AUTH_PATTERN = API_AUTH_PREFIX + "/**";
    public static final String ACTUATOR_HEALTH = "/actuator/health";
    public static final String ACTUATOR_INFO = "/actuator/info";

    private ApiPaths() {
    }

    public static final class Store {

        private static final String PRE_FIX = API_ADMIN_PREFIX + "/store";

        public static final String LONG_WAIT_WARNING = PRE_FIX + "/settings/long-wait-warning";
        public static final String SETTINGS = PRE_FIX + "/settings";
        public static final String WELCOME = PRE_FIX + "/welcome";

        private Store() {
        }
    }

    public static final class Table {

        private static final String PRE_FIX = API_ADMIN_PREFIX + "/tables";

        public static final String TABLE_COMMON = PRE_FIX;

        private Table() {
        }
    }

    public static final class CustomerTableSession {
        private static final String PRE_FIX = API_CUSTOMER_PREFIX + "/table-sessions";

        public static final String COMMON = PRE_FIX;
        public static final String RESOLVE_QR = PRE_FIX + "/resolve-qr";
        public static final String CURRENT = PRE_FIX + "/current";

        private CustomerTableSession() {
        }
    }

    public static final class Operator {
        private static final String PRE_FIX = API_ADMIN_PREFIX + "/operators";
        public static final String OPERATOR_COMMON = PRE_FIX;
        public static final String OPERATOR_ID = PRE_FIX + "/{operatorId}";

        private Operator() {
        }
    }

    public static final class AdminAccount {
        private static final String PRE_FIX = API_ADMIN_PREFIX + "/admins";
        public static final String ADMIN_COMMON = PRE_FIX;

        private AdminAccount() {
        }
    }

    public static final class Auth {
        public static final String CURRENT_ACCOUNT = API_AUTH_PREFIX + "/me";

        private Auth() {
        }
    }

    public static final class Catalog {
        public static final String ADMIN = API_ADMIN_PREFIX + "/catalog";
        public static final String OPERATOR = API_OPERATOR_PREFIX + "/catalog";
        public static final String CUSTOMER = API_CUSTOMER_PREFIX + "/catalog";

        private Catalog() {
        }
    }

    public static final class Preparation {
        public static final String COMMON = API_OPERATOR_PREFIX + "/preparation";
        public static final String LONG_WAIT_TABLES = COMMON + "/long-wait-tables";
        public static final String GROUPS = COMMON + "/groups";
        public static final String PENDING_TABLE_COUNT = COMMON + "/pending-table-count";
        public static final String GROUP_COMPLETIONS = GROUPS + "/{groupKey}/completions";
        public static final String TABLE_COMPLETIONS = COMMON + "/tables/{tableCode}/completions";

        private Preparation() {
        }
    }

    public static final class Cancellation {
        public static final String COMMON = API_OPERATOR_PREFIX + "/cancellation-requests";
        public static final String PENDING_COUNT = COMMON + "/pending-count";
        public static final String REQUEST = COMMON + "/{cancellationRequestId}";
        public static final String RESOLUTION = REQUEST + "/resolution";

        private Cancellation() {
        }
    }

    public static final class Payment {
        public static final String CUSTOMER = API_CUSTOMER_PREFIX + "/payments";
        public static final String OPERATOR = API_OPERATOR_PREFIX + "/payments";
        public static final String OPERATOR_PAID_TODAY = OPERATOR + "/paid-today";
        public static final String OPERATOR_PENDING_COUNT = OPERATOR + "/pending-count";
        private Payment() {
        }
    }

    public static final class UnpaidRecord {
        public static final String OPERATOR = API_OPERATOR_PREFIX + "/unpaid-records";
        public static final String ELIGIBLE_SESSIONS = OPERATOR + "/eligible-sessions";

        private UnpaidRecord() {
        }
    }

    public static final class Images {
        public static final String UPLOAD_SIGNATURE = API_ADMIN_PREFIX + "/images/upload-signature";

        private Images() {
        }
    }

    public static final class ServiceBooking {
        public static final String OPERATOR = API_OPERATOR_PREFIX + "/service-bookings";
        public static final String OPERATOR_ID = OPERATOR + "/{serviceBookingId}";
        public static final String OPERATOR_UPDATE = OPERATOR_ID;
        public static final String OPERATOR_CONFIRM = OPERATOR_ID + "/confirm";
        public static final String OPERATOR_CANCEL = OPERATOR_ID + "/cancel";

        private ServiceBooking() {
        }
    }

    public static final class Notification {
        public static final String ADMIN = API_ADMIN_PREFIX + "/notifications";
        public static final String ADMIN_ID = ADMIN + "/{notificationId}";
        public static final String OPERATOR = API_OPERATOR_PREFIX + "/notifications";
        public static final String OPERATOR_READ = OPERATOR + "/{notificationId}/read";
        public static final String OPERATOR_READ_ALL = OPERATOR + "/read";
        public static final String CUSTOMER = API_CUSTOMER_PREFIX + "/notifications";
        public static final String CUSTOMER_READ = CUSTOMER + "/{notificationId}/read";
        public static final String CUSTOMER_READ_ALL = CUSTOMER + "/read";

        private Notification() {
        }
    }

    public static final class PublicStore {
        public static final String WELCOME = API_V1_PREFIX + "/public/stores/{storeId}/welcome";

        private PublicStore() {
        }
    }
}
