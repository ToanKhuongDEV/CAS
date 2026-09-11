package vn.cas.operation.dto;

public class CreateOperationalIncidentCommand {
    private Long id;
    private final String publicId;
    private final long storeId;
    private final String reporterName;
    private final long createdByAccountId;
    private final String description;

    public CreateOperationalIncidentCommand(String publicId, long storeId, String reporterName,
            long createdByAccountId, String description) {
        this.publicId = publicId;
        this.storeId = storeId;
        this.reporterName = reporterName;
        this.createdByAccountId = createdByAccountId;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPublicId() {
        return publicId;
    }

    public long getStoreId() {
        return storeId;
    }

    public String getReporterName() {
        return reporterName;
    }

    public long getCreatedByAccountId() {
        return createdByAccountId;
    }

    public String getDescription() {
        return description;
    }
}
