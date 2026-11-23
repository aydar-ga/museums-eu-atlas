import { museums } from "@/data/museums";

/** Raw list items accepted per request: 4x the dataset, leaving room for stale local slugs. */
export const maxSlugListItems = 200;
export const maxRouteNameLength = 80;

const knownSlugs: ReadonlySet<string> = new Set(museums.map((museum) => museum.slug));
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Returns the known museum slugs in `value`, de-duplicated in first-seen order.
 * Unknown and non-string items are dropped rather than rejected, so browsers that
 * still hold slugs of museums removed from the dataset keep syncing.
 * Returns null when `value` is not an array or exceeds `maxSlugListItems`.
 */
export function parseMuseumSlugList(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length > maxSlugListItems) {
    return null;
  }

  const slugs = new Set<string>();
  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }
    const slug = item.trim();
    if (knownSlugs.has(slug)) {
      slugs.add(slug);
    }
  }
  return Array.from(slugs);
}

/** Returns the trimmed route name, or null when it is empty, not a string, or too long. */
export function parseRouteName(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const name = value.trim();
  return name && name.length <= maxRouteNameLength ? name : null;
}

export function isUuid(value: string): boolean {
  return uuidPattern.test(value);
}

/** Parses a JSON object body; returns null for malformed JSON or a non-object payload. */
export async function readJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body !== null && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
