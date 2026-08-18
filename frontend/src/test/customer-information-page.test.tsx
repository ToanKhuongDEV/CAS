import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CustomerInformationPage from "../app/(customer)/table/[token]/page";
import { resolveCustomerTableSession } from "../lib/customer/table-session";

const push = vi.fn();
const searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useParams: () => ({ token: "qr-ban-05" }),
  useRouter: () => ({ push }),
  useSearchParams: () => searchParams,
}));

vi.mock("../lib/customer/table-session", () => ({
  resolveCustomerTableSession: vi.fn(),
}));

describe("CustomerInformationPage", () => {
  beforeEach(() => {
    push.mockClear();
    window.sessionStorage.clear();
    vi.mocked(resolveCustomerTableSession).mockResolvedValue({
      customerInformationRequired: true,
      sessionStatus: "CUSTOMER_INFORMATION_REQUIRED",
      tableCode: 5,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the first-customer information form", async () => {
    render(<CustomerInformationPage />);

    expect(await screen.findByRole("heading", { name: "Mở phiên gọi món" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Tên của bạn" })).toBeRequired();
    expect(screen.getByRole("textbox", { name: /Số điện thoại/i })).not.toBeRequired();
    expect(screen.getByRole("button", { name: "Mở phiên và xem thực đơn" })).toBeInTheDocument();
    expect(
      screen.getByText("Thông tin này được dùng để xác định người đại diện mở phiên bàn."),
    ).toBeInTheDocument();
    expect(window.sessionStorage.getItem("cas.tableQrToken")).toBe("qr-ban-05");
  });

  it("shows a name error and focuses the invalid input", async () => {
    render(<CustomerInformationPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Mở phiên và xem thực đơn" }));

    expect(screen.getByText("Vui lòng nhập tên của bạn.")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Tên của bạn" })).toHaveFocus();
    expect(push).not.toHaveBeenCalled();
  });

  it("continues to the menu when required information is present", async () => {
    render(<CustomerInformationPage />);

    fireEvent.change(await screen.findByRole("textbox", { name: "Tên của bạn" }), {
      target: { value: "Nguyễn Văn A" },
    });
    vi.mocked(resolveCustomerTableSession).mockResolvedValue({
      customerInformationRequired: false,
      sessionStatus: "OPEN",
      tableCode: 5,
    });
    fireEvent.click(screen.getByRole("button", { name: "Mở phiên và xem thực đơn" }));

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/menu"));
  });
});
