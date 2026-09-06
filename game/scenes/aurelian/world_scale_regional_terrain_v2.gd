extends "res://scenes/aurelian/full_progression_clarity_composition_v1.gd"

const TERRAIN_RESOLUTION := 41
const TERRAIN_HALF_X := 34.0
const TERRAIN_HALF_Z := 30.0
const SEA_LEVEL := 0.0
const REGIONAL_CAMERA_SIZE := 60.0

const AURELIAN_CENTER := Vector2(-3.0, 2.0)
const REGIONAL_ANCHORS := [
	{"name":"Pinewatch","point":Vector2(-17.0,7.5),"kind":"forest","source":"Greenvale_barracks"},
	{"name":"Stormcap","point":Vector2(-16.0,-12.0),"kind":"highland","source":"Greenvale_church"},
	{"name":"EastRidge","point":Vector2(17.0,-10.5),"kind":"highland","source":"Greenvale_watchtower"},
	{"name":"Saltmere","point":Vector2(21.0,5.5),"kind":"coast","source":"Greenvale_blacksmith"},
	{"name":"Southfen","point":Vector2(-11.0,17.0),"kind":"marsh","source":"Greenvale_storehouse_fields"},
	{"name":"OldCrown","point":Vector2(11.5,16.5),"kind":"ruins","source":"Greenvale_church"},
]

func _make_environment() -> Environment:
	var environment := super._make_environment()
	environment.background_color = Color("#293d43")
	environment.ambient_light_color = Color("#c0bba9")
	environment.ambient_light_energy = 0.39
	environment.fog_density = 0.00045
	environment.fog_light_color = Color("#71817d")
	return environment

func _populate_world(parent: Node) -> Node3D:
	var basin := super._populate_world(parent)
	if basin == null:
		return null

	var inherited_overlay := parent.get_node_or_null("FullProgressionVisualGrammarV2GateB_empire_world")
	if inherited_overlay != null:
		inherited_overlay.visible = false

	var regional_root := Node3D.new()
	regional_root.name = "WorldScaleRegionalTerrainV2"
	parent.add_child(regional_root)

	_build_ocean(regional_root)
	_build_continuous_terrain(regional_root)
	_build_river(regional_root)
	_build_regional_aurelian(basin, regional_root)
	_build_regional_anchors(basin, regional_root)

	basin.visible = false
	return basin

func _make_camera(preset: String, parent: Node) -> Camera3D:
	var camera := super._make_camera(preset, parent)
	if preset != "world":
		return camera
	camera.size = REGIONAL_CAMERA_SIZE
	camera.far = 700.0
	var focus := Vector3(0.0, 0.65, 0.0)
	camera.position = Vector3(37.0, 45.0, 37.0)
	camera.look_at(focus, Vector3.UP)
	return camera

func _build_ocean(root: Node3D) -> void:
	var ocean := MeshInstance3D.new()
	ocean.name = "RegionalOcean"
	var plane := PlaneMesh.new()
	plane.size = Vector2(92.0, 82.0)
	ocean.mesh = plane
	ocean.position = Vector3(0.0, SEA_LEVEL, 0.0)
	var material := StandardMaterial3D.new()
	material.albedo_color = Color("#31515a")
	material.roughness = 0.52
	material.metallic = 0.0
	ocean.material_override = material
	root.add_child(ocean)

