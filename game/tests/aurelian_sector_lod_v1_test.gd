extends SceneTree

const SCENE_SCRIPT_PATH := "res://scenes/aurelian/world_scale_sector_lod_v1.gd"
const SCENE_PATH := "res://scenes/aurelian/world_scale_sector_lod_v1.tscn"
const GENERATED_MANIFEST_PATH := "res://assets/aurelian-basin/export/aurelian_sector_lod_v1_manifest.json"
const CANONICAL_MANIFEST_PATH := "res://assets/aurelian-basin/export/transform-manifest.json"
const CITY_MANIFEST_PATH := "res://scenes/aurelian/production_village_v1_state_manifest.json"
const SECTOR_SCRIPT := preload("res://scenes/aurelian/world_scale_sector_lod_v1.gd")
const SECTOR_SCENE := preload("res://scenes/aurelian/world_scale_sector_lod_v1.tscn")

var failures: Array[String] = []

func _init() -> void:
	var instance := SECTOR_SCRIPT.new()
	_check(instance.has_method("_load_sector"), "sector_loader")
	_check(instance.has_method("_make_camera"), "sector_camera")
	_check(instance.has_method("_capture_sector"), "sector_capture")
	instance.free()

	var scene_instance := SECTOR_SCENE.instantiate()
	_check(scene_instance != null, "scene_instantiates")
	if scene_instance != null:
		scene_instance.free()

	var source_file := FileAccess.open(SCENE_SCRIPT_PATH, FileAccess.READ)
	_check(source_file != null, "scene_script_open")
	if source_file != null:
		var source := source_file.get_as_text()
		_check(source.find("aurelian_sector_lod_v1.glb") >= 0, "generated_glb_path")
		_check(source.find("SECTOR_CAMERA_SIZE := 23.0") >= 0, "bounded_sector_camera")
		_check(source.find("#27332f") >= 0, "accepted_background_palette")
		_check(source.find("#f3d4a8") >= 0, "accepted_sun_palette")
		_check(source.find("World Atlas") == -1, "no_atlas_logic")
		_check(source.find("economy") == -1, "no_economy_logic")

	var generated := _read_json(GENERATED_MANIFEST_PATH)
	var canonical := _read_json(CANONICAL_MANIFEST_PATH)
	var city := _read_json(CITY_MANIFEST_PATH)

	_check(not generated.is_empty(), "generated_manifest")
	_check(not canonical.is_empty(), "canonical_manifest")
	_check(not city.is_empty(), "city_manifest")
	if not generated.is_empty() and not canonical.is_empty() and not city.is_empty():
		_check(String(generated.get("contract", "")) == "AURELIAN_SECTOR_LOD_V1", "lod_contract")
		_check(String(generated.get("source_contract", "")) == "AURELIAN_AUTHORED_TERRAIN_V1", "canonical_source_contract")
		_check(String(generated.get("city_contract", "")) == "PRODUCTION_VILLAGE_V1", "city_source_contract")
		_check(bool(generated.get("topology_reused", false)), "topology_reused")
		_check(int(generated.get("new_semantic_anchors", -1)) == 0, "no_new_semantic_anchors")
		_check(bool(generated.get("technical_padding_only", false)), "padding_is_nonsemantic")
		_check(not bool(generated.get("new_asset_family", true)), "no_new_asset_family")
		_check(not bool(generated.get("gameplay_state_changed", true)), "gameplay_untouched")
		_check(not bool(generated.get("atlas_implemented", true)), "atlas_blocked")
		_check(bool(generated.get("technical_edges_intended_off_camera", false)), "edges_off_camera")
		_check(String(generated.get("kaykit_source_commit", "")) == String(canonical.get("kaykit_source_commit", "")), "same_kaykit_source")
		_check(generated.get("canonical_landmarks", {}) == canonical.get("landmarks", {}), "same_landmarks")
		_check(generated.get("river_centerline", []) == canonical.get("river_centerline", []), "same_river")
		_check(generated.get("routes_reused", {}) == canonical.get("routes", {}), "same_routes")
		var lod_nodes: Array = generated.get("lod_city_nodes", [])
		var states: Dictionary = city.get("states", {})
		var chartered: Dictionary = states.get("city_chartered", {})
		var chartered_visible: Array = chartered.get("visible", [])
		_check(lod_nodes.size() >= 8 and lod_nodes.size() <= 12, "bounded_city_lod_density")
		for node in lod_nodes:
			_check(chartered_visible.has(node), "lod_node_from_accepted_city:%s" % node)
		_check(int(generated.get("terrain_face_cells", 0)) >= 3000, "regional_surface_density")
		_check(String(generated.get("representation_delta", "")) == "campaign-scale LOD/composition only", "single_representation_delta")

	_finish()

func _read_json(path: String) -> Dictionary:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return {}
	var payload = JSON.parse_string(file.get_as_text())
	if payload is Dictionary:
		return payload as Dictionary
	return {}

func _check(condition: bool, label: String) -> void:
	if not condition:
		failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("AURELIAN_SECTOR_LOD_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("AURELIAN_SECTOR_LOD_V1_TEST_FAILURE: %s" % failure)
	print("AURELIAN_SECTOR_LOD_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
