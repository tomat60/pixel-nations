extends SceneTree

const SESSION = preload("res://scenes/aurelian/aurelian_session_persistence_v2.gd")
const TEST_PATH := "user://aurelian-north-ridge-outpost-v1-test.json"
const MANIFEST_PATH := "res://scenes/aurelian/north_ridge_outpost_v1_manifest.json"
const PERSISTENCE_PATH := "res://scenes/aurelian/aurelian_session_persistence_v2.gd"
const CONTROLLER_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1.gd"

var failures: Array[String] = []

func _initialize() -> void:
	_cleanup()
	var manifest := _read_json(MANIFEST_PATH)
	_check(String(manifest.get("contract", "")) == "GODOT_AURELIAN_NORTH_RIDGE_OUTPOST_V1", "manifest_contract")
	_check(int(manifest.get("issue", 0)) == 542, "manifest_issue")
	var outpost: Dictionary = manifest.get("outpost", {})
	_check(String(outpost.get("locus", "")) == "north_ridge", "fixed_north_ridge_locus")
	_check(String(outpost.get("action", "")) == "Establish North Ridge Outpost", "explicit_establishment_action")
	_check(bool(outpost.get("exactly_one_outpost", false)), "exactly_one_outpost")
	_check(not bool(outpost.get("repeatable_construction", true)), "no_repeatable_construction")
	_check(not bool(outpost.get("third_land_available", true)), "no_third_land")
	var geography: Dictionary = manifest.get("shared_geography", {})
	for invariant in ["greenvale_origin_unchanged", "river_spline_unchanged", "east_bridge_transform_unchanged", "north_ridge_transform_unchanged", "gilded_crossing_transform_unchanged", "camera_topology_unchanged"]:
		_check(bool(geography.get(invariant, false)), "geography_%s" % invariant)
	_check(geography.get("claimed_lands_exactly", []) == ["east_route", "north_ridge"], "manifest_exact_two_lands")

	var pending := SESSION.save_session(
		"world_north_ridge_outpost_frontier_need", "east_trade", TEST_PATH,
		true, true, true, true, true, true,
		"trade", true, true, "river_surge",
		"shield_greenvale", "stand_firm", "secure_gilded_crossing",
		"north_ridge", "north_ridge_claimed", "none"
	)
	_check(bool(pending.get("ok", false)), "save_pending_gilded_origin")
	var restored := SESSION.load_session(TEST_PATH)
	_check(String(restored.get("entry_state", "")) == "world_north_ridge_outpost_frontier_need", "restore_pending_world_need")
	_check(String(restored.get("north_ridge_outpost", "")) == "none", "pending_has_no_outpost")
	_check(restored.get("claimed_lands", []) == ["east_route", "north_ridge"], "pending_preserves_two_lands")
	_check(String(restored.get("first_imperial_expansion", "")) == "north_ridge_claimed", "pending_preserves_expansion")

	var established := SESSION.save_session(
		"map_north_ridge_outpost_established", "east_trade", TEST_PATH,
		true, true, true, true, true, true,
		"frontier", true, true, "river_surge",
		"keep_east_bridge_open", "negotiate_passage", "ratify_east_bridge_passage",
		"north_ridge", "north_ridge_claimed", "established"
	)
	_check(bool(established.get("ok", false)), "save_established_bridge_origin")
	restored = SESSION.load_session(TEST_PATH)
	_check(String(restored.get("entry_state", "")) == "map_north_ridge_outpost_established", "restore_established_map")
	_check(String(restored.get("north_ridge_outpost", "")) == "established", "restore_established_outpost")
	_check(restored.get("claimed_lands", []) == ["east_route", "north_ridge"], "established_preserves_two_lands")
	_check(String(restored.get("national_direction", "")) == "frontier", "preserve_direction")
	_check(String(restored.get("imperial_crisis_response", "")) == "keep_east_bridge_open", "preserve_crisis_response")
	_check(String(restored.get("first_rival_countermove_response", "")) == "negotiate_passage", "preserve_rival_response")
	_check(String(restored.get("first_frontier_payoff", "")) == "ratify_east_bridge_passage", "preserve_frontier_payoff")

	var invalid := SESSION.save_session(
		"map_north_ridge_outpost_established", "east_trade", TEST_PATH,
		true, true, true, true, true, true,
		"trade", true, true, "river_surge",
		"shield_greenvale", "stand_firm", "secure_gilded_crossing",
		"north_ridge", "north_ridge_claimed", "none"
	)
	_check(String(invalid.get("status", "")) == "invalid_data", "reject_established_state_without_outpost")
	invalid = SESSION.save_session(
		"map_north_ridge_outpost_claimed_inspection", "east_trade", TEST_PATH,
		true, true, true, true, true, true,
		"trade", true, true, "river_surge",
		"shield_greenvale", "stand_firm", "secure_gilded_crossing",
		"north_ridge", "north_ridge_claimed", "established"
	)
	_check(String(invalid.get("status", "")) == "invalid_data", "reject_established_outpost_in_pending_state")
	invalid = SESSION.save_session(
		"world_first_imperial_expansion_north_ridge_direction", "east_trade", TEST_PATH,
		true, true, true, true, true, true,
		"trade", true, true, "river_surge",
		"shield_greenvale", "stand_firm", "secure_gilded_crossing",
		"north_ridge", "none", "established"
	)
	_check(String(invalid.get("status", "")) == "invalid_data", "reject_outpost_before_north_ridge_claim")

	var payload := _read_json(TEST_PATH)
	payload["north_ridge_outpost"] = "second_outpost"
	_write_json(TEST_PATH, payload)
	restored = SESSION.load_session(TEST_PATH)
	_check(String(restored.get("status", "")) == "invalid_value", "reject_unknown_outpost_payload")

	var legacy := SESSION.save_session(
		"world_first_imperial_expansion_two_land_footprint", "east_trade", TEST_PATH,
		true, true, true, true, true, true,
		"expand", true, true, "river_surge",
		"shield_greenvale", "stand_firm", "secure_gilded_crossing",
		"north_ridge", "north_ridge_claimed"
	)
	_check(bool(legacy.get("ok", false)), "save_pre_outpost_expansion")
	payload = _read_json(TEST_PATH)
	payload.erase("north_ridge_outpost")
	_write_json(TEST_PATH, payload)
	restored = SESSION.load_session(TEST_PATH)
	_check(bool(restored.get("ok", false)), "load_pre_outpost_payload")
	_check(String(restored.get("north_ridge_outpost", "")) == "none", "legacy_defaults_to_no_outpost")

	var persistence := _read_text(PERSISTENCE_PATH)
	for token in [
		"VALID_NORTH_RIDGE_OUTPOSTS",
		"NORTH_RIDGE_OUTPOST_PENDING_STATES",
		"NORTH_RIDGE_OUTPOST_ESTABLISHED_STATES",
		"\"north_ridge_outpost\"",
		"world_north_ridge_outpost_frontier_need",
		"map_north_ridge_outpost_claimed_inspection",
		"village_north_ridge_outpost_establish_action",
		"map_north_ridge_outpost_established",
		"village_north_ridge_outpost_greenvale_administers",
		"world_north_ridge_outpost_held_two_land_frontier",
	]:
		_check(persistence.contains(token), "persistence_token_%s" % token)

	var controller := _read_text(CONTROLLER_PATH)
	for token in [
		"NORTH_RIDGE_OUTPOST_STATES",
		"north_ridge_outpost",
		"func _build_north_ridge_outpost_presentation",
		"func _refresh_north_ridge_outpost_presentation",
		"Establish North Ridge Outpost",
		"AURELIAN_NORTH_RIDGE_OUTPOST_NEED=HOLD_FRONTIER",
		"AURELIAN_NORTH_RIDGE_OUTPOST=ESTABLISHED",
		"PLAYABLE_AURELIAN_INPUT_SEQUENCE_COMPLETE=6870",
	]:
		_check(controller.contains(token), "controller_token_%s" % token)
	for state in [
		"world_north_ridge_outpost_frontier_need",
		"map_north_ridge_outpost_claimed_inspection",
		"village_north_ridge_outpost_establish_action",
		"map_north_ridge_outpost_established",
		"village_north_ridge_outpost_greenvale_administers",
		"world_north_ridge_outpost_held_two_land_frontier",
	]:
		_check(controller.contains(state), "controller_state_%s" % state)

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
		print("GODOT_AURELIAN_NORTH_RIDGE_OUTPOST_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("GODOT_AURELIAN_NORTH_RIDGE_OUTPOST_V1_TEST_FAILURE: %s" % failure)
	quit(1)
