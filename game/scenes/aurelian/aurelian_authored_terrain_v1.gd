extends Node3D

const GLB_PATH := "res://assets/aurelian-basin/export/aurelian_authored_terrain_v1.glb"
const TOPOLOGY_SCALE := 0.018
const TOPOLOGY_CENTER := Vector2(500.0, 450.0)
const TOPOLOGY_Z_SIGN := -1.0
const STILL_SIZE := Vector2i(1440, 900)
const CAMERA_CONTRACT := {
	"village": {"center": Vector2(425, 315), "size": 8.4},
	"map": {"center": Vector2(500, 435), "size": 16.2},
	"world": {"center": Vector2(500, 500), "size": 22.0},
	"bridge": {"center": Vector2(515, 340), "size": 5.3},
}

var evidence_dir := ""
var sequence_mode := false
var sequence_frame := 0
var cameras: Dictionary = {}

static func topology_to_godot(point: Vector2, height: float = 0.0) -> Vector3:
	return Vector3(
		(point.x - TOPOLOGY_CENTER.x) * TOPOLOGY_SCALE,
		height,
		(point.y - TOPOLOGY_CENTER.y) * TOPOLOGY_SCALE * TOPOLOGY_Z_SIGN
	)

func _ready() -> void:
	evidence_dir = OS.get_environment("AURELIAN_EVIDENCE_DIR")
	var preset := OS.get_environment("AURELIAN_CAPTURE_PRESET").to_lower()
	sequence_mode = OS.get_environment("AURELIAN_CAPTURE_SEQUENCE") == "1"

	if not preset.is_empty():
		if not CAMERA_CONTRACT.has(preset):
			push_error("AURELIAN_AUTHORED_UNKNOWN_CAMERA: %s" % preset)
			get_tree().quit(31)
			return
		call_deferred("_capture_still", preset)
		return

	if not _build_main_world():
		return

	if sequence_mode:
		_activate_camera("village")
		set_process(true)
	else:
		_activate_camera("world")

func _load_basin() -> Node3D:
	var packed := load(GLB_PATH) as PackedScene
	if packed == null:
		push_error("AURELIAN_AUTHORED_GLB_LOAD_FAILED: %s" % GLB_PATH)
		return null
	var instance := packed.instantiate() as Node3D
	if instance == null:
		push_error("AURELIAN_AUTHORED_GLB_INSTANTIATE_FAILED")
		return null
	instance.name = "AurelianAuthoredTerrainImported"
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
	return true

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
	if not _populate_world(self):
		return false
	for preset in ["village", "map", "world"]:
		cameras[preset] = _make_camera(preset, self)
	return true

func _activate_camera(preset: String) -> void:
	if not cameras.has(preset):
		push_error("AURELIAN_AUTHORED_CAMERA_MISSING: %s" % preset)
		get_tree().quit(37)
		return
	for key in cameras.keys():
		(cameras[key] as Camera3D).current = false
	var camera := cameras[preset] as Camera3D
	camera.make_current()
	print("AURELIAN_AUTHORED_CAMERA=%s" % preset)

func _capture_still(preset: String) -> void:
	if evidence_dir.is_empty():
		push_error("AURELIAN_AUTHORED_MISSING_EVIDENCE_DIR")
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
	camera.make_current()

	for _frame in range(8):
		await get_tree().process_frame
	await RenderingServer.frame_post_draw
	var image := viewport.get_texture().get_image()
	if image == null or image.is_empty():
		push_error("AURELIAN_AUTHORED_EMPTY_CAPTURE: %s" % preset)
		get_tree().quit(34)
		return
	if image.get_size() != STILL_SIZE:
		push_error("AURELIAN_AUTHORED_WRONG_CAPTURE_SIZE: %s %s" % [preset, image.get_size()])
		get_tree().quit(35)
		return
	var output_path := evidence_dir.path_join("%s-1440x900.png" % preset)
	var result := image.save_png(output_path)
	if result != OK:
		push_error("AURELIAN_AUTHORED_CAPTURE_SAVE_FAILED: %s" % output_path)
		get_tree().quit(36)
		return
	print("AURELIAN_AUTHORED_STILL=%s:%s" % [preset, output_path])
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
		print("AURELIAN_AUTHORED_SEQUENCE_COMPLETE=540")
		get_tree().quit(0)
