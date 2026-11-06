package vn.cas.operation.model;

import java.time.LocalDateTime;

public record OperationalIncident(String publicId, String reporterName, String description,
        LocalDateTime createdAt) {
}
