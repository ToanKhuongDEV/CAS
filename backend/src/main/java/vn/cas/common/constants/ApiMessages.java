package vn.cas.common.constants;

public final class ApiMessages {

    public static final String SERVICE_STATUS_UP = "UP";
    public static final String SERVICE_STATUS_RETRIEVED = "Đã lấy trạng thái hoạt động của hệ thống.";
    public static final String LONG_WAIT_WARNING_SETTING_RETRIEVED = "Đã lấy cấu hình cảnh báo bàn chờ lâu.";
    public static final String LONG_WAIT_WARNING_SETTING_UPDATED = "Đã cập nhật cấu hình cảnh báo bàn chờ lâu.";
    public static final String DINING_TABLE_CREATED = "Đã tạo bàn ăn.";
    public static final String DINING_TABLE_CODE_ALREADY_EXISTS = "Mã bàn đã tồn tại.";
    public static final String DINING_TABLES_RETRIEVED = "Đã lấy danh sách bàn ăn.";
    public static final String ACTIVE_TABLE_QR_CODE_RETRIEVED = "Đã lấy mã QR đang hoạt động của bàn.";
    public static final String DINING_TABLE_DELETED = "Đã xóa bàn ăn và các mã QR liên quan.";
    public static final String DINING_TABLE_NOT_FOUND = "Không tìm thấy bàn ăn.";
    public static final String DINING_TABLE_IN_USE = "Bàn ăn đã có dữ liệu phiên, không thể xóa.";
    public static final String OPERATOR_CREATED = "Đã tạo tài khoản nhân viên.";
    public static final String OPERATOR_DEACTIVATED = "Đã vô hiệu hóa tài khoản nhân viên.";
    public static final String OPERATOR_NOT_FOUND = "Không tìm thấy tài khoản nhân viên.";
    public static final String OPERATOR_EMAIL_ALREADY_EXISTS = "Email này đã được đăng ký cho tài khoản nhân viên.";
    public static final String FIREBASE_UID_ALREADY_EXISTS = "Tài khoản Firebase này đã được đăng ký.";
    public static final String ADMIN_CREATED = "Đã tạo tài khoản quản trị viên.";
    public static final String CUSTOMER_TABLE_SESSION_RESOLVED = "Đã xác thực phiên bàn của khách.";
    public static final String INVALID_TABLE_QR_CODE = "Mã QR của bàn không hợp lệ hoặc đã ngừng hoạt động.";
    public static final String CUSTOMER_TABLE_SESSION_REQUIRED = "Vui lòng quét mã QR của bàn để tiếp tục.";
    public static final String CUSTOMER_TABLE_SESSION_CANCELLED = "Đã hủy phiên bàn.";
    public static final String CUSTOMER_TABLE_SESSION_CANNOT_BE_CANCELLED = "Phiên bàn đã có món, không thể hủy.";
    public static final String OPERATOR_TABLE_SESSION_READY = "Phiên bàn đã sẵn sàng để gọi món.";
    public static final String OPERATOR_ORDER_CREATED = "Đã gửi món xuống bếp.";
    public static final String CATALOG_RESOURCE_NOT_FOUND = "Không tìm thấy dữ liệu thực đơn.";
    public static final String CATALOG_RESOURCE_IN_USE = "Dữ liệu thực đơn đang được sử dụng nên không thể xóa.";
    public static final String INVALID_CATALOG_IMAGE = "Ảnh món không thuộc Cloudinary của cửa hàng.";
    public static final String CLOUDINARY_NOT_CONFIGURED = "Cloudinary chưa được cấu hình.";

    public static final String VALIDATION_FAILED = "Dữ liệu gửi lên chưa hợp lệ.";
    public static final String INVALID_REQUEST = "Yêu cầu không hợp lệ.";
    public static final String UNAUTHENTICATED = "Vui lòng đăng nhập để tiếp tục.";
    public static final String FORBIDDEN = "Bạn không có quyền thực hiện thao tác này.";
    public static final String INTERNAL_ERROR = "Hệ thống gặp sự cố. Vui lòng thử lại sau.";

    public static final String INVALID_FIREBASE_TOKEN = "Phiên đăng nhập không hợp lệ.";
    public static final String FIREBASE_CREDENTIALS_UNAVAILABLE = "Dịch vụ xác thực hiện chưa sẵn sàng.";
    public static final String FIREBASE_AUTH_UNAVAILABLE = "Không thể kết nối dịch vụ xác thực. Vui lòng thử lại sau.";
    public static final String OPERATIONAL_ACCOUNT_UNAVAILABLE = "Tài khoản không tồn tại hoặc đã bị vô hiệu hóa.";

    private ApiMessages() {
    }
}
