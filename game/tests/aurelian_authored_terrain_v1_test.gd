extends SceneTree

const MANIFEST_PATH := "res://assets/aurelian-basin/export/transform-manifest.json"
const REFERENCE_SCRIPT := preload("res://scenes/aurelian/aurelian_authored_terrain_v1.gd")
const EXPECTED_LANDMARKS := {
	"GreenvaleOrigin": [354.0, 285.0],
	"Bridge_GildedCrossing": [515.0, 340.0],
	"NorthRidge": [700.0, 205.0],
	"ForestWorkEdge": [245.0, 205.0],
	"FieldsPlains": [405.0, 505.0],
	"OldRoadJunction": [425.0, 405.0],
	"EastRoute": [760.0, 410.0],
	"SouthMarsh": [365.0, 690.0],
	"CoastOutflow": [610.0, 875.0],
	"Northgate": [445.0, 65.0],
}

var failures: Array[String] = []

func _init() -> void:
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

	_check(String(manifest.get("contract", "")) == "AURELIAN_AUTHORED_TERRAIN_V1", "contract")
	_check(_array_close(manifest.get("topology_plane", []), [1000.0, 900.0]), "topology_plane")
	_check(int(manifest.get("extended_outflow_y", 0)) == 1015, "extended_outflow")
	_check(bool(manifest.get("rectangular_outer_water_plane", true)) == false, "no_rectangular_outer_water")
	_check(bool(manifest.get("runtime_generated_terrain", true)) == false, "authored_not_runtime_terrain")
	_check(String(manifest.get("kaykit_source_commit", "")) == "84fa4e91af6a88989be7c99e0891cede11f2ca38", "kaykit_pin")
	_check(int(manifest.get("terrain_face_cells", 0)) >= 6200, "terrain_coverage")

	var landmarks: Dictionary = manifest.get("landmarks", {})
	for landmark_name in EXPECTED_LANDMARKS.keys():
		_check(landmarks.has(landmark_name), "landmark_%s_present" % landmark_name)
		if landmarks.has(landmark_name):
			_check(_array_close(landmarks[landmark_name], EXPECTED_LANDMARKS[landmark_name]), "landmark_%s_topology" % landmark_name)

	var river: Array = manifest.get("river_centerline", [])
	_check(river.size() == 9, "canonical_river_count")
	if river.size() == 9:
		_check(_array_close(river[0], [505.0, 0.0]), "river_north_start")
		_check(_array_close(river[8], [610.0, 900.0]), "river_coast_outflow")

	var outflow: Array = manifest.get("outflow_extension", [])
	_check(outflow.size() >= 2, "outflow_extension_count")
	if outflow.size() >= 2:
		_check(_array_close(outflow[0], [610.0, 900.0]), "outflow_starts_at_coast")
		_check(float((outflow[-1] as Array)[1]) > 900.0, "outflow_extends_beyond_basin")

	var bridge: Dictionary = manifest.get("bridge", {})
	_check(_array_close(bridge.get("center", []), [515.0, 340.0]), "bridge_center")
	var endpoints: Array = bridge.get("endpoints", [])
	_check(endpoints.size() == 2, "bridge_endpoint_count")
	if endpoints.size() == 2:
		_check(_array_close(endpoints[0], [455.0, 340.0]), "bridge_west_endpoint")
		_check(_array_close(endpoints[1], [575.0, 340.0]), "bridge_east_endpoint")
	_check(String(bridge.get("asset", "")).ends_with("building_bridge_A.gltf"), "bridge_uses_kaykit_asset")

	var routes: Dictionary = manifest.get("routes", {})
	for route_name in ["GreenvaleCrossing", "OldRoad", "EastTradeRoute", "NorthRidgeRoute", "NorthgateRoute"]:
		_check(routes.has(route_name), "route_%s" % route_name)
		if routes.has(route_name):
			_check((routes[route_name] as Array).size() >= 4, "route_%s_points" % route_name)

	var outline: Array = manifest.get("basin_outline", [])
	_check(outline.size() >= 12, "irregular_basin_outline")

	var bridge_world: Vector3 = REFERENCE_SCRIPT.topology_to_godot(Vector2(515.0, 340.0), 0.0)
	_check(abs(bridge_world.x - 0.27) < 0.001, "coordinate_bridge_x")
	_check(abs(bridge_world.z - 1.98) < 0.001, "coordinate_bridge_z")
	var north_world: Vector3 = REFERENCE_SCRIPT.topology_to_godot(Vector2(445.0, 65.0), 0.0)
	var coast_world: Vector3 = REFERENCE_SCRIPT.topology_to_godot(Vector2(610.0, 875.0), 0.0)
	_check(north_world.z > bridge_world.z, "coordinate_north_is_positive_z")
	_check(coast_world.z < bridge_world.z, "coordinate_coast_is_negative_z")
	_finish()

func _array_close(actual, expected: Array, epsilon: float = 0.001) -> bool:
	if not actual is Array:
		return false
	if actual.size() != expected.size():
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
		print("AURELIAN_AUTHORED_TERRAIN_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("AURELIAN_AUTHORED_TERRAIN_V1_TEST_FAILURE: %s" % failure)
	print("AURELIAN_AUTHORED_TERRAIN_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
