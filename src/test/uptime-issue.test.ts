// @vitest-environment node
import { execFileSync } from "node:child_process";
import { chmodSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");
const script = path.join(root, "scripts/uptime-issue.sh");

type OpenIssue = { number: number; labels: string[] } | null;
const pageFailure = "| Home page | FAIL | HTTP 500 in 0.2s |\n";
const deepFailure = "| Home page | ok | 200 in 0.2s |\n| Health and database | FAIL | HTTP 503 in 0.1s |\n";

/** Runs the script with a stub `gh` that records each call; returns the calls and the bodies it was given. */
function run(status: "failed" | "ok", options: { open?: OpenIssue; deep?: boolean; report?: string; listFailsOnce?: boolean } = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), "uptime-issue-"));
  const open = options.open ? JSON.stringify({ number: options.open.number, labels: options.open.labels.map((name) => ({ name })) }) : "";
  writeFileSync(path.join(dir, "list.out"), open);
  writeFileSync(
    path.join(dir, "gh"),
    [
      "#!/usr/bin/env bash",
      `printf '%s\\n' "$*" >> "${dir}/calls.log"`,
      options.listFailsOnce
        ? `if [ "$1 $2" = "issue list" ] && [ ! -f "${dir}/listed" ]; then touch "${dir}/listed"; echo "HTTP 502" >&2; exit 1; fi`
        : "",
      'prev=""; for a in "$@"; do [ "$prev" = --body-file ] && { cat "$a"; echo; echo "---"; } >> "' + dir + '/bodies.log"; prev="$a"; done',
      `case "$1 $2" in "issue list") cat "${dir}/list.out" ;; "issue view") printf 'previous failing report' ;; esac`
    ].join("\n")
  );
  chmodSync(path.join(dir, "gh"), 0o755);
  const report = path.join(dir, "report.md");
  writeFileSync(report, options.report ?? pageFailure);
  execFileSync("bash", [script, status, report], {
    env: {
      ...process.env,
      PATH: `${dir}:${process.env.PATH}`,
      DEEP: options.deep ? "true" : "false",
      OWNER: "owner-login",
      UPTIME_GH_RETRY_SECONDS: "0"
    }
  });
  const read = (file: string) => (existsSync(path.join(dir, file)) ? readFileSync(path.join(dir, file), "utf8") : "");
  const calls = read("calls.log").trim().split("\n").filter(Boolean);
  return { calls, bodies: read("bodies.log"), notifying: calls.filter((call) => /^issue (create|comment|close|reopen)/.test(call)) };
}

describe("scripts/uptime-issue.sh", () => {
  it("opens one issue that mentions the owner when an outage starts", () => {
    const { notifying, calls, bodies } = run("failed");
    expect(notifying).toHaveLength(1);
    expect(notifying[0]).toMatch(/^issue create .*--label uptime( |$)/);
    expect(calls.some((call) => call.startsWith("label create recovered"))).toBe(true);
    expect(bodies).toContain("@owner-login");
    expect(bodies).toContain("HTTP 500");
  });

  it("labels an outage seen only by the deep checks", () => {
    const { notifying } = run("failed", { deep: true, report: deepFailure });
    expect(notifying[0]).toContain("--label uptime,uptime-deep");
  });

  it("only rewrites the issue body while the outage lasts", () => {
    const { notifying, calls, bodies } = run("failed", { open: { number: 7, labels: ["uptime"] } });
    expect(notifying).toEqual([]);
    expect(calls).toContainEqual(expect.stringMatching(/^issue edit 7 .*--body-file/));
    expect(bodies).toContain("@owner-login");
  });

  it("marks recovery by label and title, without commenting or closing", () => {
    const { notifying, calls, bodies } = run("ok", { open: { number: 7, labels: ["uptime"] } });
    expect(notifying).toEqual([]);
    expect(calls).toContainEqual(expect.stringMatching(/^issue edit 7 .*--add-label recovered .*--title Recovered: /));
    expect(bodies).toContain("previous failing report");
  });

  it("comments once when the site fails again after a recovery", () => {
    const { notifying, calls } = run("failed", { open: { number: 7, labels: ["uptime", "recovered"] } });
    expect(notifying).toHaveLength(1);
    expect(notifying[0]).toMatch(/^issue comment 7 /);
    expect(calls).toContainEqual(expect.stringMatching(/^issue edit 7 .*--remove-label recovered/));
  });

  it("does nothing when all is well and no issue is open", () => {
    const { calls } = run("ok");
    expect(calls.filter((call) => !call.startsWith("issue list"))).toEqual([]);
  });

  it("does not call a deep-only outage over after a pages-only pass", () => {
    const { calls } = run("ok", { open: { number: 7, labels: ["uptime", "uptime-deep"] }, deep: false });
    expect(calls.filter((call) => !call.startsWith("issue list"))).toEqual([]);
  });

  it("leaves an already recovered issue alone while all is well", () => {
    const { calls } = run("ok", { open: { number: 7, labels: ["uptime", "recovered"] } });
    expect(calls.filter((call) => !call.startsWith("issue list"))).toEqual([]);
  });

  it("retries a failed GitHub call once instead of failing the run", () => {
    const { calls, notifying } = run("failed", { listFailsOnce: true });
    expect(calls.filter((call) => call.startsWith("issue list"))).toHaveLength(2);
    expect(notifying).toHaveLength(1);
  });

  it("never fails the workflow run because the site is down", () => {
    const workflow = readFileSync(path.join(root, ".github/workflows/uptime.yml"), "utf8");
    expect(workflow).not.toMatch(/exit 1|Fail the run/);
    expect(workflow).toContain("scripts/uptime-issue.sh");
  });
});
