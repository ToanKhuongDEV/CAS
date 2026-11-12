export const adminDashboardFilterStorageKey = "cas.adminDashboardFilter";
export const adminDashboardFilterUpdatedEvent = "cas-admin-dashboard-filter-updated";

export type Period = "threeDays" | "oneWeek" | "oneMonth" | "custom";

export function rangeFor(days: number) {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - days + 1);
  const value = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return { from: value(from), to: value(to) };
}

export function validateDateRange(from: string, to: string) {
  if (!from || !to) return "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.";
  return from > to ? "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc." : null;
}

export function filterFromSearchParams(searchParams: Pick<URLSearchParams, "get">) {
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const period = searchParams.get("period");
  if (!validateDateRange(from, to))
    return {
      from,
      to,
      period: period && isPeriod(period) ? period : ("custom" as const),
    };
  return { ...rangeFor(7), period: "oneWeek" as const };
}

function isPeriod(value: string): value is Period {
  return value === "threeDays" || value === "oneWeek" || value === "oneMonth" || value === "custom";
}
