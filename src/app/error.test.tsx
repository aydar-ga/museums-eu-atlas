import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ErrorPage from "./error";
import GlobalError from "./global-error";

describe("error pages", () => {
  it("shows a reference but never the error message, and retries", async () => {
    const reset = vi.fn();
    const error = Object.assign(new Error("secret internal detail"), { digest: "abc123" });
    render(<ErrorPage error={error} reset={reset} />);

    expect(screen.getByTestId("error-page")).toHaveTextContent("Something went wrong");
    expect(screen.getByTestId("error-page")).toHaveTextContent("Reference: abc123");
    expect(screen.getByTestId("error-page")).not.toHaveTextContent("secret internal detail");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("renders the global fallback without the error message", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(<GlobalError error={new Error("secret internal detail")} reset={() => undefined} />);
    expect(screen.getByTestId("global-error-page")).toHaveTextContent("ArtMuse is having trouble");
    expect(screen.getByTestId("global-error-page")).not.toHaveTextContent("secret internal detail");
  });
});
