extends SceneTree

const GameStateScript = preload("res://core/game_state.gd")

var failures: Array[String] = []

func _initialize() -> void:
	_test_golden_run()
	_test_idempotent_order()
	_test_invalid_sequence_is_safe()
	_test_save_load_round_trip()

	if failures.is_empty():
		print("PIXEL_NATIONS_GODOT_TESTS: PASS")
		quit(0)
	else:
		for failure in failures:
			push_error(failure)
		print("PIXEL_NATIONS_GODOT_TESTS: FAIL (%d)" % failures.size())
		quit(1)

func _test_golden_run() -> void:
	var fixture := _load_golden_fixture()
	if fixture.is_empty():
		_fail("golden fixture could not be loaded")
		return
	var actual := GameStateScript.replay(fixture.get("actions", []))
	var expected: Dictionary = fixture.get("expected_state", {})
	_expect_equal(actual, expected, "golden action replay")

func _test_idempotent_order() -> void:
	var fixture := _load_golden_fixture()
	var actions: Array = fixture.get("actions", []).duplicate(true)
	actions.append({"type": "COMPLETE_VILLAGE_ORDER", "order_id": "shelter"})
	var actual := GameStateScript.replay(actions)
	var expected: Dictionary = fixture.get("expected_state", {})
	_expect_equal(actual, expected, "repeating the same Village order must be idempotent")

func _test_invalid_sequence_is_safe() -> void:
	var actual := GameStateScript.replay([
		{"type": "FOUND_SETTLEMENT", "name": "Too Early"},
		{"type": "COMPLETE_VILLAGE_ORDER", "order_id": "shelter"},
	])
	_expect_equal(actual, GameStateScript.initial_state(), "invalid actions must not mutate state")

func _test_save_load_round_trip() -> void:
	var fixture := _load_golden_fixture()
	var original := GameStateScript.replay(fixture.get("actions", []))
	var payload := GameStateScript.to_json(original)
	var restored := GameStateScript.from_json(payload)
	_expect_equal(restored, original, "JSON save/load round trip")

func _load_golden_fixture() -> Dictionary:
	var file := FileAccess.open("res://tests/fixtures/golden_run_v1.json", FileAccess.READ)
	if file == null:
		return {}
	var parsed = JSON.parse_string(file.get_as_text())
	if parsed is Dictionary:
		return parsed
	return {}

func _expect_equal(actual: Variant, expected: Variant, label: String) -> void:
	var normalized_actual := _normalize(actual)
	var normalized_expected := _normalize(expected)
	if normalized_actual != normalized_expected:
		_fail("%s mismatch\nexpected=%s\nactual=%s" % [label, JSON.stringify(normalized_expected), JSON.stringify(normalized_actual)])

func _normalize(value: Variant) -> Variant:
	if value is Dictionary:
		var normalized_dictionary := {}
		for key in value.keys():
			normalized_dictionary[key] = _normalize(value[key])
		return normalized_dictionary
	if value is Array:
		var normalized_array := []
		for item in value:
			normalized_array.append(_normalize(item))
		return normalized_array
	if value is int or value is float:
		return float(value)
	return value

func _fail(message: String) -> void:
	failures.append(message)
