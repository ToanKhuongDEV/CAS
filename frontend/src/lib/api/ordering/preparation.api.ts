import { getFirebaseAuth } from "../../auth/firebase";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type ApiResponse<T> = { data: T };

export type PreparationOption = {
  groupName: string;
  optionName: string;
  quantityPerItem: number;
};

export type PendingPreparationAllocation = {
  orderItemId: string;
  orderId: string;
  tableCode: number;
  remainingQuantity: number;
  orderCreatedAt: string;
};

export type PreparationGroup = {
  groupKey: string;
  menuItemId: number;
  itemName: string;
  optionConfigurationHash: string;
  options: PreparationOption[];
  remainingQuantity: number;
  allocations: PendingPreparationAllocation[];
};

export type LongWaitTable = {
  tableId: number;
  tableCode: number;
  orderId: string;
  oldestPendingOrderCreatedAt: string;
  waitingMinutes: number;
  thresholdMinutes: number;
};

export type PreparationBatchCompletion = {
  groupKey: string;
  requestedQuantity: number;
  remainingQuantity: number | null;
  allocations: {
    orderItemId: number;
    orderItemPublicId: string;
    orderId: string;
    tableCode: number;
    quantity: number;
  }[];
};

export function loadLongWaitTables() {
  return request<LongWaitTable[]>("/preparation/long-wait-tables");
}

export function loadPreparationGroups() {
  return request<PreparationGroup[]>("/preparation/groups");
}

export function completePreparationBatch(
  groupKey: string,
  input: { idempotencyKey: string; quantity: number },
) {
  return request<PreparationBatchCompletion>(
    `/preparation/groups/${encodeURIComponent(groupKey)}/completions`,
    { body: JSON.stringify(input), method: "POST" },
  );
}

async function request<T>(path: string, init: RequestInit = {}) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");

  const response = await fetch(`${apiUrl}/api/v1/operator${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${await user.getIdToken()}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok || !isApiResponse<T>(body)) {
    throw new Error(getBackendErrorMessage(body, "Không thể tải dữ liệu chế biến."));
  }
  return body.data;
}

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return Boolean(value && typeof value === "object" && "data" in value);
}

function getBackendErrorMessage(body: unknown, fallback: string) {
  return body &&
    typeof body === "object" &&
    "message" in body &&
    typeof body.message === "string" &&
    body.message.trim()
    ? body.message
    : fallback;
}
