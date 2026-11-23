import type { Metadata } from "next";

/** The one public address of the product. Canonical URLs, og:url, robots.txt and the sitemap all use it. */
export const siteUrl = "https://artmuse.app";
export const siteName = "ArtMuse";
export const siteTitle = "ArtMuse — Europe's Top 50 Art Museums Atlas";
export const siteDescription =
  "Track visits, compare cities, and plan routes through Europe's top 50 art museums and major global collections.";

/** Open Graph fields shared by every page; Next replaces (not merges) openGraph per page, so spread this. */
export const baseOpenGraph = {
  siteName,
  locale: "en_US",
  type: "website"
} as const;

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteTitle, template: `%s — ${siteName}` },
  description: siteDescription,
  applicationName: siteName,
  openGraph: { ...baseOpenGraph, title: siteTitle, description: siteDescription }
};

/** For account and sign-in views: useful to visitors, not to search results. */
export const privatePageMetadata: Metadata = {
  robots: { index: false, follow: true }
};
