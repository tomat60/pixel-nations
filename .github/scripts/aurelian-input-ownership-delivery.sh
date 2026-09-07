#!/usr/bin/env bash
set -euo pipefail

: "${AURELIAN_WINDOW_ID:?AURELIAN_WINDOW_ID is required}"
: "${AURELIAN_LOG:?AURELIAN_LOG is required}"
: "${AURELIAN_APP_PID:?AURELIAN_APP_PID is required}"
: "${AURELIAN_SEQUENCE:?AURELIAN_SEQUENCE is required}"

TRACE="${AURELIAN_TRACE:-aurelian-input-ownership-delivery.log}"
TIMEOUT_TICKS="${AURELIAN_TIMEOUT_TICKS:-160}"
POLL_SECONDS="${AURELIAN_POLL_SECONDS:-0.125}"
STATE_PREFIX="PLAYABLE_AURELIAN_ENTRY_STATE="
RECEIPT_PREFIX="PLAYABLE_AURELIAN_INPUT_RECEIPT="

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

focused_window() {
  xdotool getwindowfocus 2>/dev/null || true
}

fail_closed() {
  local reason="$1" key="${2:-none}" expected_state="${3:-none}" expected_event="${4:-none}"
  local alive="false" focus
  process_alive && alive="true"
  focus="$(focused_window)"
  printf '%s status=FAIL reason=%s key=%s expected_state=%q expected_event=%q process_alive=%s focused_window=%s expected_window=%s\n' \
    "$(date -u +%FT%TZ)" "$reason" "$key" "$expected_state" "$expected_event" "$alive" "$focus" "$AURELIAN_WINDOW_ID" | tee -a "$TRACE"
  tail -n 120 "$AURELIAN_LOG" >> "$TRACE"
  exit 1
}

claim_and_verify_focus() {
  local key="$1" expected_state="$2" expected_event="$3"
  xdotool windowfocus --sync "$AURELIAN_WINDOW_ID"
  local focus
  focus="$(focused_window)"
  [[ "$focus" == "$AURELIAN_WINDOW_ID" ]] || fail_closed "window_focus_not_owned" "$key" "$expected_state" "$expected_event"
}

action_for_key() {
  case "$1" in
    Return) printf '%s' "ui_accept" ;;
    Left) printf '%s' "ui_left" ;;
    Right) printf '%s' "ui_right" ;;
    Up) printf '%s' "ui_up" ;;
    Down) printf '%s' "ui_down" ;;
    *) return 1 ;;
  esac
}

wait_for_initial_state() {
  for _ in $(seq 1 "$TIMEOUT_TICKS"); do
    process_alive || fail_closed "process_exited_before_initial_state"
    if [[ "$(latest_prefixed_line "$STATE_PREFIX")" == *"${STATE_PREFIX}world_neutral"* ]]; then
      printf '%s status=INITIAL_STATE state=world_neutral focused_window=%s\n' "$(date -u +%FT%TZ)" "$(focused_window)" | tee -a "$TRACE"
      return
    fi
    sleep "$POLL_SECONDS"
  done
  fail_closed "initial_state_timeout" "none" "world_neutral" "${STATE_PREFIX}world_neutral"
}

wait_for_initial_state

