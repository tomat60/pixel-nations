extends Node3D

const VIEWPORT_SIZE := Vector2i(1440, 900)
const GLB_PATH := "res://calibration_input/aurelian_basin_phase1_recovery.glb"
const MOVIE_FRAMES := 300

var evidence_dir := ""
var stage := ""
var movie_frame := 0
var movie_imported: Node3D
var movie_meshes: Array = []
var movie_camera: Camera3D
var movie_bounds := AABB()
var movie_override: StandardMaterial3D

func _ready() -> void:
	evidence_dir = OS.get_environment("AURELIAN_IMPORT_EVIDENCE_DIR")
	stage = OS.get_environment("AURELIAN_IMPORT_STAGE").to_lower()
	if evidence_dir.is_empty():
		push_error("AURELIAN_IMPORT_EVIDENCE_DIR is required")
		get_tree().quit(2)
		return
	DirAccess.make_dir_recursive_absolute(evidence_dir)

	if stage == "movie":
		if not _setup_movie():
			return
		set_process(true)
		return

	if not stage in ["sentinel", "perspective_override", "perspective_original", "sub_override", "sub_original", "ortho_original"]:
		push_error("Unknown calibration stage: %s" % stage)
		get_tree().quit(3)
		return

	call_deferred("_run_still_stage")

func _run_still_stage() -> void:
	if stage == "sentinel":
		_setup_sentinel_world(self, Vector3.ZERO, 2.8)
		var camera := _make_fixed_sentinel_camera(self)
		await _settle_frames(8)
		_save_viewport_png(get_viewport(), "sentinel-main.png")
		_write_camera_manifest("camera-sentinel-main.json", camera, get_viewport())
		print("AURELIAN_IMPORT_STAGE_PASS=sentinel")
		get_tree().quit(0)
		return

	if stage.begins_with("sub_"):
		await _run_subviewport_stage(stage == "sub_override")
		return

	var imported := _load_imported_scene()
	if imported == null:
		return
	add_child(imported)
	await get_tree().process_frame
	var inventory := _inventory_import(imported)
	if int(inventory["mesh_count"]) <= 0 or int(inventory["surface_count"]) <= 0:
		push_error("Imported GLB has no usable mesh surfaces")
		get_tree().quit(4)
		return
	_write_json(evidence_dir.path_join("inventory-%s.json" % stage), inventory)
	var bounds := _dict_to_aabb(inventory["global_aabb"])
	var sentinel_scale := max(max(bounds.size.x, bounds.size.y), bounds.size.z) / 11.0
	_setup_sentinel_world(self, _sentinel_position(bounds), max(sentinel_scale, 2.0))
	var use_override := stage == "perspective_override"
	if use_override:
		_apply_override(imported)
	var camera := _make_bounds_camera(self, bounds, stage == "ortho_original")
	await _settle_frames(10)
	_save_viewport_png(get_viewport(), "%s-main.png" % stage)
	_write_camera_manifest("camera-%s-main.json" % stage, camera, get_viewport())
	print("AURELIAN_IMPORT_STAGE_PASS=%s" % stage)
	get_tree().quit(0)

