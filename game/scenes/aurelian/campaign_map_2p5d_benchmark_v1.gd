extends "res://scenes/aurelian/world_scale_sector_generator_v4.gd"

const CONTRACT_PATH := "res://scenes/aurelian/campaign_map_2p5d_benchmark_v1_manifest.json"
const BENCHMARK_SIZE := Vector2i(1440, 900)
const TOP_CAMERA_SIZE := 27.0

var contract: Dictionary = {}

func _ready() -> void:
	sector_spec = _read_json(SPEC_PATH)
	contract = _read_json(CONTRACT_PATH)
	if sector_spec.is_empty() or contract.is_empty():
		push_error("CAMPAIGN_MAP_2P5D_BENCHMARK_V1_LOAD_FAILED")
		get_tree().quit(111)
		return
	if String(contract.get("contract", "")) != "CAMPAIGN_MAP_2P5D_BENCHMARK_V1":
		push_error("CAMPAIGN_MAP_2P5D_BENCHMARK_V1_CONTRACT_INVALID")
		get_tree().quit(112)
		return
	evidence_dir = OS.get_environment("AURELIAN_EVIDENCE_DIR")
	if OS.get_environment("AURELIAN_CAPTURE_CAMPAIGN_MAP_2P5D_BENCHMARK_V1") == "1":
		call_deferred("_capture_benchmark")
		return
	if not _populate_world(self):
		return
	var camera := _make_top_camera(self)
	camera.make_current()

func _make_top_camera(parent: Node) -> Camera3D:
	var plane: Array = sector_spec.get("sector_plane", [3600, 2700])
	var center := _sector_to_godot(Vector2(float(plane[0]) * 0.5, float(plane[1]) * 0.5), 0.0)
	var camera := Camera3D.new()
	camera.name = "Camera_CampaignMap2P5DBenchmarkV1"
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.size = TOP_CAMERA_SIZE
	camera.near = 0.1
	camera.far = 700.0
	camera.position = center + Vector3(0.0, 58.0, 0.0)
	camera.rotation_degrees = Vector3(-90.0, 0.0, 0.0)
	parent.add_child(camera)
	return camera

func _locus_by_id(locus_id: String) -> Dictionary:
	for locus_variant in sector_spec.get("macro_locus_slots", []):
		var locus: Dictionary = locus_variant
		if String(locus.get("id", "")) == locus_id:
			return locus
	return {}

func _screen_point(camera: Camera3D, value: Variant) -> Vector2:
	if not value is Array:
		return Vector2.ZERO
	var pair: Array = value as Array
	if pair.size() != 2:
		return Vector2.ZERO
	var sector_point := Vector2(float(pair[0]), float(pair[1]))
	return camera.unproject_position(_sector_to_godot(sector_point, 0.0))

func _screen_points(camera: Camera3D, values: Variant) -> PackedVector2Array:
	var result := PackedVector2Array()
	if not values is Array:
		return result
	for value in values as Array:
		result.append(_screen_point(camera, value))
	return result

func _status_color(status: String) -> Color:
	var palette: Dictionary = contract.get("palette", {})
	return Color(String(palette.get(status, "#a8ad9c")))

func _add_region(map_root: Node2D, camera: Camera3D, region: Dictionary) -> void:
	var points := _screen_points(camera, region.get("points", []))
	if points.size() < 3:
		return
	var polygon := Polygon2D.new()
	polygon.name = "Region_%s" % String(region.get("id", ""))
	polygon.polygon = points
	polygon.color = Color(String(region.get("fill", "#ffffff33")))
	map_root.add_child(polygon)

	var closed := PackedVector2Array(points)
	closed.append(points[0])
	var border := Line2D.new()
	border.name = "Border_%s" % String(region.get("id", ""))
	border.points = closed
	border.width = 4.0
	border.default_color = Color(String(region.get("border", "#ffffffff")))
	border.antialiased = true
	map_root.add_child(border)

