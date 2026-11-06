package vn.cas.notification.dto;

public class CreateSystemNotificationCommand {
    private Long id;
    private final long storeId;
    private final String title;
    private final String content;
    private final String type;
    private final String targetRole;
    private final long createdBy;

    public CreateSystemNotificationCommand(long storeId, String title, String content, String type,
            String targetRole, long createdBy) {
        this.storeId = storeId;
        this.title = title;
        this.content = content;
        this.type = type;
        this.targetRole = targetRole;
        this.createdBy = createdBy;
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public long getStoreId() {
        return storeId;
    }
    public String getTitle() {
        return title;
    }
    public String getContent() {
        return content;
    }
    public String getType() {
        return type;
    }
    public String getTargetRole() {
        return targetRole;
    }
    public long getCreatedBy() {
        return createdBy;
    }
}
