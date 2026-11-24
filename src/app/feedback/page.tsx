import type { Metadata } from "next";
import Link from "next/link";

import { FeedbackForm, FeedbackIntro } from "@/components/FeedbackForm";
import { baseOpenGraph } from "@/lib/site";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Tell the maker of ArtMuse what you think, or that you'd like more of it.",
  alternates: { canonical: "/feedback" },
  openGraph: { ...baseOpenGraph, title: "Feedback · ArtMuse", url: "/feedback" }
};

export default function FeedbackPage() {
  return (
    <section className="auth-shell feedback-shell" data-testid="feedback-page">
      <Link href="/" className="feedback-back">
        Back to the atlas
      </Link>
      <FeedbackIntro />
      <FeedbackForm />
    </section>
  );
}
