import { devAffordancesEnabled } from "./env";
import { authChangedEvent, clearUser, isSignedIn, readPlanned, readVisited, writePlanned, writeVisited } from "./storage";

export type ProgressSnapshot = {
  planned: string[];
  visited: string[];
};

export function mergeProgress(
  local: ProgressSnapshot,
  remote: ProgressSnapshot
): ProgressSnapshot {
  return {
    planned: Array.from(new Set([...local.planned, ...remote.planned])),
    visited: Array.from(new Set([...local.visited, ...remote.visited]))
  };
}

export async function fetchServerProgress(): Promise<ProgressSnapshot | null> {
  if (!isSignedIn()) {
    return null;
  }

  try {
    const response = await fetch("/api/progress");
    if (response.status === 401) {
      // No valid session cookie (expired, signed out elsewhere, or a pre-cookie sign-in): show signed out.
      clearUser();
      window.dispatchEvent(new Event(authChangedEvent));
      return null;
    }
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as ProgressSnapshot;
  } catch {
    return null;
  }
}

export async function syncProgressToServer(
  planned: Set<string>,
  visited: Set<string>
): Promise<"synced" | "offline" | "unauthorized"> {
  if (!isSignedIn()) {
    return "unauthorized";
  }

  try {
    const response = await fetch("/api/progress", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        planned: Array.from(planned),
        visited: Array.from(visited)
      })
    });
    if (response.status === 401) {
      return "unauthorized";
    }
    if (!response.ok) {
      return "offline";
    }
    return "synced";
  } catch {
    return "offline";
  }
}

export async function hydrateProgressFromServer(): Promise<ProgressSnapshot | null> {
  const remote = await fetchServerProgress();
  if (!remote) {
    return null;
  }

  const local: ProgressSnapshot = {
    planned: Array.from(readPlanned()),
    visited: Array.from(readVisited())
  };
  const merged = mergeProgress(local, remote);
  writePlanned(new Set(merged.planned));
  writeVisited(new Set(merged.visited));
  await syncProgressToServer(new Set(merged.planned), new Set(merged.visited));
  return merged;
}

export async function ensureDevSession(email: string): Promise<void> {
  if (!devAffordancesEnabled) {
    return;
  }

  try {
    // The response sets the HttpOnly session cookie; there is nothing to store here.
    await fetch("/api/auth/dev-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
  } catch {
    // Dev-only helper; ignore network failures in local runs without API routes.
  }
}
