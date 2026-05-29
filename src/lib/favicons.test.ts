import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const faviconDir = path.join(process.cwd(), "public/favicons");

describe("favicon assets", () => {
  it("keeps the source museum icon svg", () => {
    const svg = readFileSync(path.join(faviconDir, "museum-icon.svg"), "utf8");
    expect(svg).toContain('viewBox="0 0 32 32"');
    expect(svg).toContain('aria-label="Museum"');
  });

  it("lists android and maskable icons in the web manifest", () => {
    const manifest = JSON.parse(readFileSync(path.join(faviconDir, "manifest.json"), "utf8")) as {
      name: string;
      theme_color: string;
      icons: Array<{ src: string; sizes: string; purpose?: string }>;
    };

    expect(manifest.name).toBe("Art Museums Atlas");
    expect(manifest.theme_color).toBe("#111111");
    expect(manifest.icons.map((icon) => icon.src)).toEqual(
      expect.arrayContaining([
        "/favicons/android-icon-192x192.png",
        "/favicons/android-icon-144x144.png"
      ])
    );
    expect(manifest.icons.some((icon) => icon.purpose?.includes("maskable"))).toBe(true);
  });

  it("generates core png and ico assets", () => {
    for (const filename of [
      "favicon.ico",
      "favicon-16x16.png",
      "favicon-32x32.png",
      "apple-icon-180x180.png",
      "android-icon-192x192.png",
      "ms-icon-144x144.png"
    ]) {
      expect(readFileSync(path.join(faviconDir, filename)).byteLength).toBeGreaterThan(0);
    }
  });
});
