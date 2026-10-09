package vn.cas.operation.model;

import java.util.List;

public record AdminCustomerPage(List<AdminCustomerSummary> items, long total, int page, int size) {
}
