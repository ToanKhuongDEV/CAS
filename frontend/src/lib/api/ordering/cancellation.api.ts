import { getFirebaseAuth } from "../../auth/firebase";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
type ApiResponse<T> = { data: T; message?: string };

export type CancellationRequestSummary = {
  cancellationRequestId: string;
  orderItemId: string;
  itemName: string;
  tableCode: number;
  requestedQuantity: number;
  preparedQuantity: number;
  reason: string | null;
  requestedAt: string;
};
export type CancellationTransferCandidate = {
  orderItemId: string;
  tableCode: number;
  remainingQuantity: number;
};
export type CancellationRequestDetail = {
  request: CancellationRequestSummary;
  candidates: CancellationTransferCandidate[];
};
export type IncidentCancellationResult = {
  cancellationRequestId: string;
  status: "APPROVED";
  remakeOrderId: string | null;
};

export async function loadOperatorCancellationRequests() {
  return request<CancellationRequestSummary[]>("/cancellation-requests");
}
export async function loadOperatorCancellationRequest(id: string) {
  return request<CancellationRequestDetail>(`/cancellation-requests/${encodeURIComponent(id)}`);
}
export async function resolveOperatorCancellationRequest(
  id: string,
  input: {
    decision: "APPROVE" | "REJECT";
    isRemade?: boolean;
    targetOrderItemId?: string | null;
    transferQuantity?: number;
  },
) {
  return request(`/cancellation-requests/${encodeURIComponent(id)}/resolution`, {
    method: "POST",
    body: JSON.stringify({
      isRemade: input.isRemade ?? false,
      targetOrderItemId: input.targetOrderItemId ?? null,
      transferQuantity: input.transferQuantity ?? 0,
      decision: input.decision,
    }),
  });
}

export async function createOperatorIncidentCancellation(input: {
  orderItemId: string;
  requestedQuantity: number;
  reason: string;
  isRemade: boolean;
}) {
  return request<IncidentCancellationResult>("/cancellation-requests/incidents", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  const response = await fetch(`${apiUrl}/api/v1/operator${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${await user.getIdToken()}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok || !body || typeof body !== "object" || !("data" in body)) {
    throw new Error(
      body && typeof body === "object" && "message" in body && typeof body.message === "string"
        ? body.message
        : "Không thể xử lý yêu cầu hủy món.",
    );
  }
  return (body as ApiResponse<T>).data;
}
