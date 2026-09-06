extends "res://scenes/aurelian/full_progression_clarity_composition_v1.gd"

const SCALE_LEVELS := ["local", "sector", "atlas"]
const SECTOR_CAMERA_SIZE := 72.0
const ATLAS_CAMERA_SIZE := 158.0

const SECTOR_ANCHORS := [
	{"name": "Pinewatch", "point": Vector2(-420, 180), "kind": "forest", "color": "#506653ff"},
	{"name": "Stormcap", "point": Vector2(500, -610), "kind": "highland", "color": "#73776aff"},
	{"name": "Saltmere", "point": Vector2(1420, 320), "kind": "coast", "color": "#858369ff"},
	{"name": "Southfen", "point": Vector2(320, 1370), "kind": "marsh", "color": "#56695bff"},
	{"name": "OldCrown", "point": Vector2(-400, 1050), "kind": "ruins", "color": "#6e695dff"},
	{"name": "EastRidge", "point": Vector2(1240, -430), "kind": "highland", "color": "#77715dff"},
]

const ATLAS_CONTINENTS := [
	{
		"name": "CentralReach",
		"color": "#66705aff",
		"points": [Vector2(-1500,-980), Vector2(-500,-1450), Vector2(420,-1580), Vector2(1320,-1210), Vector2(2150,-380), Vector2(2200,620), Vector2(1480,1500), Vector2(420,1880), Vector2(-620,1560), Vector2(-1350,820), Vector2(-1650,-120)]
	},
	{
		"name": "WesternMarches",
		"color": "#5d6d5dff",
		"points": [Vector2(-3900,-1550), Vector2(-2850,-2100), Vector2(-1880,-1650), Vector2(-1500,-720), Vector2(-1900,180), Vector2(-2900,620), Vector2(-3750,120), Vector2(-4200,-720)]
	},
	{
		"name": "EasternCrownlands",
		"color": "#716d59ff",
		"points": [Vector2(2250,-1550), Vector2(3450,-1300), Vector2(4200,-420), Vector2(4120,620), Vector2(3500,1580), Vector2(2600,1680), Vector2(2050,880), Vector2(2050,-250)]
	},
	{
		"name": "SouthernWilds",
		"color": "#5c695dff",
		"points": [Vector2(-2100,2050), Vector2(-1000,2450), Vector2(100,2620), Vector2(880,3300), Vector2(200,3900), Vector2(-1050,4050), Vector2(-2200,3500), Vector2(-2650,2780)]
	},
]

const ATLAS_BIOMES := [
	{"name":"AmberSteppe","point":Vector2(1050,-650),"radius":Vector2(520,330),"color":"#8a7657ff","seed":1},
	{"name":"AurelianGreen","point":Vector2(420,520),"radius":Vector2(460,320),"color":"#61705aff","seed":2},
	{"name":"NorthPines","point":Vector2(-350,-920),"radius":Vector2(480,300),"color":"#485f4eff","seed":3},
	{"name":"Riverlands","point":Vector2(1150,720),"radius":Vector2(520,280),"color":"#5b705eff","seed":4},
	{"name":"Westwood","point":Vector2(-2850,-820),"radius":Vector2(560,330),"color":"#485f4fff","seed":5},
	{"name":"WestHighlands","point":Vector2(-2500,120),"radius":Vector2(500,300),"color":"#717066ff","seed":6},
	{"name":"IronCoast","point":Vector2(3250,-480),"radius":Vector2(620,350),"color":"#7b755eff","seed":7},
	{"name":"EastForest","point":Vector2(3300,760),"radius":Vector2(520,300),"color":"#4e6452ff","seed":8},
	{"name":"SouthfenMacro","point":Vector2(-1550,2900),"radius":Vector2(600,360),"color":"#50645aff","seed":9},
	{"name":"SunwardFields","point":Vector2(-300,3150),"radius":Vector2(560,320),"color":"#83765aff","seed":10},
	{"name":"CrownRidge","point":Vector2(1450,1280),"radius":Vector2(430,280),"color":"#747164ff","seed":11},
	{"name":"VeilMarsh","point":Vector2(-1050,980),"radius":Vector2(420,260),"color":"#53665aff","seed":12},
]

