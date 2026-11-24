#!/usr/bin/env node
// e2e-local.mjs — run the end-to-end suite on this machine, also where Playwright cannot download its own browser.
//
//   npm run test:e2e:local [-- extra Playwright arguments]
//
// Browser: PW_CHROMIUM_PATH if set; else Playwright's own Chromium if installed; else the newest Chromium
// headless shell already in the Playwright cache. Runs the `chromium` and `mobile` projects; the `visual`
// snapshots are Linux renders, so they run in CI only. The server it starts gets no database or email
// secrets (see playwright.config.ts).
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { homedir, platform } from "node:os";
import path from "node:path";
import { chromium } from "@playwright/test";

function cacheDir() {
  if (process.env.PLAYWRIGHT_BROWSERS_PATH) return process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (platform() === "darwin") return path.join(homedir(), "Library", "Caches", "ms-playwright");
  if (platform() === "win32") return path.join(homedir(), "AppData", "Local", "ms-playwright");
  return path.join(homedir(), ".cache", "ms-playwright");
}

function newestCachedHeadlessShell() {
  const dir = cacheDir();
  if (!existsSync(dir)) return undefined;
  const binary = platform() === "win32" ? "chrome-headless-shell.exe" : "chrome-headless-shell";
  const builds = readdirSync(dir)
    .filter((name) => /^chromium_headless_shell-\d+$/.test(name))
    .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]));
  for (const build of builds) {
    for (const folder of readdirSync(path.join(dir, build))) {
      const candidate = path.join(dir, build, folder, binary);
      if (existsSync(candidate)) return candidate;
    }
  }
  return undefined;
}

let browser = process.env.PW_CHROMIUM_PATH;
if (!browser && !existsSync(chromium.executablePath())) {
  browser = newestCachedHeadlessShell();
  if (!browser) {
    console.error(
      "No Chromium found: Playwright's own is not installed and the cache has no headless shell.\n" +
        "Set PW_CHROMIUM_PATH to a Chromium binary, or run the suite in CI: gh workflow run CI --ref <branch>"
    );
    process.exit(1);
  }
  console.log(`Using the cached Chromium at ${browser}`);
}

const result = spawnSync("npx", ["playwright", "test", "--project=chromium", "--project=mobile", ...process.argv.slice(2)], {
  stdio: "inherit",
  // Video recording needs Playwright's ffmpeg download too, so a cached browser runs with traces only.
  env: { ...process.env, ...(browser ? { PW_CHROMIUM_PATH: browser, PW_VIDEO: "off" } : {}) }
});
process.exit(result.status ?? 1);
