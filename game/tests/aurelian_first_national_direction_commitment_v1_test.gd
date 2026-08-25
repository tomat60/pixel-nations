extends SceneTree

const MANIFEST_PATH := "res://scenes/aurelian/first_national_direction_commitment_v1_manifest.json"
const CONTROLLER_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1.gd"
const PERSISTENCE_PATH := "res://scenes/aurelian/aurelian_session_persistence_v2.gd"
const SESSION = preload("res://scenes/aurelian/aurelian_session_persistence_v2.gd")
const TEST_PATH := "user://aurelian-national-direction-contract-test.json"

var failures: Array[String] = []

func _initialize() -> void:
	var manifest := _read_json(MANIFEST_PATH)
	var controller := _read_text(CONTROLLER_PATH)
	var persistence := _read_text(PERSISTENCE_PATH)
	_check(String(manifest.get("contract", "")) == "GODOT_AURELIAN_FIRST_NATIONAL_DIRECTION_COMMITMENT_V1", "contract")
	_check(int(manifest.get("authority_issue", 0)) == 510, "issue")
	var directions: Array = manifest.get("directions", [])
	_check(directions == ["trade", "expand", "frontier"], "three_existing_directions")
	var action: Dictionary = manifest.get("player_action", {})
	_check(String(action.get("label", "")) == "Commit Aurelian Direction", "action_label")
	_check(bool(action.get("explicit_only", false)), "explicit_only")
	_check(controller.contains("func _cycle_national_direction"), "inspect_cycle")
	_check(controller.contains("[UP / DOWN] Trade / Expand / Frontier"), "inspection_hud")
	_check(controller.count("AURELIAN_FIRST_NATIONAL_DIRECTION_COMMITMENT=%s") == 1, "single_event_site")
	_check(controller.contains("committed_direction == \"none\""), "commit_guard")
	_check(controller.contains("AURELIAN / %s"), "world_identity")
	_check(controller.contains("Aurelian homeland context: %s direction"), "map_context")
	_check(controller.contains("Greenvale capital identity: %s direction"), "village_identity")
	_check(controller.contains("Vector2(354.0, 285.0)"), "greenvale_unchanged")
	_check(controller.contains("Vector2(515.0, 340.0)"), "gilded_crossing_unchanged")
	_check(persistence.contains("VALID_NATIONAL_DIRECTIONS"), "direction_validation")
	_check(persistence.contains("\"national_direction\""), "direction_persistence")
	_check(persistence.contains("const VERSION := 2"), "schema_v2_compatible")
	_cleanup()
	var saved := SESSION.save_session("world_first_nation_founded", "east_trade", TEST_PATH, true, true, true, true, true, true, "expand")
	_check(bool(saved.get("ok", false)), "save_committed_direction")
	var restored := SESSION.load_session(TEST_PATH)
	_check(String(restored.get("entry_state", "")) == "world_first_nation_founded", "restore_world_state")
	_check(String(restored.get("national_direction", "")) == "expand", "restore_direction")
	var invalid := SESSION.save_session("world_first_nation_founded", "east_trade", TEST_PATH, true, true, true, true, true, true, "unknown")
	_check(String(invalid.get("status", "")) == "invalid_data", "reject_unknown_direction")
	invalid = SESSION.save_session("world_first_city_recognized", "east_trade", TEST_PATH, true, true, true, true, true, false, "trade")
	_check(String(invalid.get("status", "")) == "invalid_data", "direction_requires_nation")
	_cleanup()
	_finish()

func _read_json(path: String) -> Dictionary:
	var payload = JSON.parse_string(_read_text(path))
	if payload is Dictionary:
		return payload as Dictionary
	failures.append("json_%s" % path)
	return {}

func _read_text(path: String) -> String:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		failures.append("open_%s" % path)
		return ""
	return file.get_as_text()

func _cleanup() -> void:
	for suffix in ["", ".tmp", ".bak"]:
		var path := TEST_PATH + String(suffix)
		if FileAccess.file_exists(path):
			DirAccess.remove_absolute(path)

func _check(condition: bool, label: String) -> void:
	if not condition:
		failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("GODOT_AURELIAN_FIRST_NATIONAL_DIRECTION_COMMITMENT_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("GODOT_AURELIAN_FIRST_NATIONAL_DIRECTION_COMMITMENT_V1_TEST_FAILURE: %s" % failure)
	print("GODOT_AURELIAN_FIRST_NATIONAL_DIRECTION_COMMITMENT_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
