import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import AdminOperatorsPage from "../app/admin/operators/page";

describe("AdminOperatorsPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("validates required account fields before creating an operator", () => {
    render(<AdminOperatorsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Tạo tài khoản Nhân viên" }));
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận Tạo" }));

    expect(screen.getByText("Vui lòng nhập họ và tên nhân viên.")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập email.")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập số điện thoại liên hệ.")).toBeInTheDocument();
  });

  it("creates an operator when display name, email, and phone are valid", () => {
    render(<AdminOperatorsPage />);

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

    expect(screen.queryByRole("heading", { name: "Thêm Tài khoản Nhân viên Mới" })).not.toBeInTheDocument();
    expect(screen.getByText("Phạm Minh D")).toBeInTheDocument();
  });
});
