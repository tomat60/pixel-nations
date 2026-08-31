extends SceneTree

const MANIFEST_PATH := "res://scenes/aurelian/full_progression_blockout_v1_manifest.json"
const BLOCKOUT_SCRIPT := preload("res://scenes/aurelian/full_progression_blockout_v1.gd")

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

	_check(String(manifest.get("contract", "")) == "GODOT_AURELIAN_FULL_PROGRESSION_BLOCKOUT_V1", "contract")
	_check(int(manifest.get("authority_issue", 0)) == 563, "authority_issue")
	_check(String(manifest.get("shared_geography", "")) == "aurelian_authored_terrain_v1.glb", "shared_geography")
	_check(BLOCKOUT_SCRIPT.BLOCKOUT_MANIFEST_PATH == MANIFEST_PATH, "script_manifest_path")
	_check(BLOCKOUT_SCRIPT.PROGRESSION_STAGES == ["land", "settlement", "city", "nation", "empire"], "script_stage_order")
	_check(BLOCKOUT_SCRIPT.PROGRESSION_VIEWS == ["village", "map", "world"], "script_view_order")
	_check(manifest.get("stages", []) == BLOCKOUT_SCRIPT.PROGRESSION_STAGES, "manifest_stage_order")
	_check(manifest.get("views", []) == BLOCKOUT_SCRIPT.PROGRESSION_VIEWS, "manifest_view_order")

	var matrix: Dictionary = manifest.get("matrix", {})
	_check(matrix.size() == 5, "matrix_stage_count")
	var previous_map_size := 0.0
	var previous_world_size := 0.0
	for stage_name in BLOCKOUT_SCRIPT.PROGRESSION_STAGES:
		_check(matrix.has(stage_name), "matrix_%s" % stage_name)
		if not matrix.has(stage_name):
			continue
		var stage: Dictionary = matrix[stage_name]
		for key in ["village_base", "map_base", "world_base", "intent", "camera_size"]:
			_check(stage.has(key), "%s_%s" % [stage_name, key])
		var intent: Dictionary = stage.get("intent", {})
		for view_name in BLOCKOUT_SCRIPT.PROGRESSION_VIEWS:
			_check(String(intent.get(view_name, "")).length() > 20, "%s_intent_%s" % [stage_name, view_name])
		var sizes: Dictionary = stage.get("camera_size", {})
		_check(float(sizes.get("village", 0.0)) >= 9.0, "%s_village_camera" % stage_name)
		var map_size := float(sizes.get("map", 0.0))
		var world_size := float(sizes.get("world", 0.0))
		_check(map_size > previous_map_size, "%s_map_scale_growth" % stage_name)
		_check(world_size > previous_world_size, "%s_world_scale_growth" % stage_name)
		previous_map_size = map_size
		previous_world_size = world_size

	_check(String((matrix.get("land", {}) as Dictionary).get("village_base", "")) == "claimed", "land_village_base")
	_check(String((matrix.get("settlement", {}) as Dictionary).get("village_base", "")) == "founded", "settlement_village_base")
	_check(String((matrix.get("city", {}) as Dictionary).get("village_base", "")) == "city_chartered", "city_village_base")
	_check(String((matrix.get("nation", {}) as Dictionary).get("village_base", "")) == "city_chartered", "nation_village_base")
	_check(String((matrix.get("empire", {}) as Dictionary).get("village_base", "")) == "city_chartered", "empire_village_base")

	var topology: Dictionary = manifest.get("topology_invariants", {})
	_check(topology.get("GreenvaleOrigin", []) == [354, 285], "greenvale_topology")
	_check(topology.get("GildedCrossing", []) == [515, 340], "crossing_topology")
	_check(topology.get("NorthRidge", []) == [700, 205], "north_ridge_topology")
	_check(topology.get("SouthMarsh", []) == [365, 690], "south_marsh_topology")
	_check(topology.get("Northgate", []) == [445, 65], "northgate_topology")

	var evidence: Dictionary = manifest.get("evidence", {})
	_check(int(evidence.get("required_matrix_count", 0)) == 15, "evidence_matrix_count")
	_check(evidence.get("resolution", []) == [1440, 900], "evidence_resolution")
	_check(bool(evidence.get("input_driven_motion", false)), "input_driven_motion")
	_check(bool(evidence.get("direct_visual_review_required", false)), "direct_review")
	_check(int(evidence.get("bounded_visual_corrections_max", 0)) == 1, "correction_limit")

	var forbidden: Array = manifest.get("forbidden", [])
	for item in ["Third-Land Prospect recovery", "economy", "third-land claim", "new GLB", "new asset family", "MAX", "paid tools"]:
		_check(forbidden.has(item), "forbidden_%s" % String(item).replace(" ", "_").to_lower())

	_finish()

func _check(condition: bool, label: String) -> void:
	if not condition:
		_fail(label)

func _fail(label: String) -> void:
	failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("GODOT_AURELIAN_FULL_PROGRESSION_BLOCKOUT_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("GODOT_AURELIAN_FULL_PROGRESSION_BLOCKOUT_V1_TEST_FAILURE: %s" % failure)
	print("GODOT_AURELIAN_FULL_PROGRESSION_BLOCKOUT_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
