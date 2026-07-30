import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home", () => {
  it("renders the core CAS flow", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /một trải nghiệm/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Quét QR")).toBeInTheDocument();
    expect(screen.getByText("Thanh toán")).toBeInTheDocument();
  });
});
