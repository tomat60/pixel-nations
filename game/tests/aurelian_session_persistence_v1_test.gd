extends SceneTree

const SESSION = preload("res://scenes/aurelian/aurelian_session_persistence_v1.gd")
const TEST_PATH := "user://aurelian-session-v1-contract-test.json"

var failures: Array[String] = []

func _initialize() -> void:
	_cleanup()
	var missing := SESSION.load_session(TEST_PATH)
	_check(String(missing.get("status", "")) == "missing", "missing_status")
	_check(String(missing.get("entry_state", "")) == "world_neutral", "missing_fallback")

	_check(SESSION.save_session("map_east_route", "east_trade", TEST_PATH) == OK, "save_valid")
	var restored := SESSION.load_session(TEST_PATH)
	_check(String(restored.get("status", "")) == "restored", "restore_status")
	_check(String(restored.get("entry_state", "")) == "map_east_route", "restore_state")
	_check(String(restored.get("selected_intent", "")) == "east_trade", "restore_intent")

	_write_raw("{broken")
	var malformed := SESSION.load_session(TEST_PATH)
	_check(String(malformed.get("status", "")) == "malformed", "malformed_status")
	_check(String(malformed.get("entry_state", "")) == "world_neutral", "malformed_fallback")

	_write_raw(JSON.stringify({
		"schema": SESSION.SCHEMA,
		"version": 99,
		"selected_intent": "east_trade",
		"entry_state": "map_east_route",
		"saved_at_utc": "evidence",
	}))
	var unsupported := SESSION.load_session(TEST_PATH)
	_check(String(unsupported.get("status", "")) == "unsupported_version", "unsupported_status")
	_check(String(unsupported.get("entry_state", "")) == "world_neutral", "unsupported_fallback")

	_check(SESSION.save_session("world_neutral", "east_trade", TEST_PATH) == ERR_INVALID_DATA, "invalid_pair")
	_check(SESSION.save_session("unknown", "none", TEST_PATH) == ERR_INVALID_DATA, "invalid_state")
	_cleanup()
	_finish()

func _write_raw(text: String) -> void:
	var file := FileAccess.open(TEST_PATH, FileAccess.WRITE)
	if file == null:
		_fail("write_raw")
		return
	file.store_string(text)
	file.flush()
	file = null

func _cleanup() -> void:
	for suffix in ["", ".tmp", ".bak"]:
		var path := TEST_PATH + suffix
		if FileAccess.file_exists(path):
			DirAccess.remove_absolute(path)

func _check(condition: bool, label: String) -> void:
	if not condition:
		_fail(label)

func _fail(label: String) -> void:
	failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("GODOT_AURELIAN_SESSION_PERSISTENCE_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("GODOT_AURELIAN_SESSION_PERSISTENCE_V1_TEST_FAILURE: %s" % failure)
	print("GODOT_AURELIAN_SESSION_PERSISTENCE_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
