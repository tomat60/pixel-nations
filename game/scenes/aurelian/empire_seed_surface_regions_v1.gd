extends "res://scenes/aurelian/world_scale_sector_generator_v4.gd"

const CONTRACT_PATH := "res://scenes/aurelian/empire_seed_surface_regions_v1_manifest.json"
const SECTOR_SPEC_PATH := "res://assets/aurelian-basin/source/sector_a01_generator_v4_spec.json"
const SURFACE_Y := 5.04
const BORDER_Y := 5.09
const SIGIL_Y := 5.18

var contract: Dictionary = {}

func _ready() -> void:
	sector_spec = _read_json(SECTOR_SPEC_PATH)
	contract = _read_json(CONTRACT_PATH)
	if sector_spec.is_empty() or contract.is_empty():
		push_error("EMPIRE_SEED_SURFACE_REGIONS_V1_LOAD_FAILED")
		get_tree().quit(91)
		return
	if String(contract.get("contract", "")) != "EMPIRE_SEED_SURFACE_REGIONS_V1":
		push_error("EMPIRE_SEED_SURFACE_REGIONS_V1_CONTRACT_INVALID")
		get_tree().quit(92)
		return
	evidence_dir = OS.get_environment("AURELIAN_EVIDENCE_DIR")
	if OS.get_environment("AURELIAN_CAPTURE_EMPIRE_SEED_SURFACE_REGIONS_V1") == "1":
		call_deferred("_capture_proof")
		return
	if not _populate_campaign_map(self):
		return
	var camera := _make_campaign_camera(self)
	camera.make_current()

func _make_material(color: Color, emission := 0.0) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	if color.a < 0.999:
		material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	if emission > 0.0:
		material.emission_enabled = true
		material.emission = Color(color.r, color.g, color.b, 1.0)
		material.emission_energy_multiplier = emission
	return material

func _points(value: Variant) -> PackedVector2Array:
	var result := PackedVector2Array()
	if not value is Array:
		return result
	for item_variant in value:
		if item_variant is Array and item_variant.size() == 2:
			result.append(Vector2(float(item_variant[0]), float(item_variant[1])))
	return result

func _mesh_from_triangles(vertices: PackedVector3Array, material: Material, name: String) -> MeshInstance3D:
	var arrays := []
	arrays.resize(Mesh.ARRAY_MAX)
	arrays[Mesh.ARRAY_VERTEX] = vertices
	var mesh := ArrayMesh.new()
	mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays)
	var instance := MeshInstance3D.new()
	instance.name = name
	instance.mesh = mesh
	instance.material_override = material
	return instance

func _add_region_fill(parent: Node3D, region: Dictionary) -> void:
	var polygon := _points(region.get("points", []))
	if polygon.size() < 3:
		return
	var indices := Geometry2D.triangulate_polygon(polygon)
	if indices.is_empty():
		push_warning("EMPIRE_SEED_SURFACE_REGION_TRIANGULATION_FAILED: %s" % String(region.get("id", "")))
		return
	var vertices := PackedVector3Array()
	for index in indices:
		vertices.append(_sector_to_godot(polygon[index], SURFACE_Y))
	var fill_color := Color(String(region.get("fill", "#ffffff22")))
	parent.add_child(_mesh_from_triangles(vertices, _make_material(fill_color), "RegionFill_%s" % String(region.get("id", ""))))
	_add_polygon_border(parent, polygon, Color(String(region.get("border", "#ffffffff"))), String(region.get("id", "")))

func _add_polygon_border(parent: Node3D, polygon: PackedVector2Array, color: Color, region_id: String) -> void:
	var width_sector := 28.0
	var vertices := PackedVector3Array()
	for i in range(polygon.size()):
		var p0 := polygon[i]
		var p1 := polygon[(i + 1) % polygon.size()]
		var delta := p1 - p0
		if delta.length() < 0.001:
			continue
		var normal := Vector2(-delta.y, delta.x).normalized() * width_sector * 0.5
		var a := _sector_to_godot(p0 + normal, BORDER_Y)
		var b := _sector_to_godot(p1 + normal, BORDER_Y)
		var c := _sector_to_godot(p1 - normal, BORDER_Y)
		var d := _sector_to_godot(p0 - normal, BORDER_Y)
		vertices.append_array(PackedVector3Array([a,b,c,a,c,d]))
	parent.add_child(_mesh_from_triangles(vertices, _make_material(color, 0.05), "RegionBorder_%s" % region_id))

func _add_corridor(parent: Node3D) -> void:
	var corridor: Dictionary = contract.get("primary_corridor", {})
	var points := _points(corridor.get("points", []))
	if points.size() < 2:
		return
	var width_sector := float(corridor.get("width", 48.0))
	var vertices := PackedVector3Array()
	for i in range(points.size() - 1):
		var p0 := points[i]
		var p1 := points[i + 1]
		var delta := p1 - p0
		if delta.length() < 0.001:
			continue
		var normal := Vector2(-delta.y, delta.x).normalized() * width_sector * 0.5
		var a := _sector_to_godot(p0 + normal, BORDER_Y + 0.02)
		var b := _sector_to_godot(p1 + normal, BORDER_Y + 0.02)
		var c := _sector_to_godot(p1 - normal, BORDER_Y + 0.02)
		var d := _sector_to_godot(p0 - normal, BORDER_Y + 0.02)
		vertices.append_array(PackedVector3Array([a,b,c,a,c,d]))
	var palette: Dictionary = contract.get("visual_contract", {}).get("ownership_palette", {})
	var color := Color(String(palette.get(String(corridor.get("status", "frontier")), "#d2b878")))
	color.a = 0.88
	parent.add_child(_mesh_from_triangles(vertices, _make_material(color, 0.08), "PrimaryExpansionCorridor"))

