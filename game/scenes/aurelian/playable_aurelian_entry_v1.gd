extends "res://scenes/aurelian/aurelian_decision_loop_v1.gd"

const SESSION := preload("res://scenes/aurelian/aurelian_session_persistence_v2.gd")

const PLAYABLE_MANIFEST_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1_manifest.json"
const NATIONAL_DIRECTIONS := ["trade", "expand", "frontier"]
const ENTRY_STATES := [
	"world_neutral",
	"world_trade_selected",
	"map_east_route_selected",
	"map_east_route_claimed",
	"map_east_route_connected",
	"world_trade_route_active",
	"village_trade_dispatched",
	"map_east_route_in_use",
	"world_first_trade_underway",
	"village_city_chartered",
	"map_greenvale_city",
	"world_first_city_recognized",
	"world_first_nation_founded",
	"map_aurelian_homeland",
	"village_greenvale_capital",
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
var caravan_dispatched := false
var city_chartered := false
var nation_founded := false
var national_direction_cursor := 0
var committed_direction := "none"
var dispatch_token: Node3D
var city_marker: Node3D
var homeland_marker: Node3D
var nation_emblem: Node3D
var capital_standards: Node3D
var living_capital_presentation: Node3D

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
	var evidence_direction := OS.get_environment("AURELIAN_COMMITTED_DIRECTION").to_lower()
	if NATIONAL_DIRECTIONS.has(evidence_direction):
		committed_direction = evidence_direction
		national_direction_cursor = NATIONAL_DIRECTIONS.find(evidence_direction)
	persistence_enabled = evidence_state.is_empty() and not automated_input_mode
	if not OS.get_environment("AURELIAN_EVIDENCE_DIR").is_empty():
		get_window().content_scale_size = STILL_SIZE
		get_window().content_scale_aspect = Window.CONTENT_SCALE_ASPECT_IGNORE
		get_window().size = STILL_SIZE
	if ENTRY_STATES.has(evidence_state):
		entry_state = evidence_state
		settlement_founded = evidence_state in ["village_founded", "village_developed", "village_trade_dispatched", "map_east_route_in_use", "world_first_trade_underway"]
		settlement_developed = evidence_state in ["village_developed", "village_trade_dispatched", "map_east_route_connected", "map_east_route_in_use", "world_trade_route_active", "world_first_trade_underway"]
		route_connected = evidence_state in ["map_east_route_connected", "map_east_route_in_use", "world_trade_route_active", "world_first_trade_underway", "village_trade_dispatched"]
		caravan_dispatched = evidence_state in ["village_trade_dispatched", "map_east_route_in_use", "world_first_trade_underway", "village_city_chartered", "map_greenvale_city", "world_first_city_recognized", "world_first_nation_founded", "map_aurelian_homeland", "village_greenvale_capital"]
		city_chartered = evidence_state in ["village_city_chartered", "map_greenvale_city", "world_first_city_recognized", "world_first_nation_founded", "map_aurelian_homeland", "village_greenvale_capital"]
		nation_founded = evidence_state in ["world_first_nation_founded", "map_aurelian_homeland", "village_greenvale_capital"]
	else:
		var restored := SESSION.load_session()
		entry_state = String(restored.get("entry_state", "world_neutral"))
		restored_intent = String(restored.get("selected_intent", "none"))
		settlement_founded = bool(restored.get("settlement_founded", false))
		settlement_developed = bool(restored.get("settlement_developed", false))
		route_connected = bool(restored.get("route_connected", false))
		caravan_dispatched = bool(restored.get("caravan_dispatched", false))
		city_chartered = bool(restored.get("city_chartered", false))
		nation_founded = bool(restored.get("nation_founded", false))
		committed_direction = String(restored.get("national_direction", "none"))
		if NATIONAL_DIRECTIONS.has(committed_direction):
			national_direction_cursor = NATIONAL_DIRECTIONS.find(committed_direction)
		else:
			committed_direction = "none"
		print("AURELIAN_NATIONAL_DIRECTION_RESTORED=%s" % committed_direction)
		print("AURELIAN_SESSION_V2_LOAD=%s:%s:%s:%s:%s:%s:%s:%s:%s:%s" % [String(restored.get("status", "unknown")), String(restored.get("adapter", "unknown")), entry_state, restored_intent, settlement_founded, settlement_developed, route_connected, caravan_dispatched, city_chartered, nation_founded])
	if not ENTRY_STATES.has(entry_state):
		entry_state = "world_neutral"
		restored_intent = "none"
		settlement_founded = false
		settlement_developed = false
		route_connected = false
		caravan_dispatched = false
		city_chartered = false
		nation_founded = false
		committed_direction = "none"
		national_direction_cursor = 0
	if entry_state in ["village_founded", "village_developed", "village_trade_dispatched", "map_east_route_connected", "map_east_route_in_use", "world_trade_route_active", "world_first_trade_underway"]:
		settlement_founded = true
	if entry_state in ["village_developed", "village_trade_dispatched", "map_east_route_connected", "map_east_route_in_use", "world_trade_route_active", "world_first_trade_underway"]:
		settlement_developed = true
	if entry_state in ["map_east_route_connected", "map_east_route_in_use", "world_trade_route_active", "world_first_trade_underway", "village_trade_dispatched"]:
		route_connected = true
	if entry_state in ["village_trade_dispatched", "map_east_route_in_use", "world_first_trade_underway", "village_city_chartered", "map_greenvale_city", "world_first_city_recognized"]:
		caravan_dispatched = true
	if entry_state in ["village_city_chartered", "map_greenvale_city", "world_first_city_recognized", "world_first_nation_founded", "map_aurelian_homeland", "village_greenvale_capital"]:
		city_chartered = true
	if entry_state in ["world_first_nation_founded", "map_aurelian_homeland", "village_greenvale_capital"]:
		nation_founded = true
	decision_state = _decision_state_for_entry(entry_state)
	_configure_state_environment(entry_state)
	super()
	if cameras.is_empty():
		return
	dispatch_token = _build_dispatch_token()
	main_decision_overlay_root.add_child(dispatch_token)
	city_marker = _build_city_marker()
	main_basin.add_child(city_marker)
	homeland_marker = _build_homeland_marker()
	main_basin.add_child(homeland_marker)
	nation_emblem = _build_nation_emblem()
	main_basin.add_child(nation_emblem)
	capital_standards = _build_capital_standards()
	main_basin.add_child(capital_standards)
	living_capital_presentation = _build_living_capital_presentation()
	main_basin.add_child(living_capital_presentation)
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
		"map_east_route_selected", "map_east_route_claimed", "map_east_route_connected", "map_east_route_in_use", "map_greenvale_city", "map_aurelian_homeland":
			return "map_east_route"
		"world_trade_route_active", "world_first_trade_underway", "world_first_city_recognized", "world_first_nation_founded":
			return "world_trade_selected"
		"village_claimed", "village_founded", "village_developed", "village_trade_dispatched", "village_city_chartered", "village_greenvale_capital":
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
		"map_east_route_claimed", "map_east_route_connected", "map_east_route_in_use", "map_greenvale_city", "map_aurelian_homeland":
			OS.set_environment("AURELIAN_WORLD_STATE", "selected_trade")
			OS.set_environment("AURELIAN_MAP_STATE", "east_route_claimed")
			OS.set_environment("AURELIAN_VILLAGE_STATE", "developed" if settlement_developed else ("founded" if settlement_founded else "claimed"))
			OS.set_environment("AURELIAN_CAPTURE_PRESET", "")
			return
		"world_trade_route_active", "world_first_trade_underway", "world_first_city_recognized", "world_first_nation_founded":
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
		"village_developed", "village_trade_dispatched":
			OS.set_environment("AURELIAN_WORLD_STATE", "selected_trade")
			OS.set_environment("AURELIAN_MAP_STATE", "east_route_claimed")
			OS.set_environment("AURELIAN_VILLAGE_STATE", "developed")
			OS.set_environment("AURELIAN_CAPTURE_PRESET", "")
			return
		"village_city_chartered", "village_greenvale_capital":
			OS.set_environment("AURELIAN_WORLD_STATE", "selected_trade")
			OS.set_environment("AURELIAN_MAP_STATE", "east_route_claimed")
			OS.set_environment("AURELIAN_VILLAGE_STATE", "city_chartered")
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
	elif event.is_action_pressed("ui_up"):
		_cycle_national_direction(-1)
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_down"):
		_cycle_national_direction(1)
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
		"village_developed":
			if route_connected and not caravan_dispatched:
				caravan_dispatched = true
				_apply_entry_state("village_trade_dispatched")
				print("AURELIAN_FIRST_TRADE_CARAVAN_DISPATCH=EAST_ROUTE")
		"village_trade_dispatched":
			if caravan_dispatched and not city_chartered:
				city_chartered = true
				_apply_entry_state("village_city_chartered")
				print("AURELIAN_FIRST_CITY_CHARTER=GREENVALE")
		"world_first_city_recognized":
			if city_chartered and not nation_founded:
				nation_founded = true
				_apply_entry_state("world_first_nation_founded")
				print("AURELIAN_FIRST_NATION_FOUNDING=AURELIAN")
		"world_first_nation_founded":
			if nation_founded and committed_direction == "none":
				committed_direction = NATIONAL_DIRECTIONS[national_direction_cursor]
				_apply_entry_state("world_first_nation_founded")
				print("AURELIAN_FIRST_NATIONAL_DIRECTION_COMMITMENT=%s" % committed_direction.to_upper())

func _right_entry() -> void:
	match entry_state:
		"world_trade_selected":
			_apply_entry_state("map_east_route_claimed" if settlement_founded else "map_east_route_selected")
		"world_trade_route_active":
			_apply_entry_state("map_east_route_connected")
		"world_first_trade_underway":
			_apply_entry_state("map_east_route_in_use")
		"world_first_city_recognized":
			_apply_entry_state("map_greenvale_city")
		"world_first_nation_founded":
			if committed_direction != "none":
				_apply_entry_state("map_aurelian_homeland")
		"map_east_route_claimed":
			_apply_entry_state("village_developed" if settlement_developed else ("village_founded" if settlement_founded else "village_claimed"))
		"map_east_route_connected":
			_apply_entry_state("village_trade_dispatched" if caravan_dispatched else "village_developed")
		"map_east_route_in_use":
			_apply_entry_state("village_city_chartered" if city_chartered else "village_trade_dispatched")
		"map_greenvale_city":
			_apply_entry_state("village_city_chartered")
		"map_aurelian_homeland":
			_apply_entry_state("village_greenvale_capital")
		"map_east_route":
			_apply_entry_state("village_route_context")

func _previous_entry() -> void:
	match entry_state:
		"village_claimed", "village_founded":
			_apply_entry_state("map_east_route_claimed")
		"village_developed":
			_apply_entry_state("map_east_route_connected" if route_connected else "map_east_route_claimed")
		"village_trade_dispatched":
			_apply_entry_state("map_east_route_in_use")
		"village_city_chartered":
			_apply_entry_state("map_greenvale_city")
		"village_greenvale_capital":
			_apply_entry_state("map_aurelian_homeland")
		"map_east_route_claimed", "map_east_route_selected", "map_east_route":
			_apply_entry_state("world_trade_selected")
		"map_east_route_connected":
			_apply_entry_state("world_trade_route_active")
		"map_east_route_in_use":
			_apply_entry_state("world_first_trade_underway")
		"map_greenvale_city":
			_apply_entry_state("world_first_city_recognized")
		"map_aurelian_homeland":
			_apply_entry_state("world_first_nation_founded")
		"village_route_context":
			_apply_entry_state("map_east_route")
		"world_trade_selected":
			_apply_entry_state("world_neutral")

func _cycle_national_direction(step: int) -> void:
	if entry_state != "world_first_nation_founded" or committed_direction != "none":
		return
	national_direction_cursor = posmod(national_direction_cursor + step, NATIONAL_DIRECTIONS.size())
	_refresh_national_direction_identity()
	_update_runtime_hud()
	print("AURELIAN_NATIONAL_DIRECTION_INSPECT=%s" % NATIONAL_DIRECTIONS[national_direction_cursor].to_upper())

func _direction_color(direction: String) -> String:
	match direction:
		"expand":
			return "#68a978ff"
		"frontier":
			return "#c56b4fff"
		_:
			return "#d7ad42ff"

func _refresh_national_direction_identity() -> void:
	var direction := committed_direction if committed_direction != "none" else NATIONAL_DIRECTIONS[national_direction_cursor]
	var color := _direction_color(direction)
	if nation_emblem != null:
		var world_hex := nation_emblem.get_node_or_null("NationHex") as MeshInstance3D
		if world_hex != null:
			world_hex.material_override = _material(color, 0.34)
		var nation_label := nation_emblem.get_node_or_null("NationLabel") as Label3D
		if nation_label != null:
			nation_label.text = "AURELIAN / %s" % direction.to_upper() if committed_direction != "none" else "AURELIAN / %s?" % direction.to_upper()
	if homeland_marker != null:
		var homeland_hex := homeland_marker.get_node_or_null("HomelandHex") as MeshInstance3D
		if homeland_hex != null:
			homeland_hex.material_override = _material(color, 0.16)
	if capital_standards != null:
		for standard in capital_standards.get_children():
			if standard.get_child_count() > 1:
				var flag := standard.get_child(1) as MeshInstance3D
				if flag != null:
					flag.material_override = _material(color, 0.24)

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

func _build_dispatch_token() -> Node3D:
	var root := Node3D.new()
	root.name = "FirstTradeCaravanDispatch"
	var body := MeshInstance3D.new()
	body.name = "CaravanBody"
	var body_mesh := BoxMesh.new()
	body_mesh.size = Vector3(0.50, 0.24, 0.62)
	body.mesh = body_mesh
	body.position.y = 0.06
	body.material_override = _material("#f2b84bff", 0.24)
	root.add_child(body)
	var cargo := MeshInstance3D.new()
	cargo.name = "CaravanCargo"
	var cargo_mesh := BoxMesh.new()
	cargo_mesh.size = Vector3(0.34, 0.30, 0.34)
	cargo.mesh = cargo_mesh
	cargo.position = Vector3(0.0, 0.31, -0.08)
	cargo.material_override = _material("#b94f3fff", 0.22)
	root.add_child(cargo)
	for side in [-1.0, 1.0]:
		var wheel := MeshInstance3D.new()
		wheel.name = "CaravanWheel"
		var wheel_mesh := CylinderMesh.new()
		wheel_mesh.top_radius = 0.14
		wheel_mesh.bottom_radius = 0.14
		wheel_mesh.height = 0.065
		wheel_mesh.radial_segments = 16
		wheel.mesh = wheel_mesh
		wheel.rotation.z = PI / 2.0
		wheel.position = Vector3(side * 0.29, -0.09, 0.02)
		wheel.material_override = _material("#4a3528ee")
		root.add_child(wheel)
	root.position = topology_to_godot(Vector2(435.0, 313.0), 0.44)
	root.visible = false
	return root

func _build_city_marker() -> Node3D:
	var root := Node3D.new()
	root.name = "GreenvaleFirstCityMarker"
	var base := MeshInstance3D.new()
	base.name = "CityHex"
	var mesh := CylinderMesh.new()
	mesh.top_radius = 0.48
	mesh.bottom_radius = 0.48
	mesh.height = 0.18
	mesh.radial_segments = 6
	base.mesh = mesh
	base.material_override = _material("#d9ad4aff", 0.28)
	root.add_child(base)
	var spire := MeshInstance3D.new()
	spire.name = "CivicSpire"
	var spire_mesh := CylinderMesh.new()
	spire_mesh.top_radius = 0.08
	spire_mesh.bottom_radius = 0.22
	spire_mesh.height = 0.72
	spire_mesh.radial_segments = 6
	spire.mesh = spire_mesh
	spire.position.y = 0.45
	spire.material_override = _material("#f5df8dff", 0.24)
	root.add_child(spire)
	root.position = topology_to_godot(Vector2(354.0, 285.0), 0.58)
	root.visible = false
	return root

func _build_homeland_marker() -> Node3D:
	var root := Node3D.new()
	root.name = "AurelianHomelandCue"
	var field := MeshInstance3D.new()
	field.name = "HomelandHex"
	var field_mesh := CylinderMesh.new()
	field_mesh.top_radius = 1.34
	field_mesh.bottom_radius = 1.34
	field_mesh.height = 0.045
	field_mesh.radial_segments = 6
	field.mesh = field_mesh
	field.material_override = _material("#4f9f6f66", 0.12)
	root.add_child(field)
	var capital := MeshInstance3D.new()
	capital.name = "CapitalMarker"
	var capital_mesh := CylinderMesh.new()
	capital_mesh.top_radius = 0.24
	capital_mesh.bottom_radius = 0.36
	capital_mesh.height = 0.62
	capital_mesh.radial_segments = 6
	capital.mesh = capital_mesh
	capital.position.y = 0.34
	capital.material_override = _material("#f2cf63ff", 0.28)
	root.add_child(capital)
	root.position = topology_to_godot(Vector2(354.0, 285.0), 0.30)
	root.visible = false
	return root

func _build_nation_emblem() -> Node3D:
	var root := Node3D.new()
	root.name = "AurelianNationEmblem"
	var pole := MeshInstance3D.new()
	pole.name = "NationStandardPole"
	var pole_mesh := CylinderMesh.new()
	pole_mesh.top_radius = 0.045
	pole_mesh.bottom_radius = 0.055
	pole_mesh.height = 1.38
	pole_mesh.radial_segments = 12
	pole.mesh = pole_mesh
	pole.position.y = 0.69
	pole.material_override = _material("#d5c9a5ff")
	root.add_child(pole)
	var emblem := MeshInstance3D.new()
	emblem.name = "NationHex"
	var emblem_mesh := CylinderMesh.new()
	emblem_mesh.top_radius = 0.42
	emblem_mesh.bottom_radius = 0.42
	emblem_mesh.height = 0.13
	emblem_mesh.radial_segments = 6
	emblem.mesh = emblem_mesh
	emblem.rotation.x = PI / 2.0
	emblem.position = Vector3(0.0, 1.24, 0.0)
	emblem.material_override = _material("#e3b94fff", 0.34)
	root.add_child(emblem)
	var label := Label3D.new()
	label.name = "NationLabel"
	label.text = "AURELIAN"
	label.font_size = 42
	label.outline_size = 8
	label.modulate = Color("#f5e6aaff")
	label.position = Vector3(0.0, 1.73, 0.0)
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	root.add_child(label)
	root.position = topology_to_godot(Vector2(500.0, 455.0), 0.32)
	root.visible = false
	return root

func _build_capital_standards() -> Node3D:
	var root := Node3D.new()
	root.name = "GreenvaleCapitalStandards"
	var offsets := [Vector3(-0.72, 0.0, -0.36), Vector3(0.72, 0.0, -0.36), Vector3(0.0, 0.0, 0.72)]
	for index in range(3):
		var standard := Node3D.new()
		standard.name = "CapitalStandard%02d" % (index + 1)
		standard.position = offsets[index]
		var pole := MeshInstance3D.new()
		var pole_mesh := CylinderMesh.new()
		pole_mesh.top_radius = 0.028
		pole_mesh.bottom_radius = 0.038
		pole_mesh.height = 0.90
		pole_mesh.radial_segments = 10
		pole.mesh = pole_mesh
		pole.position.y = 0.45
		pole.material_override = _material("#d8cca9ff")
		standard.add_child(pole)
		var flag := MeshInstance3D.new()
		var flag_mesh := BoxMesh.new()
		flag_mesh.size = Vector3(0.36, 0.24, 0.045)
		flag.mesh = flag_mesh
		flag.position = Vector3(0.18, 0.76, 0.0)
		flag.material_override = _material("#d7ad42ff", 0.24)
		standard.add_child(flag)
		root.add_child(standard)
	root.position = topology_to_godot(Vector2(354.0, 285.0), 0.18)
	root.visible = false
	return root

func _build_living_capital_presentation() -> Node3D:
	var root := Node3D.new()
	root.name = "GreenvaleLivingCapitalPresentation"
	var civic_ring := Node3D.new()
	civic_ring.name = "CivicActivityRing"
	root.add_child(civic_ring)
	var plaza := MeshInstance3D.new()
	plaza.name = "CapitalPlaza"
	var plaza_mesh := CylinderMesh.new()
	plaza_mesh.top_radius = 1.58
	plaza_mesh.bottom_radius = 1.58
	plaza_mesh.height = 0.055
	plaza_mesh.radial_segments = 32
	plaza.mesh = plaza_mesh
	plaza.position.y = 0.03
	plaza.material_override = _material("#b69a5638", 0.18)
	civic_ring.add_child(plaza)
	var quarter_offsets := [
		Vector3(-1.35, 0.0, -0.72),
		Vector3(-0.48, 0.0, -1.42),
		Vector3(0.52, 0.0, -1.38),
		Vector3(1.38, 0.0, -0.62),
		Vector3(1.32, 0.0, 0.72),
		Vector3(-1.28, 0.0, 0.78),
	]
	for index in range(quarter_offsets.size()):
		var quarter := MeshInstance3D.new()
		quarter.name = "CivicQuarter%02d" % (index + 1)
		var quarter_mesh := BoxMesh.new()
		quarter_mesh.size = Vector3(0.52, 0.40 + float(index % 2) * 0.12, 0.44)
		quarter.mesh = quarter_mesh
		quarter.position = quarter_offsets[index] + Vector3(0.0, quarter_mesh.size.y * 0.5, 0.0)
		quarter.rotation.y = float(index) * 0.52
		quarter.material_override = _material("#a9654fff" if index % 2 == 0 else "#55758cff", 0.24)
		civic_ring.add_child(quarter)
		var roof := MeshInstance3D.new()
		roof.name = "CapitalRoof%02d" % (index + 1)
		var roof_mesh := CylinderMesh.new()
		roof_mesh.top_radius = 0.06
		roof_mesh.bottom_radius = 0.40
		roof_mesh.height = 0.24
		roof_mesh.radial_segments = 4
		roof.mesh = roof_mesh
		roof.position = quarter.position + Vector3(0.0, quarter_mesh.size.y * 0.5 + 0.12, 0.0)
		roof.rotation.y = quarter.rotation.y + PI * 0.25
		roof.material_override = _material("#d2aa52ff" if index % 2 == 0 else "#8f493fff", 0.20)
		civic_ring.add_child(roof)
	var lantern_offsets := [
		Vector3(-0.92, 0.0, -0.92),
		Vector3(0.92, 0.0, -0.92),
		Vector3(0.92, 0.0, 0.92),
		Vector3(-0.92, 0.0, 0.92),
	]
	for index in range(lantern_offsets.size()):
		var lantern := MeshInstance3D.new()
		lantern.name = "CapitalLantern%02d" % (index + 1)
		var lantern_mesh := CylinderMesh.new()
		lantern_mesh.top_radius = 0.06
		lantern_mesh.bottom_radius = 0.09
		lantern_mesh.height = 0.72
		lantern_mesh.radial_segments = 10
		lantern.mesh = lantern_mesh
		lantern.position = lantern_offsets[index] + Vector3(0.0, 0.36, 0.0)
		lantern.material_override = _material("#f3c85bff", 0.30)
		root.add_child(lantern)
	root.position = topology_to_godot(Vector2(354.0, 285.0), 0.15)
	root.visible = false
	return root

func _animate_living_capital_presentation(delta: float) -> void:
	var seconds := float(Time.get_ticks_msec()) / 1000.0
	if dispatch_token != null and dispatch_token.visible:
		var route_mix := (sin(seconds * 0.82) + 1.0) * 0.5
		var route_point := Vector2(354.0, 285.0).lerp(Vector2(515.0, 340.0), route_mix)
		dispatch_token.position = topology_to_godot(route_point, 0.44 + sin(seconds * 2.4) * 0.035)
		dispatch_token.rotation.y += delta * 0.75
	if living_capital_presentation != null and living_capital_presentation.visible:
		for index in range(4):
			var lantern := living_capital_presentation.get_node_or_null("CapitalLantern%02d" % (index + 1)) as Node3D
			if lantern != null:
				var lantern_pulse := 1.0 + sin(seconds * 2.2 + float(index) * 0.9) * 0.10
				lantern.scale = Vector3(1.0, lantern_pulse, 1.0)
	if homeland_marker != null and homeland_marker.visible:
		var map_pulse := 1.0 + sin(seconds * 2.0) * 0.025
		homeland_marker.scale = Vector3.ONE * map_pulse
	if nation_emblem != null and nation_emblem.visible:
		var world_pulse := 1.0 + sin(seconds * 1.6) * 0.02
		nation_emblem.scale = Vector3.ONE * world_pulse

func _reveal_living_capital() -> void:
	if living_capital_presentation == null:
		return
	living_capital_presentation.scale = Vector3.ONE * 0.72
	var tween := create_tween()
	tween.set_trans(Tween.TRANS_BACK)
	tween.set_ease(Tween.EASE_OUT)
	tween.tween_property(living_capital_presentation, "scale", Vector3.ONE, 0.72)

func _set_trade_world_underway(underway: bool) -> void:
	if main_world_overlay_root == null:
		return
	var label := main_world_overlay_root.get_node_or_null("Direction_EastTrade/StrategicLabel") as Label3D
	if label != null:
		label.text = "TRADE UNDERWAY" if underway else "TRADE"

func _apply_entry_state(state_name: String) -> void:
	if not ENTRY_STATES.has(state_name):
		push_error("PLAYABLE_AURELIAN_UNKNOWN_STATE=%s" % state_name)
		return
	var previous_state := entry_state
	entry_state = state_name
	main_world_overlay_root.visible = state_name.begins_with("world_")
	main_overlay_root.visible = state_name.begins_with("map_")
	main_decision_overlay_root.visible = state_name in ["village_route_context", "map_east_route_connected", "map_east_route_in_use", "world_trade_route_active", "world_first_trade_underway", "map_greenvale_city", "world_first_city_recognized", "world_first_nation_founded", "map_aurelian_homeland"]
	if dispatch_token != null:
		dispatch_token.visible = state_name in ["map_east_route_in_use", "world_first_trade_underway", "map_greenvale_city", "world_first_city_recognized", "world_first_nation_founded", "map_aurelian_homeland"]
	if city_marker != null:
		city_marker.visible = state_name in ["village_city_chartered", "map_greenvale_city", "world_first_city_recognized", "world_first_nation_founded", "map_aurelian_homeland", "village_greenvale_capital"]
	if homeland_marker != null:
		homeland_marker.visible = state_name == "map_aurelian_homeland"
	if nation_emblem != null:
		nation_emblem.visible = state_name == "world_first_nation_founded"
	if capital_standards != null:
		capital_standards.visible = state_name == "village_greenvale_capital"
	if living_capital_presentation != null:
		living_capital_presentation.visible = state_name == "village_greenvale_capital"
		if living_capital_presentation.visible and previous_state != state_name:
			_reveal_living_capital()
	_set_trade_world_underway(false)
	_refresh_national_direction_identity()
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
		"world_first_trade_underway":
			if not _apply_village_state(main_basin, "developed"):
				push_error("AURELIAN_FIRST_TRADE_CARAVAN_DISPATCH_VILLAGE_STATE_FAILED")
			_apply_world_state(main_world_overlay_root, "selected_trade")
			_set_trade_world_underway(true)
			_activate_camera("world")
		"world_first_city_recognized":
			if not _apply_village_state(main_basin, "city_chartered"):
				push_error("AURELIAN_FIRST_CITY_CHARTER_VILLAGE_STATE_FAILED")
			_apply_world_state(main_world_overlay_root, "selected_trade")
			_set_trade_world_underway(true)
			_activate_camera("world")
		"world_first_nation_founded":
			if not _apply_village_state(main_basin, "city_chartered"):
				push_error("AURELIAN_FIRST_NATION_FOUNDING_CAPITAL_STATE_FAILED")
			_apply_world_state(main_world_overlay_root, "selected_trade")
			_set_trade_world_underway(true)
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
		"map_east_route_connected", "map_east_route_in_use":
			_apply_map_state(main_overlay_root, "east_route_claimed")
			if not _apply_village_state(main_basin, "developed"):
				push_error("AURELIAN_FIRST_TRADE_ROUTE_CONNECTION_VILLAGE_STATE_FAILED")
			_activate_camera("map")
		"map_greenvale_city":
			_apply_map_state(main_overlay_root, "east_route_claimed")
			if not _apply_village_state(main_basin, "city_chartered"):
				push_error("AURELIAN_FIRST_CITY_CHARTER_VILLAGE_STATE_FAILED")
			_activate_camera("map")
		"map_aurelian_homeland":
			_apply_map_state(main_overlay_root, "east_route_claimed")
			if not _apply_village_state(main_basin, "city_chartered"):
				push_error("AURELIAN_FIRST_NATION_FOUNDING_CAPITAL_STATE_FAILED")
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
		"village_developed", "village_trade_dispatched":
			settlement_founded = true
			settlement_developed = true
			_apply_map_state(main_overlay_root, "east_route_claimed")
			if not _apply_village_state(main_basin, "developed"):
				push_error("AURELIAN_FIRST_SETTLEMENT_DEVELOPMENT_VILLAGE_STATE_FAILED")
			_activate_camera("village")
		"village_city_chartered":
			settlement_founded = true
			settlement_developed = true
			route_connected = true
			caravan_dispatched = true
			city_chartered = true
			_apply_map_state(main_overlay_root, "east_route_claimed")
			if not _apply_village_state(main_basin, "city_chartered"):
				push_error("AURELIAN_FIRST_CITY_CHARTER_VILLAGE_STATE_FAILED")
			_activate_camera("village")
		"village_greenvale_capital":
			settlement_founded = true
			settlement_developed = true
			route_connected = true
			caravan_dispatched = true
			city_chartered = true
			nation_founded = true
			_apply_map_state(main_overlay_root, "east_route_claimed")
			if not _apply_village_state(main_basin, "city_chartered"):
				push_error("AURELIAN_FIRST_NATION_FOUNDING_CAPITAL_STATE_FAILED")
			_activate_camera("village")
		"village_route_context":
			_activate_camera("village")
	_update_runtime_hud()
	if persistence_enabled:
		restored_intent = "none" if entry_state == "world_neutral" else "east_trade"
		var save_result := SESSION.save_session(entry_state, restored_intent, SESSION.NATIVE_PATH, settlement_founded, settlement_developed, route_connected, caravan_dispatched, city_chartered, nation_founded, committed_direction)
		print("AURELIAN_NATIONAL_DIRECTION_SAVE=%s" % committed_direction)
		print("AURELIAN_SESSION_V2_SAVE_ACK=%s:%s:%s:%s:%s:%s:%s:%s:%s:%s" % [String(save_result.get("status", "unknown")), String(save_result.get("adapter", "unknown")), entry_state, restored_intent, settlement_founded, settlement_developed, route_connected, caravan_dispatched, city_chartered, nation_founded])
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
		"world_first_trade_underway":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "First eastern trade caravan is underway"
			controls_label.text = "[RIGHT] Inspect route in use"
		"world_first_city_recognized":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "Greenvale recognized as Aurelian's first city"
			controls_label.text = "[ENTER] Found Aurelian Nation    [RIGHT] Inspect city on Map"
		"world_first_nation_founded":
			layer_label.text = "WORLD  |  WHY"
			if committed_direction == "none":
				var inspected := NATIONAL_DIRECTIONS[national_direction_cursor].capitalize()
				intent_label.text = "Inspect national direction: %s" % inspected
				controls_label.text = "[UP / DOWN] Trade / Expand / Frontier    [ENTER] Commit Aurelian Direction"
			else:
				intent_label.text = "Aurelian direction committed: %s" % committed_direction.capitalize()
				controls_label.text = "[RIGHT] Inspect homeland context"
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
		"map_east_route_in_use":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "First caravan dispatched along the connected East Route"
			controls_label.text = "[RIGHT] Reopen Greenvale    [LEFT] World"
		"map_greenvale_city":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "Greenvale city anchors the East Route at its accepted origin"
			controls_label.text = "[RIGHT] Open first city    [LEFT] World"
		"map_aurelian_homeland":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "Aurelian homeland context: %s direction" % committed_direction.capitalize()
			controls_label.text = "[RIGHT] Open Greenvale capital    [LEFT] World"
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
			controls_label.text = "[ENTER] Dispatch First Caravan    [LEFT / ESC] Return to connected Map" if route_connected else "[LEFT / ESC] Return to claimed Map"
		"village_trade_dispatched":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "First caravan dispatched from developed Greenvale"
			controls_label.text = "[ENTER] Charter Greenvale    [LEFT / ESC] Inspect route in use"
		"village_city_chartered":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "Greenvale chartered with a visible civic core"
			controls_label.text = "[LEFT / ESC] Inspect city on Map"
		"village_greenvale_capital":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "Greenvale capital identity: %s direction" % committed_direction.capitalize()
			controls_label.text = "[LEFT / ESC] Inspect Aurelian homeland"
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
	_animate_living_capital_presentation(_delta)
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
		_emit_action("ui_accept")
	elif automated_frame == 1650:
		_emit_action("ui_left")
	elif automated_frame == 1770:
		_emit_action("ui_left")
	elif automated_frame == 1890:
		_emit_action("ui_right")
	elif automated_frame == 2010:
		_emit_action("ui_right")
	elif automated_frame == 2130:
		_emit_action("ui_left")
	elif automated_frame == 2250:
		_emit_action("ui_left")
	elif automated_frame == 2370:
		_emit_action("ui_right")
	elif automated_frame == 2490:
		_emit_action("ui_right")
	elif automated_frame == 2610:
		_emit_action("ui_accept")
	elif automated_frame == 2730:
		_emit_action("ui_left")
	elif automated_frame == 2850:
		_emit_action("ui_left")
	elif automated_frame == 2970:
		_emit_action("ui_right")
	elif automated_frame == 3090:
		_emit_action("ui_right")
	elif automated_frame == 3210:
		_emit_action("ui_left")
	elif automated_frame == 3330:
		_emit_action("ui_left")
	elif automated_frame == 3450:
		_emit_action("ui_accept")
	elif automated_frame == 3570:
		_emit_action("ui_down")
	elif automated_frame == 3690:
		_emit_action("ui_down")
	elif automated_frame == 3810:
		_emit_action("ui_up")
	elif automated_frame == 3930:
		_emit_action("ui_accept")
	elif automated_frame == 4050:
		_emit_action("ui_right")
	elif automated_frame == 4170:
		_emit_action("ui_right")
	elif automated_frame == 4290:
		_emit_action("ui_left")
	elif automated_frame == 4410:
		_emit_action("ui_left")
	elif automated_frame >= 4530:
		print("PLAYABLE_AURELIAN_INPUT_SEQUENCE_COMPLETE=4530")
		get_tree().quit(0)