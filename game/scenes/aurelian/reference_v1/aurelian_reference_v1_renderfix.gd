extends "res://scenes/aurelian/reference_v1/aurelian_reference_v1.gd"

func _build_environment() -> void:
	var world_environment := WorldEnvironment.new()
	world_environment.name = "Environment"
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color("#657052")
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("#c5bea8")
	environment.ambient_light_energy = 0.44
	environment.fog_enabled = true
	environment.fog_light_color = Color("#7f8877")
	environment.fog_density = 0.0007
	environment.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	environment.tonemap_exposure = 1.0
	world_environment.environment = environment
	add_child(world_environment)

	var sun := DirectionalLight3D.new()
	sun.name = "Sun"
	sun.rotation_degrees = Vector3(-52.0, -32.0, 0.0)
	sun.light_color = Color("#edd2a8")
	sun.light_energy = 0.74
	sun.shadow_enabled = true
	add_child(sun)

func _build_terrain() -> void:
	var underlay := MeshInstance3D.new()
	underlay.name = "BasinUnderlay"
	var underlay_mesh := PlaneMesh.new()
	underlay_mesh.size = Vector2(64.0, 64.0)
	underlay.mesh = underlay_mesh
	underlay.position = Vector3(0.0, -0.48, 0.0)
	var underlay_material := _material(Color("#5f6a4d"), 1.0)
	underlay_material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	underlay.material_override = underlay_material
	add_child(underlay)
	super._build_terrain()

func _vertex_color_material(roughness: float) -> StandardMaterial3D:
	var material := super._vertex_color_material(roughness)
	material.cull_mode = BaseMaterial3D.CULL_DISABLED
	material.albedo_color = Color.WHITE
	return material

func _material(color: Color, roughness: float) -> StandardMaterial3D:
	var adjusted := color
	if color == COLOR_ROAD:
		adjusted = Color("#5d4936")
	elif color == COLOR_WATER:
		adjusted = Color("#2f6872")
	return super._material(adjusted, roughness)

func _terrain_color(point: Vector2) -> Color:
	var color := Color("#657153")
	var forest_weight := _radial_weight(point, LANDMARKS["ForestWorkEdge"], 255.0)
	var ridge_weight := _radial_weight(point, LANDMARKS["NorthRidge"], 235.0)
	var field_weight := _radial_weight(point, LANDMARKS["FieldsPlains"], 250.0)
	var marsh_weight := _radial_weight(point, LANDMARKS["SouthMarsh"], 275.0)
	var river_distance := _distance_to_polyline(point, RIVER_POINTS)
	var river_weight := _smooth01(1.0 - river_distance / 145.0)
	var south_weight := _smooth01((point.y - 530.0) / 285.0)

	color = color.lerp(Color("#344c39"), forest_weight * 0.88)
	color = color.lerp(Color("#72726a"), ridge_weight * 0.82)
	color = color.lerp(Color("#84764e"), field_weight * 0.76)
	color = color.lerp(Color("#42594d"), marsh_weight * south_weight * 0.84)
	color = color.lerp(Color("#465e49"), river_weight * 0.52)
	return color

func _radial_weight(point: Vector2, center: Vector2, radius: float) -> float:
	return _smooth01(1.0 - point.distance_to(center) / radius)

func _smooth01(value: float) -> float:
	var t := clampf(value, 0.0, 1.0)
	return t * t * (3.0 - 2.0 * t)

func _build_water() -> void:
	var river := MeshInstance3D.new()
	river.name = "RiverWater"
	var outflow_points: Array = RIVER_POINTS.duplicate()
	outflow_points.append(Vector2(620, 970))
	outflow_points.append(Vector2(650, 1040))
	outflow_points.append(Vector2(705, 1120))
	outflow_points.append(Vector2(780, 1210))
	var sampled := _resample_polyline(outflow_points, 9)
	river.mesh = _water_ribbon_mesh(sampled, 1.05, 4.8)
	var water_material := _material(Color("#2f6872"), 0.44)
	water_material.cull_mode = BaseMaterial3D.CULL_DISABLED
	water_material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	river.material_override = water_material
	add_child(river)

func _water_ribbon_mesh(points: Array, width_north: float, width_south: float) -> ArrayMesh:
	var surface := SurfaceTool.new()
	surface.begin(Mesh.PRIMITIVE_TRIANGLES)
	for index in range(points.size() - 1):
		var a: Vector2 = points[index]
		var b: Vector2 = points[index + 1]
		var tangent := (b - a).normalized()
		var normal := Vector2(-tangent.y, tangent.x)
		var wa := lerpf(width_north, width_south, clampf(a.y / 1210.0, 0.0, 1.0)) * 0.5
		var wb := lerpf(width_north, width_south, clampf(b.y / 1210.0, 0.0, 1.0)) * 0.5
		var ah := terrain_height_at(a) + 0.18
		var bh := terrain_height_at(b) + 0.18
		var a_left := topology_to_world(a, ah) + Vector3(normal.x * wa, 0.0, normal.y * wa)
		var a_right := topology_to_world(a, ah) - Vector3(normal.x * wa, 0.0, normal.y * wa)
		var b_left := topology_to_world(b, bh) + Vector3(normal.x * wb, 0.0, normal.y * wb)
		var b_right := topology_to_world(b, bh) - Vector3(normal.x * wb, 0.0, normal.y * wb)
		for vertex in [a_left, b_left, a_right, a_right, b_left, b_right]:
			surface.add_vertex(vertex)
	surface.generate_normals()
	return surface.commit()

func _build_roads() -> void:
	var road_root := Node3D.new()
	road_root.name = "Roads"
	add_child(road_root)
	var road_material := _material(Color("#5d4936"), 1.0)
	road_material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	road_material.cull_mode = BaseMaterial3D.CULL_DISABLED
	for route_name in ROUTES.keys():
		var route_points := _resample_polyline(ROUTES[route_name], 7)
		var road := MeshInstance3D.new()
		road.name = String(route_name)
		road.mesh = _terrain_ribbon_mesh(route_points, 0.34)
		road.material_override = road_material
		road_root.add_child(road)

func _add_fields(parent: Node3D, center: Vector2, count: int) -> void:
	for index in range(count):
		var point := center + Vector2(float(index) * 12.0, float(index % 2) * 10.0)
		var world := topology_to_world(point, terrain_height_at(point) + 0.035)
		_add_box(parent, "FieldStrip%02d" % index, world, Vector3(1.42, 0.04, 0.18), Color("#8e7a49"))

func _build_cameras() -> void:
	var sizes := {"village": 8.4, "map": 13.2, "world": 15.7}
	for preset in CAMERA_CONTRACT.keys():
		var definition: Dictionary = CAMERA_CONTRACT[preset]
		var camera := Camera3D.new()
		camera.name = "Camera_%s" % String(preset).capitalize()
		camera.projection = Camera3D.PROJECTION_ORTHOGONAL
		camera.size = float(sizes[preset])
		var focus_point: Vector2 = definition["center"]
		var focus := topology_to_world(focus_point, terrain_height_at(focus_point) * 0.35)
		camera.position = focus + Vector3(7.6, 9.4, 8.5)
		add_child(camera)
		camera.look_at(focus, Vector3.UP)
		cameras[preset] = camera
