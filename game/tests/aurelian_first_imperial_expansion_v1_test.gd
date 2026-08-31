extends SceneTree

const SESSION = preload("res://scenes/aurelian/aurelian_session_persistence_v2.gd")
const TEST_PATH := "user://aurelian-first-imperial-expansion-v1-test.json"
const MANIFEST_PATH := "res://scenes/aurelian/first_imperial_expansion_v1_manifest.json"
const PERSISTENCE_PATH := "res://scenes/aurelian/aurelian_session_persistence_v2.gd"
const CONTROLLER_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1.gd"

var failures: Array[String] = []

func _initialize() -> void:
	_cleanup()
	var manifest := _read_json(MANIFEST_PATH)
	_check(String(manifest.get("contract", "")) == "GODOT_AURELIAN_FIRST_IMPERIAL_EXPANSION_V1", "manifest_contract")
	_check(int(manifest.get("issue", 0)) == 538, "manifest_issue")
	var expansion: Dictionary = manifest.get("expansion", {})
	_check(String(expansion.get("target", "")) == "north_ridge", "fixed_north_ridge_target")
	_check(String(expansion.get("action", "")) == "Claim North Ridge", "explicit_claim_action")
	_check(expansion.get("before_claimed_lands", []) == ["east_route"], "one_land_before_claim")
	_check(expansion.get("after_claimed_lands", []) == ["east_route", "north_ridge"], "exactly_two_lands_after_claim")
	_check(not bool(expansion.get("third_land_available", true)), "no_third_land")
	_check(not bool(expansion.get("repeatable_expansion", true)), "no_repeatable_expansion")
	var geography: Dictionary = manifest.get("shared_geography", {})
	for invariant in ["greenvale_origin_unchanged", "river_spline_unchanged", "east_bridge_transform_unchanged", "north_ridge_transform_unchanged", "gilded_crossing_transform_unchanged", "camera_topology_unchanged"]:
		_check(bool(geography.get(invariant, false)), "geography_%s" % invariant)

	var common := [true, true, true, true, true, true, "trade", true, true, "river_surge"]
	var pending_gilded := SESSION.save_session(
		"world_first_imperial_expansion_north_ridge_direction",
		"east_trade",
		TEST_PATH,
		common[0], common[1], common[2], common[3], common[4], common[5],
		common[6], common[7], common[8], common[9],
		"shield_greenvale", "stand_firm", "secure_gilded_crossing",
		"north_ridge", "none"
	)
	_check(bool(pending_gilded.get("ok", false)), "save_pending_gilded_origin")
	var restored := SESSION.load_session(TEST_PATH)
	_check(String(restored.get("imperial_expansion_target", "")) == "north_ridge", "restore_north_ridge_target")
	_check(restored.get("claimed_lands", []) == ["east_route"], "pending_keeps_one_land")
	_check(String(restored.get("first_imperial_expansion", "")) == "none", "pending_has_no_claim")

	var claimed_gilded := SESSION.save_session(
		"map_first_imperial_expansion_two_lands_claimed",
		"east_trade",
		TEST_PATH,
		common[0], common[1], common[2], common[3], common[4], common[5],
		"expand", common[7], common[8], common[9],
		"shield_greenvale", "stand_firm", "secure_gilded_crossing",
		"north_ridge", "north_ridge_claimed"
	)
	_check(bool(claimed_gilded.get("ok", false)), "save_claimed_gilded_origin")
	restored = SESSION.load_session(TEST_PATH)
	_check(String(restored.get("entry_state", "")) == "map_first_imperial_expansion_two_lands_claimed", "restore_claimed_map")
	_check(restored.get("claimed_lands", []) == ["east_route", "north_ridge"], "restore_exact_two_lands")
	_check(String(restored.get("first_imperial_expansion", "")) == "north_ridge_claimed", "restore_expansion_result")
	_check(String(restored.get("national_direction", "")) == "expand", "preserve_direction")
	_check(String(restored.get("first_frontier_payoff", "")) == "secure_gilded_crossing", "preserve_gilded_payoff")

	var claimed_bridge := SESSION.save_session(
		"world_first_imperial_expansion_two_land_footprint",
		"east_trade",
		TEST_PATH,
		common[0], common[1], common[2], common[3], common[4], common[5],
		"frontier", common[7], common[8], common[9],
		"keep_east_bridge_open", "negotiate_passage", "ratify_east_bridge_passage",
		"north_ridge", "north_ridge_claimed"
	)
	_check(bool(claimed_bridge.get("ok", false)), "save_claimed_bridge_origin")
	restored = SESSION.load_session(TEST_PATH)
	_check(restored.get("claimed_lands", []) == ["east_route", "north_ridge"], "bridge_origin_exact_two_lands")
	_check(String(restored.get("imperial_crisis_response", "")) == "keep_east_bridge_open", "preserve_crisis_response")
	_check(String(restored.get("first_rival_countermove_response", "")) == "negotiate_passage", "preserve_rival_response")
	_check(String(restored.get("first_frontier_payoff", "")) == "ratify_east_bridge_passage", "preserve_bridge_payoff")

	var invalid := SESSION.save_session(
		"world_first_imperial_expansion_north_ridge_direction",
		"east_trade",
		TEST_PATH,
		common[0], common[1], common[2], common[3], common[4], common[5],
		common[6], common[7], common[8], common[9],
		"shield_greenvale", "stand_firm", "none",
		"north_ridge", "none"
	)
	_check(String(invalid.get("status", "")) == "invalid_data", "reject_reveal_before_payoff")
	invalid = SESSION.save_session(
		"map_first_imperial_expansion_two_lands_claimed",
		"east_trade",
		TEST_PATH,
		common[0], common[1], common[2], common[3], common[4], common[5],
		common[6], common[7], common[8], common[9],
		"shield_greenvale", "stand_firm", "secure_gilded_crossing",
		"north_ridge", "none"
	)
	_check(String(invalid.get("status", "")) == "invalid_data", "reject_claimed_state_without_result")
	invalid = SESSION.save_session(
		"world_first_frontier_legacy_gilded_crossing_complete",
		"east_trade",
		TEST_PATH,
		common[0], common[1], common[2], common[3], common[4], common[5],
		common[6], common[7], common[8], common[9],
		"shield_greenvale", "stand_firm", "secure_gilded_crossing",
		"north_ridge", "none"
	)
	_check(String(invalid.get("status", "")) == "invalid_data", "reject_target_outside_expansion_state")

	var payload := _read_json(TEST_PATH)
	payload["claimed_lands"] = ["east_route", "north_ridge", "third_land"]
	_write_json(TEST_PATH, payload)
	restored = SESSION.load_session(TEST_PATH)
	_check(String(restored.get("status", "")) == "invalid_value", "reject_third_land_payload")

	var legacy_save := SESSION.save_session(
		"world_first_frontier_legacy_gilded_crossing_complete",
		"east_trade",
		TEST_PATH,
		common[0], common[1], common[2], common[3], common[4], common[5],
		common[6], common[7], common[8], common[9],
		"shield_greenvale", "stand_firm", "secure_gilded_crossing"
	)
	_check(bool(legacy_save.get("ok", false)), "save_legacy_payoff")
	payload = _read_json(TEST_PATH)
	payload.erase("imperial_expansion_target")
	payload.erase("claimed_lands")
	payload.erase("first_imperial_expansion")
	_write_json(TEST_PATH, payload)
	restored = SESSION.load_session(TEST_PATH)
	_check(bool(restored.get("ok", false)), "load_legacy_payoff_without_expansion_fields")
	_check(restored.get("claimed_lands", []) == ["east_route"], "legacy_defaults_to_east_route_only")

	var persistence := _read_text(PERSISTENCE_PATH)
	for token in [
		"VALID_IMPERIAL_EXPANSION_TARGETS",
		"VALID_FIRST_IMPERIAL_EXPANSIONS",
		"FIRST_IMPERIAL_EXPANSION_PENDING_STATES",
		"FIRST_IMPERIAL_EXPANSION_CLAIMED_STATES",
		"\"imperial_expansion_target\"",
		"\"claimed_lands\"",
		"\"first_imperial_expansion\"",
	]:
		_check(persistence.contains(token), "persistence_token_%s" % token)
	var expansion_states := [
		"world_first_imperial_expansion_north_ridge_direction",
		"map_first_imperial_expansion_north_ridge_available",
		"map_first_imperial_expansion_north_ridge_inspected",
		"map_first_imperial_expansion_two_lands_claimed",
		"village_first_imperial_expansion_greenvale_capital_two_lands",
		"world_first_imperial_expansion_two_land_footprint",
	]
	for state in expansion_states:
		_check(persistence.contains(state), "persistence_state_%s" % state)

	var controller := _read_text(CONTROLLER_PATH)
	for state in expansion_states:
		_check(controller.contains(state), "controller_state_%s" % state)
	for token in [
		"IMPERIAL_EXPANSION_STATES",
		"imperial_expansion_target",
		"first_imperial_expansion",
		"func _build_imperial_expansion_presentation",
		"func _refresh_imperial_expansion_presentation",
		"Claim North Ridge",
		"AURELIAN_FIRST_IMPERIAL_EXPANSION_INSPECT=NORTH_RIDGE",
		"AURELIAN_FIRST_IMPERIAL_EXPANSION=NORTH_RIDGE",
		"PLAYABLE_AURELIAN_INPUT_SEQUENCE_COMPLETE=8190",
	]:
		_check(controller.contains(token), "controller_token_%s" % token)

	_cleanup()
	_finish()

func _read_json(path: String) -> Dictionary:
	var parsed: Variant = JSON.parse_string(_read_text(path))
	return parsed if parsed is Dictionary else {}

func _read_text(path: String) -> String:
	var file := FileAccess.open(path, FileAccess.READ)
	return file.get_as_text() if file != null else ""

func _write_json(path: String, payload: Dictionary) -> void:
	var file := FileAccess.open(path, FileAccess.WRITE)
	if file != null:
		file.store_string(JSON.stringify(payload))
		file.flush()

func _cleanup() -> void:
	for suffix in ["", ".tmp", ".bak"]:
		var path: String = TEST_PATH + suffix
		if FileAccess.file_exists(path):
			DirAccess.remove_absolute(path)

func _check(condition: bool, label: String) -> void:
	if not condition:
		failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("GODOT_AURELIAN_FIRST_IMPERIAL_EXPANSION_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("GODOT_AURELIAN_FIRST_IMPERIAL_EXPANSION_V1_TEST_FAILURE: %s" % failure)
	quit(1)
