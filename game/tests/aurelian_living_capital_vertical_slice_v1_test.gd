extends SceneTree

const MANIFEST_PATH := "res://scenes/aurelian/aurelian_living_capital_vertical_slice_v1_manifest.json"
const CONTROLLER_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1.gd"

var failures: Array[String] = []

func _initialize() -> void:
	var manifest := _read_json(MANIFEST_PATH)
	var controller := _read_text(CONTROLLER_PATH)
	_check(String(manifest.get("contract", "")) == "AURELIAN_LIVING_CAPITAL_VERTICAL_SLICE_V1", "contract")
	_check(int(manifest.get("authority_issue", 0)) == 506, "issue")
	_check(String(manifest.get("authority_baseline", "")) == "9550fd723ef4e82ab419e0a87b01eed290445534", "authority_baseline")
	var candidate: Dictionary = manifest.get("candidate", {})
	_check(bool(candidate.get("single_vertical_slice", false)), "single_slice")
	_check(String(candidate.get("primary_view", "")) == "village_greenvale_capital", "capital_primary")
	var visual: Dictionary = manifest.get("visual_targets", {})
	_check(bool(visual.get("settlement_city_capital_distinct_at_glance", false)), "state_distinction")
	_check(bool(visual.get("capital_civic_center_composition", false)), "civic_center")
	_check(bool(visual.get("capital_density_improved", false)), "capital_density")
	var motion: Dictionary = manifest.get("motion_targets", {})
	_check(bool(motion.get("accepted_transition_reveal", false)), "transition_reveal")
	_check(bool(motion.get("trade_activity_visible", false)), "trade_activity")
	_check(bool(motion.get("no_background_simulation", false)), "presentation_only")
	var states: Dictionary = manifest.get("accepted_states_preserved", {})
	_check(String(states.get("settlement", "")) == "village_founded", "settlement_state")
	_check(String(states.get("city", "")) == "village_city_chartered", "city_state")
	_check(String(states.get("capital", "")) == "village_greenvale_capital", "capital_state")
	_check(String(states.get("map", "")) == "map_aurelian_homeland", "map_state")
	_check(String(states.get("world", "")) == "world_first_nation_founded", "world_state")
	_check(String(states.get("persistence", "")) == "map_aurelian_homeland:east_trade", "persistence_state")
	_check(controller.contains("func _build_living_capital_presentation()"), "capital_builder")
	_check(controller.contains("GreenvaleLivingCapitalPresentation"), "capital_root")
	_check(controller.contains("CivicActivityRing"), "activity_ring")
	_check(controller.contains("CapitalPlaza"), "capital_plaza")
	_check(controller.contains("CivicQuarter%02d"), "civic_quarters")
	_check(controller.contains("CapitalLantern%02d"), "capital_lanterns")
	_check(controller.contains("func _animate_living_capital_presentation"), "motion_function")
	_check(controller.contains("Vector2(354.0, 285.0).lerp(Vector2(515.0, 340.0)"), "accepted_trade_topology")
	_check(controller.contains("func _reveal_living_capital()"), "reveal_function")
	_check(controller.contains("Tween.TRANS_BACK"), "reveal_tween")
	_check(controller.contains('living_capital_presentation.visible = state_name in ["village_greenvale_capital", "village_national_mandate_started", "village_aurelian_imperial_capital"]'), "capital_only_visibility")
	_check(controller.contains("_animate_living_capital_presentation(_delta)"), "runtime_motion")
	_finish()

func _read_json(path: String) -> Dictionary:
	var payload = JSON.parse_string(_read_text(path))
	if payload is Dictionary:
		return payload as Dictionary
	failures.append("json_%s" % path)
	return {}

func _read_text(path: String) -> String:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		failures.append("open_%s" % path)
		return ""
	return file.get_as_text()

func _check(condition: bool, label: String) -> void:
	if not condition:
		failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("AURELIAN_LIVING_CAPITAL_VERTICAL_SLICE_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("AURELIAN_LIVING_CAPITAL_VERTICAL_SLICE_V1_TEST_FAILURE: %s" % failure)
	print("AURELIAN_LIVING_CAPITAL_VERTICAL_SLICE_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
