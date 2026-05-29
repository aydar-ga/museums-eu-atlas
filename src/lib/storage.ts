const visitedStorageKey = "visitedMuseums";
const plannedStorageKey = "plannedMuseums";
const migrationKey = `${visitedStorageKey}:slugMigrationComplete`;
const milestonesKey = `${visitedStorageKey}:announcedMilestones`;
const userKey = "museumsEuAtlasUser";

export const authChangedEvent = "museumsEuAtlasAuthChanged";

export function readStringArray(key: string): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]") as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function readVisited(): Set<string> {
  return new Set(readStringArray(visitedStorageKey));
}

export function writeVisited(values: Set<string>): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(visitedStorageKey, JSON.stringify(Array.from(values)));
}

export function readPlanned(): Set<string> {
  return new Set(readStringArray(plannedStorageKey));
}

export function writePlanned(values: Set<string>): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(plannedStorageKey, JSON.stringify(Array.from(values)));
}

export function migrateLegacyVisited(slugsByLegacyId: Map<string, string>): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }
  const values = readStringArray(visitedStorageKey);
  if (localStorage.getItem(migrationKey) === "true") {
    return new Set(values);
  }
  const migrated = values.map((value) => slugsByLegacyId.get(value) ?? value);
  const unique = new Set(migrated);
  writeVisited(unique);
  localStorage.setItem(migrationKey, "true");
  return unique;
}

export function readAnnouncedMilestones(): Set<string> {
  return new Set(readStringArray(milestonesKey));
}

export function writeAnnouncedMilestones(values: Set<string>): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(milestonesKey, JSON.stringify(Array.from(values)));
}

function readStoredUserRaw(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(userKey);
}

export function readUserEmail(): string | null {
  try {
    const parsed = JSON.parse(readStoredUserRaw() || "null") as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "email" in parsed &&
      typeof parsed.email === "string"
    ) {
      return parsed.email;
    }
  } catch {
    return null;
  }
  return null;
}

export function writeUserEmail(email: string): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(userKey, JSON.stringify({ email }));
}

export function clearUser(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(userKey);
}
