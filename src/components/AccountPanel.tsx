"use client";

import { useCallback, useEffect, useState } from "react";

import { syncProgressToServer } from "@/lib/progress-sync";
import { createSavedRoute, deleteSavedRoute, fetchSavedRoutes } from "@/lib/routes-api";
import { readPlanned, readSessionToken, readUserEmail, readVisited } from "@/lib/storage";
import type { SavedRoute } from "@/types";

type AccountPanelProps = {
  email?: string | null;
  onSignInOpen?: () => void;
  onLogout?: () => void;
};

export function AccountPanel({ email, onSignInOpen, onLogout }: AccountPanelProps) {
  const [storedEmail, setStoredEmail] = useState<string | null>(null);
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [routeName, setRouteName] = useState("");
  const [syncStatus, setSyncStatus] = useState<"idle" | "synced" | "offline">("idle");
  const [routeMessage, setRouteMessage] = useState("");

  useEffect(() => {
    if (email === undefined) {
      setStoredEmail(readUserEmail());
    }
  }, [email]);

  const activeEmail = email ?? storedEmail;
  const plannedSlugs = Array.from(readPlanned());

  const refreshRoutes = useCallback(async () => {
    const nextRoutes = await fetchSavedRoutes();
    setRoutes(nextRoutes);
  }, []);

  useEffect(() => {
    if (!activeEmail || !readSessionToken()) {
      setRoutes([]);
      setSyncStatus("idle");
      return;
    }

    let cancelled = false;

    void (async () => {
      const nextRoutes = await fetchSavedRoutes();
      if (cancelled) {
        return;
      }
      setRoutes(nextRoutes);
      const status = await syncProgressToServer(new Set(readPlanned()), new Set(readVisited()));
      if (!cancelled) {
        setSyncStatus(status === "synced" ? "synced" : status === "offline" ? "offline" : "idle");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeEmail]);

  async function handleSaveRoute() {
    const name = routeName.trim();
    if (!name || plannedSlugs.length === 0) {
      setRouteMessage("Add planned museums on the atlas before saving a route.");
      return;
    }

    const saved = await createSavedRoute(name, plannedSlugs);
    if (!saved) {
      setRouteMessage("Could not save route. Check your session and database connection.");
      return;
    }

    setRouteName("");
    setRouteMessage(`Saved route "${saved.name}".`);
    await refreshRoutes();
  }

  async function handleDeleteRoute(routeId: string) {
    const deleted = await deleteSavedRoute(routeId);
    if (deleted) {
      await refreshRoutes();
    }
  }

  if (!activeEmail) {
    return (
      <section className="auth-shell auth-shell-panel">
        <div className="account-panel" data-testid="account-panel">
          <h1 data-testid="account-title">Sign in to continue</h1>
          <p className="hero-copy">Use a magic link to open your account and sync museum progress.</p>
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
        <p className="account-email" data-testid="account-email">{activeEmail}</p>
        <p className="hero-copy" data-testid="account-sync-status">
          {syncStatus === "synced"
            ? "Planned and visited museums sync to your account."
            : syncStatus === "offline"
              ? "Progress stays local until the database connection is available."
              : "Signed in. Museum progress syncs when the database is connected."}
        </p>

        <section className="route-panel" aria-label="Saved routes" data-testid="saved-routes-panel">
          <h2 className="route-panel-title">Saved routes</h2>
          <p className="hero-copy">Save your current planned museums as a trip route.</p>
          <label className="route-field">
            <span className="visually-hidden">Route name</span>
            <input
              className="filter-input"
              type="text"
              value={routeName}
              placeholder="Spring Europe trip"
              onChange={(event) => setRouteName(event.target.value)}
              data-testid="route-name-input"
            />
          </label>
          <button type="button" className="primary-link" data-testid="save-route-submit" onClick={() => void handleSaveRoute()}>
            Save planned museums ({plannedSlugs.length})
          </button>
          {routeMessage ? (
            <p className="route-message" data-testid="route-message" role="status">
              {routeMessage}
            </p>
          ) : null}
          <ul className="route-list" data-testid="saved-route-list">
            {routes.map((route) => (
              <li key={route.id} className="route-list-item" data-testid={`saved-route-${route.id}`}>
                <div>
                  <strong data-testid={`saved-route-name-${route.id}`}>{route.name}</strong>
                  <span className="route-meta">{route.museumSlugs.length} museums</span>
                </div>
                <button
                  type="button"
                  className="secondary-link route-delete"
                  data-testid={`delete-route-${route.id}`}
                  onClick={() => void handleDeleteRoute(route.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>

        <button type="button" className="secondary-link" data-testid="logout-submit" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </section>
  );
}
