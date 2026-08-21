import { getFirebaseAuth } from "../../auth/firebase";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const catalogPath = "/api/v1/admin/catalog";

type ApiResponse<T> = { data: T };

export type CatalogCategory = {
  categoryType: "REGULAR" | "OPTION";
  displayOrder: number;
  id: number;
  name: string;
  status: "ACTIVE" | "INACTIVE";
};

export type CatalogTag = {
  id: number;
  name: string;
  status: "ACTIVE" | "INACTIVE";
};

export type CatalogOptionGroup = {
  displayOrder: number;
  id: number;
  name: string;
  status: "ACTIVE" | "INACTIVE";
};

export type CatalogMenuItem = {
  availabilityStatus: "ACTIVE" | "SOLD_OUT" | "INACTIVE";
  categoryId: number;
  description: string | null;
  displayOrder: number;
  id: number;
  imageStorageKey: string | null;
  imageUrl: string | null;
  name: string;
  optionGroups: Array<{ displayOrder: number; id: number; name: string }> | null;
  price: number;
  tags: Array<{ id: number; name: string }> | null;
};

export type SaveCatalogMenuItem = {
  availabilityStatus: "ACTIVE" | "SOLD_OUT" | "INACTIVE";
  categoryId: number;
  description: string;
  displayOrder: number;
  imageStorageKey: string | null;
  imageUrl: string | null;
  name: string;
  optionGroups: Array<{ displayOrder: number; optionGroupId: number }>;
  price: number;
  tagIds: number[];
};

export async function loadAdminCatalog() {
  const [categories, tags, optionGroups, items] = await Promise.all([
    request<CatalogCategory[]>("/categories"),
    request<CatalogTag[]>("/tags"),
    request<CatalogOptionGroup[]>("/option-groups"),
    request<CatalogMenuItem[]>("/items"),
  ]);
  return { categories, tags, optionGroups, items };
}

export function createCatalogMenuItem(item: SaveCatalogMenuItem) {
  return request<void>("/items", { body: JSON.stringify(item), method: "POST" });
}

export function updateCatalogMenuItem(id: number, item: SaveCatalogMenuItem) {
  return request<void>(`/items/${id}`, { body: JSON.stringify(item), method: "PUT" });
}

export function updateCatalogMenuItemStatuses(
  itemIds: number[],
  status: SaveCatalogMenuItem["availabilityStatus"],
) {
  return request<void>("/items/bulk-status", {
    body: JSON.stringify({ itemIds, status }),
    method: "PATCH",
  });
}

async function request<T>(path: string, init: RequestInit = {}) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");

  const response = await fetch(`${apiUrl}${catalogPath}${path}`, {
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
    throw new Error(getBackendErrorMessage(body, "Không thể xử lý dữ liệu thực đơn."));
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
