#!/usr/bin/env bash
set -euo pipefail

: "${AURELIAN_ROUTE:?AURELIAN_ROUTE is required}"
: "${AURELIAN_WINDOW_ID:?AURELIAN_WINDOW_ID is required}"
: "${AURELIAN_LOG:?AURELIAN_LOG is required}"
: "${AURELIAN_APP_PID:?AURELIAN_APP_PID is required}"

TRACE="${AURELIAN_TRACE:-aurelian-exported-startup-ownership-v1.log}"
TIMEOUT_TICKS="${AURELIAN_TIMEOUT_TICKS:-240}"
POLL_SECONDS="${AURELIAN_POLL_SECONDS:-0.125}"

touch "$AURELIAN_LOG" "$TRACE"

fail_closed() {
  local reason="$1" alive="false" focus
  kill -0 "$AURELIAN_APP_PID" 2>/dev/null && alive="true"
  focus="$(xdotool getwindowfocus 2>/dev/null || true)"
  printf '%s route=%s status=FAIL reason=%s process_alive=%s focused_window=%s expected_window=%s\n' \
    "$(date -u +%FT%TZ)" "$AURELIAN_ROUTE" "$reason" "$alive" "$focus" "$AURELIAN_WINDOW_ID" | tee -a "$TRACE"
  tail -n 160 "$AURELIAN_LOG" >> "$TRACE"
  exit 1
}

wait_for_token() {
  local token="$1" reason="$2"
  for _ in $(seq 1 "$TIMEOUT_TICKS"); do
    kill -0 "$AURELIAN_APP_PID" 2>/dev/null || fail_closed "process_exited_${reason}"
    grep -Fq "$token" "$AURELIAN_LOG" && return
    sleep "$POLL_SECONDS"
  done
  fail_closed "$reason"
}

wait_for_token "AURELIAN_STARTUP_PHASE=enter_tree" "enter_tree_timeout"
wait_for_token "AURELIAN_STARTUP_PHASE=ready_enter" "ready_enter_timeout"
wait_for_token "AURELIAN_STARTUP_PHASE=public_ready" "public_ready_phase_timeout"
wait_for_token "PLAYABLE_AURELIAN_ENTRY_READY=world_neutral" "public_ready_timeout"
wait_for_token "PLAYABLE_AURELIAN_ENTRY_STATE=world_neutral" "initial_state_timeout"

enter_line="$(grep -n -m1 'AURELIAN_STARTUP_PHASE=enter_tree' "$AURELIAN_LOG" | cut -d: -f1)"
ready_line="$(grep -n -m1 'AURELIAN_STARTUP_PHASE=ready_enter' "$AURELIAN_LOG" | cut -d: -f1)"
public_line="$(grep -n -m1 'AURELIAN_STARTUP_PHASE=public_ready' "$AURELIAN_LOG" | cut -d: -f1)"
ready_marker_line="$(grep -n -m1 'PLAYABLE_AURELIAN_ENTRY_READY=world_neutral' "$AURELIAN_LOG" | cut -d: -f1)"
(( enter_line < ready_line && ready_line < public_line && public_line < ready_marker_line )) || fail_closed "startup_phase_order"

for phase in enter_tree ready_enter public_ready; do
  test "$(grep -c "AURELIAN_STARTUP_PHASE=${phase}" "$AURELIAN_LOG")" = "1" || fail_closed "duplicate_${phase}"
  grep -F "AURELIAN_STARTUP_PHASE=${phase}" "$AURELIAN_LOG" | grep -F "node=PlayableAurelianEntryV1" | \
    grep -F "scene_file=res://scenes/aurelian/playable_aurelian_entry_v1.tscn" | \
    grep -F "script=res://scenes/aurelian/playable_aurelian_entry_v1.gd" >/dev/null || fail_closed "wrong_${phase}_identity"
done

xdotool windowfocus --sync "$AURELIAN_WINDOW_ID"
focus="$(xdotool getwindowfocus 2>/dev/null || true)"
[[ "$focus" == "$AURELIAN_WINDOW_ID" ]] || fail_closed "window_focus_not_owned"

before_receipts="$(grep -F -c 'PLAYABLE_AURELIAN_INPUT_RECEIPT=' "$AURELIAN_LOG" 2>/dev/null || true)"
before_target="$(grep -F -c 'PLAYABLE_AURELIAN_ENTRY_STATE=world_trade_selected' "$AURELIAN_LOG" 2>/dev/null || true)"
test "$before_receipts" = "0" || fail_closed "receipt_before_input"
test "$before_target" = "0" || fail_closed "target_state_before_input"

printf '%s route=%s status=SEND index=1 key=Return action=ui_accept from_state=world_neutral focused_window=%s\n' \
  "$(date -u +%FT%TZ)" "$AURELIAN_ROUTE" "$focus" | tee -a "$TRACE"
xdotool keydown --window "$AURELIAN_WINDOW_ID" Return
xdotool keyup --window "$AURELIAN_WINDOW_ID" Return

wait_for_token "PLAYABLE_AURELIAN_INPUT_RECEIPT=1:ui_accept:world_neutral" "input_receipt_timeout"
wait_for_token "PLAYABLE_AURELIAN_ENTRY_STATE=world_trade_selected" "first_state_timeout"
test "$(grep -F -c 'PLAYABLE_AURELIAN_INPUT_RECEIPT=' "$AURELIAN_LOG")" = "1" || fail_closed "wrong_receipt_count"
test "$(grep -F -c 'PLAYABLE_AURELIAN_INPUT_RECEIPT=1:ui_accept:world_neutral' "$AURELIAN_LOG")" = "1" || fail_closed "wrong_receipt_identity"
test "$(grep -F -c 'PLAYABLE_AURELIAN_ENTRY_STATE=world_trade_selected' "$AURELIAN_LOG")" = "1" || fail_closed "wrong_first_state_count"

printf '%s route=%s status=PASS actions=1 receipts=1 final_state=world_trade_selected focused_window=%s\n' \
  "$(date -u +%FT%TZ)" "$AURELIAN_ROUTE" "$(xdotool getwindowfocus)" | tee -a "$TRACE"
