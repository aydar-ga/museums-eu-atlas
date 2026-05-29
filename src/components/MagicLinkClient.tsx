"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { verifyMagicLink } from "@/lib/auth";
import { writeUserEmail, authChangedEvent } from "@/lib/storage";

export function MagicLinkClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const token = searchParams.get("token") ?? "";

  useEffect(() => {
    if (!token) {
      setError("Magic link token is missing.");
      return;
    }
    let mounted = true;
    verifyMagicLink(token)
      .then((email) => {
        writeUserEmail(email);
        window.dispatchEvent(new Event(authChangedEvent));
        if (mounted) {
          router.replace("/account");
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
  }, [router, token]);

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
