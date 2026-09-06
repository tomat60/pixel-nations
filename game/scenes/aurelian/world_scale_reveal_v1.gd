extends "res://scenes/aurelian/full_progression_clarity_composition_v1.gd"

const SCALE_LEVELS := ["local", "sector", "atlas"]
const SECTOR_CAMERA_SIZE := 64.0
const ATLAS_CAMERA_SIZE := 154.0

const SECTOR_ANCHORS := [
	{"name": "Pinewatch", "point": Vector2(-650, 150), "kind": "forest", "color": "#526b55ff"},
	{"name": "Stormcap", "point": Vector2(500, -900), "kind": "highland", "color": "#777b6bff"},
	{"name": "Saltmere", "point": Vector2(1750, 250), "kind": "coast", "color": "#8b8a68ff"},
	{"name": "Southfen", "point": Vector2(350, 1750), "kind": "marsh", "color": "#586b5cff"},
	{"name": "OldCrown", "point": Vector2(-450, 1450), "kind": "ruins", "color": "#726b5dff"},
	{"name": "EastRidge", "point": Vector2(1500, -650), "kind": "highland", "color": "#7e765eff"},
]

const ATLAS_MASSES := [
	{"point": Vector2(-2500, -900), "size": Vector2(18.0, 11.5), "color": "#65705aff", "rot": -12.0},
	{"point": Vector2(-2850, 450), "size": Vector2(15.5, 13.0), "color": "#5c705cff", "rot": 9.0},
	{"point": Vector2(-2050, 1550), "size": Vector2(19.0, 11.0), "color": "#756f58ff", "rot": 18.0},
	{"point": Vector2(-900, -2250), "size": Vector2(16.0, 10.0), "color": "#747769ff", "rot": 5.0},
	{"point": Vector2(350, -2450), "size": Vector2(18.5, 10.5), "color": "#6d7669ff", "rot": -8.0},
	{"point": Vector2(1650, -1950), "size": Vector2(17.0, 12.0), "color": "#77705bff", "rot": 13.0},
	{"point": Vector2(2700, -850), "size": Vector2(15.0, 12.5), "color": "#687159ff", "rot": -16.0},
	{"point": Vector2(2950, 550), "size": Vector2(17.5, 11.0), "color": "#5b6e5eff", "rot": 8.0},
	{"point": Vector2(2450, 1850), "size": Vector2(20.0, 12.0), "color": "#77705dff", "rot": -9.0},
	{"point": Vector2(1150, 2500), "size": Vector2(17.0, 10.5), "color": "#68725aff", "rot": 14.0},
	{"point": Vector2(-250, 2650), "size": Vector2(18.5, 11.5), "color": "#5b6b5fff", "rot": -5.0},
	{"point": Vector2(-1450, 2450), "size": Vector2(16.0, 12.0), "color": "#746d59ff", "rot": 11.0},
	{"point": Vector2(450, 450), "size": Vector2(13.0, 9.0), "color": "#6f735aff", "rot": -4.0},
	{"point": Vector2(-950, 450), "size": Vector2(12.5, 8.0), "color": "#61705cff", "rot": 17.0},
	{"point": Vector2(1550, 650), "size": Vector2(13.5, 8.5), "color": "#77705aff", "rot": -14.0},
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
		environment.background_color = Color("#263238")
		environment.fog_density = 0.00055
	elif scale_level == "atlas":
		environment.background_color = Color("#202c32")
		environment.fog_density = 0.00018
		environment.ambient_light_energy = 0.42
	return environment

func _populate_world(parent: Node) -> Node3D:
	var basin := super._populate_world(parent)
	if basin == null:
		return null
	if scale_level == "sector":
		_build_sector_a01(basin, parent)
	elif scale_level == "atlas":
		_build_world_atlas(basin, parent)
	return basin

func _make_camera(preset: String, parent: Node) -> Camera3D:
	var camera := super._make_camera(preset, parent)
	if preset != "world" or scale_level == "local":
		return camera
	var focus := topology_to_godot(Vector2(500, 450), 0.0)
	camera.size = SECTOR_CAMERA_SIZE if scale_level == "sector" else ATLAS_CAMERA_SIZE
	camera.far = 1200.0
	var distance := camera.size * 0.49
	camera.position = focus + Vector3(distance, distance * 1.18, distance)
	camera.look_at(focus, Vector3.UP)
	return camera

func _build_sector_a01(basin: Node3D, parent: Node) -> void:
	var root := Node3D.new()
	root.name = "WorldScaleRevealSectorA01"
	parent.add_child(root)

	_add_water_plane(root, "SectorA01Water", Vector2(500, 450), Vector2(76.0, 70.0), "#314a50ff", -0.22)
	_add_land_patch(root, "SectorA01RegionalShelf", Vector2(500, 450), Vector2(26.5, 23.0), 0.18, "#66705aff", -4.0, -0.10)

	# Aurelian remains the detailed inherited center. These surrounding regions are
	# deliberately separated by geography and silhouette rather than UI cells.
	for index in range(SECTOR_ANCHORS.size()):
		var anchor: Dictionary = SECTOR_ANCHORS[index]
		var point: Vector2 = anchor["point"]
		var kind := String(anchor["kind"])
		var color_value := String(anchor["color"])
		var patch_size := Vector2(5.6 + float(index % 3) * 0.8, 4.1 + float((index + 1) % 3) * 0.7)
		_add_land_patch(root, "SectorAnchorTerrain_%s" % anchor["name"], point, patch_size, 0.32, color_value, float(index * 17 - 28), 0.02)
		_build_sector_anchor_detail(basin, root, String(anchor["name"]), point, kind, index)

	# Two broad connective landforms stop the sector from reading as six floating islands.
	_add_land_patch(root, "SectorWestLandBridge", Vector2(-80, 760), Vector2(10.5, 4.8), 0.14, "#616b56ff", 28.0, -0.04)
	_add_land_patch(root, "SectorEastLandBridge", Vector2(1080, 650), Vector2(11.2, 4.6), 0.14, "#6f7057ff", -24.0, -0.04)

	# Physical river/coast hierarchy. Water reads as geography, not a route overlay.
	_add_network(root, "SectorA01RiverNorth", [Vector2(440, -760), Vector2(610, -250), Vector2(540, 320), Vector2(730, 880), Vector2(920, 1450)], "#466a70ff", 0.19, 0.07)
	_add_network(root, "SectorA01RiverWest", [Vector2(-520, 520), Vector2(120, 610), Vector2(540, 560)], "#496c71ff", 0.14, 0.07)
	_add_standard(root, "SectorA01AurelianOrigin", Vector2(500, 450), "#d5ad54ff", 1.55, 0.72)

func _build_sector_anchor_detail(basin: Node3D, root: Node3D, anchor_name: String, point: Vector2, kind: String, index: int) -> void:
	match kind:
		"forest":
			_add_tree_cluster(root, "%sForest" % anchor_name, point, 9, 2.7, "#3f5d48ff")
			_add_building_clone(basin, "Greenvale_barracks", "%sSeat" % anchor_name, point, 0.78, -18.0)
		"highland":
			_add_hill_cluster(root, "%sHighlands" % anchor_name, point, 4, 2.4, "#747466ff")
			_add_building_clone(basin, "Greenvale_church", "%sSeat" % anchor_name, point + Vector2(55, 20), 0.72, float(index * 9))
		"coast":
			_add_hill_cluster(root, "%sCliffs" % anchor_name, point + Vector2(-60, 20), 3, 2.1, "#85806aff")
			_add_building_clone(basin, "Greenvale_blacksmith", "%sPort" % anchor_name, point + Vector2(30, 0), 0.70, 24.0)
		"marsh":
			_add_land_patch(root, "%sWetland" % anchor_name, point + Vector2(45, -10), Vector2(3.2, 2.1), 0.10, "#455f59ff", 9.0, 0.18)
			_add_building_clone(basin, "Greenvale_blacksmith", "%sSeat" % anchor_name, point + Vector2(-30, 15), 0.62, -10.0)
		"ruins":
			_add_hill_cluster(root, "%sRuins" % anchor_name, point, 3, 1.8, "#68645cff")
			_add_building_clone(basin, "Greenvale_church", "%sRuinSeat" % anchor_name, point, 0.58, 34.0)

func _build_world_atlas(basin: Node3D, parent: Node) -> void:
	var root := Node3D.new()
	root.name = "WorldScaleRevealAtlas"
	parent.add_child(root)

	_add_water_plane(root, "WorldAtlasOcean", Vector2(500, 450), Vector2(175.0, 160.0), "#263f48ff", -0.34)

	for index in range(ATLAS_MASSES.size()):
		var mass: Dictionary = ATLAS_MASSES[index]
		var point: Vector2 = mass["point"]
		var patch_size: Vector2 = mass["size"]
		_add_land_patch(root, "AtlasMass_%02d" % index, point, patch_size, 0.26 + float(index % 3) * 0.05, String(mass["color"]), float(mass["rot"]), -0.08)
		if index % 3 == 0:
			_add_hill_cluster(root, "AtlasRelief_%02d" % index, point + Vector2(90, -45), 3, 3.3, "#6f7064ff")
		elif index % 3 == 1:
			_add_tree_cluster(root, "AtlasForest_%02d" % index, point + Vector2(-70, 55), 5, 3.1, "#435c49ff")

	# Large-scale river/coast strokes help the atlas read as one world rather than
	# disconnected sector tokens. They are deliberately sparse.
	_add_network(root, "AtlasRiverWest", [Vector2(-2500, -650), Vector2(-2200, 150), Vector2(-1900, 900), Vector2(-1450, 1850)], "#42646cff", 0.28, 0.02)
	_add_network(root, "AtlasRiverEast", [Vector2(1650, -1700), Vector2(2100, -650), Vector2(2350, 400), Vector2(2200, 1550)], "#42646cff", 0.26, 0.02)
	_add_network(root, "AtlasRiverSouth", [Vector2(-1150, 2250), Vector2(-250, 2480), Vector2(900, 2350)], "#42646cff", 0.22, 0.02)

	# A-01 is locatable but not dominant. No label is required for the scale read.
	_add_land_patch(root, "AtlasA01Ground", Vector2(500, 450), Vector2(5.2, 4.1), 0.42, "#827553ff", -4.0, 0.16)
	_add_standard(root, "AtlasA01Origin", Vector2(500, 450), "#dfb653ff", 1.82, 0.48)
	_add_building_clone(basin, "Greenvale_church", "AtlasA01Seat", Vector2(500, 450), 0.54, 0.0)

func _add_water_plane(root: Node3D, node_name: String, point: Vector2, size: Vector2, color_value: String, height: float) -> void:
	var mesh_instance := MeshInstance3D.new()
	mesh_instance.name = node_name
	var plane := PlaneMesh.new()
	plane.size = size
	mesh_instance.mesh = plane
	mesh_instance.position = topology_to_godot(point, height)
	mesh_instance.material_override = _make_world_material(color_value, 0.92)
	root.add_child(mesh_instance)

func _add_land_patch(root: Node3D, node_name: String, point: Vector2, size: Vector2, height: float, color_value: String, rotation_degrees_y: float, base_height: float) -> void:
	var mesh_instance := MeshInstance3D.new()
	mesh_instance.name = node_name
	var mesh := CylinderMesh.new()
	mesh.top_radius = 1.0
	mesh.bottom_radius = 1.0
	mesh.height = height
	mesh.radial_segments = 8
	mesh.rings = 1
	mesh_instance.mesh = mesh
	mesh_instance.scale = Vector3(size.x, 1.0, size.y)
	mesh_instance.position = topology_to_godot(point, base_height + height * 0.5)
	mesh_instance.rotation_degrees.y = rotation_degrees_y
	mesh_instance.material_override = _make_world_material(color_value, 0.98)
	root.add_child(mesh_instance)

func _add_hill_cluster(root: Node3D, prefix: String, point: Vector2, count: int, spread: float, color_value: String) -> void:
	var offsets := [Vector2(-70, 20), Vector2(55, -45), Vector2(25, 65), Vector2(-30, -60), Vector2(85, 35)]
	for index in range(count):
		var mesh_instance := MeshInstance3D.new()
		mesh_instance.name = "%s_%02d" % [prefix, index]
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
	var offsets := [Vector2(-85, -35), Vector2(-40, 55), Vector2(0, -70), Vector2(45, 30), Vector2(78, -20), Vector2(-15, 82), Vector2(92, 68), Vector2(-92, 72), Vector2(20, 5)]
	for index in range(count):
		var mesh_instance := MeshInstance3D.new()
		mesh_instance.name = "%s_%02d" % [prefix, index]
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
