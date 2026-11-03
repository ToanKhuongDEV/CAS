const moneyFormatter = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });

export function formatMoney(value: number): string {
  return `${moneyFormatter.format(value)} ₫`;
}
