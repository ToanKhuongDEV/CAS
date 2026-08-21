package vn.cas.operation.dto;

public class CreateOperatorAccountCommand {
  private long id;
  private final long storeId;
  private final String firebaseUid;
  private final String email;
  private final String phone;
  private final String displayName;

  public CreateOperatorAccountCommand(
      long storeId, String firebaseUid, String email, String phone, String displayName) {
    this.storeId = storeId;
    this.firebaseUid = firebaseUid;
    this.email = email;
    this.phone = phone;
    this.displayName = displayName;
  }

  public long getId() {
    return id;
  }

  public void setId(long id) {
    this.id = id;
  }

  public long getStoreId() {
    return storeId;
  }

  public String getFirebaseUid() {
    return firebaseUid;
  }

  public String getEmail() {
    return email;
  }

  public String getPhone() {
    return phone;
  }

  public String getDisplayName() {
    return displayName;
  }
}
