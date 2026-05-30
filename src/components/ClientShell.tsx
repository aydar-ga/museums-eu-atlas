"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { ensureDevSession, hydrateProgressFromServer } from "@/lib/progress-sync";
import { clearUser, readUserEmail, writeUserEmail, authChangedEvent, progressChangedEvent } from "@/lib/storage";
import type { User } from "@/types";
import { AccountPanel } from "./AccountPanel";
import { AuthFlow } from "./AuthFlow";
import { Layout } from "./Layout";
import { SidePanel } from "./SidePanel";
import { UtilityRail } from "./UtilityRail";
import { UtilityRailHost } from "./UtilityRailHost";

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

function readDevTestUserEmail(): string | null {
  if (process.env.NODE_ENV === "production" || typeof window === "undefined") {
    return null;
  }
  const email = new URL(window.location.href).searchParams.get("testUser")?.trim().toLocaleLowerCase("en-US") ?? "";
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? email : null;
}

export function ClientShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const routePanelMode = panelModeFromPath(pathname);
  const [user, setUser] = useState<User | null>(null);
  const [panelOpen, setPanelOpen] = useState(Boolean(routePanelMode));
  const [panelMode, setPanelMode] = useState<PanelMode>(routePanelMode ?? "signin");

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!panelOpen) {
      root.classList.remove("panel-open");
      root.style.overflow = "";
      return;
    }

    root.classList.add("panel-open");
    root.style.overflow = "hidden";
    return () => {
      root.classList.remove("panel-open");
      root.style.overflow = "";
    };
  }, [panelOpen]);

  const refreshUser = useCallback(async () => {
    const testUserEmail = readDevTestUserEmail();
    if (testUserEmail) {
      writeUserEmail(testUserEmail);
      await ensureDevSession(testUserEmail);
      setUser({ email: testUserEmail });
      await hydrateProgressFromServer();
      window.dispatchEvent(new Event(progressChangedEvent));
      return;
    }
    const email = readUserEmail();
    setUser(email ? { email } : null);
    if (email) {
      await hydrateProgressFromServer();
      window.dispatchEvent(new Event(progressChangedEvent));
    }
  }, []);

  useEffect(() => {
    void refreshUser();
    const handleAuthChange = () => {
      void refreshUser();
    };
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener(authChangedEvent, handleAuthChange);
    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener(authChangedEvent, handleAuthChange);
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
    window.dispatchEvent(new Event(progressChangedEvent));
    if (routePanelMode) {
      router.replace("/");
    }
  }, [routePanelMode, router]);

  return (
    <>
      <UtilityRailHost>
        <UtilityRail user={user} onSignInOpen={openSignIn} onAccountOpen={openAccount} />
      </UtilityRailHost>
      <Layout isPanelOpen={panelOpen}>{children}</Layout>
      <SidePanel
        open={panelOpen}
        onClose={closePanel}
        titleId="side-panel-title"
        label={panelMode === "signin" ? "Magic link sign up" : "Account"}
      >
        {panelMode === "signin" ? (
          <AuthFlow />
        ) : (
          <AccountPanel email={user?.email ?? null} onSignInOpen={openSignIn} onLogout={logout} />
        )}
      </SidePanel>
    </>
  );
}
