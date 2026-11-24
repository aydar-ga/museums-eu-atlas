#!/usr/bin/env bash
# uptime-check.sh — probe the live site and exit 1 when any check fails.
#
#   scripts/uptime-check.sh [--deep] [base-url]      (default base-url: https://artmuse.app)
#
# Checks the public pages; --deep also checks /api/healthz, the TLS certificate and the domain
# registration. A failed check is retried once. Prints a Markdown table; needs curl, jq, openssl.
set -uo pipefail

DEEP=0
BASE="https://artmuse.app"
for arg in "$@"; do
  case "$arg" in
    --deep) DEEP=1 ;;
    -h|--help) sed -n '2,7p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) BASE="${arg%/}" ;;
  esac
done
HOST="$(printf '%s' "$BASE" | sed -E 's#^https?://##; s#/.*$##')"
FAILED=0
ROWS=""
row() {
  ROWS="${ROWS}| $1 | $2 | $3 |"$'\n'
  [ "$2" = "ok" ] || FAILED=1
}

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

# probe <path> → "<http-code> <seconds>"; the body lands in $TMP.
probe() {
  local out
  out="$(curl -sS -L --max-time 15 -o "$TMP" -w '%{http_code} %{time_total}' "$BASE$1" 2>/dev/null)" || out="000 0"
  printf '%s' "$out"
}

check_page() {  # check_page <label> <path> [text the body must contain]
  local label="$1" path="$2" needle="${3:-}" attempt res code="000" secs="0"
  for attempt in 1 2; do
    res="$(probe "$path")"
    code="${res%% *}"
    secs="${res##* }"
    if [ "$code" = 200 ] && awk -v s="$secs" 'BEGIN { exit !(s < 10) }' && { [ -z "$needle" ] || grep -qF "$needle" "$TMP"; }; then
      row "$label" ok "200 in ${secs}s"
      return
    fi
    [ "$attempt" = 1 ] && sleep "${UPTIME_RETRY_SECONDS:-20}"
  done
  local why="HTTP $code in ${secs}s"
  if [ "$code" = 200 ] && [ -n "$needle" ] && ! grep -qF "$needle" "$TMP"; then why="200 but the page lacks \`$needle\`"; fi
  row "$label" FAIL "$why"
}

to_epoch() {  # GNU date first (CI), BSD date second (macOS)
  date -u -d "$1" +%s 2>/dev/null || date -u -j -f "$2" "$1" +%s 2>/dev/null || echo 0
}

check_page "Home page" "/" "<title>ArtMuse"
check_page "Museum page" "/museums/louvre-museum" "Louvre"
check_page "robots.txt" "/robots.txt"
check_page "sitemap.xml" "/sitemap.xml" "<urlset"

if [ "$DEEP" = 1 ]; then
  check_page "Health and database" "/api/healthz" '"database":"connected"'

  TO=""
  command -v timeout >/dev/null 2>&1 && TO="timeout 15"
  END="$($TO openssl s_client -servername "$HOST" -connect "$HOST:443" </dev/null 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)"
  END_S="$(to_epoch "${END:-x}" '%b %e %T %Y %Z')"
  DAYS=$(( (END_S - $(date -u +%s)) / 86400 ))
  if [ "$END_S" -gt 0 ] && [ "$DAYS" -ge 14 ]; then
    row "TLS certificate" ok "$DAYS days left"
  else
    row "TLS certificate" FAIL "${END:-unreadable}, $DAYS days left"
  fi

  TLD="${HOST##*.}"
  RDAP="$(curl -s --max-time 10 https://data.iana.org/rdap/dns.json | jq -r --arg t "$TLD" '.services[] | select(.[0] | index($t)) | .[1][0]' 2>/dev/null | head -n1)"
  EXP=""
  [ -n "$RDAP" ] && EXP="$(curl -s --max-time 10 "${RDAP%/}/domain/$HOST" | jq -r '.events[]? | select(.eventAction=="expiration") | .eventDate' 2>/dev/null | head -n1)"
  EXP_S="$(to_epoch "${EXP%%.*}" '%Y-%m-%dT%H:%M:%S')"
  [ -n "$EXP" ] || EXP_S=0
  DDAYS=$(( (EXP_S - $(date -u +%s)) / 86400 ))
  if [ "$EXP_S" -le 0 ]; then
    row "Domain registration" ok "expiry not readable from RDAP; skipped"
  elif [ "$DDAYS" -ge 30 ]; then
    row "Domain registration" ok "expires ${EXP%%T*}, $DDAYS days left"
  else
    row "Domain registration" FAIL "expires ${EXP%%T*}, $DDAYS days left"
  fi
fi

printf '| Check | Result | Detail |\n|---|---|---|\n%s' "$ROWS"
printf '\nChecked %s (%s) at %s UTC.\n' "$BASE" "$([ "$DEEP" = 1 ] && echo deep || echo pages)" "$(date -u '+%Y-%m-%d %H:%M')"
exit "$FAILED"
