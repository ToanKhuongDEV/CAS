import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import PaymentPage from "../app/(customer)/payment/page";

describe("PaymentPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the session bill without bank or payment QR information", () => {
    render(<PaymentPage />);

    expect(
      screen.getByRole("heading", { name: "Kiểm tra hóa đơn" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Mỳ cay đặc biệt 7 cấp độ")).toBeInTheDocument();
    expect(screen.getByText("Tổng cần thanh toán")).toBeInTheDocument();
    expect(screen.getByText("170.000đ")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Gửi yêu cầu thanh toán" }),
    ).toBeEnabled();
    expect(
      screen.getByRole("link", { name: "Thanh toán" }),
    ).toHaveAttribute("href", "/payment");
    expect(screen.queryByText(/ngân hàng|mb bank|chuyển khoản/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /qr/i })).not.toBeInTheDocument();
  });

  it("shows the pending state and meet-operator instruction after submit", () => {
    render(<PaymentPage />);

    fireEvent.click(
      screen.getByRole("button", { name: "Gửi yêu cầu thanh toán" }),
    );

    expect(
      screen.getByText("Đang chờ nhân viên xác nhận"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/vui lòng ra gặp nhân viên để hoàn tất thanh toán/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Đã gửi yêu cầu thanh toán" }),
    ).toBeDisabled();
    expect(screen.queryByText(/\bpaid\b/i)).not.toBeInTheDocument();
  });
});
