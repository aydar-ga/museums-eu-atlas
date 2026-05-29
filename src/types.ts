export type Theme = "light" | "dark";

export type Museum = {
  slug: string;
  name: string;
  city: string;
  country: string;
  category: string;
  themes: string[];
  popularityTier: string;
  familyFriendly: boolean;
  hasOnlineCollection: boolean;
  summary: string;
  whyVisit: string;
  highlights: string[];
  officialUrl: string;
  onlineUrl: string | null;
  image: string;
  imageAlt: string;
  imageCredit: string;
  sourceUrls: string[];
  location: string;
  searchText: string;
};

export type User = {
  email: string;
};

export type MagicLinkResponse = {
  email: string;
  magicLink: string;
  delivery: "email" | "dev";
};
