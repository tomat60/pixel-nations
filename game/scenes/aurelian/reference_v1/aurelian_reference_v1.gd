class_name AurelianReferenceV1
extends Node3D

const TOPOLOGY_CENTER := Vector2(500.0, 450.0)
const TOPOLOGY_SCALE := 0.022
const GRID_MIN := Vector2(-100.0, -80.0)
const GRID_MAX := Vector2(1100.0, 1020.0)
const GRID_X := 60
const GRID_Y := 55

const RIVER_POINTS := [
	Vector2(505, 0), Vector2(500, 105), Vector2(520, 215), Vector2(505, 315),
	Vector2(525, 430), Vector2(505, 555), Vector2(535, 680), Vector2(580, 800), Vector2(610, 900),
]

const LANDMARKS := {
	"GreenvaleOrigin": Vector2(354, 285),
	"Bridge_GildedCrossing": Vector2(515, 340),
	"NorthRidge": Vector2(700, 205),
	"ForestWorkEdge": Vector2(245, 205),
	"FieldsPlains": Vector2(405, 505),
	"OldRoadJunction": Vector2(425, 405),
	"EastRoute": Vector2(760, 410),
	"SouthMarsh": Vector2(365, 690),
	"CoastOutflow": Vector2(610, 875),
	"Northgate": Vector2(445, 65),
}

const BRIDGE_ENDPOINTS := [Vector2(455, 340), Vector2(575, 340)]

const ROUTES := {
	"GreenvaleCrossing": [Vector2(354, 285), Vector2(395, 300), Vector2(425, 320), Vector2(455, 340)],
	"OldRoad": [Vector2(210, 520), Vector2(310, 470), Vector2(425, 405), Vector2(455, 340)],
	"EastTradeRoute": [Vector2(575, 340), Vector2(650, 375), Vector2(760, 410), Vector2(910, 455)],
	"NorthRidgeRoute": [Vector2(575, 340), Vector2(625, 300), Vector2(665, 250), Vector2(700, 205)],
	"NorthgateRoute": [Vector2(354, 285), Vector2(390, 210), Vector2(420, 130), Vector2(445, 65)],
}

const CAMERA_CONTRACT := {
	"village": {"center": Vector2(430, 325), "size": 9.6},
	"map": {"center": Vector2(500, 430), "size": 17.2},
	"world": {"center": Vector2(505, 475), "size": 23.2},
}

const COLOR_OLIVE := Color("#70815a")
const COLOR_MOSS := Color("#536a49")
const COLOR_FOREST := Color("#35533e")
const COLOR_FIELDS := Color("#aa8d50")
const COLOR_RIDGE := Color("#6e6d63")
const COLOR_MARSH := Color("#586c58")
const COLOR_WATER := Color("#3f7780")
const COLOR_ROAD := Color("#a47a4f")
const COLOR_WALL := Color("#b79a72")
const COLOR_ROOF := Color("#665241")
const COLOR_WOOD := Color("#76543a")

var cameras: Dictionary = {}
var evidence_dir := ""
var capture_suffix := ""
var settlement_stage := 2
var sequence_mode := false
var sequence_frame := 0

static func topology_to_world(point: Vector2, height: float = 0.0) -> Vector3:
	return Vector3(
		(point.x - TOPOLOGY_CENTER.x) * TOPOLOGY_SCALE,
		height,
		(point.y - TOPOLOGY_CENTER.y) * TOPOLOGY_SCALE
	)

static func topology_contract() -> Dictionary:
	return {
		"plane": [1000, 900],
		"river": RIVER_POINTS,
		"landmarks": LANDMARKS,
		"bridge_endpoints": BRIDGE_ENDPOINTS,
		"routes": ROUTES,
		"cameras": CAMERA_CONTRACT,
	}

