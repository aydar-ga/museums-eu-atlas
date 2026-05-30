import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { userMuseumProgress, users } from "@/db/schema";

export type ProgressSnapshot = {
  planned: string[];
  visited: string[];
};

async function getUserId(email: string): Promise<string | null> {
  const db = getDb();
  if (!db) {
    return null;
  }

  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  return row?.id ?? null;
}

export async function readUserProgress(email: string): Promise<ProgressSnapshot | null> {
  const db = getDb();
  const userId = await getUserId(email);
  if (!db || !userId) {
    return null;
  }

  const rows = await db
    .select({
      museumSlug: userMuseumProgress.museumSlug,
      planned: userMuseumProgress.planned,
      visited: userMuseumProgress.visited
    })
    .from(userMuseumProgress)
    .where(eq(userMuseumProgress.userId, userId));

  const planned: string[] = [];
  const visited: string[] = [];
  for (const row of rows) {
    if (row.planned) {
      planned.push(row.museumSlug);
    }
    if (row.visited) {
      visited.push(row.museumSlug);
    }
  }

  return { planned, visited };
}

export async function writeUserProgress(email: string, snapshot: ProgressSnapshot): Promise<void> {
  const db = getDb();
  const userId = await getUserId(email);
  if (!db || !userId) {
    return;
  }

  const slugs = new Set([...snapshot.planned, ...snapshot.visited]);
  const now = new Date();
  const plannedSet = new Set(snapshot.planned);
  const visitedSet = new Set(snapshot.visited);

  await db.delete(userMuseumProgress).where(eq(userMuseumProgress.userId, userId));

  if (slugs.size === 0) {
    return;
  }

  await db.insert(userMuseumProgress).values(
    Array.from(slugs).map((museumSlug) => ({
      userId,
      museumSlug,
      planned: plannedSet.has(museumSlug),
      visited: visitedSet.has(museumSlug),
      updatedAt: now
    }))
  );
}
