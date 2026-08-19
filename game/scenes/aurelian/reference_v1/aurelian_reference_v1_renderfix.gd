extends "res://scenes/aurelian/reference_v1/aurelian_reference_v1.gd"

func _build_environment() -> void:
	var world_environment := WorldEnvironment.new()
	world_environment.name = "Environment"
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color("#667050")
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("#c8c0a7")
	environment.ambient_light_energy = 0.42
	environment.fog_enabled = true
	environment.fog_light_color = Color("#7f8c7e")
	environment.fog_density = 0.0008
	environment.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	environment.tonemap_exposure = 1.0
	world_environment.environment = environment
	add_child(world_environment)

	var sun := DirectionalLight3D.new()
	sun.name = "Sun"
	sun.rotation_degrees = Vector3(-52.0, -32.0, 0.0)
	sun.light_color = Color("#f0d5aa")
	sun.light_energy = 0.78
	sun.shadow_enabled = true
	add_child(sun)

func _vertex_color_material(roughness: float) -> StandardMaterial3D:
	var material := super._vertex_color_material(roughness)
	material.cull_mode = BaseMaterial3D.CULL_DISABLED
	material.albedo_color = Color.WHITE
	return material

func _material(color: Color, roughness: float) -> StandardMaterial3D:
	var adjusted := color
	if color == COLOR_ROAD:
		adjusted = Color("#654b33")
	elif color == COLOR_WATER:
		adjusted = Color("#315a63")
	return super._material(adjusted, roughness)

func _terrain_color(point: Vector2) -> Color:
	var color := Color("#667050")
	var forest_weight := _radial_weight(point, LANDMARKS["ForestWorkEdge"], 285.0)
	var ridge_weight := _radial_weight(point, LANDMARKS["NorthRidge"], 265.0)
	var field_weight := _radial_weight(point, LANDMARKS["FieldsPlains"], 285.0)
	var marsh_weight := _radial_weight(point, LANDMARKS["SouthMarsh"], 320.0)
	var river_distance := _distance_to_polyline(point, RIVER_POINTS)
	var river_weight := _smooth01(1.0 - river_distance / 165.0)
	var south_weight := _smooth01((point.y - 520.0) / 300.0)

	color = color.lerp(Color("#2f4936"), forest_weight * 0.92)
	color = color.lerp(Color("#64645d"), ridge_weight * 0.88)
	color = color.lerp(Color("#937c48"), field_weight * 0.84)
	color = color.lerp(Color("#455c4e"), marsh_weight * south_weight * 0.88)
	color = color.lerp(Color("#47604a"), river_weight * 0.58)
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
	outflow_points.append(Vector2(620, 980))
	outflow_points.append(Vector2(650, 1080))
	outflow_points.append(Vector2(690, 1200))
	var sampled := _resample_polyline(outflow_points, 7)
	river.mesh = _water_ribbon_mesh(sampled, 0.72, 3.35)
	var water_material := _material(Color("#315a63"), 0.42)
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
		var wa := lerpf(width_north, width_south, clampf(a.y / 1200.0, 0.0, 1.0)) * 0.5
		var wb := lerpf(width_north, width_south, clampf(b.y / 1200.0, 0.0, 1.0)) * 0.5
		var ah := terrain_height_at(a) + 0.035
		var bh := terrain_height_at(b) + 0.035
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
	var road_material := _material(Color("#60472f"), 1.0)
	road_material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	road_material.cull_mode = BaseMaterial3D.CULL_DISABLED
	for route_name in ROUTES.keys():
		var route_points := _resample_polyline(ROUTES[route_name], 5)
		var road := MeshInstance3D.new()
		road.name = String(route_name)
		road.mesh = _terrain_ribbon_mesh(route_points, 0.42)
		road.material_override = road_material
		road_root.add_child(road)

func _build_cameras() -> void:
	var sizes := {"village": 8.4, "map": 13.4, "world": 16.6}
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