static func terrain_height_at(point: Vector2) -> float:
	var height := 0.18
	height += 1.15 * _gaussian(point, LANDMARKS["NorthRidge"], 165.0)
	height += 0.40 * _gaussian(point, LANDMARKS["ForestWorkEdge"], 185.0)
	height += 0.10 * _gaussian(point, LANDMARKS["GreenvaleOrigin"], 210.0)
	height -= 0.18 * _gaussian(point, LANDMARKS["SouthMarsh"], 190.0)

	var river_distance := _distance_to_polyline(point, RIVER_POINTS)
	var river_width := lerpf(42.0, 78.0, clampf(point.y / 900.0, 0.0, 1.0))
	var valley_radius := river_width * 1.65
	if river_distance < valley_radius:
		var valley_factor := 1.0 - river_distance / valley_radius
		height -= 0.47 * valley_factor * valley_factor

	var coast_factor := clampf((point.y - 760.0) / 230.0, 0.0, 1.0)
	height -= coast_factor * coast_factor * 0.44
	return height

static func _gaussian(point: Vector2, center: Vector2, radius: float) -> float:
	var distance := point.distance_to(center)
	var scaled := distance / radius
	return exp(-scaled * scaled * 1.7)

static func _distance_to_polyline(point: Vector2, points: Array) -> float:
	var best := INF
	for index in range(points.size() - 1):
		best = minf(best, _distance_to_segment(point, points[index], points[index + 1]))
	return best

static func _distance_to_segment(point: Vector2, a: Vector2, b: Vector2) -> float:
	var ab := b - a
	var denominator := ab.length_squared()
	if denominator <= 0.00001:
		return point.distance_to(a)
	var t := clampf((point - a).dot(ab) / denominator, 0.0, 1.0)
	return point.distance_to(a + ab * t)

func _ready() -> void:
	settlement_stage = clampi(int(OS.get_environment("AURELIAN_SETTLEMENT_STAGE")), 0, 2) if not OS.get_environment("AURELIAN_SETTLEMENT_STAGE").is_empty() else 2
	evidence_dir = OS.get_environment("AURELIAN_EVIDENCE_DIR")
	capture_suffix = OS.get_environment("AURELIAN_CAPTURE_SUFFIX")
	sequence_mode = OS.get_environment("AURELIAN_CAPTURE_SEQUENCE") == "1"

	_build_environment()
	_build_terrain()
	_build_water()
	_build_roads()
	_build_bridge()
	_build_landmarks()
	_build_greenvale(settlement_stage)
	_build_cameras()

	if not evidence_dir.is_empty():
		DirAccess.make_dir_recursive_absolute(evidence_dir)
		_write_manifests()

	var preset := OS.get_environment("AURELIAN_CAPTURE_PRESET").to_lower()
	if sequence_mode:
		_activate_camera("village")
		set_process(true)
	elif not preset.is_empty():
		if not cameras.has(preset):
			push_error("AURELIAN_REFERENCE_UNKNOWN_CAMERA: %s" % preset)
			get_tree().quit(31)
			return
		_activate_camera(preset)
		call_deferred("_capture_still", preset)
	else:
		_activate_camera("village")

func _build_environment() -> void:
	var world_environment := WorldEnvironment.new()
	world_environment.name = "Environment"
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color("#78908a")
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("#d4d1bd")
	environment.ambient_light_energy = 0.74
	environment.fog_enabled = true
	environment.fog_light_color = Color("#aeb9ae")
	environment.fog_density = 0.0028
	environment.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	environment.tonemap_exposure = 1.0
	world_environment.environment = environment
	add_child(world_environment)

	var sun := DirectionalLight3D.new()
	sun.name = "Sun"
	sun.rotation_degrees = Vector3(-52.0, -32.0, 0.0)
	sun.light_color = Color("#ffe2b0")
	sun.light_energy = 1.05
	sun.shadow_enabled = true
	add_child(sun)

func _build_terrain() -> void:
	var terrain := MeshInstance3D.new()
	terrain.name = "TerrainHeightfield"
	terrain.mesh = _heightfield_mesh()
	terrain.material_override = _vertex_color_material(0.96)
	add_child(terrain)

