extends SceneTree

const CONTROLLER = preload("res://scenes/aurelian/playable_aurelian_first_session_v1.gd")
const MANIFEST_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1_manifest.json"
const ENTRY_SCENE_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1.tscn"

var failures: Array[String] = []

func _initialize() -> void:
	var controller = CONTROLLER.new()
	_check(
		controller.core_session_action_for_state("world_first_empire_proclaimed") == "open_north_ridge",
		"empire_routes_to_expansion"
	)
	_check(
		controller.core_session_action_for_state("world_first_imperial_expansion_two_land_footprint") == "complete",
		"two_land_footprint_completes_session"
	)
	_check(
		controller.core_session_action_for_state("world_river_surge_crisis") == "legacy",
		"advanced_crisis_remains_legacy"
	)
	controller.free()

	var entry_scene := _read_text(ENTRY_SCENE_PATH)
	_check(
		entry_scene.contains('path="res://scenes/aurelian/playable_aurelian_first_session_v1.gd"'),
		"entry_scene_uses_first_session_wrapper"
	)

	var manifest := _read_json(MANIFEST_PATH)
	var core_session: Dictionary = manifest.get("core_session", {})
	_check(String(core_session.get("contract", "")) == "AURELIAN_CORE_PLAYABLE_LOOP_V1", "core_session_contract")
	_check(bool(core_session.get("default_interactive", false)), "core_session_default")
	_check(
		core_session.get("critical_beats", []) == ["claim", "develop", "choose", "consequence", "grow", "expand"],
		"six_beat_critical_path"
	)
	_check(String(core_session.get("meaningful_choice_state", "")) == "world_first_nation_founded", "meaningful_choice")
	_check(String(core_session.get("consequence_state", "")) == "village_national_mandate_started", "visible_consequence")
	_check(String(core_session.get("growth_state", "")) == "world_first_empire_proclaimed", "growth_payoff")
	_check(String(core_session.get("expansion_ready_state", "")) == "world_first_imperial_expansion_north_ridge_direction", "north_ridge_ready")
	_check(String(core_session.get("completion_state", "")) == "world_first_imperial_expansion_two_land_footprint", "completion_state")
	_check(int(core_session.get("completion_land_count", 0)) == 2, "two_land_completion")
	_check(bool(core_session.get("automated_regression_keeps_full_progression", false)), "legacy_regression_preserved")
	_check(
		String(core_session.get("legacy_full_progression_env", "")) == "AURELIAN_FULL_PROGRESSION=1",
		"manual_full_progression_escape_hatch"
	)

	_finish()

func _read_json(path: String) -> Dictionary:
	var text := _read_text(path)
	var payload = JSON.parse_string(text)
	if payload is Dictionary:
		return payload as Dictionary
	_fail("json_%s" % path)
	return {}

func _read_text(path: String) -> String:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		_fail("open_%s" % path)
		return ""
	return file.get_as_text()

func _check(condition: bool, label: String) -> void:
	if not condition:
		failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("AURELIAN_CORE_PLAYABLE_LOOP_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("AURELIAN_CORE_PLAYABLE_LOOP_V1_TEST_FAILURE: %s" % failure)
	print("AURELIAN_CORE_PLAYABLE_LOOP_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
