import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { savedRoutes, users } from "@/db/schema";

export type SavedRouteRecord = {
  id: string;
  name: string;
  museumSlugs: string[];
  createdAt: string;
  updatedAt: string;
};

async function getUserId(email: string): Promise<string | null> {
  const db = getDb();
  if (!db) {
    return null;
  }

  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  return row?.id ?? null;
}

function serializeRoute(row: typeof savedRoutes.$inferSelect): SavedRouteRecord {
  return {
    id: row.id,
    name: row.name,
    museumSlugs: row.museumSlugs,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

export async function listSavedRoutes(email: string): Promise<SavedRouteRecord[]> {
  const db = getDb();
  const userId = await getUserId(email);
  if (!db || !userId) {
    return [];
  }

  const rows = await db
    .select()
    .from(savedRoutes)
    .where(eq(savedRoutes.userId, userId))
    .orderBy(desc(savedRoutes.updatedAt));

  return rows.map(serializeRoute);
}

export async function createSavedRoute(
  email: string,
  name: string,
  museumSlugs: string[]
): Promise<SavedRouteRecord | null> {
  const db = getDb();
  const userId = await getUserId(email);
  if (!db || !userId) {
    return null;
  }

  const now = new Date();
  const [row] = await db
    .insert(savedRoutes)
    .values({
      userId,
      name: name.trim(),
      museumSlugs,
      createdAt: now,
      updatedAt: now
    })
    .returning();

  return row ? serializeRoute(row) : null;
}

export async function deleteSavedRoute(email: string, routeId: string): Promise<boolean> {
  const db = getDb();
  const userId = await getUserId(email);
  if (!db || !userId) {
    return false;
  }

  const deleted = await db
    .delete(savedRoutes)
    .where(and(eq(savedRoutes.id, routeId), eq(savedRoutes.userId, userId)))
    .returning({ id: savedRoutes.id });

  return deleted.some((row) => row.id === routeId);
}
