import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { SidePanel } from "./SidePanel";

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open panel
      </button>
      <a href="#behind">Link behind the panel</a>
      <SidePanel open={open} onClose={() => setOpen(false)} titleId="test-panel-title" label="Test panel">
        <input aria-label="First field" />
        <button type="button">Inner action</button>
      </SidePanel>
    </>
  );
}

async function openPanel() {
  const user = userEvent.setup();
  render(<Harness />);
  const opener = screen.getByRole("button", { name: "Open panel" });
  await user.click(opener);
  return { user, opener };
}

describe("SidePanel", () => {
  it("moves focus into the panel when it opens", async () => {
    await openPanel();
    expect(screen.getByRole("dialog", { name: "Test panel" })).toBeInTheDocument();
    expect(screen.getByTestId("side-panel-close")).toHaveFocus();
  });

  it("closes on Escape and returns focus to the element that opened it", async () => {
    const { user, opener } = await openPanel();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("closes from the close button and returns focus to the opener", async () => {
    const { user, opener } = await openPanel();
    await user.click(screen.getByTestId("side-panel-close"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("closes from a click on the backdrop and returns focus to the opener", async () => {
    const { user, opener } = await openPanel();
    await user.click(screen.getByTestId("side-panel-backdrop"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("keeps Tab and Shift+Tab inside the open panel", async () => {
    const { user } = await openPanel();
    const close = screen.getByTestId("side-panel-close");
    const inner = screen.getByRole("button", { name: "Inner action" });

    await user.tab();
    expect(screen.getByRole("textbox", { name: "First field" })).toHaveFocus();
    await user.tab();
    expect(inner).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(inner).toHaveFocus();
  });

  it("leaves the backdrop out of the tab order", async () => {
    await openPanel();
    expect(screen.getByTestId("side-panel-backdrop")).toHaveAttribute("tabindex", "-1");
  });
});
