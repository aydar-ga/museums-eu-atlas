"use client";

import { useEffect, useMemo, useState } from "react";

import { MuseumCard } from "../components/MuseumCard";
import {
  categories,
  museums,
  uniqueCities,
  uniqueCountries
} from "../data/museums";
import {
  migrateLegacyVisited,
  readAnnouncedMilestones,
  readPlanned,
  writeAnnouncedMilestones,
  writePlanned,
  writeVisited
} from "../lib/storage";

const milestoneCopy: Record<number, string> = {
  1: "First museum marked. Your route has started.",
  5: "Five museums visited: a strong cultural weekend.",
  10: "Ten museums visited: your map is becoming serious.",
  25: "Halfway through the top 50.",
  50: "All 50 museums marked. Collection complete."
};

export function HomePage() {
  const slugsByLegacyId = useMemo(
    () => new Map(museums.map((museum, index) => [String(index), museum.slug])),
    []
  );
  const [visitedMuseums, setVisitedMuseums] = useState<Set<string>>(() => new Set());
  const [plannedMuseums, setPlannedMuseums] = useState<Set<string>>(() => new Set());
  const [announcedMilestones, setAnnouncedMilestones] = useState<Set<string>>(
    () => new Set()
  );
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [plannedOnly, setPlannedOnly] = useState(false);
  const [visitedOnly, setVisitedOnly] = useState(false);
  const [milestoneMessage, setMilestoneMessage] = useState("");

  useEffect(() => {
    setVisitedMuseums(migrateLegacyVisited(slugsByLegacyId));
    setPlannedMuseums(readPlanned());
    setAnnouncedMilestones(readAnnouncedMilestones());
  }, [slugsByLegacyId]);

  const visibleMuseums = useMemo(() => {
    const normalizedSearch = search.toLocaleLowerCase("en-US").trim();
    return museums.filter((museum) => {
      const matchesSearch = !normalizedSearch || museum.searchText.includes(normalizedSearch);
      const matchesCountry = !country || museum.country === country;
      const matchesCity = !city || museum.city === city;
      const matchesCategory = !category || museum.category === category;
      const matchesPlanned = !plannedOnly || plannedMuseums.has(museum.slug);
      const matchesVisited = !visitedOnly || visitedMuseums.has(museum.slug);
      return (
        matchesSearch &&
        matchesCountry &&
        matchesCity &&
        matchesCategory &&
        matchesPlanned &&
        matchesVisited
      );
    });
  }, [category, city, country, plannedMuseums, plannedOnly, search, visitedMuseums, visitedOnly]);

  const visitedCount = museums.filter((museum) => visitedMuseums.has(museum.slug)).length;
  const plannedCount = museums.filter((museum) => plannedMuseums.has(museum.slug)).length;
  const hasActiveFilters = Boolean(
    search || country || city || category || plannedOnly || visitedOnly
  );

  function resetFilters() {
    setSearch("");
    setCountry("");
    setCity("");
    setCategory("");
    setPlannedOnly(false);
    setVisitedOnly(false);
  }

  function togglePlanned(slug: string) {
    const next = new Set(plannedMuseums);
    if (next.has(slug)) {
      next.delete(slug);
    } else {
      next.add(slug);
    }
    setPlannedMuseums(next);
    writePlanned(next);
  }

  function toggleVisited(slug: string) {
    const next = new Set(visitedMuseums);
    const isVisited = !next.has(slug);
    if (isVisited) {
      next.add(slug);
    } else {
      next.delete(slug);
    }
    setVisitedMuseums(next);
    writeVisited(next);

    const nextVisitedCount = museums.filter((museum) => next.has(museum.slug)).length;
    const milestone = milestoneCopy[nextVisitedCount];
    if (isVisited && milestone && !announcedMilestones.has(String(nextVisitedCount))) {
      const nextAnnounced = new Set(announcedMilestones);
      nextAnnounced.add(String(nextVisitedCount));
      setAnnouncedMilestones(nextAnnounced);
      writeAnnouncedMilestones(nextAnnounced);
      setMilestoneMessage(milestone);
      window.setTimeout(() => setMilestoneMessage(""), 4200);
    }
  }

  return (
    <>
      <header className="hero" data-total-museums={museums.length}>
        <h1 data-testid="app-title">Europe&apos;s Top 50 Art Museums Atlas</h1>
        <p className="hero-copy">Track visits, compare cities, and plan routes through major European and global art collections.</p>
      </header>

      <section className="toolbar" aria-label="Museum filters">
        <div className="toolbar-row toolbar-row-search">
          <div className="search-field">
            <label className="visually-hidden" htmlFor="search-bar">Search museums</label>
            <input id="search-bar" className="filter-input" type="search" placeholder="Search museums" autoComplete="off" value={search} onChange={(event) => setSearch(event.target.value)} data-testid="search-input" />
          </div>
        </div>

        <div className="toolbar-row toolbar-row-filters">
          <label className="visually-hidden" htmlFor="country-filter">Country</label>
          <select id="country-filter" className="filter-input" value={country} onChange={(event) => setCountry(event.target.value)} data-testid="country-filter">
            <option value="">All countries</option>
            {uniqueCountries().map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <label className="visually-hidden" htmlFor="category-filter">Category</label>
          <select id="category-filter" className="filter-input" value={category} onChange={(event) => setCategory(event.target.value)} data-testid="category-filter">
            <option value="">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <label className="visually-hidden" htmlFor="city-filter">City</label>
          <select id="city-filter" className="filter-input filter-input-city" value={city} onChange={(event) => setCity(event.target.value)} data-testid="city-filter">
            <option value="">All cities</option>
            {uniqueCities().map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>

        <div className="toolbar-row toolbar-row-toggles">
          <label className="toggle-filter">
            <input type="checkbox" checked={plannedOnly} onChange={(event) => setPlannedOnly(event.target.checked)} data-testid="planned-filter" />
            <span>Planned only</span>
          </label>
          <label className="toggle-filter">
            <input type="checkbox" checked={visitedOnly} onChange={(event) => setVisitedOnly(event.target.checked)} data-testid="visited-filter" />
            <span>Visited only</span>
          </label>
          {hasActiveFilters ? (
            <button type="button" className="reset-button" data-testid="reset-filters" onClick={resetFilters}>Reset filters</button>
          ) : null}
        </div>
      </section>

      <section className="progress-panel" aria-label="Visit progress" data-testid="progress-panel">
        <div className="progress-meta">
          <span>Your route</span>
          <span data-testid="progress-text" aria-live="polite">{visitedCount} of {museums.length} museums visited · {plannedCount} planned</span>
        </div>
        <div id="progress-bar-container" aria-hidden="true">
          <div id="progress-bar" data-testid="progress-bar" style={{ width: `${(visitedCount / museums.length) * 100}%` }} />
        </div>
        <div className="milestone-message" data-testid="milestone-message" role="status" aria-live="polite" hidden={!milestoneMessage}>{milestoneMessage}</div>
      </section>

      <div className="no-results" data-testid="no-results" hidden={visibleMuseums.length > 0}>
        <p data-testid="no-results-copy">Nothing matched yet — great galleries are still waiting. Try another country, or browse the full list and pick your next visit.</p>
      </div>

      <ul className="museum-list" aria-label="Art museum list">
        {visibleMuseums.map((museum) => (
          <MuseumCard
            key={museum.slug}
            museum={museum}
            legacyId={museums.findIndex((item) => item.slug === museum.slug)}
            planned={plannedMuseums.has(museum.slug)}
            visited={visitedMuseums.has(museum.slug)}
            onTogglePlanned={togglePlanned}
            onToggleVisited={toggleVisited}
          />
        ))}
      </ul>
    </>
  );
}
