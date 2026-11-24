// @vitest-environment node
import { describe, expect, it } from "vitest";

import { readJsonObject } from "./api-guard";

const post = (body: string, headers: Record<string, string> = {}) =>
  new Request("https://artmuse.app/api", { method: "POST", body, headers });

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
