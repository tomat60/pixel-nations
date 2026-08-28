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
	_check(runtime.get("claim_is_explicit_player_action", false) == true, "explicit_claim_action")
	_check(runtime.get("founding_is_explicit_player_action", false) == true, "explicit_founding_action")
	_check(runtime.get("opening_village_does_not_found", false) == true, "opening_does_not_found")
	_check(runtime.get("development_is_explicit_player_action", false) == true, "explicit_development_action")
	_check(runtime.get("opening_village_does_not_develop", false) == true, "opening_does_not_develop")
	var persistence: Dictionary = manifest.get("persistence", {})
	_check(String(persistence.get("schema", "")) == "pixel_nations.aurelian_session", "persistence_schema")
	_check(int(persistence.get("version", 0)) == 2, "persistence_version")
	_check(String(persistence.get("web_key", "")) == "pixel_nations.aurelian_session.v2", "web_key")
	_check(runtime.get("economy_claimed", true) == false, "no_economy_claim")
	var controls: Dictionary = manifest.get("controls", {})
	_check(String(controls.get("select_trade", "")) == "ui_accept", "select_control")
	_check(String(controls.get("open_map", "")) == "ui_right", "open_map_control")
	_check(String(controls.get("claim_land", "")) == "ui_accept", "claim_control")
	_check(String(controls.get("open_village", "")) == "ui_right", "open_village_control")
	_check(String(controls.get("found_settlement", "")) == "ui_accept", "found_control")
	_check(String(controls.get("develop_settlement", "")) == "ui_accept", "develop_control")
	_check(String(controls.get("connect_trade_route", "")) == "ui_accept", "connect_control")
	_check(String(controls.get("dispatch_first_caravan", "")) == "ui_accept", "dispatch_control")
	_check(String(controls.get("charter_greenvale", "")) == "ui_accept", "charter_control")
	_check(String(controls.get("previous_layer", "")) == "ui_left", "back_control")
	var forward_path: Array = manifest.get("forward_path", [])
	_check(forward_path.slice(0, 5) == ["world_neutral", "world_trade_selected", "map_east_route_selected", "map_east_route_claimed", "village_claimed"], "forward_claim_prefix")
	_check(forward_path.has("village_founded"), "forward_founded")
	_check(forward_path.has("village_developed"), "forward_developed")
	_check(forward_path.has("map_east_route_connected"), "forward_connected_map")
	_check(forward_path.has("world_trade_route_active"), "forward_active_world")
	_check(forward_path.has("village_trade_dispatched"), "forward_dispatched_village")
	_check(forward_path.has("map_east_route_in_use"), "forward_route_in_use")
	_check(forward_path.has("world_first_trade_underway"), "forward_trade_underway")
	_check(forward_path.has("village_city_chartered"), "forward_city_village")
	_check(forward_path.has("map_greenvale_city"), "forward_city_map")
	_check(forward_path.has("world_first_city_recognized"), "forward_city_world")
	_check(forward_path.has("world_first_nation_founded"), "forward_nation_world")
	_check(forward_path.has("map_aurelian_homeland"), "forward_nation_map")
	_check(forward_path.has("village_greenvale_capital"), "forward_nation_village")
	var backward_path: Array = manifest.get("backward_path", [])
	_check(backward_path.has("map_east_route_connected"), "backward_connected_map")
	_check(backward_path.has("world_trade_route_active"), "backward_active_world")
	_check(backward_path.has("map_east_route_in_use"), "backward_route_in_use")
	_check(backward_path.has("world_first_trade_underway"), "backward_trade_underway")
	_check(backward_path.has("village_city_chartered"), "backward_city_village")
	_check(backward_path.has("map_greenvale_city"), "backward_city_map")
	_check(backward_path.has("world_first_city_recognized"), "backward_city_world")

	var project_text := _read_text(PROJECT_PATH)
	_check(project_text.contains('run/main_scene="res://scenes/aurelian/playable_aurelian_entry_v1.tscn"'), "project_entry")
	var controller := _read_text(CONTROLLER_PATH)
	_check(controller.contains("func _unhandled_input(event: InputEvent)"), "input_handler")
	_check(controller.contains("func _accept_entry()"), "accept_handler")
	_check(controller.contains("func _right_entry()"), "right_handler")
	_check(controller.contains('event.is_action_pressed("ui_accept")'), "accept_input")
	_check(controller.contains('event.is_action_pressed("ui_right")'), "right_input")
	_check(controller.contains('event.is_action_pressed("ui_left")'), "back_input")
	_check(controller.contains('"map_east_route_selected"'), "selected_state")
	_check(controller.contains('"map_east_route_claimed"'), "claimed_state")
	_check(controller.contains('"village_claimed"'), "village_claimed_state")
	_check(controller.contains('"village_founded"'), "village_founded_state")
	_check(controller.contains('"village_developed"'), "village_developed_state")
	_check(controller.contains('"map_east_route_connected"'), "map_connected_state")
	_check(controller.contains('"world_trade_route_active"'), "world_active_state")
	_check(controller.contains('"village_trade_dispatched"'), "village_dispatched_state")
	_check(controller.contains('"map_east_route_in_use"'), "map_in_use_state")
	_check(controller.contains('"world_first_trade_underway"'), "world_underway_state")
	_check(controller.contains('"village_city_chartered"'), "city_village_state")
	_check(controller.contains('"map_greenvale_city"'), "city_map_state")
	_check(controller.contains('"world_first_city_recognized"'), "city_world_state")
	_check(controller.contains("Claim East Route"), "claim_hud")
	_check(controller.contains("Found Greenvale"), "found_hud")
	_check(controller.contains("Develop Greenvale"), "develop_hud")
	_check(controller.contains("AURELIAN_FIRST_LAND_CLAIM=EAST_ROUTE"), "claim_event")
	_check(controller.contains("AURELIAN_FIRST_SETTLEMENT_FOUNDING=GREENVALE"), "found_event")
	_check(controller.contains("AURELIAN_FIRST_SETTLEMENT_DEVELOPMENT=GREENVALE"), "develop_event")
	_check(controller.contains("AURELIAN_FIRST_TRADE_ROUTE_CONNECTION=EAST_ROUTE"), "connect_event")
	_check(controller.contains("Dispatch First Caravan"), "dispatch_hud")
	_check(controller.contains("AURELIAN_FIRST_TRADE_CARAVAN_DISPATCH=EAST_ROUTE"), "dispatch_event")
	_check(controller.count("AURELIAN_FIRST_TRADE_CARAVAN_DISPATCH=EAST_ROUTE") == 1, "dispatch_event_single_site")
	_check(controller.contains("Charter Greenvale"), "charter_hud")
	_check(controller.count("AURELIAN_FIRST_CITY_CHARTER=GREENVALE") == 1, "charter_event_single_site")
	_check(controller.contains('Input.parse_input_event(event)'), "qa_uses_input_events")
	_check(controller.contains("SESSION.load_session()"), "loads_session")
	_check(controller.contains("SESSION.save_session(entry_state, restored_intent, SESSION.NATIVE_PATH, settlement_founded, settlement_developed, route_connected, caravan_dispatched, city_chartered, nation_founded, committed_direction, national_mandate_started, empire_proclaimed, imperial_crisis, imperial_crisis_response, first_rival_countermove_response)"), "saves_session")
	_check(controller.contains("AURELIAN_SESSION_V2_SAVE_ACK"), "save_ack")
	var persistence_source := _read_text(PERSISTENCE_PATH)
	_check(persistence_source.contains('const VERSION := 2'), "helper_version")
	_check(persistence_source.contains('"map_east_route_claimed"'), "persist_claimed_state")
	_check(persistence_source.contains('"village_founded"'), "persist_founded_state")
	_check(persistence_source.contains('"settlement_founded"'), "persist_founded_flag")
	_check(persistence_source.contains('"village_developed"'), "persist_developed_state")
	_check(persistence_source.contains('"settlement_developed"'), "persist_developed_flag")
	_check(persistence_source.contains('"map_east_route_connected"'), "persist_connected_map")
	_check(persistence_source.contains('"world_trade_route_active"'), "persist_active_world")
	_check(persistence_source.contains('"route_connected"'), "persist_connected_flag")
	_check(persistence_source.contains('"city_chartered"'), "persist_city_flag")
	_check(persistence_source.contains('"map_greenvale_city"'), "persist_city_map")
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
