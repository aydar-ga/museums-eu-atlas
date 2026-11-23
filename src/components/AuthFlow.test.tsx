import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthFlow } from "./AuthFlow";

describe("AuthFlow", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

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

  it("tells the visitor to check their inbox when the link was emailed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ email: "visitor@example.com", delivery: "email" }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      )
    );
    const user = userEvent.setup();
    render(<AuthFlow />);

    await user.type(screen.getByTestId("auth-email"), "visitor@example.com");
    await user.click(screen.getByTestId("auth-submit"));

    expect(await screen.findByTestId("magic-link-sent")).toHaveTextContent("We emailed a sign-in link to visitor@example.com.");
    expect(screen.queryByTestId("magic-link-open")).not.toBeInTheDocument();
  });
});
