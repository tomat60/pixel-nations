#!/usr/bin/env bash
set -euo pipefail

: "${AURELIAN_WINDOW_ID:?AURELIAN_WINDOW_ID is required}"
: "${AURELIAN_LOG:?AURELIAN_LOG is required}"
: "${AURELIAN_APP_PID:?AURELIAN_APP_PID is required}"
: "${AURELIAN_SEQUENCE:?AURELIAN_SEQUENCE is required}"

TRACE="${AURELIAN_TRACE:-aurelian-ready-gated-input.log}"
TIMEOUT_TICKS="${AURELIAN_TIMEOUT_TICKS:-160}"
POLL_SECONDS="${AURELIAN_POLL_SECONDS:-0.125}"
STATE_PREFIX="PLAYABLE_AURELIAN_ENTRY_STATE="
READY_PREFIX="PLAYABLE_AURELIAN_INPUT_READY="

touch "$AURELIAN_LOG" "$TRACE"

observe_count() {
  local token="$1"
  grep -F -c -- "$token" "$AURELIAN_LOG" 2>/dev/null || true
}

observe_prefix_count() {
  local prefix="$1"
  grep -F -c -- "$prefix" "$AURELIAN_LOG" 2>/dev/null || true
}

latest_prefixed_line() {
  local prefix="$1"
  grep -F -- "$prefix" "$AURELIAN_LOG" 2>/dev/null | tail -n 1 || true
}

process_alive() {
  kill -0 "$AURELIAN_APP_PID" 2>/dev/null
}

fail_closed() {
  local reason="$1" key="${2:-none}" expected_state="${3:-none}" expected_event="${4:-none}"
  local alive="false"
  process_alive && alive="true"
  printf '%s status=FAIL reason=%s key=%s expected_state=%q expected_event=%q process_alive=%s\n' \
    "$(date -u +%FT%TZ)" "$reason" "$key" "$expected_state" "$expected_event" "$alive" | tee -a "$TRACE"
  tail -n 100 "$AURELIAN_LOG" >> "$TRACE"
  exit 1
}

wait_for_initial_ready() {
  local token="${READY_PREFIX}world_neutral"
  for _ in $(seq 1 "$TIMEOUT_TICKS"); do
    process_alive || fail_closed "process_exited_before_initial_ready"
    local total
    total="$(observe_prefix_count "$READY_PREFIX")"
    if (( total > 0 )); then
      local latest
      latest="$(latest_prefixed_line "$READY_PREFIX")"
      [[ "$latest" == *"$token"* ]] || fail_closed "wrong_initial_ready" "none" "world_neutral" "$token"
      (( total == 1 )) || fail_closed "duplicate_initial_ready" "none" "world_neutral" "$token"
      printf '%s status=INITIAL_READY state=world_neutral total_ready=%s\n' "$(date -u +%FT%TZ)" "$total" | tee -a "$TRACE"
      return
    fi
    sleep "$POLL_SECONDS"
  done
  fail_closed "initial_ready_timeout" "none" "world_neutral" "$token"
}

wait_for_initial_ready

while IFS='|' read -r key expected_state expected_event; do
  [[ -z "${key// }" || "$key" == \#* ]] && continue
  [[ -n "$expected_state" && -n "$expected_event" ]] || fail_closed "malformed_sequence_row" "$key" "$expected_state" "$expected_event"

  ready_token="${READY_PREFIX}${expected_state}"
  before_event="$(observe_count "$expected_event")"
  before_ready="$(observe_count "$ready_token")"
  before_ready_total="$(observe_prefix_count "$READY_PREFIX")"
  before_state_total="$(observe_prefix_count "$STATE_PREFIX")"

  process_alive || fail_closed "process_not_alive_before_input" "$key" "$expected_state" "$expected_event"
  printf '%s status=SEND key=%s expected_state=%q expected_event=%q event_before=%s ready_before=%s\n' \
    "$(date -u +%FT%TZ)" "$key" "$expected_state" "$expected_event" "$before_event" "$before_ready" | tee -a "$TRACE"
  xdotool key --window "$AURELIAN_WINDOW_ID" "$key"

  event_observed="false"
  ready_observed="false"
  for _ in $(seq 1 "$TIMEOUT_TICKS"); do
    process_alive || fail_closed "process_exited_waiting_for_event" "$key" "$expected_state" "$expected_event"

    state_total="$(observe_prefix_count "$STATE_PREFIX")"
    if (( state_total > before_state_total )); then
      latest_state="$(latest_prefixed_line "$STATE_PREFIX")"
      [[ "$latest_state" == *"${STATE_PREFIX}${expected_state}"* ]] || fail_closed "unexpected_state" "$key" "$expected_state" "$expected_event"
      (( state_total == before_state_total + 1 )) || fail_closed "duplicate_state_transition" "$key" "$expected_state" "$expected_event"
    fi

    event_now="$(observe_count "$expected_event")"
    if (( event_now > before_event )); then
      (( event_now == before_event + 1 )) || fail_closed "duplicate_expected_event" "$key" "$expected_state" "$expected_event"
      event_observed="true"
    fi

    ready_total="$(observe_prefix_count "$READY_PREFIX")"
    if (( ready_total > before_ready_total )); then
      latest_ready="$(latest_prefixed_line "$READY_PREFIX")"
      [[ "$latest_ready" == *"$ready_token"* ]] || fail_closed "wrong_ready_state" "$key" "$expected_state" "$expected_event"
      (( ready_total == before_ready_total + 1 )) || fail_closed "duplicate_readiness" "$key" "$expected_state" "$expected_event"
      ready_now="$(observe_count "$ready_token")"
      (( ready_now == before_ready + 1 )) || fail_closed "stale_or_missing_readiness" "$key" "$expected_state" "$expected_event"
      ready_observed="true"
    fi

    if [[ "$event_observed" == "true" && "$ready_observed" == "true" ]]; then
      printf '%s status=READY key=%s state=%q event_count=%s ready_count=%s\n' \
        "$(date -u +%FT%TZ)" "$key" "$expected_state" "$event_now" "$ready_now" | tee -a "$TRACE"
      break
    fi
    sleep "$POLL_SECONDS"
  done

  [[ "$event_observed" == "true" ]] || fail_closed "expected_event_timeout" "$key" "$expected_state" "$expected_event"
  [[ "$ready_observed" == "true" ]] || fail_closed "readiness_timeout" "$key" "$expected_state" "$expected_event"
done < "$AURELIAN_SEQUENCE"

printf '%s status=PASS actions=%s final_state=world_first_imperial_expansion_two_land_footprint\n' \
  "$(date -u +%FT%TZ)" "$(grep -c ' status=SEND ' "$TRACE")" | tee -a "$TRACE"
