import type { ReactNode } from "react";

import type { User } from "../types";
import { UserIcon } from "./Icons";
import { ThemeSwitcher } from "./ThemeSwitcher";

type LayoutProps = {
  user: User | null;
  onLogout: () => void;
  onSignInOpen: () => void;
  onAccountOpen: () => void;
  isPanelOpen: boolean;
  children: ReactNode;
};

export function Layout({
  user,
  onLogout,
  onSignInOpen,
  onAccountOpen,
  isPanelOpen,
  children
}: LayoutProps) {
  return (
    <>
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <aside className="utility-rail" aria-label="Account and theme">
        {user ? (
          <>
            <button
              type="button"
              className="utility-button"
              data-testid="account-link"
              aria-label="Account"
              title="Account"
              onClick={onAccountOpen}
            >
              <UserIcon />
            </button>
            <button
              type="button"
              className="utility-button utility-button-text"
              onClick={onLogout}
              data-testid="logout-submit"
            >
              Sign out
            </button>
          </>
        ) : (
          <button
            type="button"
            className="utility-button"
            data-testid="login-link"
            aria-label="Sign in"
            title="Sign in"
            onClick={onSignInOpen}
          >
            <UserIcon />
          </button>
        )}
        <ThemeSwitcher />
      </aside>
      <div
        className={isPanelOpen ? "app-stage app-stage-dimmed" : "app-stage"}
        data-testid="app-stage"
        data-panel-open={isPanelOpen ? "true" : "false"}
      >
        <main id="content" className="container">
          {children}
        </main>
        <footer className="footer">
          <p>2026 Museums Atlas. All rights reserved</p>
          <p>Built with love by Amateur Art Connoisseur</p>
        </footer>
      </div>
    </>
  );
}
