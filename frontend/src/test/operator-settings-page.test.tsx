import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";

import OperatorSettingsPage from "../app/(operator)/operator/(workspace)/settings/page";
import { ThemeInitializer } from "../components/ui/theme-toggle";

afterEach(() => {
  window.localStorage.removeItem("cas-color-theme");
  delete document.documentElement.dataset.theme;
  document.documentElement.style.colorScheme = "";
});

it("restores the saved theme and lets the operator change it from settings", () => {
  window.localStorage.setItem("cas-color-theme", "dark");
  const { unmount } = render(<ThemeInitializer />);
  expect(document.documentElement.dataset.theme).toBe("dark");
  unmount();

  render(<OperatorSettingsPage />);
  fireEvent.click(screen.getByRole("button", { name: "Chuyển đổi giao diện sáng hoặc tối" }));
  expect(document.documentElement.dataset.theme).toBe("light");
  expect(window.localStorage.getItem("cas-color-theme")).toBe("light");
});
