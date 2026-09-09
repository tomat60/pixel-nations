extends SceneTree

const CONTROLLER = preload("res://scenes/aurelian/playable_aurelian_first_session_v6.gd")
const CONTROLLER_PATH := "res://scenes/aurelian/playable_aurelian_first_session_v6.gd"
const ENTRY_SCENE_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1.tscn"

var failures: Array[String] = []

func _initialize() -> void:
	var controller = CONTROLLER.new()
	for action in ["ui_accept", "ui_left", "ui_right", "ui_up", "ui_down"]:
		var release := InputEventAction.new()
		release.action = action
		release.pressed = false
		_check(controller._released_public_input_action(release) == action, "release_%s" % action)
	var unknown := InputEventAction.new()
	unknown.action = "ui_cancel"
	unknown.pressed = false
	_check(controller._released_public_input_action(unknown).is_empty(), "ignore_unowned_release")
	controller.free()

	var source := _read_text(CONTROLLER_PATH)
	_check(source.contains("var input_release_generation := 0"), "monotonic_release_generation")
	_check(source.contains("PLAYABLE_AURELIAN_INPUT_RELEASE_RECEIPT="), "public_release_receipt")
	_check(source.contains("super(event)"), "accepted_base_input_owner_preserved")
	_check(not source.contains("await get_tree().create_timer"), "no_timing_wait")
	_check(not source.contains("Input.action_press"), "no_synthetic_action")
	_check(not source.contains("Input.parse_input_event"), "no_direct_input_injection")

	var scene := _read_text(ENTRY_SCENE_PATH)
	_check(scene.contains('path="res://scenes/aurelian/playable_aurelian_first_session_v6.gd"'), "single_controller_script")
	_check(not scene.contains("InputReleaseBoundary"), "no_parallel_scene_owner")

	_finish()

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
		print("AURELIAN_INPUT_RELEASE_BOUNDARY_V2_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("AURELIAN_INPUT_RELEASE_BOUNDARY_V2_TEST_FAILURE: %s" % failure)
	print("AURELIAN_INPUT_RELEASE_BOUNDARY_V2_TEST: FAIL (%d)" % failures.size())
	quit(1)
