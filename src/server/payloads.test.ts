// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  isUuid,
  maxRouteNameLength,
  maxSlugListItems,
  parseMuseumSlugList,
  parseRouteName
} from "./payloads";

describe("parseMuseumSlugList", () => {
  it("keeps known slugs in order and drops unknown, non-string and duplicate items", () => {
    expect(
      parseMuseumSlugList(["louvre-museum", "pushkin-museum", 42, { slug: "x" }, "  ", "louvre-museum", "british-museum"])
    ).toEqual(["louvre-museum", "british-museum"]);
  });

  it("trims whitespace around known slugs", () => {
    expect(parseMuseumSlugList([" louvre-museum "])).toEqual(["louvre-museum"]);
  });

  it("returns null for anything that is not an array", () => {
    expect(parseMuseumSlugList(undefined)).toBeNull();
    expect(parseMuseumSlugList("louvre-museum")).toBeNull();
    expect(parseMuseumSlugList({ 0: "louvre-museum" })).toBeNull();
  });

  it("returns null when the raw list is longer than the limit", () => {
    expect(maxSlugListItems).toBe(200);
    expect(parseMuseumSlugList(Array.from({ length: 200 }, () => "louvre-museum"))).toEqual(["louvre-museum"]);
    expect(parseMuseumSlugList(Array.from({ length: 201 }, () => "louvre-museum"))).toBeNull();
  });
});

describe("parseRouteName", () => {
  it("returns the trimmed name", () => {
    expect(parseRouteName("  Spring Europe trip  ")).toBe("Spring Europe trip");
  });

  it("returns null for empty, non-string and overlong names", () => {
    expect(maxRouteNameLength).toBe(80);
    expect(parseRouteName("   ")).toBeNull();
    expect(parseRouteName(123)).toBeNull();
    expect(parseRouteName("a".repeat(80))).toBe("a".repeat(80));
    expect(parseRouteName("a".repeat(81))).toBeNull();
  });
});

describe("isUuid", () => {
  it("accepts canonical UUIDs and rejects everything else", () => {
    expect(isUuid("3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b")).toBe(true);
    expect(isUuid("3F2B8C1E-9A4D-4E6F-8B7A-1C2D3E4F5A6B")).toBe(true);
    expect(isUuid("not-a-uuid")).toBe(false);
    expect(isUuid("3f2b8c1e9a4d4e6f8b7a1c2d3e4f5a6b")).toBe(false);
    expect(isUuid("3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b'; drop table users;--")).toBe(false);
  });
});
