"use client";

import { FormEvent, useId, useState } from "react";

import { feedbackKindLabels, feedbackKinds, minFeedbackMessageLength, type FeedbackKind } from "@/lib/feedback";
import { trackEvent } from "@/lib/product-events";

type Status = { state: "idle" | "sending" } | { state: "sent" } | { state: "error"; message: string };

type FeedbackFormProps = {
  /** In the side panel: discard the draft and close. Not shown on the standalone page. */
  onCancel?: () => void;
  /** In the side panel: close after the thank-you message. */
  onDone?: () => void;
};

/** The shared introduction, used by the /feedback page and the side panel. */
export function FeedbackIntro({ headingLevel = 1 }: { headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <div className="auth-copy">
      <Heading>Say hello</Heading>
      <p className="hero-copy">
        ArtMuse is a one-person side project. Tell me what you&apos;d change, what broke, or simply that you&apos;d like
        more of it — that is what decides whether it grows. Your email is optional and used only to reply. Messages are
        deleted after a year.
      </p>
    </div>
  );
}

export function FeedbackForm({ onCancel, onDone }: FeedbackFormProps = {}) {
  // Unique per form: the page and the side panel can both be on screen.
  const fieldId = useId();
  const [kind, setKind] = useState<FeedbackKind>("interest");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const website = new FormData(event.currentTarget).get("website");
    if (kind !== "interest" && message.trim().length < minFeedbackMessageLength) {
      setStatus({ state: "error", message: `Write at least ${minFeedbackMessageLength} characters.` });
      return;
    }
    setStatus({ state: "sending" });
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, message, email, website: typeof website === "string" ? website : "" })
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        setStatus({ state: "error", message: body.error ?? "Could not send your message. Try again later." });
        return;
      }
      trackEvent({ name: "feedback_sent", subject: kind });
      setStatus({ state: "sent" });
    } catch {
      setStatus({ state: "error", message: "Could not send your message. Check your connection and try again." });
    }
  }

  if (status.state === "sent") {
    return (
      <div className="auth-success" data-testid="feedback-sent" aria-live="polite">
        <p>
          <strong>Thank you — it reached me.</strong>
        </p>
        <p>{email ? "If a reply makes sense, you'll hear back by email." : "You didn't leave an email, so there will be no reply — and that's fine."}</p>
        {onDone ? (
          <button className="secondary-action" type="button" onClick={onDone}>
            Close
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <form className="auth-form feedback-form" onSubmit={submit} data-testid="feedback-form" noValidate>
      {status.state === "error" ? (
        <div className="auth-error-summary" role="alert" data-testid="feedback-error">
          {status.message}
        </div>
      ) : null}
      <fieldset className="feedback-kinds">
        <legend>What is it about?</legend>
        {feedbackKinds.map((value) => (
          <label key={value} className="feedback-kind">
            <input type="radio" name="kind" value={value} checked={kind === value} onChange={() => setKind(value)} data-testid={`feedback-kind-${value}`} />
            {feedbackKindLabels[value]}
          </label>
        ))}
      </fieldset>
      <div className="auth-field-stack">
        <label htmlFor={`${fieldId}-message`}>{kind === "interest" ? "Anything to add? (optional)" : "Your message"}</label>
        <textarea id={`${fieldId}-message`} name="message" rows={5} maxLength={2000} value={message} onChange={(event) => setMessage(event.target.value)} data-testid="feedback-message" />
      </div>
      <div className="auth-field-stack">
        <label htmlFor={`${fieldId}-email`}>Your email, only if you want a reply (optional)</label>
        <input id={`${fieldId}-email`} name="email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} data-testid="feedback-email" />
      </div>
      {/* Honeypot: hidden from people and assistive tech; bots that fill every field get a fake success. */}
      <div className="visually-hidden" aria-hidden="true">
        <label htmlFor={`${fieldId}-website`}>Website</label>
        <input id={`${fieldId}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <div className="feedback-actions">
        <button className="primary-action" type="submit" disabled={status.state === "sending"} data-testid="feedback-submit">
          {status.state === "sending" ? "Sending..." : "Send"}
        </button>
        {onCancel ? (
          <button className="secondary-action" type="button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
