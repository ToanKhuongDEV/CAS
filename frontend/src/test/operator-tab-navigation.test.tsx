import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OperatorTabNavigation } from "../components/operator/operator-tab-navigation";

vi.mock("next/navigation", () => ({
  usePathname: () => "/operator/orders",
}));

describe("OperatorTabNavigation", () => {
  it("renders five separate operator routes and marks the current tab", () => {
    render(<OperatorTabNavigation />);

    const expectedTabs = [
      ["Tổng quan", "/operator/dashboard"],
      ["Đơn gọi món", "/operator/orders"],
      ["Hủy món", "/operator/cancellations"],
      ["Thanh toán", "/operator/payments"],
      ["Chưa thanh toán", "/operator/unpaid"],
    ];

    expectedTabs.forEach(([label, href]) => {
      expect(screen.getByRole("link", { name: label })).toHaveAttribute(
        "href",
        href,
      );
    });
    expect(screen.getByRole("link", { name: "Đơn gọi món" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