func _run_subviewport_stage(use_override: bool) -> void:
	var viewport := SubViewport.new()
	viewport.name = "AurelianImportSubViewport"
	viewport.size = VIEWPORT_SIZE
	viewport.own_world_3d = true
	viewport.transparent_bg = false
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	add_child(viewport)

	var world_root := Node3D.new()
	world_root.name = "SubWorld"
	viewport.add_child(world_root)
	var imported := _load_imported_scene()
	if imported == null:
		return
	world_root.add_child(imported)
	await get_tree().process_frame
	var inventory := _inventory_import(imported)
	if int(inventory["mesh_count"]) <= 0 or int(inventory["surface_count"]) <= 0:
		push_error("Imported GLB has no usable mesh surfaces in SubViewport")
		get_tree().quit(5)
		return
	var label := "sub_override" if use_override else "sub_original"
	_write_json(evidence_dir.path_join("inventory-%s.json" % label), inventory)
	var bounds := _dict_to_aabb(inventory["global_aabb"])
	var sentinel_scale := max(max(bounds.size.x, bounds.size.y), bounds.size.z) / 11.0
	_setup_sentinel_world(world_root, _sentinel_position(bounds), max(sentinel_scale, 2.0))
	if use_override:
		_apply_override(imported)
	var camera := _make_bounds_camera(world_root, bounds, false)

	var layer := CanvasLayer.new()
	layer.name = "ConsumedSubViewportLayer"
	add_child(layer)
	var overlay := TextureRect.new()
	overlay.name = "ConsumedSubViewportTexture"
	overlay.texture = viewport.get_texture()
	overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	overlay.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	overlay.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	layer.add_child(overlay)

	await _settle_frames(12)
	_save_viewport_png(viewport, "%s.png" % label)
	_save_viewport_png(get_viewport(), "%s-consumed-main.png" % label)
	_write_camera_manifest("camera-%s.json" % label, camera, viewport)
	print("AURELIAN_IMPORT_STAGE_PASS=%s" % label)
	get_tree().quit(0)

func _setup_movie() -> bool:
	movie_imported = _load_imported_scene()
	if movie_imported == null:
		return false
	add_child(movie_imported)
	await get_tree().process_frame
	var inventory := _inventory_import(movie_imported)
	_write_json(evidence_dir.path_join("inventory-movie.json"), inventory)
	if int(inventory["mesh_count"]) <= 0:
		push_error("Movie import has no meshes")
		get_tree().quit(6)
		return false
	movie_bounds = _dict_to_aabb(inventory["global_aabb"])
	var sentinel_scale := max(max(movie_bounds.size.x, movie_bounds.size.y), movie_bounds.size.z) / 11.0
	_setup_sentinel_world(self, _sentinel_position(movie_bounds), max(sentinel_scale, 2.0))
	movie_camera = _make_bounds_camera(self, movie_bounds, false)
	movie_meshes = _collect_meshes(movie_imported)
	movie_override = _diagnostic_override_material()
	_set_mesh_visibility(movie_meshes, false)
	print("AURELIAN_IMPORT_MOVIE_STAGE=sentinel")
	return true

func _process(_delta: float) -> void:
	if stage != "movie":
		return
	movie_frame += 1
	if movie_frame == 75:
		_set_mesh_visibility(movie_meshes, true)
		_set_override_on_meshes(movie_meshes, movie_override)
		print("AURELIAN_IMPORT_MOVIE_STAGE=override")
	elif movie_frame == 150:
		_set_override_on_meshes(movie_meshes, null)
		print("AURELIAN_IMPORT_MOVIE_STAGE=original")
	elif movie_frame == 225:
		movie_camera.projection = Camera3D.PROJECTION_ORTHOGONAL
		movie_camera.size = max(movie_bounds.size.x, movie_bounds.size.z) * 1.35
		print("AURELIAN_IMPORT_MOVIE_STAGE=ortho")
	elif movie_frame >= MOVIE_FRAMES:
		print("AURELIAN_IMPORT_MOVIE_COMPLETE=%d" % MOVIE_FRAMES)
		get_tree().quit(0)

func _load_imported_scene() -> Node3D:
	var packed := load(GLB_PATH) as PackedScene
	if packed == null:
		push_error("Failed to load pinned GLB: %s" % GLB_PATH)
		get_tree().quit(10)
		return null
	var instance := packed.instantiate() as Node3D
	if instance == null:
		push_error("Pinned GLB root is not Node3D")
		get_tree().quit(11)
		return null
	instance.name = "PinnedAurelian429"
	return instance

func _setup_sentinel_world(parent: Node, position: Vector3, size: float) -> void:
	_make_environment(parent)
	var sentinel := MeshInstance3D.new()
	sentinel.name = "CalibrationSentinel"
	sentinel.layers = 1
	var mesh := BoxMesh.new()
	mesh.size = Vector3(size, size, size)
	var material := StandardMaterial3D.new()
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	material.albedo_color = Color("#ffd43b")
	material.cull_mode = BaseMaterial3D.CULL_DISABLED
	mesh.material = material
	sentinel.mesh = mesh
	sentinel.position = position
	sentinel.rotation = Vector3(0.35, 0.55, 0.15)
	parent.add_child(sentinel)

