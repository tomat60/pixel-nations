extends SceneTree

const SCRIPT_PATH := "res://scenes/aurelian/world_scale_regional_terrain_v2.gd"
const SCENE_PATH := "res://scenes/aurelian/world_scale_regional_terrain_v2.tscn"

var failures: Array[String] = []

func _init() -> void:
	_check(FileAccess.file_exists(SCRIPT_PATH), "script_exists")
	_check(FileAccess.file_exists(SCENE_PATH), "scene_exists")

	var script_file := FileAccess.open(SCRIPT_PATH, FileAccess.READ)
	_check(script_file != null, "script_open")
	if script_file != null:
		var source := script_file.get_as_text()
		_check(source.find("const TERRAIN_RESOLUTION := 41") >= 0, "bounded_41x41_heightfield")
		_check(source.find("const TERRAIN_HALF_X := 34.0") >= 0, "regional_width_contract")
		_check(source.find("const TERRAIN_HALF_Z := 30.0") >= 0, "regional_depth_contract")
		_check(source.find("const REGIONAL_CAMERA_SIZE := 60.0") >= 0, "regional_camera_contract")
		_check(source.find("func _build_continuous_terrain") >= 0, "continuous_terrain_builder")
		_check(source.find("func _terrain_height") >= 0, "deterministic_height_function")
		_check(source.find("func _terrain_color") >= 0, "terrain_color_regions")
		_check(source.find("func _build_river") >= 0, "physical_river_builder")
		_check(source.find("func _build_regional_aurelian") >= 0, "regional_aurelian_builder")
		_check(source.find("func _build_regional_anchors") >= 0, "regional_anchor_builder")
		_check(source.find("func _make_camera") >= 0, "regional_camera_override")
		_check(source.find("SurfaceTool.new()") >= 0, "surface_tool_mesh")
		_check(source.find("generate_normals()") >= 0, "explicit_normals")
		_check(source.find("vertex_color_use_as_albedo = true") >= 0, "broad_vertex_color_biomes")
		_check(source.find("smoothstep(0.72, 1.0, edge)") >= 0, "coastline_from_heightfield")
		_check(source.find("basin.visible = false") >= 0, "local_scene_not_pasted_at_regional_scale")
		_check(source.find("_build_world_atlas") == -1, "atlas_not_implemented_before_r1_pass")
		_check(source.find("range(10000)") == -1, "no_literal_10000_land_render")
		for anchor_name in ["Pinewatch", "Stormcap", "EastRidge", "Saltmere", "Southfen", "OldCrown"]:
			_check(source.find(anchor_name) >= 0, "anchor_%s" % anchor_name)
		for kind in ["forest", "highland", "coast", "marsh", "ruins"]:
			_check(source.find("\"kind\":\"%s\"" % kind) >= 0, "kind_%s" % kind)

	var scene_file := FileAccess.open(SCENE_PATH, FileAccess.READ)
	_check(scene_file != null, "scene_open")
	if scene_file != null:
		var scene_source := scene_file.get_as_text()
		_check(scene_source.find("res://scenes/aurelian/world_scale_regional_terrain_v2.gd") >= 0, "scene_binds_regional_script")
		_check(scene_source.find("WorldScaleRegionalTerrainV2") >= 0, "scene_root_named")

	_finish()

func _check(condition: bool, label: String) -> void:
	if not condition:
		failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("AURELIAN_WORLD_SCALE_REGIONAL_TERRAIN_V2_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("AURELIAN_WORLD_SCALE_REGIONAL_TERRAIN_V2_TEST_FAILURE: %s" % failure)
	print("AURELIAN_WORLD_SCALE_REGIONAL_TERRAIN_V2_TEST: FAIL (%d)" % failures.size())
	quit(1)
