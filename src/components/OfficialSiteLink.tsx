"use client";

import { trackEvent } from "@/lib/product-events";

/** The museum's official-site link, counted as an anonymous `official_site_opened` event. */
export function OfficialSiteLink({ slug, href }: { slug: string; href: string }) {
  return (
    <a
      className="primary-link"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      onClick={() => trackEvent({ name: "official_site_opened", subject: slug })}
      data-testid="official-site-link"
    >
      Official site
    </a>
  );
}
