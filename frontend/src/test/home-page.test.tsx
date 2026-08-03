import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "../app/page";

describe("Home", () => {
  it("renders the CAS welcome experience", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /chào mừng bạn đến cas/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Bàn 05")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /bắt đầu gọi món/i }),
    ).toHaveAttribute("href", "/menu");
    expect(
      screen.getByRole("heading", { name: "Khám phá thực đơn" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Mỳ cay")).toBeInTheDocument();
    expect(screen.getByText("Gà rán")).toBeInTheDocument();
    expect(screen.queryByText(/các loại ốc/i)).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Chuyển đổi giao diện sáng hoặc tối",
      }),
    );

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });
});