func _make_environment(parent: Node) -> void:
	var world_environment := WorldEnvironment.new()
	world_environment.name = "CalibrationEnvironment"
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color("#21485c")
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color.WHITE
	environment.ambient_light_energy = 1.15
	world_environment.environment = environment
	parent.add_child(world_environment)
	var sun := DirectionalLight3D.new()
	sun.name = "CalibrationSun"
	sun.rotation_degrees = Vector3(-48.0, -35.0, 0.0)
	sun.light_energy = 1.4
	parent.add_child(sun)

func _make_fixed_sentinel_camera(parent: Node) -> Camera3D:
	var camera := Camera3D.new()
	camera.name = "SentinelCamera"
	camera.position = Vector3(0.0, 0.0, 7.0)
	camera.fov = 45.0
	camera.near = 0.05
	camera.far = 100.0
	camera.cull_mask = 1
	parent.add_child(camera)
	camera.look_at(Vector3.ZERO, Vector3.UP)
	camera.make_current()
	return camera

func _make_bounds_camera(parent: Node, bounds: AABB, orthographic: bool) -> Camera3D:
	var camera := Camera3D.new()
	camera.name = "BoundsCamera"
	camera.cull_mask = 1
	camera.near = 0.05
	var center := bounds.get_center()
	var max_dim := max(max(bounds.size.x, bounds.size.y), bounds.size.z)
	var distance := max(max_dim * 2.2, 30.0)
	camera.position = center + Vector3(distance * 0.85, distance * 0.68, distance)
	camera.far = max(distance * 8.0, 2000.0)
	if orthographic:
		camera.projection = Camera3D.PROJECTION_ORTHOGONAL
		camera.size = max(bounds.size.x, bounds.size.z) * 1.35
	else:
		camera.projection = Camera3D.PROJECTION_PERSPECTIVE
		camera.fov = 40.0
	parent.add_child(camera)
	camera.look_at(center, Vector3.UP)
	camera.make_current()
	return camera

func _sentinel_position(bounds: AABB) -> Vector3:
	return bounds.get_center() + Vector3(-bounds.size.x * 0.38, bounds.size.y * 0.62 + 2.0, -bounds.size.z * 0.18)

func _diagnostic_override_material() -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	material.albedo_color = Color("#ff4b2b")
	material.cull_mode = BaseMaterial3D.CULL_DISABLED
	material.transparency = BaseMaterial3D.TRANSPARENCY_DISABLED
	return material

func _apply_override(root: Node) -> void:
	_set_override_on_meshes(_collect_meshes(root), _diagnostic_override_material())

func _collect_meshes(root: Node) -> Array:
	var meshes: Array = []
	_collect_meshes_recursive(root, meshes)
	return meshes

func _collect_meshes_recursive(node: Node, meshes: Array) -> void:
	if node is MeshInstance3D:
		meshes.append(node)
	for child in node.get_children():
		_collect_meshes_recursive(child, meshes)

func _set_mesh_visibility(meshes: Array, visible_value: bool) -> void:
	for item in meshes:
		(item as MeshInstance3D).visible = visible_value

func _set_override_on_meshes(meshes: Array, material: Material) -> void:
	for item in meshes:
		(item as MeshInstance3D).material_override = material

