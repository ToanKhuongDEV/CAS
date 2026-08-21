package vn.cas.store.dto;

public class CreateClientAccountCommand {

  private final long storeId;
  private final String customerName;
  private final String customerPhone;
  private long id;

  public CreateClientAccountCommand(long storeId, String customerName, String customerPhone) {
    this.storeId = storeId;
    this.customerName = customerName;
    this.customerPhone = customerPhone;
  }

  public long getStoreId() {
    return storeId;
  }

  public String getCustomerName() {
    return customerName;
  }

  public String getCustomerPhone() {
    return customerPhone;
  }

  public long getId() {
    return id;
  }

  public void setId(long id) {
    this.id = id;
  }
}
