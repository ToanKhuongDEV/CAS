import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import AdminNotificationsPage from "../app/admin/notifications/page";
import { loadAdminNotifications } from "../lib/api/notification/notification.api";

vi.mock("../lib/api/notification/notification.api", () => ({
  loadAdminNotifications: vi.fn(),
  createAdminNotification: vi.fn(),
  deleteAdminNotification: vi.fn(),
}));

it("shows admin-specific content and falls back to the original", async () => {
  vi.mocked(loadAdminNotifications).mockResolvedValue([
    {
      id: 1,
      title: "Hủy món",
      content: "Đã hủy",
      adminContent: "Đã hủy (Bàn 5, Khách: An)",
      type: "INFO",
      targetRole: "CUSTOMER",
      createdAt: "2026-11-11T07:37:37",
      updatedAt: "2026-11-11T07:37:37",
    },
    {
      id: 2,
      title: "Tin khác",
      content: "Nội dung gốc",
      type: "INFO",
      targetRole: "BOTH",
      createdAt: "2026-11-11T07:37:37",
      updatedAt: "2026-11-11T07:37:37",
    },
  ]);
  render(<AdminNotificationsPage />);
  expect(await screen.findByText("Đã hủy (Bàn 5, Khách: An)")).toBeInTheDocument();
  expect(screen.getByText("Nội dung gốc")).toBeInTheDocument();
});
