import { beforeEach, describe, expect, it, vi } from "vitest";

import { applyTheme, readTheme, themeStorageKey } from "./theme";

describe("theme helpers", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.body.innerHTML = '<meta id="theme-color-meta" content="#111111">';
  });

  it("reads a persisted theme", () => {
    localStorage.setItem(themeStorageKey, "light");
    expect(readTheme()).toBe("light");
  });

  it("falls back to system preference", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
      media: "(prefers-color-scheme: light)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    });
    expect(readTheme()).toBe("light");
  });

  it("applies and persists selected theme", () => {
    applyTheme("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem(themeStorageKey)).toBe("light");
    expect(document.getElementById("theme-color-meta")).toHaveAttribute("content", "#f5f1e8");
  });
});
