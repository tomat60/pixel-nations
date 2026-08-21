extends SceneTree

const WORLD_SCRIPT = preload("res://scenes/aurelian/production_world_v1.gd")
const MANIFEST_PATH := "res://scenes/aurelian/production_world_v1_manifest.json"

var failures: Array[String] = []

func _initialize() -> void:
	var file := FileAccess.open(MANIFEST_PATH, FileAccess.READ)
	if file == null:
		_fail("manifest_open")
		_finish()
		return
	var payload = JSON.parse_string(file.get_as_text())
	if not payload is Dictionary:
		_fail("manifest_parse")
		_finish()
		return
	var manifest := payload as Dictionary
	_check(String(manifest.get("contract", "")) == "PRODUCTION_WORLD_V1", "contract")
	_check(String(manifest.get("source_scene", "")) == "res://scenes/aurelian/production_map_v1.tscn", "source_scene")
	_check(String(manifest.get("shared_geography", "")) == "aurelian_authored_terrain_v1.glb", "shared_geography")
	_check(String(manifest.get("home_region", "")) == "Aurelian Basin", "home_region")

	var semantics: Dictionary = manifest.get("semantics", {})
	for semantic in ["home_region", "trade", "expansion", "frontier_pressure"]:
		_check(semantics.has(semantic), "semantic_%s" % semantic)

	var markers: Array = manifest.get("markers", [])
	_check(markers.size() == 4, "marker_count")
	var ids: Array[String] = []
	var direction_semantics: Array[String] = []
	var direction_shapes: Array[String] = []
	for marker_variant in markers:
		var marker: Dictionary = marker_variant
		var marker_id := String(marker.get("id", ""))
		var semantic := String(marker.get("semantic", ""))
		ids.append(marker_id)
		_check(semantics.has(semantic), "marker_semantic_%s" % marker_id)
		_check((marker.get("topology", []) as Array).size() == 2, "marker_topology_%s" % marker_id)
		_check(float(marker.get("radius", 1.0)) <= 0.38, "restrained_radius_%s" % marker_id)
		if semantic != "home_region":
			direction_semantics.append(semantic)
			direction_shapes.append(String(marker.get("shape", "")))
	_check(direction_semantics.size() == 3, "direction_count")
	_check(_unique_count(direction_semantics) == 3, "direction_semantics_distinct")
	_check(_unique_count(direction_shapes) == 3, "direction_shapes_distinct")

	var states: Dictionary = manifest.get("states", {})
	for state_name in ["neutral", "selected_trade", "all_directions"]:
		_check(states.has(state_name), "state_%s" % state_name)
		if states.has(state_name):
			for visible_id in (states[state_name] as Dictionary).get("visible", []):
				_check(ids.has(String(visible_id)), "state_%s_node_%s" % [state_name, visible_id])
	_check(String((states.get("selected_trade", {}) as Dictionary).get("selected", "")) == "Direction_EastTrade", "selected_trade_identity")
	_check(((states.get("all_directions", {}) as Dictionary).get("visible", []) as Array).size() == 4, "all_directions_visible")

	var expected := {
		"GreenvaleOrigin": [354.0, 285.0],
		"GildedCrossing": [515.0, 340.0],
		"NorthRidge": [700.0, 205.0],
		"ForestWorkEdge": [245.0, 205.0],
		"FieldsPlains": [405.0, 505.0],
		"SouthMarsh": [365.0, 690.0],
		"CoastOutflow": [610.0, 875.0],
		"Northgate": [445.0, 65.0]
	}
	var invariants: Dictionary = manifest.get("transform_invariants", {})
	for key in expected.keys():
		_check(_array_close(invariants.get(key, []), expected[key]), "invariant_%s" % key)
	var bridge_world: Vector3 = WORLD_SCRIPT.topology_to_godot(Vector2(515.0, 340.0), 0.0)
	_check(abs(bridge_world.x - 0.27) < 0.001, "bridge_world_x")
	_check(abs(bridge_world.z - 1.98) < 0.001, "bridge_world_z")
	_finish()

func _unique_count(values: Array[String]) -> int:
	var unique: Dictionary = {}
	for value in values:
		unique[value] = true
	return unique.size()

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
		print("PRODUCTION_WORLD_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("PRODUCTION_WORLD_V1_TEST_FAILURE: %s" % failure)
	print("PRODUCTION_WORLD_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
