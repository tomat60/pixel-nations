extends SceneTree

const MANIFEST_PATH := "res://scenes/aurelian/aurelian_first_trade_route_connection_v1_manifest.json"
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

	_check(String(manifest.get("schema", "")) == "pixel-nations.aurelian.first-trade-route-connection.v1", "schema")
	var authority: Dictionary = manifest.get("authority", {})
	_check(int(authority.get("issue", 0)) == 490, "issue")
	var states: Dictionary = manifest.get("states", {})
	_check(String(states.get("entry", "")) == "village_developed", "developed_entry")
	_check(String(states.get("map_before", "")) == "map_east_route_claimed", "claimed_before")
	_check(String(states.get("map_after", "")) == "map_east_route_connected", "connected_after")
	_check(String(states.get("world_after", "")) == "world_trade_route_active", "world_active")
	_check(String(states.get("village_reopen", "")) == "village_developed", "village_reopen")

	var action: Dictionary = manifest.get("action", {})
	_check(String(action.get("label", "")) == "Connect East Route", "action_label")
	_check(String(action.get("event", "")) == "AURELIAN_FIRST_TRADE_ROUTE_CONNECTION=EAST_ROUTE", "action_event")
	_check(bool(action.get("explicit_only", false)), "explicit_only")

	var topology: Dictionary = manifest.get("shared_topology", {})
	_check(String(topology.get("route_id", "")) == "GreenvaleTradeRouteContext", "route_id")
	var from_spec: Dictionary = topology.get("from", {})
	var to_spec: Dictionary = topology.get("to", {})
	_check(from_spec.get("point", []) == [354, 285], "greenvale_topology")
	_check(to_spec.get("point", []) == [515, 340], "gilded_crossing_topology")
	_check(topology.get("new_geography", true) == false, "no_new_geography")
	var route_context: Dictionary = decision.get("route_context", {})
	_check(route_context.get("from_topology", []) == [354, 285], "shared_from_parity")
	_check(route_context.get("to_topology", []) == [515, 340], "shared_to_parity")

	var forward_path: Array = playable.get("forward_path", [])
	_check(forward_path.has("map_east_route_connected"), "playable_connected")
	_check(forward_path.has("world_trade_route_active"), "playable_world_active")
	_check(controller.contains("Connect East Route"), "connect_hud")
	_check(controller.contains('_apply_entry_state("map_east_route_connected")'), "explicit_connect_transition")
	_check(controller.contains('_apply_entry_state("world_trade_route_active")'), "world_consequence")
	_check(controller.contains("AURELIAN_FIRST_TRADE_ROUTE_CONNECTION=EAST_ROUTE"), "connection_event")
	_check(controller.count("AURELIAN_FIRST_TRADE_ROUTE_CONNECTION=EAST_ROUTE") == 1, "event_single_action_site")
	_check(persistence.contains('"map_east_route_connected"'), "connected_state_persisted")
	_check(persistence.contains('"world_trade_route_active"'), "world_active_persisted")
	_check(persistence.contains('"route_connected"'), "connected_flag_persisted")
	_check(persistence.contains("const VERSION := 2"), "schema_version_2")
	_finish()

func _read_json(path: String) -> Dictionary:
	var payload = JSON.parse_string(_read_text(path))
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
		print("GODOT_AURELIAN_FIRST_TRADE_ROUTE_CONNECTION_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("GODOT_AURELIAN_FIRST_TRADE_ROUTE_CONNECTION_V1_TEST_FAILURE: %s" % failure)
	print("GODOT_AURELIAN_FIRST_TRADE_ROUTE_CONNECTION_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
