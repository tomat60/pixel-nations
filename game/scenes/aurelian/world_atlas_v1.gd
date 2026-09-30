extends Node3D

const GLB_PATH := "res://assets/aurelian-basin/export/world_atlas_v1.glb"
const SPEC_PATH := "res://assets/aurelian-basin/source/world_atlas_v1_spec.json"
const STILL_SIZE := Vector2i(1440, 900)
const WORLD_SCALE := 0.006
const TOPOLOGY_Z_SIGN := -1.0

var evidence_dir := ""
var atlas_spec: Dictionary = {}

func _ready() -> void:
	atlas_spec = _read_json(SPEC_PATH)
	if atlas_spec.is_empty():
		push_error("PIXEL_NATIONS_WORLD_ATLAS_V1_SPEC_LOAD_FAILED")
		get_tree().quit(71)
		return
	evidence_dir = OS.get_environment("AURELIAN_EVIDENCE_DIR")
	if OS.get_environment("AURELIAN_CAPTURE_WORLD_ATLAS_V1") == "1":
		call_deferred("_capture_atlas")
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

func _atlas_to_godot(point: Vector2, height: float = 0.0) -> Vector3:
	var plane: Array = atlas_spec.get("world_plane", [14000, 9000])
	var center := Vector2(float(plane[0]) * 0.5, float(plane[1]) * 0.5)
	return Vector3(
		(point.x - center.x) * WORLD_SCALE,
		height,
		(point.y - center.y) * WORLD_SCALE * TOPOLOGY_Z_SIGN
	)

func _load_atlas() -> Node3D:
	var packed := load(GLB_PATH) as PackedScene
	if packed == null:
		push_error("PIXEL_NATIONS_WORLD_ATLAS_V1_GLB_LOAD_FAILED: %s" % GLB_PATH)
		return null
	var instance := packed.instantiate() as Node3D
	if instance == null:
		push_error("PIXEL_NATIONS_WORLD_ATLAS_V1_GLB_INSTANTIATE_FAILED")
		return null
	instance.name = "PixelNationsWorldAtlasV1Imported"
	return instance

func _make_environment() -> Environment:
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color("#283633")
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("#c3bda9")
	environment.ambient_light_energy = 0.42
	environment.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	environment.tonemap_exposure = 0.94
	environment.fog_enabled = true
	environment.fog_light_color = Color("#84908a")
	environment.fog_density = 0.00024
	return environment

func _force_atlas_vertex_color(node: Node) -> void:
	if node is MeshInstance3D and String(node.name).begins_with("PixelNationsWorldAtlasV1Terrain"):
		var mesh_instance := node as MeshInstance3D
		var material := StandardMaterial3D.new()
		material.vertex_color_use_as_albedo = true
		material.roughness = 0.97
		material.cull_mode = BaseMaterial3D.CULL_DISABLED
		mesh_instance.material_override = material
	for child in node.get_children():
		_force_atlas_vertex_color(child)

func _home_material(spec: Dictionary) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = Color(String(spec.get("color", "#ffffff")))
	material.roughness = float(spec.get("roughness", 0.95))
	return material


func _build_home_land_use(parent: Node) -> void:
	var home: Dictionary = atlas_spec.get("home_land_use", {})
	if String(home.get("contract", "")) != "WORLD_HOME_INHABITED_BASIN_V1":
		push_error("PIXEL_NATIONS_WORLD_HOME_LAND_USE_CONTRACT_INVALID")
		return
	var materials: Dictionary = home.get("materials", {})
	var player_roof := _home_material(materials.get("player_roof", {}) as Dictionary)
	var secondary_roof := _home_material(materials.get("secondary_roof", {}) as Dictionary)
	var cultivated_land := _home_material(materials.get("cultivated_land", {}) as Dictionary)
	var piece_sizes: Array = home.get("district_piece_sizes_world", [])

	var root := Node3D.new()
	root.name = "WorldHomeInhabitedBasin"
	for district_variant in home.get("districts", []):
		var district: Dictionary = district_variant
		var center: Array = district.get("atlas_center", [])
		var size_index := int(district.get("piece_size_index", -1))
		if center.size() != 2 or size_index < 0 or size_index >= piece_sizes.size():
			push_error("PIXEL_NATIONS_WORLD_HOME_DISTRICT_INVALID")
			continue
		var size_data: Array = piece_sizes[size_index]
		if size_data.size() != 3:
			push_error("PIXEL_NATIONS_WORLD_HOME_DISTRICT_SIZE_INVALID")
			continue
		var mesh := BoxMesh.new()
		mesh.size = Vector3(float(size_data[0]), float(size_data[1]), float(size_data[2]))
		var piece := MeshInstance3D.new()
		piece.name = String(district.get("id", "HomeDistrict"))
		piece.mesh = mesh
		piece.position = _atlas_to_godot(
			Vector2(float(center[0]), float(center[1])),
			float(district.get("world_height", 0.0))
		)
		piece.rotation_degrees.y = float(district.get("rotation_deg", 0.0))
		piece.material_override = player_roof if String(district.get("identity", "player")) == "player" else secondary_roof
		root.add_child(piece)

	for parcel_variant in home.get("parcels", []):
		var parcel: Dictionary = parcel_variant
		var center: Array = parcel.get("atlas_center", [])
		var size_data: Array = parcel.get("size_world", [])
		if center.size() != 2 or size_data.size() != 3:
			push_error("PIXEL_NATIONS_WORLD_HOME_PARCEL_INVALID")
			continue
		var mesh := BoxMesh.new()
		mesh.size = Vector3(float(size_data[0]), float(size_data[1]), float(size_data[2]))
		var patch := MeshInstance3D.new()
		patch.name = String(parcel.get("id", "HomeParcel"))
		patch.mesh = mesh
		patch.position = _atlas_to_godot(
			Vector2(float(center[0]), float(center[1])),
			float(parcel.get("world_height", 0.0))
		)
		patch.rotation_degrees.y = float(parcel.get("rotation_deg", 0.0))
		patch.material_override = cultivated_land
		root.add_child(patch)
	parent.add_child(root)