func _heightfield_mesh() -> ArrayMesh:
	var surface := SurfaceTool.new()
	surface.begin(Mesh.PRIMITIVE_TRIANGLES)
	for z_index in range(GRID_Y):
		var y0 := lerpf(GRID_MIN.y, GRID_MAX.y, float(z_index) / float(GRID_Y))
		var y1 := lerpf(GRID_MIN.y, GRID_MAX.y, float(z_index + 1) / float(GRID_Y))
		for x_index in range(GRID_X):
			var x0 := lerpf(GRID_MIN.x, GRID_MAX.x, float(x_index) / float(GRID_X))
			var x1 := lerpf(GRID_MIN.x, GRID_MAX.x, float(x_index + 1) / float(GRID_X))
			var p00 := Vector2(x0, y0)
			var p10 := Vector2(x1, y0)
			var p01 := Vector2(x0, y1)
			var p11 := Vector2(x1, y1)
			_add_terrain_triangle(surface, p00, p01, p10)
			_add_terrain_triangle(surface, p10, p01, p11)
	surface.generate_normals()
	return surface.commit()

func _add_terrain_triangle(surface: SurfaceTool, a: Vector2, b: Vector2, c: Vector2) -> void:
	for point in [a, b, c]:
		surface.set_color(_terrain_color(point))
		surface.add_vertex(topology_to_world(point, terrain_height_at(point)))

func _terrain_color(point: Vector2) -> Color:
	var river_distance := _distance_to_polyline(point, RIVER_POINTS)
	if point.y > 650.0 and (point.distance_to(LANDMARKS["SouthMarsh"]) < 230.0 or river_distance < 115.0):
		return COLOR_MARSH
	if point.distance_to(LANDMARKS["NorthRidge"]) < 185.0:
		return COLOR_RIDGE
	if point.distance_to(LANDMARKS["ForestWorkEdge"]) < 195.0:
		return COLOR_FOREST
	if point.distance_to(LANDMARKS["FieldsPlains"]) < 190.0:
		return COLOR_FIELDS
	if river_distance < 95.0:
		return COLOR_MOSS
	return COLOR_OLIVE

func _build_water() -> void:
	var river := MeshInstance3D.new()
	river.name = "RiverWater"
	river.mesh = _ribbon_mesh(_resample_polyline(RIVER_POINTS, 7), 0.80, 1.35, -0.075)
	river.material_override = _material(COLOR_WATER, 0.28)
	add_child(river)

	var outer_water := MeshInstance3D.new()
	outer_water.name = "CoastWater"
	var plane := PlaneMesh.new()
	plane.size = Vector2(18.0, 10.0)
	outer_water.mesh = plane
	outer_water.position = topology_to_world(Vector2(610, 1060), -0.08)
	outer_water.material_override = _material(Color("#365f68"), 0.34)
	add_child(outer_water)

func _build_roads() -> void:
	var road_root := Node3D.new()
	road_root.name = "Roads"
	add_child(road_root)
	var road_material := _material(COLOR_ROAD, 0.98)
	for route_name in ROUTES.keys():
		var route_points := _resample_polyline(ROUTES[route_name], 5)
		var road := MeshInstance3D.new()
		road.name = String(route_name)
		road.mesh = _terrain_ribbon_mesh(route_points, 0.34)
		road.material_override = road_material
		road_root.add_child(road)

func _build_bridge() -> void:
	var root := Node3D.new()
	root.name = "Bridge_GildedCrossing"
	add_child(root)
	var center := topology_to_world(LANDMARKS["Bridge_GildedCrossing"], 0.32)
	var west_road_y := terrain_height_at(BRIDGE_ENDPOINTS[0]) + 0.08
	var east_road_y := terrain_height_at(BRIDGE_ENDPOINTS[1]) + 0.08
	var west_world := topology_to_world(BRIDGE_ENDPOINTS[0], west_road_y)
	var east_world := topology_to_world(BRIDGE_ENDPOINTS[1], east_road_y)

	_add_box(root, "Deck", center, Vector3(1.55, 0.18, 0.58), COLOR_WOOD)
	_add_box(root, "WestAbutment", Vector3(center.x - 0.93, 0.18, center.z), Vector3(0.34, 0.46, 0.78), Color("#746c5d"))
	_add_box(root, "EastAbutment", Vector3(center.x + 0.93, 0.18, center.z), Vector3(0.34, 0.46, 0.78), Color("#746c5d"))
	_add_ramp(root, "WestRamp", west_world, Vector3(center.x - 0.78, center.y, center.z), COLOR_ROAD)
	_add_ramp(root, "EastRamp", Vector3(center.x + 0.78, center.y, center.z), east_world, COLOR_ROAD)

	for x_offset in [-0.70, -0.24, 0.24, 0.70]:
		_add_box(root, "Post", center + Vector3(x_offset, 0.25, -0.26), Vector3(0.08, 0.48, 0.08), Color("#513c2c"))
		_add_box(root, "Post", center + Vector3(x_offset, 0.25, 0.26), Vector3(0.08, 0.48, 0.08), Color("#513c2c"))

