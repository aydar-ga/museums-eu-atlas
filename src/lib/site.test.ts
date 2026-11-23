// @vitest-environment node
import { describe, expect, it } from "vitest";

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { metadata as homeMetadata } from "@/app/page";
import { metadata as accountMetadata } from "@/app/account/page";
import { generateMetadata as museumMetadata } from "@/app/museums/[slug]/page";
import { museums } from "@/data/museums";
import { rootMetadata, siteName, siteTitle, siteUrl } from "./site";

describe("site identity", () => {
  it("uses artmuse.app as the single canonical origin", () => {
    expect(siteUrl).toBe("https://artmuse.app");
    expect(siteName).toBe("ArtMuse");
    expect(siteTitle).toBe("ArtMuse — Europe's Top 50 Art Museums Atlas");
    expect(rootMetadata.metadataBase?.toString()).toBe("https://artmuse.app/");
    expect(rootMetadata.applicationName).toBe("ArtMuse");
    expect(rootMetadata.openGraph).toMatchObject({ siteName: "ArtMuse" });
  });

  it("gives the home page a canonical URL and og:url", () => {
    expect(homeMetadata.alternates?.canonical).toBe("/");
    expect(homeMetadata.openGraph).toMatchObject({ url: "/", siteName: "ArtMuse", title: siteTitle });
  });

  it("gives every museum page its own title, canonical URL and og:url", async () => {
    const meta = await museumMetadata({ params: Promise.resolve({ slug: "louvre-museum" }) });
    expect(meta.title).toBe("Louvre Museum");
    expect(meta.alternates?.canonical).toBe("/museums/louvre-museum");
    expect(meta.openGraph).toMatchObject({ url: "/museums/louvre-museum", siteName: "ArtMuse" });
  });

  it("keeps account and sign-in pages out of search results", () => {
    expect(accountMetadata.robots).toMatchObject({ index: false });
  });
});

describe("robots.txt and sitemap.xml", () => {
  it("allows crawling and links the sitemap", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://artmuse.app/sitemap.xml",
      host: "https://artmuse.app"
    });
  });

  it("lists the home page and every museum page with absolute artmuse.app URLs", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toHaveLength(1 + museums.length);
    expect(urls[0]).toBe("https://artmuse.app/");
    expect(urls).toContain("https://artmuse.app/museums/louvre-museum");
    expect(urls.every((url) => url.startsWith("https://artmuse.app/"))).toBe(true);
  });
});
