import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const isVercel = process.env.VERCEL === "1";
// Preview deployments load the Vercel toolbar from vercel.live, so they only report violations.
const isPreview = process.env.VERCEL_ENV === "preview";

// Static policy (no nonce), so pages stay statically rendered. The App Router emits inline scripts,
// hence 'unsafe-inline'; `next dev` also needs eval and its HMR websocket.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Vercel serves HTTPS only; a local `next start` over http://127.0.0.1 must not be upgraded.
  ...(isVercel ? ["upgrade-insecure-requests"] : [])
].join("; ");

// OWASP values. The CSP is enforced everywhere except Preview, where it is report-only.
// The e2e suite runs a production build and asserts zero violations.
const cspHeaders = isPreview
  ? [
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
      { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy }
    ]
  : [{ key: "Content-Security-Policy", value: contentSecurityPolicy }];

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-Frame-Options", value: "DENY" },
  ...cspHeaders
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  }
};

export default nextConfig;