func _add_ramp(parent: Node3D, node_name: String, start: Vector3, finish: Vector3, color: Color) -> void:
	var delta := finish - start
	var length := Vector2(delta.x, delta.z).length()
	var ramp := MeshInstance3D.new()
	ramp.name = node_name
	var mesh := BoxMesh.new()
	mesh.size = Vector3(maxf(length, 0.1), 0.13, 0.58)
	ramp.mesh = mesh
	ramp.position = (start + finish) * 0.5
	ramp.rotation.z = atan2(delta.y, maxf(absf(delta.x), 0.001)) * signf(delta.x if not is_zero_approx(delta.x) else 1.0)
	ramp.material_override = _material(color, 0.96)
	parent.add_child(ramp)

func _build_landmarks() -> void:
	var forest := Node3D.new()
	forest.name = "ForestWorkEdge"
	add_child(forest)
	var tree_points := [
		Vector2(190, 150), Vector2(225, 175), Vector2(260, 155), Vector2(290, 190),
		Vector2(205, 220), Vector2(250, 235), Vector2(300, 235), Vector2(170, 260),
		Vector2(230, 275), Vector2(285, 290), Vector2(330, 245), Vector2(315, 175),
	]
	for index in range(tree_points.size()):
		_add_tree(forest, tree_points[index], 0.72 + float(index % 4) * 0.08)

	var ridge := Node3D.new()
	ridge.name = "NorthRidge"
	add_child(ridge)
	for point in [Vector2(655, 185), Vector2(700, 160), Vector2(750, 205), Vector2(715, 235), Vector2(780, 250)]:
		_add_rock(ridge, point)

	var fields := Node3D.new()
	fields.name = "FieldsPlains"
	add_child(fields)
	_add_fields(fields, LANDMARKS["FieldsPlains"] + Vector2(45, 35), 5)

func _build_greenvale(stage: int) -> void:
	var settlement := Node3D.new()
	settlement.name = "GreenvaleSettlement"
	add_child(settlement)
	var origin := LANDMARKS["GreenvaleOrigin"]
	_add_claim_marker(settlement, origin)
	_add_building(settlement, origin + Vector2(-22, 18), Vector3(0.62, 0.42, 0.52), "Shelter")
	if stage >= 1:
		_add_building(settlement, origin + Vector2(24, 10), Vector3(0.76, 0.52, 0.62), "Workshop")
		_add_building(settlement, origin + Vector2(-4, -34), Vector3(0.70, 0.48, 0.58), "Storehouse")
	if stage >= 2:
		_add_building(settlement, origin + Vector2(42, -30), Vector3(0.82, 0.58, 0.68), "Hall")
		_add_building(settlement, origin + Vector2(-48, -26), Vector3(0.68, 0.46, 0.56), "Home")
		_add_fields(settlement, origin + Vector2(-65, 56), 4)

func _add_claim_marker(parent: Node3D, point: Vector2) -> void:
	var world := topology_to_world(point, terrain_height_at(point))
	_add_box(parent, "FlagPole", world + Vector3(0, 0.34, 0), Vector3(0.06, 0.68, 0.06), COLOR_WOOD)
	_add_box(parent, "Flag", world + Vector3(0.17, 0.54, 0), Vector3(0.32, 0.18, 0.04), Color("#d4ad4c"))

