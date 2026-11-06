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
  rememberPublicStoreId: vi.fn(),
}));
vi.mock("../lib/customer/sales-session", () => ({
  openCustomerTakeawaySalesSession: vi.fn(),
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
      googleMapsLocation: "https://maps.google.com/?q=cas",
      logoStorageKey: "stores/cas-logo",
      logoUrl: "https://cdn.example.com/cas-logo.png",
      name: "CAS Mỳ Cay",
      brandName: "Bambu Garden",
      openTime: "08:00:00",
      phone: "0900000000",
      status: "ACTIVE",
      welcomeSlogan: "Vị ngon mỗi ngày",
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

  it("requires a selected branch before continuing to choose a table", async () => {
    vi.mocked(loadPublicStores).mockResolvedValue([
      {
        id: 1,
        branchName: "Cơ sở A",
        address: "Đường A",
        latitude: null,
        longitude: null,
        status: "ACTIVE",
      },
      {
        id: 2,
        branchName: "Cơ sở B",
        address: "Đường B",
        latitude: null,
        longitude: null,
        status: "ACTIVE",
      },
    ]);
    render(<StartOrderPage />);
    const continueButton = screen.getByRole("button", { name: "Tiếp tục chọn bàn" });
    expect(continueButton).toBeDisabled();
    fireEvent.click(continueButton);
    expect(push).not.toHaveBeenCalled();
    fireEvent.click(await screen.findByRole("button", { name: "Chi nhánh phục vụ" }));
    fireEvent.click(screen.getByRole("option", { name: /Cơ sở B/ }));
    expect(continueButton).toBeEnabled();
    fireEvent.click(continueButton);
    expect(push).toHaveBeenCalledWith("/scan?returnTo=%2Fmenu&storeId=2");
  });

  it("opens the QR screen directly for dine-in", async () => {
    render(<StartOrderPage />);

    expect(screen.getByRole("link", { name: "Quay lại trang chủ" })).toHaveAttribute("href", "/");
    expect(await screen.findByText("Vị ngon mỗi ngày")).toBeInTheDocument();
    expect(screen.getByText("Chào mừng bạn đến với Bambu Garden!")).toBeInTheDocument();
    expect(screen.getByText(/Vui lòng chọn hình thức dùng món/)).toBeInTheDocument();
    expect(screen.getByText("Bước 1 / 2")).toBeInTheDocument();
    expect(screen.getByText(/1 Đường A/, { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText(/08:00 – 22:00/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Xem bản đồ" })).toHaveAttribute(
      "href",
      "https://maps.google.com/?q=cas",
    );
    expect(screen.queryByText("CAS Mỳ Cay")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Logo Bambu Garden" })).toHaveAttribute(
      "src",
      "/images/bambu-garden-logo.png",
    );
    expect(screen.getByRole("button", { name: /Ăn tại quán/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Mang về/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Ăn tại quán/ }));
    fireEvent.click(screen.getByRole("button", { name: "Tiếp tục chọn bàn" }));

    expect(push).toHaveBeenCalledWith("/scan?returnTo=%2Fmenu&storeId=1");
  });

  it("opens a takeaway session after its required customer information", async () => {
    render(<StartOrderPage />);

    fireEvent.click(screen.getByRole("button", { name: /Mang về/ }));
    expect(screen.getByText("Bước 1 / 1")).toBeInTheDocument();
    await screen.findByRole("button", { name: "Chi nhánh phục vụ" });
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
