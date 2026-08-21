extends SceneTree

const MAP_SCRIPT = preload("res://scenes/aurelian/production_map_v1.gd")
const MANIFEST_PATH := "res://scenes/aurelian/production_map_v1_manifest.json"

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
	_check(String(manifest.get("contract", "")) == "PRODUCTION_MAP_V1", "contract")
	_check(String(manifest.get("shared_geography", "")) == "aurelian_authored_terrain_v1.glb", "shared_geography")

	var semantics: Dictionary = manifest.get("semantics", {})
	for semantic in ["claimable", "selected", "claimed", "scouted"]:
		_check(semantics.has(semantic), "semantic_%s" % semantic)

	var overlays: Array = manifest.get("overlays", [])
	_check(overlays.size() == 5, "overlay_count")
	var ids: Array[String] = []
	var by_id: Dictionary = {}
	for overlay_variant in overlays:
		var overlay: Dictionary = overlay_variant
		var overlay_id := String(overlay.get("id", ""))
		ids.append(overlay_id)
		by_id[overlay_id] = overlay
		_check(semantics.has(String(overlay.get("semantic", ""))), "overlay_semantic_%s" % overlay_id)
		var topology: Array = overlay.get("topology", [])
		_check(topology.size() == 2, "overlay_topology_%s" % overlay_id)
		_check(float(overlay.get("radius", 1.0)) <= 0.28, "restrained_radius_%s" % overlay_id)

	var states: Dictionary = manifest.get("states", {})
	for state_name in ["no_selection", "selected", "east_route_claimed", "status_distinctions"]:
		_check(states.has(state_name), "state_%s" % state_name)
		if states.has(state_name):
			for visible_id in (states[state_name] as Dictionary).get("visible", []):
				_check(ids.has(String(visible_id)), "state_%s_node_%s" % [state_name, visible_id])
	_check(not ((states.get("no_selection", {}) as Dictionary).get("visible", []) as Array).has("Land_EastRouteSelected"), "no_selection_has_no_selected_marker")
	_check(((states.get("selected", {}) as Dictionary).get("visible", []) as Array).has("Land_EastRouteSelected"), "selected_marker_present")
	_check(((states.get("east_route_claimed", {}) as Dictionary).get("visible", []) as Array).has("Land_EastRouteClaimed"), "claimed_marker_present")
	_check(not ((states.get("east_route_claimed", {}) as Dictionary).get("visible", []) as Array).has("Land_EastRouteSelected"), "claimed_state_hides_selected_marker")
	var selected: Dictionary = by_id.get("Land_EastRouteSelected", {})
	var claimed: Dictionary = by_id.get("Land_EastRouteClaimed", {})
	_check(selected.get("topology", []) == claimed.get("topology", []), "east_route_selected_claimed_topology_parity")
	_check(String(selected.get("shape", "")) == "selected_ring", "east_route_selected_shape")
	_check(String(claimed.get("shape", "")) == "claimed_hex", "east_route_claimed_shape")

	var invariants: Dictionary = manifest.get("transform_invariants", {})
	var expected := {
		"GreenvaleOrigin": [354.0, 285.0],
		"GildedCrossing": [515.0, 340.0],
		"NorthRidge": [700.0, 205.0],
		"ForestWorkEdge": [245.0, 205.0],
		"FieldsPlains": [405.0, 505.0],
		"SouthMarsh": [365.0, 690.0],
		"CoastOutflow": [610.0, 875.0],
		"Northgate": [445.0, 65.0],
	}
	for key in expected.keys():
		_check(_array_close(invariants.get(key, []), expected[key]), "invariant_%s" % key)

	var bridge_world: Vector3 = MAP_SCRIPT.topology_to_godot(Vector2(515.0, 340.0), 0.0)
	_check(abs(bridge_world.x - 0.27) < 0.001, "bridge_world_x")
	_check(abs(bridge_world.z - 1.98) < 0.001, "bridge_world_z")
	_finish()

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
		print("PRODUCTION_MAP_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("PRODUCTION_MAP_V1_TEST_FAILURE: %s" % failure)
	print("PRODUCTION_MAP_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