func _build_continuous_terrain(root: Node3D) -> void:
	var surface := SurfaceTool.new()
	surface.begin(Mesh.PRIMITIVE_TRIANGLES)
	for row in range(TERRAIN_RESOLUTION - 1):
		for col in range(TERRAIN_RESOLUTION - 1):
			var p00 := _terrain_vertex(col, row)
			var p10 := _terrain_vertex(col + 1, row)
			var p01 := _terrain_vertex(col, row + 1)
			var p11 := _terrain_vertex(col + 1, row + 1)
			_add_colored_vertex(surface, p00)
			_add_colored_vertex(surface, p01)
			_add_colored_vertex(surface, p10)
			_add_colored_vertex(surface, p10)
			_add_colored_vertex(surface, p01)
			_add_colored_vertex(surface, p11)

	surface.generate_normals()
	var terrain := MeshInstance3D.new()
	terrain.name = "SectorA01ContinuousHeightfield"
	terrain.mesh = surface.commit()
	var material := StandardMaterial3D.new()
	material.vertex_color_use_as_albedo = true
	material.cull_mode = BaseMaterial3D.CULL_DISABLED
	material.roughness = 0.98
	material.metallic = 0.0
	terrain.material_override = material
	root.add_child(terrain)

func _terrain_vertex(col: int, row: int) -> Dictionary:
	var u := float(col) / float(TERRAIN_RESOLUTION - 1)
	var v := float(row) / float(TERRAIN_RESOLUTION - 1)
	var x := lerpf(-TERRAIN_HALF_X, TERRAIN_HALF_X, u)
	var z := lerpf(-TERRAIN_HALF_Z, TERRAIN_HALF_Z, v)
	var height := _terrain_height(x, z)
	return {"position": Vector3(x, height, z), "color": _terrain_color(x, z, height)}

func _add_colored_vertex(surface: SurfaceTool, data: Dictionary) -> void:
	surface.set_color(data["color"])
	surface.add_vertex(data["position"])

func _terrain_height(x: float, z: float) -> float:
	var height := 1.08
	height += 0.10 * sin(x * 0.31) + 0.08 * cos(z * 0.27) + 0.05 * sin((x + z) * 0.19)
	height -= 0.48 * _gaussian(x, z, AURELIAN_CENTER.x, AURELIAN_CENTER.y, 7.0)
	height += 2.85 * _gaussian(x, z, -16.0, -12.0, 6.2)
	height += 2.15 * _gaussian(x, z, 17.0, -10.5, 6.5)
	height += 1.05 * _gaussian(x, z, 11.5, 16.5, 5.0)
	height -= 0.42 * _gaussian(x, z, -11.0, 17.0, 5.8)
	height -= 1.25 * _gaussian(x, z, 28.0, 6.0, 7.5)
	var river_center_x := -2.0 + z * 0.20 + sin(z * 0.24) * 1.8
	var river_distance: float = absf(x - river_center_x)
	height -= exp(-river_distance * river_distance / 2.2) * 0.34
	var edge := maxf(abs(x) / TERRAIN_HALF_X, abs(z) / TERRAIN_HALF_Z)
	var coast_sink := smoothstep(0.72, 1.0, edge)
	height -= coast_sink * coast_sink * 2.75
	return height

func _terrain_color(x: float, z: float, height: float) -> Color:
	var color := Color("#69735b")
	var pine := _gaussian(x, z, -17.0, 7.5, 7.0)
	var marsh := _gaussian(x, z, -11.0, 17.0, 6.0)
	var dry_east := _gaussian(x, z, 17.0, 4.0, 9.0)
	var home_green := _gaussian(x, z, AURELIAN_CENTER.x, AURELIAN_CENTER.y, 8.0)
	color = color.lerp(Color("#405b48"), clampf(pine * 0.72, 0.0, 0.72))
	color = color.lerp(Color("#53685a"), clampf(marsh * 0.62, 0.0, 0.62))
	color = color.lerp(Color("#82765a"), clampf(dry_east * 0.45, 0.0, 0.45))
	color = color.lerp(Color("#72805f"), clampf(home_green * 0.32, 0.0, 0.32))
	if height > 2.0:
		color = color.lerp(Color("#77766a"), clampf((height - 2.0) * 0.24, 0.0, 0.62))
	if height < 0.28:
		color = color.lerp(Color("#777258"), 0.32)
	return color

