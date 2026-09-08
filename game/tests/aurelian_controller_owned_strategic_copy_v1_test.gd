extends SceneTree

const CONTROLLER = preload("res://scenes/aurelian/playable_aurelian_first_session_v6.gd")
const CONTROLLER_PATH := "res://scenes/aurelian/playable_aurelian_first_session_v6.gd"
const ENTRY_SCENE_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1.tscn"

var failures: Array[String] = []

func _initialize() -> void:
	var controller = CONTROLLER.new()
	var map_copy := controller.controller_owned_strategic_copy_for_state("map_aurelian_imperial_heartland")
	var world_copy := controller.controller_owned_strategic_copy_for_state("world_first_empire_proclaimed")
	_check(String(map_copy.get("layer", "")) == "MAP  |  WHERE", "map_where_owner")
	_check(String(map_copy.get("intent", "")).contains("Greenvale"), "map_copy_is_strategic")
	_check(String(world_copy.get("layer", "")) == "WORLD  |  WHY / DIRECTION", "world_direction_owner")
	_check(String(world_copy.get("intent", "")).contains("North Ridge"), "world_copy_is_strategic")
	_check(controller.controller_owned_strategic_copy_for_state("village_developed").is_empty(), "village_how_unchanged")
	controller.free()

	var source := _read_text(CONTROLLER_PATH)
	_check(source.contains("controller_owned_strategic_copy_for_state(entry_state)"), "existing_hud_owns_copy")
	_check(source.contains("layer_label.text = String(strategic_copy.get"), "existing_layer_label_reused")
	_check(source.contains("intent_label.text = String(strategic_copy.get"), "existing_intent_label_reused")
	_check(not source.contains("_hide_strategic_label_children"), "no_runtime_tree_traversal")
	_check(not source.contains("CanvasLayer.new()"), "no_new_canvas_layer")
	_check(not source.contains("func _input("), "no_parallel_input_handler")
	_check(not source.contains("func _unhandled_input("), "no_parallel_unhandled_input")
	_check(not source.contains("func _process("), "no_parallel_process_loop")

	var scene := _read_text(ENTRY_SCENE_PATH)
	_check(scene.contains('path="res://scenes/aurelian/playable_aurelian_first_session_v6.gd"'), "accepted_entry_unchanged")
	_check(not scene.contains("StrategicOverlay"), "no_parallel_scene_overlay")

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
		print("AURELIAN_CONTROLLER_OWNED_STRATEGIC_COPY_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("AURELIAN_CONTROLLER_OWNED_STRATEGIC_COPY_V1_TEST_FAILURE: %s" % failure)
	print("AURELIAN_CONTROLLER_OWNED_STRATEGIC_COPY_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
