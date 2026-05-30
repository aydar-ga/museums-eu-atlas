import type { ReactNode } from "react";

type LayoutProps = {
  isPanelOpen: boolean;
  children: ReactNode;
};

export function Layout({ isPanelOpen, children }: LayoutProps) {
  return (
    <>
      <a className="skip-link" href="#content">
        Skip to content
      </a>
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
