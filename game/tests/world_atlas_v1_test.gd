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

	var home: Dictionary = spec.get("home_land_use", {})
	_check(home.get("contract") == "WORLD_HOME_INHABITED_BASIN_V1", "World HOME land-use contract", failures)
	_check(home.get("semantic") == "home", "World HOME semantic", failures)
	_check(home.get("carrier") == "terrain_integrated_land_use", "World HOME must be carried by terrain-integrated land use", failures)
	var home_districts: Array = home.get("districts", [])
	var home_parcels: Array = home.get("parcels", [])
	_check(home_districts.size() == 22, "World HOME needs retained settlement fabric", failures)
	_check(home_parcels.size() == 10, "World HOME needs asymmetric cultivated-land fabric", failures)
	var screen_contract: Dictionary = home.get("screen_space_target_px", {})
	_check(_numeric_array_close(screen_contract.get("1440x900", []), [170.0, 220.0, 110.0, 150.0]), "World HOME 1440 screen-space contract", failures)
	_check(_numeric_array_close(screen_contract.get("360x225", []), [42.0, 55.0, 28.0, 38.0]), "World HOME 360 screen-space contract", failures)
	var home_x: Array[float] = []
	var home_y: Array[float] = []
	for district_variant in home_districts:
		var district: Dictionary = district_variant
		var center: Array = district.get("atlas_center", [])
		if center.size() == 2:
			home_x.append(float(center[0]))
			home_y.append(float(center[1]))
	for parcel_variant in home_parcels:
		var parcel: Dictionary = parcel_variant
		var center: Array = parcel.get("atlas_center", [])
		if center.size() == 2:
			home_x.append(float(center[0]))
			home_y.append(float(center[1]))
	var home_span_x: float = float(home_x.max() - home_x.min()) if not home_x.is_empty() else 0.0
	var home_span_y: float = float(home_y.max() - home_y.min()) if not home_y.is_empty() else 0.0
	_check(home_span_x >= 1700.0 and home_span_x <= 1800.0, "World HOME bounded basin span in X", failures)
	_check(home_span_y >= 1150.0 and home_span_y <= 1250.0, "World HOME bounded basin span in Y", failures)
	_check(not JSON.stringify(home).to_lower().contains("flag"), "World HOME primitive must not depend on flags", failures)
	_check(not JSON.stringify(home).to_lower().contains("crest"), "World HOME primitive must not depend on crest", failures)

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
	_check(FileAccess.file_exists(SCENE_PATH), "Atlas Godot scene must exist", failures)

	if FileAccess.file_exists(GENERATED_MANIFEST_PATH):
		var manifest := _read_json(GENERATED_MANIFEST_PATH)
		_check(manifest.get("contract") == "PIXEL_NATIONS_WORLD_ATLAS_V1", "generated Atlas manifest contract", failures)
		_check(int(manifest.get("macro_region_count", 0)) == regions.size(), "generated macro-region count must match spec", failures)
		_check(manifest.get("origin_sector") == "A-01", "generated Atlas origin", failures)
		_check(manifest.get("literal_sector_grid") == false, "generated Atlas has no literal sector grid", failures)
		_check(manifest.get("literal_land_grid") == false, "generated Atlas has no literal land grid", failures)
		_check(int(manifest.get("full_sector_glbs_generated", -1)) == 0, "generated Atlas must build zero full Sector GLBs", failures)
		_check(manifest.get("gameplay_state_changed") == false, "generated Atlas gameplay untouched", failures)
		_check(manifest.get("new_asset_family") == false, "generated Atlas reuses asset family", failures)

	_finish(failures)

func _numeric_array_close(actual, expected: Array, epsilon := 0.001) -> bool:
	if not actual is Array or actual.size() != expected.size():
		return false
	for index in range(expected.size()):
		if abs(float(actual[index]) - float(expected[index])) > epsilon:
			return false
	return true


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