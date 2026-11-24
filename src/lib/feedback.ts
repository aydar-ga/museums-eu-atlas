/** What a visitor can send from /feedback. Shared by the form, the API payload and the owner email. */
export const feedbackKinds = ["interest", "feedback", "bug"] as const;
export type FeedbackKind = (typeof feedbackKinds)[number];

export const feedbackKindLabels: Record<FeedbackKind, string> = {
  interest: "I'd like more of ArtMuse",
  feedback: "Feedback or an idea",
  bug: "Something is broken"
};

/** A message is optional for "interest" (a one-click vote) and needs this many characters otherwise. */
export const minFeedbackMessageLength = 5;
