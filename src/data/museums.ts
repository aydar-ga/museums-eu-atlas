import {
  categories,
  museums as rawMuseums,
  popularityTiers
} from "./museums.generated";
import type { Museum } from "../types";

export { categories, popularityTiers };

export const museums: Museum[] = rawMuseums.map((museum) => ({
  ...museum,
  themes: [...museum.themes],
  highlights: [...museum.highlights],
  sourceUrls: [...museum.sourceUrls],
  location: `${museum.city}, ${museum.country}`,
  searchText: [
    museum.name,
    museum.city,
    museum.country,
    museum.category,
    museum.popularityTier,
    museum.themes.join(" "),
    museum.highlights.join(" ")
  ]
    .join(" ")
    .toLocaleLowerCase("en-US")
}));

export function getMuseum(slug: string): Museum | undefined {
  return museums.find((museum) => museum.slug === slug);
}

export function relatedMuseums(current: Museum): Museum[] {
  const sameCity = museums.filter(
    (museum) => museum.slug !== current.slug && museum.city === current.city
  );
  const sameCategory = museums.filter(
    (museum) =>
      museum.slug !== current.slug &&
      museum.category === current.category &&
      !sameCity.includes(museum)
  );
  return [...sameCity, ...sameCategory].slice(0, 3);
}

export function uniqueCountries(): string[] {
  return Array.from(new Set(museums.map((museum) => museum.country))).sort();
}

export function uniqueCities(): string[] {
  return Array.from(new Set(museums.map((museum) => museum.city))).sort();
}
