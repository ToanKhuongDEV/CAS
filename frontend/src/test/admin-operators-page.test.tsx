import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AdminOperatorsPage from "../app/admin/operators/page";
import { QueryProvider } from "../components/providers/query-provider";
import { createOperator, loadOperators } from "../lib/api/operation/operational-management.api";

vi.mock("../lib/api/operation/operational-management.api", () => ({
  createOperator: vi.fn(),
  deactivateOperator: vi.fn(),
  activateOperator: vi.fn(),
  loadOperators: vi.fn(),
}));

const createOperatorMock = vi.mocked(createOperator);
const loadOperatorsMock = vi.mocked(loadOperators);

describe("AdminOperatorsPage", () => {
  beforeEach(() => {
    loadOperatorsMock.mockResolvedValue([]);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("validates required account fields before creating an operator", async () => {
    render(
      <QueryProvider>
        <AdminOperatorsPage />
      </QueryProvider>,
    );
    await waitFor(() => expect(loadOperatorsMock).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Tạo tài khoản Nhân viên" }));
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận Tạo" }));

    expect(screen.getByText("Vui lòng nhập họ và tên nhân viên.")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập email.")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập số điện thoại liên hệ.")).toBeInTheDocument();
  });

  it("creates an operator when display name, email, and phone are valid", async () => {
    createOperatorMock.mockResolvedValue({
      displayName: "Phạm Minh D",
      firebaseUid: "firebase-operator-1",
      id: 99,
      status: "ACTIVE",
    });
    loadOperatorsMock.mockResolvedValueOnce([]).mockResolvedValueOnce([
      {
        createdAt: "2026-10-19T00:00:00Z",
        displayName: "Phạm Minh D",
        email: "levanc@example.com",
        id: 99,
        lastLoginAt: null,
        phone: "0901234567",
        status: "ACTIVE",
      },
    ]);

    render(
      <QueryProvider>
        <AdminOperatorsPage />
      </QueryProvider>,
    );
    await waitFor(() => expect(loadOperatorsMock).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Tạo tài khoản Nhân viên" }));
    fireEvent.change(screen.getByLabelText("Họ và Tên Nhân viên:"), {
      target: { value: "Phạm Minh D" },
    });
    fireEvent.change(screen.getByLabelText("Email đăng nhập:"), {
      target: { value: "levanc@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Số điện thoại liên hệ:"), {
      target: { value: "0901234567" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận Tạo" }));

    expect(await screen.findByText("Phạm Minh D")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Thêm Tài khoản Nhân viên Mới" }),
    ).not.toBeInTheDocument();
  });
});
