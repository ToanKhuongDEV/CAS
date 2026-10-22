import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminDashboardPage from "../app/admin/page";
import { QueryProvider } from "../components/providers/query-provider";
import { loadAdminDashboard } from "../lib/api/operation/admin-dashboard.api";

const replace = vi.fn();
const searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
}));
vi.mock("../lib/api/operation/admin-dashboard.api", () => ({ loadAdminDashboard: vi.fn() }));

describe("AdminDashboardPage", () => {
  beforeEach(() => {
    replace.mockClear();
    window.sessionStorage.clear();
    searchParams.delete("from");
    searchParams.delete("period");
    searchParams.delete("to");
  });

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

    render(
      <QueryProvider>
        <AdminDashboardPage />
      </QueryProvider>,
    );

    expect(await screen.findByText("120.000 ₫")).toBeInTheDocument();
    expect(loadAdminDashboard).toHaveBeenCalled();
  });

  it("validates date ranges and debounces a valid custom range", async () => {
    vi.useFakeTimers();
    try {
      vi.mocked(loadAdminDashboard).mockResolvedValue({
        range: { from: "2026-10-01", to: "2026-10-10" },
        revenue: { total: 0, paidSessionCount: 0, series: [] },
        customers: { paidSessionCount: 0, averageWaitMinutes: null, series: [] },
        menu: { soldQuantity: 0, remadeQuantity: 0, topItems: [] },
        promotions: {
          totalDiscountAmount: 0,
          discountedSessionCount: 0,
          usageRate: 0,
          statusCounts: { active: 0, upcoming: 0, expired: 0, inactive: 0 },
        },
      });
      render(
        <QueryProvider>
          <AdminDashboardPage />
        </QueryProvider>,
      );
      await vi.advanceTimersByTimeAsync(0);
      const initialCalls = vi.mocked(loadAdminDashboard).mock.calls.length;

      fireEvent.change(screen.getByLabelText("Ngày bắt đầu"), {
        target: { value: "2099-01-02" },
      });
      expect(
        screen.getByText("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc."),
      ).toBeInTheDocument();
      await vi.advanceTimersByTimeAsync(250);
      expect(loadAdminDashboard).toHaveBeenCalledTimes(initialCalls);

      fireEvent.change(screen.getByLabelText("Ngày kết thúc"), {
        target: { value: "2099-01-02" },
      });
      await vi.advanceTimersByTimeAsync(249);
      expect(loadAdminDashboard).toHaveBeenCalledTimes(initialCalls);
      await vi.advanceTimersByTimeAsync(1);
      await vi.runAllTimersAsync();
      expect(vi.mocked(loadAdminDashboard).mock.calls.at(-1)?.slice(0, 2)).toEqual([
        "2099-01-02",
        "2099-01-02",
      ]);
      expect(replace).toHaveBeenLastCalledWith(
        "/admin?period=custom&from=2099-01-02&to=2099-01-02",
        { scroll: false },
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("restores a valid date filter from the URL", async () => {
    searchParams.set("period", "custom");
    searchParams.set("from", "2026-09-01");
    searchParams.set("to", "2026-09-30");
    vi.mocked(loadAdminDashboard).mockResolvedValue({
      range: { from: "2026-09-01", to: "2026-09-30" },
      revenue: { total: 0, paidSessionCount: 0, series: [] },
      customers: { paidSessionCount: 0, averageWaitMinutes: null, series: [] },
      menu: { soldQuantity: 0, remadeQuantity: 0, topItems: [] },
      promotions: {
        totalDiscountAmount: 0,
        discountedSessionCount: 0,
        usageRate: 0,
        statusCounts: { active: 0, upcoming: 0, expired: 0, inactive: 0 },
      },
    });

    render(
      <QueryProvider>
        <AdminDashboardPage />
      </QueryProvider>,
    );

    expect(screen.getByLabelText("Ngày bắt đầu")).toHaveValue("2026-09-01");
    expect(screen.getByLabelText("Ngày kết thúc")).toHaveValue("2026-09-30");
    await vi.waitFor(() => {
      expect(
        vi
          .mocked(loadAdminDashboard)
          .mock.calls.some(([from, to]) => from === "2026-09-01" && to === "2026-09-30"),
      ).toBe(true);
    });
  });
});
