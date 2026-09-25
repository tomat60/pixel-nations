extends SceneTree

const SPEC_PATH := "res://assets/aurelian-basin/source/world_atlas_v1_spec.json"
const SECTOR_SPEC_PATH := "res://assets/aurelian-basin/source/sector_a01_generator_v4_spec.json"
const GENERATOR_PATH := "res://assets/aurelian-basin/source/world_atlas_v1.py"
const SCENE_PATH := "res://scenes/aurelian/world_atlas_v1.tscn"
const GENERATED_MANIFEST_PATH := "res://assets/aurelian-basin/export/world_atlas_v1_manifest.json"

func _init() -> void:
	var failures: Array[String] = []
	var spec := _read_json(SPEC_PATH)
	var sector_spec := _read_json(SECTOR_SPEC_PATH)
	_check(not spec.is_empty(), "Atlas spec must load", failures)
	_check(not sector_spec.is_empty(), "accepted Sector v4 spec must load", failures)
	if spec.is_empty() or sector_spec.is_empty():
		_finish(failures)
		return

	_check(spec.get("contract") == "PIXEL_NATIONS_WORLD_ATLAS_V1_SPEC", "Atlas spec contract", failures)
	_check(sector_spec.get("contract") == "AURELIAN_SECTOR_GENERATOR_V4_SPEC", "Sector source contract", failures)
	var regions: Array = spec.get("macro_regions", [])
	_check(regions.size() >= 12 and regions.size() <= 20, "Atlas must use 12-20 macro regions", failures)
	var relief: Array = spec.get("relief_chains", [])
	_check(relief.size() >= 3, "Atlas needs multiple relief systems", failures)
	var water: Array = spec.get("water_systems", [])
	_check(water.size() >= 2, "Atlas needs multiple water systems", failures)
	var vegetation: Array = spec.get("vegetation_masses", [])
	_check(vegetation.size() >= 3, "Atlas needs large vegetation masses", failures)
	var loci: Array = spec.get("strategic_loci", [])
	_check(loci.size() <= 8, "Atlas strategic loci must stay sparse", failures)
	_check(float(spec.get("technical_padding", 0)) >= 3000.0, "Atlas must have off-camera technical padding", failures)

	var origin: Dictionary = spec.get("origin_sector", {})
	_check(origin.get("sector_id") == "A-01", "A-01 must remain Atlas origin", failures)
	_check(origin.get("source_sector_spec") == "AURELIAN_SECTOR_GENERATOR_V4_SPEC", "Atlas origin must derive from accepted Sector generator", failures)
	_check(origin.get("preserve_home_identity") == true, "A-01 home identity must be preserved", failures)
	var composition: Dictionary = origin.get("composition", {})
	_check(composition.get("strategy") == "surface_anchored_sigil_ridge", "A-01 must use the materially different surface-anchored sigil-ridge composition", failures)
	_check(float(composition.get("dry_anchor_search_radius", 0)) <= float(origin.get("visual_radius", 0)), "A-01 dry anchor must remain inside the canonical origin radius", failures)
	_check(int(composition.get("dry_anchor_samples", 0)) >= 16, "A-01 dry anchor search must be deterministic and sufficiently sampled", failures)
	_check(float(composition.get("sigil_scale", 0)) == 0.085, "A-01 sigils must preserve the accepted World flag scale", failures)
	_check((composition.get("sigil_ridge_offsets", []) as Array).size() == 5, "A-01 physical sigil ridge must contain five existing-asset flags", failures)

	var world_plane: Array = spec.get("world_plane", [0, 0])
	var sector_plane: Array = sector_spec.get("sector_plane", [1, 1])
	var world_area := float(world_plane[0]) * float(world_plane[1])
	var sector_area := float(sector_plane[0]) * float(sector_plane[1])
	_check(world_area >= sector_area * 8.0, "Atlas macro plane must materially exceed one Sector plane", failures)

	var generator := _read_text(GENERATOR_PATH)
	_check(generator.contains("stable macro geography + seeded sparse detail"), "generator model must stay macro-first", failures)
	_check(generator.contains("full_sector_glbs_generated\": 0"), "generator must not build full Sector GLBs", failures)
	_check(generator.contains("literal_sector_grid\": False"), "generator must reject literal sector grid", failures)
	_check(generator.contains("literal_land_grid\": False"), "generator must reject literal land grid", failures)
	_check(generator.contains("gameplay_state_changed\": False"), "Atlas must not change gameplay state", failures)
	_check(generator.contains("find_origin_anchor"), "Atlas must surface-anchor A-01 without terrain uplift", failures)
	_check(generator.contains("surface_anchored_sigil_ridge"), "Atlas must encode the new A-01 composition", failures)
	_check(generator.contains("origin_landmark_scale_changed"), "Atlas must not revive rejected landmark scaling", failures)
	_check(generator.contains("origin_terrain_uplift"), "Atlas must not revive rejected terrain uplift", failures)
	_check(FileAccess.file_exists(SCENE_PATH), "Atlas Godot scene must exist", failures)

	if FileAccess.file_exists(GENERATED_MANIFEST_PATH):
		var manifest := _read_json(GENERATED_MANIFEST_PATH)
		_check(manifest.get("contract") == "PIXEL_NATIONS_WORLD_ATLAS_V1", "generated Atlas manifest contract", failures)
		_check(int(manifest.get("macro_region_count", 0)) == regions.size(), "generated macro-region count must match spec", failures)
		_check(manifest.get("origin_sector") == "A-01", "generated Atlas origin", failures)
		_check(manifest.get("origin_composition") == "surface_anchored_sigil_ridge", "generated Atlas A-01 composition", failures)
		_check(int(manifest.get("origin_sigil_count", 0)) == 5, "generated Atlas A-01 sigil count", failures)
		_check(manifest.get("origin_landmark_scale_changed") == false, "generated Atlas must preserve accepted landmark scale", failures)
		_check(float(manifest.get("origin_terrain_uplift", -1.0)) == 0.0, "generated Atlas must not uplift terrain", failures)
		_check(manifest.get("literal_sector_grid") == false, "generated Atlas has no literal sector grid", failures)
		_check(manifest.get("literal_land_grid") == false, "generated Atlas has no literal land grid", failures)
		_check(int(manifest.get("full_sector_glbs_generated", -1)) == 0, "generated Atlas must build zero full Sector GLBs", failures)
		_check(manifest.get("gameplay_state_changed") == false, "generated Atlas gameplay untouched", failures)
		_check(manifest.get("new_asset_family") == false, "generated Atlas reuses asset family", failures)

	_finish(failures)

func _read_json(path: String) -> Dictionary:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return {}
	var parsed = JSON.parse_string(file.get_as_text())
	if parsed is Dictionary:
		return parsed as Dictionary
	return {}

func _read_text(path: String) -> String:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return ""
	return file.get_as_text()

func _check(condition: bool, message: String, failures: Array[String]) -> void:
	if not condition:
		failures.append(message)

func _finish(failures: Array[String]) -> void:
	if failures.is_empty():
		print("PIXEL_NATIONS_WORLD_ATLAS_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("WORLD_ATLAS_V1_TEST_FAILURE: %s" % failure)
	quit(1)
