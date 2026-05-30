import { readPlanned, readSessionToken, readVisited, writePlanned, writeSessionToken, writeVisited } from "./storage";

export type ProgressSnapshot = {
  planned: string[];
  visited: string[];
};

function authHeaders(): HeadersInit {
  const token = readSessionToken();
  if (!token) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}

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
  const token = readSessionToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch("/api/progress", { headers: authHeaders() });
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
  const token = readSessionToken();
  if (!token) {
    return "unauthorized";
  }

  try {
    const response = await fetch("/api/progress", {
      method: "PUT",
      headers: {
        ...authHeaders(),
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
  if (process.env.NODE_ENV === "production") {
    return;
  }

  try {
    const response = await fetch("/api/auth/dev-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    if (!response.ok) {
      return;
    }
    const body = (await response.json()) as { sessionToken?: string };
    if (body.sessionToken) {
      writeSessionToken(body.sessionToken);
    }
  } catch {
    // Dev-only helper; ignore network failures in local runs without API routes.
  }
}
