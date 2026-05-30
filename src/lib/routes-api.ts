import type { SavedRoute } from "@/types";
import { readSessionToken } from "./storage";

function authHeaders(): HeadersInit {
  const token = readSessionToken();
  if (!token) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}

export async function fetchSavedRoutes(): Promise<SavedRoute[]> {
  const token = readSessionToken();
  if (!token) {
    return [];
  }

  try {
    const response = await fetch("/api/routes", { headers: authHeaders() });
    if (!response.ok) {
      return [];
    }
    const body = (await response.json()) as { routes?: SavedRoute[] };
    return body.routes ?? [];
  } catch {
    return [];
  }
}

export async function createSavedRoute(name: string, museumSlugs: string[]): Promise<SavedRoute | null> {
  const token = readSessionToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch("/api/routes", {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, museumSlugs })
    });
    if (!response.ok) {
      return null;
    }
    const body = (await response.json()) as { route?: SavedRoute };
    return body.route ?? null;
  } catch {
    return null;
  }
}

export async function deleteSavedRoute(routeId: string): Promise<boolean> {
  const token = readSessionToken();
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`/api/routes/${encodeURIComponent(routeId)}`, {
      method: "DELETE",
      headers: authHeaders()
    });
    return response.ok;
  } catch {
    return false;
  }
}
