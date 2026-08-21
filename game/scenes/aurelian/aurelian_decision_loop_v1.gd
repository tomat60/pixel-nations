extends "res://scenes/aurelian/production_world_v1.gd"

const DECISION_MANIFEST_PATH := "res://scenes/aurelian/aurelian_decision_loop_v1_manifest.json"
const DECISION_STATES := [
	"world_neutral",
	"world_trade_selected",
	"map_east_route",
	"village_route_context",
	"map_regression",
	"village_regression",
]

var decision_contract: Dictionary = {}
var decision_state := "world_neutral"
var decision_sequence_mode := false
var decision_sequence_frame := 0
var main_decision_overlay_root: Node3D

func _ready() -> void:
	decision_contract = _load_decision_contract()
	if decision_contract.is_empty():
		get_tree().quit(81)
		return
	var requested_state := OS.get_environment("AURELIAN_DECISION_STATE").to_lower()
	if not requested_state.is_empty():
		decision_state = requested_state
	if not DECISION_STATES.has(decision_state):
		push_error("AURELIAN_DECISION_LOOP_UNKNOWN_STATE: %s" % decision_state)
		get_tree().quit(82)
		return
	decision_sequence_mode = OS.get_environment("AURELIAN_CAPTURE_DECISION_LOOP") == "1"
	if decision_sequence_mode:
		decision_state = "world_neutral"
		OS.set_environment("AURELIAN_CAPTURE_PRESET", "")
		OS.set_environment("AURELIAN_CAPTURE_WORLD_SEQUENCE", "0")
		OS.set_environment("AURELIAN_CAPTURE_MAP_SEQUENCE", "0")
	_configure_state_environment(decision_state)
	super()
	if decision_sequence_mode and not cameras.is_empty():
		if main_world_overlay_root != null:
			main_world_overlay_root.visible = true
			_apply_world_state(main_world_overlay_root, "neutral")
		if main_overlay_root != null:
			main_overlay_root.visible = false
		if main_decision_overlay_root != null:
			main_decision_overlay_root.visible = false
		_activate_camera("world")
		set_process(true)

func _load_decision_contract() -> Dictionary:
	var file := FileAccess.open(DECISION_MANIFEST_PATH, FileAccess.READ)
	if file == null:
		push_error("AURELIAN_DECISION_LOOP_MANIFEST_MISSING")
		return {}
	var payload = JSON.parse_string(file.get_as_text())
	if not payload is Dictionary:
		push_error("AURELIAN_DECISION_LOOP_MANIFEST_INVALID")
		return {}
	var contract := payload as Dictionary
	if String(contract.get("contract", "")) != "AURELIAN_DECISION_LOOP_V1":
		push_error("AURELIAN_DECISION_LOOP_CONTRACT_INVALID")
		return {}
	return contract

func _configure_state_environment(state_name: String) -> void:
	var states: Dictionary = decision_contract.get("states", {})
	if not states.has(state_name):
		return
	var state: Dictionary = states[state_name]
	OS.set_environment("AURELIAN_WORLD_STATE", String(state.get("world_state", "neutral")))
	OS.set_environment("AURELIAN_MAP_STATE", String(state.get("map_state", "no_selection")))
	OS.set_environment("AURELIAN_VILLAGE_STATE", String(state.get("village_state", "developed")))
	if not decision_sequence_mode:
		OS.set_environment("AURELIAN_CAPTURE_PRESET", String(state.get("view", "world")))

func _build_route_context() -> Node3D:
	var root := Node3D.new()
	root.name = "AurelianDecisionLoopOverlays"
	var spec: Dictionary = decision_contract.get("route_context", {})
	var from_coords: Array = spec.get("from_topology", [])
	var to_coords: Array = spec.get("to_topology", [])
	if from_coords.size() != 2 or to_coords.size() != 2:
		push_error("AURELIAN_DECISION_LOOP_ROUTE_TOPOLOGY_INVALID")
		return root
	var height := float(spec.get("world_height", 0.34))
	var from_position := topology_to_godot(Vector2(float(from_coords[0]), float(from_coords[1])), height)
	var to_position := topology_to_godot(Vector2(float(to_coords[0]), float(to_coords[1])), height)
	var delta := to_position - from_position
	var route := MeshInstance3D.new()
	route.name = String(spec.get("id", "GreenvaleTradeRouteContext"))
	var beam := BoxMesh.new()
	beam.size = Vector3(float(spec.get("width", 0.12)), 0.045, delta.length())
	route.mesh = beam
	route.position = (from_position + to_position) * 0.5
	route.rotation.y = atan2(delta.x, delta.z)
	route.material_override = _material(String(spec.get("color", "#62b7c8dd")), 0.18)
	root.add_child(route)

	var origin := MeshInstance3D.new()
	origin.name = "GreenvaleRouteOrigin"
	var origin_mesh := TorusMesh.new()
	origin_mesh.inner_radius = 0.20
	origin_mesh.outer_radius = 0.30
	origin_mesh.rings = 24
	origin_mesh.ring_segments = 10
	origin.mesh = origin_mesh
	origin.position = from_position
	origin.material_override = _material(String(spec.get("color", "#62b7c8dd")), 0.25)
	root.add_child(origin)

	var label := Label3D.new()
	label.name = "RouteContextLabel"
	label.text = String(spec.get("label", "TRADE ROUTE CAPACITY"))
	label.font_size = 52
	label.pixel_size = 0.005
	label.modulate = Color(String(spec.get("color", "#62b7c8dd")))
	label.outline_modulate = Color("#28312ddd")
	label.outline_size = 9
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	label.no_depth_test = true
	label.position = (from_position + to_position) * 0.5 + Vector3(0.0, 0.55, 0.0)
	root.add_child(label)
	return root

func _populate_world(parent: Node) -> Node3D:
	var basin := super._populate_world(parent)
	if basin == null:
		return null
	var decision_overlays := _build_route_context()
	parent.add_child(decision_overlays)
	var states: Dictionary = decision_contract.get("states", {})
	var state: Dictionary = states.get(decision_state, {})
	decision_overlays.visible = bool(state.get("context_visible", false))
	var world_overlays := parent.get_node_or_null("ProductionWorldOverlays") as Node3D
	var map_overlays := parent.get_node_or_null("ProductionMapOverlays") as Node3D
	var view := String(state.get("view", "world"))
	if world_overlays != null:
		world_overlays.visible = decision_sequence_mode or view == "world"
	if map_overlays != null:
		map_overlays.visible = view == "map"
	if parent == self:
		main_decision_overlay_root = decision_overlays
	return basin

func _process(_delta: float) -> void:
	if not decision_sequence_mode:
		super(_delta)
		return
	decision_sequence_frame += 1
	if decision_sequence_frame == 150:
		_apply_world_state(main_world_overlay_root, "selected_trade")
		print("AURELIAN_DECISION_LOOP_HANDOFF=WORLD_TRADE")
	elif decision_sequence_frame == 330:
		main_world_overlay_root.visible = false
		main_overlay_root.visible = true
		_apply_map_state(main_overlay_root, "selected")
		_activate_camera("map")
		print("AURELIAN_DECISION_LOOP_HANDOFF=MAP_EAST_ROUTE")
	elif decision_sequence_frame == 510:
		main_overlay_root.visible = false
		main_decision_overlay_root.visible = true
		_activate_camera("village")
		print("AURELIAN_DECISION_LOOP_HANDOFF=VILLAGE_ROUTE_CONTEXT")
	elif decision_sequence_frame >= 720:
		print("AURELIAN_DECISION_LOOP_SEQUENCE_COMPLETE=720")
		get_tree().quit(0)
