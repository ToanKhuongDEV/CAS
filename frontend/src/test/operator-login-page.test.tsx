import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import OperatorLoginPage from "../app/(operator)/operator/login/page";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("OperatorLoginPage", () => {
  beforeEach(() => {
    push.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders and validates the employee login form", () => {
    render(<OperatorLoginPage />);

    expect(
      screen.getByRole("heading", { name: "Đăng nhập nhân viên" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Số điện thoại" })).toHaveAttribute(
      "type",
      "tel",
    );
    expect(screen.getByLabelText("Mật khẩu")).toHaveAttribute(
      "type",
      "password",
    );

    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(screen.getByText("Vui lòng nhập số điện thoại.")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập mật khẩu.")).toBeInTheDocument();
  });

  it("continues to the dashboard when both fields are present", () => {
    render(<OperatorLoginPage />);

    fireEvent.change(screen.getByRole("textbox", { name: "Số điện thoại" }), {
      target: { value: "0901234567" },
    });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "cas-operator" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(push).toHaveBeenCalledWith("/operator/dashboard");
  });
});
