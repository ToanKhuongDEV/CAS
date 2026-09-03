import { getFirebaseAuth } from "../../auth/firebase";
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

export function loadCustomerCatalog() {
  return loadCatalog("customer");
}

export async function loadCustomerCatalogItem(id: number) {
  const [item, optionGroups] = await Promise.all([
    request<CatalogMenuItem>("customer", `/items/${id}`),
    request<CatalogOptionGroup[]>("customer", "/option-groups"),
  ]);
  return { item, optionGroups };
}

export function loadOperatorCatalog() {
  return loadCatalog("operator");
}

async function loadCatalog(audience: CatalogAudience): Promise<PublishedCatalog> {
  const [categories, items, optionGroups, tags] = await Promise.all([
    request<CatalogCategory[]>(audience, "/categories"),
    request<CatalogMenuItem[]>(audience, "/items"),
    request<CatalogOptionGroup[]>(audience, "/option-groups"),
    request<CatalogTag[]>(audience, "/tags"),
  ]);
  return { categories, items, optionGroups, tags };
}

async function request<T>(audience: CatalogAudience, path: string) {
  const headers: HeadersInit = {};
  if (audience === "operator") {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    headers.Authorization = `Bearer ${await user.getIdToken()}`;
  }

  const publicStoreQuery = audience === "customer" ? "?storeId=1" : "";
  const response = await fetch(`${apiUrl}/api/v1/${audience}/catalog${path}${publicStoreQuery}`, {
    cache: "no-store",
    credentials: audience === "customer" ? "include" : "same-origin",
    headers,
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
