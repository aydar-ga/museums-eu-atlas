import { execSync } from "node:child_process";

const databaseUrl =
  process.env.DATABASE_URL?.trim() ||
  process.env.POSTGRES_URL?.trim() ||
  process.env.POSTGRES_PRISMA_URL?.trim();

if (!databaseUrl) {
  console.log("No Postgres URL configured; skipping Drizzle migrations.");
  process.exit(0);
}

console.log("Running Drizzle migrations...");
execSync("npx drizzle-kit migrate", {
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: databaseUrl
  }
});
