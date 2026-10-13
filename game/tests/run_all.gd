extends SceneTree

const STATE = preload("res://core/game_state.gd")
const SESSION = preload("res://core/playable_core_session.gd")

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
	_check(state.get("claimed_land_ids", []) == ["PN-A01-001"], "claimed_land_collection")

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
	_check(int(restored.get("schema_version", 0)) == 4, "save_schema")
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
	_check(String(progress.get("next_goal", "")) == "Inspect Riverbend, Greenvale's eastern neighbor", "progress_next_goal")
	_check(int(progress.get("inspected_frontiers", -1)) == 0, "progress_no_invented_frontier_inspection")

	var early_inspection := STATE.reduce(restored, {"type": "INSPECT_LAND", "land_id": "PN-A01-002"})
	_check(early_inspection.get("inspected_land_ids", []).is_empty(), "inspection_requires_selected_frontier")
	var before_road_inspection: Dictionary = STATE.replay([
		{"type": "SELECT_LAND", "land_id": "PN-A01-001"},
		{"type": "CLAIM_LAND", "land_id": "PN-A01-001"},
		{"type": "FOUND_SETTLEMENT", "name": "Greengate"},
		{"type": "SELECT_LAND", "land_id": "PN-A01-002"},
		{"type": "INSPECT_LAND", "land_id": "PN-A01-002"},
	])
	_check(before_road_inspection.get("inspected_land_ids", []).is_empty(), "inspection_requires_greengate_road")
	var inspected_state := STATE.reduce(restored, {"type": "SELECT_LAND", "land_id": "PN-A01-002"})
	inspected_state = STATE.reduce(inspected_state, {"type": "INSPECT_LAND", "land_id": "PN-A01-002"})
	_check(inspected_state.get("inspected_land_ids", []).has("PN-A01-002"), "riverbend_inspection_recorded")
	_check(int(STATE.progress(inspected_state).get("claimed_lands", 0)) == 1, "inspection_does_not_invent_claim")
	_check(String(STATE.progress(inspected_state).get("next_goal", "")) == "Choose whether to claim Riverbend", "inspection_advances_honest_goal")
	var inspected_restored := STATE.from_json(STATE.to_json(inspected_state))
	_check(inspected_restored.get("inspected_land_ids", []).has("PN-A01-002"), "inspection_persists")
	var claimed_frontier := STATE.reduce(inspected_state, {"type": "CLAIM_LAND", "land_id": "PN-A01-002"})
	_check(claimed_frontier.get("claimed_land_ids", []) == ["PN-A01-001", "PN-A01-002"], "riverbend_claim_recorded")
	_check(String(claimed_frontier.get("claimed_land_id", "")) == "PN-A01-001", "riverbend_claim_keeps_home_identity")
	var claimed_progress := STATE.progress(claimed_frontier)
	_check(int(claimed_progress.get("claimed_lands", 0)) == 2, "riverbend_claim_reports_two_lands")
	_check(bool(claimed_progress.get("riverbend_claimed", false)), "riverbend_claim_visible")
	_check(String(claimed_progress.get("nation_status", "")) == "not_founded", "riverbend_claim_does_not_invent_nation")
	_check(String(claimed_progress.get("next_goal", "")) == "Connect Riverbend to Greengate", "riverbend_claim_reveals_link_goal")
	var duplicate_frontier_claim := STATE.reduce(claimed_frontier, {"type": "CLAIM_LAND", "land_id": "PN-A01-002"})
	_check(duplicate_frontier_claim.get("claimed_land_ids", []).size() == 2, "riverbend_claim_idempotent")
	var claimed_frontier_restored := STATE.from_json(STATE.to_json(claimed_frontier))
	_check(claimed_frontier_restored.get("claimed_land_ids", []) == ["PN-A01-001", "PN-A01-002"], "riverbend_claim_persists")

	var legacy_payload := JSON.stringify({
		"schema_version": 1,
		"sector_id": "A-01",
		"claimed_land_id": "PN-A01-001",
		"settlement": {
			"founded": true,
			"name": "Greengate",
			"completed_orders": ["shelter"],
		},
		"resources": {
			"food": 2,
			"timber": 5,
		},
	})
	var migrated: Dictionary = STATE.from_json(legacy_payload)
	_check(int(migrated.get("schema_version", 0)) == 4, "legacy_schema_migrated")
	_check(String(migrated.get("selected_land_id", "")) == "PN-A01-001", "legacy_selection_recovered")
	_check(String(migrated.get("claimed_land_id", "")) == "PN-A01-001", "legacy_claim_preserved")
	_check(migrated.get("claimed_land_ids", []) == ["PN-A01-001"], "legacy_claim_collection_recovered")
	_check(bool(migrated.get("settlement", {}).get("founded", false)), "legacy_settlement_preserved")
	_check(migrated.get("settlement", {}).get("completed_orders", []).has("shelter"), "legacy_orders_preserved")
	_check(migrated.get("settlement", {}).get("built_improvements", []).is_empty(), "legacy_improvements_defaulted")
	_check(int(migrated.get("resources", {}).get("food", 0)) == 2, "legacy_food_preserved")
	_check(int(migrated.get("resources", {}).get("timber", 0)) == 5, "legacy_timber_preserved")
	_check(int(migrated.get("resources", {}).get("stone", 0)) == 10, "legacy_stone_defaulted")

	var malformed_save := JSON.stringify({
		"schema_version": 1,
		"sector_id": "A-01",
		"claimed_land_id": "A-01-0042",
		"settlement": {
			"founded": true,
			"name": "Impossible Settlement",
			"built_improvements": ["road"],
		},
	})
	var repaired: Dictionary = STATE.from_json(malformed_save)
	_check(String(repaired.get("claimed_land_id", "")).is_empty(), "malformed_claim_rejected")
	_check(not bool(repaired.get("settlement", {}).get("founded", false)), "malformed_settlement_rejected")
	_check(repaired.get("settlement", {}).get("built_improvements", []).is_empty(), "malformed_progress_rejected")
	var injected_frontier_save := JSON.stringify({
		"schema_version": 4,
		"claimed_land_id": "PN-A01-001",
		"claimed_land_ids": ["PN-A01-001", "PN-A01-002"],
		"inspected_land_ids": ["PN-A01-002"],
		"settlement": {"founded": true, "name": "Greengate", "built_improvements": []},
	})
	var repaired_frontier: Dictionary = STATE.from_json(injected_frontier_save)
	_check(repaired_frontier.get("claimed_land_ids", []) == ["PN-A01-001"], "frontier_claim_requires_persisted_road")
	_check(repaired_frontier.get("inspected_land_ids", []).is_empty(), "frontier_inspection_requires_persisted_road")

	_test_playable_session_round_trip()

	_finish()

