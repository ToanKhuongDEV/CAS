import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CustomerSettingsPage from "../app/(customer)/settings/page";
import { cancelCustomerTableSession } from "../lib/api/ordering/ordering.api";
import { getCurrentCustomerTableSession } from "../lib/customer/table-session";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/settings",
  useRouter: () => ({ replace }),
}));
vi.mock("../lib/customer/table-session", () => ({ getCurrentCustomerTableSession: vi.fn() }));
vi.mock("../lib/api/ordering/ordering.api", () => ({ cancelCustomerTableSession: vi.fn() }));
vi.mock("../lib/api/store/public-store.api", () => ({
  loadPublicStore: vi.fn().mockResolvedValue({ logoUrl: null, name: "CAS" }),
}));
vi.mock("../lib/api/notification/notification.api", () => ({
  loadCustomerNotifications: vi.fn().mockResolvedValue({ notifications: [], unreadCount: 0 }),
  markAllCustomerNotificationsRead: vi.fn(),
  markCustomerNotificationRead: vi.fn(),
}));

describe("CustomerSettingsPage", () => {
  beforeEach(() => {
    vi.mocked(getCurrentCustomerTableSession).mockResolvedValue({
      customerInformationRequired: false,
      sessionStatus: "OPEN",
      tableCode: 1,
    });
    vi.mocked(cancelCustomerTableSession).mockResolvedValue();
    replace.mockClear();
  });

  it("renders appearance settings and the default customer navigation", () => {
    render(<CustomerSettingsPage />);

    expect(screen.getByRole("heading", { name: "Cài đặt", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Chuyển đổi giữa chế độ sáng và tối.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Chuyển đổi giao diện sáng hoặc tối",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Thanh toán" })).not.toBeInTheDocument();
  });

  it("confirms and cancels the current table session", async () => {
    render(<CustomerSettingsPage />);

    const cancelButton = await screen.findByRole("button", { name: "Hủy phiên" });
    expect(
      screen.getByRole("img", { name: "Chỉ hủy được khi chưa gửi món nào xuống bếp." }),
    ).toHaveAttribute("title", "Chỉ hủy được khi chưa gửi món nào xuống bếp.");

    fireEvent.click(cancelButton);
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận hủy" }));

    await vi.waitFor(() => expect(cancelCustomerTableSession).toHaveBeenCalledOnce());
    expect(replace).toHaveBeenCalledWith("/");
  });
});
