export function formatOrderDestination(
  tableCode: number | null,
  customerName?: string | null,
  orderId?: string,
) {
  if (tableCode !== null) return `Bàn ${String(tableCode).padStart(2, "0")}`;
  return ["Mang về", customerName, orderId?.slice(0, 8)].filter(Boolean).join(" · ");
}
