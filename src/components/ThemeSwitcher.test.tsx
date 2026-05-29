import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ThemeSwitcher } from "./ThemeSwitcher";

describe("ThemeSwitcher", () => {
  it("switches and persists light and dark modes", async () => {
    render(<ThemeSwitcher />);
    const user = userEvent.setup();

    await user.click(screen.getByTestId("theme-light"));
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(screen.getByTestId("theme-light")).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByTestId("theme-dark"));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(screen.getByTestId("theme-dark")).toHaveAttribute("aria-pressed", "true");
  });
});
