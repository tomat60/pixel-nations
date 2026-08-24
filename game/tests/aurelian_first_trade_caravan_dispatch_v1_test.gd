extends SceneTree

const MANIFEST_PATH := "res://scenes/aurelian/aurelian_first_trade_caravan_dispatch_v1_manifest.json"
const PLAYABLE_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1_manifest.json"
const CONTROLLER_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1.gd"
const PERSISTENCE_PATH := "res://scenes/aurelian/aurelian_session_persistence_v2.gd"
const DECISION_PATH := "res://scenes/aurelian/aurelian_decision_loop_v1_manifest.json"

var failures: Array[String] = []

func _initialize() -> void:
	var manifest := _read_json(MANIFEST_PATH)
	var playable := _read_json(PLAYABLE_PATH)
	var decision := _read_json(DECISION_PATH)
	var controller := _read_text(CONTROLLER_PATH)
	var persistence := _read_text(PERSISTENCE_PATH)
	_check(String(manifest.get("schema", "")) == "pixel-nations.aurelian.first-trade-caravan-dispatch.v1", "schema")
	var authority: Dictionary = manifest.get("authority", {})
	_check(int(authority.get("issue", 0)) == 494, "issue")
	var states: Dictionary = manifest.get("states", {})
	_check(String(states.get("entry", "")) == "world_trade_route_active", "active_entry")
	_check(String(states.get("village_before", "")) == "village_developed", "developed_action")
	_check(String(states.get("village_after", "")) == "village_trade_dispatched", "dispatched_village")
	_check(String(states.get("map_after", "")) == "map_east_route_in_use", "route_in_use")
	_check(String(states.get("world_after", "")) == "world_first_trade_underway", "trade_underway")
	var action: Dictionary = manifest.get("action", {})
	_check(String(action.get("label", "")) == "Dispatch First Caravan", "action_label")
	_check(String(action.get("event", "")) == "AURELIAN_FIRST_TRADE_CARAVAN_DISPATCH=EAST_ROUTE", "action_event")
	_check(bool(action.get("explicit_only", false)), "explicit_only")
	var topology: Dictionary = manifest.get("shared_topology", {})
	var from_spec: Dictionary = topology.get("from", {})
	var to_spec: Dictionary = topology.get("to", {})
	var token: Dictionary = topology.get("caravan_token", {})
	_check(_topology_is(from_spec.get("point", []), 354.0, 285.0), "greenvale_topology")
	_check(_topology_is(to_spec.get("point", []), 515.0, 340.0), "crossing_topology")
	_check(_topology_is(token.get("point", []), 435.0, 313.0), "token_topology")
	_check(int(token.get("count", 0)) == 1, "single_token")
	_check(token.get("animated", true) == false, "static_token")
	_check(topology.get("new_geography", true) == false, "no_new_geography")
	var route_context: Dictionary = decision.get("route_context", {})
	_check(_topology_is(route_context.get("from_topology", []), 354.0, 285.0), "shared_from_parity")
	_check(_topology_is(route_context.get("to_topology", []), 515.0, 340.0), "shared_to_parity")
	var forward_path: Array = playable.get("forward_path", [])
	_check(forward_path.has("village_trade_dispatched"), "playable_dispatch")
	_check(forward_path.has("map_east_route_in_use"), "playable_route_in_use")
	_check(forward_path.has("world_first_trade_underway"), "playable_trade_underway")
	_check(controller.contains("Dispatch First Caravan"), "dispatch_hud")
	_check(controller.contains('_apply_entry_state("village_trade_dispatched")'), "explicit_dispatch_transition")
	_check(controller.contains('_apply_entry_state("map_east_route_in_use")'), "map_consequence")
	_check(controller.contains('_apply_entry_state("world_first_trade_underway")'), "world_consequence")
	_check(controller.count("AURELIAN_FIRST_TRADE_CARAVAN_DISPATCH=EAST_ROUTE") == 1, "event_single_action_site")
	_check(controller.contains("Vector2(435.0, 313.0)"), "token_point_runtime")
	_check(persistence.contains('"caravan_dispatched"'), "dispatch_flag_persisted")
	_check(persistence.contains('"map_east_route_in_use"'), "route_in_use_persisted")
	_check(persistence.contains('"world_first_trade_underway"'), "underway_persisted")
	_check(persistence.contains("const VERSION := 2"), "schema_version_2")
	_finish()

func _topology_is(value, x: float, y: float, epsilon := 0.001) -> bool:
	if not value is Array or value.size() != 2:
		return false
	return abs(float(value[0]) - x) <= epsilon and abs(float(value[1]) - y) <= epsilon

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

func _check(condition: bool, label: String) -> void:
	if not condition:
		failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("GODOT_AURELIAN_FIRST_TRADE_CARAVAN_DISPATCH_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("GODOT_AURELIAN_FIRST_TRADE_CARAVAN_DISPATCH_V1_TEST_FAILURE: %s" % failure)
	print("GODOT_AURELIAN_FIRST_TRADE_CARAVAN_DISPATCH_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
