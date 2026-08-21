extends "res://scenes/aurelian/aurelian_decision_loop_v1.gd"

const SESSION := preload("res://scenes/aurelian/aurelian_session_persistence_v1.gd")

const PLAYABLE_MANIFEST_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1_manifest.json"
const ENTRY_STATES := [
	"world_neutral",
	"world_trade_selected",
	"map_east_route",
	"village_route_context",
]

var entry_state := "world_neutral"
var playable_contract: Dictionary = {}
var hud_layer: CanvasLayer
var layer_label: Label
var intent_label: Label
var controls_label: Label
var automated_input_mode := false
var automated_frame := 0
var persistence_enabled := true
var restored_intent := "none"

func _ready() -> void:
	if DisplayServer.get_name() == "headless" and not ResourceLoader.exists(GLB_PATH):
		print("PLAYABLE_AURELIAN_HEADLESS_SMOKE=PASS_NO_RENDER_ASSET")
		get_tree().quit(0)
		return
	playable_contract = _load_playable_contract()
	if playable_contract.is_empty():
		get_tree().quit(91)
		return
	automated_input_mode = OS.get_environment("AURELIAN_CAPTURE_PLAYABLE_ENTRY") == "1"
	var evidence_state := OS.get_environment("AURELIAN_PLAYABLE_EVIDENCE_STATE").to_lower()
	persistence_enabled = evidence_state.is_empty() and not automated_input_mode
	if not OS.get_environment("AURELIAN_EVIDENCE_DIR").is_empty():
		get_window().content_scale_size = STILL_SIZE
		get_window().content_scale_aspect = Window.CONTENT_SCALE_ASPECT_IGNORE
		get_window().size = STILL_SIZE
	if ENTRY_STATES.has(evidence_state):
		entry_state = evidence_state
		decision_state = evidence_state
	else:
		var restored := SESSION.load_session()
		entry_state = String(restored.get("entry_state", "world_neutral"))
		restored_intent = String(restored.get("selected_intent", "none"))
		decision_state = entry_state
		print("AURELIAN_SESSION_LOAD=%s:%s:%s" % [String(restored.get("status", "unknown")), entry_state, restored_intent])
	_configure_state_environment(entry_state)
	super()
	if cameras.is_empty():
		return
	_build_runtime_hud()
	_apply_entry_state(entry_state)
	set_process_unhandled_input(true)
	if automated_input_mode:
		set_process(true)
	print("PLAYABLE_AURELIAN_ENTRY_READY=%s" % entry_state)
	if not evidence_dir.is_empty():
		call_deferred("_capture_playable_still")
	elif DisplayServer.get_name() == "headless" and not automated_input_mode:
		call_deferred("_complete_headless_smoke")

func _configure_state_environment(state_name: String) -> void:
	var states: Dictionary = decision_contract.get("states", {})
	if not states.has(state_name):
		return
	var state: Dictionary = states[state_name]
	OS.set_environment("AURELIAN_WORLD_STATE", String(state.get("world_state", "neutral")))
	OS.set_environment("AURELIAN_MAP_STATE", String(state.get("map_state", "no_selection")))
	OS.set_environment("AURELIAN_VILLAGE_STATE", String(state.get("village_state", "developed")))
	OS.set_environment("AURELIAN_CAPTURE_PRESET", "")

func _capture_playable_still() -> void:
	DirAccess.make_dir_recursive_absolute(evidence_dir)
	for _frame in range(8):
		await get_tree().process_frame
	await RenderingServer.frame_post_draw
	var image := get_viewport().get_texture().get_image()
	if image == null or image.is_empty():
		push_error("PLAYABLE_AURELIAN_EMPTY_CAPTURE")
		get_tree().quit(92)
		return
	if image.get_size() != STILL_SIZE:
		push_error("PLAYABLE_AURELIAN_WRONG_CAPTURE_SIZE=%s" % image.get_size())
		get_tree().quit(93)
		return
	var output_path := evidence_dir.path_join("playable-1440x900.png")
	if image.save_png(output_path) != OK:
		push_error("PLAYABLE_AURELIAN_CAPTURE_SAVE_FAILED=%s" % output_path)
		get_tree().quit(94)
		return
	print("PLAYABLE_AURELIAN_STILL=%s:%s" % [entry_state, output_path])
	get_tree().quit(0)

func _complete_headless_smoke() -> void:
	await get_tree().process_frame
	print("PLAYABLE_AURELIAN_HEADLESS_SMOKE=PASS")
	get_tree().quit(0)

func _load_playable_contract() -> Dictionary:
	var file := FileAccess.open(PLAYABLE_MANIFEST_PATH, FileAccess.READ)
	if file == null:
		push_error("PLAYABLE_AURELIAN_MANIFEST_MISSING")
		return {}
	var payload = JSON.parse_string(file.get_as_text())
	if not payload is Dictionary:
		push_error("PLAYABLE_AURELIAN_MANIFEST_INVALID")
		return {}
	var contract := payload as Dictionary
	if String(contract.get("contract", "")) != "GODOT_PLAYABLE_AURELIAN_ENTRY_V1":
		push_error("PLAYABLE_AURELIAN_CONTRACT_INVALID")
		return {}
	return contract

