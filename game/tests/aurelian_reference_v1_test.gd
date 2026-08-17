extends SceneTree

const REFERENCE = preload("res://scenes/aurelian/reference_v1/aurelian_reference_v1.gd")

var failures: Array[String] = []

func _init() -> void:
	var contract: Dictionary = REFERENCE.topology_contract()
	_check(contract.get("plane", []) == [1000, 900], "coordinate_plane")
	_check(contract.get("river", []).size() == 9, "river_point_count")
	_check(contract.get("bridge_endpoints", []) == [Vector2(455, 340), Vector2(575, 340)], "bridge_endpoints")

	var landmarks: Dictionary = contract.get("landmarks", {})
	_check(landmarks.get("GreenvaleOrigin") == Vector2(354, 285), "greenvale_lock")
	_check(landmarks.get("Bridge_GildedCrossing") == Vector2(515, 340), "bridge_lock")
	_check(landmarks.get("NorthRidge") == Vector2(700, 205), "ridge_lock")
	_check(landmarks.get("SouthMarsh") == Vector2(365, 690), "marsh_lock")
	_check(landmarks.get("CoastOutflow") == Vector2(610, 875), "coast_lock")

	var routes: Dictionary = contract.get("routes", {})
	_check(routes.has("GreenvaleCrossing"), "greenvale_crossing_route")
	_check(routes.has("EastTradeRoute"), "east_trade_route")
	_check(routes.has("NorthRidgeRoute"), "north_ridge_route")
	_check(routes.has("NorthgateRoute"), "northgate_route")
	_check(routes["GreenvaleCrossing"][routes["GreenvaleCrossing"].size() - 1] == Vector2(455, 340), "greenvale_route_bridge_join")
	_check(routes["EastTradeRoute"][0] == Vector2(575, 340), "east_route_bridge_join")

	var cameras: Dictionary = contract.get("cameras", {})
	_check(cameras.size() == 3, "camera_count")
	_check(float(cameras["village"]["size"]) < float(cameras["map"]["size"]), "village_map_lod")
	_check(float(cameras["map"]["size"]) < float(cameras["world"]["size"]), "map_world_lod")

	var greenvale_height: float = REFERENCE.terrain_height_at(Vector2(354, 285))
	var ridge_height: float = REFERENCE.terrain_height_at(Vector2(700, 205))
	var fields_height: float = REFERENCE.terrain_height_at(Vector2(405, 505))
	var marsh_height: float = REFERENCE.terrain_height_at(Vector2(365, 690))
	var river_height: float = REFERENCE.terrain_height_at(Vector2(515, 340))
	_check(ridge_height > greenvale_height + 0.45, "ridge_above_greenvale")
	_check(ridge_height > fields_height + 0.55, "ridge_above_fields")
	_check(marsh_height < greenvale_height, "marsh_below_greenvale")
	_check(river_height < greenvale_height - 0.15, "river_valley_below_greenvale")

	var west_approach: float = REFERENCE.terrain_height_at(Vector2(455, 340))
	var east_approach: float = REFERENCE.terrain_height_at(Vector2(575, 340))
	_check(absf(west_approach - east_approach) < 0.45, "bridge_bank_height_delta")

	_finish()

func _check(condition: bool, label: String) -> void:
	if not condition:
		failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("AURELIAN_REFERENCE_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("AURELIAN_REFERENCE_V1_TEST_FAILURE: %s" % failure)
	print("AURELIAN_REFERENCE_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
