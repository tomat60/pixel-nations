extends SceneTree

const MANIFEST_PATH := "res://scenes/aurelian/first_national_mandate_v1_manifest.json"
const CONTROLLER_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1.gd"
const PERSISTENCE_PATH := "res://scenes/aurelian/aurelian_session_persistence_v2.gd"
const SESSION = preload("res://scenes/aurelian/aurelian_session_persistence_v2.gd")
const TEST_PATH := "user://aurelian-national-mandate-contract-test.json"

var failures: Array[String] = []

func _initialize() -> void:
	var manifest := _read_json(MANIFEST_PATH)
	var controller := _read_text(CONTROLLER_PATH)
	var persistence := _read_text(PERSISTENCE_PATH)
	_check(String(manifest.get("contract", "")) == "GODOT_AURELIAN_FIRST_NATIONAL_MANDATE_V1", "contract")
	_check(int(manifest.get("issue", 0)) == 514, "issue")
	var bindings: Dictionary = manifest.get("direction_bindings", {})
	_check(String((bindings.get("trade", {}) as Dictionary).get("action", "")) == "Dispatch Trade Delegation", "trade_action")
	_check(String((bindings.get("expand", {}) as Dictionary).get("action", "")) == "Commission Basin Survey", "expand_action")
	_check(String((bindings.get("frontier", {}) as Dictionary).get("action", "")) == "Establish Frontier Watch", "frontier_action")
	_check(controller.count("AURELIAN_FIRST_NATIONAL_MANDATE=%s") == 1, "single_event_site")
	_check(controller.contains("not national_mandate_started"), "idempotent_guard")
	_check(controller.contains("village_national_mandate_started"), "village_how_state")
	_check(controller.contains("map_national_mandate_active"), "map_where_state")
	_check(controller.contains("world_national_mandate_underway"), "world_why_state")
	_check(controller.contains("Vector2(354.0, 285.0)"), "greenvale_unchanged")
	_check(controller.contains("Vector2(435.0, 313.0)"), "east_route_locus")
	_check(controller.contains("Vector2(700.0, 205.0)"), "north_ridge_locus")
	_check(controller.contains("Vector2(515.0, 340.0)"), "gilded_crossing_locus")
	_check(persistence.contains("\"national_mandate_started\""), "mandate_persistence")
	_check(persistence.contains("const VERSION := 2"), "schema_v2_compatible")
	for direction in ["trade", "expand", "frontier"]:
		_cleanup()
		var saved := SESSION.save_session("map_national_mandate_active", "east_trade", TEST_PATH, true, true, true, true, true, true, direction, true)
		_check(bool(saved.get("ok", false)), "save_%s_mandate" % direction)
		var restored := SESSION.load_session(TEST_PATH)
		_check(String(restored.get("entry_state", "")) == "map_national_mandate_active", "restore_%s_state" % direction)
		_check(String(restored.get("national_direction", "")) == direction, "restore_%s_direction" % direction)
		_check(bool(restored.get("national_mandate_started", false)), "restore_%s_started" % direction)
	_cleanup()
	var invalid := SESSION.save_session("map_national_mandate_active", "east_trade", TEST_PATH, true, true, true, true, true, true, "none", true)
	_check(String(invalid.get("status", "")) == "invalid_data", "mandate_requires_direction")
	invalid = SESSION.save_session("world_first_nation_founded", "east_trade", TEST_PATH, true, true, true, true, true, true, "trade", true)
	_check(String(invalid.get("status", "")) == "invalid_data", "started_requires_mandate_state")
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
		print("GODOT_AURELIAN_FIRST_NATIONAL_MANDATE_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("GODOT_AURELIAN_FIRST_NATIONAL_MANDATE_V1_TEST_FAILURE: %s" % failure)
	print("GODOT_AURELIAN_FIRST_NATIONAL_MANDATE_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
