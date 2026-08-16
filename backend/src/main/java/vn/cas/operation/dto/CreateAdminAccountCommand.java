package vn.cas.operation.dto;

public class CreateAdminAccountCommand {
    private long id;
    private final long storeId;
    private final String firebaseUid;
    private final String displayName;
    public CreateAdminAccountCommand(long storeId, String firebaseUid, String displayName) {
        this.storeId = storeId; this.firebaseUid = firebaseUid; this.displayName = displayName;
    }
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    public long getStoreId() { return storeId; }
    public String getFirebaseUid() { return firebaseUid; }
    public String getDisplayName() { return displayName; }
}