func _build_runtime_hud() -> void:
	hud_layer = CanvasLayer.new()
	hud_layer.name = "PlayableEntryHUD"
	add_child(hud_layer)
	var panel := ColorRect.new()
	panel.name = "DecisionLayerPanel"
	panel.position = Vector2(32, 28)
	panel.size = Vector2(570, 128)
	panel.color = Color("#24312ddd")
	hud_layer.add_child(panel)
	var content := VBoxContainer.new()
	content.position = Vector2(22, 14)
	content.size = Vector2(526, 100)
	content.add_theme_constant_override("separation", 4)
	panel.add_child(content)
	layer_label = Label.new()
	layer_label.add_theme_font_size_override("font_size", 24)
	content.add_child(layer_label)
	intent_label = Label.new()
	intent_label.add_theme_font_size_override("font_size", 17)
	content.add_child(intent_label)
	controls_label = Label.new()
	controls_label.add_theme_font_size_override("font_size", 15)
	controls_label.modulate = Color("#d8e4d6")
	content.add_child(controls_label)

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_accept") or event.is_action_pressed("ui_right"):
		_advance_entry()
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_left") or event.is_action_pressed("ui_cancel"):
		_previous_entry()
		get_viewport().set_input_as_handled()

func _advance_entry() -> void:
	match entry_state:
		"world_neutral":
			_apply_entry_state("world_trade_selected")
		"world_trade_selected":
			_apply_entry_state("map_east_route")
		"map_east_route":
			_apply_entry_state("village_route_context")

func _previous_entry() -> void:
	match entry_state:
		"village_route_context":
			_apply_entry_state("map_east_route")
		"map_east_route":
			_apply_entry_state("world_trade_selected")
		"world_trade_selected":
			_apply_entry_state("world_neutral")

func _apply_entry_state(state_name: String) -> void:
	if not ENTRY_STATES.has(state_name):
		push_error("PLAYABLE_AURELIAN_UNKNOWN_STATE=%s" % state_name)
		return
	entry_state = state_name
	main_world_overlay_root.visible = state_name.begins_with("world_")
	main_overlay_root.visible = state_name == "map_east_route"
	main_decision_overlay_root.visible = state_name == "village_route_context"
	match state_name:
		"world_neutral":
			_apply_world_state(main_world_overlay_root, "neutral")
			_activate_camera("world")
		"world_trade_selected":
			_apply_world_state(main_world_overlay_root, "selected_trade")
			_activate_camera("world")
		"map_east_route":
			_apply_map_state(main_overlay_root, "selected")
			_activate_camera("map")
		"village_route_context":
			_activate_camera("village")
	_update_runtime_hud()
	if persistence_enabled:
		restored_intent = "none" if entry_state == "world_neutral" else "east_trade"
		var save_error := SESSION.save_session(entry_state, restored_intent)
		if save_error != OK:
			push_error("AURELIAN_SESSION_SAVE_FAILED=%s" % save_error)
		else:
			print("AURELIAN_SESSION_SAVE=%s:%s" % [entry_state, restored_intent])
	print("PLAYABLE_AURELIAN_ENTRY_STATE=%s" % entry_state)

func _update_runtime_hud() -> void:
	if layer_label == null:
		return
	match entry_state:
		"world_neutral":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "Choose Aurelian's strategic direction"
			controls_label.text = "[ENTER / RIGHT] Select eastern Trade"
		"world_trade_selected":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "Trade selected: eastern route opportunity"
			controls_label.text = "[ENTER / RIGHT] Open Map    [LEFT] Clear"
		"map_east_route":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "East Route selected near Gilded Crossing"
			controls_label.text = "[ENTER / RIGHT] Open Village    [LEFT] World"
		"village_route_context":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "Greenvale route capacity connects to the crossing"
			controls_label.text = "[LEFT / ESC] Return to Map"

func _emit_action(action_name: String) -> void:
	var event := InputEventAction.new()
	event.action = action_name
	event.pressed = true
	Input.parse_input_event(event)
	event = InputEventAction.new()
	event.action = action_name
	event.pressed = false
	Input.parse_input_event(event)

func _process(_delta: float) -> void:
	if not automated_input_mode:
		super(_delta)
		return
	automated_frame += 1
	if automated_frame == 120:
		_emit_action("ui_accept")
	elif automated_frame == 270:
		_emit_action("ui_right")
	elif automated_frame == 420:
		_emit_action("ui_right")
	elif automated_frame == 570:
		_emit_action("ui_left")
	elif automated_frame == 690:
		_emit_action("ui_left")
	elif automated_frame >= 810:
		print("PLAYABLE_AURELIAN_INPUT_SEQUENCE_COMPLETE=810")
		get_tree().quit(0)
