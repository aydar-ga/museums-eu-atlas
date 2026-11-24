"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

import { verifyMagicLink } from "@/lib/auth";
import { ensureDevSession } from "@/lib/progress-sync";
import { writeUserEmail, writeSessionToken, authChangedEvent, progressChangedEvent } from "@/lib/storage";

/**
 * Links work once, so the page waits for a click before spending the token. Email security scanners
 * that open links (and React's dev double-render) therefore cannot use it up before the person does.
 */
export function MagicLinkClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [error, setError] = useState(token ? "" : "Magic link token is missing.");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const startedRef = useRef(false);

  async function continueSignIn() {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;
    setIsSigningIn(true);
    try {
      const { email, sessionToken } = await verifyMagicLink(token);
      writeUserEmail(email);
      if (sessionToken) {
        writeSessionToken(sessionToken);
      } else {
        await ensureDevSession(email);
      }
      window.dispatchEvent(new Event(authChangedEvent));
      window.dispatchEvent(new Event(progressChangedEvent));
      window.location.replace("/account");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Magic link is invalid or expired.");
      setIsSigningIn(false);
    }
  }

  return (
    <section className="auth-shell auth-shell-panel" data-testid="magic-link-page">
      <div className="auth-copy">
        <h1>Opening magic link</h1>
        {error ? (
          <div className="auth-error-summary" role="alert" data-testid="magic-link-error">{error}</div>
        ) : (
          <>
            <p className="hero-copy" data-testid="magic-link-status">
              {isSigningIn ? "Signing you in..." : "This link works once. Continue to sign in on this device."}
            </p>
            <button
              type="button"
              className="primary-action"
              data-testid="magic-link-continue"
              onClick={() => void continueSignIn()}
              disabled={isSigningIn}
            >
              {isSigningIn ? "Signing in..." : "Continue to ArtMuse"}
            </button>
          </>
        )}
        <p className="auth-switch"><Link href="/signup" data-testid="magic-link-back">Back to sign in</Link></p>
      </div>
    </section>
  );
}
