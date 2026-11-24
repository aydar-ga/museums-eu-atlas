#!/usr/bin/env bash
# uptime-issue.sh — keep one GitHub issue in step with the uptime checks, notifying only when something breaks.
#
#   scripts/uptime-issue.sh failed|ok <report.md>
#
# Env: GH_REPO and GH_TOKEN (for gh), OWNER (the login mentioned in the issue body), DEEP=true on deep runs.
#
#   failed, no open issue           open one, mentioning OWNER        → the only notification of an outage
#   failed, issue open              rewrite its body with the report  → silent
#   failed, issue marked recovered  comment once, unmark it           → one notification: it broke again
#   ok, issue open                  label `recovered`, retitle        → silent; an agent confirms the cause and closes it
#   ok, deep-only issue, pages run  nothing: a pages-only pass does not prove a database, TLS or domain fix
set -euo pipefail

STATUS="${1:?usage: uptime-issue.sh failed|ok <report.md>}"
REPORT="${2:?usage: uptime-issue.sh failed|ok <report.md>}"
TITLE="artmuse.app is failing its uptime checks"
BODY="$(mktemp)"
trap 'rm -f "$BODY"' EXIT

# Runs every 15 minutes, so one transient GitHub API error gets a retry rather than a failed run (and its email).
list_open() { gh issue list --label uptime --state open --json number,labels --jq '.[0] // empty'; }
open="$(list_open || { sleep "${UPTIME_GH_RETRY_SECONDS:-15}"; list_open; })"
number=""
labels=""
if [ -n "$open" ]; then
  number="$(jq -r '.number' <<<"$open")"
  labels="$(jq -r '[.labels[].name] | join(",")' <<<"$open")"
fi
has_label() { case ",$labels," in *",$1,"*) return 0 ;; esac; return 1; }

create_labels() {
  gh label create uptime --color B60205 --description "Opened by the Uptime workflow" --force >/dev/null
  gh label create uptime-deep --color D93F0B --description "Failed a database, TLS or domain check" --force >/dev/null
  gh label create recovered --color 0E8A16 --description "Checks pass again; waiting for an agent to confirm the cause" --force >/dev/null
}

failing_body() {
  {
    [ -n "${OWNER:-}" ] && printf '@%s ' "$OWNER"
    printf 'artmuse.app is failing its uptime checks (latest run below).\n\n'
    printf 'An agent session picks this up from the open `uptime` issue and closes it once the cause is confirmed.\n\n'
    cat "$REPORT"
  } > "$BODY"
}

if [ "$STATUS" = failed ]; then
  # A page failure is seen by every run; a failure seen only by a deep run needs a deep run to clear.
  new_labels="uptime"
  if [ "${DEEP:-false}" = true ] && ! grep -Eq '^[|] (Home page|Museum page|robots.txt|sitemap.xml) [|] FAIL' "$REPORT"; then
    new_labels="uptime,uptime-deep"
  fi
  create_labels
  failing_body
  if [ -z "$number" ]; then
    gh issue create --title "$TITLE" --label "$new_labels" --body-file "$BODY"
  elif has_label recovered; then
    gh issue comment "$number" --body "Failing again. The latest report is in the issue description."
    gh issue edit "$number" --remove-label recovered --add-label "$new_labels" --title "$TITLE" --body-file "$BODY"
  else
    gh issue edit "$number" --add-label "$new_labels" --body-file "$BODY"
  fi
  exit 0
fi

[ -n "$number" ] || exit 0
has_label recovered && exit 0
if has_label uptime-deep && [ "${DEEP:-false}" != true ]; then exit 0; fi
gh label create recovered --color 0E8A16 --description "Checks pass again; waiting for an agent to confirm the cause" --force >/dev/null
previous="$(gh issue view "$number" --json body --jq .body)"
{
  printf '**Recovered** at %s UTC: every check passes again.\n\n' "$(date -u '+%Y-%m-%d %H:%M')"
  printf '%s\n' "$previous"
} > "$BODY"
gh issue edit "$number" --add-label recovered --title "Recovered: $TITLE" --body-file "$BODY"
