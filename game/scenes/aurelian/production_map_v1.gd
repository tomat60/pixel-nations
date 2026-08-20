extends "res://scenes/aurelian/production_village_v1.gd"

const MAP_MANIFEST_PATH := "res://scenes/aurelian/production_map_v1_manifest.json"
const MAP_STATES := ["no_selection", "selected", "status_distinctions"]

var map_contract: Dictionary = {}
var map_state := "no_selection"
var map_sequence_mode := false
var map_sequence_frame := 0
var main_overlay_root: Node3D

func _ready() -> void:
	map_contract = _load_map_contract()
	if map_contract.is_empty():
		get_tree().quit(61)
		return
	var requested_state := OS.get_environment("AURELIAN_MAP_STATE").to_lower()
	if not requested_state.is_empty():
		map_state = requested_state
	if not MAP_STATES.has(map_state):
		push_error("PRODUCTION_MAP_UNKNOWN_STATE: %s" % map_state)
		get_tree().quit(62)
		return
	map_sequence_mode = OS.get_environment("AURELIAN_CAPTURE_MAP_SEQUENCE") == "1"
	super()
	if map_sequence_mode and not cameras.is_empty():
		_activate_camera("map")
		set_process(true)

func _load_map_contract() -> Dictionary:
	var file := FileAccess.open(MAP_MANIFEST_PATH, FileAccess.READ)
	if file == null:
		push_error("PRODUCTION_MAP_MANIFEST_MISSING")
		return {}
	var payload = JSON.parse_string(file.get_as_text())
	if not payload is Dictionary:
		push_error("PRODUCTION_MAP_MANIFEST_INVALID")
		return {}
	var contract := payload as Dictionary
	if String(contract.get("contract", "")) != "PRODUCTION_MAP_V1":
		push_error("PRODUCTION_MAP_CONTRACT_INVALID")
		return {}
	return contract

func _material(color_value: String, emission_strength: float = 0.0) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	var color := Color(color_value)
	material.albedo_color = color
	material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	material.no_depth_test = false
	if emission_strength > 0.0:
		material.emission_enabled = true
		material.emission = Color(color_value)
		material.emission_energy_multiplier = emission_strength
	return material

func _marker_mesh(shape: String, radius: float, height: float) -> PrimitiveMesh:
	if shape == "claimable_ring" or shape == "selected_ring":
		var torus := TorusMesh.new()
		torus.inner_radius = radius * 0.58
		torus.outer_radius = radius
		torus.rings = 32
		torus.ring_segments = 12
		return torus
	if shape == "scouted_diamond":
		var diamond := BoxMesh.new()
		diamond.size = Vector3(radius * 1.35, height, radius * 1.35)
		return diamond
	var claimed := CylinderMesh.new()
	claimed.top_radius = radius
	claimed.bottom_radius = radius
	claimed.height = height
	claimed.radial_segments = 6
	return claimed

func _build_map_overlays() -> Node3D:
	var root := Node3D.new()
	root.name = "ProductionMapOverlays"
	var overlays: Array = map_contract.get("overlays", [])
	for overlay_variant in overlays:
		var overlay: Dictionary = overlay_variant
		var coords: Array = overlay.get("topology", [])
		if coords.size() != 2:
			push_error("PRODUCTION_MAP_OVERLAY_TOPOLOGY_INVALID")
			continue
		var marker := Node3D.new()
		marker.name = String(overlay.get("id", "UnknownOverlay"))
		var shape := String(overlay.get("shape", "claimed_hex"))
		var radius := float(overlay.get("radius", 0.20))
		var height := float(overlay.get("height", 0.055))
		var glyph := MeshInstance3D.new()
		glyph.name = "SemanticGlyph"
		glyph.mesh = _marker_mesh(shape, radius, height)
		glyph.material_override = _material(
			String(overlay.get("color", "#ffffffaa")),
			float(overlay.get("emission", 0.0))
		)
		if shape == "scouted_diamond":
			glyph.rotation.y = PI / 4.0
		marker.add_child(glyph)
		if shape == "selected_ring":
			var pin := MeshInstance3D.new()
			pin.name = "SelectionPin"
			var pin_mesh := CylinderMesh.new()
			pin_mesh.top_radius = radius * 0.18
			pin_mesh.bottom_radius = radius * 0.32
			pin_mesh.height = height * 3.0
			pin_mesh.radial_segments = 12
			pin.mesh = pin_mesh
			pin.position.y = height * 1.25
			pin.material_override = _material(String(overlay.get("color", "#f4d36fff")), 0.5)
			marker.add_child(pin)
		marker.position = topology_to_godot(
			Vector2(float(coords[0]), float(coords[1])),
			float(overlay.get("world_height", 0.22))
		)
		root.add_child(marker)
	return root

func _apply_map_state(root: Node3D, state_name: String) -> bool:
	var states: Dictionary = map_contract.get("states", {})
	if not states.has(state_name):
		push_error("PRODUCTION_MAP_STATE_MISSING: %s" % state_name)
		return false
	var visible: Array = (states[state_name] as Dictionary).get("visible", [])
	for child in root.get_children():
		if child is Node3D:
			(child as Node3D).visible = visible.has(child.name)
	map_state = state_name
	print("PRODUCTION_MAP_STATE=%s" % state_name)
	return true

func _populate_world(parent: Node) -> Node3D:
	var basin := super._populate_world(parent)
	if basin == null:
		return null
	var overlays := _build_map_overlays()
	parent.add_child(overlays)
	var preset := OS.get_environment("AURELIAN_CAPTURE_PRESET").to_lower()
	overlays.visible = preset == "map" or map_sequence_mode
	if not _apply_map_state(overlays, map_state):
		get_tree().quit(63)
		return null
	if parent == self:
		main_overlay_root = overlays
	return basin

func _process(_delta: float) -> void:
	if not map_sequence_mode:
		super(_delta)
		return
	map_sequence_frame += 1
	if map_sequence_frame == 120:
		_apply_map_state(main_overlay_root, "selected")
	elif map_sequence_frame == 240:
		_apply_map_state(main_overlay_root, "status_distinctions")
	elif map_sequence_frame == 360:
		main_overlay_root.visible = false
		_activate_camera("village")
	elif map_sequence_frame == 510:
		_activate_camera("world")
	elif map_sequence_frame >= 660:
		print("PRODUCTION_MAP_SEQUENCE_COMPLETE=660")
		get_tree().quit(0)
