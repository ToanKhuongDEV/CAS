import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AdminIncidentsPage from "../app/admin/incidents/page";
import { loadAdminOperationalIncidents } from "../lib/api/operation/operational-incidents.api";

vi.mock("../lib/api/operation/operational-incidents.api", () => ({
  loadAdminOperationalIncidents: vi.fn(),
}));

describe("AdminIncidentsPage", () => {
  it("loads operational incidents from the API", async () => {
    vi.mocked(loadAdminOperationalIncidents).mockResolvedValue([
      {
        publicId: "incident-1",
        reporterName: "Nguyễn Văn A",
        description: "Máy in bếp bị kẹt giấy.",
        createdAt: "2026-09-11T10:00:00",
      },
    ]);

    render(<AdminIncidentsPage />);

    expect(await screen.findByText("Máy in bếp bị kẹt giấy.")).toBeInTheDocument();
    expect(screen.getByText("Người báo cáo: Nguyễn Văn A")).toBeInTheDocument();
  });
});
