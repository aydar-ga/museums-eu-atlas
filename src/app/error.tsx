"use client";

import Link from "next/link";

/** Route-level error boundary. It shows no error details; the digest lets logs be matched without leaking them. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="no-results" data-testid="error-page">
      <h1>Something went wrong</h1>
      <p>This page could not be shown. Your planned and visited museums are still saved in this browser.</p>
      {error.digest ? <p className="route-meta">Reference: {error.digest}</p> : null}
      <button type="button" className="primary-action" onClick={reset}>
        Try again
      </button>
      <Link className="primary-link" href="/">Back to museums</Link>
    </section>
  );
}
