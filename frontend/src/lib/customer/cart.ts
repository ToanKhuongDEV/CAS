export type CustomerCartLine = {
  basePrice?: number;
  imageUrl?: string | null;
  menuItemId: number;
  itemName: string;
  optionValueIds: number[];
  quantity: number;
  selectedOptions?: CustomerCartOption[];
};

export type CustomerCartOption = {
  name: string;
  price: number;
};

const key = "cas.customerCart";

export function readCustomerCart(): CustomerCartLine[] {
  try {
    const value: unknown = JSON.parse(window.sessionStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? (value as CustomerCartLine[]) : [];
  } catch {
    return [];
  }
}

export function addCustomerCartLine(line: CustomerCartLine) {
  const cart = readCustomerCart();
  const existing = cart.find(
    (item) =>
      item.menuItemId === line.menuItemId &&
      item.optionValueIds.join(",") === line.optionValueIds.join(","),
  );
  if (existing) {
    existing.quantity += line.quantity;
    existing.imageUrl ??= line.imageUrl;
    existing.basePrice ??= line.basePrice;
    existing.selectedOptions ??= line.selectedOptions;
  } else cart.push(line);
  window.sessionStorage.setItem(key, JSON.stringify(cart));
}

export function clearCustomerCart() {
  window.sessionStorage.removeItem(key);
  window.dispatchEvent(new Event("cas-cart-updated"));
}

export function saveCustomerCart(cart: CustomerCartLine[]) {
  window.sessionStorage.setItem(key, JSON.stringify(cart));
  window.dispatchEvent(new Event("cas-cart-updated"));
}
