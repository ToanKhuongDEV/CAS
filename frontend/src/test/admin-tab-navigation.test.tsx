import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AdminTabNavigation } from "../components/admin/admin-tab-navigation";
import { adminDashboardFilterStorageKey } from "../lib/admin/dashboard-filter";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin/customers" }));

describe("AdminTabNavigation", () => {
  it("keeps the last dashboard date filter in the overview link", async () => {
    window.sessionStorage.setItem(
      adminDashboardFilterStorageKey,
      "period=custom&from=2026-09-01&to=2026-09-30",
    );
    render(<AdminTabNavigation />);

    expect(await screen.findByRole("link", { name: "Tổng quan" })).toHaveAttribute(
      "href",
      "/admin?period=custom&from=2026-09-01&to=2026-09-30",
    );
  });
});
