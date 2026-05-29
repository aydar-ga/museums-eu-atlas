import { getDb } from "@/db";
import { users } from "@/db/schema";

export async function recordUserSignIn(email: string): Promise<void> {
  const db = getDb();
  if (!db) {
    return;
  }

  const now = new Date();
  await db
    .insert(users)
    .values({
      email,
      createdAt: now,
      lastSignInAt: now
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { lastSignInAt: now }
    });
}
