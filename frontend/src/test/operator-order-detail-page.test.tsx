import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import OperatorOrderDetailPage, {
  generateMetadata,
} from "../app/(operator)/operator/(workspace)/orders/[orderNumber]/page";

describe("OperatorOrderDetailPage", () => {
  it("renders the items, options, progress, note, and totals of one order", async () => {
    const page = await OperatorOrderDetailPage({
      params: Promise.resolve({ orderNumber: "ORD-0819" }),
    });

    render(page);

    expect(screen.getByRole("heading", { name: "Đơn của Bàn 03" })).toBeInTheDocument();
    expect(screen.getAllByText("Bàn 03").length).toBeGreaterThan(0);
    expect(screen.getByText("Bò sốt tiêu đen")).toBeInTheDocument();
    expect(screen.getByText("Chín vừa")).toBeInTheDocument();
    expect(screen.getByText("+ Thêm nấm đùi gà")).toBeInTheDocument();
    expect(screen.getByText("Khoai tây chiên")).toBeInTheDocument();
    expect(screen.getByText("+ Thêm sốt phô mai")).toBeInTheDocument();
    expect(screen.getByText("Đã làm 0/4 phần")).toBeInTheDocument();
    expect(screen.getByText("Hoàn thành")).toBeInTheDocument();
    expect(screen.getByText("Bò làm chín vừa, mang khoai ra trước nếu xong.")).toBeInTheDocument();
    expect(screen.getAllByText("345.000đ").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Quay lại danh sách" })).toHaveAttribute(
      "href",
      "/operator/orders",
    );
  });

  it("builds metadata from the selected order", async () => {
    await expect(
      generateMetadata({
        params: Promise.resolve({ orderNumber: "ord-0819" }),
      }),
    ).resolves.toEqual({
      title: "Đơn của Bàn 03 · 18:55 | CAS",
    });
  });
});
