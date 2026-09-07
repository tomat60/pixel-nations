#!/usr/bin/env bash
set -euo pipefail

: "${AURELIAN_WINDOW_ID:?AURELIAN_WINDOW_ID is required}"
: "${AURELIAN_LOG:?AURELIAN_LOG is required}"
: "${AURELIAN_APP_PID:?AURELIAN_APP_PID is required}"
: "${AURELIAN_SEQUENCE:?AURELIAN_SEQUENCE is required}"

TRACE="${AURELIAN_TRACE:-aurelian-state-gated-input.log}"
TIMEOUT_TICKS="${AURELIAN_TIMEOUT_TICKS:-120}"
POLL_SECONDS="${AURELIAN_POLL_SECONDS:-0.25}"

touch "$AURELIAN_LOG" "$TRACE"

observe_count() {
  local token="$1"
  grep -F -c -- "$token" "$AURELIAN_LOG" 2>/dev/null || true
}

fail_closed() {
  local reason="$1" key="$2" token="$3" before="$4"
  local alive="false"
  kill -0 "$AURELIAN_APP_PID" 2>/dev/null && alive="true"
  printf '%s status=FAIL reason=%s key=%s expected=%q count_before=%s count_now=%s process_alive=%s\n' \
    "$(date -u +%FT%TZ)" "$reason" "$key" "$token" "$before" "$(observe_count "$token")" "$alive" | tee -a "$TRACE"
  tail -n 80 "$AURELIAN_LOG" >> "$TRACE"
  exit 1
}

while IFS='|' read -r key token; do
  [[ -z "${key// }" || "$key" == \#* ]] && continue
  before="$(observe_count "$token")"
  kill -0 "$AURELIAN_APP_PID" 2>/dev/null || fail_closed "process_not_alive_before_input" "$key" "$token" "$before"
  printf '%s status=SEND key=%s expected=%q count_before=%s\n' "$(date -u +%FT%TZ)" "$key" "$token" "$before" | tee -a "$TRACE"
  xdotool key --window "$AURELIAN_WINDOW_ID" "$key"
  observed="false"
  for _ in $(seq 1 "$TIMEOUT_TICKS"); do
    kill -0 "$AURELIAN_APP_PID" 2>/dev/null || fail_closed "process_exited_waiting_for_state" "$key" "$token" "$before"
    now="$(observe_count "$token")"
    if (( now > before )); then
      printf '%s status=OBSERVED key=%s expected=%q count_after=%s\n' "$(date -u +%FT%TZ)" "$key" "$token" "$now" | tee -a "$TRACE"
      observed="true"
      break
    fi
    sleep "$POLL_SECONDS"
  done
  [[ "$observed" == "true" ]] || fail_closed "state_timeout" "$key" "$token" "$before"
done < "$AURELIAN_SEQUENCE"

printf '%s status=PASS actions=%s\n' "$(date -u +%FT%TZ)" "$(grep -c ' status=SEND ' "$TRACE")" | tee -a "$TRACE"
