import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import PaymentPage from "../app/(customer)/payment/page";
import { PaymentRequestPanel } from "../app/(customer)/payment/payment-request-panel";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("PaymentPage", () => {
  afterEach(() => {
    cleanup();
    push.mockClear();
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

  it("replaces the pending state with a completion screen after payment becomes paid", () => {
    const { rerender } = render(
      <PaymentRequestPanel paymentStatus="PENDING" />,
    );

    expect(
      screen.getByRole("dialog", { name: "Yêu cầu thanh toán đã được gửi" }),
    ).toBeInTheDocument();

    rerender(
      <PaymentRequestPanel
        paymentStatus="PAID"
        confirmedAt="20:05"
        tableQrToken="qr-ban-05"
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Thanh toán thành công" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Bàn 05")).toBeInTheDocument();
    expect(screen.getByText("170.000đ")).toBeInTheDocument();
    expect(screen.getByText("20:05")).toBeInTheDocument();
    expect(
      screen.getByText("Cảm ơn bạn đã sử dụng dịch vụ tại CAS."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Phiên gọi món của bàn đã kết thúc/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Bàn đã được đóng và không thể gọi thêm món/),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Tiếp tục tạo đơn mới" }),
    );
    expect(push).toHaveBeenCalledWith("/table/qr-ban-05");
    expect(
      screen.queryByText(/ngân hàng|mã giao dịch|qr thanh toán/i),
    ).not.toBeInTheDocument();
  });
});
