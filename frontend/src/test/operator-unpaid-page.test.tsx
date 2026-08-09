import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OperatorUnpaidView } from "../components/operator/operator-unpaid-view";

describe("OperatorUnpaidView", () => {
  it("renders the list of unpaid records and opens bill snapshot modal on click", () => {
    render(<OperatorUnpaidView />);

    // Verify page title and unpaid records
    expect(
      screen.getByRole("heading", { level: 1, name: "Khoản chưa thanh toán" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Bàn 09")).toBeInTheDocument();
    expect(screen.getByText("320.000đ")).toBeInTheDocument();

    // Open snapshot modal for Bàn 09
    const snapshotButtons = screen.getAllByRole("button", { name: /xem bill snapshot/i });
    fireEvent.click(snapshotButtons[0]);

    // Verify modal content
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("BILL-20260808-009")).toBeInTheDocument();
    expect(screen.getByText("Mỳ Cay Hải Sản")).toBeInTheDocument();
    expect(screen.getByText("Trà Sữa Ô Long")).toBeInTheDocument();
    expect(screen.getAllByText("320.000đ").length).toBeGreaterThan(0);

    // Switch to JSON tab
    const jsonTabButton = screen.getByRole("button", { name: "JSON" });
    fireEvent.click(jsonTabButton);
    expect(screen.getByText(/billNumber/)).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByRole("button", { name: "Đóng bill snapshot" });
    fireEvent.click(closeButton);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("allows marking an open record as resolved", () => {
    render(<OperatorUnpaidView />);

    // Open snapshot modal for Bàn 09
    const snapshotButtons = screen.getAllByRole("button", { name: /xem bill snapshot/i });
    fireEvent.click(snapshotButtons[0]);

    // Click resolve button in modal
    const resolveButton = screen.getByRole("button", { name: /xác nhận đã thu tiền/i });
    fireEvent.click(resolveButton);

    // Verify status changed to RESOLVED
    expect(screen.getByText(/Đã đánh dấu khoản chưa thanh toán của Bàn 09/i)).toBeInTheDocument();
  });
});
