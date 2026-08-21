extends SceneTree

const DECISION_SCRIPT = preload("res://scenes/aurelian/aurelian_decision_loop_v1.gd")
const DECISION_MANIFEST_PATH := "res://scenes/aurelian/aurelian_decision_loop_v1_manifest.json"
const WORLD_MANIFEST_PATH := "res://scenes/aurelian/production_world_v1_manifest.json"
const MAP_MANIFEST_PATH := "res://scenes/aurelian/production_map_v1_manifest.json"
const VILLAGE_MANIFEST_PATH := "res://scenes/aurelian/production_village_v1_state_manifest.json"

var failures: Array[String] = []

func _initialize() -> void:
	var decision := _read_json(DECISION_MANIFEST_PATH, "decision")
	var world := _read_json(WORLD_MANIFEST_PATH, "world")
	var map := _read_json(MAP_MANIFEST_PATH, "map")
	var village := _read_json(VILLAGE_MANIFEST_PATH, "village")
	if decision.is_empty() or world.is_empty() or map.is_empty() or village.is_empty():
		_finish()
		return

	_check(String(decision.get("contract", "")) == "AURELIAN_DECISION_LOOP_V1", "contract")
	_check(String(decision.get("source_scene", "")) == "res://scenes/aurelian/aurelian_decision_loop_v1.tscn", "source_scene")
	_check(String(decision.get("shared_geography", "")) == "aurelian_authored_terrain_v1.glb", "shared_geography")

	var handoff: Dictionary = decision.get("handoff", {})
	_check(String(handoff.get("world_marker", "")) == "Direction_EastTrade", "world_handoff")
	_check(String(handoff.get("map_marker", "")) == "Land_EastRouteSelected", "map_handoff")
	_check(String(handoff.get("village_state", "")) == "developed", "village_handoff")
	_check(String(handoff.get("crossing", "")) == "GildedCrossing", "crossing_handoff")

	var world_ids: Array[String] = []
	for marker_variant in (world.get("markers", []) as Array):
		world_ids.append(String((marker_variant as Dictionary).get("id", "")))
	var map_ids: Array[String] = []
	for overlay_variant in (map.get("overlays", []) as Array):
		map_ids.append(String((overlay_variant as Dictionary).get("id", "")))
	_check(world_ids.has(String(handoff.get("world_marker", ""))), "world_marker_exists")
	_check(map_ids.has(String(handoff.get("map_marker", ""))), "map_marker_exists")
	_check((village.get("states", {}) as Dictionary).has(String(handoff.get("village_state", ""))), "village_state_exists")

	var states: Dictionary = decision.get("states", {})
	for state_name in [
		"world_neutral",
		"world_trade_selected",
		"map_east_route",
		"village_route_context",
		"map_regression",
		"village_regression",
	]:
		_check(states.has(state_name), "state_%s" % state_name)
	_check(String((states.get("world_trade_selected", {}) as Dictionary).get("world_state", "")) == "selected_trade", "selected_world_state")
	_check(String((states.get("map_east_route", {}) as Dictionary).get("map_state", "")) == "selected", "selected_map_state")
	_check(bool((states.get("village_route_context", {}) as Dictionary).get("context_visible", false)), "village_context_visible")
	_check(not bool((states.get("village_regression", {}) as Dictionary).get("context_visible", true)), "village_regression_clean")

	var route: Dictionary = decision.get("route_context", {})
	_check(String(route.get("id", "")) == "GreenvaleTradeRouteContext", "route_id")
	_check(_array_close(route.get("from_topology", []), [354.0, 285.0]), "route_origin")
	_check(_array_close(route.get("to_topology", []), [515.0, 340.0]), "route_crossing")
	_check(float(route.get("width", 1.0)) <= 0.12, "route_restrained")

	var decision_invariants: Dictionary = decision.get("transform_invariants", {})
	var world_invariants: Dictionary = world.get("transform_invariants", {})
	var map_invariants: Dictionary = map.get("transform_invariants", {})
	for key in decision_invariants.keys():
		_check(_array_close(decision_invariants[key], world_invariants.get(key, [])), "world_invariant_%s" % key)
		_check(_array_close(decision_invariants[key], map_invariants.get(key, [])), "map_invariant_%s" % key)

	var bridge_world: Vector3 = DECISION_SCRIPT.topology_to_godot(Vector2(515.0, 340.0), 0.0)
	_check(abs(bridge_world.x - 0.27) < 0.001, "bridge_world_x")
	_check(abs(bridge_world.z - 1.98) < 0.001, "bridge_world_z")
	_finish()

func _read_json(path: String, label: String) -> Dictionary:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		_fail("%s_manifest_open" % label)
		return {}
	var payload = JSON.parse_string(file.get_as_text())
	if not payload is Dictionary:
		_fail("%s_manifest_parse" % label)
		return {}
	return payload as Dictionary

func _array_close(actual, expected: Array, epsilon := 0.001) -> bool:
	if not actual is Array or actual.size() != expected.size():
		return false
	for index in range(expected.size()):
		if abs(float(actual[index]) - float(expected[index])) > epsilon:
			return false
	return true

func _check(condition: bool, label: String) -> void:
	if not condition:
		_fail(label)

func _fail(label: String) -> void:
	failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("AURELIAN_DECISION_LOOP_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("AURELIAN_DECISION_LOOP_V1_TEST_FAILURE: %s" % failure)
	print("AURELIAN_DECISION_LOOP_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
