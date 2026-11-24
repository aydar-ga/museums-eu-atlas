import type { Metadata } from "next";

import { FeedbackForm } from "@/components/FeedbackForm";
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
      <div className="auth-copy">
        <h1>Say hello</h1>
        <p className="hero-copy">
          ArtMuse is a one-person side project. Tell me what you'd change, what broke, or simply that you'd like more
          of it — that is what decides whether it grows. Your email is optional and used only to reply. Messages
          are deleted after a year.
        </p>
      </div>
      <FeedbackForm />
    </section>
  );
}
