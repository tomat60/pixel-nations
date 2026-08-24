extends "res://scenes/aurelian/aurelian_decision_loop_v1.gd"

const SESSION := preload("res://scenes/aurelian/aurelian_session_persistence_v2.gd")

const PLAYABLE_MANIFEST_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1_manifest.json"
const ENTRY_STATES := [
	"world_neutral",
	"world_trade_selected",
	"map_east_route_selected",
	"map_east_route_claimed",
	"map_east_route_connected",
	"world_trade_route_active",
	"village_claimed",
	"village_founded",
	"village_developed",
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
var settlement_founded := false
var settlement_developed := false
var route_connected := false

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
		settlement_founded = evidence_state in ["village_founded", "village_developed"]
		settlement_developed = evidence_state in ["village_developed", "map_east_route_connected", "world_trade_route_active"]
		route_connected = evidence_state in ["map_east_route_connected", "world_trade_route_active"]
	else:
		var restored := SESSION.load_session()
		entry_state = String(restored.get("entry_state", "world_neutral"))
		restored_intent = String(restored.get("selected_intent", "none"))
		settlement_founded = bool(restored.get("settlement_founded", false))
		settlement_developed = bool(restored.get("settlement_developed", false))
		route_connected = bool(restored.get("route_connected", false))
		print("AURELIAN_SESSION_V2_LOAD=%s:%s:%s:%s:%s:%s:%s" % [String(restored.get("status", "unknown")), String(restored.get("adapter", "unknown")), entry_state, restored_intent, settlement_founded, settlement_developed, route_connected])
	if not ENTRY_STATES.has(entry_state):
		entry_state = "world_neutral"
		restored_intent = "none"
		settlement_founded = false
		settlement_developed = false
		route_connected = false
	if entry_state in ["village_founded", "village_developed", "map_east_route_connected", "world_trade_route_active"]:
		settlement_founded = true
	if entry_state in ["village_developed", "map_east_route_connected", "world_trade_route_active"]:
		settlement_developed = true
	if entry_state in ["map_east_route_connected", "world_trade_route_active"]:
		route_connected = true
	decision_state = _decision_state_for_entry(entry_state)
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

func _decision_state_for_entry(state_name: String) -> String:
	match state_name:
		"map_east_route_selected", "map_east_route_claimed", "map_east_route_connected":
			return "map_east_route"
		"world_trade_route_active":
			return "world_trade_selected"
		"village_claimed", "village_founded", "village_developed":
			return "village_route_context"
		_:
			return state_name

func _configure_state_environment(state_name: String) -> void:
	match state_name:
		"map_east_route_selected":
			OS.set_environment("AURELIAN_WORLD_STATE", "selected_trade")
			OS.set_environment("AURELIAN_MAP_STATE", "selected")
			OS.set_environment("AURELIAN_VILLAGE_STATE", "developed")
			OS.set_environment("AURELIAN_CAPTURE_PRESET", "")
			return
		"map_east_route_claimed", "map_east_route_connected":
			OS.set_environment("AURELIAN_WORLD_STATE", "selected_trade")
			OS.set_environment("AURELIAN_MAP_STATE", "east_route_claimed")
			OS.set_environment("AURELIAN_VILLAGE_STATE", "developed" if settlement_developed else ("founded" if settlement_founded else "claimed"))
			OS.set_environment("AURELIAN_CAPTURE_PRESET", "")
			return
		"world_trade_route_active":
			OS.set_environment("AURELIAN_WORLD_STATE", "selected_trade")
			OS.set_environment("AURELIAN_MAP_STATE", "east_route_claimed")
			OS.set_environment("AURELIAN_VILLAGE_STATE", "developed")
			OS.set_environment("AURELIAN_CAPTURE_PRESET", "")
			return
		"village_claimed":
			OS.set_environment("AURELIAN_WORLD_STATE", "selected_trade")
			OS.set_environment("AURELIAN_MAP_STATE", "east_route_claimed")
			OS.set_environment("AURELIAN_VILLAGE_STATE", "claimed")
			OS.set_environment("AURELIAN_CAPTURE_PRESET", "")
			return
		"village_founded":
			OS.set_environment("AURELIAN_WORLD_STATE", "selected_trade")
			OS.set_environment("AURELIAN_MAP_STATE", "east_route_claimed")
			OS.set_environment("AURELIAN_VILLAGE_STATE", "founded")
			OS.set_environment("AURELIAN_CAPTURE_PRESET", "")
			return
		"village_developed":
			OS.set_environment("AURELIAN_WORLD_STATE", "selected_trade")
			OS.set_environment("AURELIAN_MAP_STATE", "east_route_claimed")
			OS.set_environment("AURELIAN_VILLAGE_STATE", "developed")
			OS.set_environment("AURELIAN_CAPTURE_PRESET", "")
			return
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
	if event.is_action_pressed("ui_accept"):
		_accept_entry()
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_right"):
		_right_entry()
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_left") or event.is_action_pressed("ui_cancel"):
		_previous_entry()
		get_viewport().set_input_as_handled()

func _accept_entry() -> void:
	match entry_state:
		"world_neutral":
			_apply_entry_state("world_trade_selected")
		"map_east_route_selected", "map_east_route":
			settlement_founded = false
			_apply_entry_state("map_east_route_claimed")
		"village_claimed":
			settlement_founded = true
			_apply_entry_state("village_founded")
			print("AURELIAN_FIRST_SETTLEMENT_FOUNDING=GREENVALE")
		"village_founded":
			settlement_developed = true
			_apply_entry_state("village_developed")
			print("AURELIAN_FIRST_SETTLEMENT_DEVELOPMENT=GREENVALE")
		"map_east_route_claimed":
			if settlement_developed:
				route_connected = true
				_apply_entry_state("map_east_route_connected")
				print("AURELIAN_FIRST_TRADE_ROUTE_CONNECTION=EAST_ROUTE")

func _right_entry() -> void:
	match entry_state:
		"world_trade_selected":
			_apply_entry_state("map_east_route_claimed" if settlement_founded else "map_east_route_selected")
		"world_trade_route_active":
			_apply_entry_state("map_east_route_connected")
		"map_east_route_claimed":
			_apply_entry_state("village_developed" if settlement_developed else ("village_founded" if settlement_founded else "village_claimed"))
		"map_east_route_connected":
			_apply_entry_state("village_developed")
		"map_east_route":
			_apply_entry_state("village_route_context")

func _previous_entry() -> void:
	match entry_state:
		"village_claimed", "village_founded":
			_apply_entry_state("map_east_route_claimed")
		"village_developed":
			_apply_entry_state("map_east_route_connected" if route_connected else "map_east_route_claimed")
		"map_east_route_claimed", "map_east_route_selected", "map_east_route":
			_apply_entry_state("world_trade_selected")
		"map_east_route_connected":
			_apply_entry_state("world_trade_route_active")
		"village_route_context":
			_apply_entry_state("map_east_route")
		"world_trade_selected":
			_apply_entry_state("world_neutral")

func _hide_preclaim_greenvale() -> bool:
	var all_nodes: Array = state_contract.get("all_nodes", [])
	if all_nodes.is_empty():
		push_error("AURELIAN_FIRST_LAND_CLAIM_PRECLAIM_NODES_MISSING")
		return false
	for node_name_variant in all_nodes:
		var node_name := String(node_name_variant)
		var node := _named_node(main_basin, node_name)
		if node == null:
			return false
		node.visible = false
	return true

func _apply_entry_state(state_name: String) -> void:
	if not ENTRY_STATES.has(state_name):
		push_error("PLAYABLE_AURELIAN_UNKNOWN_STATE=%s" % state_name)
		return
	entry_state = state_name
	main_world_overlay_root.visible = state_name.begins_with("world_")
	main_overlay_root.visible = state_name.begins_with("map_")
	main_decision_overlay_root.visible = state_name in ["village_route_context", "map_east_route_connected", "world_trade_route_active"]
	match state_name:
		"world_neutral":
			if not _hide_preclaim_greenvale():
				push_error("AURELIAN_FIRST_LAND_CLAIM_PRECLAIM_VISIBILITY_FAILED")
			_apply_world_state(main_world_overlay_root, "neutral")
			_activate_camera("world")
		"world_trade_selected":
			if settlement_founded:
				if not _apply_village_state(main_basin, "developed" if settlement_developed else "founded"):
					push_error("AURELIAN_FIRST_SETTLEMENT_FOUNDING_VILLAGE_STATE_FAILED")
			else:
				if not _hide_preclaim_greenvale():
					push_error("AURELIAN_FIRST_LAND_CLAIM_PRECLAIM_VISIBILITY_FAILED")
			_apply_world_state(main_world_overlay_root, "selected_trade")
			_activate_camera("world")
		"world_trade_route_active":
			if not _apply_village_state(main_basin, "developed"):
				push_error("AURELIAN_FIRST_TRADE_ROUTE_CONNECTION_VILLAGE_STATE_FAILED")
			_apply_world_state(main_world_overlay_root, "selected_trade")
			_activate_camera("world")
		"map_east_route_selected":
			if not _hide_preclaim_greenvale():
				push_error("AURELIAN_FIRST_LAND_CLAIM_PRECLAIM_VISIBILITY_FAILED")
			_apply_map_state(main_overlay_root, "selected")
			_activate_camera("map")
		"map_east_route":
			_apply_map_state(main_overlay_root, "selected")
			_activate_camera("map")
		"map_east_route_claimed":
			_apply_map_state(main_overlay_root, "east_route_claimed")
			if not _apply_village_state(main_basin, "developed" if settlement_developed else ("founded" if settlement_founded else "claimed")):
				push_error("AURELIAN_FIRST_SETTLEMENT_FOUNDING_VILLAGE_STATE_FAILED" if settlement_founded else "AURELIAN_FIRST_LAND_CLAIM_VILLAGE_STATE_FAILED")
			_activate_camera("map")
			print("AURELIAN_FIRST_LAND_CLAIM=EAST_ROUTE")
		"map_east_route_connected":
			_apply_map_state(main_overlay_root, "east_route_claimed")
			if not _apply_village_state(main_basin, "developed"):
				push_error("AURELIAN_FIRST_TRADE_ROUTE_CONNECTION_VILLAGE_STATE_FAILED")
			_activate_camera("map")
		"village_claimed":
			_apply_map_state(main_overlay_root, "east_route_claimed")
			if not _apply_village_state(main_basin, "claimed"):
				push_error("AURELIAN_FIRST_LAND_CLAIM_VILLAGE_STATE_FAILED")
			_activate_camera("village")
		"village_founded":
			settlement_founded = true
			_apply_map_state(main_overlay_root, "east_route_claimed")
			if not _apply_village_state(main_basin, "founded"):
				push_error("AURELIAN_FIRST_SETTLEMENT_FOUNDING_VILLAGE_STATE_FAILED")
			_activate_camera("village")
		"village_developed":
			settlement_founded = true
			settlement_developed = true
			_apply_map_state(main_overlay_root, "east_route_claimed")
			if not _apply_village_state(main_basin, "developed"):
				push_error("AURELIAN_FIRST_SETTLEMENT_DEVELOPMENT_VILLAGE_STATE_FAILED")
			_activate_camera("village")
		"village_route_context":
			_activate_camera("village")
	_update_runtime_hud()
	if persistence_enabled:
		restored_intent = "none" if entry_state == "world_neutral" else "east_trade"
		var save_result := SESSION.save_session(entry_state, restored_intent, SESSION.NATIVE_PATH, settlement_founded, settlement_developed, route_connected)
		print("AURELIAN_SESSION_V2_SAVE_ACK=%s:%s:%s:%s:%s:%s:%s" % [String(save_result.get("status", "unknown")), String(save_result.get("adapter", "unknown")), entry_state, restored_intent, settlement_founded, settlement_developed, route_connected])
		if not bool(save_result.get("ok", false)) and String(save_result.get("status", "")) != "unavailable":
			push_error("AURELIAN_SESSION_V2_SAVE_FAILED=%s" % String(save_result.get("status", "unknown")))
	print("PLAYABLE_AURELIAN_ENTRY_STATE=%s" % entry_state)

func _update_runtime_hud() -> void:
	if layer_label == null:
		return
	match entry_state:
		"world_neutral":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "Choose Aurelian's strategic direction"
			controls_label.text = "[ENTER] Select eastern Trade"
		"world_trade_selected":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "Trade selected: eastern route opportunity"
			controls_label.text = "[RIGHT] Open claimed Map    [LEFT] Clear" if settlement_founded else "[RIGHT] Open Map    [LEFT] Clear"
		"world_trade_route_active":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "Eastern Trade active through connected East Route"
			controls_label.text = "[RIGHT] Inspect connected Map"
		"map_east_route_selected":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "East Route selected near Gilded Crossing"
			controls_label.text = "[ENTER] Claim East Route    [LEFT] World"
		"map_east_route_claimed":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "East Route claimed for Aurelian"
			controls_label.text = "[ENTER] Connect East Route    [RIGHT] Reopen Greenvale    [LEFT] World" if settlement_developed else ("[RIGHT] Reopen Greenvale    [LEFT] World" if settlement_founded else "[RIGHT] Open claimed land    [LEFT] World")
		"map_east_route_connected":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "East Route connected: Greenvale to Gilded Crossing"
			controls_label.text = "[RIGHT] Reopen developed Greenvale    [LEFT] World"
		"village_claimed":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "East Route is claimed: no settlement exists yet"
			controls_label.text = "[ENTER] Found Greenvale    [LEFT / ESC] Return to claimed Map"
		"village_founded":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "Greenvale founded: ready for visible development"
			controls_label.text = "[ENTER] Develop Greenvale    [LEFT / ESC] Return to claimed Map"
		"village_developed":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "Greenvale developed into a visible working settlement"
			controls_label.text = "[LEFT / ESC] Return to claimed Map"
		"map_east_route":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "Legacy East Route selection restored"
			controls_label.text = "[ENTER] Claim East Route    [RIGHT] Legacy Village    [LEFT] World"
		"village_route_context":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "Legacy Greenvale route context"
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
		_emit_action("ui_accept")
	elif automated_frame == 570:
		_emit_action("ui_right")
	elif automated_frame == 690:
		_emit_action("ui_accept")
	elif automated_frame == 810:
		_emit_action("ui_accept")
	elif automated_frame == 930:
		_emit_action("ui_left")
	elif automated_frame == 1050:
		_emit_action("ui_accept")
	elif automated_frame == 1170:
		_emit_action("ui_left")
	elif automated_frame == 1290:
		_emit_action("ui_right")
	elif automated_frame == 1410:
		_emit_action("ui_right")
	elif automated_frame == 1530:
		_emit_action("ui_left")
	elif automated_frame == 1650:
		_emit_action("ui_left")
	elif automated_frame >= 1770:
		print("PLAYABLE_AURELIAN_INPUT_SEQUENCE_COMPLETE=1770")
		get_tree().quit(0)