import { afterEach, expect, it, vi } from "vitest";
import { downloadAdminReports, loadAdminReport } from "../lib/api/operation/admin-reports.api";

vi.mock("../lib/auth/firebase", () => ({
  getFirebaseAuth: () => ({ currentUser: { getIdToken: async () => "test-token" } }),
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it("requests a page and exports without a page restriction", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { items: [], total: 21, page: 1, size: 10 } }),
    })
    .mockResolvedValueOnce({ ok: true, blob: async () => new Blob(["xlsx"]) });
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("URL", { createObjectURL: () => "blob:test", revokeObjectURL: vi.fn() });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
  const filter = { type: "ORDERS" as const, from: "2026-10-01", to: "2026-10-31" };
  const page = await loadAdminReport(filter, "ORDERS", 1);
  expect(page.total).toBe(21);
  await downloadAdminReports(filter);
  expect(fetchMock.mock.calls[0][0]).toContain("type=ORDERS&page=1&size=10");
  expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer test-token");
  expect(fetchMock.mock.calls[1][0]).toContain("/reports/export?");
  expect(fetchMock.mock.calls[1][0]).not.toContain("page=");
  expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledOnce();
  await new Promise((resolve) => setTimeout(resolve, 10));
});
