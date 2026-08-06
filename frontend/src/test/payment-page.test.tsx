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
    expect(screen.getAllByText("Giá món gốc")).toHaveLength(3);
    expect(screen.getByText("+ Thêm xúc xích")).toBeInTheDocument();
    expect(screen.queryByText("Tổng món")).not.toBeInTheDocument();
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

  it("blocks other activity with the cashier instruction after submit", () => {
    render(<PaymentPage />);

    fireEvent.click(
      screen.getByRole("button", { name: "Gửi yêu cầu thanh toán" }),
    );

    expect(
      screen.getByRole("dialog", { name: "Yêu cầu thanh toán đã được gửi" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Vui lòng đến quầy thu ngân để thanh toán và chờ nhân viên xác nhận.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Đã gửi yêu cầu thanh toán" }),
    ).toBeDisabled();
    expect(screen.queryByText("Đang chờ nhân viên xác nhận")).not.toBeInTheDocument();
  });
});
