import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import StartOrderPage from "../app/(customer)/start/page";
import { loadPublicStore, loadPublicStores } from "../lib/api/store/public-store.api";
import { openCustomerTakeawaySalesSession } from "../lib/customer/sales-session";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("../lib/api/store/public-store.api", () => ({
  loadPublicStore: vi.fn(),
  loadPublicStores: vi.fn(),
}));
vi.mock("../lib/customer/sales-session", () => ({
  openCustomerTakeawaySalesSession: vi.fn(),
  resolveCustomerSalesSessionByTable: vi.fn(),
}));

describe("StartOrderPage", () => {
  beforeEach(() => {
    push.mockClear();
    vi.mocked(loadPublicStores).mockResolvedValue([
      {
        id: 1,
        name: "CAS",
        address: "1 Đường A",
        latitude: 10.7769,
        longitude: 106.7009,
        status: "ACTIVE",
      },
    ]);
    vi.mocked(loadPublicStore).mockResolvedValue({
      address: "1 Đường A",
      closeTime: "22:00:00",
      email: "hello@cas.local",
      googleMapsLocation: null,
      logoStorageKey: "stores/cas-logo",
      logoUrl: "https://cdn.example.com/cas-logo.png",
      name: "CAS Mỳ Cay",
      openTime: "08:00:00",
      phone: "0900000000",
      status: "ACTIVE",
      welcomeSlogan: null,
    });
    vi.mocked(openCustomerTakeawaySalesSession).mockResolvedValue({
      customerInformationRequired: false,
      joinSessionRequired: false,
      joinableSessions: [],
      sessionStatus: "OPEN",
      tableCode: null,
    });
  });

  afterEach(cleanup);

  it("keeps QR scanning independent from branch selection", async () => {
    render(<StartOrderPage />);

    expect(await screen.findByText("CAS Mỳ Cay")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Logo CAS Mỳ Cay" })).toHaveAttribute(
      "src",
      "https://cdn.example.com/cas-logo.png",
    );
    expect(screen.getByRole("button", { name: "Ăn tại quán" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mang về" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ăn tại quán" }));

    expect(screen.getByRole("button", { name: "Quét mã QR bàn" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Chi nhánh" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Chọn số bàn" }));

    expect(await screen.findByRole("button", { name: "Chi nhánh" })).toBeInTheDocument();
  });

  it("accepts a numeric table code with a leading zero", async () => {
    render(<StartOrderPage />);

    fireEvent.click(screen.getByRole("button", { name: "Ăn tại quán" }));
    fireEvent.click(screen.getByRole("button", { name: "Chọn số bàn" }));
    await screen.findByRole("button", { name: "Chi nhánh" });
    fireEvent.change(screen.getByRole("textbox", { name: "Số bàn" }), {
      target: { value: "01abc" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));

    expect(push).toHaveBeenCalledWith("/table/manual?storeId=1&tableCode=1&returnTo=%2Fmenu");
  });

  it("opens a takeaway session after its required customer information", async () => {
    render(<StartOrderPage />);

    fireEvent.click(screen.getByRole("button", { name: "Mang về" }));
    await screen.findByRole("button", { name: "Chi nhánh" });
    fireEvent.change(screen.getByRole("textbox", { name: "Tên của bạn" }), {
      target: { value: "Nguyễn Văn A" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /Số điện thoại/i }), {
      target: { value: "0901 234 567" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Tạo đơn mang về" }));

    await vi.waitFor(() =>
      expect(openCustomerTakeawaySalesSession).toHaveBeenCalledWith({
        customerName: "Nguyễn Văn A",
        customerPhone: "0901234567",
        storeId: 1,
      }),
    );
    expect(push).toHaveBeenCalledWith("/menu");
  });
});
