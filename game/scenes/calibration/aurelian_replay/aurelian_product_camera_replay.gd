extends Node3D

const VIEWPORT_SIZE := Vector2i(1440, 900)
const GLB_PATH := "res://calibration_input/aurelian_basin_phase1_recovery.glb"
const TOPOLOGY_SCALE := 0.12
const TOPOLOGY_CENTER := Vector2(500.0, 450.0)
const MOVIE_FRAMES := 540
const CAMERA_CONTRACT := {
	"village": {"center": Vector2(425.0, 315.0), "size": 52.0},
	"map": {"center": Vector2(500.0, 435.0), "size": 103.0},
	"world": {"center": Vector2(500.0, 465.0), "size": 132.0},
	"bridge": {"center": Vector2(515.0, 340.0), "size": 27.0},
}

var evidence_dir := ""
var preset := ""
var sequence_mode := false
var sequence_frame := 0
var cameras: Dictionary = {}

static func topology_to_godot(point: Vector2, height: float = 0.0) -> Vector3:
	return Vector3(
		(point.x - TOPOLOGY_CENTER.x) * TOPOLOGY_SCALE,
		height,
		(point.y - TOPOLOGY_CENTER.y) * TOPOLOGY_SCALE
	)

func _ready() -> void:
	evidence_dir = OS.get_environment("AURELIAN_REPLAY_EVIDENCE_DIR")
	preset = OS.get_environment("AURELIAN_REPLAY_PRESET").to_lower()
	sequence_mode = OS.get_environment("AURELIAN_REPLAY_SEQUENCE") == "1"

	if sequence_mode:
		if not _build_main_world():
			return
		_activate_camera("village")
		print("AURELIAN_REPLAY_MOVIE_STAGE=village")
		set_process(true)
		return

	if evidence_dir.is_empty():
		push_error("AURELIAN_REPLAY_EVIDENCE_DIR is required")
		get_tree().quit(2)
		return
	if not CAMERA_CONTRACT.has(preset):
		push_error("AURELIAN_REPLAY_UNKNOWN_PRESET: %s" % preset)
		get_tree().quit(3)
		return
	DirAccess.make_dir_recursive_absolute(evidence_dir)
	call_deferred("_capture_product_still")

func _load_basin() -> Node3D:
	var packed := load(GLB_PATH) as PackedScene
	if packed == null:
		push_error("AURELIAN_REPLAY_GLB_LOAD_FAILED: %s" % GLB_PATH)
		get_tree().quit(10)
		return null
	var instance := packed.instantiate() as Node3D
	if instance == null:
		push_error("AURELIAN_REPLAY_GLB_ROOT_NOT_NODE3D")
		get_tree().quit(11)
		return null
	instance.name = "PinnedAurelian429"
	return instance

func _make_environment() -> Environment:
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color("#33494b")
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("#c8c5ae")
	environment.ambient_light_energy = 0.54
	environment.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	environment.tonemap_exposure = 1.0
	environment.fog_enabled = true
	environment.fog_light_color = Color("#a9b2a4")
	environment.fog_density = 0.0024
	return environment

func _populate_world(parent: Node) -> bool:
	var basin := _load_basin()
	if basin == null:
		return false
	parent.add_child(basin)

	var world_environment := WorldEnvironment.new()
	world_environment.name = "AurelianReplayEnvironment"
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

func _make_camera(camera_preset: String, parent: Node) -> Camera3D:
	var definition: Dictionary = CAMERA_CONTRACT[camera_preset]
	var focus: Vector3 = topology_to_godot(definition["center"], 0.0)
	var camera := Camera3D.new()
	camera.name = "Camera_%s" % camera_preset.capitalize()
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.size = float(definition["size"])
	camera.near = 0.1
	camera.far = 1200.0
	camera.position = focus + Vector3(70.0, 88.0, 95.0)
	parent.add_child(camera)
	camera.look_at(focus, Vector3.UP)
	return camera

