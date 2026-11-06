import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminOperatorsPage from "../app/admin/operators/page";
import { QueryProvider } from "../components/providers/query-provider";
import { ToastProvider } from "../components/ui/toast-provider";
import {
  createAdmin,
  createOperator,
  loadAdmins,
  deactivateAdmin,
  activateAdmin,
} from "../lib/api/operation/operational-management.api";

vi.mock("../lib/api/operation/operational-management.api", () => ({
  createAdmin: vi.fn().mockResolvedValue({ displayName: "Test" }),
  createOperator: vi.fn().mockResolvedValue({ displayName: "Test" }),
  loadOperators: vi.fn().mockResolvedValue([]),
  loadAdmins: vi.fn().mockResolvedValue([]),
  deactivateOperator: vi.fn(),
  activateOperator: vi.fn(),
  deactivateAdmin: vi.fn().mockResolvedValue(undefined),
  activateAdmin: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../lib/auth/firebase", () => ({ getFirebaseAuth: () => ({ currentUser: {} }) }));
vi.mock("../lib/auth/operational-auth", () => ({
  getCurrentOperationalAccount: vi.fn().mockResolvedValue({ role: "SUPER_ADMIN" }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AdminAccountsPage", () => {
  it.each([
    ["ADMIN", createAdmin],
    ["OPERATOR", createOperator],
  ] as const)("creates %s", async (role, create) => {
    render(
      <QueryProvider>
        <ToastProvider>
          <AdminOperatorsPage />
        </ToastProvider>
      </QueryProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Tạo tài khoản Nhân viên" }));
    fireEvent.change(await screen.findByLabelText("Loại tài khoản"), { target: { value: role } });
    fireEvent.change(
      screen.getByLabelText(role === "ADMIN" ? "Họ và Tên Quản trị viên:" : "Họ và Tên Nhân viên:"),
      { target: { value: "Test" } },
    );
    fireEvent.change(screen.getByLabelText("Email đăng nhập:"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Số điện thoại liên hệ:"), {
      target: { value: "0901234567" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận Tạo" }));
    await waitFor(() =>
      expect(create).toHaveBeenCalledWith({
        displayName: "Test",
        email: "test@example.com",
        phone: "0901234567",
      }),
    );
    expect(screen.queryByLabelText("Firebase UID")).not.toBeInTheDocument();
    expect(await screen.findByRole("status")).toHaveTextContent(`Đã tạo tài khoản ${role}: Test.`);
  });

  it("shows the newly created admin in the account list", async () => {
    const admin = {
      id: 9,
      displayName: "Admin mới",
      email: "admin@example.com",
      phone: "0901234567",
      status: "ACTIVE" as const,
      createdAt: "2026-10-28",
      lastLoginAt: null,
    };
    vi.mocked(loadAdmins).mockResolvedValueOnce([]).mockResolvedValueOnce([admin]);
    render(
      <QueryProvider>
        <ToastProvider>
          <AdminOperatorsPage />
        </ToastProvider>
      </QueryProvider>,
    );
    await waitFor(() => expect(loadAdmins).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Tạo tài khoản Nhân viên" }));
    fireEvent.change(await screen.findByLabelText("Loại tài khoản"), {
      target: { value: "ADMIN" },
    });
    fireEvent.change(screen.getByLabelText("Họ và Tên Quản trị viên:"), {
      target: { value: "Admin mới" },
    });
    fireEvent.change(screen.getByLabelText("Email đăng nhập:"), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Số điện thoại liên hệ:"), {
      target: { value: "0901234567" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận Tạo" }));
    const row = (await screen.findByRole("cell", { name: "Admin mới" })).closest("tr");
    expect(row).toHaveTextContent("ADMIN");
    expect(row).toHaveTextContent("Khóa tài khoản");
  });

  it.each([
    ["ACTIVE", "INACTIVE", "Khóa tài khoản", deactivateAdmin],
    ["INACTIVE", "ACTIVE", "Kích hoạt", activateAdmin],
  ] as const)("changes admin status from %s to %s", async (initial, next, button, action) => {
    const admin = {
      id: 9,
      displayName: "Admin Nine",
      email: "admin@example.com",
      phone: "0901234567",
      status: initial,
      createdAt: "2026-10-28",
      lastLoginAt: null,
    };
    vi.mocked(loadAdmins)
      .mockResolvedValueOnce([admin])
      .mockResolvedValueOnce([{ ...admin, status: next }]);
    render(
      <QueryProvider>
        <ToastProvider>
          <AdminOperatorsPage />
        </ToastProvider>
      </QueryProvider>,
    );
    const row = (await screen.findByRole("cell", { name: "Admin Nine" })).closest("tr")!;
    fireEvent.click(within(row).getByRole("button", { name: button }));
    await waitFor(() => expect(action).toHaveBeenCalledWith(9));
    await waitFor(() =>
      expect(row).toHaveTextContent(next === "ACTIVE" ? "ĐANG HOẠT ĐỘNG" : "ĐÃ KHÓA"),
    );
  });
});
