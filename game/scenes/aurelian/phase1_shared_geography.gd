extends Node3D

const ASSET_ROOT := "res://assets/aurelian-basin/kaykit/"
const TOPOLOGY_SCALE := 0.02
const TOPOLOGY_CENTER := Vector2(500.0, 450.0)

const BASIN_OUTLINE := [
	Vector2(80, 120), Vector2(200, 45), Vector2(460, 20), Vector2(720, 65),
	Vector2(920, 210), Vector2(970, 470), Vector2(900, 720), Vector2(760, 860),
	Vector2(520, 900), Vector2(280, 850), Vector2(110, 700), Vector2(45, 420),
]

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
	"OldRoad": [Vector2(210, 520), Vector2(310, 470), Vector2(425, 405), Vector2(455, 340)],
	"EastTradeRoute": [Vector2(575, 340), Vector2(650, 375), Vector2(760, 410), Vector2(910, 455)],
	"NorthRidgeRoute": [Vector2(575, 340), Vector2(625, 300), Vector2(665, 250), Vector2(700, 205)],
	"NorthgateRoute": [Vector2(354, 285), Vector2(390, 210), Vector2(420, 130), Vector2(445, 65)],
}

const CAMERA_CONTRACT := {
	"village": {"node": "Camera_Village", "center": Vector2(390, 320), "size": 8.8},
	"map": {"node": "Camera_Map", "center": Vector2(485, 422), "size": 15.8},
	"world": {"node": "Camera_World", "center": Vector2(500, 450), "size": 19.2},
}

var cameras: Dictionary = {}
var evidence_dir := ""
var sequence_mode := false
var sequence_frame := 0

static func topology_to_world_point(point: Vector2, height: float = 0.0) -> Vector3:
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

func _ready() -> void:
	_build_environment()
	_build_terrain()
	_build_river()
	_build_roads()
	_build_landmarks()
	_build_cameras()

	evidence_dir = OS.get_environment("AURELIAN_EVIDENCE_DIR")
	if not evidence_dir.is_empty():
		DirAccess.make_dir_recursive_absolute(evidence_dir)
		_write_transform_manifest()

	var preset := OS.get_environment("AURELIAN_CAPTURE_PRESET").to_lower()
	sequence_mode = OS.get_environment("AURELIAN_CAPTURE_SEQUENCE") == "1"
	if sequence_mode:
		_activate_camera("village")
		set_process(true)
	elif not preset.is_empty():
		if not cameras.has(preset):
			push_error("AURELIAN_PHASE1_UNKNOWN_CAMERA: %s" % preset)
			get_tree().quit(31)
			return
		_activate_camera(preset)
		call_deferred("_capture_still", preset)
	else:
		_activate_camera("world")

func _build_environment() -> void:
	var environment_node := WorldEnvironment.new()
	environment_node.name = "Environment"
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color("#33494b")
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("#d6c8aa")
	environment.ambient_light_energy = 0.72
	environment.fog_enabled = true
	environment.fog_light_color = Color("#aeb7aa")
	environment.fog_density = 0.0045
	environment_node.environment = environment
	add_child(environment_node)

	var sun := DirectionalLight3D.new()
	sun.name = "LateMorningSun"
	sun.rotation_degrees = Vector3(-50.0, -35.0, 0.0)
	sun.light_color = Color("#ffe1ad")
	sun.light_energy = 1.15
	sun.shadow_enabled = true
	add_child(sun)

	var fill := DirectionalLight3D.new()
	fill.name = "CoolFill"
	fill.rotation_degrees = Vector3(-60.0, 140.0, 0.0)
	fill.light_color = Color("#8ca8ad")
	fill.light_energy = 0.24
	add_child(fill)

func _build_terrain() -> void:
	var terrain := Node3D.new()
	terrain.name = "Terrain"
	add_child(terrain)

	terrain.add_child(_polygon_surface(BASIN_OUTLINE, -0.18, _material(Color("#283428"), 1.0), "BasinEdge"))
	terrain.add_child(_polygon_surface(BASIN_OUTLINE, 0.0, _material(Color("#6f8050"), 0.98), "ContinuousBasin"))

	_add_field_strips(terrain)
	_add_outer_water(terrain)

func _build_river() -> void:
	var river := Node3D.new()
	river.name = "River"
	add_child(river)

	river.add_child(_ribbon_mesh(RIVER_POINTS, 1.45, 0.035, _material(Color("#7a674a"), 0.93), "RiverBanks"))
	river.add_child(_ribbon_mesh(RIVER_POINTS, 0.94, 0.075, _material(Color("#3f7f89"), 0.36), "RiverWater"))

