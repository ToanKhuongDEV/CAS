import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminReportsPage from "../app/admin/reports/page";
import { QueryProvider } from "../components/providers/query-provider";
import { downloadAdminReports, loadAdminReport } from "../lib/api/operation/admin-reports.api";

const replace = vi.fn();
const searchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
}));
vi.mock("../lib/api/operation/admin-reports.api", () => ({
  downloadAdminReports: vi.fn(),
  loadAdminReport: vi.fn(),
}));

describe("AdminReportsPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    window.sessionStorage.clear();
    searchParams.set("period", "custom");
    searchParams.set("from", "2026-10-01");
    searchParams.set("to", "2026-10-31");
    searchParams.delete("type");
    vi.mocked(downloadAdminReports).mockResolvedValue();
    vi.mocked(loadAdminReport).mockImplementation(async (_filter, type, page) => ({
      items:
        type === "REVENUE"
          ? [
              {
                date: "2026-10-01",
                paidSessionCount: 3,
                salesRevenue: 55000,
                serviceRevenue: 10000,
                revenue: 65000,
              },
            ]
          : type === "ORDERS"
            ? [
                {
                  orderNumber: page ? "ORD-2" : "ORD-1",
                  createdAt: "2026-10-01T12:00:00",
                  tableCode: 1,
                  customerName: "An",
                  originalAmount: 55000,
                  payableAmount: 55000,
                },
              ]
            : [
                {
                  orderNumber: "ORD-1",
                  resolvedAt: "2026-10-01T13:00:00",
                  tableCode: 1,
                  itemName: "Mì cay",
                  quantity: 1,
                },
              ],
      total: type === "ORDERS" ? 11 : 1,
      page,
      size: 10,
    }));
  });

  function chooseDates() {
    fireEvent.change(screen.getByLabelText("Ngày bắt đầu"), { target: { value: "2026-10-01" } });
    fireEvent.change(screen.getByLabelText("Ngày kết thúc"), { target: { value: "2026-10-31" } });
  }

  it("rejects an inverted date range without loading that range", async () => {
    render(
      <QueryProvider>
        <AdminReportsPage />
      </QueryProvider>,
    );
    await screen.findByText("65.000 ₫");
    const calls = vi.mocked(loadAdminReport).mock.calls.length;
    fireEvent.change(screen.getByLabelText("Ngày bắt đầu"), { target: { value: "2026-11-01" } });
    fireEvent.click(screen.getByRole("button", { name: "Tìm kiếm" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.",
    );
    expect(loadAdminReport).toHaveBeenCalledTimes(calls);
    expect(screen.getByRole("button", { name: "Xuất Excel" })).toBeDisabled();
  });

  it("shows the default revenue report, pages the selected report and exports it", async () => {
    render(
      <QueryProvider>
        <AdminReportsPage />
      </QueryProvider>,
    );
    chooseDates();
    expect(await screen.findByText("65.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("10.000 ₫")).toBeInTheDocument();
    expect(screen.getByLabelText("Loại báo cáo")).toHaveValue("REVENUE");
    expect(screen.getAllByRole("option")).toHaveLength(3);
    fireEvent.change(screen.getByLabelText("Loại báo cáo"), { target: { value: "ORDERS" } });
    fireEvent.click(screen.getByRole("button", { name: "Tìm kiếm" }));
    const orders = await screen.findByRole("region", { name: "Lịch sử order" });
    expect(await within(orders).findByText("ORD-1")).toBeInTheDocument();
    expect(
      within(within(orders).getByRole("navigation", { name: "Phân trang" })).getByText(
        "11 kết quả",
      ),
    ).toBeInTheDocument();
    expect(within(orders).getByText("1/2")).toBeInTheDocument();
    expect(within(orders).getByRole("button", { name: "Trước" })).toBeDisabled();
    fireEvent.click(within(orders).getByRole("button", { name: "Sau" }));
    expect(await within(orders).findByText("ORD-2")).toBeInTheDocument();
    expect(within(orders).getByText("2/2")).toBeInTheDocument();
    expect(within(orders).getByRole("button", { name: "Sau" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Tìm kiếm" }));
    expect(
      await within(await screen.findByRole("region", { name: "Lịch sử order" })).findByText(
        "ORD-1",
      ),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Xuất Excel" }));
    expect(downloadAdminReports).toHaveBeenCalledWith({
      type: "ORDERS",
      from: "2026-10-01",
      to: "2026-10-31",
    });
  });

  it("falls back to revenue for old ALL links", async () => {
    searchParams.set("type", "ALL");
    render(
      <QueryProvider>
        <AdminReportsPage />
      </QueryProvider>,
    );
    expect(screen.getByLabelText("Loại báo cáo")).toHaveValue("REVENUE");
    expect(await screen.findByText("65.000 ₫")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Lịch sử order" })).not.toBeInTheDocument();
    await vi.waitFor(() =>
      expect(replace).toHaveBeenLastCalledWith(expect.stringContaining("type=REVENUE"), {
        scroll: false,
      }),
    );
  });

  it("shows only the selected report and invalidates the export after changing filters", async () => {
    render(
      <QueryProvider>
        <AdminReportsPage />
      </QueryProvider>,
    );
    chooseDates();
    fireEvent.change(screen.getByLabelText("Loại báo cáo"), { target: { value: "REMADE" } });
    fireEvent.click(screen.getByRole("button", { name: "Tìm kiếm" }));
    expect(await screen.findByText("Mì cay")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Lịch sử order" })).not.toBeInTheDocument();
    await vi.waitFor(() =>
      expect(replace).toHaveBeenLastCalledWith(expect.stringContaining("type=REMADE"), {
        scroll: false,
      }),
    );
    fireEvent.change(screen.getByLabelText("Ngày kết thúc"), { target: { value: "2026-11-01" } });
    expect(screen.getByRole("button", { name: "Xuất Excel" })).toBeDisabled();
  });

  it("allows returning to an existing page when results shrink", async () => {
    vi.mocked(loadAdminReport).mockImplementation(async (_filter, _type, page) => ({
      items: page === 0 ? [{ orderNumber: "ORD-1" }] : [],
      total: page === 0 ? 11 : 1,
      page,
      size: 10,
    }));
    render(
      <QueryProvider>
        <AdminReportsPage />
      </QueryProvider>,
    );
    chooseDates();
    fireEvent.change(screen.getByLabelText("Loại báo cáo"), { target: { value: "ORDERS" } });
    fireEvent.click(screen.getByRole("button", { name: "Tìm kiếm" }));
    expect(await screen.findByText("ORD-1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sau" }));
    fireEvent.click(await screen.findByRole("button", { name: "Về trang còn dữ liệu" }));
    expect(await screen.findByText("ORD-1")).toBeInTheDocument();
  });

  it("restores URL filters and shares date presets with the dashboard", async () => {
    searchParams.set("type", "ORDERS");
    render(
      <QueryProvider>
        <AdminReportsPage />
      </QueryProvider>,
    );
    expect(screen.getByLabelText("Ngày bắt đầu")).toHaveValue("2026-10-01");
    expect(screen.getByLabelText("Ngày kết thúc")).toHaveValue("2026-10-31");
    expect(screen.getByText("01/10/2026")).toBeInTheDocument();
    expect(screen.getByText("31/10/2026")).toBeInTheDocument();
    expect(screen.getByLabelText("Loại báo cáo")).toHaveValue("ORDERS");
    expect(await screen.findByText("ORD-1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "3 ngày" }));
    expect(screen.getByRole("button", { name: "3 ngày" })).toHaveAttribute("aria-pressed", "true");
    await vi.waitFor(() => {
      const query = new URLSearchParams(
        window.sessionStorage.getItem("cas.adminDashboardFilter") ?? "",
      );
      expect(query.get("period")).toBe("threeDays");
      expect(screen.getByLabelText("Ngày bắt đầu")).toHaveValue(query.get("from"));
      expect(replace).toHaveBeenLastCalledWith(
        `/admin/reports?period=threeDays&from=${query.get("from")}&to=${query.get("to")}&type=ORDERS`,
        { scroll: false },
      );
    });
    fireEvent.click(screen.getByRole("button", { name: "1 tháng" }));
    expect(screen.getByRole("button", { name: "1 tháng" })).toHaveAttribute("aria-pressed", "true");
    await vi.waitFor(() =>
      expect(window.sessionStorage.getItem("cas.adminDashboardFilter")).toContain(
        "period=oneMonth",
      ),
    );
  });
});
