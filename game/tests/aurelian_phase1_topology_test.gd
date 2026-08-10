extends SceneTree

const Phase1 = preload("res://scenes/aurelian/phase1_shared_geography.gd")

func _init() -> void:
	var contract: Dictionary = Phase1.topology_contract()
	_assert(contract["plane"] == [1000, 900], "canonical plane drift")

	var landmarks: Dictionary = contract["landmarks"]
	_assert(landmarks["GreenvaleOrigin"] == Vector2(354, 285), "Greenvale drift")
	_assert(landmarks["Bridge_GildedCrossing"] == Vector2(515, 340), "bridge center drift")
	_assert(landmarks["NorthRidge"] == Vector2(700, 205), "North Ridge drift")
	_assert(landmarks["ForestWorkEdge"] == Vector2(245, 205), "forest edge drift")
	_assert(landmarks["FieldsPlains"] == Vector2(405, 505), "fields drift")

	var endpoints: Array = contract["bridge_endpoints"]
	var bridge_vector: Vector2 = (endpoints[1] - endpoints[0]).normalized()
	_assert(abs(bridge_vector.y) < 0.001, "bridge must remain east-west")

	var river: Array = contract["river"]
	var local_river_vector: Vector2 = (river[4] - river[2]).normalized()
	_assert(abs(bridge_vector.dot(local_river_vector)) < 0.25, "bridge must remain approximately perpendicular to local river flow")

	var greenvale_world := Phase1.topology_to_world_point(landmarks["GreenvaleOrigin"])
	var bridge_world := Phase1.topology_to_world_point(landmarks["Bridge_GildedCrossing"])
	_assert(greenvale_world.x < bridge_world.x, "Greenvale must remain west of the crossing")

	var cameras: Dictionary = contract["cameras"]
	_assert(cameras.size() == 3, "exactly three shared-scene cameras required")
	_assert(cameras["village"]["node"] == "Camera_Village", "Village camera contract drift")
	_assert(cameras["map"]["node"] == "Camera_Map", "Map camera contract drift")
	_assert(cameras["world"]["node"] == "Camera_World", "World camera contract drift")
	_assert(float(cameras["village"]["size"]) < float(cameras["map"]["size"]), "Village must be closer than Map")
	_assert(float(cameras["map"]["size"]) < float(cameras["world"]["size"]), "Map must be closer than World")

	print("AURELIAN_PHASE1_TOPOLOGY_TEST: PASS")
	quit(0)

func _assert(condition: bool, message: String) -> void:
	if condition:
		return
	push_error("AURELIAN_PHASE1_TOPOLOGY_TEST_FAIL: %s" % message)
	quit(1)
