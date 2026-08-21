import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OperatorTabNavigation } from "../components/operator/operator-tab-navigation";

vi.mock("next/navigation", () => ({
  usePathname: () => "/operator/orders/ORD-0819",
}));

describe("OperatorTabNavigation", () => {
  it("renders six separate routes and keeps the parent tab active on order detail", () => {
    render(<OperatorTabNavigation />);

    const expectedTabs = [
      [/Tổng quan/, "/operator/dashboard"],
      [/Đơn gọi món/, "/operator/orders"],
      [/Hủy món/, "/operator/cancellations"],
      [/Thanh toán/, "/operator/payments"],
      [/Chưa thanh toán/, "/operator/unpaid"],
      [/Dịch vụ thêm/, "/operator/services"],
    ] as const;

    expectedTabs.forEach(([nameRegex, href]) => {
      expect(screen.getByRole("link", { name: nameRegex })).toHaveAttribute("href", href);
    });
    expect(screen.getByRole("link", { name: /Đơn gọi món/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getAllByText("3")).toHaveLength(2);
    expect(screen.getAllByText("1")).toHaveLength(2);
  });
});
