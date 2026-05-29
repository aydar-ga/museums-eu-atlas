"use client";

import { useEffect, useState } from "react";

import { applyTheme, readTheme } from "../lib/theme";
import type { Theme } from "../types";
import { MoonIcon, SunIcon } from "./Icons";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const currentTheme = readTheme();
    setTheme(currentTheme);
    applyTheme(currentTheme, false);
  }, []);

  function selectTheme(nextTheme: Theme) {
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <div className="theme-toggle" role="group" aria-label="Color theme" data-testid="theme-toggle">
      <button
        type="button"
        className="theme-button"
        data-theme-option="light"
        data-testid="theme-light"
        aria-label="Use light mode"
        aria-pressed={theme === "light"}
        suppressHydrationWarning
        onClick={() => selectTheme("light")}
      >
        <SunIcon />
        <span className="visually-hidden">Light mode</span>
      </button>
      <button
        type="button"
        className="theme-button"
        data-theme-option="dark"
        data-testid="theme-dark"
        aria-label="Use dark mode"
        aria-pressed={theme === "dark"}
        suppressHydrationWarning
        onClick={() => selectTheme("dark")}
      >
        <MoonIcon />
        <span className="visually-hidden">Dark mode</span>
      </button>
    </div>
  );
}
