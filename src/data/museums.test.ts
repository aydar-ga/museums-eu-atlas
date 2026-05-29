import { describe, expect, it } from "vitest";

import { categories, getMuseum, museums, popularityTiers, uniqueCities, uniqueCountries } from "./museums";

describe("museum dataset", () => {
  it("keeps the 50 museum English/global dataset", () => {
    expect(museums).toHaveLength(50);
    expect(museums[0].name).toBe("Louvre Museum");
    expect(new Set(museums.map((museum) => museum.slug)).size).toBe(50);
  });

  it("keeps categories, tiers, locations, and search text normalized", () => {
    for (const museum of museums) {
      expect(categories).toContain(museum.category);
      expect(popularityTiers).toContain(museum.popularityTier);
      expect(museum.location).toBe(`${museum.city}, ${museum.country}`);
      expect(museum.searchText).toContain(museum.name.toLocaleLowerCase("en-US"));
      expect(museum.officialUrl).toMatch(/^https:\/\//);
      expect(museum.image).toMatch(/\.(jpg|svg)$/);
    }
  });

  it("keeps cleaned known data defects fixed", () => {
    expect(getMuseum("galleria-dell-accademia")?.name).toBe("Galleria dell'Accademia");
    expect(getMuseum("mauritshuis")?.city).toBe("The Hague");
    expect(getMuseum("thyssen-bornemisza-museum")?.name).toBe("Museo Nacional Thyssen-Bornemisza");
    expect(getMuseum("nationalmuseum-stockholm")?.name).toBe("Nationalmuseum");
  });

  it("derives filter options", () => {
    expect(uniqueCountries()).toContain("France");
    expect(uniqueCities()).toContain("Paris");
  });
});
