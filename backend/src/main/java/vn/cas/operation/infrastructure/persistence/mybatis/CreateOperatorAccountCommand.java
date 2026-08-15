package vn.cas.operation.infrastructure.persistence.mybatis;

public class CreateOperatorAccountCommand {
    private long id;
    private final long storeId;
    private final String firebaseUid;
    private final String displayName;

    public CreateOperatorAccountCommand(long storeId, String firebaseUid, String displayName) {
        this.storeId = storeId;
        this.firebaseUid = firebaseUid;
        this.displayName = displayName;
    }
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    public long getStoreId() { return storeId; }
    public String getFirebaseUid() { return firebaseUid; }
    public String getDisplayName() { return displayName; }
}
