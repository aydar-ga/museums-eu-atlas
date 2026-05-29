export const fallbackImage = "/images/fallback_museum.svg";

export function museumImageUrl(filename: string): string {
  return `/images/${filename || "fallback_museum.svg"}`;
}
