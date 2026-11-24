import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { flushProductEvents, queuedProductEvents, resetProductEvents, trackEvent } from "./product-events";

beforeEach(() => {
  resetProductEvents();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  Object.defineProperty(navigator, "globalPrivacyControl", { value: undefined, configurable: true });
});

describe("product events", () => {
  it("counts each filter once per page session", () => {
    trackEvent({ name: "filter_used", subject: "search" });
    trackEvent({ name: "filter_used", subject: "search" });
    trackEvent({ name: "filter_used", subject: "city" });
    expect(queuedProductEvents()).toEqual([
      { name: "filter_used", subject: "search" },
      { name: "filter_used", subject: "city" }
    ]);
  });

  it("records nothing for visitors who send Global Privacy Control", () => {
    Object.defineProperty(navigator, "globalPrivacyControl", { value: true, configurable: true });
    trackEvent({ name: "route_saved", subject: "" });
    expect(queuedProductEvents()).toHaveLength(0);
  });

  it("sends the whole queue in one beacon and empties it", () => {
    const sendBeacon = vi.fn(() => true);
    Object.defineProperty(navigator, "sendBeacon", { value: sendBeacon, configurable: true });
    trackEvent({ name: "route_saved", subject: "" });
    trackEvent({ name: "signin_started", subject: "" });

    flushProductEvents();

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect((sendBeacon.mock.calls[0] as unknown as [string])[0]).toBe("/api/events");
    expect(queuedProductEvents()).toHaveLength(0);
    flushProductEvents();
    expect(sendBeacon).toHaveBeenCalledTimes(1);
  });

  it("flushes when the page is hidden", () => {
    const sendBeacon = vi.fn(() => true);
    Object.defineProperty(navigator, "sendBeacon", { value: sendBeacon, configurable: true });
    trackEvent({ name: "route_saved", subject: "" });
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(sendBeacon).toHaveBeenCalledTimes(1);
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
  });
});
