extends Node3D

const GLB_PATH := "res://assets/aurelian-basin/export/aurelian_sector_lod_v1.glb"
const STILL_SIZE := Vector2i(1440, 900)
const TOPOLOGY_SCALE := 0.018
const TOPOLOGY_CENTER := Vector2(500.0, 450.0)
const TOPOLOGY_Z_SIGN := -1.0
const SECTOR_CAMERA_SIZE := 16.0
const REGIONAL_CITY_SCALE := 0.50
const REGIONAL_CITY_ROOTS := [
	"Greenvale_flag",
	"Greenvale_blacksmith",
	"Greenvale_barracks",
	"Greenvale_church",
	"Greenvale_gatehouse_road",
	"Greenvale_city_hall",
	"Greenvale_market_hall",
	"Greenvale_civic_house_west",
	"Greenvale_civic_house_east",
	"Greenvale_watchtower",
]

var evidence_dir := ""

static func topology_to_godot(point: Vector2, height: float = 0.0) -> Vector3:
	return Vector3(
		(point.x - TOPOLOGY_CENTER.x) * TOPOLOGY_SCALE,
		height,
		(point.y - TOPOLOGY_CENTER.y) * TOPOLOGY_SCALE * TOPOLOGY_Z_SIGN
	)

func _ready() -> void:
	evidence_dir = OS.get_environment("AURELIAN_EVIDENCE_DIR")
	if OS.get_environment("AURELIAN_CAPTURE_SECTOR_LOD") == "1":
		call_deferred("_capture_sector")
		return
	if not _populate_world(self):
		return
	var camera := _make_camera(self)
	camera.make_current()

func _load_sector() -> Node3D:
	var packed := load(GLB_PATH) as PackedScene
	if packed == null:
		push_error("AURELIAN_SECTOR_LOD_GLB_LOAD_FAILED: %s" % GLB_PATH)
		return null
	var instance := packed.instantiate() as Node3D
	if instance == null:
		push_error("AURELIAN_SECTOR_LOD_GLB_INSTANTIATE_FAILED")
		return null
	instance.name = "AurelianSectorLODImported"
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
	environment.fog_density = 0.0008
	return environment

func _apply_regional_lod(sector: Node3D) -> void:
	for node_name in REGIONAL_CITY_ROOTS:
		var node := sector.find_child(node_name, true, false) as Node3D
		if node != null:
			node.scale *= Vector3.ONE * REGIONAL_CITY_SCALE

func _populate_world(parent: Node) -> bool:
	var sector := _load_sector()
	if sector == null:
		get_tree().quit(51)
		return false
	_apply_regional_lod(sector)
	parent.add_child(sector)

	var world_environment := WorldEnvironment.new()
	world_environment.name = "AurelianSectorLODEnvironment"
	world_environment.environment = _make_environment()
	parent.add_child(world_environment)

	var sun := DirectionalLight3D.new()
	sun.name = "LateMorningSun"
	sun.rotation_degrees = Vector3(-43.0, -38.0, 0.0)
	sun.light_color = Color("#f3d4a8")
	sun.light_energy = 0.66
	sun.shadow_enabled = true
	parent.add_child(sun)

	var fill := DirectionalLight3D.new()
	fill.name = "CoolFill"
	fill.rotation_degrees = Vector3(-62.0, 138.0, 0.0)
	fill.light_color = Color("#809096")
	fill.light_energy = 0.10
	parent.add_child(fill)
	return true

func _make_camera(parent: Node) -> Camera3D:
	var focus := topology_to_godot(Vector2(500.0, 450.0), 0.25)
	var camera := Camera3D.new()
	camera.name = "Camera_SectorLOD"
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.size = SECTOR_CAMERA_SIZE
	camera.near = 0.1
	camera.far = 500.0
	camera.position = focus + Vector3(11.6, 10.2, 11.6)
	parent.add_child(camera)
	camera.look_at(focus, Vector3.UP)
	return camera

func _capture_sector() -> void:
	if evidence_dir.is_empty():
		push_error("AURELIAN_SECTOR_LOD_MISSING_EVIDENCE_DIR")
		get_tree().quit(52)
		return
	DirAccess.make_dir_recursive_absolute(evidence_dir)

	var viewport := SubViewport.new()
	viewport.name = "SectorLODEvidenceViewport"
	viewport.size = STILL_SIZE
	viewport.own_world_3d = true
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	viewport.render_target_clear_mode = SubViewport.CLEAR_MODE_ALWAYS
	viewport.transparent_bg = false
	add_child(viewport)

	var scene_root := Node3D.new()
	scene_root.name = "SectorLODEvidenceWorld"
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
		push_error("AURELIAN_SECTOR_LOD_EMPTY_CAPTURE")
		get_tree().quit(53)
		return
	if image.get_size() != STILL_SIZE:
		push_error("AURELIAN_SECTOR_LOD_WRONG_CAPTURE_SIZE: %s" % image.get_size())
		get_tree().quit(54)
		return
	var output_path := evidence_dir.path_join("sector-a01-lod-1440x900.png")
	var result := image.save_png(output_path)
	if result != OK:
		push_error("AURELIAN_SECTOR_LOD_CAPTURE_SAVE_FAILED: %s" % output_path)
		get_tree().quit(55)
		return
	print("AURELIAN_SECTOR_LOD_STILL=%s" % output_path)
	get_tree().quit(0)