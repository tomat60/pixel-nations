extends Node3D

const VIEWPORT_SIZE := Vector2i(1440, 900)
const MOVIE_FRAMES := 180

var main_camera: Camera3D
var main_primitive: MeshInstance3D
var evidence_subviewport: SubViewport
var sub_camera: Camera3D
var sub_primitive: MeshInstance3D
var subviewport_overlay: TextureRect
var movie_frame := 0

func _ready() -> void:
	main_camera = _make_camera("MainCamera", self)
	main_primitive = _make_primitive("MainPrimitive", self, Color("#ffd43b"))
	_make_environment("MainEnvironment", self, Color("#173b78"))

	evidence_subviewport = SubViewport.new()
	evidence_subviewport.name = "EvidenceSubViewport"
	evidence_subviewport.size = VIEWPORT_SIZE
	evidence_subviewport.own_world_3d = true
	evidence_subviewport.transparent_bg = false
	evidence_subviewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	add_child(evidence_subviewport)

	sub_camera = _make_camera("SubViewportCamera", evidence_subviewport)
	sub_primitive = _make_primitive("SubViewportPrimitive", evidence_subviewport, Color("#ff3bd5"))
	_make_environment("SubViewportEnvironment", evidence_subviewport, Color("#087f8c"))

	var layer := CanvasLayer.new()
	layer.name = "SubViewportEvidenceLayer"
	add_child(layer)
	subviewport_overlay = TextureRect.new()
	subviewport_overlay.name = "SubViewportOverlay"
	subviewport_overlay.texture = evidence_subviewport.get_texture()
	subviewport_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	subviewport_overlay.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	subviewport_overlay.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	subviewport_overlay.visible = false
	layer.add_child(subviewport_overlay)

	print("CALIBRATION_RUNTIME_ASSERTIONS=PASS")
	print("CALIBRATION_MAIN_CAMERA_CURRENT=%s" % main_camera.is_current())
	print("CALIBRATION_SUB_CAMERA_CURRENT=%s" % sub_camera.is_current())
	print("CALIBRATION_VISIBLE_GEOMETRY=2")

	if OS.get_environment("CALIBRATION_CAPTURE") == "1":
		await get_tree().process_frame
		await get_tree().process_frame
		await RenderingServer.frame_post_draw
		_capture_stills()
		get_tree().quit()

func _process(_delta: float) -> void:
	if OS.get_environment("CALIBRATION_MOVIE") != "1":
		return
	movie_frame += 1
	if movie_frame == 90:
		subviewport_overlay.visible = true
		print("CALIBRATION_MOVIE_SWITCH=SUBVIEWPORT")
	if movie_frame >= MOVIE_FRAMES:
		print("CALIBRATION_MOVIE_COMPLETE=%d" % MOVIE_FRAMES)
		get_tree().quit()

func _make_camera(node_name: String, parent: Node) -> Camera3D:
	var camera := Camera3D.new()
	camera.name = node_name
	camera.position = Vector3(0.0, 0.0, 6.0)
	camera.projection = Camera3D.PROJECTION_PERSPECTIVE
	camera.fov = 45.0
	camera.near = 0.05
	camera.far = 100.0
	camera.cull_mask = 1
	parent.add_child(camera)
	camera.look_at(Vector3.ZERO, Vector3.UP)
	camera.current = true
	return camera

func _make_primitive(node_name: String, parent: Node, color: Color) -> MeshInstance3D:
	var primitive := MeshInstance3D.new()
	primitive.name = node_name
	primitive.layers = 1
	var mesh := BoxMesh.new()
	mesh.size = Vector3(2.8, 2.8, 2.8)
	var material := StandardMaterial3D.new()
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	material.albedo_color = color
	mesh.material = material
	primitive.mesh = mesh
	primitive.rotation = Vector3(0.35, 0.55, 0.15)
	parent.add_child(primitive)
	return primitive

func _make_environment(node_name: String, parent: Node, color: Color) -> WorldEnvironment:
	var world_environment := WorldEnvironment.new()
	world_environment.name = node_name
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = color
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color.WHITE
	environment.ambient_light_energy = 1.0
	world_environment.environment = environment
	parent.add_child(world_environment)
	return world_environment

func _capture_stills() -> void:
	var evidence_dir := OS.get_environment("CALIBRATION_EVIDENCE_DIR")
	if evidence_dir.is_empty():
		push_error("CALIBRATION_EVIDENCE_DIR is required")
		get_tree().quit(2)
		return
	DirAccess.make_dir_recursive_absolute(evidence_dir)
	var main_image := get_viewport().get_texture().get_image()
	var sub_image := evidence_subviewport.get_texture().get_image()
	var main_path := evidence_dir.path_join("main-viewport.png")
	var sub_path := evidence_dir.path_join("subviewport.png")
	if main_image.save_png(main_path) != OK:
		push_error("Failed to save main viewport")
		get_tree().quit(3)
		return
	if sub_image.save_png(sub_path) != OK:
		push_error("Failed to save SubViewport")
		get_tree().quit(4)
		return
	_write_json(evidence_dir.path_join("runtime.json"), {
		"godot": Engine.get_version_info(),
		"rendering_method": ProjectSettings.get_setting("rendering/renderer/rendering_method"),
		"rendering_driver": RenderingServer.get_current_rendering_driver_name(),
		"adapter_name": RenderingServer.get_video_adapter_name(),
		"adapter_vendor": RenderingServer.get_video_adapter_vendor(),
		"display_server": DisplayServer.get_name(),
		"viewport_size": [VIEWPORT_SIZE.x, VIEWPORT_SIZE.y],
		"visible_geometry_count": 2,
		"external_resources": []
	})
	_write_json(evidence_dir.path_join("camera-main.json"), _camera_manifest(main_camera, get_viewport()))
	_write_json(evidence_dir.path_join("camera-subviewport.json"), _camera_manifest(sub_camera, evidence_subviewport))
	print("CALIBRATION_STILLS=PASS")
	print("CALIBRATION_MAIN_STILL=%s" % main_path)
	print("CALIBRATION_SUBVIEWPORT_STILL=%s" % sub_path)

func _camera_manifest(camera: Camera3D, viewport: Viewport) -> Dictionary:
	return {
		"path": str(camera.get_path()),
		"current": camera.is_current(),
		"projection": camera.projection,
		"fov": camera.fov,
		"near": camera.near,
		"far": camera.far,
		"cull_mask": camera.cull_mask,
		"position": [camera.global_position.x, camera.global_position.y, camera.global_position.z],
		"basis": [
			[camera.global_transform.basis.x.x, camera.global_transform.basis.x.y, camera.global_transform.basis.x.z],
			[camera.global_transform.basis.y.x, camera.global_transform.basis.y.y, camera.global_transform.basis.y.z],
			[camera.global_transform.basis.z.x, camera.global_transform.basis.z.y, camera.global_transform.basis.z.z]
		],
		"viewport_size": [viewport.get_visible_rect().size.x, viewport.get_visible_rect().size.y],
		"update_mode": evidence_subviewport.render_target_update_mode if viewport == evidence_subviewport else "main_always"
	}

func _write_json(path: String, data: Variant) -> void:
	var file := FileAccess.open(path, FileAccess.WRITE)
	if file == null:
		push_error("Failed to open JSON output: %s" % path)
		return
	file.store_string(JSON.stringify(data, "\t") + "\n")
