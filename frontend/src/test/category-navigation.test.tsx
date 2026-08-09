import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CategoryNavigation } from "../app/(customer)/(ordering)/menu/category-navigation";

const categories = [
  { id: "first-category", label: "First category" },
  { id: "last-category", label: "Last category" },
];

function renderCategoryNavigation() {
  render(
    <>
      <CategoryNavigation categories={categories} />
      <section id="first-category">First section</section>
      <section id="last-category">Last section with one item</section>
    </>,
  );
}

describe("CategoryNavigation", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("activates the category whose section crosses the sticky navigation", async () => {
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(800);
    vi.spyOn(window, "scrollY", "get").mockReturnValue(500);
    vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(2_000);

    renderCategoryNavigation();

    const navigation = screen.getByRole("navigation");
    const firstSection = document.getElementById("first-category");
    const lastSection = document.getElementById("last-category");

    vi.spyOn(navigation, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 64, 390, 56));
    vi.spyOn(firstSection!, "getBoundingClientRect").mockReturnValue(
      new DOMRect(0, -400, 390, 520),
    );
    vi.spyOn(lastSection!, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 120, 390, 220));

    fireEvent.scroll(window);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Last category" })).toHaveAttribute(
        "aria-current",
        "location",
      );
    });
  });

  it("activates a short final category when the page reaches the bottom", async () => {
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(800);
    vi.spyOn(window, "scrollY", "get").mockReturnValue(1_200);
    vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(2_000);

    renderCategoryNavigation();

    const firstSection = document.getElementById("first-category");
    const lastSection = document.getElementById("last-category");

    vi.spyOn(firstSection!, "getBoundingClientRect").mockReturnValue(
      new DOMRect(0, -500, 390, 600),
    );
    vi.spyOn(lastSection!, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 400, 390, 180));

    fireEvent.scroll(window);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Last category" })).toHaveAttribute(
        "aria-current",
        "location",
      );
      expect(screen.getByRole("link", { name: "First category" })).not.toHaveAttribute(
        "aria-current",
      );
    });
  });
});
