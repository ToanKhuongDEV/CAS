import { getFirebaseAuth } from "../../auth/firebase";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type ApiResponse<T> = { data: T; message?: string };

export type PromotionStatus = "DRAFT" | "ACTIVE" | "INACTIVE";
export type PromotionType =
  "PERCENT_OFF" | "FIXED_AMOUNT_OFF" | "ITEM_PERCENT_OFF" | "ITEM_FIXED_OFF";

export type PromotionDetails = {
  publicId: string;
  name: string;
  promotionType: PromotionType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minBillAmount: number | null;
  maxRedemptions: number | null;
  maxRedemptionsPerCustomer: number | null;
  status: PromotionStatus;
  startAt: string | null;
  endAt: string | null;
};

export type AdminPromotion = {
  promotion: PromotionDetails;
  codes: { id: number; promotionId: number; code: string; maxRedemptions: number | null }[];
  targets: {
    id: number;
    promotionId: number;
    targetType: "MENU_ITEM" | "CATEGORY";
    targetId: number;
  }[];
};

export type PromotionCommand = Omit<PromotionDetails, "publicId"> & {
  codes: { value: string; maxRedemptions: number | null }[];
  targets: { type: "MENU_ITEM" | "CATEGORY"; id: number }[];
};

export type EligiblePromotion = {
  promotionId: string;
  name: string;
  promotionType: PromotionType;
  codeId: number | null;
  code: string | null;
  discountValue: number;
  minBillAmount: number | null;
  scope: string;
  discountAmount: number;
  payableAmount: number;
};

export function loadAdminPromotions() {
  return operationalRequest<AdminPromotion[]>("/api/v1/admin/promotions");
}

export function createPromotion(input: PromotionCommand) {
  return operationalRequest<AdminPromotion>("/api/v1/admin/promotions", json("POST", input));
}

export function updatePromotion(id: string, input: PromotionCommand) {
  return operationalRequest<AdminPromotion>(
    `/api/v1/admin/promotions/${encodeURIComponent(id)}`,
    json("PUT", input),
  );
}

export function updatePromotionStatus(id: string, status: PromotionStatus) {
  return operationalRequest<AdminPromotion>(
    `/api/v1/admin/promotions/${encodeURIComponent(id)}/status`,
    json("PATCH", { status }),
  );
}

export function loadCustomerEligiblePromotions(code?: string) {
  const query = code?.trim() ? `?code=${encodeURIComponent(code.trim())}` : "";
  return customerRequest<EligiblePromotion[]>(`/api/v1/customer/promotions/eligible${query}`);
}

export function selectCustomerPromotion(promotionId: string, code?: string | null) {
  return customerRequest<EligiblePromotion>(
    "/api/v1/customer/promotions/selection",
    json("PUT", { promotionId, code: code || null }),
  );
}

export function clearCustomerPromotion() {
  return customerRequest<void>("/api/v1/customer/promotions/selection", { method: "DELETE" });
}

export function loadOperatorEligiblePromotions(sessionId: string) {
  return operationalRequest<EligiblePromotion[]>(
    `/api/v1/operator/table-sessions/${encodeURIComponent(sessionId)}/promotions/eligible`,
  );
}

export function selectOperatorPromotion(
  sessionId: string,
  promotionId: string,
  code?: string | null,
) {
  return operationalRequest<EligiblePromotion>(
    `/api/v1/operator/table-sessions/${encodeURIComponent(sessionId)}/promotions/selection`,
    json("PUT", { promotionId, code: code || null }),
  );
}

export function clearOperatorPromotion(sessionId: string) {
  return operationalRequest<void>(
    `/api/v1/operator/table-sessions/${encodeURIComponent(sessionId)}/promotions/selection`,
    { method: "DELETE" },
  );
}

function json(method: string, body: unknown): RequestInit {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

async function customerRequest<T>(path: string, init: RequestInit = {}) {
  return request<T>(path, { ...init, credentials: "include" });
}

async function operationalRequest<T>(path: string, init: RequestInit = {}) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  return request<T>(path, {
    ...init,
    headers: { Authorization: `Bearer ${await user.getIdToken()}`, ...init.headers },
  });
}

async function request<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${apiUrl}${path}`, { cache: "no-store", ...init });
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
    : "Không thể xử lý khuyến mãi.";
}
