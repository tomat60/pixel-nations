extends "res://scenes/aurelian/production_map_v1.gd"

const WORLD_MANIFEST_PATH := "res://scenes/aurelian/production_world_v1_manifest.json"
const WORLD_STATES := ["neutral", "selected_trade", "all_directions"]

var world_contract: Dictionary = {}
var world_state := "neutral"
var world_sequence_mode := false
var world_sequence_frame := 0
var main_world_overlay_root: Node3D

func _ready() -> void:
	world_contract = _load_world_contract()
	if world_contract.is_empty():
		get_tree().quit(71)
		return
	var requested_state := OS.get_environment("AURELIAN_WORLD_STATE").to_lower()
	if not requested_state.is_empty():
		world_state = requested_state
	if not WORLD_STATES.has(world_state):
		push_error("PRODUCTION_WORLD_UNKNOWN_STATE: %s" % world_state)
		get_tree().quit(72)
		return
	world_sequence_mode = OS.get_environment("AURELIAN_CAPTURE_WORLD_SEQUENCE") == "1"
	if world_sequence_mode:
		world_state = "neutral"
	super()
	if world_sequence_mode and not cameras.is_empty():
		_activate_camera("world")
		set_process(true)

func _load_world_contract() -> Dictionary:
	var file := FileAccess.open(WORLD_MANIFEST_PATH, FileAccess.READ)
	if file == null:
		push_error("PRODUCTION_WORLD_MANIFEST_MISSING")
		return {}
	var payload = JSON.parse_string(file.get_as_text())
	if not payload is Dictionary:
		push_error("PRODUCTION_WORLD_MANIFEST_INVALID")
		return {}
	var contract := payload as Dictionary
	if String(contract.get("contract", "")) != "PRODUCTION_WORLD_V1":
		push_error("PRODUCTION_WORLD_CONTRACT_INVALID")
		return {}
	return contract

func _world_marker_mesh(shape: String, radius: float, height: float) -> PrimitiveMesh:
	if shape == "home_hex":
		var home := CylinderMesh.new()
		home.top_radius = radius
		home.bottom_radius = radius
		home.height = height
		home.radial_segments = 6
		return home
	if shape == "trade_ring":
		var ring := TorusMesh.new()
		ring.inner_radius = radius * 0.55
		ring.outer_radius = radius
		ring.rings = 24
		ring.ring_segments = 10
		return ring
	if shape == "expansion_beacon":
		var beacon := CylinderMesh.new()
		beacon.top_radius = 0.0
		beacon.bottom_radius = radius
		beacon.height = height * 3.0
		beacon.radial_segments = 8
		return beacon
	var frontier := BoxMesh.new()
	frontier.size = Vector3(radius * 1.4, height, radius * 1.4)
	return frontier

func _world_label(text: String, color: Color, height: float) -> Label3D:
	var label := Label3D.new()
	label.name = "StrategicLabel"
	label.text = text
	label.font_size = 64
	label.pixel_size = 0.006
	label.modulate = color
	label.outline_modulate = Color("#28312ddd")
	label.outline_size = 10
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	label.no_depth_test = true
	label.position.y = height
	return label

func _direction_path(from_position: Vector3, to_position: Vector3, color: String) -> MeshInstance3D:
	var path := MeshInstance3D.new()
	path.name = "StrategicDirectionPath"
	var midpoint := (from_position + to_position) * 0.5
	var delta := to_position - from_position
	var beam := BoxMesh.new()
	beam.size = Vector3(0.09, 0.035, delta.length())
	path.mesh = beam
	path.position = Vector3(midpoint.x, max(from_position.y, to_position.y) + 0.06, midpoint.z)
	path.rotation.y = atan2(delta.x, delta.z)
	path.material_override = _material(color, 0.10)
	return path

