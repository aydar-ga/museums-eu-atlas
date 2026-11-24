import type { SavedRoute } from "@/types";
import { isSignedIn } from "./storage";

export async function fetchSavedRoutes(): Promise<SavedRoute[]> {
  if (!isSignedIn()) {
    return [];
  }

  try {
    const response = await fetch("/api/routes");
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
  if (!isSignedIn()) {
    return null;
  }

  try {
    const response = await fetch("/api/routes", {
      method: "POST",
      headers: {
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
  if (!isSignedIn()) {
    return false;
  }

  try {
    const response = await fetch(`/api/routes/${encodeURIComponent(routeId)}`, {
      method: "DELETE"
    });
    return response.ok;
  } catch {
    return false;
  }
}