var scale_level := "local"

func _ready() -> void:
	var requested := OS.get_environment("AURELIAN_WORLD_SCALE_LEVEL").to_lower()
	if requested.is_empty():
		requested = "local"
	if not SCALE_LEVELS.has(requested):
		push_error("WORLD_SCALE_REVEAL_UNKNOWN_LEVEL: %s" % requested)
		get_tree().quit(251)
		return
	scale_level = requested
	if OS.get_environment("AURELIAN_CAPTURE_PRESET").is_empty():
		OS.set_environment("AURELIAN_CAPTURE_PRESET", "world")
	super()
	print("WORLD_SCALE_REVEAL_V1_READY=%s" % scale_level)

func _make_environment() -> Environment:
	var environment := super._make_environment()
	if scale_level == "sector":
		environment.background_color = Color("#314a50")
		environment.fog_density = 0.00045
	elif scale_level == "atlas":
		environment.background_color = Color("#263f48")
		environment.fog_density = 0.00014
		environment.ambient_light_energy = 0.43
	return environment

func _populate_world(parent: Node) -> Node3D:
	var basin := super._populate_world(parent)
	if basin == null:
		return null
	if scale_level != "local":
		var inherited_overlay := parent.get_node_or_null("FullProgressionVisualGrammarV2GateB_empire_world")
		if inherited_overlay != null:
			inherited_overlay.visible = false
	if scale_level == "sector":
		_build_sector_a01(basin, parent)
	elif scale_level == "atlas":
		_build_world_atlas(basin, parent)
	return basin

func _make_camera(preset: String, parent: Node) -> Camera3D:
	var camera := super._make_camera(preset, parent)
	if preset != "world" or scale_level == "local":
		return camera
	var focus_topology := Vector2(500, 450) if scale_level == "sector" else Vector2(250, 900)
	var focus := topology_to_godot(focus_topology, 0.0)
	camera.size = SECTOR_CAMERA_SIZE if scale_level == "sector" else ATLAS_CAMERA_SIZE
	camera.far = 1400.0
	var distance := camera.size * 0.50
	camera.position = focus + Vector3(distance, distance * 1.16, distance)
	camera.look_at(focus, Vector3.UP)
	return camera

func _build_sector_a01(basin: Node3D, parent: Node) -> void:
	var root := Node3D.new()
	root.name = "WorldScaleRevealSectorA01"
	parent.add_child(root)

	_add_water_plane(root, "SectorA01Water", Vector2(500, 450), Vector2(150.0, 140.0), "#314a50ff", -0.28)
	var sector_coast: Array[Vector2] = [
		Vector2(-1080,-180), Vector2(-780,-720), Vector2(-80,-980), Vector2(760,-900),
		Vector2(1420,-520), Vector2(1780,80), Vector2(1700,760), Vector2(1260,1420),
		Vector2(520,1740), Vector2(-220,1640), Vector2(-820,1180), Vector2(-1080,520)
	]
	_add_polygon_land(root, "SectorA01ContinuousLand", sector_coast, -0.11, "#68715aff")

	for index in range(SECTOR_ANCHORS.size()):
		var anchor: Dictionary = SECTOR_ANCHORS[index]
		var point: Vector2 = anchor["point"]
		var kind := String(anchor["kind"])
		var radius := Vector2(300 + (index % 2) * 55, 235 + ((index + 1) % 2) * 45)
		_add_irregular_region(root, "SectorBiome_%s" % anchor["name"], point, radius, String(anchor["color"]), index + 2, -0.055)
		_build_sector_anchor_detail(basin, root, String(anchor["name"]), point, kind, index)

	_add_network(root, "SectorA01RiverNorth", [Vector2(480,-720), Vector2(610,-260), Vector2(540,260), Vector2(710,840), Vector2(900,1350)], "#456a71ff", 0.19, 0.03)
	_add_network(root, "SectorA01RiverWest", [Vector2(-720,540), Vector2(-120,620), Vector2(500,555)], "#496d73ff", 0.14, 0.03)
	_add_standard(root, "SectorA01AurelianOrigin", Vector2(500,450), "#d5ad54ff", 1.35, 0.40)

