import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import OperatorLoginPage from "../app/(operator)/operator/login/page";
import { signInOperationalUser } from "../lib/auth/operational-auth";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("../lib/auth/operational-auth", () => ({
  signInOperationalUser: vi.fn(),
  signOutOperationalUser: vi.fn(),
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

  it("continues to the dashboard when Firebase returns an operator account", async () => {
    vi.mocked(signInOperationalUser).mockResolvedValue({
      accountId: 7,
      storeId: 2,
      displayName: "Operator One",
      role: "OPERATOR",
    });
    render(<OperatorLoginPage />);

    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), {
      target: { value: "operator@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "cas-operator" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/operator/dashboard"));
  });
});
