import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ScanTableQrPage from "../app/(customer)/scan/page";
import { ToastProvider } from "../components/ui/toast-provider";
import {
  resolveCustomerSalesSession,
  resolveCustomerSalesSessionByTable,
} from "../lib/customer/sales-session";
import { loadPublicStores } from "../lib/api/store/public-store.api";

const replace = vi.fn();
const searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
}));
vi.mock("../lib/customer/sales-session", () => ({
  resolveCustomerSalesSession: vi.fn(),
  resolveCustomerSalesSessionByTable: vi.fn(),
}));
vi.mock("../lib/api/store/public-store.api", () => ({
  loadPublicStores: vi.fn(),
  rememberPublicStoreId: vi.fn(),
}));

describe("ScanTableQrPage", () => {
  beforeEach(() => {
    replace.mockClear();
    window.sessionStorage.clear();
    vi.mocked(loadPublicStores).mockResolvedValue([
      {
        id: 1,
        name: "CAS",
        address: "1 Đường A",
        latitude: null,
        longitude: null,
        status: "ACTIVE",
      },
    ]);
  });

  it("keeps manual entry available when the QR token is invalid", async () => {
    vi.mocked(resolveCustomerSalesSession).mockRejectedValue(new Error("QR không hợp lệ"));
    render(
      <ToastProvider>
        <ScanTableQrPage />
      </ToastProvider>,
    );

    expect(screen.getByRole("link", { name: "Quay lại chọn loại đơn" })).toHaveAttribute(
      "href",
      "/start?returnTo=%2Fmenu",
    );

    const input = screen.getByRole("textbox", { name: "Nhập mã QR của bàn" });
    fireEvent.change(input, { target: { value: "Q00000000" } });
    fireEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));

    expect(await screen.findByText("QR không hợp lệ")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
    expect(input).toHaveValue("Q00000000");
    expect(input).toHaveFocus();
  });

  it("normalizes a manual table number before resolving it", async () => {
    vi.mocked(resolveCustomerSalesSessionByTable).mockResolvedValue({
      customerInformationRequired: false,
      joinSessionRequired: false,
      joinableSessions: [],
      sessionStatus: "OPEN",
      tableCode: 1,
    });
    render(
      <ToastProvider>
        <ScanTableQrPage />
      </ToastProvider>,
    );

    fireEvent.change(await screen.findByRole("textbox", { name: "Số bàn" }), {
      target: { value: "01abc" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Tiếp tục với số bàn" }));

    await vi.waitFor(() =>
      expect(resolveCustomerSalesSessionByTable).toHaveBeenCalledWith({ storeId: 1, tableCode: 1 }),
    );
  });
});