func _add_corridor(map_root: Node2D, camera: Camera3D) -> void:
	var corridor: Dictionary = contract.get("primary_corridor", {})
	var points := _screen_points(camera, corridor.get("points", []))
	if points.size() < 2:
		return

	var shadow := Line2D.new()
	shadow.name = "PrimaryCorridorShadow"
	shadow.points = points
	shadow.width = float(corridor.get("shadow_width", 16.0))
	shadow.default_color = Color(String(corridor.get("shadow", "#202923a6")))
	shadow.antialiased = true
	map_root.add_child(shadow)

	var route := Line2D.new()
	route.name = "PrimaryCorridor"
	route.points = points
	route.width = float(corridor.get("width", 9.0))
	route.default_color = Color(String(corridor.get("color", "#e0bf66e8")))
	route.antialiased = true
	map_root.add_child(route)

func _hex_points(center: Vector2, radius: float) -> PackedVector2Array:
	var result := PackedVector2Array()
	for index in range(6):
		var angle := -PI * 0.5 + TAU * float(index) / 6.0
		result.append(center + Vector2(cos(angle), sin(angle)) * radius)
	return result

func _make_label(text_value: String, position_value: Vector2, font_size: int, color: Color) -> Label:
	var label := Label.new()
	label.text = text_value
	label.position = position_value
	label.size = Vector2(280.0, 42.0)
	var settings := LabelSettings.new()
	settings.font_size = font_size
	settings.font_color = color
	settings.outline_size = 7
	settings.outline_color = Color("#17201ed9")
	label.label_settings = settings
	return label

func _add_sigil(map_root: Node2D, camera: Camera3D, spec: Dictionary) -> void:
	var locus := _locus_by_id(String(spec.get("id", "")))
	if locus.is_empty():
		return
	var center_data: Array = locus.get("center", [])
	if center_data.size() != 2:
		return
	var center := _screen_point(camera, center_data)
	var radius := float(spec.get("size", 14.0))
	var color := _status_color(String(spec.get("status", "neutral")))

	var shadow := Polygon2D.new()
	shadow.name = "SigilShadow_%s" % String(spec.get("id", ""))
	shadow.polygon = _hex_points(center + Vector2(2.0, 3.0), radius + 3.0)
	shadow.color = Color("#101715b8")
	map_root.add_child(shadow)

	var sigil := Polygon2D.new()
	sigil.name = "Sigil_%s" % String(spec.get("id", ""))
	sigil.polygon = _hex_points(center, radius)
	sigil.color = color
	map_root.add_child(sigil)

	var inner := Polygon2D.new()
	inner.name = "SigilInner_%s" % String(spec.get("id", ""))
	inner.polygon = _hex_points(center, radius * 0.48)
	inner.color = color.darkened(0.34)
	map_root.add_child(inner)

	var font_size := int(spec.get("label_size", 18))
	var label_position := center + Vector2(radius + 11.0, -float(font_size) * 0.72)
	map_root.add_child(_make_label(String(spec.get("label", "")), label_position, font_size, color.lightened(0.20)))

func _render_topography() -> Dictionary:
	var viewport := SubViewport.new()
	viewport.name = "CampaignMap2P5DTopographyViewport"
	viewport.size = BENCHMARK_SIZE
	viewport.own_world_3d = true
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	viewport.render_target_clear_mode = SubViewport.CLEAR_MODE_ALWAYS
	viewport.transparent_bg = false
	add_child(viewport)

	var scene_root := Node3D.new()
	scene_root.name = "CampaignMap2P5DTopographyWorld"
	viewport.add_child(scene_root)
	if not _populate_world(scene_root):
		return {}
	var camera := _make_top_camera(scene_root)
	camera.make_current()

	for _frame in range(16):
		await get_tree().process_frame
	await RenderingServer.frame_post_draw
	var image := viewport.get_texture().get_image()
	if image == null or image.is_empty() or image.get_size() != BENCHMARK_SIZE:
		push_error("CAMPAIGN_MAP_2P5D_BENCHMARK_V1_TOPOGRAPHY_CAPTURE_FAILED")
		return {}
	return {"viewport": viewport, "camera": camera, "image": image}

