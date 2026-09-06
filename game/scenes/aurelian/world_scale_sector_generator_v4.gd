extends Node3D

const GLB_PATH := "res://assets/aurelian-basin/export/aurelian_sector_generator_v4.glb"
const SPEC_PATH := "res://assets/aurelian-basin/source/sector_a01_generator_v4_spec.json"
const STILL_SIZE := Vector2i(1440, 900)
const SECTOR_WORLD_SCALE := 0.010
const TOPOLOGY_Z_SIGN := -1.0

var evidence_dir := ""
var sector_spec: Dictionary = {}

func _ready() -> void:
	sector_spec = _read_json(SPEC_PATH)
	if sector_spec.is_empty():
		push_error("AURELIAN_SECTOR_GENERATOR_V4_SPEC_LOAD_FAILED")
		get_tree().quit(61)
		return
	evidence_dir = OS.get_environment("AURELIAN_EVIDENCE_DIR")
	if OS.get_environment("AURELIAN_CAPTURE_SECTOR_GENERATOR_V4") == "1":
		call_deferred("_capture_sector")
		return
	if not _populate_world(self):
		return
	var camera := _make_camera(self)
	camera.make_current()

func _read_json(path: String) -> Dictionary:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return {}
	var payload = JSON.parse_string(file.get_as_text())
	if payload is Dictionary:
		return payload as Dictionary
	return {}

func _sector_to_godot(point: Vector2, height: float = 0.0) -> Vector3:
	var plane: Array = sector_spec.get("sector_plane", [3600, 2700])
	var center := Vector2(float(plane[0]) * 0.5, float(plane[1]) * 0.5)
	return Vector3(
		(point.x - center.x) * SECTOR_WORLD_SCALE,
		height,
		(point.y - center.y) * SECTOR_WORLD_SCALE * TOPOLOGY_Z_SIGN
	)

func _load_sector() -> Node3D:
	var packed := load(GLB_PATH) as PackedScene
	if packed == null:
		push_error("AURELIAN_SECTOR_GENERATOR_V4_GLB_LOAD_FAILED: %s" % GLB_PATH)
		return null
	var instance := packed.instantiate() as Node3D
	if instance == null:
		push_error("AURELIAN_SECTOR_GENERATOR_V4_GLB_INSTANTIATE_FAILED")
		return null
	instance.name = "AurelianSectorGeneratorV4Imported"
	return instance

func _make_environment() -> Environment:
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color("#27332f")
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("#b8b29f")
	environment.ambient_light_energy = 0.36
	environment.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	environment.tonemap_exposure = 0.84
	environment.fog_enabled = true
	environment.fog_light_color = Color("#777f75")
	environment.fog_density = 0.00055
	return environment

func _populate_world(parent: Node) -> bool:
	var sector := _load_sector()
	if sector == null:
		get_tree().quit(62)
		return false
	parent.add_child(sector)

	var world_environment := WorldEnvironment.new()
	world_environment.name = "AurelianSectorGeneratorV4Environment"
	world_environment.environment = _make_environment()
	parent.add_child(world_environment)

	var sun := DirectionalLight3D.new()
	sun.name = "LateMorningSun"
	sun.rotation_degrees = Vector3(-51.0, -38.0, 0.0)
	sun.light_color = Color("#f3d4a8")
	sun.light_energy = 0.78
	sun.shadow_enabled = true
	parent.add_child(sun)

	var fill := DirectionalLight3D.new()
	fill.name = "CoolFill"
	fill.rotation_degrees = Vector3(-64.0, 138.0, 0.0)
	fill.light_color = Color("#809096")
	fill.light_energy = 0.12
	parent.add_child(fill)
	return true

func _make_camera(parent: Node) -> Camera3D:
	var camera_spec: Dictionary = sector_spec.get("camera", {})
	var focus_data: Array = camera_spec.get("focus", [1775, 1325])
	var offset_data: Array = camera_spec.get("position_offset", [19.0, 24.0, 19.0])
	var focus := _sector_to_godot(Vector2(float(focus_data[0]), float(focus_data[1])), 0.35)
	var camera := Camera3D.new()
	camera.name = "Camera_SectorGeneratorV4"
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.size = float(camera_spec.get("orthographic_size", 28.0))
	camera.near = 0.1
	camera.far = 700.0
	camera.position = focus + Vector3(float(offset_data[0]), float(offset_data[1]), float(offset_data[2]))
	parent.add_child(camera)
	camera.look_at(focus, Vector3.UP)
	return camera

func _capture_sector() -> void:
	if evidence_dir.is_empty():
		push_error("AURELIAN_SECTOR_GENERATOR_V4_MISSING_EVIDENCE_DIR")
		get_tree().quit(63)
		return
	DirAccess.make_dir_recursive_absolute(evidence_dir)

	var viewport := SubViewport.new()
	viewport.name = "SectorGeneratorV4EvidenceViewport"
	viewport.size = STILL_SIZE
	viewport.own_world_3d = true
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	viewport.render_target_clear_mode = SubViewport.CLEAR_MODE_ALWAYS
	viewport.transparent_bg = false
	add_child(viewport)

	var scene_root := Node3D.new()
	scene_root.name = "SectorGeneratorV4EvidenceWorld"
	viewport.add_child(scene_root)
	if not _populate_world(scene_root):
		return
	var camera := _make_camera(scene_root)
	camera.make_current()

	for _frame in range(12):
		await get_tree().process_frame
	await RenderingServer.frame_post_draw
	var image := viewport.get_texture().get_image()
	if image == null or image.is_empty():
		push_error("AURELIAN_SECTOR_GENERATOR_V4_EMPTY_CAPTURE")
		get_tree().quit(64)
		return
	if image.get_size() != STILL_SIZE:
		push_error("AURELIAN_SECTOR_GENERATOR_V4_WRONG_CAPTURE_SIZE: %s" % image.get_size())
		get_tree().quit(65)
		return
	var output_path := evidence_dir.path_join("sector-a01-generator-v4-1440x900.png")
	var result := image.save_png(output_path)
	if result != OK:
		push_error("AURELIAN_SECTOR_GENERATOR_V4_CAPTURE_SAVE_FAILED: %s" % output_path)
		get_tree().quit(66)
		return
	print("AURELIAN_SECTOR_GENERATOR_V4_STILL=%s" % output_path)
	get_tree().quit(0)
