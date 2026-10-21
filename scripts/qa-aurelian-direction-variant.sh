#!/usr/bin/env bash

set -euo pipefail

: "${AURELIAN_DIRECTION:?missing AURELIAN_DIRECTION}"
: "${AURELIAN_CRISIS_RESPONSE:?missing AURELIAN_CRISIS_RESPONSE}"
: "${AURELIAN_RIVAL_RESPONSE:?missing AURELIAN_RIVAL_RESPONSE}"
: "${AURELIAN_SPECIALIZATION:?missing AURELIAN_SPECIALIZATION}"
: "${AURELIAN_EXPECTED_PAYOFF:?missing AURELIAN_EXPECTED_PAYOFF}"
: "${AURELIAN_EXPECTED_SPECIALIZATION_PAYOFF:?missing AURELIAN_EXPECTED_SPECIALIZATION_PAYOFF}"
: "${AURELIAN_EXPECTED_COORDINATION:?missing AURELIAN_EXPECTED_COORDINATION}"
: "${GODOT_BIN:?missing GODOT_BIN}"
: "${EVIDENCE_DIR:?missing EVIDENCE_DIR}"

direction="${AURELIAN_DIRECTION}"
log="${EVIDENCE_DIR}/playable-entry-sequence-${direction}.log"

on_error() {
  status=$?
  trap - ERR
  echo "AURELIAN_DIRECTION_VARIANT_FAIL=${direction^^}" >&2
  if [ -f "${log}" ]; then
    cat "${log}" >&2
  fi
  exit "${status}"
}
trap on_error ERR

if ! timeout 90s xvfb-run -a -s "-screen 0 1280x720x24" env \
  AURELIAN_CAPTURE_PLAYABLE_ENTRY=1 \
  AURELIAN_AUTOMATED_DIRECTION="${direction}" \
  AURELIAN_AUTOMATED_CRISIS_RESPONSE="${AURELIAN_CRISIS_RESPONSE}" \
  AURELIAN_AUTOMATED_RIVAL_RESPONSE="${AURELIAN_RIVAL_RESPONSE}" \
  AURELIAN_AUTOMATED_NORTH_RIDGE_SPECIALIZATION="${AURELIAN_SPECIALIZATION}" \
  "${GODOT_BIN}" --path game --audio-driver Dummy --rendering-method gl_compatibility \
  --resolution 1280x720 --position 0,0 --disable-vsync --fixed-fps 480 \
  > "${log}" 2>&1; then
  cat "${log}"
  exit 1
fi

grep -F "AURELIAN_FIRST_NATIONAL_DIRECTION_COMMITMENT=${direction^^}" "${log}"
grep -F "AURELIAN_FIRST_NATIONAL_MANDATE=${direction^^}" "${log}"
grep -F "AURELIAN_FIRST_EMPIRE_PROCLAMATION=AURELIAN" "${log}"
test "$(grep -Fc "AURELIAN_FIRST_EMPIRE_PROCLAMATION=" "${log}")" = "1"
grep -F "PLAYABLE_AURELIAN_ENTRY_STATE=village_aurelian_imperial_capital" "${log}"
grep -F "PLAYABLE_AURELIAN_ENTRY_STATE=map_aurelian_imperial_heartland" "${log}"
grep -F "PLAYABLE_AURELIAN_ENTRY_STATE=world_first_empire_proclaimed" "${log}"

grep -F "AURELIAN_FIRST_IMPERIAL_CRISIS=RIVER_SURGE" "${log}"
grep -F "AURELIAN_FIRST_IMPERIAL_CRISIS_RESPONSE=${AURELIAN_CRISIS_RESPONSE^^}" "${log}"
test "$(grep -Fc "AURELIAN_FIRST_IMPERIAL_CRISIS_RESPONSE=" "${log}")" = "1"
if [ "${AURELIAN_CRISIS_RESPONSE}" = "shield_greenvale" ]; then
  grep -F "PLAYABLE_AURELIAN_ENTRY_STATE=world_aurelian_river_surge_greenvale_response" "${log}"
else
  grep -F "PLAYABLE_AURELIAN_ENTRY_STATE=world_aurelian_river_surge_bridge_response" "${log}"
fi

