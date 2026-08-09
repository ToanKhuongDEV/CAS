import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CustomerSettingsPage from "../app/(customer)/settings/page";

describe("CustomerSettingsPage", () => {
  it("renders appearance settings and the default customer navigation", () => {
    render(<CustomerSettingsPage />);

    expect(screen.getByRole("heading", { name: "Cài đặt", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Chuyển đổi giữa chế độ sáng và tối.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Chuyển đổi giao diện sáng hoặc tối",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Thanh toán" })).not.toBeInTheDocument();
  });
});
