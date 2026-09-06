extends SceneTree

const MANIFEST_PATH := "res://scenes/aurelian/full_progression_visual_grammar_v2_gate_b_manifest.json"
const SCRIPT_PATH := "res://scenes/aurelian/full_progression_visual_grammar_v2_gate_b.gd"
const GATE_B_SCRIPT := preload("res://scenes/aurelian/full_progression_visual_grammar_v2_gate_b.gd")

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

	_check(String(manifest.get("contract", "")) == "AURELIAN_FULL_PROGRESSION_VISUAL_GRAMMAR_V2_GATE_B", "contract")
	_check(String(manifest.get("parent_contract", "")) == "AURELIAN_FULL_PROGRESSION_VISUAL_GRAMMAR_V2", "parent_contract")
	_check(manifest.get("stages", []) == ["land", "settlement", "city", "nation", "empire"], "stage_order")
	_check(manifest.get("views", []) == ["village", "map", "world"], "view_order")
	_check(int(manifest.get("matrix_frames", 0)) == 15, "matrix_frames")
	_check(String(manifest.get("shared_geography", "")) == "aurelian_authored_terrain_v1.glb", "shared_geography")
	_check(bool(manifest.get("fixed_camera_per_view", false)), "fixed_camera_per_view")
	_check(bool(manifest.get("unlabeled_contact_sheet", false)), "unlabeled_contact_sheet")
	_check(bool(manifest.get("normal_input_motion_required", false)), "normal_input_motion_required")

	_check(GATE_B_SCRIPT.GATE_B_MANIFEST_PATH == MANIFEST_PATH, "script_manifest_path")
	_check(GATE_B_SCRIPT.GATE_B_VIEWS == ["village", "map", "world"], "script_view_order")
	var instance := GATE_B_SCRIPT.new()
	_check(instance.has_method("_build_map_stage"), "map_stage_builder")
	_check(instance.has_method("_build_world_stage"), "world_stage_builder")
	_check(instance.has_method("_unhandled_input"), "normal_input_handler")
	instance.free()

	var map_targets: Dictionary = manifest.get("map_physical_signal_targets", {})
	var world_targets: Dictionary = manifest.get("world_physical_signal_targets", {})
	var previous_map := 0
	var previous_world := 0
	for stage_name in ["land", "settlement", "city", "nation", "empire"]:
		var map_count := int(map_targets.get(stage_name, 0))
		var world_count := int(world_targets.get(stage_name, 0))
		_check(map_count > previous_map, "map_growth_%s" % stage_name)
		_check(world_count > previous_world, "world_growth_%s" % stage_name)
		previous_map = map_count
		previous_world = world_count

	var acceptance: Dictionary = manifest.get("acceptance", {})
	for key in [
		"all_five_stages_distinguishable_without_labels",
		"map_not_static_terrain_plus_glyphs",
		"world_political_scale_materially_grows",
		"same_geography_all_views",
		"direct_review_required",
		"green_ci_not_sufficient"
	]:
		_check(bool(acceptance.get(key, false)), "acceptance_%s" % key)
	_check(int(acceptance.get("bounded_gate_b_corrections_max", -1)) == 1, "correction_limit")

	var forbidden: Array = manifest.get("forbidden", [])
	for required in [
		"camera zoom as primary progression",
		"labels as primary progression",
		"translucent rings as primary progression",
		"independent geography",
		"new asset family",
		"Third-Land Prospect claim",
		"main playable controller rewrite",
		"MAX",
		"paid tools"
	]:
		_check(forbidden.has(required), "forbidden_%s" % required.replace(" ", "_"))

	var script_file := FileAccess.open(SCRIPT_PATH, FileAccess.READ)
	_check(script_file != null, "script_open")
	if script_file != null:
		var source := script_file.get_as_text()
		_check(source.find("TRANSPARENCY_ALPHA") == -1, "no_translucent_material_api")
		_check(source.find("ProductionMapOverlays") == -1, "no_inherited_map_glyph_dependency")
		_check(source.find("ProductionWorldOverlays") == -1, "no_inherited_world_glyph_dependency")
		_check(source.find("Third-Land") == -1, "no_third_land_logic")
		_check(source.find("WorldNationRidgeSeatPhysical") >= 0, "nation_physical_regional_seat")
		_check(source.find("WorldNationCrossingSeatPhysical") >= 0, "nation_physical_crossing_seat")
		_check(source.find("WorldEmpireNorthgateCitadel") >= 0, "empire_physical_northgate_citadel")
		_check(source.find("WorldEmpireSouthCitadel") >= 0, "empire_physical_south_citadel")
		_check(source.find("WorldEmpireNorthernFrontier") >= 0, "empire_connected_northern_frontier")
		_check(source.find("WorldEmpireSouthernFrontier") >= 0, "empire_connected_southern_frontier")

	_finish()

func _check(condition: bool, label: String) -> void:
	if not condition:
		_fail(label)

func _fail(label: String) -> void:
	failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("AURELIAN_FULL_PROGRESSION_VISUAL_GRAMMAR_V2_GATE_B_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("AURELIAN_FULL_PROGRESSION_VISUAL_GRAMMAR_V2_GATE_B_TEST_FAILURE: %s" % failure)
	print("AURELIAN_FULL_PROGRESSION_VISUAL_GRAMMAR_V2_GATE_B_TEST: FAIL (%d)" % failures.size())
	quit(1)
