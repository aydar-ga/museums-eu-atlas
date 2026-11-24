import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

type LayoutProps = {
  isPanelOpen: boolean;
  /** Opens feedback in the side panel. Without it, the footer link is a plain link to /feedback. */
  onFeedbackOpen?: () => void;
  children: ReactNode;
};

export function Layout({ isPanelOpen, onFeedbackOpen, children }: LayoutProps) {
  // A plain left click stays on the page; Cmd/Ctrl/Shift/Alt and middle clicks keep their usual meaning.
  function openFeedback(event: MouseEvent<HTMLAnchorElement>) {
    if (!onFeedbackOpen || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    onFeedbackOpen();
  }

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
          <p>
            <Link href="/feedback" data-testid="footer-feedback-link" onClick={openFeedback}>
              Feedback or want more? Say hello
            </Link>
          </p>
        </footer>
      </div>
    </>
  );
}