func _locus_by_id(locus_id: String) -> Dictionary:
	for locus_variant in sector_spec.get("macro_locus_slots", []):
		var locus: Dictionary = locus_variant
		if String(locus.get("id", "")) == locus_id:
			return locus
	return {}

func _add_sigil(parent: Node3D, spec: Dictionary) -> void:
	var locus := _locus_by_id(String(spec.get("id", "")))
	if locus.is_empty():
		return
	var center: Array = locus.get("center", [])
	if center.size() != 2:
		return
	var palette: Dictionary = contract.get("visual_contract", {}).get("ownership_palette", {})
	var status := String(spec.get("status", "ours"))
	var color := Color(String(palette.get(status, "#9b9b86")))
	var primary := String(spec.get("importance", "secondary")) == "primary"
	var root := Node3D.new()
	root.name = "Sigil_%s" % String(spec.get("id", ""))
	root.position = _sector_to_godot(Vector2(float(center[0]), float(center[1])), SIGIL_Y)
	parent.add_child(root)
	var sigil := MeshInstance3D.new()
	var mesh := CylinderMesh.new()
	mesh.top_radius = 0.34 if primary else 0.23
	mesh.bottom_radius = mesh.top_radius
	mesh.height = 0.12 if primary else 0.09
	mesh.radial_segments = 6
	sigil.mesh = mesh
	sigil.material_override = _make_material(color.lightened(0.08), 0.16 if primary else 0.05)
	root.add_child(sigil)
	var label := Label3D.new()
	label.text = String(spec.get("label", ""))
	label.font_size = 62 if primary else 48
	label.pixel_size = 0.0052
	label.modulate = color.lightened(0.30)
	label.outline_modulate = Color("#18201deb")
	label.outline_size = 9
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	label.no_depth_test = true
	label.position = Vector3(0.0, 0.42 if primary else 0.32, 0.0)
	root.add_child(label)

func _build_campaign_layer(parent: Node3D) -> void:
	var layer := Node3D.new()
	layer.name = "EmpireSeedSurfaceRegionsLayer"
	parent.add_child(layer)
	for region_variant in contract.get("regions", []):
		_add_region_fill(layer, region_variant as Dictionary)
	_add_corridor(layer)
	for sigil_variant in contract.get("sigils", []):
		_add_sigil(layer, sigil_variant as Dictionary)

func _populate_campaign_map(parent: Node3D) -> bool:
	if not _populate_world(parent):
		return false
	_build_campaign_layer(parent)
	return true

func _make_campaign_camera(parent: Node3D) -> Camera3D:
	var focus := _sector_to_godot(Vector2(1650.0, 1070.0), 0.35)
	var camera := Camera3D.new()
	camera.name = "Camera_EmpireSeedSurfaceRegionsV1"
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.size = 34.0
	camera.near = 0.1
	camera.far = 700.0
	camera.position = focus + Vector3(18.0, 28.0, 18.0)
	parent.add_child(camera)
	camera.look_at(focus, Vector3.UP)
	return camera

func _capture_proof() -> void:
	if evidence_dir.is_empty():
		push_error("EMPIRE_SEED_SURFACE_REGIONS_V1_MISSING_EVIDENCE_DIR")
		get_tree().quit(93)
		return
	DirAccess.make_dir_recursive_absolute(evidence_dir)
	var viewport := SubViewport.new()
	viewport.size = STILL_SIZE
	viewport.own_world_3d = true
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	viewport.render_target_clear_mode = SubViewport.CLEAR_MODE_ALWAYS
	viewport.transparent_bg = false
	add_child(viewport)
	var scene_root := Node3D.new()
	viewport.add_child(scene_root)
	if not _populate_campaign_map(scene_root):
		get_tree().quit(94)
		return
	var camera := _make_campaign_camera(scene_root)
	camera.make_current()
	for _frame in range(16):
		await get_tree().process_frame
	await RenderingServer.frame_post_draw
	var image := viewport.get_texture().get_image()
	if image == null or image.is_empty() or image.get_size() != STILL_SIZE:
		push_error("EMPIRE_SEED_SURFACE_REGIONS_V1_CAPTURE_FAILED")
		get_tree().quit(95)
		return
	var output_path := evidence_dir.path_join("empire-seed-surface-regions-v1-1440x900.png")
	if image.save_png(output_path) != OK:
		push_error("EMPIRE_SEED_SURFACE_REGIONS_V1_SAVE_FAILED")
		get_tree().quit(96)
		return
	print("EMPIRE_SEED_SURFACE_REGIONS_V1_STILL=%s" % output_path)
	print("EMPIRE_SEED_SURFACE_REGIONS_V1_REGIONS=%d" % contract.get("regions", []).size())
	print("EMPIRE_SEED_SURFACE_REGIONS_V1_SIGILS=%d" % contract.get("sigils", []).size())
	get_tree().quit(0)