func _build_sector_anchor_detail(basin: Node3D, root: Node3D, anchor_name: String, point: Vector2, kind: String, index: int) -> void:
	match kind:
		"forest":
			_add_tree_cluster(root, "%sForest" % anchor_name, point, 9, 2.5, "#3f5b47ff")
			_add_building_clone(basin, "Greenvale_barracks", "%sSeat" % anchor_name, point, 0.72, -18.0)
		"highland":
			_add_hill_cluster(root, "%sHighlands" % anchor_name, point, 4, 2.2, "#737366ff")
			_add_building_clone(basin, "Greenvale_church", "%sSeat" % anchor_name, point + Vector2(45,18), 0.66, float(index * 9))
		"coast":
			_add_hill_cluster(root, "%sCliffs" % anchor_name, point + Vector2(-50,20), 3, 1.9, "#817d69ff")
			_add_building_clone(basin, "Greenvale_blacksmith", "%sPort" % anchor_name, point + Vector2(28,0), 0.64, 24.0)
		"marsh":
			_add_building_clone(basin, "Greenvale_blacksmith", "%sSeat" % anchor_name, point + Vector2(-25,15), 0.58, -10.0)
		"ruins":
			_add_hill_cluster(root, "%sRuins" % anchor_name, point, 3, 1.7, "#666259ff")
			_add_building_clone(basin, "Greenvale_church", "%sRuinSeat" % anchor_name, point, 0.54, 34.0)

func _build_world_atlas(basin: Node3D, parent: Node) -> void:
	var root := Node3D.new()
	root.name = "WorldScaleRevealAtlas"
	parent.add_child(root)
	_add_water_plane(root, "WorldAtlasOcean", Vector2(250,900), Vector2(280.0,250.0), "#263f48ff", -0.34)

	for continent_variant in ATLAS_CONTINENTS:
		var continent: Dictionary = continent_variant
		var points: Array[Vector2] = []
		for point_variant in continent["points"]:
			points.append(point_variant)
		_add_polygon_land(root, "AtlasContinent_%s" % continent["name"], points, -0.13, String(continent["color"]))

	for biome_variant in ATLAS_BIOMES:
		var biome: Dictionary = biome_variant
		_add_irregular_region(root, "AtlasBiome_%s" % biome["name"], biome["point"], biome["radius"], String(biome["color"]), int(biome["seed"]), -0.075)

	_add_network(root, "AtlasRiverCentral", [Vector2(-300,-1100), Vector2(150,-420), Vector2(520,350), Vector2(1030,980), Vector2(1280,1420)], "#42656dff", 0.23, -0.02)
	_add_network(root, "AtlasRiverWest", [Vector2(-3300,-1500), Vector2(-2850,-700), Vector2(-2450,20), Vector2(-2050,420)], "#42656dff", 0.24, -0.02)
	_add_network(root, "AtlasRiverEast", [Vector2(2950,-1150), Vector2(3300,-450), Vector2(3400,350), Vector2(3150,1120)], "#42656dff", 0.22, -0.02)

	_add_hill_cluster(root, "AtlasCentralRelief", Vector2(1350,-700), 4, 4.0, "#6f7064ff")
	_add_hill_cluster(root, "AtlasWestRelief", Vector2(-2500,50), 4, 4.1, "#6d7065ff")
	_add_hill_cluster(root, "AtlasEastRelief", Vector2(3150,-350), 4, 4.2, "#716e61ff")
	_add_tree_cluster(root, "AtlasCentralForest", Vector2(-320,-920), 7, 4.0, "#415a47ff")
	_add_tree_cluster(root, "AtlasWestForest", Vector2(-2950,-850), 6, 4.0, "#405847ff")
	_add_tree_cluster(root, "AtlasEastForest", Vector2(3250,760), 6, 4.0, "#425b48ff")

	_add_standard(root, "AtlasA01Origin", Vector2(500,450), "#dfb653ff", 1.55, 0.20)

