import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/museums/louvre-museum",
  useRouter: () => router
}));

import { ClientShell } from "./ClientShell";

function renderShell() {
  const user = userEvent.setup();
  render(
    <ClientShell>
      <h1>Louvre Museum</h1>
    </ClientShell>
  );
  return { user, link: screen.getByTestId("footer-feedback-link") };
}

describe("ClientShell feedback panel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it("opens the feedback form in a dialog over the current page on a plain click", async () => {
    const { user, link } = renderShell();
    await user.click(link);

    expect(screen.getByRole("dialog", { name: "Feedback" })).toBeInTheDocument();
    expect(screen.getByTestId("feedback-form")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Louvre Museum" })).toBeInTheDocument();
    expect(router.push).not.toHaveBeenCalled();
  });

  it("closes on Escape and puts focus back on the footer link", async () => {
    const { user, link } = renderShell();
    await user.click(link);
    expect(screen.getByRole("dialog", { name: "Feedback" })).toBeInTheDocument();
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(link).toHaveFocus();
  });

  it("closes from the form's Cancel button without navigating", async () => {
    const { user, link } = renderShell();
    await user.click(link);
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
    expect(link).toHaveFocus();
  });

  it("leaves a modified click to the browser, so the page can open in a new tab", () => {
    const { link } = renderShell();
    fireEvent.click(link, { ctrlKey: true });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
