extends SceneTree

const MANIFEST_PATH := "res://scenes/aurelian/first_empire_proclamation_v1_manifest.json"
const CONTROLLER_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1.gd"
const PERSISTENCE_PATH := "res://scenes/aurelian/aurelian_session_persistence_v2.gd"
const SESSION = preload("res://scenes/aurelian/aurelian_session_persistence_v2.gd")
const TEST_PATH := "user://aurelian-first-empire-proclamation-v1-test.json"

var failures: Array[String] = []

func _initialize() -> void:
	var manifest := _read_json(MANIFEST_PATH)
	var controller := _read_text(CONTROLLER_PATH)
	var persistence := _read_text(PERSISTENCE_PATH)
	_check(String(manifest.get("contract", "")) == "GODOT_AURELIAN_FIRST_EMPIRE_PROCLAMATION_V1", "contract")
	_check(int(manifest.get("issue", 0)) == 518, "issue")
	_check(String(manifest.get("action", "")) == "Proclaim Aurelian Empire", "action")
	_check(controller.count("AURELIAN_FIRST_EMPIRE_PROCLAMATION=AURELIAN") == 1, "single_event_site")
	_check(controller.contains("not empire_proclaimed"), "idempotent_guard")
	for state in ["village_aurelian_imperial_capital", "map_aurelian_imperial_heartland", "world_first_empire_proclaimed"]:
		_check(controller.contains(state), "controller_%s" % state)
	_check(controller.contains("Vector2(354.0, 285.0)"), "greenvale_unchanged")
	_check(controller.contains("Vector2(435.0, 313.0)"), "east_route_unchanged")
	_check(controller.contains("Vector2(700.0, 205.0)"), "north_ridge_unchanged")
	_check(controller.contains("Vector2(515.0, 340.0)"), "gilded_crossing_unchanged")
	_check(persistence.contains("\"empire_proclaimed\""), "empire_persistence")
	_check(persistence.contains("const VERSION := 2"), "schema_v2_compatible")
	for direction_variant in ["trade", "expand", "frontier"]:
		var direction := String(direction_variant)
		for state_variant in ["village_aurelian_imperial_capital", "map_aurelian_imperial_heartland", "world_first_empire_proclaimed"]:
			var state := String(state_variant)
			_cleanup()
			var saved := SESSION.save_session(state, "east_trade", TEST_PATH, true, true, true, true, true, true, direction, true, true)
			_check(bool(saved.get("ok", false)), "save_%s_%s" % [direction, state])
			var restored := SESSION.load_session(TEST_PATH)
			_check(String(restored.get("entry_state", "")) == state, "restore_%s_%s" % [direction, state])
			_check(String(restored.get("national_direction", "")) == direction, "direction_%s_%s" % [direction, state])
			_check(bool(restored.get("national_mandate_started", false)), "mandate_%s_%s" % [direction, state])
			_check(bool(restored.get("empire_proclaimed", false)), "empire_%s_%s" % [direction, state])
	_cleanup()
	var invalid := SESSION.save_session("village_aurelian_imperial_capital", "east_trade", TEST_PATH, true, true, true, true, true, true, "trade", false, true)
	_check(String(invalid.get("status", "")) == "invalid_data", "empire_requires_mandate")
	invalid = SESSION.save_session("village_national_mandate_started", "east_trade", TEST_PATH, true, true, true, true, true, true, "trade", true, true)
	_check(String(invalid.get("status", "")) == "invalid_data", "empire_requires_empire_state")
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
		print("GODOT_AURELIAN_FIRST_EMPIRE_PROCLAMATION_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("GODOT_AURELIAN_FIRST_EMPIRE_PROCLAMATION_V1_TEST_FAILURE: %s" % failure)
	print("GODOT_AURELIAN_FIRST_EMPIRE_PROCLAMATION_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
