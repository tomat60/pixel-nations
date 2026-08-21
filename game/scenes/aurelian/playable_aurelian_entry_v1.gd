extends "res://scenes/aurelian/aurelian_decision_loop_v1.gd"

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

func _ready() -> void:
	playable_contract = _load_playable_contract()
	if playable_contract.is_empty():
		get_tree().quit(91)
		return
	automated_input_mode = OS.get_environment("AURELIAN_CAPTURE_PLAYABLE_ENTRY") == "1"
	var evidence_state := OS.get_environment("AURELIAN_PLAYABLE_EVIDENCE_STATE").to_lower()
	if ENTRY_STATES.has(evidence_state):
		entry_state = evidence_state
		decision_state = evidence_state
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
