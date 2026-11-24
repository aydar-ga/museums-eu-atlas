// @vitest-environment node
import { describe, expect, it } from "vitest";

import { readJsonBody, readJsonObject } from "./api-guard";
import { progressPayload, requestLinkPayload, routePayload, verifyLinkPayload } from "./payloads";

const post = (body: string, headers: Record<string, string> = {}) =>
  new Request("https://artmuse.app/api", { method: "POST", body, headers });

describe("readJsonBody", () => {
  it.each([
    ["request-link", requestLinkPayload, { email: 42 }],
    ["verify-link", verifyLinkPayload, { token: ["x"] }],
    ["progress", progressPayload, { planned: "louvre-museum", visited: [] }],
    ["routes", routePayload, { name: "", museumSlugs: ["louvre-museum"] }]
  ] as const)("rejects a malformed %s body with 400 and the route's message", async (_name, schema, body) => {
    const result = await readJsonBody<unknown>(post(JSON.stringify(body)), schema, "nope");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
      expect(await result.response.json()).toEqual({ error: "nope" });
    }
  });

  it("returns the parsed value and drops unknown keys", async () => {
    const result = await readJsonBody(post(JSON.stringify({ token: "abc", extra: 1 })), verifyLinkPayload, "nope");
    expect(result).toEqual({ ok: true, value: { token: "abc" } });
  });
});

describe("readJsonObject", () => {
  it("parses a JSON object body", async () => {
    expect(await readJsonObject(post(JSON.stringify({ a: 1 })))).toEqual({ ok: true, value: { a: 1 } });
  });

  it.each(["{nope", "[1,2]", "null", ""])("answers 400 for %j", async (body) => {
    const result = await readJsonObject(post(body));
    expect(result.ok ? 200 : result.response.status).toBe(400);
  });

  it("answers 413 for a declared or actual body over the limit", async () => {
    const declared = await readJsonObject(post("{}", { "content-length": "999999" }), 100);
    const actual = await readJsonObject(post(JSON.stringify({ a: "x".repeat(200) })), 100);
    expect(declared.ok ? 200 : declared.response.status).toBe(413);
    expect(actual.ok ? 200 : actual.response.status).toBe(413);
  });
});
