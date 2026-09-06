extends SceneTree

const MANIFEST_PATH := "res://scenes/aurelian/full_progression_visual_grammar_v2_manifest.json"
const V2_SCRIPT := preload("res://scenes/aurelian/full_progression_visual_grammar_v2.gd")

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

	_check(String(manifest.get("contract", "")) == "AURELIAN_FULL_PROGRESSION_VISUAL_GRAMMAR_V2", "contract")
	_check(manifest.get("stages", []) == ["land", "settlement", "city", "nation", "empire"], "stage_order")
	_check(V2_SCRIPT.V2_STAGES == ["land", "settlement", "city", "nation", "empire"], "script_stage_order")
	_check(V2_SCRIPT.VISUAL_GRAMMAR_MANIFEST_PATH == MANIFEST_PATH, "manifest_path")
	_check(String(manifest.get("shared_geography", "")) == "aurelian_authored_terrain_v1.glb", "shared_geography")

	var gate_a: Dictionary = manifest.get("gate_a", {})
	_check(String(gate_a.get("view", "")) == "village", "gate_a_view")
	_check(bool(gate_a.get("fixed_camera", false)), "fixed_camera")
	_check(bool(gate_a.get("unlabeled_strip", false)), "unlabeled_strip")
	_check(bool(gate_a.get("recognition_required", false)), "recognition_required")

	var bases: Dictionary = manifest.get("base_village_states", {})
	_check(String(bases.get("land", "")) == "claimed", "land_base")
	_check(String(bases.get("settlement", "")) == "founded", "settlement_base")
	for stage_name in ["city", "nation", "empire"]:
		_check(String(bases.get(stage_name, "")) == "city_chartered", "%s_base" % stage_name)

	var grammar: Dictionary = manifest.get("visual_grammar", {})
	var expected_extra := {
		"land": 0,
		"settlement": 3,
		"city": 10,
		"nation": 18,
		"empire": 30,
	}
	var previous := -1
	for stage_name in ["land", "settlement", "city", "nation", "empire"]:
		_check(grammar.has(stage_name), "grammar_%s" % stage_name)
		if grammar.has(stage_name):
			var data := grammar[stage_name] as Dictionary
			var count := int(data.get("extra_building_target", -1))
			_check(count == int(expected_extra[stage_name]), "extra_count_%s" % stage_name)
			_check(count > previous, "increasing_physical_density_%s" % stage_name)
			previous = count

	var fixed_camera: Dictionary = manifest.get("fixed_camera_contract", {})
	_check(String(fixed_camera.get("preset", "")) == "village", "camera_preset")
	_check(bool(fixed_camera.get("same_framing_all_stages", false)), "same_framing")
	_check(bool(fixed_camera.get("camera_zoom_not_stage_signal", false)), "no_zoom_signal")

	var forbidden: Array = manifest.get("forbidden", [])
	for required in [
		"camera zoom as primary progression",
		"labels as primary progression",
		"translucent rings as primary progression",
		"new asset family",
		"new geography",
		"main playable controller rewrite",
		"economy",
		"combat",
		"Third-Land Prospect",
		"MAX",
		"paid tools"
	]:
		_check(forbidden.has(required), "forbidden_%s" % required.replace(" ", "_"))

	_finish()

func _check(condition: bool, label: String) -> void:
	if not condition:
		_fail(label)

func _fail(label: String) -> void:
	failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("AURELIAN_FULL_PROGRESSION_VISUAL_GRAMMAR_V2_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("AURELIAN_FULL_PROGRESSION_VISUAL_GRAMMAR_V2_TEST_FAILURE: %s" % failure)
	print("AURELIAN_FULL_PROGRESSION_VISUAL_GRAMMAR_V2_TEST: FAIL (%d)" % failures.size())
	quit(1)
