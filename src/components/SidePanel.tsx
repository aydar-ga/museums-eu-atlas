"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { CloseIcon } from "./Icons";

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type SidePanelProps = {
  open: boolean;
  onClose: () => void;
  titleId: string;
  label: string;
  children: ReactNode;
};

/**
 * A modal side panel. Escape, the close button and the backdrop all close it. While open it holds keyboard
 * focus (Tab and Shift+Tab wrap inside it); on close, focus returns to whatever opened it.
 */
export function SidePanel({ open, onClose, titleId, label, children }: SidePanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(focusableSelector));
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) {
        return;
      }
      const inside = panelRef.current.contains(document.activeElement);
      if (event.shiftKey && (document.activeElement === first || !inside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !inside)) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (opener?.isConnected) {
        opener.focus();
      }
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="side-panel-backdrop"
        aria-label="Close panel"
        data-testid="side-panel-backdrop"
        tabIndex={-1}
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="side-panel"
        data-testid="side-panel"
      >
        <div className="side-panel-header">
          <p className="visually-hidden" id={titleId}>
            {label}
          </p>
          <button
            ref={closeRef}
            type="button"
            className="utility-button side-panel-close"
            aria-label="Close panel"
            data-testid="side-panel-close"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>
        <div className="side-panel-body">{children}</div>
      </aside>
    </>
  );
}
