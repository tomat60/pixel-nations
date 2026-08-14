extends SceneTree

const MANIFEST_PATH := "res://assets/aurelian-basin/export/transform-manifest.json"
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

	_check(String(manifest.get("contract", "")) == "AURELIAN_BASIN_PHASE1_RECOVERY_V1", "contract")
	_check(_array_close(manifest.get("topology_plane", []), [1000.0, 900.0]), "topology_plane")
	_check(abs(float(manifest.get("topology_scale", 0.0)) - 0.12) < 0.00001, "topology_scale")

	var landmarks: Dictionary = manifest.get("landmarks", {})
	for landmark_name in EXPECTED_LANDMARKS.keys():
		_check(landmarks.has(landmark_name), "landmark_%s_present" % landmark_name)
		if landmarks.has(landmark_name):
			_check(_array_close(landmarks[landmark_name].get("topology", []), EXPECTED_LANDMARKS[landmark_name]), "landmark_%s_topology" % landmark_name)

	var river: Array = manifest.get("river_centerline", [])
	_check(river.size() == 9, "river_sample_count")
	for index in range(river.size()):
		var sample: Dictionary = river[index]
		var water_z := float(sample.get("water_z", 9999.0))
		var bank_a_z := float(sample.get("bank_a_z", -9999.0))
		var bank_b_z := float(sample.get("bank_b_z", -9999.0))
		_check(bank_a_z > water_z + 0.15, "river_bank_a_clearance_%d" % index)
		_check(bank_b_z > water_z + 0.15, "river_bank_b_clearance_%d" % index)

	var bridge: Dictionary = manifest.get("bridge", {})
	var endpoints: Array = bridge.get("topology_endpoints", [])
	_check(endpoints.size() == 2, "bridge_endpoint_count")
	if endpoints.size() == 2:
		_check(_array_close(endpoints[0], [455.0, 340.0]), "bridge_west_endpoint")
		_check(_array_close(endpoints[1], [575.0, 340.0]), "bridge_east_endpoint")
	var deck_z := float(bridge.get("deck_z", -9999.0))
	var water_z := float(bridge.get("water_z", 9999.0))
	var west_ground_z := float(bridge.get("west_ground_z", 9999.0))
	var east_ground_z := float(bridge.get("east_ground_z", 9999.0))
	_check(deck_z > water_z + 1.0, "bridge_water_clearance")
	_check(deck_z > west_ground_z, "bridge_west_abutment_height")
	_check(deck_z > east_ground_z, "bridge_east_abutment_height")
	_check(float(bridge.get("west_road_join_gap", 9999.0)) <= 0.05, "bridge_west_road_join")
	_check(float(bridge.get("east_road_join_gap", 9999.0)) <= 0.05, "bridge_east_road_join")

	var cameras: Dictionary = manifest.get("cameras", {})
	_check(cameras.size() == 4, "camera_count")
	for camera_name in ["village", "map", "world", "bridge"]:
		_check(cameras.has(camera_name), "camera_%s" % camera_name)

	var routes: Dictionary = manifest.get("routes", {})
	for route_name in ["GreenvaleBridge", "OldRoad", "EastTradeRoute", "NorthRidgeRoute", "NorthgateRoute"]:
		_check(routes.has(route_name), "route_%s" % route_name)
		if routes.has(route_name):
			_check((routes[route_name] as Array).size() >= 4, "route_%s_points" % route_name)

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
		print("AURELIAN_PHASE1_RECOVERY_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("AURELIAN_PHASE1_RECOVERY_TEST_FAILURE: %s" % failure)
	print("AURELIAN_PHASE1_RECOVERY_TEST: FAIL (%d)" % failures.size())
	quit(1)
