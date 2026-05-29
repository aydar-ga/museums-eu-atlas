"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { clearUser, readUserEmail, authChangedEvent } from "@/lib/storage";
import type { User } from "@/types";
import { AccountPanel } from "./AccountPanel";
import { AuthFlow } from "./AuthFlow";
import { Layout } from "./Layout";
import { SidePanel } from "./SidePanel";

type PanelMode = "signin" | "account";

function panelModeFromPath(pathname: string): PanelMode | null {
  if (pathname === "/signup" || pathname === "/login") {
    return "signin";
  }
  if (pathname === "/account") {
    return "account";
  }
  return null;
}

export function ClientShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const routePanelMode = panelModeFromPath(pathname);
  const [user, setUser] = useState<User | null>(null);
  const [panelOpen, setPanelOpen] = useState(Boolean(routePanelMode));
  const [panelMode, setPanelMode] = useState<PanelMode>(routePanelMode ?? "signin");

  const refreshUser = useCallback(() => {
    const email = readUserEmail();
    setUser(email ? { email } : null);
  }, []);

  useEffect(() => {
    refreshUser();
    window.addEventListener("storage", refreshUser);
    window.addEventListener(authChangedEvent, refreshUser);
    return () => {
      window.removeEventListener("storage", refreshUser);
      window.removeEventListener(authChangedEvent, refreshUser);
    };
  }, [refreshUser]);

  useEffect(() => {
    if (routePanelMode) {
      setPanelMode(routePanelMode);
      setPanelOpen(true);
    }
  }, [routePanelMode]);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    if (routePanelMode) {
      router.replace("/");
    }
  }, [routePanelMode, router]);

  const openSignIn = useCallback(() => {
    setPanelMode("signin");
    setPanelOpen(true);
  }, []);

  const openAccount = useCallback(() => {
    setPanelMode("account");
    setPanelOpen(true);
  }, []);

  const logout = useCallback(() => {
    clearUser();
    setUser(null);
    setPanelOpen(false);
  }, []);

  return (
    <>
      <Layout
        user={user}
        onLogout={logout}
        onSignInOpen={openSignIn}
        onAccountOpen={openAccount}
        isPanelOpen={panelOpen}
      >
        {children}
      </Layout>
      <SidePanel
        open={panelOpen}
        onClose={closePanel}
        titleId="side-panel-title"
        label={panelMode === "signin" ? "Magic link sign up" : "Account"}
      >
        {panelMode === "signin" ? (
          <AuthFlow />
        ) : (
          <AccountPanel onSignInOpen={openSignIn} />
        )}
      </SidePanel>
    </>
  );
}
