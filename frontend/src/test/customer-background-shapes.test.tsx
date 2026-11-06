import { render } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { CustomerBackgroundShapes } from "../components/customer/customer-background-shapes";

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname }));

it("shows decorative shapes only outside the home page", () => {
  usePathname.mockReturnValue("/");
  const { container, rerender } = render(<CustomerBackgroundShapes />);
  expect(container.firstChild).toBeNull();
  usePathname.mockReturnValue("/menu");
  rerender(<CustomerBackgroundShapes />);
  expect(container.querySelector('[aria-hidden="true"]')?.children).toHaveLength(7);
});
