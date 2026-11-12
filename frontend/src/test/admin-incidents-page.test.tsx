import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AdminIncidentsPage from "../app/admin/incidents/page";
import { QueryProvider } from "../components/providers/query-provider";
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
      {
        publicId: "incident-2",
        reporterName: "Trần Thị B",
        description: "Mất kết nối mạng.",
        createdAt: "2026-09-10T09:00:00",
      },
      {
        publicId: "incident-3",
        reporterName: "Lê Văn C",
        description: "Máy in hết giấy.",
        createdAt: "2026-09-11T08:00:00",
      },
    ]);

    render(
      <QueryProvider>
        <AdminIncidentsPage />
      </QueryProvider>,
    );

    expect(await screen.findByText("Máy in bếp bị kẹt giấy.")).toBeInTheDocument();
    expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();
    const table = screen.getByRole("table");
    const groups = within(table).getAllByRole("rowgroup");
    expect(groups).toHaveLength(3);
    expect(within(groups[1]).getByText("11/09/2026")).toBeInTheDocument();
    expect(within(groups[1]).getAllByRole("row")).toHaveLength(3);
    expect(within(groups[1]).getByText("Máy in hết giấy.")).toBeInTheDocument();
    expect(within(groups[2]).getByText("10/09/2026")).toBeInTheDocument();
    expect(within(groups[2]).getByText("Mất kết nối mạng.")).toBeInTheDocument();
  });
});