func _build_roads() -> void:
	var roads := Node3D.new()
	roads.name = "Roads"
	add_child(roads)
	var road_material := _material(Color("#9b784d"), 0.9)
	for route_name in ROUTES.keys():
		var route := _ribbon_mesh(ROUTES[route_name], 0.20, 0.095, road_material, String(route_name))
		roads.add_child(route)

func _build_landmarks() -> void:
	var bridge_root := Node3D.new()
	bridge_root.name = "Bridge_GildedCrossing"
	bridge_root.position = topology_to_world_point(LANDMARKS["Bridge_GildedCrossing"], 0.10)
	add_child(bridge_root)
	_spawn_asset(bridge_root, "buildings/neutral/building_bridge_A.gltf", Vector3.ZERO, 0.0, Vector3.ONE * 0.78)

	var greenvale := Node3D.new()
	greenvale.name = "GreenvaleOrigin"
	greenvale.position = topology_to_world_point(LANDMARKS["GreenvaleOrigin"], 0.08)
	add_child(greenvale)
	_spawn_asset(greenvale, "decoration/props/flag_blue.gltf", Vector3(-0.15, 0.0, 0.05), 0.0, Vector3.ONE * 0.72)
	_spawn_asset(greenvale, "buildings/blue/building_blacksmith_blue.gltf", Vector3(-0.75, 0.0, 0.55), -0.25, Vector3.ONE * 0.30)
	_spawn_asset(greenvale, "buildings/blue/building_barracks_blue.gltf", Vector3(0.45, 0.0, 0.62), 0.25, Vector3.ONE * 0.27)
	_spawn_asset(greenvale, "buildings/blue/building_church_blue.gltf", Vector3(-0.05, 0.0, -0.66), 0.0, Vector3.ONE * 0.26)

	var forest := Node3D.new()
	forest.name = "ForestWorkEdge"
	forest.position = topology_to_world_point(LANDMARKS["ForestWorkEdge"], 0.06)
	add_child(forest)
	var tree_offsets := [
		Vector3(-1.2, 0, -0.6), Vector3(-0.65, 0, 0.25), Vector3(0.0, 0, -0.75),
		Vector3(0.55, 0, 0.12), Vector3(1.05, 0, -0.35), Vector3(-0.2, 0, 0.75),
	]
	for index in tree_offsets.size():
		var tree_asset := "decoration/nature/tree_single_A.gltf" if index % 2 == 0 else "decoration/nature/tree_single_B.gltf"
		_spawn_asset(forest, tree_asset, tree_offsets[index], float(index) * 0.37, Vector3.ONE * (0.88 + 0.04 * index))

	var ridge := Node3D.new()
	ridge.name = "NorthRidge"
	ridge.position = topology_to_world_point(LANDMARKS["NorthRidge"], 0.08)
	add_child(ridge)
	_spawn_asset(ridge, "decoration/nature/hill_single_A.gltf", Vector3(-0.75, 0, 0.10), -0.15, Vector3.ONE * 1.20)
	_spawn_asset(ridge, "decoration/nature/hill_single_B.gltf", Vector3(0.55, 0, -0.35), 0.18, Vector3.ONE * 1.08)
	_spawn_asset(ridge, "decoration/nature/rock_single_A.gltf", Vector3(-0.10, 0, 0.85), 0.55, Vector3.ONE * 0.82)
	_spawn_asset(ridge, "decoration/nature/rock_single_C.gltf", Vector3(1.05, 0, 0.55), -0.42, Vector3.ONE * 0.78)

	var fields := Node3D.new()
	fields.name = "FieldsPlains"
	fields.position = topology_to_world_point(LANDMARKS["FieldsPlains"], 0.03)
	add_child(fields)

	var marsh := Node3D.new()
	marsh.name = "SouthMarsh"
	marsh.position = topology_to_world_point(LANDMARKS["SouthMarsh"], 0.03)
	add_child(marsh)
	_spawn_asset(marsh, "decoration/nature/tree_single_B.gltf", Vector3(-0.85, 0, 0.25), 0.2, Vector3.ONE * 0.72)
	_spawn_asset(marsh, "decoration/nature/tree_single_A.gltf", Vector3(0.70, 0, -0.35), -0.4, Vector3.ONE * 0.66)

	var coast := Node3D.new()
	coast.name = "CoastOutflow"
	coast.position = topology_to_world_point(LANDMARKS["CoastOutflow"], 0.02)
	add_child(coast)

	var northgate := Node3D.new()
	northgate.name = "Northgate"
	northgate.position = topology_to_world_point(LANDMARKS["Northgate"], 0.03)
	add_child(northgate)

