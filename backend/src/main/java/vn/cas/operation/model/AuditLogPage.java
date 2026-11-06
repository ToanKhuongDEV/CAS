package vn.cas.operation.model;

import java.util.List;

public record AuditLogPage(List<AuditLogView> items, long total, int page, int size) {
}