func _add_building(parent: Node3D, point: Vector2, size: Vector3, node_name: String) -> void:
	var ground := terrain_height_at(point)
	var root := Node3D.new()
	root.name = node_name
	root.position = topology_to_world(point, ground)
	parent.add_child(root)
	_add_box(root, "Walls", Vector3(0, size.y * 0.5, 0), size, COLOR_WALL)
	var roof := MeshInstance3D.new()
	roof.name = "Roof"
	roof.mesh = _gable_roof_mesh(size.x * 1.12, size.z * 1.12, 0.28)
	roof.position = Vector3(0, size.y + 0.01, 0)
	roof.material_override = _material(COLOR_ROOF, 0.98)
	root.add_child(roof)

func _gable_roof_mesh(width: float, depth: float, height: float) -> ArrayMesh:
	var left_front := Vector3(-width * 0.5, 0, -depth * 0.5)
	var right_front := Vector3(width * 0.5, 0, -depth * 0.5)
	var left_back := Vector3(-width * 0.5, 0, depth * 0.5)
	var right_back := Vector3(width * 0.5, 0, depth * 0.5)
	var ridge_front := Vector3(0, height, -depth * 0.5)
	var ridge_back := Vector3(0, height, depth * 0.5)
	var surface := SurfaceTool.new()
	surface.begin(Mesh.PRIMITIVE_TRIANGLES)
	for triangle in [
		[left_front, ridge_front, left_back], [left_back, ridge_front, ridge_back],
		[ridge_front, right_front, ridge_back], [ridge_back, right_front, right_back],
		[left_front, right_front, ridge_front], [left_back, ridge_back, right_back],
	]:
		for vertex in triangle:
			surface.add_vertex(vertex)
	surface.generate_normals()
	return surface.commit()

func _add_tree(parent: Node3D, point: Vector2, scale_factor: float) -> void:
	var ground := terrain_height_at(point)
	var world := topology_to_world(point, ground)
	var root := Node3D.new()
	root.position = world
	parent.add_child(root)
	var trunk := MeshInstance3D.new()
	var trunk_mesh := CylinderMesh.new()
	trunk_mesh.top_radius = 0.05 * scale_factor
	trunk_mesh.bottom_radius = 0.07 * scale_factor
	trunk_mesh.height = 0.34 * scale_factor
	trunk_mesh.radial_segments = 6
	trunk.mesh = trunk_mesh
	trunk.position.y = 0.17 * scale_factor
	trunk.material_override = _material(Color("#624a35"), 1.0)
	root.add_child(trunk)
	var crown := MeshInstance3D.new()
	var crown_mesh := CylinderMesh.new()
	crown_mesh.top_radius = 0.0
	crown_mesh.bottom_radius = 0.28 * scale_factor
	crown_mesh.height = 0.72 * scale_factor
	crown_mesh.radial_segments = 7
	crown.mesh = crown_mesh
	crown.position.y = 0.62 * scale_factor
	crown.material_override = _material(Color("#2f5039"), 0.98)
	root.add_child(crown)

func _add_rock(parent: Node3D, point: Vector2) -> void:
	var mesh_instance := MeshInstance3D.new()
	var mesh := SphereMesh.new()
	mesh.radius = 0.38
	mesh.height = 0.55
	mesh.radial_segments = 8
	mesh.rings = 4
	mesh_instance.mesh = mesh
	mesh_instance.position = topology_to_world(point, terrain_height_at(point) + 0.18)
	mesh_instance.scale = Vector3(1.4, 0.7, 1.0)
	mesh_instance.rotation.y = point.x * 0.01
	mesh_instance.material_override = _material(Color("#68685f"), 1.0)
	parent.add_child(mesh_instance)

func _add_fields(parent: Node3D, center: Vector2, count: int) -> void:
	for index in range(count):
		var point := center + Vector2(float(index) * 12.0, float(index % 2) * 10.0)
		var world := topology_to_world(point, terrain_height_at(point) + 0.035)
		_add_box(parent, "FieldStrip%02d" % index, world, Vector3(1.55, 0.045, 0.20), Color("#c0a457"))