func _build_cameras() -> void:
	for preset in CAMERA_CONTRACT.keys():
		var definition: Dictionary = CAMERA_CONTRACT[preset]
		var camera := Camera3D.new()
		camera.name = String(definition["node"])
		camera.projection = Camera3D.PROJECTION_ORTHOGONAL
		camera.size = float(definition["size"])
		var focus := topology_to_world_point(definition["center"], 0.0)
		camera.position = focus + Vector3(11.5, 13.0, 11.5)
		camera.look_at(focus, Vector3.UP)
		add_child(camera)
		cameras[preset] = camera

func _activate_camera(preset: String) -> void:
	for key in cameras.keys():
		(cameras[key] as Camera3D).current = key == preset
	print("AURELIAN_PHASE1_CAMERA=%s" % preset)

func _process(_delta: float) -> void:
	if not sequence_mode:
		return
	sequence_frame += 1
	if sequence_frame == 180:
		_activate_camera("map")
	elif sequence_frame == 360:
		_activate_camera("world")
	elif sequence_frame >= 540:
		print("AURELIAN_PHASE1_SEQUENCE_COMPLETE=540")
		get_tree().quit()

func _capture_still(preset: String) -> void:
	for _frame in range(4):
		await get_tree().process_frame
	await RenderingServer.frame_post_draw
	var image := get_viewport().get_texture().get_image()
	var output_path := evidence_dir.path_join("%s-1440x900.png" % preset)
	var result := image.save_png(output_path)
	if result != OK:
		push_error("AURELIAN_PHASE1_CAPTURE_FAILED: %s" % output_path)
		get_tree().quit(32)
		return
	print("AURELIAN_PHASE1_STILL=%s:%s" % [preset, output_path])
	get_tree().quit()

func _write_transform_manifest() -> void:
	var landmark_payload := {}
	for landmark_name in LANDMARKS.keys():
		var point: Vector2 = LANDMARKS[landmark_name]
		var world := topology_to_world_point(point)
		landmark_payload[landmark_name] = {
			"topology": [point.x, point.y],
			"world": [world.x, world.y, world.z],
		}

	var river_payload := []
	for point in RIVER_POINTS:
		var world := topology_to_world_point(point, 0.075)
		river_payload.append({"topology": [point.x, point.y], "world": [world.x, world.y, world.z]})

	var route_payload := {}
	for route_name in ROUTES.keys():
		var points := []
		for point in ROUTES[route_name]:
			var world := topology_to_world_point(point, 0.095)
			points.append({"topology": [point.x, point.y], "world": [world.x, world.y, world.z]})
		route_payload[route_name] = points

	var camera_payload := {}
	for preset in cameras.keys():
		var camera := cameras[preset] as Camera3D
		var definition: Dictionary = CAMERA_CONTRACT[preset]
		camera_payload[preset] = {
			"node": camera.name,
			"topology_center": [definition["center"].x, definition["center"].y],
			"world_position": [camera.position.x, camera.position.y, camera.position.z],
			"orthographic_size": camera.size,
		}

	var manifest := {
		"classification": "PHASE1_SHARED_GEOGRAPHY_EVIDENCE",
		"topology_authority": "docs/AURELIAN_BASIN_TOPOLOGY_V1.md",
		"coordinate_plane": [1000, 900],
		"topology_to_world": "x=(X-500)*0.02, z=(Y-450)*0.02",
		"landmarks": landmark_payload,
		"river_centerline": river_payload,
		"bridge": {
			"node": "Bridge_GildedCrossing",
			"topology_center": [515, 340],
			"topology_endpoints": [[455, 340], [575, 340]],
			"orientation": "east-west / perpendicular to local north-south river flow",
		},
		"routes": route_payload,
		"cameras": camera_payload,
		"shared_node_contract": [
			"Terrain", "River", "Bridge_GildedCrossing", "Roads", "GreenvaleOrigin",
			"NorthRidge", "ForestWorkEdge", "FieldsPlains", "SouthMarsh", "CoastOutflow",
			"Camera_Village", "Camera_Map", "Camera_World",
		],
	}

	var path := evidence_dir.path_join("transform-manifest.json")
	var file := FileAccess.open(path, FileAccess.WRITE)
	if file == null:
		push_error("AURELIAN_PHASE1_MANIFEST_OPEN_FAILED: %s" % path)
		return
	file.store_string(JSON.stringify(manifest, "  ") + "\n")
	print("AURELIAN_PHASE1_MANIFEST=%s" % path)

