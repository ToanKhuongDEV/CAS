import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CustomerHeader } from "../components/customer/customer-header";
import { getCurrentCustomerTableSession } from "../lib/customer/table-session";

vi.mock("../lib/customer/table-session", () => ({ getCurrentCustomerTableSession: vi.fn() }));
vi.mock("../lib/api/store/public-store.api", () => ({
  loadPublicStore: vi.fn().mockResolvedValue({ logoUrl: null, name: "CAS" }),
}));

describe("CustomerHeader", () => {
  beforeEach(() => {
    vi.mocked(getCurrentCustomerTableSession).mockRejectedValue(new Error("No active table"));
  });

  it("links an unselected table indicator to QR scanning", async () => {
    render(<CustomerHeader showThemeToggle={false} />);

    expect(await screen.findByRole("link", { name: "Chọn bàn bằng mã QR" })).toHaveAttribute(
      "href",
      "/scan",
    );
  });
});