func _build_world_overlays() -> Node3D:
	var root := Node3D.new()
	root.name = "ProductionWorldOverlays"
	var markers: Array = world_contract.get("markers", [])
	var home_position := Vector3.ZERO
	for marker_variant in markers:
		var home_spec: Dictionary = marker_variant
		if String(home_spec.get("semantic", "")) == "home_region":
			var home_coords: Array = home_spec.get("topology", [])
			if home_coords.size() == 2:
				home_position = topology_to_godot(Vector2(float(home_coords[0]), float(home_coords[1])), float(home_spec.get("world_height", 0.25)))
	for marker_variant in markers:
		var spec: Dictionary = marker_variant
		var coords: Array = spec.get("topology", [])
		if coords.size() != 2:
			push_error("PRODUCTION_WORLD_MARKER_TOPOLOGY_INVALID")
			continue
		var marker := Node3D.new()
		marker.name = String(spec.get("id", "UnknownWorldMarker"))
		var radius := float(spec.get("radius", 0.28))
		var height := float(spec.get("height", 0.06))
		var shape := String(spec.get("shape", "frontier_diamond"))
		var semantic := String(spec.get("semantic", ""))
		var color_text := String(spec.get("color", "#ffffffbb"))
		var marker_color := Color(color_text)
		var glyph := MeshInstance3D.new()
		glyph.name = "StrategicGlyph"
		glyph.mesh = _world_marker_mesh(shape, radius, height)
		glyph.material_override = _material(color_text, float(spec.get("emission", 0.0)))
		if shape == "frontier_diamond":
			glyph.rotation.y = PI / 4.0
		marker.add_child(glyph)
		if String(spec.get("semantic", "")) != "home_region":
			var halo := MeshInstance3D.new()
			halo.name = "SelectedHalo"
			var halo_mesh := TorusMesh.new()
			halo_mesh.inner_radius = radius * 0.95
			halo_mesh.outer_radius = radius * 1.32
			halo_mesh.rings = 24
			halo_mesh.ring_segments = 10
			halo.mesh = halo_mesh
			halo.position.y = height * 1.4
			halo.material_override = _material("#f4e2a0dd", 0.42)
			halo.visible = false
			marker.add_child(halo)
		marker.position = topology_to_godot(Vector2(float(coords[0]), float(coords[1])), float(spec.get("world_height", 0.25)))
		marker.add_child(_world_label(String(spec.get("label", semantic)).to_upper(), marker_color, float(spec.get("label_height", 0.72))))
		if semantic != "home_region":
			marker.add_child(_direction_path(home_position - marker.position, Vector3.ZERO, color_text))
		root.add_child(marker)
	return root

func _apply_world_state(root: Node3D, state_name: String) -> bool:
	var states: Dictionary = world_contract.get("states", {})
	if not states.has(state_name):
		push_error("PRODUCTION_WORLD_STATE_MISSING: %s" % state_name)
		return false
	var state: Dictionary = states[state_name]
	var visible: Array = state.get("visible", [])
	var selected := String(state.get("selected", ""))
	for child in root.get_children():
		if child is Node3D:
			var marker := child as Node3D
			marker.visible = visible.has(marker.name)
			var halo := marker.get_node_or_null("SelectedHalo") as MeshInstance3D
			if halo != null:
				halo.visible = marker.name == selected
	world_state = state_name
	print("PRODUCTION_WORLD_STATE=%s" % state_name)
	return true

func _populate_world(parent: Node) -> Node3D:
	var basin := super._populate_world(parent)
	if basin == null:
		return null
	var overlays := _build_world_overlays()
	parent.add_child(overlays)
	var preset := OS.get_environment("AURELIAN_CAPTURE_PRESET").to_lower()
	overlays.visible = preset == "world" or world_sequence_mode
	if not _apply_world_state(overlays, world_state):
		get_tree().quit(73)
		return null
	if parent == self:
		main_world_overlay_root = overlays
	return basin

func _process(_delta: float) -> void:
	if not world_sequence_mode:
		super(_delta)
		return
	world_sequence_frame += 1
	if world_sequence_frame == 150:
		_apply_world_state(main_world_overlay_root, "all_directions")
	elif world_sequence_frame == 300:
		_apply_world_state(main_world_overlay_root, "selected_trade")
	elif world_sequence_frame == 450:
		main_world_overlay_root.visible = false
		main_overlay_root.visible = true
		_apply_map_state(main_overlay_root, "selected")
		_activate_camera("map")
	elif world_sequence_frame == 570:
		main_overlay_root.visible = false
		_activate_camera("village")
	elif world_sequence_frame >= 660:
		print("PRODUCTION_WORLD_SEQUENCE_COMPLETE=660")
		get_tree().quit(0)
