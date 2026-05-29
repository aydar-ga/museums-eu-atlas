export function getDatabaseUrlFromEnv(
  env: Record<string, string | undefined>
): string | null {
  const url =
    env.DATABASE_URL?.trim() ||
    env.POSTGRES_URL?.trim() ||
    env.POSTGRES_PRISMA_URL?.trim();
  return url ? url : null;
}

export function shouldRunMigrations(env: Record<string, string | undefined>): boolean {
  return env.VERCEL === "1" && Boolean(getDatabaseUrlFromEnv(env));
}
