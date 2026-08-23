extends SceneTree

const SESSION = preload("res://scenes/aurelian/aurelian_session_persistence_v2.gd")
const TEST_PATH := "user://aurelian-session-v2-contract-test.json"
const SOURCE_PATH := "res://scenes/aurelian/aurelian_session_persistence_v2.gd"

var failures: Array[String] = []

func _initialize() -> void:
	_cleanup()
	var missing := SESSION.load_session(TEST_PATH)
	_check(String(missing.get("status", "")) == "missing", "missing_status")
	_check(String(missing.get("entry_state", "")) == "world_neutral", "missing_fallback")

	var save_result := SESSION.save_session("map_east_route_claimed", "east_trade", TEST_PATH)
	_check(bool(save_result.get("ok", false)), "save_claimed_valid")
	_check(String(save_result.get("adapter", "")) == "native_file_access", "native_adapter")
	var restored := SESSION.load_session(TEST_PATH)
	_check(String(restored.get("status", "")) == "restored", "restore_status")
	_check(String(restored.get("entry_state", "")) == "map_east_route_claimed", "restore_claimed_state")
	_check(String(restored.get("selected_intent", "")) == "east_trade", "restore_intent")

	save_result = SESSION.save_session("village_claimed", "east_trade", TEST_PATH)
	_check(bool(save_result.get("ok", false)), "save_village_claimed_valid")
	restored = SESSION.load_session(TEST_PATH)
	_check(String(restored.get("entry_state", "")) == "village_claimed", "restore_village_claimed")

	_write_raw("{broken")
	var malformed := SESSION.load_session(TEST_PATH)
	_check(String(malformed.get("status", "")) == "malformed", "malformed_status")
	_check(String(malformed.get("entry_state", "")) == "world_neutral", "malformed_fallback")

	_write_raw(JSON.stringify({
		"schema": SESSION.SCHEMA,
		"version": 99,
		"selected_intent": "east_trade",
		"entry_state": "map_east_route_claimed",
		"saved_at_utc": "evidence",
	}))
	var unsupported := SESSION.load_session(TEST_PATH)
	_check(String(unsupported.get("status", "")) == "unsupported_version", "unsupported_status")
	_check(String(unsupported.get("entry_state", "")) == "world_neutral", "unsupported_fallback")

	var invalid := SESSION.save_session("world_neutral", "east_trade", TEST_PATH)
	_check(String(invalid.get("status", "")) == "invalid_data", "invalid_pair")
	invalid = SESSION.save_session("unknown", "none", TEST_PATH)
	_check(String(invalid.get("status", "")) == "invalid_data", "invalid_state")

	var transport := "quote\" slash\\ newline\n unicode Ł"
	var literal := SESSION.javascript_string_literal(transport)
	_check(String(JSON.parse_string(literal)) == transport, "transport_literal")

	var source := _read_text(SOURCE_PATH)
	_check(source.contains('const VERSION := 2'), "schema_version_stays_v2")
	_check(source.contains('"map_east_route_selected"'), "selected_state_allowed")
	_check(source.contains('"map_east_route_claimed"'), "claimed_state_allowed")
	_check(source.contains('"village_claimed"'), "village_claimed_state_allowed")
	_check(source.contains("window.localStorage"), "web_local_storage")
	_check(source.contains(".setItem("), "web_set")
	_check(source.contains(".getItem("), "web_get")
	_check(source.contains(".removeItem("), "web_probe_cleanup")
	_check(source.contains("catch(e)"), "web_exception_guard")
	_check(source.contains("javascript_string_literal(payload_text)"), "payload_escaped")
	_check(not source.contains("FS.syncfs"), "no_idbfs_internal")
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
		var path: String = TEST_PATH + String(suffix)
		if FileAccess.file_exists(path):
			DirAccess.remove_absolute(path)

func _read_text(path: String) -> String:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		_fail("open_%s" % path)
		return ""
	return file.get_as_text()

func _check(condition: bool, label: String) -> void:
	if not condition:
		_fail(label)

func _fail(label: String) -> void:
	failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("GODOT_AURELIAN_SESSION_PERSISTENCE_V2_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("GODOT_AURELIAN_SESSION_PERSISTENCE_V2_TEST_FAILURE: %s" % failure)
	print("GODOT_AURELIAN_SESSION_PERSISTENCE_V2_TEST: FAIL (%d)" % failures.size())
	quit(1)
