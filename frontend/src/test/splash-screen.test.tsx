import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SplashScreen } from "../components/ui/splash-screen";

describe("SplashScreen", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("waits at 99% until the page loads, then closes after half a second", () => {
    vi.useFakeTimers();
    vi.spyOn(document, "readyState", "get").mockReturnValue("loading");
    render(<SplashScreen />);

    act(() => vi.advanceTimersByTime(6000));
    expect(screen.getByText("99%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "99");

    act(() => window.dispatchEvent(new Event("load")));
    act(() => vi.advanceTimersByTime(450));
    expect(screen.getByRole("status")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(50));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("closes after half a second when the page is already loaded", () => {
    vi.useFakeTimers();
    vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
    render(<SplashScreen />);

    act(() => vi.advanceTimersByTime(500));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
