extends Node3D

const GLB_PATH := "res://assets/aurelian-basin/export/aurelian_basin_phase1_recovery.glb"
const TOPOLOGY_SCALE := 0.12
const TOPOLOGY_CENTER := Vector2(500.0, 450.0)
const STILL_SIZE := Vector2i(1440, 900)
const CAMERA_CONTRACT := {
	"village": {"center": Vector2(425, 315), "size": 52.0},
	"map": {"center": Vector2(500, 435), "size": 103.0},
	"world": {"center": Vector2(500, 465), "size": 132.0},
	"bridge": {"center": Vector2(515, 340), "size": 27.0},
}

var evidence_dir := ""
var sequence_mode := false
var sequence_frame := 0
var cameras: Dictionary = {}

static func topology_to_godot(point: Vector2, height: float = 0.0) -> Vector3:
	# Blender authoring plane: +X east, +Y north, +Z up.
	# glTF/Godot import maps that to +X east, -Z north, +Y up.
	return Vector3(
		(point.x - TOPOLOGY_CENTER.x) * TOPOLOGY_SCALE,
		height,
		(point.y - TOPOLOGY_CENTER.y) * TOPOLOGY_SCALE
	)

func _ready() -> void:
	evidence_dir = OS.get_environment("AURELIAN_EVIDENCE_DIR")
	var preset := OS.get_environment("AURELIAN_CAPTURE_PRESET").to_lower()
	sequence_mode = OS.get_environment("AURELIAN_CAPTURE_SEQUENCE") == "1"

	if not preset.is_empty():
		if not CAMERA_CONTRACT.has(preset):
			push_error("AURELIAN_RECOVERY_UNKNOWN_CAMERA: %s" % preset)
			get_tree().quit(31)
			return
		call_deferred("_capture_still", preset)
		return

	if sequence_mode:
		if not _build_main_world():
			return
		_activate_camera("village")
		set_process(true)
		return

	if not _build_main_world():
		return
	_activate_camera("world")

func _load_basin() -> Node3D:
	var packed := load(GLB_PATH) as PackedScene
	if packed == null:
		push_error("AURELIAN_RECOVERY_GLB_LOAD_FAILED: %s" % GLB_PATH)
		return null
	var instance := packed.instantiate() as Node3D
	if instance == null:
		push_error("AURELIAN_RECOVERY_GLB_INSTANTIATE_FAILED")
		return null
	instance.name = "AurelianBasinImported"
	return instance

func _make_environment() -> Environment:
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color("#33494b")
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("#c8c5ae")
	environment.ambient_light_energy = 0.54
	environment.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	environment.tonemap_exposure = 0.0
	environment.fog_enabled = true
	environment.fog_light_color = Color("#a9b2a4")
	environment.fog_density = 0.0024
	return environment

func _populate_world(parent: Node) -> bool:
	var basin := _load_basin()
	if basin == null:
		get_tree().quit(32)
		return false
	parent.add_child(basin)

	var world_environment := WorldEnvironment.new()
	world_environment.name = "AurelianEnvironment"
	world_environment.environment = _make_environment()
	parent.add_child(world_environment)

	var sun := DirectionalLight3D.new()
	sun.name = "LateMorningSun"
	sun.rotation_degrees = Vector3(-48.0, -32.0, 0.0)
	sun.light_color = Color("#ffe2b4")
	sun.light_energy = 1.08
	sun.shadow_enabled = true
	parent.add_child(sun)

	var fill := DirectionalLight3D.new()
	fill.name = "CoolFill"
	fill.rotation_degrees = Vector3(-62.0, 142.0, 0.0)
	fill.light_color = Color("#91aab0")
	fill.light_energy = 0.24
	parent.add_child(fill)
	return true

func _make_camera(preset: String, parent: Node) -> Camera3D:
	var definition: Dictionary = CAMERA_CONTRACT[preset]
	var focus := topology_to_godot(definition["center"], 0.0)
	var camera := Camera3D.new()
	camera.name = "Camera_%s" % preset.capitalize()
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.size = float(definition["size"])
	camera.near = 0.1
	camera.far = 1200.0
	camera.position = focus + Vector3(70.0, 88.0, 95.0)
	parent.add_child(camera)
	camera.look_at(focus, Vector3.UP)
	return camera

func _build_main_world() -> bool:
	if not _populate_world(self):
		return false
	for preset in ["village", "map", "world"]:
		cameras[preset] = _make_camera(preset, self)
	return true

func _activate_camera(preset: String) -> void:
	for key in cameras.keys():
		(cameras[key] as Camera3D).current = String(key) == preset
	print("AURELIAN_RECOVERY_CAMERA=%s" % preset)

func _capture_still(preset: String) -> void:
	if evidence_dir.is_empty():
		push_error("AURELIAN_RECOVERY_MISSING_EVIDENCE_DIR")
		get_tree().quit(33)
		return
	DirAccess.make_dir_recursive_absolute(evidence_dir)

	var viewport := SubViewport.new()
	viewport.name = "EvidenceViewport_%s" % preset
	viewport.size = STILL_SIZE
	viewport.own_world_3d = true
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	viewport.render_target_clear_mode = SubViewport.CLEAR_MODE_ALWAYS
	viewport.transparent_bg = false
	add_child(viewport)

	var scene_root := Node3D.new()
	scene_root.name = "EvidenceWorld"
	viewport.add_child(scene_root)
	if not _populate_world(scene_root):
		return
	var camera := _make_camera(preset, scene_root)
	camera.current = true

	for _frame in range(8):
		await get_tree().process_frame
	await RenderingServer.frame_post_draw
	var image := viewport.get_texture().get_image()
	if image == null or image.is_empty():
		push_error("AURELIAN_RECOVERY_EMPTY_CAPTURE: %s" % preset)
		get_tree().quit(34)
		return
	if image.get_size() != STILL_SIZE:
		push_error("AURELIAN_RECOVERY_WRONG_CAPTURE_SIZE: %s %s" % [preset, image.get_size()])
		get_tree().quit(35)
		return
	var output_path := evidence_dir.path_join("%s-1440x900.png" % preset)
	var result := image.save_png(output_path)
	if result != OK:
		push_error("AURELIAN_RECOVERY_CAPTURE_SAVE_FAILED: %s" % output_path)
		get_tree().quit(36)
		return
	print("AURELIAN_RECOVERY_STILL=%s:%s" % [preset, output_path])
	get_tree().quit(0)

func _process(_delta: float) -> void:
	if not sequence_mode:
		return
	sequence_frame += 1
	if sequence_frame == 180:
		_activate_camera("map")
	elif sequence_frame == 360:
		_activate_camera("world")
	elif sequence_frame >= 540:
		print("AURELIAN_RECOVERY_SEQUENCE_COMPLETE=540")
		get_tree().quit(0)