func _capture_product_still() -> void:
	var viewport := SubViewport.new()
	viewport.name = "ReplayViewport_%s" % preset
	viewport.size = VIEWPORT_SIZE
	viewport.own_world_3d = true
	viewport.transparent_bg = false
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	viewport.render_target_clear_mode = SubViewport.CLEAR_MODE_ALWAYS
	add_child(viewport)

	var scene_root := Node3D.new()
	scene_root.name = "ReplayWorld"
	viewport.add_child(scene_root)
	if not _populate_world(scene_root):
		return
	var camera := _make_camera(preset, scene_root)
	camera.make_current()

	var layer := CanvasLayer.new()
	layer.name = "ConsumedReplayLayer"
	add_child(layer)
	var consumed := TextureRect.new()
	consumed.name = "ConsumedReplayTexture"
	consumed.texture = viewport.get_texture()
	consumed.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	consumed.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	consumed.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	layer.add_child(consumed)

	await _settle_frames(12)
	var active := viewport.get_camera_3d()
	if active != camera:
		push_error("AURELIAN_REPLAY_CAMERA_NOT_CURRENT: %s" % preset)
		get_tree().quit(12)
		return

	_save_viewport_png(viewport, "%s-sub-1440x900.png" % preset)
	_save_viewport_png(get_viewport(), "%s-1440x900.png" % preset)
	_write_camera_manifest(camera, viewport)
	_write_environment_manifest()
	print("AURELIAN_REPLAY_STILL_PASS=%s" % preset)
	get_tree().quit(0)

func _build_main_world() -> bool:
	if not _populate_world(self):
		return false
	for camera_preset in ["village", "map", "world"]:
		cameras[camera_preset] = _make_camera(camera_preset, self)
	return true

func _activate_camera(camera_preset: String) -> void:
	for key in cameras.keys():
		(cameras[key] as Camera3D).current = false
	var camera := cameras[camera_preset] as Camera3D
	camera.make_current()
	var active := get_viewport().get_camera_3d()
	if active != camera:
		push_error("AURELIAN_REPLAY_MOVIE_CAMERA_NOT_CURRENT: %s" % camera_preset)
		get_tree().quit(13)

func _process(_delta: float) -> void:
	if not sequence_mode:
		return
	sequence_frame += 1
	if sequence_frame == 180:
		_activate_camera("map")
		print("AURELIAN_REPLAY_MOVIE_STAGE=map")
	elif sequence_frame == 360:
		_activate_camera("world")
		print("AURELIAN_REPLAY_MOVIE_STAGE=world")
	elif sequence_frame >= MOVIE_FRAMES:
		print("AURELIAN_REPLAY_MOVIE_COMPLETE=%d" % MOVIE_FRAMES)
		get_tree().quit(0)

func _settle_frames(count: int) -> void:
	for _index in range(count):
		await get_tree().process_frame
	await RenderingServer.frame_post_draw

func _save_viewport_png(viewport: Viewport, filename: String) -> void:
	var image := viewport.get_texture().get_image()
	if image == null or image.is_empty():
		push_error("AURELIAN_REPLAY_EMPTY_IMAGE: %s" % filename)
		get_tree().quit(20)
		return
	if image.get_size() != VIEWPORT_SIZE:
		push_error("AURELIAN_REPLAY_WRONG_IMAGE_SIZE: %s %s" % [filename, image.get_size()])
		get_tree().quit(21)
		return
	var output := evidence_dir.path_join(filename)
	if image.save_png(output) != OK:
		push_error("AURELIAN_REPLAY_SAVE_FAILED: %s" % output)
		get_tree().quit(22)
		return
	print("AURELIAN_REPLAY_IMAGE=%s" % output)

func _write_camera_manifest(camera: Camera3D, viewport: Viewport) -> void:
	var definition: Dictionary = CAMERA_CONTRACT[preset]
	_write_json(evidence_dir.path_join("camera-%s.json" % preset), {
		"preset": preset,
		"topology_center": [definition["center"].x, definition["center"].y],
		"orthographic_size": camera.size,
		"projection": camera.projection,
		"near": camera.near,
		"far": camera.far,
		"position": [camera.global_position.x, camera.global_position.y, camera.global_position.z],
		"current": camera.is_current(),
		"viewport_size": [viewport.size.x, viewport.size.y],
	})

func _write_environment_manifest() -> void:
	_write_json(evidence_dir.path_join("environment-%s.json" % preset), {
		"background": "#33494b",
		"ambient_color": "#c8c5ae",
		"ambient_energy": 0.54,
		"tonemap": "FILMIC",
		"tonemap_exposure": 1.0,
		"fog_color": "#a9b2a4",
		"fog_density": 0.0024,
		"godot_renderer": RenderingServer.get_current_rendering_driver_name(),
		"adapter": RenderingServer.get_video_adapter_name(),
	})

func _write_json(path: String, data: Variant) -> void:
	var file := FileAccess.open(path, FileAccess.WRITE)
	if file == null:
		push_error("AURELIAN_REPLAY_JSON_OPEN_FAILED: %s" % path)
		get_tree().quit(23)
		return
	file.store_string(JSON.stringify(data, "\t") + "\n")
