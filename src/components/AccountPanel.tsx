"use client";

import { useEffect, useState } from "react";

import { readUserEmail } from "@/lib/storage";

type AccountPanelProps = {
  onSignInOpen?: () => void;
};

export function AccountPanel({ onSignInOpen }: AccountPanelProps) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(readUserEmail());
  }, []);

  if (!email) {
    return (
      <section className="auth-shell auth-shell-panel">
        <div className="account-panel" data-testid="account-panel">
          <h1 data-testid="account-title">Sign in to continue</h1>
          <p className="hero-copy">Use a magic link to open your local route account.</p>
          <button type="button" className="primary-link" data-testid="login-link" onClick={onSignInOpen}>
            Sign in
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-shell auth-shell-panel">
      <div className="account-panel" data-testid="account-panel">
        <h1 data-testid="account-title">Your museum route</h1>
        <p className="account-email" data-testid="account-email">{email}</p>
        <p className="hero-copy">Magic-link session is active in this browser. Museum visit progress remains local-first.</p>
      </div>
    </section>
  );
}