func _polygon_surface(points: Array, height: float, material: Material, node_name: String) -> MeshInstance3D:
	var polygon := PackedVector2Array()
	for point in points:
		var world := topology_to_world_point(point, height)
		polygon.append(Vector2(world.x, world.z))
	var indices := Geometry2D.triangulate_polygon(polygon)
	var vertices := PackedVector3Array()
	var normals := PackedVector3Array()
	for point in polygon:
		vertices.append(Vector3(point.x, height, point.y))
		normals.append(Vector3.UP)
	var arrays := []
	arrays.resize(Mesh.ARRAY_MAX)
	arrays[Mesh.ARRAY_VERTEX] = vertices
	arrays[Mesh.ARRAY_NORMAL] = normals
	arrays[Mesh.ARRAY_INDEX] = indices
	var mesh := ArrayMesh.new()
	mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays)
	var instance := MeshInstance3D.new()
	instance.name = node_name
	instance.mesh = mesh
	instance.material_override = material
	return instance

func _ribbon_mesh(points: Array, width: float, height: float, material: Material, node_name: String) -> MeshInstance3D:
	var world_points: Array[Vector3] = []
	for point in points:
		world_points.append(topology_to_world_point(point, height))
	var vertices := PackedVector3Array()
	var normals := PackedVector3Array()
	var indices := PackedInt32Array()
	for index in world_points.size():
		var previous: Vector3 = world_points[max(index - 1, 0)]
		var following: Vector3 = world_points[min(index + 1, world_points.size() - 1)]
		var tangent := (following - previous).normalized()
		var side := Vector3(-tangent.z, 0.0, tangent.x).normalized() * (width * 0.5)
		vertices.append(world_points[index] + side)
		vertices.append(world_points[index] - side)
		normals.append(Vector3.UP)
		normals.append(Vector3.UP)
	for index in range(world_points.size() - 1):
		var base := index * 2
		indices.append_array(PackedInt32Array([base, base + 2, base + 1, base + 1, base + 2, base + 3]))
	var arrays := []
	arrays.resize(Mesh.ARRAY_MAX)
	arrays[Mesh.ARRAY_VERTEX] = vertices
	arrays[Mesh.ARRAY_NORMAL] = normals
	arrays[Mesh.ARRAY_INDEX] = indices
	var mesh := ArrayMesh.new()
	mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays)
	var instance := MeshInstance3D.new()
	instance.name = node_name
	instance.mesh = mesh
	instance.material_override = material
	return instance

func _add_field_strips(parent: Node3D) -> void:
	var center := topology_to_world_point(LANDMARKS["FieldsPlains"], 0.055)
	var field_material := _material(Color("#ad9451"), 0.96)
	for index in range(5):
		var strip := MeshInstance3D.new()
		strip.name = "FieldStrip%02d" % index
		var mesh := BoxMesh.new()
		mesh.size = Vector3(2.7, 0.035, 0.28)
		strip.mesh = mesh
		strip.position = center + Vector3(-0.4 + index * 0.14, 0.0, -0.95 + index * 0.43)
		strip.rotation.y = -0.18
		strip.material_override = field_material
		parent.add_child(strip)

func _add_outer_water(parent: Node3D) -> void:
	var water := MeshInstance3D.new()
	water.name = "OuterWater"
	var mesh := PlaneMesh.new()
	mesh.size = Vector2(11.0, 4.6)
	water.mesh = mesh
	water.position = Vector3(2.0, -0.05, 10.5)
	water.material_override = _material(Color("#315f68"), 0.42)
	parent.add_child(water)

func _spawn_asset(parent: Node, relative_path: String, position: Vector3, yaw: float, asset_scale: Vector3) -> Node3D:
	var resource_path := ASSET_ROOT + relative_path
	if not ResourceLoader.exists(resource_path):
		push_error("AURELIAN_PHASE1_ASSET_MISSING: %s" % resource_path)
		get_tree().quit(41)
		return null
	var packed := load(resource_path) as PackedScene
	if packed == null:
		push_error("AURELIAN_PHASE1_ASSET_LOAD_FAILED: %s" % resource_path)
		get_tree().quit(42)
		return null
	var instance := packed.instantiate() as Node3D
	if instance == null:
		push_error("AURELIAN_PHASE1_ASSET_INSTANCE_FAILED: %s" % resource_path)
		get_tree().quit(43)
		return null
	instance.position = position
	instance.rotation.y = yaw
	instance.scale = asset_scale
	parent.add_child(instance)
	return instance

func _material(color: Color, roughness: float) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.roughness = roughness
	return material
