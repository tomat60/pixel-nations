extends Node3D

const GLB_PATH := "res://assets/aurelian-sector-a01/export/sector_a01_authored_v1.glb"
const STILL_SIZE := Vector2i(1440, 900)
const SECTOR_CAMERA_SIZE := 29.0

var evidence_dir := ""

func _ready() -> void:
	evidence_dir = OS.get_environment("AURELIAN_EVIDENCE_DIR")
	var capture := OS.get_environment("AURELIAN_CAPTURE_AUTHORED_SECTOR") == "1"
	if capture:
		call_deferred("_capture_sector")
		return
	if not _populate_world(self):
		return
	var camera := _make_camera(self)
	camera.make_current()

func _load_sector() -> Node3D:
	var packed := load(GLB_PATH) as PackedScene
	if packed == null:
		push_error("WORLD_SCALE_AUTHORED_SECTOR_GLB_LOAD_FAILED: %s" % GLB_PATH)
		return null
	var instance := packed.instantiate() as Node3D
	if instance == null:
		push_error("WORLD_SCALE_AUTHORED_SECTOR_GLB_INSTANTIATE_FAILED")
		return null
	instance.name = "SectorA01AuthoredImported"
	return instance

func _make_environment() -> Environment:
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color("#31515a")
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("#bcb79f")
	environment.ambient_light_energy = 0.38
	environment.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	environment.tonemap_exposure = 0.86
	environment.fog_enabled = true
	environment.fog_light_color = Color("#72827d")
	environment.fog_density = 0.00065
	return environment

func _populate_world(parent: Node) -> bool:
	var sector := _load_sector()
	if sector == null:
		get_tree().quit(42)
		return false
	parent.add_child(sector)

	var world_environment := WorldEnvironment.new()
	world_environment.name = "SectorA01Environment"
	world_environment.environment = _make_environment()
	parent.add_child(world_environment)

	var sun := DirectionalLight3D.new()
	sun.name = "SectorLateMorningSun"
	sun.rotation_degrees = Vector3(-50.0, -34.0, 0.0)
	sun.light_color = Color("#f2d3a7")
	sun.light_energy = 0.68
	sun.shadow_enabled = true
	parent.add_child(sun)

	var fill := DirectionalLight3D.new()
	fill.name = "SectorCoolFill"
	fill.rotation_degrees = Vector3(-61.0, 141.0, 0.0)
	fill.light_color = Color("#819397")
	fill.light_energy = 0.12
	parent.add_child(fill)
	return true

func _make_camera(parent: Node) -> Camera3D:
	var camera := Camera3D.new()
	camera.name = "Camera_SectorA01"
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.size = SECTOR_CAMERA_SIZE
	camera.near = 0.1
	camera.far = 500.0
	var focus := Vector3(0.5, 0.55, 0.2)
	camera.position = focus + Vector3(22.5, 27.0, 22.5)
	parent.add_child(camera)
	camera.look_at(focus, Vector3.UP)
	return camera

func _capture_sector() -> void:
	if evidence_dir.is_empty():
		push_error("WORLD_SCALE_AUTHORED_SECTOR_MISSING_EVIDENCE_DIR")
		get_tree().quit(43)
		return
	DirAccess.make_dir_recursive_absolute(evidence_dir)

	var viewport := SubViewport.new()
	viewport.name = "SectorA01EvidenceViewport"
	viewport.size = STILL_SIZE
	viewport.own_world_3d = true
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	viewport.render_target_clear_mode = SubViewport.CLEAR_MODE_ALWAYS
	viewport.transparent_bg = false
	add_child(viewport)

	var scene_root := Node3D.new()
	scene_root.name = "SectorA01EvidenceWorld"
	viewport.add_child(scene_root)
	if not _populate_world(scene_root):
		return
	var camera := _make_camera(scene_root)
	camera.make_current()

	for _frame in range(10):
		await get_tree().process_frame
	await RenderingServer.frame_post_draw
	var image := viewport.get_texture().get_image()
	if image == null or image.is_empty():
		push_error("WORLD_SCALE_AUTHORED_SECTOR_EMPTY_CAPTURE")
		get_tree().quit(44)
		return
	if image.get_size() != STILL_SIZE:
		push_error("WORLD_SCALE_AUTHORED_SECTOR_WRONG_CAPTURE_SIZE: %s" % image.get_size())
		get_tree().quit(45)
		return
	var output_path := evidence_dir.path_join("sector-a01-authored-1440x900.png")
	var result := image.save_png(output_path)
	if result != OK:
		push_error("WORLD_SCALE_AUTHORED_SECTOR_CAPTURE_SAVE_FAILED: %s" % output_path)
		get_tree().quit(46)
		return
	print("WORLD_SCALE_AUTHORED_SECTOR_STILL=%s" % output_path)
	get_tree().quit(0)