func _gaussian(x: float, z: float, center_x: float, center_z: float, sigma: float) -> float:
	var dx := x - center_x
	var dz := z - center_z
	return exp(-(dx * dx + dz * dz) / (2.0 * sigma * sigma))

func _build_river(root: Node3D) -> void:
	var points: Array[Vector2] = [Vector2(-13.0, -16.0), Vector2(-9.0, -10.0), Vector2(-6.0, -4.0), Vector2(-3.0, 2.0), Vector2(0.5, 8.0), Vector2(5.0, 12.0), Vector2(11.0, 10.0), Vector2(17.0, 7.5), Vector2(24.5, 6.0)]
	for index in range(points.size() - 1):
		_add_river_segment(root, "RegionalRiver_%02d" % index, points[index], points[index + 1], 0.62 if index < 5 else 0.82)

func _add_river_segment(root: Node3D, node_name: String, a: Vector2, b: Vector2, width: float) -> void:
	var start := Vector3(a.x, _terrain_height(a.x, a.y) + 0.055, a.y)
	var finish := Vector3(b.x, _terrain_height(b.x, b.y) + 0.055, b.y)
	var direction := finish - start
	var horizontal_length := Vector2(direction.x, direction.z).length()
	var segment := MeshInstance3D.new()
	segment.name = node_name
	var mesh := BoxMesh.new()
	mesh.size = Vector3(width, 0.05, horizontal_length)
	segment.mesh = mesh
	segment.position = (start + finish) * 0.5
	segment.rotation.y = atan2(direction.x, direction.z)
	var material := StandardMaterial3D.new()
	material.albedo_color = Color("#416c78")
	material.roughness = 0.38
	segment.material_override = material
	root.add_child(segment)

func _build_regional_aurelian(basin: Node3D, root: Node3D) -> void:
	var home := Node3D.new()
	home.name = "RegionalAurelianHome"
	root.add_child(home)
	var offsets := [Vector2(0,0), Vector2(-1.2,0.9), Vector2(1.0,0.7), Vector2(-0.4,-1.1), Vector2(1.3,-0.8)]
	var sources := ["Greenvale_city_hall", "Greenvale_market_hall", "Greenvale_church", "Greenvale_barracks", "Greenvale_blacksmith"]
	for index in range(sources.size()):
		_duplicate_landmark(basin, home, sources[index], "RegionalAurelian_%02d" % index, AURELIAN_CENTER + offsets[index], 0.42 if index == 0 else 0.30, float(index * 17 - 28))
	_add_tree_cluster(root, "AurelianOrchards", AURELIAN_CENTER + Vector2(-2.4,2.2), 9, 2.7, Color("#3f5946"))

func _build_regional_anchors(basin: Node3D, root: Node3D) -> void:
	for index in range(REGIONAL_ANCHORS.size()):
		var anchor: Dictionary = REGIONAL_ANCHORS[index]
		var point: Vector2 = anchor["point"]
		var kind := String(anchor["kind"])
		match kind:
			"forest": _add_tree_cluster(root, "PinewatchForest", point, 28, 5.5, Color("#355344"))
			"highland": _add_rock_cluster(root, "%sRelief" % anchor["name"], point, 6, 3.8)
			"marsh": _add_marsh_cluster(root, "SouthfenWetlands", point)
			"ruins": _add_rock_cluster(root, "OldCrownRuins", point, 4, 2.1)
			"coast": _add_rock_cluster(root, "SaltmereCliffs", point + Vector2(1.3,-1.0), 4, 2.4)
		_duplicate_landmark(basin, root, String(anchor["source"]), "RegionalAnchor_%s" % anchor["name"], point, 0.25 if kind != "highland" else 0.30, float(index * 23 - 34))

