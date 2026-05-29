"use client";

import type { ReactNode } from "react";

import { CloseIcon } from "./Icons";

type SidePanelProps = {
  open: boolean;
  onClose: () => void;
  titleId: string;
  label: string;
  children: ReactNode;
};

export function SidePanel({ open, onClose, titleId, label, children }: SidePanelProps) {
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
        onClick={onClose}
      />
      <aside
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
