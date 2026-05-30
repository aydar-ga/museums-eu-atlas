import { describe, expect, it } from "vitest";

import { mergeProgress } from "./progress-sync";

describe("mergeProgress", () => {
  it("merges local and remote planned and visited museum slugs", () => {
    const merged = mergeProgress(
      { planned: ["louvre-museum"], visited: ["rijksmuseum"] },
      { planned: ["tate-modern"], visited: ["louvre-museum"] }
    );

    expect(merged.planned).toEqual(expect.arrayContaining(["louvre-museum", "tate-modern"]));
    expect(merged.visited).toEqual(expect.arrayContaining(["louvre-museum", "rijksmuseum"]));
  });
});
