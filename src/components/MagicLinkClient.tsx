"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { verifyMagicLink } from "@/lib/auth";
import { ensureDevSession } from "@/lib/progress-sync";
import { writeUserEmail, writeSessionToken, authChangedEvent, progressChangedEvent } from "@/lib/storage";

export function MagicLinkClient() {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const redirectStartedRef = useRef(false);
  const token = searchParams.get("token") ?? "";

  useEffect(() => {
    if (!token) {
      setError("Magic link token is missing.");
      return;
    }
    if (redirectStartedRef.current) {
      return;
    }
    let mounted = true;
    verifyMagicLink(token)
      .then(async ({ email, sessionToken }) => {
        writeUserEmail(email);
        if (sessionToken) {
          writeSessionToken(sessionToken);
        } else {
          await ensureDevSession(email);
        }
        window.dispatchEvent(new Event(authChangedEvent));
        window.dispatchEvent(new Event(progressChangedEvent));
        if (mounted && !redirectStartedRef.current) {
          redirectStartedRef.current = true;
          window.location.replace("/account");
        }
      })
      .catch((requestError: Error) => {
        if (mounted) {
          setError(requestError.message);
        }
      });
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <section className="auth-shell auth-shell-panel" data-testid="magic-link-page">
      <div className="auth-copy">
        <h1>Opening magic link</h1>
        {error ? (
          <div className="auth-error-summary" role="alert" data-testid="magic-link-error">{error}</div>
        ) : (
          <p className="hero-copy" data-testid="magic-link-status">Signing you in...</p>
        )}
        <p className="auth-switch"><Link href="/signup" data-testid="magic-link-back">Back to sign in</Link></p>
      </div>
    </section>
  );
}
