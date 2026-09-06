extends SceneTree

const SCRIPT_PATH := "res://scenes/aurelian/full_progression_clarity_composition_v1.gd"
const SCENE_PATH := "res://scenes/aurelian/full_progression_clarity_composition_v1.tscn"
const CLARITY_SCRIPT := preload("res://scenes/aurelian/full_progression_clarity_composition_v1.gd")
const CLARITY_SCENE := preload("res://scenes/aurelian/full_progression_clarity_composition_v1.tscn")

var failures: Array[String] = []

func _init() -> void:
	var instance := CLARITY_SCRIPT.new()
	_check(instance.has_method("_build_nation"), "nation_builder")
	_check(instance.has_method("_build_empire"), "empire_builder")
	_check(instance.has_method("_build_map_stage"), "map_builder")
	_check(instance.has_method("_build_world_stage"), "world_builder")
	instance.free()

	var scene_instance := CLARITY_SCENE.instantiate()
	_check(scene_instance != null, "scene_instantiates")
	if scene_instance != null:
		scene_instance.free()

	var file := FileAccess.open(SCRIPT_PATH, FileAccess.READ)
	_check(file != null, "script_open")
	if file != null:
		var source := file.get_as_text()
		_check(source.find("super._build_map_stage(root, stage_name)") >= 0, "early_map_inheritance")
		_check(source.find("super._build_world_stage(basin, root, stage_name)") >= 0, "early_world_inheritance")
		_check(source.find("ClarityNationSeat") >= 0, "nation_primary_seat")
		_check(source.find("ClarityImperialSeat") >= 0, "empire_primary_seat")
		_check(source.find("ClarityMapNationHomeland") >= 0, "nation_single_map_boundary")
		_check(source.find("ClarityMapEmpireExtent") >= 0, "empire_single_map_boundary")
		_check(source.find("ClarityWorldNationSpine") >= 0, "nation_world_spine")
		_check(source.find("ClarityWorldEmpireFrontierAxis") >= 0, "empire_frontier_axis")
		_check(source.find("WorldEmpireNorthernFrontier") == -1, "no_old_northern_frontier_stack")
		_check(source.find("WorldEmpireSouthernFrontier") == -1, "no_old_southern_frontier_stack")
		_check(source.find("ImperialOuterNW1") == -1, "no_old_outer_building_ring")

		var empire_start := source.find("func _build_empire")
		var empire_end := source.find("func _build_map_stage", empire_start)
		_check(empire_start >= 0 and empire_end > empire_start, "empire_function_bounds")
		if empire_start >= 0 and empire_end > empire_start:
			var empire_body := source.substr(empire_start, empire_end - empire_start)
			_check(empire_body.find("_build_city(basin, root)") >= 0, "empire_composes_from_city")
			_check(empire_body.find("_build_nation(basin, root)") == -1, "empire_does_not_stack_nation")
			var district_count := empire_body.count("ClarityImperialDistrict")
			_check(district_count == 4, "empire_four_district_anchors")

		var map_start := source.find("func _build_map_stage")
		var world_start := source.find("func _build_world_stage")
		_check(map_start >= 0 and world_start > map_start, "map_function_bounds")
		if map_start >= 0 and world_start > map_start:
			var map_body := source.substr(map_start, world_start - map_start)
			_check(map_body.count("ClarityMapNationHomeland") == 1, "nation_one_boundary_definition")
			_check(map_body.count("ClarityMapEmpireExtent") == 1, "empire_one_boundary_definition")

	_finish()

func _check(condition: bool, label: String) -> void:
	if not condition:
		failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("AURELIAN_FULL_PROGRESSION_CLARITY_COMPOSITION_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("AURELIAN_FULL_PROGRESSION_CLARITY_COMPOSITION_V1_TEST_FAILURE: %s" % failure)
	print("AURELIAN_FULL_PROGRESSION_CLARITY_COMPOSITION_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
