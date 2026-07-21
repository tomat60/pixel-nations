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
	_check(String(state.get("claimed_land_id", "")) == "A-01-0042", "claimed_land")

	var settlement = state.get("settlement", {})
	_check(bool(settlement.get("founded", false)), "settlement_founded")
	_check(String(settlement.get("name", "")) == "Aurelian Haven", "settlement_name")
	_check(settlement.get("completed_orders", []).size() == 1, "order_count")
	_check(settlement.get("completed_orders", []).has("shelter"), "shelter_order")
	_check(int(state.get("resources", {}).get("timber", 0)) == 5, "shelter_reward")

	var duplicate_actions = actions.duplicate(true)
	duplicate_actions.append({"type": "COMPLETE_VILLAGE_ORDER", "order_id": "shelter"})
	var duplicate_state = STATE.replay(duplicate_actions)
	_check(duplicate_state.get("settlement", {}).get("completed_orders", []).size() == 1, "order_idempotence")
	_check(int(duplicate_state.get("resources", {}).get("timber", 0)) == 5, "reward_idempotence")

	var invalid_state = STATE.replay([
		{"type": "FOUND_SETTLEMENT", "name": "Too Early"},
		{"type": "COMPLETE_VILLAGE_ORDER", "order_id": "shelter"},
	])
	_check(String(invalid_state.get("claimed_land_id", "")).is_empty(), "invalid_claim_guard")
	_check(not bool(invalid_state.get("settlement", {}).get("founded", false)), "invalid_settlement_guard")

	var restored = STATE.from_json(STATE.to_json(state))
	_check(String(restored.get("claimed_land_id", "")) == "A-01-0042", "save_claim")
	_check(bool(restored.get("settlement", {}).get("founded", false)), "save_settlement")
	_check(restored.get("settlement", {}).get("completed_orders", []).has("shelter"), "save_order")
	_check(int(restored.get("resources", {}).get("timber", 0)) == 5, "save_reward")

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