grep -F "AURELIAN_FIRST_RIVAL_COUNTERMOVE_RESPONSE=${AURELIAN_RIVAL_RESPONSE^^}" "${log}"
test "$(grep -Fc "AURELIAN_FIRST_RIVAL_COUNTERMOVE_RESPONSE=" "${log}")" = "1"
grep -F "AURELIAN_FIRST_FRONTIER_PAYOFF_REVEAL=${AURELIAN_EXPECTED_PAYOFF}" "${log}"
grep -F "AURELIAN_FIRST_FRONTIER_PAYOFF=${AURELIAN_EXPECTED_PAYOFF}" "${log}"
test "$(grep -Fc "AURELIAN_FIRST_FRONTIER_PAYOFF=" "${log}")" = "1"
if [ "${AURELIAN_EXPECTED_PAYOFF}" = "SECURE_GILDED_CROSSING" ]; then
  grep -F "PLAYABLE_AURELIAN_ENTRY_STATE=world_first_frontier_legacy_gilded_crossing_complete" "${log}"
else
  grep -F "PLAYABLE_AURELIAN_ENTRY_STATE=world_first_frontier_legacy_east_bridge_complete" "${log}"
fi

grep -F "AURELIAN_FIRST_IMPERIAL_EXPANSION=NORTH_RIDGE" "${log}"
test "$(grep -Fc "AURELIAN_FIRST_IMPERIAL_EXPANSION=NORTH_RIDGE" "${log}")" = "1"
grep -F "PLAYABLE_AURELIAN_ENTRY_STATE=world_first_imperial_expansion_two_land_footprint" "${log}"
grep -F "AURELIAN_NORTH_RIDGE_OUTPOST=ESTABLISHED" "${log}"
test "$(grep -Fc "AURELIAN_NORTH_RIDGE_OUTPOST=ESTABLISHED" "${log}")" = "1"

grep -F "AURELIAN_NORTH_RIDGE_SPECIALIZATION=${AURELIAN_SPECIALIZATION^^}" "${log}"
test "$(grep -Fc "AURELIAN_NORTH_RIDGE_SPECIALIZATION=" "${log}")" = "1"
grep -F "PLAYABLE_AURELIAN_ENTRY_STATE=map_north_ridge_${AURELIAN_SPECIALIZATION}_committed" "${log}"
grep -F "AURELIAN_NORTH_RIDGE_SPECIALIZATION_PAYOFF=${AURELIAN_EXPECTED_SPECIALIZATION_PAYOFF}" "${log}"
test "$(grep -Fc "AURELIAN_NORTH_RIDGE_SPECIALIZATION_PAYOFF=" "${log}")" = "1"
grep -F "AURELIAN_FIRST_INTER_LAND_COORDINATION=${AURELIAN_EXPECTED_COORDINATION}" "${log}"
test "$(grep -Fc "AURELIAN_FIRST_INTER_LAND_COORDINATION=" "${log}")" = "1"

if [ "${AURELIAN_SPECIALIZATION}" = "trade_post" ]; then
  grep -F "PLAYABLE_AURELIAN_ENTRY_STATE=world_north_ridge_trade_post_logistics_posture" "${log}"
  grep -F "PLAYABLE_AURELIAN_ENTRY_STATE=world_north_ridge_logistics_line_active_frontier_role" "${log}"
  grep -F "PLAYABLE_AURELIAN_ENTRY_STATE=map_ridge_convoy_dispatched" "${log}"
  grep -F "PLAYABLE_AURELIAN_ENTRY_STATE=village_ridge_convoy_greenvale_acknowledges" "${log}"
  grep -F "PLAYABLE_AURELIAN_ENTRY_STATE=world_coordinated_logistics_network" "${log}"
else
  grep -F "PLAYABLE_AURELIAN_ENTRY_STATE=world_north_ridge_watch_post_vigilance_posture" "${log}"
  grep -F "PLAYABLE_AURELIAN_ENTRY_STATE=world_north_ridge_signal_active_frontier_role" "${log}"
  grep -F "PLAYABLE_AURELIAN_ENTRY_STATE=map_basin_alert_raised" "${log}"
  grep -F "PLAYABLE_AURELIAN_ENTRY_STATE=village_basin_alert_greenvale_acknowledges" "${log}"
  grep -F "PLAYABLE_AURELIAN_ENTRY_STATE=world_coordinated_vigilance_network" "${log}"
fi

grep -F "PLAYABLE_AURELIAN_INPUT_SEQUENCE_COMPLETE=8430" "${log}"
echo "AURELIAN_DIRECTION_VARIANT_PASS=${direction^^}"
