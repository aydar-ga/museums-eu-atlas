import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AccountPanel } from "./AccountPanel";

describe("AccountPanel", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("shows the signed-in email and signs out from the account panel", async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();
    localStorage.setItem("museumsEuAtlasUser", JSON.stringify({ email: "e2e@example.com" }));

    render(<AccountPanel onLogout={onLogout} />);

    expect(await screen.findByTestId("account-email")).toHaveTextContent("e2e@example.com");
    await user.click(screen.getByTestId("logout-submit"));
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it("shows saved routes UI for signed-in users", async () => {
    localStorage.setItem("museumsEuAtlasSession", "test-session");
    localStorage.setItem("plannedMuseums", JSON.stringify(["louvre-museum"]));
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ routes: [] }), { status: 200 })
    );

    render(<AccountPanel email="e2e@example.com" />);

    expect(await screen.findByTestId("saved-routes-panel")).toBeVisible();
    expect(screen.getByTestId("save-route-submit")).toHaveTextContent("Save planned museums (1)");
  });
});
