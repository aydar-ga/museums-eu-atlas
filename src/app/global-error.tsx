"use client";

import "./globals.css";

/** Replaces the root layout when it fails, so it renders its own html and body with the default dark theme. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <main className="no-results" data-testid="global-error-page">
          <h1>ArtMuse is having trouble</h1>
          <p>Please try again in a moment. Your planned and visited museums are still saved in this browser.</p>
          {error.digest ? <p className="route-meta">Reference: {error.digest}</p> : null}
          <button type="button" className="primary-action" onClick={reset}>
            Try again
          </button>
          {/* A plain link: the router may be what failed. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="primary-link" href="/">Back to museums</a>
        </main>
      </body>
    </html>
  );
}
