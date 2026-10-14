import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AdminDashboardPage from "../app/admin/page";
import { loadAdminDashboard } from "../lib/api/operation/admin-dashboard.api";

vi.mock("../lib/api/operation/admin-dashboard.api", () => ({ loadAdminDashboard: vi.fn() }));

describe("AdminDashboardPage", () => {
  it("loads dashboard data from the API", async () => {
    vi.mocked(loadAdminDashboard).mockResolvedValue({
      range: { from: "2026-10-01", to: "2026-10-10" },
      revenue: { total: 120000, paidSessionCount: 2, series: [] },
      customers: { paidSessionCount: 2, averageWaitMinutes: 12, series: [] },
      menu: { soldQuantity: 4, remadeQuantity: 1, topItems: [] },
      promotions: {
        totalDiscountAmount: 10000,
        discountedSessionCount: 1,
        usageRate: 50,
        statusCounts: { active: 1, upcoming: 0, expired: 0, inactive: 0 },
      },
    });

    render(<AdminDashboardPage />);

    expect(await screen.findByText("120.000 ₫")).toBeInTheDocument();
    expect(loadAdminDashboard).toHaveBeenCalled();
  });
});
