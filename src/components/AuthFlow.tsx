"use client";

import { FormEvent, useState } from "react";

import { requestMagicLink } from "../lib/auth";

export function AuthFlow() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sentEmail, setSentEmail] = useState("");
  const [magicLink, setMagicLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await requestMagicLink(email);
      setSentEmail(response.email);
      setMagicLink(response.magicLink);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not create a magic link.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-shell auth-shell-panel" data-testid="auth-shell">
      <div className="auth-copy">
        <h1 data-testid="auth-title">Magic link sign up</h1>
        <p className="hero-copy">Enter your email and open a one-time link. Visit tracking still stays in this browser for now.</p>
      </div>

      {sentEmail ? (
        <div className="auth-success" data-testid="magic-link-sent" aria-live="polite">
          <h2>Check your magic link</h2>
          <p>Magic link prepared for {sentEmail}.</p>
          <a className="primary-link" href={magicLink} data-testid="magic-link-open">
            Open magic link
          </a>
          <button
            type="button"
            className="secondary-link"
            data-testid="auth-change-email"
            onClick={() => {
              setSentEmail("");
              setMagicLink("");
              setError("");
            }}
          >
            Use another email
          </button>
        </div>
      ) : (
        <form className="auth-form" onSubmit={submit} data-testid="magic-link-form" noValidate>
          {error ? (
            <div className="auth-error-summary" role="alert" data-testid="auth-error-summary">
              {error}
            </div>
          ) : null}
          <div className="auth-flow__email-field">
            <div className="auth-field-stack">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                data-testid="auth-email"
                aria-invalid={Boolean(error)}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>
          <button className="primary-action" type="submit" data-testid="auth-submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send magic link"}
          </button>
        </form>
      )}
    </section>
  );
}
