import { execSync } from "node:child_process";

const env = process.env;
const databaseUrl =
  env.DATABASE_URL?.trim() ||
  env.POSTGRES_URL?.trim() ||
  env.POSTGRES_PRISMA_URL?.trim();
const shouldMigrate = env.VERCEL === "1" && Boolean(databaseUrl);

if (shouldMigrate) {
  console.log(`[vercel-build] Running Drizzle migrations (${env.VERCEL_ENV ?? "unknown"})…`);
  execSync("npx drizzle-kit migrate", {
    stdio: "inherit",
    env: {
      ...env,
      DATABASE_URL: databaseUrl
    }
  });
} else {
  console.log("[vercel-build] Skipping migrations (not a Vercel build with Postgres URL).");
}

execSync("npm run build:app", { stdio: "inherit" });
