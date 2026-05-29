import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AuthFlow } from "./AuthFlow";

describe("AuthFlow", () => {
  it("validates email and creates a visible magic link", async () => {
    const user = userEvent.setup();
    render(<AuthFlow />);

    await user.click(screen.getByTestId("auth-submit"));
    expect(await screen.findByTestId("auth-error-summary")).toHaveTextContent("Enter a valid email address.");

    await user.clear(screen.getByTestId("auth-email"));
    await user.type(screen.getByTestId("auth-email"), "visitor@example.com");
    await user.click(screen.getByTestId("auth-submit"));

    await waitFor(() => expect(screen.getByTestId("magic-link-sent")).toBeInTheDocument());
    expect(screen.getByTestId("magic-link-open")).toHaveAttribute("href", expect.stringContaining("/magic-link?token="));
  });
});