func _populate_world(parent: Node) -> bool:
	var atlas := _load_atlas()
	if atlas == null:
		get_tree().quit(72)
		return false
	parent.add_child(atlas)
	_force_atlas_vertex_color(atlas)
	_build_home_land_use(parent)

	var world_environment := WorldEnvironment.new()
	world_environment.name = "PixelNationsWorldAtlasV1Environment"
	world_environment.environment = _make_environment()
	parent.add_child(world_environment)

	var sun := DirectionalLight3D.new()
	sun.name = "AtlasLateMorningSun"
	sun.rotation_degrees = Vector3(-54.0, -42.0, 0.0)
	sun.light_color = Color("#f1d6ac")
	sun.light_energy = 0.86
	sun.shadow_enabled = true
	parent.add_child(sun)

	var fill := DirectionalLight3D.new()
	fill.name = "AtlasCoolFill"
	fill.rotation_degrees = Vector3(-66.0, 132.0, 0.0)
	fill.light_color = Color("#879aa0")
	fill.light_energy = 0.16
	parent.add_child(fill)
	return true

func _make_camera(parent: Node) -> Camera3D:
	var camera_spec: Dictionary = atlas_spec.get("camera", {})
	var focus_data: Array = camera_spec.get("focus", [7100, 4450])
	var offset_data: Array = camera_spec.get("position_offset", [45.0, 58.0, 45.0])
	var focus := _atlas_to_godot(Vector2(float(focus_data[0]), float(focus_data[1])), 0.8)
	var camera := Camera3D.new()
	camera.name = "Camera_WorldAtlasV1"
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.size = float(camera_spec.get("orthographic_size", 72.0))
	camera.near = 0.1
	camera.far = 1200.0
	camera.position = focus + Vector3(float(offset_data[0]), float(offset_data[1]), float(offset_data[2]))
	parent.add_child(camera)
	camera.look_at(focus, Vector3.UP)
	return camera

func _capture_atlas() -> void:
	if evidence_dir.is_empty():
		push_error("PIXEL_NATIONS_WORLD_ATLAS_V1_MISSING_EVIDENCE_DIR")
		get_tree().quit(73)
		return
	DirAccess.make_dir_recursive_absolute(evidence_dir)

	var viewport := SubViewport.new()
	viewport.name = "WorldAtlasV1EvidenceViewport"
	viewport.size = STILL_SIZE
	viewport.own_world_3d = true
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	viewport.render_target_clear_mode = SubViewport.CLEAR_MODE_ALWAYS
	viewport.transparent_bg = false
	add_child(viewport)

	var scene_root := Node3D.new()
	scene_root.name = "WorldAtlasV1EvidenceWorld"
	viewport.add_child(scene_root)
	if not _populate_world(scene_root):
		return
	var camera := _make_camera(scene_root)
	camera.make_current()

	for _frame in range(14):
		await get_tree().process_frame
	await RenderingServer.frame_post_draw
	var image := viewport.get_texture().get_image()
	if image == null or image.is_empty():
		push_error("PIXEL_NATIONS_WORLD_ATLAS_V1_EMPTY_CAPTURE")
		get_tree().quit(74)
		return
	if image.get_size() != STILL_SIZE:
		push_error("PIXEL_NATIONS_WORLD_ATLAS_V1_WRONG_CAPTURE_SIZE: %s" % image.get_size())
		get_tree().quit(75)
		return
	var output_path := evidence_dir.path_join("world-atlas-v1-1440x900.png")
	var result := image.save_png(output_path)
	if result != OK:
		push_error("PIXEL_NATIONS_WORLD_ATLAS_V1_CAPTURE_SAVE_FAILED: %s" % output_path)
		get_tree().quit(76)
		return
	print("PIXEL_NATIONS_WORLD_ATLAS_V1_STILL=%s" % output_path)
	get_tree().quit(0)