action_index=0
current_state="world_neutral"
while IFS='|' read -r key expected_state expected_event; do
  [[ -z "${key// }" || "$key" == \#* ]] && continue
  [[ -n "$expected_state" && -n "$expected_event" ]] || fail_closed "malformed_sequence_row" "$key" "$expected_state" "$expected_event"
  action="$(action_for_key "$key")" || fail_closed "unsupported_key" "$key" "$expected_state" "$expected_event"
  action_index=$((action_index + 1))

  before_event="$(observe_count "$expected_event")"
  before_receipt_total="$(observe_prefix_count "$RECEIPT_PREFIX")"
  before_state_total="$(observe_prefix_count "$STATE_PREFIX")"
  receipt_token="${RECEIPT_PREFIX}${action_index}:${action}:${current_state}"

  process_alive || fail_closed "process_not_alive_before_input" "$key" "$expected_state" "$expected_event"
  claim_and_verify_focus "$key" "$expected_state" "$expected_event"
  printf '%s status=SEND index=%s key=%s action=%s from_state=%s expected_state=%s focused_window=%s\n' \
    "$(date -u +%FT%TZ)" "$action_index" "$key" "$action" "$current_state" "$expected_state" "$(focused_window)" | tee -a "$TRACE"
  xdotool keydown --window "$AURELIAN_WINDOW_ID" "$key"
  xdotool keyup --window "$AURELIAN_WINDOW_ID" "$key"

  receipt_observed="false"
  event_observed="false"
  state_observed="false"
  [[ "$expected_state" == "$current_state" ]] && state_observed="true"

  for _ in $(seq 1 "$TIMEOUT_TICKS"); do
    process_alive || fail_closed "process_exited_waiting_for_ack" "$key" "$expected_state" "$expected_event"

    receipt_total="$(observe_prefix_count "$RECEIPT_PREFIX")"
    if (( receipt_total > before_receipt_total )); then
      latest_receipt="$(latest_prefixed_line "$RECEIPT_PREFIX")"
      [[ "$latest_receipt" == *"$receipt_token"* ]] || fail_closed "wrong_input_receipt" "$key" "$expected_state" "$expected_event"
      (( receipt_total == before_receipt_total + 1 )) || fail_closed "duplicate_input_receipt" "$key" "$expected_state" "$expected_event"
      receipt_observed="true"
    fi

    event_now="$(observe_count "$expected_event")"
    if (( event_now > before_event )); then
      (( event_now == before_event + 1 )) || fail_closed "duplicate_expected_event" "$key" "$expected_state" "$expected_event"
      event_observed="true"
    fi

    if [[ "$expected_state" != "$current_state" ]]; then
      state_total="$(observe_prefix_count "$STATE_PREFIX")"
      if (( state_total > before_state_total )); then
        latest_state="$(latest_prefixed_line "$STATE_PREFIX")"
        [[ "$latest_state" == *"${STATE_PREFIX}${expected_state}"* ]] || fail_closed "unexpected_state" "$key" "$expected_state" "$expected_event"
        (( state_total == before_state_total + 1 )) || fail_closed "duplicate_state_transition" "$key" "$expected_state" "$expected_event"
        state_observed="true"
      fi
    fi

    if [[ "$receipt_observed" == "true" && "$event_observed" == "true" && "$state_observed" == "true" ]]; then
      printf '%s status=ACK index=%s key=%s action=%s state=%s receipt_total=%s event_count=%s\n' \
        "$(date -u +%FT%TZ)" "$action_index" "$key" "$action" "$expected_state" "$receipt_total" "$event_now" | tee -a "$TRACE"
      break
    fi
    sleep "$POLL_SECONDS"
  done

  [[ "$receipt_observed" == "true" ]] || fail_closed "input_receipt_timeout" "$key" "$expected_state" "$expected_event"
  [[ "$event_observed" == "true" ]] || fail_closed "expected_event_timeout" "$key" "$expected_state" "$expected_event"
  [[ "$state_observed" == "true" ]] || fail_closed "state_transition_timeout" "$key" "$expected_state" "$expected_event"
  current_state="$expected_state"
done < "$AURELIAN_SEQUENCE"

[[ "$action_index" == "55" ]] || fail_closed "wrong_action_count"
[[ "$(observe_prefix_count "$RECEIPT_PREFIX")" == "55" ]] || fail_closed "wrong_receipt_count"
printf '%s status=PASS actions=55 receipts=55 final_state=world_first_imperial_expansion_two_land_footprint\n' "$(date -u +%FT%TZ)" | tee -a "$TRACE"
