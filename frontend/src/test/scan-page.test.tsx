import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ScanTableQrPage from "../app/(customer)/scan/page";
import { resolveCustomerTableSession } from "../lib/customer/table-session";

const replace = vi.fn();
const searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
}));
vi.mock("../lib/customer/table-session", () => ({ resolveCustomerTableSession: vi.fn() }));

describe("ScanTableQrPage", () => {
  beforeEach(() => {
    replace.mockClear();
    window.sessionStorage.clear();
  });

  it("keeps manual entry available when the QR token is invalid", async () => {
    vi.mocked(resolveCustomerTableSession).mockRejectedValue(new Error("QR không hợp lệ"));
    render(<ScanTableQrPage />);

    const input = screen.getByRole("textbox", { name: "Nhập mã QR của bàn" });
    fireEvent.change(input, { target: { value: "Q00000000" } });
    fireEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));

    expect(
      await screen.findByText("Mã QR không hợp lệ. Hãy quét mã QR của bàn CAS."),
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
    expect(input).toHaveValue("Q00000000");
    expect(input).toHaveFocus();
  });
});
