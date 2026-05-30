"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type UtilityRailHostProps = {
  children: ReactNode;
};

export function UtilityRailHost({ children }: UtilityRailHostProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div className="utility-rail-host" data-testid="utility-rail-host">
      {children}
    </div>,
    document.body
  );
}
