import { getFirebaseAuth } from "../../auth/firebase";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
type ApiResponse<T> = { data: T; message?: string };

export type AdminDashboard = {
  range: { from: string; to: string };
  revenue: {
    total: number;
    paidSessionCount: number;
    series: { date: string; revenue: number; paidSessionCount: number }[];
  };
  customers: {
    paidSessionCount: number;
    averageWaitMinutes: number | null;
    series: { date: string; paidSessionCount: number; averageWaitMinutes: number | null }[];
  };
  menu: {
    soldQuantity: number;
    remadeQuantity: number;
    topItems: {
      menuItemId: number;
      name: string;
      soldQuantity: number;
      revenue: number;
      remadeQuantity: number;
    }[];
  };
  promotions: {
    totalDiscountAmount: number;
    discountedSessionCount: number;
    usageRate: number;
    statusCounts: { active: number; upcoming: number; expired: number; inactive: number };
  };
};

export async function loadAdminDashboard(from: string, to: string) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  const params = new URLSearchParams({ from, to });
  const response = await fetch(`${apiUrl}/api/v1/admin/dashboard?${params}`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${await user.getIdToken()}` },
  });
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok || !isApiResponse<AdminDashboard>(body)) throw new Error(message(body));
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
    : "Không thể tải báo cáo hoạt động.";
}