func _test_playable_session_round_trip() -> void:
	var session = SESSION.new()
	_check(not session.enter_greengate(), "session_blocks_unclaimed_entry")
	_check(session.select_land("PN-A01-001"), "session_selects_greenvale")
	_check(session.claim_selected_land(), "session_claims_selected_land")
	_check(session.enter_greengate(), "session_enters_greengate")
	_check(session.current_view == SESSION.VIEW_VILLAGE, "session_village_view")

	var village_before: Dictionary = session.village_view_model()
	_check(String(village_before.get("settlement_name", "")) == "Greengate", "session_village_name")
	_check(int(village_before.get("stone", 0)) == 10, "session_village_starting_stone")
	_check(int(village_before.get("road_stone_cost", 0)) == 5, "session_village_road_cost_visible")
	_check(session.build_greengate_road(), "session_builds_road")
	_check(not session.build_greengate_road(), "session_blocks_duplicate_road")
	_check(session.return_to_world(), "session_returns_to_world")

	var world_after: Dictionary = session.world_view_model()
	_check(int(world_after.get("claimed_lands", 0)) == 1, "session_world_claimed_progress")
	_check(int(world_after.get("charted_lands", 0)) == 30, "session_world_charted_progress")
	_check(String(world_after.get("settlement_name", "")) == "Greengate", "session_world_settlement_progress")
	_check(bool(world_after.get("road_built", false)), "session_world_road_progress")
	_check(String(world_after.get("nation_status", "")) == "not_founded", "session_world_honest_nation_status")
	_check(String(world_after.get("next_goal", "")) == "Inspect Riverbend, Greenvale's eastern neighbor", "session_world_next_goal")
	_check(session.select_land("PN-A01-002"), "session_selects_riverbend")
	_check(session.inspect_selected_frontier(), "session_inspects_riverbend")
	_check(not session.inspect_selected_frontier(), "session_blocks_duplicate_inspection")
	var inspected_world: Dictionary = session.world_view_model()
	_check(bool(inspected_world.get("riverbend_inspected", false)), "session_world_reports_riverbend_inspection")
	_check(int(inspected_world.get("claimed_lands", 0)) == 1, "session_inspection_keeps_one_claim")
	_check(String(inspected_world.get("next_goal", "")) == "Choose whether to claim Riverbend", "session_world_claim_goal_truthful")
	_check(session.claim_selected_land(), "session_claims_inspected_riverbend")
	_check(not session.claim_selected_land(), "session_blocks_duplicate_riverbend_claim")
	var claimed_world: Dictionary = session.world_view_model()
	_check(int(claimed_world.get("claimed_lands", 0)) == 2, "session_world_reports_two_claimed_lands")
	_check(bool(claimed_world.get("riverbend_claimed", false)), "session_world_reports_riverbend_claim")
	_check(String(claimed_world.get("settlement_name", "")) == "Greengate", "session_frontier_keeps_single_settlement")
	_check(String(claimed_world.get("nation_status", "")) == "not_founded", "session_frontier_keeps_nation_unfounded")
	_check(String(claimed_world.get("next_goal", "")) == "Connect Riverbend to Greengate", "session_world_link_goal_truthful")

	var save_path := "user://playable-core-session-test.json"
	_check(session.save_to_path(save_path), "session_save")
	var reopened = SESSION.new()
	_check(reopened.load_from_path(save_path), "session_reopen")
	_check(reopened.current_view == SESSION.VIEW_WORLD, "session_reopen_starts_world")
	var reopened_world: Dictionary = reopened.world_view_model()
	_check(bool(reopened_world.get("road_built", false)), "session_reopen_road_persisted")
	_check(bool(reopened_world.get("riverbend_inspected", false)), "session_reopen_inspection_persisted")
	_check(bool(reopened_world.get("riverbend_claimed", false)), "session_reopen_frontier_claim_persisted")
	_check(int(reopened_world.get("claimed_lands", 0)) == 2, "session_reopen_two_claims_persisted")
	_check(String(reopened_world.get("next_goal", "")) == "Connect Riverbend to Greengate", "session_reopen_goal_persisted")
	DirAccess.remove_absolute(ProjectSettings.globalize_path(save_path))

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
