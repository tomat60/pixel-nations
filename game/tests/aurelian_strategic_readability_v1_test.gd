extends SceneTree

const READABILITY_PATH := "res://scenes/aurelian/playable_aurelian_strategic_readability_v1.gd"
const ENTRY_SCENE_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1.tscn"
const EXPECTED_MAP_STATES := ["map_east_route_claimed", "map_greenvale_city", "map_aurelian_imperial_heartland", "map_first_imperial_expansion_two_lands_claimed"]
const EXPECTED_WORLD_STATES := ["world_first_city_recognized", "world_first_nation_founded", "world_first_empire_proclaimed",-lint"]
var failures: Array[String] = []

func _initialize() -> void:
	var source := _read_text(READABILITY_PATH)
	_check(source.contains('extends "res://scenes/aurelian/playable_aurelian_first_session_v6.gd"'), "extends_v6")
	_check(source.contains("if state_name.begins_with(\"village_\"):\n\t\treturn"), "village_fail_closed_return")
	_check(source.contains("MAP_CAMERA_SIZE := 19.0"), "map_camera_hierarchy")
	_check(source.contains("WORLD_CAMERA_SIZE := 25.6"), "world_camera_hierarchy")
	for state_name in EXPECTED_MAP_STATES:
		_check(source.contains('"' + state_name + '"'), "map_state_" + state_name)
	for state_name in EXPECTED_WORLD_STATES:
		_check(source.contains('"' + state_name + '"'), "world_state_" + state_name)
	_check(source.contains('"NorthRidgeClaimLabel"'), "frontier_label")
	_check(source.contains('"FirstEmpireLabel"'), "polity_label")
	_check(source.contains('"NationLabel"'), "nation_label")
	_check(not source.contains("save_session"), "no_persistence_change")
	_check(not source.contains("func _accept_entry"), "no_action_change")
	_check(_read_text(ENTRY_SCENE_PATH).contains("playable_aurelian_strategic_readability_v1.gd"), "entry_uses_readability")
	_finish()

func _read_text(path: String) -> String:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		failures.append("open_" + path)
		return ""
	return file.get_as_text()

func _check(condition: bool, label: String) -> void:
	if not condition:
		failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("AURELIAN_STRATEGIC_READABILITY_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("AURELIAN_STRATEGIC_READABILITY_V1_TEST_FAILURE: " + failure)
	print("AURELIAN_STRATEGIC_READABILITY_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
