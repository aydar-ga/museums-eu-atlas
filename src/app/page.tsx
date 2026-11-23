import type { Metadata } from "next";

import { HomePage } from "@/components/HomePage";
import { baseOpenGraph, siteDescription, siteTitle } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { ...baseOpenGraph, url: "/", title: siteTitle, description: siteDescription }
};

export default function Page() {
  return <HomePage />;
}
