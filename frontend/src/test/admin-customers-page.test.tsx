import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import AdminCustomersPage from "../app/admin/customers/page";
import { QueryProvider } from "../components/providers/query-provider";
import { loadCustomers } from "../lib/api/operation/admin-lookup.api";

vi.mock("../lib/api/operation/admin-lookup.api", () => ({
  loadCustomers: vi.fn(),
  loadCustomer: vi.fn(),
}));

it("filters and sorts customers on the server and resets pagination when filters change", async () => {
  vi.mocked(loadCustomers).mockImplementation(async ({ page = 0 }) => ({
    items: [
      {
        id: page + 1,
        displayName: "An",
        maskedPhone: null,
        sessionCount: 2,
        lastVisitedAt: null,
        totalPaid: 120000,
      },
    ],
    page,
    size: 20,
    total: 21,
  }));
  render(
    <QueryProvider>
      <AdminCustomersPage />
    </QueryProvider>,
  );
  expect(await screen.findByText("120.000 ₫")).toBeInTheDocument();
  expect(loadCustomers).toHaveBeenCalledWith(expect.objectContaining({ page: 0, size: 20 }));
  expect(screen.getByText("21 kết quả")).toBeInTheDocument();
  expect(screen.getByText("1/2")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Sau" }));
  await waitFor(() =>
    expect(loadCustomers).toHaveBeenCalledWith(expect.objectContaining({ page: 1 })),
  );
  fireEvent.change(screen.getByLabelText("Sắp xếp khách hàng"), {
    target: { value: "AMOUNT_DESC" },
  });
  await waitFor(() =>
    expect(loadCustomers).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 0, sort: "AMOUNT_DESC" }),
    ),
  );
  fireEvent.change(screen.getByLabelText("Ngày bắt đầu"), { target: { value: "2026-10-01" } });
  fireEvent.change(screen.getByLabelText("Ngày kết thúc"), { target: { value: "2026-10-31" } });
  await waitFor(() =>
    expect(loadCustomers).toHaveBeenLastCalledWith(
      expect.objectContaining({
        from: "2026-10-01",
        to: "2026-10-31",
        sort: "AMOUNT_DESC",
        page: 0,
      }),
    ),
  );
  fireEvent.change(screen.getByLabelText("Ngày bắt đầu"), { target: { value: "2026-11-01" } });
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.",
  );
  expect(loadCustomers).not.toHaveBeenCalledWith(
    expect.objectContaining({ from: "2026-11-01", to: "2026-10-31" }),
  );
});
