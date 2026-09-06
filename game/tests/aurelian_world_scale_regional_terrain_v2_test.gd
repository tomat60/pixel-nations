extends SceneTree

const SCRIPT_PATH := "res://scenes/aurelian/world_scale_regional_terrain_v2.gd"
const REGIONAL_SCRIPT := preload("res://scenes/aurelian/world_scale_regional_terrain_v2.gd")
const REGIONAL_SCENE := preload("res://scenes/aurelian/world_scale_regional_terrain_v2.tscn")

var failures: Array[String] = []

func _init() -> void:
	var instance := REGIONAL_SCRIPT.new()
	_check(instance.has_method("_build_continuous_terrain"), "continuous_terrain_builder")
	_check(instance.has_method("_terrain_height"), "deterministic_height_function")
	_check(instance.has_method("_terrain_color"), "terrain_color_regions")
	_check(instance.has_method("_build_river"), "physical_river_builder")
	_check(instance.has_method("_build_regional_aurelian"), "regional_aurelian_builder")
	_check(instance.has_method("_build_regional_anchors"), "regional_anchor_builder")
	_check(instance.has_method("_make_camera"), "regional_camera_override")
	instance.free()

	var scene_instance := REGIONAL_SCENE.instantiate()
	_check(scene_instance != null, "scene_instantiates")
	if scene_instance != null:
		scene_instance.free()

	_check(REGIONAL_SCRIPT.TERRAIN_RESOLUTION >= 33 and REGIONAL_SCRIPT.TERRAIN_RESOLUTION <= 49, "bounded_low_resolution_heightfield")
	_check(REGIONAL_SCRIPT.REGIONAL_ANCHORS.size() >= 5, "five_plus_non_aurelian_anchors")
	_check(REGIONAL_SCRIPT.REGIONAL_CAMERA_SIZE > 23.4, "regional_camera_wider_than_local_world")
	_check(REGIONAL_SCRIPT.TERRAIN_HALF_X > 25.0 and REGIONAL_SCRIPT.TERRAIN_HALF_Z > 20.0, "regional_footprint_materially_larger")

	var kinds := {}
	var names := {}
	for anchor_variant in REGIONAL_SCRIPT.REGIONAL_ANCHORS:
		var anchor: Dictionary = anchor_variant
		kinds[String(anchor.get("kind", ""))] = true
		names[String(anchor.get("name", ""))] = true
	_check(names.size() == REGIONAL_SCRIPT.REGIONAL_ANCHORS.size(), "anchor_names_unique")
	_check(kinds.has("forest"), "forest_anchor")
	_check(kinds.has("highland"), "highland_anchor")
	_check(kinds.has("coast"), "coast_anchor")
	_check(kinds.has("marsh"), "marsh_anchor")
	_check(kinds.has("ruins"), "ruins_anchor")

	var file := FileAccess.open(SCRIPT_PATH, FileAccess.READ)
	_check(file != null, "script_open")
	if file != null:
		var source := file.get_as_text()
		_check(source.find("SurfaceTool.new()") >= 0, "surface_tool_mesh")
		_check(source.find("generate_normals()") >= 0, "explicit_normals")
		_check(source.find("vertex_color_use_as_albedo = true") >= 0, "broad_vertex_color_biomes")
		_check(source.find("smoothstep(0.72, 1.0, edge)") >= 0, "coastline_from_heightfield")
		_check(source.find("basin.visible = false") >= 0, "local_scene_not_pasted_at_regional_scale")
		_check(source.find("_build_world_atlas") == -1, "atlas_not_implemented_before_r1_pass")
		_check(source.find("CylinderMesh.new()") >= 0, "relief_and_vegetation_primitives_allowed")
		_check(source.find("range(10000)") == -1, "no_literal_10000_land_render")

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
