import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import IncidentCancellationPage from "../app/(operator)/operator/(workspace)/cancellations/new/page";
import { loadPreparationGroups } from "../lib/api/ordering/preparation.api";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("../lib/api/ordering/cancellation.api", () => ({
  createOperatorIncidentCancellation: vi.fn(),
}));
vi.mock("../lib/api/ordering/preparation.api", () => ({ loadPreparationGroups: vi.fn() }));

describe("IncidentCancellationPage", () => {
  it("does not show mock order items when the preparation API fails", async () => {
    vi.mocked(loadPreparationGroups).mockRejectedValue(new Error("Không thể tải món."));

    render(<IncidentCancellationPage />);

    expect(await screen.findByText("Không thể tải món.")).toBeInTheDocument();
    expect(screen.getByLabelText("Bàn đang phục vụ")).toBeDisabled();
    expect(screen.queryByText("Bàn 01")).not.toBeInTheDocument();
  });
});
