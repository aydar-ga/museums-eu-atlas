import { z } from "zod";

import { museums } from "@/data/museums";
import { feedbackKinds, minFeedbackMessageLength } from "@/lib/feedback";
import { filterNames } from "@/lib/product-events";
import { maxEmailLength, maxFeedbackMessageLength, productEventLimits } from "./abuse-limits";

/** Raw list items accepted per request: 4x the dataset, leaving room for stale local slugs. */
export const maxSlugListItems = 200;
export const maxRouteNameLength = 80;

const knownSlugs: ReadonlySet<string> = new Set(museums.map((museum) => museum.slug));

/**
 * The known museum slugs in a list, de-duplicated in first-seen order. Unknown and non-string items are
 * dropped rather than rejected, so browsers that still hold slugs of removed museums keep syncing.
 */
const museumSlugList = z
  .array(z.unknown())
  .max(maxSlugListItems)
  .transform((items) => {
    const slugs = new Set<string>();
    for (const item of items) {
      const slug = typeof item === "string" ? item.trim() : "";
      if (knownSlugs.has(slug)) {
        slugs.add(slug);
      }
    }
    return Array.from(slugs);
  });

/** Zod schemas for every API body and parameter. Unknown keys are dropped. */
export const progressPayload = z.object({ planned: museumSlugList, visited: museumSlugList });
export const routePayload = z.object({
  name: z.string().trim().min(1).max(maxRouteNameLength),
  museumSlugs: museumSlugList.refine((slugs) => slugs.length > 0)
});
export const routeIdParam = z.uuid();
export const requestLinkPayload = z.object({ email: z.string().max(1024), website: z.unknown().optional() });
export const verifyLinkPayload = z.object({ token: z.string().max(4096) });
export const devSessionPayload = z.object({ email: z.string().max(1024) });

/** The known slugs in `value`, or null when it is not an array or exceeds `maxSlugListItems`. */
export function parseMuseumSlugList(value: unknown): string[] | null {
  const parsed = museumSlugList.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/** The trimmed route name, or null when it is empty, not a string, or too long. */
export function parseRouteName(value: unknown): string | null {
  const parsed = routePayload.shape.name.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function isUuid(value: string): boolean {
  return routeIdParam.safeParse(value).success;
}

/** POST /api/feedback. `website` is the honeypot. An empty email means "no reply wanted". */
export const feedbackPayload = z
  .object({
    kind: z.enum(feedbackKinds),
    message: z.string().trim().max(maxFeedbackMessageLength).default(""),
    email: z
      .union([z.literal(""), z.email().max(maxEmailLength)])
      .optional()
      .transform((value) => (value ? value.toLocaleLowerCase("en-US") : undefined)),
    website: z.string().max(200).optional()
  })
  .refine((body) => body.kind === "interest" || body.message.length >= minFeedbackMessageLength);

const museumSlug = z.string().refine((slug) => knownSlugs.has(slug));
const noSubject = z.literal("").optional().transform(() => "" as const);

/** POST /api/events: one beacon of anonymous product events. One unknown event refuses the whole beacon. */
export const productEventsPayload = z.object({
  events: z
    .array(
      z.discriminatedUnion("name", [
        z.object({ name: z.enum(["museum_planned", "museum_visited", "official_site_opened"]), subject: museumSlug }),
        z.object({ name: z.literal("filter_used"), subject: z.enum(filterNames) }),
        z.object({ name: z.literal("feedback_sent"), subject: z.enum(feedbackKinds) }),
        z.object({ name: z.enum(["signin_started", "route_saved"]), subject: noSubject })
      ])
    )
    .max(productEventLimits.maxEventsPerBeacon)
});

