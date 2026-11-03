import { describe, expect, it } from "vitest";
import { formatMoney } from "../lib/format-money";

describe("formatMoney", () => {
  it("formats VND consistently, including negative and decimal values", () => {
    expect(formatMoney(10000)).toBe("10.000 ₫");
    expect(formatMoney(-5500)).toBe("-5.500 ₫");
    expect(formatMoney(1234.56)).toBe("1.234,56 ₫");
    expect(formatMoney(0)).toBe("0 ₫");
  });
});
