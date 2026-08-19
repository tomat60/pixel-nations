extends "res://scenes/aurelian/reference_v1/aurelian_reference_v1.gd"

func _build_environment() -> void:
	var world_environment := WorldEnvironment.new()
	world_environment.name = "Environment"
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color("#68766a")
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("#c5c0a8")
	environment.ambient_light_energy = 0.36
	environment.fog_enabled = true
	environment.fog_light_color = Color("#87958a")
	environment.fog_density = 0.0012
	environment.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	environment.tonemap_exposure = 1.0
	world_environment.environment = environment
	add_child(world_environment)

	var sun := DirectionalLight3D.new()
	sun.name = "Sun"
	sun.rotation_degrees = Vector3(-52.0, -32.0, 0.0)
	sun.light_color = Color("#f3d7a5")
	sun.light_energy = 0.72
	sun.shadow_enabled = true
	add_child(sun)

func _vertex_color_material(roughness: float) -> StandardMaterial3D:
	var material := super._vertex_color_material(roughness)
	material.cull_mode = BaseMaterial3D.CULL_DISABLED
	material.albedo_color = Color("#a5a08c")
	return material

func _material(color: Color, roughness: float) -> StandardMaterial3D:
	var adjusted := color
	if color == COLOR_ROAD:
		adjusted = Color("#765b3d")
	elif color == COLOR_WATER:
		adjusted = Color("#315d66")
	var material := super._material(adjusted, roughness)
	return material

func _terrain_color(point: Vector2) -> Color:
	var color := Color("#667250")
	var forest_weight := _radial_weight(point, LANDMARKS["ForestWorkEdge"], 245.0)
	var ridge_weight := _radial_weight(point, LANDMARKS["NorthRidge"], 230.0)
	var field_weight := _radial_weight(point, LANDMARKS["FieldsPlains"], 245.0)
	var marsh_weight := _radial_weight(point, LANDMARKS["SouthMarsh"], 285.0)
	var river_distance := _distance_to_polyline(point, RIVER_POINTS)
	var river_weight := _smooth01(1.0 - river_distance / 150.0)
	var south_weight := _smooth01((point.y - 560.0) / 250.0)

	color = color.lerp(Color("#304735"), forest_weight * 0.88)
	color = color.lerp(Color("#67675f"), ridge_weight * 0.84)
	color = color.lerp(Color("#927b49"), field_weight * 0.72)
	color = color.lerp(Color("#485b49"), marsh_weight * south_weight * 0.78)
	color = color.lerp(Color("#4e674d"), river_weight * 0.55)
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
	river.mesh = _ribbon_mesh(_resample_polyline(outflow_points, 7), 0.72, 3.50, -0.075)
	var water_material := _material(Color("#315d66"), 0.38)
	water_material.cull_mode = BaseMaterial3D.CULL_DISABLED
	river.material_override = water_material
	add_child(river)

func _build_cameras() -> void:
	var sizes := {"village": 8.8, "map": 14.2, "world": 18.2}
	for preset in CAMERA_CONTRACT.keys():
		var definition: Dictionary = CAMERA_CONTRACT[preset]
		var camera := Camera3D.new()
		camera.name = "Camera_%s" % String(preset).capitalize()
		camera.projection = Camera3D.PROJECTION_ORTHOGONAL
		camera.size = float(sizes[preset])
		var focus_point: Vector2 = definition["center"]
		var focus := topology_to_world(focus_point, terrain_height_at(focus_point) * 0.35)
		camera.position = focus + Vector3(8.3, 10.2, 9.1)
		add_child(camera)
		camera.look_at(focus, Vector3.UP)
		cameras[preset] = camera
