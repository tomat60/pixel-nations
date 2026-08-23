extends Node3D

const GLB_PATH := "res://assets/aurelian-basin/export/aurelian_authored_terrain_v1.glb"
const STATE_MANIFEST_PATH := "res://scenes/aurelian/production_village_v1_state_manifest.json"
const TOPOLOGY_SCALE := 0.018
const TOPOLOGY_CENTER := Vector2(500.0, 450.0)
const TOPOLOGY_Z_SIGN := -1.0
const STILL_SIZE := Vector2i(1440, 900)
const VILLAGE_STATES := ["claimed", "founded", "developed"]
const CAMERA_CONTRACT := {
	"village": {"center": Vector2(382, 326), "size": 9.0},
	"map": {"center": Vector2(500, 430), "size": 17.4},
	"world": {"center": Vector2(500, 480), "size": 23.4},
	"bridge": {"center": Vector2(515, 340), "size": 4.8},
}

var evidence_dir := ""
var village_state := "developed"
var progression_mode := false
var progression_frame := 0
var cameras: Dictionary = {}
var state_contract: Dictionary = {}
var main_basin: Node3D

static func topology_to_godot(point: Vector2, height: float = 0.0) -> Vector3:
	return Vector3(
		(point.x - TOPOLOGY_CENTER.x) * TOPOLOGY_SCALE,
		height,
		(point.y - TOPOLOGY_CENTER.y) * TOPOLOGY_SCALE * TOPOLOGY_Z_SIGN
	)

func _ready() -> void:
	state_contract = _load_state_contract()
	if state_contract.is_empty():
		get_tree().quit(41)
		return

	evidence_dir = OS.get_environment("AURELIAN_EVIDENCE_DIR")
	var requested_state := OS.get_environment("AURELIAN_VILLAGE_STATE").to_lower()
	if requested_state.is_empty():
		requested_state = String(state_contract.get("default_state", "developed"))
	if not VILLAGE_STATES.has(requested_state):
		push_error("PRODUCTION_VILLAGE_UNKNOWN_STATE: %s" % requested_state)
		get_tree().quit(42)
		return
	village_state = requested_state

	var preset := OS.get_environment("AURELIAN_CAPTURE_PRESET").to_lower()
	progression_mode = OS.get_environment("AURELIAN_CAPTURE_VILLAGE_SEQUENCE") == "1"
	if progression_mode:
		village_state = "claimed"

	if not preset.is_empty():
		if not CAMERA_CONTRACT.has(preset):
			push_error("PRODUCTION_VILLAGE_UNKNOWN_CAMERA: %s" % preset)
			get_tree().quit(43)
			return
		call_deferred("_capture_still", preset)
		return

	if not _build_main_world():
		return

	if progression_mode:
		_activate_camera("village")
		set_process(true)
	else:
		_activate_camera("world")

func _load_state_contract() -> Dictionary:
	var file := FileAccess.open(STATE_MANIFEST_PATH, FileAccess.READ)
	if file == null:
		push_error("PRODUCTION_VILLAGE_STATE_MANIFEST_MISSING")
		return {}
	var payload = JSON.parse_string(file.get_as_text())
	if not payload is Dictionary:
		push_error("PRODUCTION_VILLAGE_STATE_MANIFEST_INVALID")
		return {}
	var contract := payload as Dictionary
	if String(contract.get("contract", "")) != "PRODUCTION_VILLAGE_V1":
		push_error("PRODUCTION_VILLAGE_STATE_CONTRACT_INVALID")
		return {}
	return contract

func _load_basin() -> Node3D:
	var packed := load(GLB_PATH) as PackedScene
	if packed == null:
		push_error("PRODUCTION_VILLAGE_GLB_LOAD_FAILED: %s" % GLB_PATH)
		return null
	var instance := packed.instantiate() as Node3D
	if instance == null:
		push_error("PRODUCTION_VILLAGE_GLB_INSTANTIATE_FAILED")
		return null
	instance.name = "AurelianProductionVillageImported"
	return instance

