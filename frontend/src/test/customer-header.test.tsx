import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CustomerHeader } from "../components/customer/customer-header";
import { getCurrentCustomerSalesSession } from "../lib/customer/sales-session";
import { getRememberedPublicStoreId } from "../lib/api/store/public-store.api";
import {
  loadCustomerNotifications,
  markAllCustomerNotificationsRead,
  markCustomerNotificationRead,
} from "../lib/api/notification/notification.api";

vi.mock("../lib/customer/sales-session", () => ({ getCurrentCustomerSalesSession: vi.fn() }));
const replace = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/menu",
  useRouter: () => ({ replace }),
}));
vi.mock("../lib/api/store/public-store.api", () => ({
  getRememberedPublicStoreId: vi.fn().mockReturnValue(null),
  loadPublicStore: vi.fn().mockResolvedValue({
    logoUrl: null,
    brandName: "Thương hiệu CAS",
    branchName: "Chi nhánh 1",
    welcomeSlogan: "Vui trọn từng bàn",
  }),
}));
vi.mock("../lib/api/notification/notification.api", () => ({
  loadCustomerNotifications: vi.fn(),
  markAllCustomerNotificationsRead: vi.fn(),
  markCustomerNotificationRead: vi.fn(),
}));

describe("CustomerHeader", () => {
  beforeEach(() => {
    vi.mocked(getRememberedPublicStoreId).mockReturnValue(1);
    vi.mocked(getCurrentCustomerSalesSession).mockRejectedValue(new Error("No active table"));
    vi.mocked(loadCustomerNotifications).mockResolvedValue({
      notifications: [
        {
          content: "Nội dung thông báo",
          createdAt: "2026-09-08T10:00:00Z",
          id: 1,
          readAt: null,
          status: "UNREAD",
          targetRole: "CUSTOMER",
          title: "Ưu đãi hôm nay",
          type: "INFO",
          updatedAt: "2026-09-08T10:00:00Z",
        },
      ],
      unreadCount: 1,
    });
    vi.mocked(markAllCustomerNotificationsRead).mockResolvedValue();
    vi.mocked(markCustomerNotificationRead).mockResolvedValue();
    replace.mockClear();
  });

  it("does not show a start ordering link when no table is selected", async () => {
    render(<CustomerHeader />);

    await vi.waitFor(() => expect(getCurrentCustomerSalesSession).toHaveBeenCalled());
    expect(screen.queryByRole("link", { name: "Bắt đầu gọi món" })).not.toBeInTheDocument();
  });

  it("shows the selected table", async () => {
    vi.mocked(getCurrentCustomerSalesSession).mockResolvedValue({
      customerInformationRequired: false,
      joinSessionRequired: false,
      joinableSessions: [],
      sessionStatus: "OPEN",
      tableCode: 5,
    });

    render(<CustomerHeader />);

    expect(await screen.findByText("Bàn 05")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Thông báo khuyến mãi và hệ thống" }),
    ).toBeInTheDocument();
  });

  it("shows the slogan and branch instead of the brand name", async () => {
    render(<CustomerHeader />);
    expect(screen.getByRole("img", { name: "Logo cửa hàng" })).toHaveAttribute(
      "src",
      "/images/bambu-garden-wordmark.svg",
    );
    const branch = await screen.findByRole("button", { name: "Cơ sở hiện tại" });
    expect(branch).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(branch);
    expect(screen.getByText("Bạn đang ở cơ sở Chi nhánh 1")).toBeInTheDocument();
    expect(branch).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(branch);
    expect(branch).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Vui trọn từng bàn")).toBeInTheDocument();
    expect(screen.queryByText("Thương hiệu CAS")).not.toBeInTheDocument();
  });

  it("hides the default branch when no store is selected", async () => {
    vi.mocked(getRememberedPublicStoreId).mockReturnValue(null);
    render(<CustomerHeader />);
    expect(await screen.findByText("Vui trọn từng bàn")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cơ sở hiện tại" })).not.toBeInTheDocument();
  });

  it("clears the branch on logout", async () => {
    render(<CustomerHeader />);
    expect(await screen.findByRole("button", { name: "Cơ sở hiện tại" })).toBeInTheDocument();
    vi.mocked(getRememberedPublicStoreId).mockReturnValue(null);
    fireEvent(window, new Event("cas-customer-logout"));
    expect(screen.queryByRole("button", { name: "Cơ sở hiện tại" })).not.toBeInTheDocument();
  });

  it("redirects a payment-pending session to payment", async () => {
    vi.mocked(getCurrentCustomerSalesSession).mockResolvedValue({
      customerInformationRequired: false,
      joinSessionRequired: false,
      joinableSessions: [],
      sessionStatus: "PAYMENT_PENDING",
      tableCode: 5,
    });

    render(<CustomerHeader />);

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/payment"));
  });

  it("marks only the selected unread notification as read", async () => {
    render(<CustomerHeader />);

    fireEvent.click(screen.getByRole("button", { name: "Thông báo khuyến mãi và hệ thống" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Đánh dấu thông báo Ưu đãi hôm nay là đã đọc" }),
    );

    expect(markCustomerNotificationRead).toHaveBeenCalledWith(1);
    expect(markAllCustomerNotificationsRead).not.toHaveBeenCalled();
  });

  it("clears stale notifications when the customer session expires", async () => {
    render(<CustomerHeader />);
    const bell = screen.getByRole("button", { name: "Thông báo khuyến mãi và hệ thống" });
    fireEvent.click(bell);
    expect(await screen.findByText("Ưu đãi hôm nay")).toBeInTheDocument();
    fireEvent.click(bell);
    vi.mocked(loadCustomerNotifications).mockRejectedValueOnce(
      Object.assign(new Error("Phiên đã kết thúc"), { status: 401 }),
    );
    fireEvent.click(bell);
    await vi.waitFor(() => expect(screen.queryByText("Ưu đãi hôm nay")).not.toBeInTheDocument());
  });

  it("clears a stale notification if the session expires while marking it read", async () => {
    vi.mocked(markCustomerNotificationRead).mockRejectedValueOnce(
      Object.assign(new Error("Phiên đã kết thúc"), { status: 401 }),
    );
    render(<CustomerHeader />);
    fireEvent.click(screen.getByRole("button", { name: "Thông báo khuyến mãi và hệ thống" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Đánh dấu thông báo Ưu đãi hôm nay là đã đọc" }),
    );
    await vi.waitFor(() => expect(screen.queryByText("Ưu đãi hôm nay")).not.toBeInTheDocument());
  });
});
