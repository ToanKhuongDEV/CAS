package vn.cas.store.dto;

public class CreateDiningTableCommand {

    private long id;
    private final long storeId;
    private final long code;
    private final Integer capacity;
    private final long createdBy;

    public CreateDiningTableCommand(long storeId, long code, Integer capacity, long createdBy) {
        this.storeId = storeId;
        this.code = code;
        this.capacity = capacity;
        this.createdBy = createdBy;
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

    public long getCode() {
        return code;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public long getCreatedBy() {
        return createdBy;
    }
}
