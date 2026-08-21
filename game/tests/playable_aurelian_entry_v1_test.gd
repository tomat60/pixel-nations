extends SceneTree

const MANIFEST_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1_manifest.json"
const PROJECT_PATH := "res://project.godot"
const CONTROLLER_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1.gd"
const PERSISTENCE_PATH := "res://scenes/aurelian/aurelian_session_persistence_v2.gd"

var failures: Array[String] = []

func _initialize() -> void:
	var manifest := _read_json(MANIFEST_PATH)
	_check(String(manifest.get("contract", "")) == "GODOT_PLAYABLE_AURELIAN_ENTRY_V1", "contract")
	_check(String(manifest.get("startup_scene", "")) == "res://scenes/aurelian/playable_aurelian_entry_v1.tscn", "startup_scene")
	_check(String(manifest.get("source_scene", "")) == "res://scenes/aurelian/aurelian_decision_loop_v1.tscn", "source_scene")
	var runtime: Dictionary = manifest.get("runtime_rules", {})
	_check(runtime.get("environment_variables_required", true) == false, "no_environment_requirement")
	_check(runtime.get("frame_driven_transitions", true) == false, "no_frame_driven_runtime")
	_check(runtime.get("session_local_only", true) == false, "restart_continuity")
	_check(runtime.get("persistence_claimed", false) == true, "bounded_persistence_claim")
	var persistence: Dictionary = manifest.get("persistence", {})
	_check(String(persistence.get("schema", "")) == "pixel_nations.aurelian_session", "persistence_schema")
	_check(int(persistence.get("version", 0)) == 2, "persistence_version")
	_check(String(persistence.get("web_key", "")) == "pixel_nations.aurelian_session.v2", "web_key")
	_check(runtime.get("economy_claimed", true) == false, "no_economy_claim")
	var controls: Dictionary = manifest.get("controls", {})
	_check(String(controls.get("select_trade", "")) == "ui_accept", "select_control")
	_check(String(controls.get("continue_layer", "")) == "ui_right", "continue_control")
	_check(String(controls.get("previous_layer", "")) == "ui_left", "back_control")
	_check(manifest.get("forward_path", []) == ["world_neutral", "world_trade_selected", "map_east_route", "village_route_context"], "forward_path")
	_check(manifest.get("backward_path", []) == ["village_route_context", "map_east_route", "world_trade_selected"], "backward_path")

	var project_text := _read_text(PROJECT_PATH)
	_check(project_text.contains('run/main_scene="res://scenes/aurelian/playable_aurelian_entry_v1.tscn"'), "project_entry")
	var controller := _read_text(CONTROLLER_PATH)
	_check(controller.contains("func _unhandled_input(event: InputEvent)"), "input_handler")
	_check(controller.contains('event.is_action_pressed("ui_accept")'), "accept_input")
	_check(controller.contains('event.is_action_pressed("ui_left")'), "back_input")
	_check(controller.contains('Input.parse_input_event(event)'), "qa_uses_input_events")
	_check(controller.contains("SESSION.load_session()"), "loads_session")
	_check(controller.contains("SESSION.save_session(entry_state, restored_intent)"), "saves_session")
	_check(controller.contains("AURELIAN_SESSION_V2_SAVE_ACK"), "save_ack")
	var persistence_source := _read_text(PERSISTENCE_PATH)
	_check(persistence_source.contains('const VERSION := 2'), "helper_version")
	_check(persistence_source.contains("window.localStorage"), "web_adapter")
	_check(not controller.contains("GameState.reduce"), "no_reducer_change")
	_finish()

func _read_json(path: String) -> Dictionary:
	var text := _read_text(path)
	var payload = JSON.parse_string(text)
	if payload is Dictionary:
		return payload as Dictionary
	_fail("json_%s" % path)
	return {}

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
		print("GODOT_PLAYABLE_AURELIAN_ENTRY_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("GODOT_PLAYABLE_AURELIAN_ENTRY_V1_TEST_FAILURE: %s" % failure)
	print("GODOT_PLAYABLE_AURELIAN_ENTRY_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
