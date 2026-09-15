extends "res://scenes/aurelian/world_scale_sector_generator_v4.gd"

const BREADTH_MANIFEST_PATH := "res://scenes/aurelian/empire_seed_breadth_v1_manifest.json"
const SECTOR_SPEC_PATH := "res://assets/aurelian-basin/source/sector_a01_generator_v4_spec.json"
const BREADTH_STILL_SIZE := Vector2i(1440, 900)
const MARKER_Y := 5.2

var breadth_manifest: Dictionary = {}
var territory_specs: Dictionary = {}

func _ready() -> void:
	sector_spec = _read_json(SECTOR_SPEC_PATH)
	breadth_manifest = _read_json(BREADTH_MANIFEST_PATH)
	if sector_spec.is_empty() or breadth_manifest.is_empty():
		push_error("EMPIRE_SEED_BREADTH_V1_MANIFEST_LOAD_FAILED")
		get_tree().quit(81)
		return
	if String(breadth_manifest.get("contract", "")) != "EMPIRE_SEED_BREADTH_V1":
		push_error("EMPIRE_SEED_BREADTH_V1_CONTRACT_INVALID")
		get_tree().quit(82)
		return
	_index_territories()
	evidence_dir = OS.get_environment("AURELIAN_EVIDENCE_DIR")
	if OS.get_environment("AURELIAN_CAPTURE_EMPIRE_SEED_BREADTH_V1") == "1":
		call_deferred("_capture_breadth")
		return
	if not _populate_breadth_world(self):
		return
	var camera := _make_breadth_camera(self)
	camera.make_current()

func _index_territories() -> void:
	territory_specs.clear()
	for item_variant in breadth_manifest.get("territories", []):
		var item: Dictionary = item_variant
		territory_specs[String(item.get("id", ""))] = item

func _palette_color(status: String) -> Color:
	var visual: Dictionary = breadth_manifest.get("visual_contract", {})
	var palette: Dictionary = visual.get("ownership_palette", {})
	return Color(String(palette.get(status, "#9b9b86")))

func _locus_by_id(locus_id: String) -> Dictionary:
	for locus_variant in sector_spec.get("macro_locus_slots", []):
		var locus: Dictionary = locus_variant
		if String(locus.get("id", "")) == locus_id:
			return locus
	return {}

func _importance_radius(importance: String) -> float:
	match importance:
		"primary":
			return 0.62
		"secondary":
			return 0.43
		_:
			return 0.30

func _make_unshaded_material(color: Color, emission := 0.0) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	if emission > 0.0:
		material.emission_enabled = true
		material.emission = color
		material.emission_energy_multiplier = emission
	return material

func _add_marker(parent: Node3D, territory: Dictionary) -> void:
	var locus_id := String(territory.get("id", ""))
	var locus := _locus_by_id(locus_id)
	if locus.is_empty():
		push_warning("EMPIRE_SEED_BREADTH_MISSING_LOCUS: %s" % locus_id)
		return
	var center: Array = locus.get("center", [])
	if center.size() != 2:
		return
	var status := String(territory.get("status", "neutral"))
	var importance := String(territory.get("importance", "minor"))
	var radius := _importance_radius(importance)
	var color := _palette_color(status)

	var marker := Node3D.new()
	marker.name = "Territory_%s" % locus_id
	marker.position = _sector_to_godot(Vector2(float(center[0]), float(center[1])), MARKER_Y)
	parent.add_child(marker)

	var ring := MeshInstance3D.new()
	ring.name = "OwnershipRing"
	var torus := TorusMesh.new()
	torus.inner_radius = radius * 0.72
	torus.outer_radius = radius
	torus.rings = 28
	torus.ring_segments = 10
	ring.mesh = torus
	ring.material_override = _make_unshaded_material(color, 0.18 if status == "ours" else 0.04)
	marker.add_child(ring)

	var core := MeshInstance3D.new()
	core.name = "TerritoryCore"
	var core_mesh := CylinderMesh.new()
	core_mesh.top_radius = radius * 0.24
	core_mesh.bottom_radius = radius * 0.24
	core_mesh.height = 0.16 if importance != "primary" else 0.24
	core_mesh.radial_segments = 10
	core.mesh = core_mesh
	core.position.y = 0.10
	core.material_override = _make_unshaded_material(color.lightened(0.10), 0.28 if status == "ours" else 0.08)
	marker.add_child(core)

	if status == "rival":
		var spike := MeshInstance3D.new()
		spike.name = "RivalBeacon"
		var spike_mesh := CylinderMesh.new()
		spike_mesh.top_radius = 0.0
		spike_mesh.bottom_radius = radius * 0.18
		spike_mesh.height = 0.62
		spike_mesh.radial_segments = 8
		spike.mesh = spike_mesh
		spike.position.y = 0.38
		spike.material_override = _make_unshaded_material(color, 0.16)
		marker.add_child(spike)

	if bool(territory.get("show_label", false)):
		var label := Label3D.new()
		label.name = "TerritoryLabel"
		label.text = String(territory.get("label", locus_id)).to_upper()
		label.font_size = 54
		label.pixel_size = 0.0055
		label.modulate = color.lightened(0.22)
		label.outline_modulate = Color("#1d2522e8")
		label.outline_size = 9
		label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
		label.no_depth_test = true
		label.position = Vector3(0.0, 0.72, 0.0)
		marker.add_child(label)

