import type { FeedbackKind } from "./feedback";

/** Anonymous product events: what visitors do on a page, counted per day on the server. No cookie, user or IP. */
export const filterNames = ["search", "country", "city", "category", "planned_only", "visited_only"] as const;
export type FilterName = (typeof filterNames)[number];

export type ProductEvent =
  | { name: "museum_planned" | "museum_visited" | "official_site_opened"; subject: string }
  | { name: "filter_used"; subject: FilterName }
  | { name: "feedback_sent"; subject: FeedbackKind }
  | { name: "signin_started" | "route_saved"; subject: "" };

export const maxQueuedEvents = 30;
const endpoint = "/api/events";

const queue: ProductEvent[] = [];
const onceKeys = new Set<string>();
let listening = false;

/** Visitors who send Global Privacy Control or Do Not Track are not counted, and neither are e2e test builds. */
function trackingAllowed(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined" || process.env.NEXT_PUBLIC_E2E_TEST_MODE === "1") {
    return false;
  }
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.globalPrivacyControl !== true && nav.doNotTrack !== "1";
}

/** Sends everything queued in one request. Called when the page is hidden or unloaded. */
export function flushProductEvents(): void {
  if (queue.length === 0) {
    return;
  }
  const body = JSON.stringify({ events: queue.splice(0, queue.length) });
  try {
    const sent = typeof navigator.sendBeacon === "function" && navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }));
    if (!sent) {
      void fetch(endpoint, { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => undefined);
    }
  } catch {
    // Analytics never breaks the page.
  }
}

function listen(): void {
  if (listening) {
    return;
  }
  listening = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushProductEvents();
    }
  });
  window.addEventListener("pagehide", flushProductEvents);
}

/**
 * Queues one event. Filter use counts once per filter per page session, so typing a search counts once.
 * Nothing is sent until the page is hidden: one request per visit at most.
 */
export function trackEvent(event: ProductEvent): void {
  if (!trackingAllowed() || queue.length >= maxQueuedEvents) {
    return;
  }
  if (event.name === "filter_used") {
    const key = `${event.name}:${event.subject}`;
    if (onceKeys.has(key)) {
      return;
    }
    onceKeys.add(key);
  }
  queue.push(event);
  listen();
}

/** Test helper: the events waiting to be sent. */
export function queuedProductEvents(): readonly ProductEvent[] {
  return queue;
}

/** Test helper. */
export function resetProductEvents(): void {
  queue.splice(0, queue.length);
  onceKeys.clear();
}
