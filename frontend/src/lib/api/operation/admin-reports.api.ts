import { getFirebaseAuth } from "../../auth/firebase";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export type ReportType = "REVENUE" | "ORDERS" | "REMADE";
export type ReportFilter = { from: string; to: string; type: ReportType | "ALL" };
export type ReportRow = {
  date?: string;
  paidSessionCount?: number;
  revenue?: number;
  salesRevenue?: number;
  serviceRevenue?: number;
  createdAt?: string;
  resolvedAt?: string;
  orderNumber?: string;
  tableCode?: number | null;
  customerName?: string;
  originalAmount?: number;
  payableAmount?: number;
  itemName?: string;
  quantity?: number;
  reason?: string | null;
  resolvedByName?: string | null;
};
export type ReportPage = { items: ReportRow[]; total: number; page: number; size: number };

async function request(path: string) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  const response = await fetch(`${apiUrl}${path}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${await user.getIdToken()}`,
      Accept: "application/json, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => undefined);
    throw new Error(
      body && typeof body === "object" && "message" in body && typeof body.message === "string"
        ? body.message
        : "Không thể tải báo cáo.",
    );
  }
  return response;
}

export async function loadAdminReport(filter: ReportFilter, type: ReportType, page: number) {
  const params = new URLSearchParams({
    from: filter.from,
    to: filter.to,
    type,
    page: String(page),
    size: "10",
  });
  const body: unknown = await (await request(`/api/v1/admin/reports?${params}`)).json();
  if (!body || typeof body !== "object" || !("data" in body))
    throw new Error("Phản hồi báo cáo không hợp lệ.");
  return body.data as ReportPage;
}

export async function downloadAdminReports(filter: ReportFilter) {
  const params = new URLSearchParams(filter);
  const response = await request(`/api/v1/admin/reports/export?${params}`);
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = `bao-cao-${filter.from}-${filter.to}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
