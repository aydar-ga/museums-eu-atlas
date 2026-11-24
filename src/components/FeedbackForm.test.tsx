import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import FeedbackPage from "@/app/feedback/page";
import { FeedbackForm } from "./FeedbackForm";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("FeedbackForm", () => {
  it("offers Cancel in a dialog and calls it without sending anything", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<FeedbackForm onCancel={onCancel} />);

    await user.type(screen.getByTestId("feedback-message"), "half-written thought");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("thanks the visitor after sending and offers Close", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response('{"ok":true}', { status: 200 })));
    const onDone = vi.fn();
    const user = userEvent.setup();
    render(<FeedbackForm onCancel={vi.fn()} onDone={onDone} />);

    await user.click(screen.getByTestId("feedback-submit"));

    expect(await screen.findByTestId("feedback-sent")).toHaveTextContent("Thank you");
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("shows neither Cancel nor Close on the standalone page", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response('{"ok":true}', { status: 200 })));
    const user = userEvent.setup();
    render(<FeedbackForm />);
    expect(screen.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();

    await user.click(screen.getByTestId("feedback-submit"));
    await screen.findByTestId("feedback-sent");
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });
});

describe("FeedbackForm field ids", () => {
  it("keeps each form's labels on its own fields when two forms are on screen", () => {
    render(
      <>
        <FeedbackForm />
        <FeedbackForm onCancel={vi.fn()} />
      </>
    );
    const messages = screen.getAllByLabelText("Anything to add? (optional)");
    expect(messages).toHaveLength(2);
    expect(messages[0]).not.toBe(messages[1]);
    expect(new Set(screen.getAllByLabelText(/Your email/).map((field) => field.id)).size).toBe(2);
  });
});

describe("/feedback page", () => {
  it("links back to the atlas", () => {
    render(<FeedbackPage />);
    expect(screen.getByRole("link", { name: "Back to the atlas" })).toHaveAttribute("href", "/");
  });
});
