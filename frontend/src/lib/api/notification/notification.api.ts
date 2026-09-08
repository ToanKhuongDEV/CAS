import { getFirebaseAuth } from "../../auth/firebase";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type ApiResponse<T> = { data: T; message?: string };
export type NotificationType = "INFO" | "WARNING" | "URGENT";
export type NotificationTargetRole = "OPERATOR" | "CUSTOMER" | "BOTH";

export type SystemNotification = {
  id: number;
  title: string;
  content: string;
  type: NotificationType;
  targetRole: NotificationTargetRole;
  createdAt: string;
  updatedAt: string;
};
export type RecipientNotification = SystemNotification & {
  status: "UNREAD" | "READ";
  readAt: string | null;
};
export type RecipientNotificationList = {
  notifications: RecipientNotification[];
  unreadCount: number;
};

export function loadAdminNotifications() {
  return admin<SystemNotification[]>("/notifications");
}
export function createAdminNotification(
  input: Omit<SystemNotification, "id" | "createdAt" | "updatedAt">,
) {
  return admin<SystemNotification>("/notifications", {
    body: JSON.stringify(input),
    method: "POST",
  });
}
export function deleteAdminNotification(notificationId: number) {
  return admin<void>(`/notifications/${notificationId}`, { method: "DELETE" });
}
export function loadOperatorNotifications() {
  return operator<RecipientNotificationList>("/notifications");
}
export function markOperatorNotificationRead(notificationId: number) {
  return operator<void>(`/notifications/${notificationId}/read`, { method: "PATCH" });
}
export function markAllOperatorNotificationsRead() {
  return operator<void>("/notifications/read", { method: "PATCH" });
}
export function loadCustomerNotifications() {
  return customer<RecipientNotificationList>("/notifications");
}
export function markCustomerNotificationRead(notificationId: number) {
  return customer<void>(`/notifications/${notificationId}/read`, { method: "PATCH" });
}
export function markAllCustomerNotificationsRead() {
  return customer<void>("/notifications/read", { method: "PATCH" });
}

async function admin<T>(path: string, init: RequestInit = {}) {
  return authenticated<T>(`/api/v1/admin${path}`, init);
}
async function operator<T>(path: string, init: RequestInit = {}) {
  return authenticated<T>(`/api/v1/operator${path}`, init);
}
async function authenticated<T>(path: string, init: RequestInit) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  return request<T>(path, {
    ...init,
    headers: { Authorization: `Bearer ${await user.getIdToken()}`, ...init.headers },
  });
}
function customer<T>(path: string, init: RequestInit = {}) {
  return request<T>(`/api/v1/customer${path}`, { ...init, credentials: "include" });
}
async function request<T>(path: string, init: RequestInit) {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    cache: "no-store",
    headers: { ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
  });
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok || !isApiResponse<T>(body)) throw new Error(message(body));
  return body.data;
}
function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return Boolean(value && typeof value === "object" && "data" in value);
}
function message(value: unknown) {
  return value &&
    typeof value === "object" &&
    "message" in value &&
    typeof value.message === "string"
    ? value.message
    : "Không thể xử lý thông báo.";
}
