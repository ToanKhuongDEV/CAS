import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CustomerHeader } from "../components/customer/customer-header";
import { getCurrentCustomerTableSession } from "../lib/customer/table-session";
import {
  loadCustomerNotifications,
  markAllCustomerNotificationsRead,
  markCustomerNotificationRead,
} from "../lib/api/notification/notification.api";

vi.mock("../lib/customer/table-session", () => ({ getCurrentCustomerTableSession: vi.fn() }));
const replace = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/menu",
  useRouter: () => ({ replace }),
}));
vi.mock("../lib/api/store/public-store.api", () => ({
  loadPublicStore: vi.fn().mockResolvedValue({ logoUrl: null, name: "CAS" }),
}));
vi.mock("../lib/api/notification/notification.api", () => ({
  loadCustomerNotifications: vi.fn(),
  markAllCustomerNotificationsRead: vi.fn(),
  markCustomerNotificationRead: vi.fn(),
}));

describe("CustomerHeader", () => {
  beforeEach(() => {
    vi.mocked(getCurrentCustomerTableSession).mockRejectedValue(new Error("No active table"));
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

  it("links an unselected table indicator to QR scanning", async () => {
    render(<CustomerHeader />);

    expect(await screen.findByRole("link", { name: "Chọn bàn bằng mã QR" })).toHaveAttribute(
      "href",
      "/scan",
    );
  });

  it("redirects a payment-pending session to payment", async () => {
    vi.mocked(getCurrentCustomerTableSession).mockResolvedValue({
      customerInformationRequired: false,
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
});
