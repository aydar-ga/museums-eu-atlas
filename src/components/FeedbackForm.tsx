"use client";

import { FormEvent, useState } from "react";

import { feedbackKindLabels, feedbackKinds, minFeedbackMessageLength, type FeedbackKind } from "@/lib/feedback";
import { trackEvent } from "@/lib/product-events";

type Status = { state: "idle" | "sending" } | { state: "sent" } | { state: "error"; message: string };

export function FeedbackForm() {
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
        <label htmlFor="feedback-message">{kind === "interest" ? "Anything to add? (optional)" : "Your message"}</label>
        <textarea id="feedback-message" name="message" rows={5} maxLength={2000} value={message} onChange={(event) => setMessage(event.target.value)} data-testid="feedback-message" />
      </div>
      <div className="auth-field-stack">
        <label htmlFor="feedback-email">Your email, only if you want a reply (optional)</label>
        <input id="feedback-email" name="email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} data-testid="feedback-email" />
      </div>
      {/* Honeypot: hidden from people and assistive tech; bots that fill every field get a fake success. */}
      <div className="visually-hidden" aria-hidden="true">
        <label htmlFor="feedback-website">Website</label>
        <input id="feedback-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <button className="primary-action" type="submit" disabled={status.state === "sending"} data-testid="feedback-submit">
        {status.state === "sending" ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
