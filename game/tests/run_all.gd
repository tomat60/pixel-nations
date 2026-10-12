extends SceneTree

const STATE = preload("res://core/game_state.gd")

var failures = []

func _init() -> void:
	var fixture_file = FileAccess.open("res://tests/fixtures/golden_run_v1.json", FileAccess.READ)
	if fixture_file == null:
		_fail("fixture_open")
		_finish()
		return

	var fixture = JSON.parse_string(fixture_file.get_as_text())
	if not fixture is Dictionary:
		_fail("fixture_parse")
		_finish()
		return

	var actions = fixture.get("actions", [])
	var state = STATE.replay(actions)
	_check(STATE.CANONICAL_LAND_IDS.size() == 30, "canonical_land_count")
	_check(STATE.CANONICAL_LAND_IDS.front() == "PN-A01-001", "canonical_land_first")
	_check(STATE.CANONICAL_LAND_IDS.back() == "PN-A01-030", "canonical_land_last")
	_check(String(state.get("selected_land_id", "")) == "PN-A01-001", "selected_land")
	_check(String(state.get("claimed_land_id", "")) == "PN-A01-001", "claimed_land")

	var settlement = state.get("settlement", {})
	_check(bool(settlement.get("founded", false)), "settlement_founded")
	_check(String(settlement.get("name", "")) == "Greengate", "settlement_name")
	_check(settlement.get("built_improvements", []).has("road"), "road_built")
	_check(int(state.get("resources", {}).get("stone", 0)) == 5, "road_cost")

	var duplicate_actions = actions.duplicate(true)
	duplicate_actions.append({"type": "BUILD_ROAD"})
	var duplicate_state = STATE.replay(duplicate_actions)
	_check(duplicate_state.get("settlement", {}).get("built_improvements", []).size() == 1, "road_idempotence")
	_check(int(duplicate_state.get("resources", {}).get("stone", 0)) == 5, "road_cost_idempotence")

	var invalid_state = STATE.replay([
		{"type": "SELECT_LAND", "land_id": "PN-A01-999"},
		{"type": "CLAIM_LAND", "land_id": "PN-A01-999"},
		{"type": "FOUND_SETTLEMENT", "name": "Too Early"},
		{"type": "BUILD_ROAD"},
	])
	_check(String(invalid_state.get("selected_land_id", "")).is_empty(), "canonical_selection_guard")
	_check(String(invalid_state.get("claimed_land_id", "")).is_empty(), "invalid_claim_guard")
	_check(not bool(invalid_state.get("settlement", {}).get("founded", false)), "invalid_settlement_guard")

	var low_resource_state: Dictionary = STATE.replay([
		{"type": "SELECT_LAND", "land_id": "PN-A01-001"},
		{"type": "CLAIM_LAND", "land_id": "PN-A01-001"},
		{"type": "FOUND_SETTLEMENT", "name": "Greengate"},
	])
	low_resource_state["resources"]["stone"] = STATE.ROAD_STONE_COST - 1
	low_resource_state = STATE.reduce(low_resource_state, {"type": "BUILD_ROAD"})
	_check(not low_resource_state.get("settlement", {}).get("built_improvements", []).has("road"), "road_cost_guard")
	_check(int(low_resource_state.get("resources", {}).get("stone", 0)) == STATE.ROAD_STONE_COST - 1, "road_cost_guard_preserves_resources")

	var restored = STATE.from_json(STATE.to_json(state))
	_check(String(restored.get("selected_land_id", "")) == "PN-A01-001", "save_selection")
	_check(String(restored.get("claimed_land_id", "")) == "PN-A01-001", "save_claim")
	_check(bool(restored.get("settlement", {}).get("founded", false)), "save_settlement")
	_check(restored.get("settlement", {}).get("built_improvements", []).has("road"), "save_road")
	_check(int(restored.get("resources", {}).get("stone", 0)) == 5, "save_road_cost")

	var progress: Dictionary = STATE.progress(restored)
	_check(int(progress.get("claimed_lands", 0)) == 1, "progress_claimed_land")
	_check(int(progress.get("charted_lands", 0)) == 30, "progress_charted_lands")
	_check(bool(progress.get("settlement_founded", false)), "progress_settlement")
	_check(bool(progress.get("road_built", false)), "progress_road")
	_check(String(progress.get("nation_status", "")) == "not_founded", "progress_honest_nation_status")
	_check(String(progress.get("next_goal", "")) == "Inspect a neighboring A-01 land", "progress_next_goal")

	_finish()

func _check(condition: bool, label: String) -> void:
	if not condition:
		_fail(label)

func _fail(label: String) -> void:
	failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("PIXEL_NATIONS_GODOT_TESTS: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("PIXEL_NATIONS_GODOT_TEST_FAILURE: %s" % failure)
	print("PIXEL_NATIONS_GODOT_TESTS: FAIL (%d)" % failures.size())
	quit(1)
