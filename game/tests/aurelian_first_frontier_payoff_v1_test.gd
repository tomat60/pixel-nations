extends SceneTree

const SESSION = preload("res://scenes/aurelian/aurelian_session_persistence_v2.gd")
const TEST_PATH := "user://aurelian-first-frontier-payoff-v1-test.json"
const MANIFEST_PATH := "res://scenes/aurelian/first_frontier_payoff_v1_manifest.json"
const PERSISTENCE_PATH := "res://scenes/aurelian/aurelian_session_persistence_v2.gd"
const CONTROLLER_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1.gd"

var failures: Array[String] = []

func _initialize() -> void:
	_cleanup()
	var manifest := _read_json(MANIFEST_PATH)
	_check(String(manifest.get("contract", "")) == "GODOT_AURELIAN_FIRST_FRONTIER_PAYOFF_V1", "manifest_contract")
	_check(int(manifest.get("issue", 0)) == 534, "manifest_issue")
	var mapping: Dictionary = manifest.get("response_mapping", {})
	_check(mapping.keys().size() == 2, "exactly_two_response_mappings")
	var stand_mapping: Dictionary = mapping.get("stand_firm", {})
	var negotiate_mapping: Dictionary = mapping.get("negotiate_passage", {})
	_check(String(stand_mapping.get("payoff", "")) == "secure_gilded_crossing", "stand_maps_to_gilded_crossing")
	_check(String(stand_mapping.get("map_locus", "")) == "gilded_crossing", "stand_uses_existing_gilded_crossing")
	_check(String(negotiate_mapping.get("payoff", "")) == "ratify_east_bridge_passage", "negotiate_maps_to_bridge_passage")
	_check(String(negotiate_mapping.get("map_locus", "")) == "east_bridge", "negotiate_uses_existing_east_bridge")
	var availability: Dictionary = manifest.get("availability", {})
	_check(bool(availability.get("derived_action_only", false)), "derived_action_only")
	_check(not bool(availability.get("second_action_available", true)), "no_second_action")
	_check(not bool(availability.get("random_selection", true)), "no_random_selection")
	var geography: Dictionary = manifest.get("shared_geography", {})
	for invariant in ["greenvale_origin_unchanged", "river_spline_unchanged", "east_bridge_transform_unchanged", "gilded_crossing_transform_unchanged", "camera_topology_unchanged"]:
		_check(bool(geography.get(invariant, false)), "geography_%s" % invariant)

	var common := [true, true, true, true, true, true, "trade", true, true, "river_surge"]
	var pending_gilded := SESSION.save_session("world_first_frontier_payoff_gilded_crossing_revealed", "east_trade", TEST_PATH, common[0], common[1], common[2], common[3], common[4], common[5], common[6], common[7], common[8], common[9], "shield_greenvale", "stand_firm")
	_check(bool(pending_gilded.get("ok", false)), "save_pending_gilded")
	var restored := SESSION.load_session(TEST_PATH)
	_check(String(restored.get("entry_state", "")) == "world_first_frontier_payoff_gilded_crossing_revealed", "restore_pending_gilded_state")
	_check(String(restored.get("first_rival_countermove_response", "")) == "stand_firm", "preserve_stand_firm")
	_check(String(restored.get("first_frontier_payoff", "")) == "none", "pending_gilded_has_no_payoff")

	var secured_gilded := SESSION.save_session("world_first_frontier_legacy_gilded_crossing_complete", "east_trade", TEST_PATH, common[0], common[1], common[2], common[3], common[4], common[5], "expand", common[7], common[8], common[9], "shield_greenvale", "stand_firm", "secure_gilded_crossing")
	_check(bool(secured_gilded.get("ok", false)), "save_secured_gilded")
	restored = SESSION.load_session(TEST_PATH)
	_check(String(restored.get("first_frontier_payoff", "")) == "secure_gilded_crossing", "restore_gilded_payoff")
	_check(String(restored.get("national_direction", "")) == "expand", "preserve_expand_direction")
	_check(String(restored.get("imperial_crisis_response", "")) == "shield_greenvale", "preserve_shield_response")

	var pending_bridge := SESSION.save_session("world_first_frontier_payoff_east_bridge_revealed", "east_trade", TEST_PATH, common[0], common[1], common[2], common[3], common[4], common[5], "frontier", common[7], common[8], common[9], "keep_east_bridge_open", "negotiate_passage")
	_check(bool(pending_bridge.get("ok", false)), "save_pending_bridge")
	restored = SESSION.load_session(TEST_PATH)
	_check(String(restored.get("first_rival_countermove_response", "")) == "negotiate_passage", "preserve_negotiate_passage")
	_check(String(restored.get("first_frontier_payoff", "")) == "none", "pending_bridge_has_no_payoff")

	var secured_bridge := SESSION.save_session("world_first_frontier_legacy_east_bridge_complete", "east_trade", TEST_PATH, common[0], common[1], common[2], common[3], common[4], common[5], "frontier", common[7], common[8], common[9], "keep_east_bridge_open", "negotiate_passage", "ratify_east_bridge_passage")
	_check(bool(secured_bridge.get("ok", false)), "save_secured_bridge")
	restored = SESSION.load_session(TEST_PATH)
	_check(String(restored.get("first_frontier_payoff", "")) == "ratify_east_bridge_passage", "restore_bridge_payoff")
	_check(String(restored.get("national_direction", "")) == "frontier", "preserve_frontier_direction")
	_check(String(restored.get("imperial_crisis_response", "")) == "keep_east_bridge_open", "preserve_bridge_response")

	var invalid := SESSION.save_session("world_first_frontier_legacy_gilded_crossing_complete", "east_trade", TEST_PATH, common[0], common[1], common[2], common[3], common[4], common[5], common[6], common[7], common[8], common[9], "shield_greenvale", "stand_firm", "ratify_east_bridge_passage")
	_check(String(invalid.get("status", "")) == "invalid_data", "reject_mismatched_gilded_payoff")
	invalid = SESSION.save_session("world_first_frontier_legacy_east_bridge_complete", "east_trade", TEST_PATH, common[0], common[1], common[2], common[3], common[4], common[5], common[6], common[7], common[8], common[9], "keep_east_bridge_open", "stand_firm", "ratify_east_bridge_passage")
	_check(String(invalid.get("status", "")) == "invalid_data", "reject_response_payoff_mismatch")
	invalid = SESSION.save_session("world_first_frontier_payoff_gilded_crossing_revealed", "east_trade", TEST_PATH, common[0], common[1], common[2], common[3], common[4], common[5], common[6], common[7], common[8], common[9], "shield_greenvale", "stand_firm", "secure_gilded_crossing")
	_check(String(invalid.get("status", "")) == "invalid_data", "reject_payoff_in_pending_state")

	var persistence := _read_text(PERSISTENCE_PATH)
	_check(persistence.contains("VALID_FIRST_FRONTIER_PAYOFFS"), "valid_payoff_contract")
	_check(persistence.contains('"first_frontier_payoff"'), "payoff_persisted")
	var controller := _read_text(CONTROLLER_PATH)
	for token in [
		"AURELIAN_FIRST_FRONTIER_PAYOFF_REVEAL=SECURE_GILDED_CROSSING",
		"AURELIAN_FIRST_FRONTIER_PAYOFF_REVEAL=RATIFY_EAST_BRIDGE_PASSAGE",
		"AURELIAN_FIRST_FRONTIER_PAYOFF=SECURE_GILDED_CROSSING",
		"AURELIAN_FIRST_FRONTIER_PAYOFF=RATIFY_EAST_BRIDGE_PASSAGE",
		"PLAYABLE_AURELIAN_INPUT_SEQUENCE_COMPLETE=6030",
		"[ENTER] Secure Gilded Crossing",
		"[ENTER] Ratify East Bridge Passage",
	]:
		_check(controller.contains(token), "controller_token_%s" % token)
	_check(controller.contains('main_decision_overlay_root.visible = state_name in RIVAL_STATES or state_name in FRONTIER_PAYOFF_STATES'), "payoff_overlay_visible")
	_check(controller.contains('bridge_locus.visible = state_name.begins_with("map_")'), "reuse_existing_map_locus")
	_check(controller.contains('village_cue.visible = state_name.begins_with("village_")'), "reuse_existing_village_cue")
	_check(not controller.contains("FRONTIER_PAYOFF_GLB"), "no_payoff_asset_dependency")
	for state in [
		"world_first_frontier_payoff_gilded_crossing_revealed",
		"map_first_frontier_payoff_gilded_crossing_pending",
		"village_first_frontier_payoff_gilded_crossing_pending",
		"village_first_frontier_payoff_gilded_crossing_secured",
		"map_first_frontier_payoff_gilded_crossing_secured",
		"world_first_frontier_legacy_gilded_crossing_complete",
		"world_first_frontier_payoff_east_bridge_revealed",
		"map_first_frontier_payoff_east_bridge_pending",
		"village_first_frontier_payoff_east_bridge_pending",
		"village_first_frontier_payoff_east_bridge_secured",
		"map_first_frontier_payoff_east_bridge_secured",
		"world_first_frontier_legacy_east_bridge_complete",
	]:
		_check(persistence.contains(state), "persistence_state_%s" % state)
	_cleanup()
	_finish()

func _read_json(path: String) -> Dictionary:
	var parsed: Variant = JSON.parse_string(_read_text(path))
	return parsed if parsed is Dictionary else {}

func _read_text(path: String) -> String:
	var file := FileAccess.open(path, FileAccess.READ)
	return file.get_as_text() if file != null else ""

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
		print("GODOT_AURELIAN_FIRST_FRONTIER_PAYOFF_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("GODOT_AURELIAN_FIRST_FRONTIER_PAYOFF_V1_TEST_FAILURE: %s" % failure)
	quit(1)
