import { getFirebaseAuth } from "../../auth/firebase";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
type ApiResponse<T> = { data: T; message?: string };
export type CustomerSummary = {
  id: number;
  displayName: string;
  maskedPhone: string | null;
  sessionCount: number;
  lastVisitedAt: string | null;
};
export type CustomerSession = {
  publicId: string;
  tableCode: number;
  status: string;
  orderCount: number;
  paymentStatus: string | null;
  paymentAmount: number | null;
  unpaidStatus: string | null;
  unpaidAmount: number | null;
  openedAt: string;
  closedAt: string | null;
};
export type CustomerDetail = {
  id: number;
  displayName: string;
  phone: string | null;
  sessions: CustomerSession[];
};
export type AuditLog = {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  entityName: string | null;
  actorName: string;
  description: string | null;
  createdAt: string;
};
export type AuditLogPage = { items: AuditLog[]; total: number; page: number; size: number };
export function loadCustomers(query = "") {
  return request<CustomerSummary[]>(
    `/api/v1/admin/customers${query.trim() ? `?query=${encodeURIComponent(query.trim())}` : ""}`,
  );
}
export function loadCustomer(id: number) {
  return request<CustomerDetail>(`/api/v1/admin/customers/${id}`);
}
export function loadAuditLogs(input: {
  query?: string;
  action?: string;
  entityType?: string;
  page?: number;
  size?: number;
}) {
  const params = new URLSearchParams();
  if (input.query?.trim()) params.set("query", input.query.trim());
  if (input.action?.trim()) params.set("action", input.action.trim());
  if (input.entityType?.trim()) params.set("entityType", input.entityType.trim());
  params.set("page", String(input.page ?? 0));
  params.set("size", String(input.size ?? 20));
  return request<AuditLogPage>(`/api/v1/admin/audit-logs?${params}`);
}
async function request<T>(path: string) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  const response = await fetch(`${apiUrl}${path}`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${await user.getIdToken()}` },
  });
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok || !body || typeof body !== "object" || !("data" in body))
    throw new Error(
      body && typeof body === "object" && "message" in body && typeof body.message === "string"
        ? body.message
        : "Không thể tải dữ liệu quản trị.",
    );
  return (body as ApiResponse<T>).data;
}