func _duplicate_landmark(basin: Node3D, root: Node3D, source_name: String, node_name: String, point: Vector2, scale_factor: float, rotation_y: float) -> void:
	var source := basin.find_child(source_name, true, false) as Node3D
	if source == null:
		push_error("WORLD_SCALE_R1_LANDMARK_SOURCE_MISSING: %s" % source_name)
		return
	var clone := source.duplicate() as Node3D
	if clone == null:
		push_error("WORLD_SCALE_R1_LANDMARK_DUPLICATE_FAILED: %s" % source_name)
		return
	clone.name = node_name
	clone.visible = true
	clone.scale = source.scale * Vector3(scale_factor, scale_factor, scale_factor)
	clone.position = Vector3(point.x, _terrain_height(point.x, point.y) + 0.05, point.y)
	clone.rotation_degrees.y += rotation_y
	root.add_child(clone)

func _add_tree_cluster(root: Node3D, prefix: String, center: Vector2, count: int, radius: float, color_value: Color) -> void:
	for index in range(count):
		var angle := float(index) * 2.399963
		var ring := radius * sqrt(float(index + 1) / float(count))
		var point := center + Vector2(cos(angle), sin(angle)) * ring
		var tree := MeshInstance3D.new()
		tree.name = "%s_%02d" % [prefix, index]
		var mesh := CylinderMesh.new()
		mesh.top_radius = 0.0
		mesh.bottom_radius = 0.28 + float(index % 3) * 0.035
		mesh.height = 0.95 + float(index % 4) * 0.12
		mesh.radial_segments = 6
		mesh.rings = 1
		tree.mesh = mesh
		tree.position = Vector3(point.x, _terrain_height(point.x, point.y) + mesh.height * 0.5, point.y)
		var material := StandardMaterial3D.new()
		material.albedo_color = color_value.lightened(float(index % 3) * 0.035)
		material.roughness = 1.0
		tree.material_override = material
		root.add_child(tree)

func _add_rock_cluster(root: Node3D, prefix: String, center: Vector2, count: int, radius: float) -> void:
	for index in range(count):
		var angle := TAU * float(index) / float(maxi(count, 1)) + 0.35
		var point := center + Vector2(cos(angle), sin(angle)) * radius * (0.45 + float(index % 3) * 0.18)
		var rock := MeshInstance3D.new()
		rock.name = "%s_%02d" % [prefix, index]
		var mesh := CylinderMesh.new()
		mesh.top_radius = 0.35
		mesh.bottom_radius = 0.90
		mesh.height = 1.0 + float(index % 3) * 0.55
		mesh.radial_segments = 7
		mesh.rings = 1
		rock.mesh = mesh
		rock.scale = Vector3(1.0 + float(index % 2) * 0.35, 1.0, 0.8 + float((index + 1) % 2) * 0.30)
		rock.position = Vector3(point.x, _terrain_height(point.x, point.y) + mesh.height * 0.5, point.y)
		var material := StandardMaterial3D.new()
		material.albedo_color = Color("#747266").darkened(float(index % 2) * 0.06)
		material.roughness = 1.0
		rock.material_override = material
		root.add_child(rock)

func _add_marsh_cluster(root: Node3D, prefix: String, center: Vector2) -> void:
	for index in range(7):
		var angle := TAU * float(index) / 7.0
		var point := center + Vector2(cos(angle) * (1.7 + index * 0.14), sin(angle) * (1.1 + index * 0.10))
		var pool := MeshInstance3D.new()
		pool.name = "%s_%02d" % [prefix,index]
		var plane := PlaneMesh.new()
		plane.size = Vector2(1.6 + float(index % 3) * 0.35, 0.9 + float((index + 1) % 3) * 0.25)
		pool.mesh = plane
		pool.position = Vector3(point.x, _terrain_height(point.x, point.y) + 0.035, point.y)
		pool.rotation.y = float(index) * 0.41
		var material := StandardMaterial3D.new()
		material.albedo_color = Color("#3d6264")
		material.roughness = 0.45
		pool.material_override = material
		root.add_child(pool)
