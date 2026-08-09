"use client";

import { useEffect } from "react";

type ColorTheme = "dark" | "light";

const themeStorageKey = "cas-color-theme";

function getInitialTheme(): ColorTheme {
  const savedTheme = window.localStorage.getItem(themeStorageKey);

  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: ColorTheme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle() {
  useEffect(() => {
    applyTheme(getInitialTheme());
  }, []);

  function handleThemeToggle() {
    const currentTheme = document.documentElement.dataset.theme;
    const nextTheme: ColorTheme = currentTheme === "dark" ? "light" : "dark";

    applyTheme(nextTheme);
    window.localStorage.setItem(themeStorageKey, nextTheme);
  }

  return (
    <button
      className="grid size-10 cursor-pointer place-items-center rounded-full border border-cas-outline-variant bg-cas-surface-container p-0 text-cas-on-surface transition duration-200 hover:-translate-y-px hover:text-cas-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
      type="button"
      onClick={handleThemeToggle}
      aria-label="Chuyển đổi giao diện sáng hoặc tối"
      title="Đổi giao diện sáng/tối"
    >
      <svg
        className="size-5 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.8] dark:hidden"
        aria-hidden="true"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
      </svg>
      <svg
        className="hidden size-5 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.8] dark:block"
        aria-hidden="true"
        viewBox="0 0 24 24"
      >
        <path d="M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5 8.5 8.5 0 1 0 20.5 15.2Z" />
      </svg>
    </button>
  );
}