func _add_route(parent: Node3D, route: Dictionary) -> void:
	var from_id := String(route.get("from", ""))
	var to_id := String(route.get("to", ""))
	var from_locus := _locus_by_id(from_id)
	var to_locus := _locus_by_id(to_id)
	if from_locus.is_empty() or to_locus.is_empty():
		return
	var from_center: Array = from_locus.get("center", [])
	var to_center: Array = to_locus.get("center", [])
	if from_center.size() != 2 or to_center.size() != 2:
		return
	var from_pos := _sector_to_godot(Vector2(float(from_center[0]), float(from_center[1])), MARKER_Y - 0.08)
	var to_pos := _sector_to_godot(Vector2(float(to_center[0]), float(to_center[1])), MARKER_Y - 0.08)
	var delta := to_pos - from_pos
	var midpoint := (from_pos + to_pos) * 0.5
	var route_mesh := MeshInstance3D.new()
	route_mesh.name = "Route_%s_%s" % [from_id, to_id]
	var beam := BoxMesh.new()
	beam.size = Vector3(0.075, 0.035, delta.length())
	route_mesh.mesh = beam
	route_mesh.position = midpoint
	route_mesh.rotation.y = atan2(delta.x, delta.z)
	var status := String(route.get("status", "neutral"))
	var route_color := _palette_color(status)
	route_color.a = 0.78
	route_mesh.material_override = _make_unshaded_material(route_color, 0.04)
	parent.add_child(route_mesh)

func _build_strategic_layer(parent: Node3D) -> Node3D:
	var layer := Node3D.new()
	layer.name = "EmpireSeedStrategicLayer"
	parent.add_child(layer)
	for route_variant in breadth_manifest.get("routes", []):
		_add_route(layer, route_variant as Dictionary)
	for territory_variant in breadth_manifest.get("territories", []):
		_add_marker(layer, territory_variant as Dictionary)
	return layer

func _populate_breadth_world(parent: Node3D) -> bool:
	if not _populate_world(parent):
		return false
	_build_strategic_layer(parent)
	return true

func _make_breadth_camera(parent: Node3D) -> Camera3D:
	var camera_spec: Dictionary = sector_spec.get("camera", {})
	var focus_data: Array = camera_spec.get("focus", [1775, 1325])
	var offset_data: Array = camera_spec.get("position_offset", [18.0, 28.0, 18.0])
	var focus := _sector_to_godot(Vector2(float(focus_data[0]), float(focus_data[1])), 0.35)
	var camera := Camera3D.new()
	camera.name = "Camera_EmpireSeedBreadthV1"
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.size = 36.0
	camera.near = 0.1
	camera.far = 700.0
	camera.position = focus + Vector3(float(offset_data[0]), float(offset_data[1]), float(offset_data[2]))
	parent.add_child(camera)
	camera.look_at(focus, Vector3.UP)
	return camera

func _capture_breadth() -> void:
	if evidence_dir.is_empty():
		push_error("EMPIRE_SEED_BREADTH_V1_MISSING_EVIDENCE_DIR")
		get_tree().quit(83)
		return
	DirAccess.make_dir_recursive_absolute(evidence_dir)
	var viewport := SubViewport.new()
	viewport.name = "EmpireSeedBreadthEvidenceViewport"
	viewport.size = BREADTH_STILL_SIZE
	viewport.own_world_3d = true
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	viewport.render_target_clear_mode = SubViewport.CLEAR_MODE_ALWAYS
	viewport.transparent_bg = false
	add_child(viewport)
	var scene_root := Node3D.new()
	scene_root.name = "EmpireSeedBreadthEvidenceWorld"
	viewport.add_child(scene_root)
	if not _populate_breadth_world(scene_root):
		get_tree().quit(84)
		return
	var camera := _make_breadth_camera(scene_root)
	camera.make_current()
	for _frame in range(16):
		await get_tree().process_frame
	await RenderingServer.frame_post_draw
	var image := viewport.get_texture().get_image()
	if image == null or image.is_empty() or image.get_size() != BREADTH_STILL_SIZE:
		push_error("EMPIRE_SEED_BREADTH_V1_CAPTURE_FAILED")
		get_tree().quit(85)
		return
	var output_path := evidence_dir.path_join("empire-seed-breadth-v1-1440x900.png")
	if image.save_png(output_path) != OK:
		push_error("EMPIRE_SEED_BREADTH_V1_SAVE_FAILED")
		get_tree().quit(86)
		return
	print("EMPIRE_SEED_BREADTH_V1_STILL=%s" % output_path)
	print("EMPIRE_SEED_BREADTH_V1_TERRITORIES=%d" % territory_specs.size())
	get_tree().quit(0)
