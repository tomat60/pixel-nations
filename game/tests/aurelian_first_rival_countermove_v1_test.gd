extends SceneTree

const SESSION = preload("res://scenes/aurelian/aurelian_session_persistence_v2.gd")
const TEST_PATH := "user://aurelian-first-rival-countermove-v1-test.json"
const MANIFEST_PATH := "res://scenes/aurelian/first_rival_countermove_v1_manifest.json"
const PERSISTENCE_PATH := "res://scenes/aurelian/aurelian_session_persistence_v2.gd"

var failures: Array[String] = []

func _initialize() -> void:
	_cleanup()
	var manifest := _read_json(MANIFEST_PATH)
	_check(String(manifest.get("contract", "")) == "GODOT_AURELIAN_FIRST_RIVAL_COUNTERMOVE_V1", "manifest_contract")
	_check(int(manifest.get("issue", 0)) == 530, "manifest_issue")
	var mapping: Dictionary = manifest.get("origin_mapping", {})
	_check(String((mapping.get("shield_greenvale", {}) as Dictionary).get("map_locus", "")) == "east_bridge", "shield_maps_to_bridge")
	_check(String((mapping.get("keep_east_bridge_open", {}) as Dictionary).get("map_locus", "")) == "greenvale", "bridge_maps_to_greenvale")
	var responses: Dictionary = manifest.get("responses", {})
	_check(responses.keys().size() == 2, "exactly_two_responses")
	_check(responses.has("stand_firm"), "stand_firm_response")
	_check(responses.has("negotiate_passage"), "negotiate_passage_response")
	var geography: Dictionary = manifest.get("shared_geography", {})
	for invariant in ["greenvale_origin_unchanged", "river_spline_unchanged", "east_bridge_transform_unchanged", "east_route_unchanged", "camera_topology_unchanged"]:
		_check(bool(geography.get(invariant, false)), "geography_%s" % invariant)

	var common := [true, true, true, true, true, true, "trade", true, true, "river_surge"]
	var pending := SESSION.save_session("world_first_rival_countermove", "east_trade", TEST_PATH, common[0], common[1], common[2], common[3], common[4], common[5], common[6], common[7], common[8], common[9], "shield_greenvale")
	_check(bool(pending.get("ok", false)), "save_pending_shield_origin")
	var restored := SESSION.load_session(TEST_PATH)
	_check(String(restored.get("entry_state", "")) == "world_first_rival_countermove", "restore_pending")
	_check(String(restored.get("imperial_crisis_response", "")) == "shield_greenvale", "preserve_shield_origin")
	_check(String(restored.get("first_rival_countermove_response", "")) == "none", "pending_has_no_response")

	var stand := SESSION.save_session("world_first_rival_response_stand_firm", "east_trade", TEST_PATH, common[0], common[1], common[2], common[3], common[4], common[5], "expand", common[7], common[8], common[9], "shield_greenvale", "stand_firm")
	_check(bool(stand.get("ok", false)), "save_stand_firm")
	restored = SESSION.load_session(TEST_PATH)
	_check(String(restored.get("first_rival_countermove_response", "")) == "stand_firm", "restore_stand_firm")
	_check(String(restored.get("national_direction", "")) == "expand", "preserve_expand_direction")

	var negotiate := SESSION.save_session("world_first_rival_response_negotiate_passage", "east_trade", TEST_PATH, common[0], common[1], common[2], common[3], common[4], common[5], "frontier", common[7], common[8], common[9], "keep_east_bridge_open", "negotiate_passage")
	_check(bool(negotiate.get("ok", false)), "save_negotiate_passage")
	restored = SESSION.load_session(TEST_PATH)
	_check(String(restored.get("first_rival_countermove_response", "")) == "negotiate_passage", "restore_negotiate_passage")
	_check(String(restored.get("imperial_crisis_response", "")) == "keep_east_bridge_open", "preserve_bridge_origin")
	_check(String(restored.get("national_direction", "")) == "frontier", "preserve_frontier_direction")

	var invalid := SESSION.save_session("world_first_rival_response_stand_firm", "east_trade", TEST_PATH, common[0], common[1], common[2], common[3], common[4], common[5], common[6], common[7], common[8], common[9], "shield_greenvale", "negotiate_passage")
	_check(String(invalid.get("status", "")) == "invalid_data", "reject_mismatched_response_state")
	invalid = SESSION.save_session("world_first_rival_countermove", "east_trade", TEST_PATH, common[0], common[1], common[2], common[3], common[4], common[5], common[6], common[7], common[8], common[9], "shield_greenvale", "stand_firm")
	_check(String(invalid.get("status", "")) == "invalid_data", "reject_response_in_pending_state")
	invalid = SESSION.save_session("world_first_rival_response_stand_firm", "east_trade", TEST_PATH, common[0], common[1], common[2], common[3], common[4], common[5], common[6], common[7], common[8], common[9], "none", "stand_firm")
	_check(String(invalid.get("status", "")) == "invalid_data", "response_requires_river_surge_origin")

	var persistence := _read_text(PERSISTENCE_PATH)
	_check(persistence.contains("VALID_FIRST_RIVAL_COUNTERMOVE_RESPONSES"), "valid_response_contract")
	_check(persistence.contains('"first_rival_countermove_response"'), "response_persisted")
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
		print("GODOT_AURELIAN_FIRST_RIVAL_COUNTERMOVE_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("GODOT_AURELIAN_FIRST_RIVAL_COUNTERMOVE_V1_TEST_FAILURE: %s" % failure)
	quit(1)