func _add_polygon_land(root: Node3D, node_name: String, points: Array[Vector2], height: float, color_value: String) -> void:
	if points.size() < 3:
		return
	var polygon := PackedVector2Array()
	for point in points:
		polygon.append(point)
	var indices := Geometry2D.triangulate_polygon(polygon)
	if indices.is_empty():
		push_error("WORLD_SCALE_POLYGON_TRIANGULATION_FAILED: %s" % node_name)
		return
	var surface := SurfaceTool.new()
	surface.begin(Mesh.PRIMITIVE_TRIANGLES)
	for index in indices:
		surface.set_normal(Vector3.UP)
		surface.add_vertex(topology_to_godot(points[index], height))
	var mesh_instance := MeshInstance3D.new()
	mesh_instance.name = node_name
	mesh_instance.mesh = surface.commit()
	mesh_instance.material_override = _make_world_material(color_value, 0.98)
	root.add_child(mesh_instance)

func _add_irregular_region(root: Node3D, node_name: String, center: Vector2, radius: Vector2, color_value: String, seed: int, height: float) -> void:
	var points: Array[Vector2] = []
	for index in range(10):
		var angle := TAU * float(index) / 10.0
		var jitter_x := 0.78 + float((index * 37 + seed * 17) % 23) / 100.0
		var jitter_y := 0.76 + float((index * 29 + seed * 11) % 25) / 100.0
		points.append(center + Vector2(cos(angle) * radius.x * jitter_x, sin(angle) * radius.y * jitter_y))
	_add_polygon_land(root, node_name, points, height, color_value)

func _add_water_plane(root: Node3D, node_name: String, point: Vector2, size: Vector2, color_value: String, height: float) -> void:
	var mesh_instance := MeshInstance3D.new()
	mesh_instance.name = node_name
	var plane := PlaneMesh.new()
	plane.size = size
	mesh_instance.mesh = plane
	mesh_instance.position = topology_to_godot(point, height)
	mesh_instance.material_override = _make_world_material(color_value, 0.92)
	root.add_child(mesh_instance)

func _add_hill_cluster(root: Node3D, prefix: String, point: Vector2, count: int, spread: float, color_value: String) -> void:
	var offsets := [Vector2(-70,20), Vector2(55,-45), Vector2(25,65), Vector2(-30,-60), Vector2(85,35)]
	for index in range(count):
		var mesh_instance := MeshInstance3D.new()
		mesh_instance.name = "%s_%02d" % [prefix,index]
		var mesh := CylinderMesh.new()
		mesh.top_radius = 0.42
		mesh.bottom_radius = 1.0
		mesh.height = 1.1 + float(index % 3) * 0.34
		mesh.radial_segments = 7
		mesh.rings = 1
		mesh_instance.mesh = mesh
		mesh_instance.scale = Vector3(spread * (0.72 + float(index % 2) * 0.18), 1.0, spread * (0.58 + float((index + 1) % 2) * 0.16))
		mesh_instance.position = topology_to_godot(point + offsets[index % offsets.size()], 0.54 + float(index % 2) * 0.12)
		mesh_instance.material_override = _make_world_material(color_value, 1.0)
		root.add_child(mesh_instance)

func _add_tree_cluster(root: Node3D, prefix: String, point: Vector2, count: int, spread: float, color_value: String) -> void:
	var offsets := [Vector2(-85,-35), Vector2(-40,55), Vector2(0,-70), Vector2(45,30), Vector2(78,-20), Vector2(-15,82), Vector2(92,68), Vector2(-92,72), Vector2(20,5)]
	for index in range(count):
		var mesh_instance := MeshInstance3D.new()
		mesh_instance.name = "%s_%02d" % [prefix,index]
		var mesh := CylinderMesh.new()
		mesh.top_radius = 0.0
		mesh.bottom_radius = 0.42
		mesh.height = 1.25 + float(index % 3) * 0.18
		mesh.radial_segments = 6
		mesh.rings = 1
		mesh_instance.mesh = mesh
		mesh_instance.scale = Vector3(spread * 0.36, 1.0, spread * 0.36)
		mesh_instance.position = topology_to_godot(point + offsets[index % offsets.size()], 0.64)
		mesh_instance.material_override = _make_world_material(color_value, 1.0)
		root.add_child(mesh_instance)

func _make_world_material(color_value: String, roughness_value: float) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = Color(color_value)
	material.roughness = roughness_value
	material.metallic = 0.0
	return material
