import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CustomerInformationPage from "../app/(customer)/table/[token]/page";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("CustomerInformationPage", () => {
  beforeEach(() => {
    push.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the first-customer information form", () => {
    render(<CustomerInformationPage />);

    expect(
      screen.getByRole("heading", { name: "Mở phiên gọi món" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Tên của bạn" }),
    ).toBeRequired();
    expect(
      screen.getByRole("textbox", { name: "Số điện thoại" }),
    ).toBeRequired();
    expect(
      screen.getByRole("button", { name: "Mở phiên và xem thực đơn" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Thông tin này được dùng để xác định người đại diện mở phiên bàn.",
      ),
    ).toBeInTheDocument();
  });

  it("shows field errors and focuses the first invalid input", () => {
    render(<CustomerInformationPage />);

    fireEvent.click(
      screen.getByRole("button", { name: "Mở phiên và xem thực đơn" }),
    );

    expect(screen.getByText("Vui lòng nhập tên của bạn.")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập số điện thoại.")).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Tên của bạn" }),
    ).toHaveFocus();
    expect(push).not.toHaveBeenCalled();
  });

  it("continues to the menu when required information is present", () => {
    render(<CustomerInformationPage />);

    fireEvent.change(
      screen.getByRole("textbox", { name: "Tên của bạn" }),
      {
        target: { value: "Nguyễn Văn A" },
      },
    );
    fireEvent.change(
      screen.getByRole("textbox", { name: "Số điện thoại" }),
      {
        target: { value: "0901234567" },
      },
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Mở phiên và xem thực đơn" }),
    );

    expect(push).toHaveBeenCalledWith("/menu");
  });
});
