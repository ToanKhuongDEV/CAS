import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CustomerInformationPage from "../app/(customer)/table/[token]/page";

describe("CustomerInformationPage", () => {
  it("renders the first-customer information form", () => {
    render(<CustomerInformationPage />);

    expect(
      screen.getByRole("heading", { name: "Thông tin bàn 05" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Tên của bạn")).toBeRequired();
    expect(screen.getByLabelText("Số điện thoại")).toBeRequired();
    expect(
      screen.getByRole("button", { name: "Vào thực đơn" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("3 người khác đang xem menu"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/ốc/i)).not.toBeInTheDocument();
  });
});