func _build_cameras() -> void:
	for preset in CAMERA_CONTRACT.keys():
		var definition: Dictionary = CAMERA_CONTRACT[preset]
		var camera := Camera3D.new()
		camera.name = "Camera_%s" % String(preset).capitalize()
		camera.projection = Camera3D.PROJECTION_ORTHOGONAL
		camera.size = float(definition["size"])
		var focus_point: Vector2 = definition["center"]
		var focus := topology_to_world(focus_point, terrain_height_at(focus_point) * 0.35)
		camera.position = focus + Vector3(9.5, 11.5, 10.5)
		add_child(camera)
		camera.look_at(focus, Vector3.UP)
		cameras[preset] = camera

func _activate_camera(preset: String) -> void:
	for key in cameras.keys():
		(cameras[key] as Camera3D).current = key == preset
	print("AURELIAN_REFERENCE_CAMERA=%s" % preset)

func _process(_delta: float) -> void:
	if not sequence_mode:
		return
	sequence_frame += 1
	if sequence_frame == 180:
		_activate_camera("map")
	elif sequence_frame == 360:
		_activate_camera("world")
	elif sequence_frame >= 540:
		print("AURELIAN_REFERENCE_SEQUENCE_COMPLETE=540")
		get_tree().quit()

func _capture_still(preset: String) -> void:
	for _frame in range(6):
		await get_tree().process_frame
	await RenderingServer.frame_post_draw
	var image := get_viewport().get_texture().get_image()
	var suffix := "-%s" % capture_suffix if not capture_suffix.is_empty() else ""
	var output_path := evidence_dir.path_join("%s%s-1440x900.png" % [preset, suffix])
	var result := image.save_png(output_path)
	if result != OK:
		push_error("AURELIAN_REFERENCE_CAPTURE_FAILED: %s" % output_path)
		get_tree().quit(32)
		return
	print("AURELIAN_REFERENCE_STILL=%s:%s" % [preset, output_path])
	get_tree().quit()

func _write_manifests() -> void:
	var landmark_payload := {}
	for landmark_name in LANDMARKS.keys():
		var point: Vector2 = LANDMARKS[landmark_name]
		var world := topology_to_world(point, terrain_height_at(point))
		landmark_payload[landmark_name] = {
			"topology": [point.x, point.y],
			"world": [world.x, world.y, world.z],
			"terrain_height": world.y,
		}
	var route_payload := {}
	for route_name in ROUTES.keys():
		route_payload[route_name] = ROUTES[route_name].map(func(point): return [point.x, point.y])
	var manifest := {
		"contract": "AURELIAN_CAPABILITY_REFERENCE_V1",
		"topology_authority": "docs/AURELIAN_BASIN_TOPOLOGY_V1.md",
		"coordinate_plane": [1000, 900],
		"landmarks": landmark_payload,
		"river_centerline": RIVER_POINTS.map(func(point): return [point.x, point.y]),
		"bridge": {
			"center": [515, 340],
			"endpoints": [[455, 340], [575, 340]],
			"sequence": "road -> dry approach -> ramp/abutment -> deck -> ramp/abutment -> dry approach -> road",
		},
		"routes": route_payload,
		"cameras": CAMERA_CONTRACT,
		"settlement_stage": settlement_stage,
		"terrain_samples": {
			"GreenvaleOrigin": terrain_height_at(LANDMARKS["GreenvaleOrigin"]),
			"NorthRidge": terrain_height_at(LANDMARKS["NorthRidge"]),
			"FieldsPlains": terrain_height_at(LANDMARKS["FieldsPlains"]),
			"SouthMarsh": terrain_height_at(LANDMARKS["SouthMarsh"]),
		},
	}
	_write_json(evidence_dir.path_join("transform-manifest.json"), manifest)
	_write_json(evidence_dir.path_join("provenance-manifest.json"), {
		"contract": "AURELIAN_CAPABILITY_REFERENCE_V1",
		"engine": "Godot 4.7.1 Standard / GL Compatibility",
		"external_visual_assets": [],
		"asset_cost_usd": 0,
		"authoring": "procedural Godot geometry and runtime materials",
		"image_generation_used_as_runtime_or_implementation_authority": false,
	})

