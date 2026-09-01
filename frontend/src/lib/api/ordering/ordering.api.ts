import { getFirebaseAuth } from "../../auth/firebase";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type ApiResponse<T> = { data: T; message?: string };

export type CustomerOrderItem = {
  orderItemId: string;
  itemName: string;
  unitPrice: number;
  optionsAmount: number;
  quantity: number;
  preparedQuantity: number;
  cancelledQuantity: number;
  totalAmount: number;
  options: { groupName: string; optionName: string; unitPrice: number; quantityPerItem: number }[];
};

export type CustomerOrder = {
  orderId: string;
  orderNumber: string;
  originalAmount: number;
  payableAmount: number;
  note: string | null;
  createdAt: string;
  items: CustomerOrderItem[];
};

export type CustomerBill = {
  tableCode: number;
  sessionStatus: "OPEN" | "PAYMENT_PENDING" | "CLOSED";
  originalAmount: number;
  payableAmount: number;
  orders: CustomerOrder[];
};

export type OperatorTable = {
  tableId: number;
  tableCode: number;
  sessionStatus: "OPEN" | "PAYMENT_PENDING" | null;
  sessionPublicId: string | null;
};

export async function loadCustomerOrders() {
  return customerRequest<CustomerOrder[]>("/orders");
}

export function createCustomerOrder(input: {
  note: string | null;
  items: { menuItemId: number; quantity: number; optionValueIds: number[] }[];
}) {
  return customerRequest<{ orderId: string; payableAmount: number }>("/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idempotencyKey: crypto.randomUUID(), ...input }),
  });
}

export async function loadCustomerBill() {
  return customerRequest<CustomerBill>("/orders/bill");
}

export async function cancelCustomerTableSession() {
  await customerRequest<void>("/table-sessions/current", { method: "DELETE" });
}

export async function requestCustomerCancellation(
  orderItemId: string,
  requestedQuantity: number,
  reason: string | null,
) {
  return customerRequest(`/orders/items/${encodeURIComponent(orderItemId)}/cancellation-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idempotencyKey: crypto.randomUUID(), requestedQuantity, reason }),
  });
}

export async function loadOperatorTables() {
  return operatorRequest<OperatorTable[]>("/table-sessions/tables");
}

export async function openOperatorTableSession(
  tableId: number,
  customer?: { customerName: string; customerPhone: string | null },
) {
  return operatorRequest<{ sessionId: string; tableCode: number; status: "OPEN" }>(
    "/table-sessions",
    {
      method: "POST",
      body: JSON.stringify({ tableId, ...customer }),
    },
  );
}

async function customerRequest<T>(path: string, init: RequestInit = {}) {
  return request<T>(`/api/v1/customer${path}`, { ...init, credentials: "include" });
}

async function operatorRequest<T>(path: string, init: RequestInit = {}) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  return request<T>(`/api/v1/operator${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${await user.getIdToken()}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}

async function request<T>(path: string, init: RequestInit) {
  const response = await fetch(`${apiUrl}${path}`, { cache: "no-store", ...init });
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok || !isApiResponse<T>(body)) {
    throw new Error(getMessage(body, "Không thể tải dữ liệu order."));
  }
  return body.data;
}

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return Boolean(value && typeof value === "object" && "data" in value);
}

function getMessage(value: unknown, fallback: string) {
  return value &&
    typeof value === "object" &&
    "message" in value &&
    typeof value.message === "string"
    ? value.message
    : fallback;
}
