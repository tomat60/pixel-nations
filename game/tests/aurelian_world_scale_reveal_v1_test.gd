extends SceneTree

const SCRIPT_PATH := "res://scenes/aurelian/world_scale_reveal_v1.gd"
const WORLD_SCALE_SCRIPT := preload("res://scenes/aurelian/world_scale_reveal_v1.gd")
const WORLD_SCALE_SCENE := preload("res://scenes/aurelian/world_scale_reveal_v1.tscn")

var failures: Array[String] = []

func _init() -> void:
	var instance := WORLD_SCALE_SCRIPT.new()
	_check(instance.has_method("_build_sector_a01"), "sector_builder")
	_check(instance.has_method("_build_world_atlas"), "atlas_builder")
	_check(instance.has_method("_add_polygon_land"), "polygon_land_builder")
	_check(instance.has_method("_add_irregular_region"), "irregular_region_builder")
	_check(instance.has_method("_make_camera"), "camera_override")
	instance.free()

	var scene_instance := WORLD_SCALE_SCENE.instantiate()
	_check(scene_instance != null, "scene_instantiates")
	if scene_instance != null:
		scene_instance.free()

	_check(WORLD_SCALE_SCRIPT.SCALE_LEVELS == ["local", "sector", "atlas"], "three_scale_levels")
	_check(WORLD_SCALE_SCRIPT.SECTOR_ANCHORS.size() >= 4, "sector_has_four_plus_non_aurelian_anchors")
	_check(WORLD_SCALE_SCRIPT.ATLAS_CONTINENTS.size() >= 4, "atlas_has_multiple_continents")
	_check(WORLD_SCALE_SCRIPT.ATLAS_BIOMES.size() >= 10, "atlas_has_many_internal_regions")
	_check(WORLD_SCALE_SCRIPT.ATLAS_CAMERA_SIZE > WORLD_SCALE_SCRIPT.SECTOR_CAMERA_SIZE, "atlas_camera_wider_than_sector")
	_check(WORLD_SCALE_SCRIPT.SECTOR_CAMERA_SIZE > 23.4, "sector_camera_wider_than_accepted_local_world")

	var unique_anchor_names := {}
	for anchor_variant in WORLD_SCALE_SCRIPT.SECTOR_ANCHORS:
		var anchor: Dictionary = anchor_variant
		unique_anchor_names[String(anchor.get("name", ""))] = true
	_check(unique_anchor_names.size() == WORLD_SCALE_SCRIPT.SECTOR_ANCHORS.size(), "sector_anchor_names_unique")

	var file := FileAccess.open(SCRIPT_PATH, FileAccess.READ)
	_check(file != null, "script_open")
	if file != null:
		var source := file.get_as_text()
		_check(source.find("super._populate_world(parent)") >= 0, "accepted_aurelian_inherited")
		_check(source.find("super._make_camera(preset, parent)") >= 0, "accepted_camera_inherited_for_local")
		_check(source.find("SectorA01ContinuousLand") >= 0, "sector_continuous_landmass")
		_check(source.find("Geometry2D.triangulate_polygon") >= 0, "irregular_polygon_triangulation")
		_check(source.find("AtlasContinent_") >= 0, "atlas_continent_geometry")
		_check(source.find("AtlasA01Origin") >= 0, "atlas_a01_locator")
		_check(source.find("inherited_overlay.visible = false") >= 0, "higher_scale_local_overlay_suppressed")
		_check(source.find("range(10000)") == -1, "no_10000_object_render_loop")
		_check(source.find("SectorAnchorTerrain_") == -1, "no_token_like_sector_anchor_tiles")
		_check(source.find("AtlasMass_") == -1, "no_token_ring_atlas_masses")

	_finish()

func _check(condition: bool, label: String) -> void:
	if not condition:
		failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("AURELIAN_WORLD_SCALE_REVEAL_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("AURELIAN_WORLD_SCALE_REVEAL_V1_TEST_FAILURE: %s" % failure)
	print("AURELIAN_WORLD_SCALE_REVEAL_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
