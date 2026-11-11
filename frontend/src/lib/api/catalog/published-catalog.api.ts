import { getFirebaseAuth } from "../../auth/firebase";
import { getRememberedPublicStoreId } from "../store/public-store.api";
import type {
  CatalogCategory,
  CatalogMenuItem,
  CatalogOptionGroup,
  CatalogTag,
} from "./catalog.api";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type ApiResponse<T> = { data: T };
type CatalogAudience = "customer" | "operator";

export type PublishedCatalog = {
  categories: CatalogCategory[];
  items: CatalogMenuItem[];
  optionGroups: CatalogOptionGroup[];
  tags: CatalogTag[];
};

export function loadCustomerCatalog(storeId = getRememberedPublicStoreId() ?? 1) {
  return loadCatalog("customer", storeId);
}

export async function loadCustomerCatalogItem(
  id: number,
  storeId = getRememberedPublicStoreId() ?? 1,
) {
  const [item, optionGroups] = await Promise.all([
    request<CatalogMenuItem>("customer", `/items/${id}`, {}, storeId),
    request<CatalogOptionGroup[]>("customer", "/option-groups", {}, storeId),
  ]);
  return { item, optionGroups };
}

export function loadOperatorCatalog() {
  return loadCatalog("operator");
}

export function updateOperatorItemAvailability(id: number, status: "ACTIVE" | "SOLD_OUT") {
  return request<void>("operator", `/items/${id}/availability-status`, {
    body: JSON.stringify({ status }),
    method: "PATCH",
  });
}

async function loadCatalog(audience: CatalogAudience, storeId?: number): Promise<PublishedCatalog> {
  const [categories, items, optionGroups, tags] = await Promise.all([
    request<CatalogCategory[]>(audience, "/categories", {}, storeId),
    request<CatalogMenuItem[]>(audience, "/items", {}, storeId),
    request<CatalogOptionGroup[]>(audience, "/option-groups", {}, storeId),
    request<CatalogTag[]>(audience, "/tags", {}, storeId),
  ]);
  return { categories, items, optionGroups, tags };
}

async function request<T>(
  audience: CatalogAudience,
  path: string,
  init: RequestInit = {},
  storeId?: number,
) {
  const headers: HeadersInit = {};
  if (audience === "operator") {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    headers.Authorization = `Bearer ${await user.getIdToken()}`;
  }

  const query = storeId === undefined ? "" : `?storeId=${storeId}`;
  const response = await fetch(`${apiUrl}/api/v1/${audience}/catalog${path}${query}`, {
    ...init,
    cache: "no-store",
    credentials: audience === "customer" ? "include" : "same-origin",
    headers: {
      ...headers,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok || !isApiResponse<T>(body)) {
    throw new Error(getBackendErrorMessage(body, "Không thể tải thực đơn."));
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
