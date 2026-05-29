import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { HomePage } from "./HomePage";

describe("HomePage", () => {
  it("renders museum cards, filters search, and toggles visited state", async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    expect(screen.getByTestId("app-title")).toHaveTextContent("Europe's Top 50 Art Museums Atlas");
    expect(screen.getAllByTestId("museum-card")).toHaveLength(50);
    expect(screen.queryByTestId("popularity-filter")).not.toBeInTheDocument();
    expect(screen.queryByTestId("family-filter")).not.toBeInTheDocument();
    expect(screen.queryByTestId("online-filter")).not.toBeInTheDocument();

    await user.type(screen.getByTestId("search-input"), "Van Gogh Museum");
    expect(screen.getAllByTestId("museum-card")).toHaveLength(1);

    const plannedButton = screen.getByTestId("plan-toggle-van-gogh-museum");
    await user.click(plannedButton);
    expect(plannedButton).toHaveAttribute("aria-pressed", "true");

    const visitedButton = screen.getByTestId("visit-toggle-van-gogh-museum");
    await user.click(visitedButton);
    expect(visitedButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("progress-text")).toHaveTextContent("1 of 50 museums visited · 1 planned");

    await user.clear(screen.getByTestId("search-input"));
    await user.type(screen.getByTestId("search-input"), "zzzz-no-match");
    expect(screen.getByTestId("no-results-copy")).toHaveTextContent(/great galleries are still waiting/i);
  });
});
