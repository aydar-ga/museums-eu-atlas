import Link from "next/link";

/* eslint-disable @next/next/no-img-element -- Native images preserve the compact card DOM and client fallback behavior. */

import { fallbackImage, museumImageUrl } from "../lib/image";
import type { Museum } from "../types";
import { LearnMoreIcon } from "./Icons";

type MuseumCardProps = {
  museum: Museum;
  legacyId: number;
  planned: boolean;
  visited: boolean;
  onTogglePlanned: (slug: string) => void;
  onToggleVisited: (slug: string) => void;
};

export function MuseumCard({
  museum,
  legacyId,
  planned,
  visited,
  onTogglePlanned,
  onToggleVisited
}: MuseumCardProps) {
  return (
    <li
      className={`museum-item${visited ? " visited" : ""}${planned ? " planned" : ""}`}
      data-id={museum.slug}
      data-legacy-id={legacyId}
      data-museum-slug={museum.slug}
      data-testid="museum-card"
      data-search={museum.searchText}
      data-country={museum.country}
      data-city={museum.city}
      data-category={museum.category}
    >
      <Link className="museum-image-link" href={`/museums/${museum.slug}/`} aria-label={`Details: ${museum.name}`} data-testid={`museum-image-link-${museum.slug}`}>
        <img
          src={museumImageUrl(museum.image)}
          data-fallback-src={fallbackImage}
          alt={museum.imageAlt}
          className="museum-image"
          data-testid={`museum-image-${museum.slug}`}
          width="320"
          height="220"
          loading="lazy"
          onError={(event) => {
            if (event.currentTarget.src !== new URL(fallbackImage, window.location.origin).toString()) {
              event.currentTarget.src = fallbackImage;
            }
          }}
        />
      </Link>
      <div className="museum-content">
        <div className="museum-heading">
          <p className="museum-name">{museum.name}</p>
          <Link className="details-link" href={`/museums/${museum.slug}/`} aria-label={`Details: ${museum.name}`} data-testid={`details-link-${museum.slug}`}>
            <LearnMoreIcon />
          </Link>
        </div>
        <p className="museum-city">
          {museum.city} · {museum.category}
        </p>
      </div>
      <div className="museum-actions">
        <button
          type="button"
          className="plan-toggle museum-chip"
          data-id={museum.slug}
          data-testid={`plan-toggle-${museum.slug}`}
          aria-pressed={planned}
          onClick={() => onTogglePlanned(museum.slug)}
        >
          {planned ? "Planned" : "Want to visit"}
        </button>
        <button
          type="button"
          className="visit-toggle museum-chip"
          data-id={museum.slug}
          data-testid={`visit-toggle-${museum.slug}`}
          aria-pressed={visited}
          onClick={() => onToggleVisited(museum.slug)}
        >
          {visited ? "Visited" : "Mark visited"}
        </button>
      </div>
    </li>
  );
}