func _inventory_import(root: Node3D) -> Dictionary:
	var meshes := _collect_meshes(root)
	var surface_count := 0
	var material_inventory: Array = []
	var bounds_initialized := false
	var global_bounds := AABB()
	for item in meshes:
		var mesh_instance := item as MeshInstance3D
		if mesh_instance.mesh == null:
			continue
		var transformed := _transform_aabb(mesh_instance.get_aabb(), mesh_instance.global_transform)
		if not bounds_initialized:
			global_bounds = transformed
			bounds_initialized = true
		else:
			global_bounds = global_bounds.merge(transformed)
		for surface in range(mesh_instance.mesh.get_surface_count()):
			surface_count += 1
			var material := mesh_instance.get_active_material(surface)
			var entry := {
				"node": str(mesh_instance.get_path()),
				"surface": surface,
				"material_class": material.get_class() if material != null else "null"
			}
			if material is BaseMaterial3D:
				entry["transparency"] = material.transparency
				entry["cull_mode"] = material.cull_mode
				entry["shading_mode"] = material.shading_mode
			material_inventory.append(entry)
	if not bounds_initialized:
		global_bounds = AABB(Vector3.ZERO, Vector3.ZERO)
	var inventory := {
		"node_count": _count_nodes(root),
		"mesh_count": meshes.size(),
		"surface_count": surface_count,
		"visible_mesh_count": meshes.filter(func(m): return (m as MeshInstance3D).visible).size(),
		"global_aabb": _aabb_to_dict(global_bounds),
		"materials": material_inventory,
		"renderer": RenderingServer.get_current_rendering_driver_name(),
		"adapter": RenderingServer.get_video_adapter_name(),
		"display_server": DisplayServer.get_name()
	}
	return inventory

func _count_nodes(root: Node) -> int:
	var count := 1
	for child in root.get_children():
		count += _count_nodes(child)
	return count

func _transform_aabb(local: AABB, transform: Transform3D) -> AABB:
	var p := local.position
	var s := local.size
	var points := [
		p,
		p + Vector3(s.x, 0, 0),
		p + Vector3(0, s.y, 0),
		p + Vector3(0, 0, s.z),
		p + Vector3(s.x, s.y, 0),
		p + Vector3(s.x, 0, s.z),
		p + Vector3(0, s.y, s.z),
		p + s
	]
	var first := transform * points[0]
	var result := AABB(first, Vector3.ZERO)
	for index in range(1, points.size()):
		result = result.expand(transform * points[index])
	return result

func _aabb_to_dict(bounds: AABB) -> Dictionary:
	return {
		"position": [bounds.position.x, bounds.position.y, bounds.position.z],
		"size": [bounds.size.x, bounds.size.y, bounds.size.z],
		"center": [bounds.get_center().x, bounds.get_center().y, bounds.get_center().z]
	}

func _dict_to_aabb(data: Dictionary) -> AABB:
	var p: Array = data["position"]
	var s: Array = data["size"]
	return AABB(Vector3(float(p[0]), float(p[1]), float(p[2])), Vector3(float(s[0]), float(s[1]), float(s[2])))

func _settle_frames(count: int) -> void:
	for _index in range(count):
		await get_tree().process_frame
	await RenderingServer.frame_post_draw

func _save_viewport_png(viewport: Viewport, filename: String) -> void:
	var image := viewport.get_texture().get_image()
	if image == null or image.is_empty():
		push_error("Empty viewport image: %s" % filename)
		get_tree().quit(20)
		return
	if image.get_size() != VIEWPORT_SIZE:
		push_error("Wrong viewport size %s for %s" % [image.get_size(), filename])
		get_tree().quit(21)
		return
	var path := evidence_dir.path_join(filename)
	if image.save_png(path) != OK:
		push_error("Failed to save %s" % path)
		get_tree().quit(22)
		return
	print("AURELIAN_IMPORT_STILL=%s" % path)

func _write_camera_manifest(filename: String, camera: Camera3D, viewport: Viewport) -> void:
	_write_json(evidence_dir.path_join(filename), {
		"path": str(camera.get_path()),
		"current": camera.is_current(),
		"projection": camera.projection,
		"fov": camera.fov,
		"size": camera.size,
		"near": camera.near,
		"far": camera.far,
		"cull_mask": camera.cull_mask,
		"position": [camera.global_position.x, camera.global_position.y, camera.global_position.z],
		"viewport_size": [viewport.get_visible_rect().size.x, viewport.get_visible_rect().size.y]
	})

func _write_json(path: String, data: Variant) -> void:
	var file := FileAccess.open(path, FileAccess.WRITE)
	if file == null:
		push_error("Failed to open JSON output: %s" % path)
		return
	file.store_string(JSON.stringify(data, "\t") + "\n")
