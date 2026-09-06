extends SceneTree

const SPEC_PATH := "res://assets/aurelian-basin/source/sector_a01_generator_v4_spec.json"
const GENERATED_MANIFEST_PATH := "res://assets/aurelian-basin/export/aurelian_sector_generator_v4_manifest.json"
const CANONICAL_MANIFEST_PATH := "res://assets/aurelian-basin/export/transform-manifest.json"
const CITY_MANIFEST_PATH := "res://scenes/aurelian/production_village_v1_state_manifest.json"
const SCENE_PATH := "res://scenes/aurelian/world_scale_sector_generator_v4.tscn"
const SCENE_SCRIPT_PATH := "res://scenes/aurelian/world_scale_sector_generator_v4.gd"
const GENERATOR_SOURCE_PATH := "res://assets/aurelian-basin/source/aurelian_sector_generator_v4.py"
const SECTOR_SCENE := preload("res://scenes/aurelian/world_scale_sector_generator_v4.tscn")

var failures: Array[String] = []

func _init() -> void:
	var spec := _read_json(SPEC_PATH)
	var generated := _read_json(GENERATED_MANIFEST_PATH)
	var canonical := _read_json(CANONICAL_MANIFEST_PATH)
	var city := _read_json(CITY_MANIFEST_PATH)

	_check(not spec.is_empty(), "spec_present")
	_check(not generated.is_empty(), "generated_manifest_present")
	_check(not canonical.is_empty(), "canonical_manifest_present")
	_check(not city.is_empty(), "city_manifest_present")

	if not spec.is_empty():
		_check(String(spec.get("contract", "")) == "AURELIAN_SECTOR_GENERATOR_V4_SPEC", "spec_contract")
		_check(String(spec.get("sector_id", "")) == "A-01", "sector_id")
		_check(String(spec.get("topography_profile", "")) == "basin_fluvial", "basin_fluvial_profile")
		var slots: Array = spec.get("macro_locus_slots", [])
		_check(slots.size() >= 8 and slots.size() <= 12, "macro_loci_target")
		var archetypes: Dictionary = spec.get("settlement_archetypes", {})
		_check(archetypes.size() >= 6, "settlement_archetype_library")
		var core: Dictionary = spec.get("canonical_core", {})
		_check(bool(core.get("preserve_landmarks", false)), "preserve_landmarks")
		_check(bool(core.get("preserve_river", false)), "preserve_river")
		_check(bool(core.get("preserve_routes", false)), "preserve_routes")
		_check(float(spec.get("technical_padding", 0)) >= 900.0, "terrain_padding")

	if not generated.is_empty() and not canonical.is_empty():
		_check(String(generated.get("contract", "")) == "AURELIAN_SECTOR_GENERATOR_V4", "generated_contract")
		_check(int(generated.get("macro_loci_count", 0)) >= 8 and int(generated.get("macro_loci_count", 0)) <= 12, "generated_macro_loci")
		_check(int(generated.get("settlement_count", 0)) >= 6 and int(generated.get("settlement_count", 0)) <= 9, "generated_settlement_density")
		_check(int(generated.get("relief_chain_count", 0)) >= 2, "generated_relief_chains")
		_check(int(generated.get("vegetation_mass_count", 0)) >= 2, "generated_vegetation_masses")
		_check(String(generated.get("kaykit_source_commit", "")) == String(canonical.get("kaykit_source_commit", "")), "same_kaykit_source")
		_check(generated.get("canonical_landmarks", {}) == canonical.get("landmarks", {}), "same_canonical_landmarks")
		_check(generated.get("canonical_routes", {}) == canonical.get("routes", {}), "same_canonical_routes")
		_check(generated.get("canonical_river", []) == canonical.get("river_centerline", []), "same_canonical_river")
		_check(not bool(generated.get("new_asset_family", true)), "no_new_asset_family")
		_check(not bool(generated.get("gameplay_state_changed", true)), "gameplay_untouched")
		_check(not bool(generated.get("atlas_implemented", true)), "atlas_blocked")
		_check(int(generated.get("terrain_face_cells", 0)) >= 5000, "regional_surface_density")

	var scene_instance := SECTOR_SCENE.instantiate()
	_check(scene_instance != null, "scene_instantiates")
	if scene_instance != null:
		_check(scene_instance.has_method("_load_sector"), "scene_loads_generated_sector")
		_check(scene_instance.has_method("_make_camera"), "scene_camera")
		scene_instance.free()

	var scene_source := _read_text(SCENE_SCRIPT_PATH)
	_check(scene_source.find("aurelian_sector_generator_v4.glb") >= 0, "generated_glb_path")
	_check(scene_source.find("World Atlas") == -1, "no_atlas_scene_logic")
	_check(scene_source.find("economy") == -1, "no_economy_scene_logic")

	var generator_source := _read_text(GENERATOR_SOURCE_PATH)
	_check(generator_source.find("random.Random(SEED)") >= 0, "deterministic_seed")
	_check(generator_source.find("canonical_to_sector") >= 0, "canonical_core_embedding")
	_check(generator_source.find("create_settlement") >= 0, "settlement_generator")
	_check(generator_source.find("create_vegetation") >= 0, "vegetation_generator")

	_finish()

func _read_json(path: String) -> Dictionary:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return {}
	var payload = JSON.parse_string(file.get_as_text())
	if payload is Dictionary:
		return payload as Dictionary
	return {}

func _read_text(path: String) -> String:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return ""
	return file.get_as_text()

func _check(condition: bool, label: String) -> void:
	if not condition:
		failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("AURELIAN_SECTOR_GENERATOR_V4_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("AURELIAN_SECTOR_GENERATOR_V4_TEST_FAILURE: %s" % failure)
	print("AURELIAN_SECTOR_GENERATOR_V4_TEST: FAIL (%d)" % failures.size())
	quit(1)
