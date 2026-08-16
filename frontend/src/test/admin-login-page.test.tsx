import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AdminLoginPage from "../app/admin/login/page";
import { signInOperationalUser } from "../lib/auth/operational-auth";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("../lib/auth/operational-auth", () => ({
  signInOperationalUser: vi.fn(),
  signOutOperationalUser: vi.fn(),
}));

describe("AdminLoginPage", () => {
  beforeEach(() => {
    push.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("continues to the admin home when Firebase returns an admin account", async () => {
    vi.mocked(signInOperationalUser).mockResolvedValue({
      accountId: 7,
      storeId: 2,
      displayName: "Admin One",
      role: "ADMIN",
    });
    render(<AdminLoginPage />);

    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "cas-admin" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/admin"));
  });
});
