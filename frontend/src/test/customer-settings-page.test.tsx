import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CustomerSettingsPage from "../app/(customer)/settings/page";
import { QueryProvider } from "../components/providers/query-provider";
import { ToastProvider } from "../components/ui/toast-provider";
import { cancelCustomerSalesSession } from "../lib/api/ordering/ordering.api";
import { getCurrentCustomerSalesSession, logoutCustomer } from "../lib/customer/sales-session";
import { clearRememberedPublicStoreId } from "../lib/api/store/public-store.api";

const replace = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/settings",
  useRouter: () => ({ replace, refresh }),
}));
vi.mock("../lib/customer/sales-session", () => ({
  getCurrentCustomerSalesSession: vi.fn(),
  logoutCustomer: vi.fn(),
}));
vi.mock("../lib/api/ordering/ordering.api", () => ({ cancelCustomerSalesSession: vi.fn() }));
vi.mock("../lib/api/store/public-store.api", () => ({
  loadPublicStore: vi.fn().mockResolvedValue({ logoUrl: null, name: "CAS" }),
  clearRememberedPublicStoreId: vi.fn(),
}));
vi.mock("../lib/api/notification/notification.api", () => ({
  loadCustomerNotifications: vi.fn().mockResolvedValue({ notifications: [], unreadCount: 0 }),
  markAllCustomerNotificationsRead: vi.fn(),
  markCustomerNotificationRead: vi.fn(),
}));

describe("CustomerSettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentCustomerSalesSession).mockResolvedValue({
      customerInformationRequired: false,
      joinSessionRequired: false,
      joinableSessions: [],
      sessionStatus: "OPEN",
      tableCode: 1,
    });
    vi.mocked(cancelCustomerSalesSession).mockResolvedValue();
    vi.mocked(logoutCustomer).mockResolvedValue();
    replace.mockClear();
    refresh.mockClear();
  });

  it("renders appearance settings and the default customer navigation", () => {
    render(
      <QueryProvider>
        <ToastProvider>
          <CustomerSettingsPage />
        </ToastProvider>
      </QueryProvider>,
    );

    expect(screen.getByRole("heading", { name: "Cài đặt", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Chuyển đổi giữa chế độ sáng và tối.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Chuyển đổi giao diện sáng hoặc tối",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Thanh toán" })).not.toBeInTheDocument();
  });

  it("does not show a separate cancel session button", async () => {
    render(
      <QueryProvider>
        <ToastProvider>
          <CustomerSettingsPage />
        </ToastProvider>
      </QueryProvider>,
    );

    expect(screen.queryByRole("button", { name: "Hủy phiên" })).not.toBeInTheDocument();
  });

  it("logs out without cancelling the session and clears customer data", async () => {
    window.sessionStorage.setItem("cas.customerCart", "[]");
    window.sessionStorage.setItem("cas.tableQrToken", "qr");
    render(
      <QueryProvider>
        <ToastProvider>
          <CustomerSettingsPage />
        </ToastProvider>
      </QueryProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Đăng xuất" }));
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    expect(logoutCustomer).toHaveBeenCalledOnce();
    expect(cancelCustomerSalesSession).not.toHaveBeenCalled();
    expect(clearRememberedPublicStoreId).toHaveBeenCalled();
    expect(window.sessionStorage.getItem("cas.customerCart")).toBeNull();
    expect(window.sessionStorage.getItem("cas.tableQrToken")).toBeNull();
    expect(refresh).toHaveBeenCalled();
  });

  it("keeps local data and reports logout failures", async () => {
    vi.mocked(logoutCustomer).mockRejectedValueOnce(new Error("Không thể thoát phiên."));
    window.sessionStorage.setItem("cas.tableQrToken", "qr");
    render(
      <QueryProvider>
        <ToastProvider>
          <CustomerSettingsPage />
        </ToastProvider>
      </QueryProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Đăng xuất" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Không thể thoát phiên.");
    expect(window.sessionStorage.getItem("cas.tableQrToken")).toBe("qr");
    expect(replace).not.toHaveBeenCalled();
  });
});