func _make_environment() -> Environment:
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color("#27332f")
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("#b8b29f")
	environment.ambient_light_energy = 0.34
	environment.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	environment.tonemap_exposure = 0.82
	environment.fog_enabled = true
	environment.fog_light_color = Color("#777f75")
	environment.fog_density = 0.0012
	return environment

func _named_node(root: Node, node_name: String) -> Node3D:
	var node := root.find_child(node_name, true, false)
	if node == null or not node is Node3D:
		push_error("PRODUCTION_VILLAGE_NODE_MISSING: %s" % node_name)
		return null
	return node as Node3D

func _ensure_derived_nodes(basin: Node3D) -> bool:
	var derived_nodes: Dictionary = state_contract.get("derived_nodes", {})
	for derived_name_variant in derived_nodes.keys():
		var derived_name := String(derived_name_variant)
		if basin.find_child(derived_name, true, false) != null:
			continue
		var spec: Dictionary = derived_nodes[derived_name_variant]
		var source_name := String(spec.get("source", ""))
		var source := _named_node(basin, source_name)
		if source == null:
			return false
		var clone := source.duplicate() as Node3D
		if clone == null:
			push_error("PRODUCTION_VILLAGE_DERIVED_DUPLICATE_FAILED: %s" % derived_name)
			return false
		clone.name = derived_name
		var multiplier := float(spec.get("scale", 1.0))
		clone.scale = source.scale * Vector3(multiplier, multiplier, multiplier)
		clone.rotation_degrees.y += float(spec.get("rotation_y_degrees", 0.0))
		source.get_parent().add_child(clone)
	return true

func _apply_presentation_adjustments(basin: Node3D) -> bool:
	var adjustments: Dictionary = state_contract.get("presentation_adjustments", {})
	for node_name_variant in adjustments.keys():
		var node_name := String(node_name_variant)
		var node := _named_node(basin, node_name)
		if node == null:
			return false
		var multiplier := float(adjustments[node_name_variant])
		node.scale *= Vector3(multiplier, multiplier, multiplier)
	return true

func _apply_village_state(basin: Node3D, state_name: String) -> bool:
	var states: Dictionary = state_contract.get("states", {})
	if not states.has(state_name):
		push_error("PRODUCTION_VILLAGE_STATE_MISSING: %s" % state_name)
		return false
	var state_data: Dictionary = states[state_name]
	var visible_nodes: Array = state_data.get("visible", [])
	var all_nodes: Array = state_contract.get("all_nodes", [])
	var layout: Dictionary = state_contract.get("layout_topology", {})

	for node_name_variant in all_nodes:
		var node_name := String(node_name_variant)
		var node := _named_node(basin, node_name)
		if node == null:
			return false
		node.visible = visible_nodes.has(node_name)
		if layout.has(node_name):
			var coords: Array = layout[node_name]
			if coords.size() != 2:
				push_error("PRODUCTION_VILLAGE_LAYOUT_INVALID: %s" % node_name)
				return false
			var target := topology_to_godot(Vector2(float(coords[0]), float(coords[1])), 0.0)
			var current := node.position
			node.position = Vector3(target.x, current.y, target.z)
	village_state = state_name
	print("PRODUCTION_VILLAGE_STATE=%s" % state_name)
	return true

func _populate_world(parent: Node) -> Node3D:
	var basin := _load_basin()
	if basin == null:
		get_tree().quit(44)
		return null
	parent.add_child(basin)
	if not _ensure_derived_nodes(basin):
		get_tree().quit(45)
		return null
	if not _apply_presentation_adjustments(basin):
		get_tree().quit(46)
		return null
	if not _apply_village_state(basin, village_state):
		get_tree().quit(47)
		return null

	var world_environment := WorldEnvironment.new()
	world_environment.name = "AurelianEnvironment"
	world_environment.environment = _make_environment()
	parent.add_child(world_environment)

	var sun := DirectionalLight3D.new()
	sun.name = "LateMorningSun"
	sun.rotation_degrees = Vector3(-52.0, -38.0, 0.0)
	sun.light_color = Color("#f3d4a8")
	sun.light_energy = 0.62
	sun.shadow_enabled = true
	parent.add_child(sun)

	var fill := DirectionalLight3D.new()
	fill.name = "CoolFill"
	fill.rotation_degrees = Vector3(-62.0, 138.0, 0.0)
	fill.light_color = Color("#809096")
	fill.light_energy = 0.10
	parent.add_child(fill)
	return basin

