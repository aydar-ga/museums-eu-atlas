import type { Metadata, Viewport } from "next";
import { Roboto_Mono } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";

import { ClientShell } from "@/components/ClientShell";
import "./globals.css";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Europe's Top 50 Art Museums Atlas",
  description:
    "A compact tracker for Europe's major art museums, with local visit progress, filters, and researched museum detail pages.",
  applicationName: "Art Museums Atlas",
  manifest: "/favicons/manifest.json",
  icons: {
    icon: [
      { url: "/favicons/favicon.ico" },
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicons/android-icon-192x192.png", sizes: "192x192", type: "image/png" }
    ],
    apple: [
      { url: "/favicons/apple-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/favicons/apple-icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/favicons/apple-icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/favicons/apple-icon-120x120.png", sizes: "120x120", type: "image/png" },
      { url: "/favicons/apple-icon-114x114.png", sizes: "114x114", type: "image/png" },
      { url: "/favicons/apple-icon-76x76.png", sizes: "76x76", type: "image/png" },
      { url: "/favicons/apple-icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/favicons/apple-icon-60x60.png", sizes: "60x60", type: "image/png" },
      { url: "/favicons/apple-icon-57x57.png", sizes: "57x57", type: "image/png" }
    ],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/favicons/apple-icon-precomposed.png"
      }
    ]
  },
  other: {
    "msapplication-TileColor": "#111111",
    "msapplication-TileImage": "/favicons/ms-icon-144x144.png",
    "msapplication-config": "/favicons/browserconfig.xml"
  },
  openGraph: {
    title: "Europe's Top 50 Art Museums Atlas",
    description:
      "Track visits, compare cities, and plan routes through major European and global art collections.",
    locale: "en_US",
    siteName: "museums-eu-atlas"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111111"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <Script
          id="theme-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("museumsEuAtlasTheme");var p=window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches;var t=s==="light"||s==="dark"?s:p?"light":"dark";document.documentElement.setAttribute("data-theme",t);document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`
          }}
        />
      </head>
      <body className={robotoMono.className}>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