func _compose_campaign_map(base_image: Image, camera: Camera3D) -> SubViewport:
	var viewport := SubViewport.new()
	viewport.name = "CampaignMap2P5DFinalViewport"
	viewport.size = BENCHMARK_SIZE
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	viewport.render_target_clear_mode = SubViewport.CLEAR_MODE_ALWAYS
	viewport.transparent_bg = false
	add_child(viewport)

	var map_root := Node2D.new()
	map_root.name = "CampaignMap2P5DCanvas"
	viewport.add_child(map_root)

	var base_texture := ImageTexture.create_from_image(base_image)
	var base_sprite := Sprite2D.new()
	base_sprite.name = "SectorTopographyBase"
	base_sprite.texture = base_texture
	base_sprite.centered = false
	base_sprite.position = Vector2.ZERO
	map_root.add_child(base_sprite)

	var quiet_wash := ColorRect.new()
	quiet_wash.name = "StrategicQuietWash"
	quiet_wash.position = Vector2.ZERO
	quiet_wash.size = Vector2(float(BENCHMARK_SIZE.x), float(BENCHMARK_SIZE.y))
	quiet_wash.color = Color("#13201a25")
	map_root.add_child(quiet_wash)

	for region_variant in contract.get("regions", []):
		_add_region(map_root, camera, region_variant as Dictionary)
	_add_corridor(map_root, camera)
	for sigil_variant in contract.get("sigils", []):
		_add_sigil(map_root, camera, sigil_variant as Dictionary)

	return viewport

func _capture_benchmark() -> void:
	if evidence_dir.is_empty():
		push_error("CAMPAIGN_MAP_2P5D_BENCHMARK_V1_MISSING_EVIDENCE_DIR")
		get_tree().quit(113)
		return
	DirAccess.make_dir_recursive_absolute(evidence_dir)

	var topography := await _render_topography()
	if topography.is_empty():
		get_tree().quit(114)
		return
	var camera := topography.get("camera") as Camera3D
	var base_image := topography.get("image") as Image
	if camera == null or base_image == null:
		push_error("CAMPAIGN_MAP_2P5D_BENCHMARK_V1_TOPOGRAPHY_RESULT_INVALID")
		get_tree().quit(115)
		return

	var final_viewport := _compose_campaign_map(base_image, camera)
	for _frame in range(10):
		await get_tree().process_frame
	await RenderingServer.frame_post_draw
	var final_image := final_viewport.get_texture().get_image()
	if final_image == null or final_image.is_empty() or final_image.get_size() != BENCHMARK_SIZE:
		push_error("CAMPAIGN_MAP_2P5D_BENCHMARK_V1_FINAL_CAPTURE_FAILED")
		get_tree().quit(116)
		return

	var output_path := evidence_dir.path_join("campaign-map-2p5d-benchmark-v1-1440x900.png")
	if final_image.save_png(output_path) != OK:
		push_error("CAMPAIGN_MAP_2P5D_BENCHMARK_V1_SAVE_FAILED")
		get_tree().quit(117)
		return
	print("CAMPAIGN_MAP_2P5D_BENCHMARK_V1_STILL=%s" % output_path)
	print("CAMPAIGN_MAP_2P5D_BENCHMARK_V1_REPRESENTATION=topography_plus_canvas")
	print("CAMPAIGN_MAP_2P5D_BENCHMARK_V1_REGIONS=%d" % (contract.get("regions", []) as Array).size())
	print("CAMPAIGN_MAP_2P5D_BENCHMARK_V1_SIGILS=%d" % (contract.get("sigils", []) as Array).size())
	get_tree().quit(0)
