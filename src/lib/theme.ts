import type { Theme } from "../types";

export const themeStorageKey = "museumsEuAtlasTheme";

export function readTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }

  const saved = localStorage.getItem(themeStorageKey);
  if (saved === "light" || saved === "dark") {
    return saved;
  }

  return typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export function applyTheme(theme: Theme, persist = true): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  const themeColor = theme === "light" ? "#f5f1e8" : "#111111";
  const meta =
    document.getElementById("theme-color-meta") ??
    document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute("content", themeColor);
  if (persist) {
    localStorage.setItem(themeStorageKey, theme);
  }
}