func _make_camera(preset: String, parent: Node) -> Camera3D:
	var definition: Dictionary = CAMERA_CONTRACT[preset]
	var focus := topology_to_godot(definition["center"], 0.0)
	var camera := Camera3D.new()
	camera.name = "Camera_%s" % preset.capitalize()
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.size = float(definition["size"])
	camera.near = 0.1
	camera.far = 500.0
	camera.position = focus + Vector3(10.5, 12.5, 10.5)
	parent.add_child(camera)
	camera.look_at(focus, Vector3.UP)
	return camera

func _build_main_world() -> bool:
	main_basin = _populate_world(self)
	if main_basin == null:
		return false
	for preset in ["village", "map", "world"]:
		cameras[preset] = _make_camera(preset, self)
	return true

func _activate_camera(preset: String) -> void:
	if not cameras.has(preset):
		push_error("PRODUCTION_VILLAGE_CAMERA_MISSING: %s" % preset)
		get_tree().quit(48)
		return
	for key in cameras.keys():
		(cameras[key] as Camera3D).current = false
	var camera := cameras[preset] as Camera3D
	camera.make_current()
	print("PRODUCTION_VILLAGE_CAMERA=%s" % preset)

func _capture_still(preset: String) -> void:
	if evidence_dir.is_empty():
		push_error("PRODUCTION_VILLAGE_MISSING_EVIDENCE_DIR")
		get_tree().quit(49)
		return
	DirAccess.make_dir_recursive_absolute(evidence_dir)

	var viewport := SubViewport.new()
	viewport.name = "ProductionVillageEvidence_%s" % preset
	viewport.size = STILL_SIZE
	viewport.own_world_3d = true
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	viewport.render_target_clear_mode = SubViewport.CLEAR_MODE_ALWAYS
	viewport.transparent_bg = false
	add_child(viewport)

	var scene_root := Node3D.new()
	scene_root.name = "EvidenceWorld"
	viewport.add_child(scene_root)
	var basin := _populate_world(scene_root)
	if basin == null:
		return
	var camera := _make_camera(preset, scene_root)
	camera.make_current()

	for _frame in range(8):
		await get_tree().process_frame
	await RenderingServer.frame_post_draw
	var image := viewport.get_texture().get_image()
	if image == null or image.is_empty():
		push_error("PRODUCTION_VILLAGE_EMPTY_CAPTURE: %s" % preset)
		get_tree().quit(50)
		return
	if image.get_size() != STILL_SIZE:
		push_error("PRODUCTION_VILLAGE_WRONG_CAPTURE_SIZE: %s %s" % [preset, image.get_size()])
		get_tree().quit(51)
		return
	var basename := preset
	if preset == "village":
		basename = "village-%s" % village_state
	var output_path := evidence_dir.path_join("%s-1440x900.png" % basename)
	var result := image.save_png(output_path)
	if result != OK:
		push_error("PRODUCTION_VILLAGE_CAPTURE_SAVE_FAILED: %s" % output_path)
		get_tree().quit(52)
		return
	print("PRODUCTION_VILLAGE_STILL=%s:%s:%s" % [preset, village_state, output_path])
	get_tree().quit(0)

func _process(_delta: float) -> void:
	if not progression_mode:
		return
	progression_frame += 1
	if progression_frame == 180:
		if not _apply_village_state(main_basin, "founded"):
			get_tree().quit(53)
	elif progression_frame == 360:
		if not _apply_village_state(main_basin, "developed"):
			get_tree().quit(54)
	elif progression_frame >= 540:
		print("PRODUCTION_VILLAGE_SEQUENCE_COMPLETE=540")
		get_tree().quit(0)
