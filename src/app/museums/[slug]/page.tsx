import Link from "next/link";
import { notFound } from "next/navigation";

/* eslint-disable @next/next/no-img-element -- Native images preserve source/license display and fallback behavior. */

import { ArrowLeftIcon } from "@/components/Icons";
import { fallbackImage, museumImageUrl } from "@/lib/image";
import { getMuseum, museums, relatedMuseums } from "@/data/museums";

export function generateStaticParams() {
  return museums.map((museum) => ({ slug: museum.slug }));
}

export default async function MuseumDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const museum = getMuseum(slug);
  if (!museum) {
    notFound();
  }
  const related = relatedMuseums(museum);

  return (
    <>
      <nav className="breadcrumb" aria-label="Navigation" data-testid="breadcrumb">
        <Link href="/" className="breadcrumb-link" data-testid="breadcrumb-all-museums">
          <ArrowLeftIcon />
          <span>All museums</span>
        </Link>
      </nav>
      <article className="detail-layout" data-total-museums="1" data-testid="museum-detail">
        <aside className="detail-media">
          <img
            src={museumImageUrl(museum.image)}
            data-fallback-src={fallbackImage}
            alt={museum.imageAlt}
            className="detail-image"
            data-testid="detail-image"
            width="720"
            height="460"
          />
          <p className="image-credit">{museum.imageCredit}</p>
        </aside>
        <section className="detail-content">
          <p className="detail-location">{museum.location}</p>
          <h1 data-testid="detail-title">{museum.name}</h1>
          <div className="detail-tags" aria-label="Museum characteristics">
            <span>{museum.category}</span>
            <span>{museum.popularityTier}</span>
            {museum.familyFriendly ? <span>Family-friendly</span> : null}
            {museum.hasOnlineCollection ? <span>Online collection</span> : null}
          </div>
          <p className="lead">{museum.summary}</p>
          <section className="detail-section">
            <h2>Why visit</h2>
            <p>{museum.whyVisit}</p>
          </section>
          <section className="detail-section">
            <h2>Highlights</h2>
            <ul className="feature-list">
              {museum.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
            </ul>
          </section>
          <section className="detail-section">
            <h2>Themes</h2>
            <ul className="tag-list">
              {museum.themes.map((theme) => <li key={theme}>{theme}</li>)}
            </ul>
          </section>
          <div className="detail-actions">
            <a className="primary-link" href={museum.officialUrl} rel="noopener noreferrer" target="_blank">Official site</a>
            {museum.onlineUrl ? <a className="secondary-link" href={museum.onlineUrl} rel="noopener noreferrer" target="_blank">Online collection</a> : null}
          </div>
          <section className="detail-section sources">
            <h2>Sources</h2>
            <ul>
              {museum.sourceUrls.map((sourceUrl) => (
                <li key={sourceUrl}><a href={sourceUrl} rel="noopener noreferrer" target="_blank">{sourceUrl}</a></li>
              ))}
            </ul>
          </section>
        </section>
      </article>
      {related.length ? (
        <section className="related-section" aria-label="Related museums">
          <h2>Nearby in the route</h2>
          <ul className="related-list">
            {related.map((item) => (
              <li key={item.slug}>
                <Link href={`/museums/${item.slug}/`}>{item.name}</Link>
                <span>{item.city} · {item.category}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