func _write_json(path: String, payload: Dictionary) -> void:
	var file := FileAccess.open(path, FileAccess.WRITE)
	if file == null:
		push_error("AURELIAN_REFERENCE_MANIFEST_OPEN_FAILED: %s" % path)
		return
	file.store_string(JSON.stringify(payload, "  ") + "\n")

func _resample_polyline(points: Array, subdivisions: int) -> Array:
	var result: Array = []
	for index in range(points.size() - 1):
		var a: Vector2 = points[index]
		var b: Vector2 = points[index + 1]
		for step in range(subdivisions):
			var t := float(step) / float(subdivisions)
			result.append(a.lerp(b, t))
	result.append(points[points.size() - 1])
	return result

func _ribbon_mesh(points: Array, width_north: float, width_south: float, height: float) -> ArrayMesh:
	var surface := SurfaceTool.new()
	surface.begin(Mesh.PRIMITIVE_TRIANGLES)
	for index in range(points.size() - 1):
		var a: Vector2 = points[index]
		var b: Vector2 = points[index + 1]
		var tangent := (b - a).normalized()
		var normal := Vector2(-tangent.y, tangent.x)
		var wa := lerpf(width_north, width_south, clampf(a.y / 900.0, 0.0, 1.0)) * 0.5
		var wb := lerpf(width_north, width_south, clampf(b.y / 900.0, 0.0, 1.0)) * 0.5
		var a_left := topology_to_world(a, height) + Vector3(normal.x * wa, 0, normal.y * wa)
		var a_right := topology_to_world(a, height) - Vector3(normal.x * wa, 0, normal.y * wa)
		var b_left := topology_to_world(b, height) + Vector3(normal.x * wb, 0, normal.y * wb)
		var b_right := topology_to_world(b, height) - Vector3(normal.x * wb, 0, normal.y * wb)
		for vertex in [a_left, b_left, a_right, a_right, b_left, b_right]:
			surface.add_vertex(vertex)
	surface.generate_normals()
	return surface.commit()

func _terrain_ribbon_mesh(points: Array, width: float) -> ArrayMesh:
	var surface := SurfaceTool.new()
	surface.begin(Mesh.PRIMITIVE_TRIANGLES)
	for index in range(points.size() - 1):
		var a: Vector2 = points[index]
		var b: Vector2 = points[index + 1]
		var tangent := (b - a).normalized()
		var normal := Vector2(-tangent.y, tangent.x)
		var offset_topology := normal * (width / TOPOLOGY_SCALE * 0.5)
		var a_left_t := a + offset_topology
		var a_right_t := a - offset_topology
		var b_left_t := b + offset_topology
		var b_right_t := b - offset_topology
		var a_left := topology_to_world(a_left_t, terrain_height_at(a_left_t) + 0.055)
		var a_right := topology_to_world(a_right_t, terrain_height_at(a_right_t) + 0.055)
		var b_left := topology_to_world(b_left_t, terrain_height_at(b_left_t) + 0.055)
		var b_right := topology_to_world(b_right_t, terrain_height_at(b_right_t) + 0.055)
		for vertex in [a_left, b_left, a_right, a_right, b_left, b_right]:
			surface.add_vertex(vertex)
	surface.generate_normals()
	return surface.commit()

func _add_box(parent: Node3D, node_name: String, position: Vector3, size: Vector3, color: Color) -> MeshInstance3D:
	var instance := MeshInstance3D.new()
	instance.name = node_name
	var mesh := BoxMesh.new()
	mesh.size = size
	instance.mesh = mesh
	instance.position = position
	instance.material_override = _material(color, 0.98)
	parent.add_child(instance)
	return instance

func _material(color: Color, roughness: float) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.roughness = roughness
	return material

func _vertex_color_material(roughness: float) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.vertex_color_use_as_albedo = true
	material.roughness = roughness
	return material
