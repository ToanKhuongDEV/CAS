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

  it("renders and validates the operator login form", () => {
    render(<OperatorLoginPage />);

    expect(screen.getByRole("heading", { name: "Đăng nhập nhân viên" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Mật khẩu")).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(screen.getByText("Vui lòng nhập email.")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập mật khẩu.")).toBeInTheDocument();
  });

  it("continues to the dashboard when both fields are present", () => {
    render(<OperatorLoginPage />);

    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), {
      target: { value: "operator@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "cas-operator" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(push).toHaveBeenCalledWith("/operator/dashboard");
  });
});
