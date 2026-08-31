extends "res://scenes/aurelian/production_world_v1.gd"

const BLOCKOUT_MANIFEST_PATH := "res://scenes/aurelian/full_progression_blockout_v1_manifest.json"
const PROGRESSION_STAGES := ["land", "settlement", "city", "nation", "empire"]
const PROGRESSION_VIEWS := ["village", "map", "world"]

var blockout_contract: Dictionary = {}
var progression_stage := "land"
var progression_view := "village"
var blockout_overlay_root: Node3D

func _ready() -> void:
	blockout_contract = _load_blockout_contract()
	if blockout_contract.is_empty():
		get_tree().quit(201)
		return

	var requested_stage := OS.get_environment("AURELIAN_PROGRESSION_STAGE").to_lower()
	if not requested_stage.is_empty():
		progression_stage = requested_stage
	if not PROGRESSION_STAGES.has(progression_stage):
		push_error("FULL_PROGRESSION_UNKNOWN_STAGE: %s" % progression_stage)
		get_tree().quit(202)
		return

	var requested_view := OS.get_environment("AURELIAN_PROGRESSION_VIEW").to_lower()
	if not requested_view.is_empty():
		progression_view = requested_view
	if not PROGRESSION_VIEWS.has(progression_view):
		push_error("FULL_PROGRESSION_UNKNOWN_VIEW: %s" % progression_view)
		get_tree().quit(203)
		return

	var preset := OS.get_environment("AURELIAN_CAPTURE_PRESET").to_lower()
	if PROGRESSION_VIEWS.has(preset):
		progression_view = preset

	_configure_parent_stage(progression_stage)
	OS.set_environment("AURELIAN_CAPTURE_VILLAGE_SEQUENCE", "0")
	OS.set_environment("AURELIAN_CAPTURE_MAP_SEQUENCE", "0")
	OS.set_environment("AURELIAN_CAPTURE_WORLD_SEQUENCE", "0")

	super()

	# Parent capture mode builds its evidence viewport through dynamic dispatch and exits later.
	if not preset.is_empty():
		return

	if main_basin == null or blockout_overlay_root == null:
		push_error("FULL_PROGRESSION_MAIN_WORLD_MISSING")
		get_tree().quit(204)
		return

	_apply_runtime_stage(progression_stage)
	_apply_runtime_view(progression_view)
	print("FULL_PROGRESSION_READY=%s:%s" % [progression_stage, progression_view])

func _load_blockout_contract() -> Dictionary:
	var file := FileAccess.open(BLOCKOUT_MANIFEST_PATH, FileAccess.READ)
	if file == null:
		push_error("FULL_PROGRESSION_MANIFEST_MISSING")
		return {}
	var payload = JSON.parse_string(file.get_as_text())
	if not payload is Dictionary:
		push_error("FULL_PROGRESSION_MANIFEST_INVALID")
		return {}
	var contract := payload as Dictionary
	if String(contract.get("contract", "")) != "GODOT_AURELIAN_FULL_PROGRESSION_BLOCKOUT_V1":
		push_error("FULL_PROGRESSION_CONTRACT_INVALID")
		return {}
	if contract.get("stages", []) != PROGRESSION_STAGES:
		push_error("FULL_PROGRESSION_STAGE_ORDER_INVALID")
		return {}
	if contract.get("views", []) != PROGRESSION_VIEWS:
		push_error("FULL_PROGRESSION_VIEW_ORDER_INVALID")
		return {}
	return contract

func _stage_data(stage_name: String) -> Dictionary:
	var matrix: Dictionary = blockout_contract.get("matrix", {})
	if not matrix.has(stage_name):
		return {}
	return matrix[stage_name] as Dictionary

func _configure_parent_stage(stage_name: String) -> void:
	var data := _stage_data(stage_name)
	OS.set_environment("AURELIAN_VILLAGE_STATE", String(data.get("village_base", "claimed")))
	OS.set_environment("AURELIAN_MAP_STATE", String(data.get("map_base", "no_selection")))
	OS.set_environment("AURELIAN_WORLD_STATE", String(data.get("world_base", "neutral")))

func _make_camera(preset: String, parent: Node) -> Camera3D:
	var camera := super._make_camera(preset, parent)
	if PROGRESSION_VIEWS.has(preset):
		var sizes: Dictionary = _stage_data(progression_stage).get("camera_size", {})
		if sizes.has(preset):
			camera.size = float(sizes[preset])
	return camera

func _populate_world(parent: Node) -> Node3D:
	var basin := super._populate_world(parent)
	if basin == null:
		return null

	# This blockout deliberately replaces inherited semantic overlays with one stage-driven
	# composition layer while preserving the same physical Aurelian geography underneath.
	var inherited_map := parent.get_node_or_null("ProductionMapOverlays") as Node3D
	if inherited_map != null:
		inherited_map.visible = false
	var inherited_world := parent.get_node_or_null("ProductionWorldOverlays") as Node3D
	if inherited_world != null:
		inherited_world.visible = false

	var root := _build_blockout_overlays()
	parent.add_child(root)
	_apply_blockout_stage(root, progression_stage)
	_apply_blockout_view(root, progression_view)
	if parent == self:
		blockout_overlay_root = root
	return basin

func _material_alpha(color_value: String, emission_strength: float = 0.0) -> StandardMaterial3D:
	return _material(color_value, emission_strength)

func _add_disc(parent: Node3D, node_name: String, point: Vector2, radius: float, color_value: String, world_height: float, emission: float = 0.0, segments: int = 32) -> Node3D:
	var marker := Node3D.new()
	marker.name = node_name
	marker.position = topology_to_godot(point, world_height)
	var mesh_instance := MeshInstance3D.new()
	var mesh := CylinderMesh.new()
	mesh.top_radius = radius
	mesh.bottom_radius = radius
	mesh.height = 0.045
	mesh.radial_segments = segments
	mesh_instance.mesh = mesh
	mesh_instance.material_override = _material_alpha(color_value, emission)
	marker.add_child(mesh_instance)
	parent.add_child(marker)
	return marker

func _add_ring(parent: Node3D, node_name: String, point: Vector2, radius: float, color_value: String, world_height: float, emission: float = 0.0) -> Node3D:
	var marker := Node3D.new()
	marker.name = node_name
	marker.position = topology_to_godot(point, world_height)
	var mesh_instance := MeshInstance3D.new()
	var mesh := TorusMesh.new()
	mesh.inner_radius = radius * 0.78
	mesh.outer_radius = radius
	mesh.rings = 36
	mesh.ring_segments = 12
	mesh_instance.mesh = mesh
	mesh_instance.material_override = _material_alpha(color_value, emission)
	marker.add_child(mesh_instance)
	parent.add_child(marker)
	return marker

func _add_beacon(parent: Node3D, node_name: String, point: Vector2, radius: float, color_value: String, world_height: float, emission: float = 0.12) -> Node3D:
	var marker := Node3D.new()
	marker.name = node_name
	marker.position = topology_to_godot(point, world_height)
	var mesh_instance := MeshInstance3D.new()
	var mesh := CylinderMesh.new()
	mesh.top_radius = 0.0
	mesh.bottom_radius = radius
	mesh.height = radius * 2.4
	mesh.radial_segments = 10
	mesh_instance.mesh = mesh
	mesh_instance.position.y = radius * 0.9
	mesh_instance.material_override = _material_alpha(color_value, emission)
	marker.add_child(mesh_instance)
	parent.add_child(marker)
	return marker

func _add_route(parent: Node3D, node_name: String, from_point: Vector2, to_point: Vector2, width: float, color_value: String, world_height: float, emission: float = 0.0) -> MeshInstance3D:
	var from_position := topology_to_godot(from_point, world_height)
	var to_position := topology_to_godot(to_point, world_height)
	var delta := to_position - from_position
	var route := MeshInstance3D.new()
	route.name = node_name
	var mesh := BoxMesh.new()
	mesh.size = Vector3(width, 0.032, max(0.01, delta.length()))
	route.mesh = mesh
	route.position = (from_position + to_position) * 0.5
	route.rotation.y = atan2(delta.x, delta.z)
	route.material_override = _material_alpha(color_value, emission)
	parent.add_child(route)
	return route

func _add_standard(parent: Node3D, node_name: String, point: Vector2, color_value: String, world_height: float, scale_value: float = 1.0) -> Node3D:
	var standard := Node3D.new()
	standard.name = node_name
	standard.position = topology_to_godot(point, world_height)
	var pole := MeshInstance3D.new()
	var pole_mesh := CylinderMesh.new()
	pole_mesh.top_radius = 0.025 * scale_value
	pole_mesh.bottom_radius = 0.025 * scale_value
	pole_mesh.height = 0.72 * scale_value
	pole_mesh.radial_segments = 8
	pole.mesh = pole_mesh
	pole.position.y = 0.36 * scale_value
	pole.material_override = _material_alpha("#5e5140ff")
	standard.add_child(pole)
	var banner := MeshInstance3D.new()
	var banner_mesh := BoxMesh.new()
	banner_mesh.size = Vector3(0.30, 0.19, 0.035) * scale_value
	banner.mesh = banner_mesh
	banner.position = Vector3(0.14, 0.58, 0.0) * scale_value
	banner.material_override = _material_alpha(color_value, 0.14)
	standard.add_child(banner)
	parent.add_child(standard)
	return standard

func _build_blockout_overlays() -> Node3D:
	var root := Node3D.new()
	root.name = "FullProgressionBlockoutOverlays"
	for stage_name in PROGRESSION_STAGES:
		var stage_root := Node3D.new()
		stage_root.name = "Stage_%s" % stage_name
		var village_root := Node3D.new()
		village_root.name = "View_village"
		var map_root := Node3D.new()
		map_root.name = "View_map"
		var world_root := Node3D.new()
		world_root.name = "View_world"
		stage_root.add_child(village_root)
		stage_root.add_child(map_root)
		stage_root.add_child(world_root)
		_build_stage_cues(stage_name, village_root, map_root, world_root)
		root.add_child(stage_root)
	return root

func _build_stage_cues(stage_name: String, village_root: Node3D, map_root: Node3D, world_root: Node3D) -> void:
	match stage_name:
		"land":
			_build_land_cues(village_root, map_root, world_root)
		"settlement":
			_build_settlement_cues(village_root, map_root, world_root)
		"city":
			_build_city_cues(village_root, map_root, world_root)
		"nation":
			_build_nation_cues(village_root, map_root, world_root)
		"empire":
			_build_empire_cues(village_root, map_root, world_root)

func _build_land_cues(village_root: Node3D, map_root: Node3D, world_root: Node3D) -> void:
	_add_ring(village_root, "LandOriginHalo", Vector2(354, 285), 0.38, "#88ad75aa", 0.73, 0.04)
	_add_disc(map_root, "LandGreenvale", Vector2(354, 285), 0.28, "#4d9a5fdd", 0.75, 0.04, 6)
	_add_ring(map_root, "LandLocalScope", Vector2(354, 285), 0.72, "#8eb27a55", 0.72)
	_add_ring(world_root, "WorldLandOrigin", Vector2(500, 455), 1.65, "#d6b96f55", 0.34)
	_add_disc(world_root, "WorldLandCore", Vector2(500, 455), 0.32, "#d6b96f99", 0.36, 0.04, 6)

func _build_settlement_cues(village_root: Node3D, map_root: Node3D, world_root: Node3D) -> void:
	_add_route(village_root, "SettlementCrossingRoad", Vector2(354, 315), Vector2(515, 340), 0.10, "#9a846b99", 0.78)
	_add_route(village_root, "SettlementWorkRoad", Vector2(350, 330), Vector2(405, 505), 0.085, "#89755f88", 0.78)
	_add_ring(village_root, "SettlementGreen", Vector2(350, 330), 0.48, "#d8c27b55", 0.76)

	_add_disc(map_root, "SettlementGreenvale", Vector2(354, 285), 0.34, "#5ca467ee", 0.76, 0.06, 8)
	_add_ring(map_root, "SettlementLocalInfluence", Vector2(354, 285), 1.15, "#76a96d66", 0.73)
	_add_route(map_root, "SettlementCrossingLink", Vector2(354, 285), Vector2(515, 340), 0.08, "#d6b96f88", 0.76)

	_add_ring(world_root, "WorldSettlementScope", Vector2(500, 455), 2.10, "#d6b96f66", 0.34)
	_add_beacon(world_root, "WorldSettlementAnchor", Vector2(354, 285), 0.22, "#74ad70cc", 0.78, 0.08)

func _build_city_cues(village_root: Node3D, map_root: Node3D, world_root: Node3D) -> void:
	_add_disc(village_root, "CityCivicPlaza", Vector2(350, 285), 0.64, "#d6b96f44", 0.75)
	_add_ring(village_root, "CityCivicRing", Vector2(350, 285), 0.78, "#efcf7b99", 0.78, 0.08)
	_add_route(village_root, "CityCivicAvenueEast", Vector2(350, 285), Vector2(515, 340), 0.13, "#b5946e99", 0.79)
	_add_route(village_root, "CityCivicAvenueSouth", Vector2(350, 285), Vector2(405, 505), 0.11, "#a38869aa", 0.79)

	_add_disc(map_root, "CityGreenvale", Vector2(354, 285), 0.44, "#d6b96fdd", 0.78, 0.10, 10)
	_add_ring(map_root, "CityRegionalInfluence", Vector2(354, 285), 1.75, "#d6b96f66", 0.75)
	_add_disc(map_root, "CityGildedCrossing", Vector2(515, 340), 0.18, "#d8c070cc", 0.56, 0.04, 8)
	_add_route(map_root, "CityEastRoute", Vector2(354, 285), Vector2(760, 410), 0.09, "#62b7c8aa", 0.79, 0.04)

	_add_ring(world_root, "WorldCityScope", Vector2(500, 455), 2.85, "#d6b96f77", 0.35)
	_add_beacon(world_root, "WorldCityCapital", Vector2(354, 285), 0.28, "#dfbf67dd", 0.80, 0.10)
	_add_beacon(world_root, "WorldCityEastOpportunity", Vector2(850, 430), 0.20, "#62b7c8aa", 0.52, 0.08)
	_add_route(world_root, "WorldCityProjection", Vector2(500, 455), Vector2(850, 430), 0.08, "#62b7c877", 0.52)

func _build_nation_cues(village_root: Node3D, map_root: Node3D, world_root: Node3D) -> void:
	_add_ring(village_root, "NationCapitalRing", Vector2(350, 285), 0.92, "#efcf7baa", 0.80, 0.10)
	_add_standard(village_root, "NationStandardWest", Vector2(315, 290), "#d9b75fee", 0.80, 0.95)
	_add_standard(village_root, "NationStandardEast", Vector2(390, 292), "#d9b75fee", 0.80, 0.95)
	_add_standard(village_root, "NationStandardSouth", Vector2(352, 340), "#d9b75fee", 0.79, 0.90)
	_add_route(village_root, "NationCapitalAvenue", Vector2(350, 285), Vector2(515, 340), 0.15, "#c09c72aa", 0.80)

	_add_ring(map_root, "NationHomeland", Vector2(500, 455), 4.25, "#d6b96f77", 0.48, 0.04)
	_add_disc(map_root, "NationCapital", Vector2(354, 285), 0.48, "#d9b75fee", 0.80, 0.12, 10)
	_add_disc(map_root, "NationEastLand", Vector2(760, 410), 0.27, "#4d9a5fdd", 0.58, 0.05, 6)
	_add_route(map_root, "NationTradeNetwork", Vector2(354, 285), Vector2(760, 410), 0.11, "#62b7c8bb", 0.81, 0.06)
	_add_beacon(map_root, "NationNorthDirection", Vector2(700, 205), 0.17, "#7abf73aa", 0.67, 0.06)

	_add_ring(world_root, "WorldNationHomeland", Vector2(500, 455), 4.55, "#d6b96f88", 0.38, 0.04)
	_add_beacon(world_root, "WorldNationCapital", Vector2(354, 285), 0.30, "#dfbf67ee", 0.82, 0.12)
	_add_beacon(world_root, "WorldNationEast", Vector2(850, 430), 0.24, "#62b7c8bb", 0.54, 0.08)
	_add_beacon(world_root, "WorldNationNorth", Vector2(620, 80), 0.24, "#7abf73bb", 0.72, 0.08)
	_add_beacon(world_root, "WorldNationWest", Vector2(120, 500), 0.24, "#c9785dbb", 0.50, 0.08)
	_add_route(world_root, "WorldNationEastLink", Vector2(500, 455), Vector2(850, 430), 0.07, "#62b7c877", 0.54)
	_add_route(world_root, "WorldNationNorthLink", Vector2(500, 455), Vector2(620, 80), 0.07, "#7abf7377", 0.72)
	_add_route(world_root, "WorldNationWestLink", Vector2(500, 455), Vector2(120, 500), 0.07, "#c9785d77", 0.50)

func _build_empire_cues(village_root: Node3D, map_root: Node3D, world_root: Node3D) -> void:
	_add_disc(village_root, "EmpireCivicTerrace", Vector2(350, 285), 0.82, "#d6b96f55", 0.77, 0.04)
	_add_ring(village_root, "EmpireCapitalRing", Vector2(350, 285), 1.08, "#f0cf76dd", 0.82, 0.16)
	_add_standard(village_root, "EmpireStandardCenter", Vector2(350, 270), "#f0c85fff", 0.82, 1.35)
	_add_standard(village_root, "EmpireStandardWest", Vector2(305, 300), "#d6a84fff", 0.81, 1.05)
	_add_standard(village_root, "EmpireStandardEast", Vector2(405, 300), "#d6a84fff", 0.81, 1.05)
	_add_standard(village_root, "EmpireStandardSouthWest", Vector2(320, 345), "#d6a84fff", 0.80, 0.95)
	_add_standard(village_root, "EmpireStandardSouthEast", Vector2(390, 345), "#d6a84fff", 0.80, 0.95)
	_add_route(village_root, "EmpireGrandAvenue", Vector2(350, 285), Vector2(515, 340), 0.19, "#c6a178cc", 0.82, 0.03)
	_add_route(village_root, "EmpireWorkAxis", Vector2(350, 285), Vector2(405, 505), 0.14, "#aa8969aa", 0.81)

	_add_ring(map_root, "EmpireHeartland", Vector2(500, 455), 5.35, "#d6b96f99", 0.50, 0.05)
	_add_disc(map_root, "EmpireCapital", Vector2(354, 285), 0.54, "#f0c85fff", 0.83, 0.16, 10)
	_add_disc(map_root, "EmpireEastLand", Vector2(760, 410), 0.32, "#4d9a5fee", 0.59, 0.06, 6)
	_add_disc(map_root, "EmpireNorthRidgeLand", Vector2(700, 205), 0.34, "#4d9a5fee", 0.68, 0.06, 6)
	_add_route(map_root, "EmpireEastNetwork", Vector2(354, 285), Vector2(760, 410), 0.13, "#62b7c8cc", 0.83, 0.06)
	_add_route(map_root, "EmpireRidgeNetwork", Vector2(354, 285), Vector2(700, 205), 0.13, "#d6b96fbb", 0.83, 0.05)
	_add_beacon(map_root, "EmpireNorthgateFrontier", Vector2(445, 65), 0.20, "#ead99faa", 0.60, 0.06)
	_add_beacon(map_root, "EmpireSouthMarshFrontier", Vector2(365, 690), 0.20, "#55b9c8aa", 0.23, 0.06)

	_add_ring(world_root, "WorldEmpireInnerScope", Vector2(500, 455), 5.65, "#d6b96f99", 0.40, 0.05)
	_add_ring(world_root, "WorldEmpireOuterScope", Vector2(500, 455), 7.15, "#d6b96f44", 0.42)
	_add_beacon(world_root, "WorldEmpireCapital", Vector2(354, 285), 0.36, "#f0c85fff", 0.86, 0.18)
	_add_disc(world_root, "WorldEmpireNorthRidge", Vector2(700, 205), 0.30, "#4d9a5fee", 0.70, 0.06, 6)
	_add_route(world_root, "WorldEmpireRidgeLink", Vector2(354, 285), Vector2(700, 205), 0.10, "#d6b96fbb", 0.86, 0.04)
	_add_beacon(world_root, "WorldEmpireEast", Vector2(850, 430), 0.27, "#62b7c8cc", 0.56, 0.09)
	_add_beacon(world_root, "WorldEmpireNorth", Vector2(620, 80), 0.27, "#7abf73cc", 0.74, 0.09)
	_add_beacon(world_root, "WorldEmpireWest", Vector2(120, 500), 0.27, "#c9785dcc", 0.52, 0.09)
	_add_beacon(world_root, "WorldEmpireSouth", Vector2(365, 690), 0.24, "#55b9c8aa", 0.24, 0.06)
	_add_route(world_root, "WorldEmpireEastProjection", Vector2(500, 455), Vector2(850, 430), 0.08, "#62b7c888", 0.56)
	_add_route(world_root, "WorldEmpireNorthProjection", Vector2(500, 455), Vector2(620, 80), 0.08, "#7abf7388", 0.74)
	_add_route(world_root, "WorldEmpireWestProjection", Vector2(500, 455), Vector2(120, 500), 0.08, "#c9785d88", 0.52)
	_add_route(world_root, "WorldEmpireSouthProjection", Vector2(500, 455), Vector2(365, 690), 0.07, "#55b9c877", 0.24)

func _apply_blockout_stage(root: Node3D, stage_name: String) -> void:
	for child in root.get_children():
		if child is Node3D:
			(child as Node3D).visible = child.name == "Stage_%s" % stage_name

func _apply_blockout_view(root: Node3D, view_name: String) -> void:
	var stage_root := root.get_node_or_null("Stage_%s" % progression_stage) as Node3D
	if stage_root == null:
		return
	for child in stage_root.get_children():
		if child is Node3D:
			(child as Node3D).visible = child.name == "View_%s" % view_name

func _apply_runtime_stage(stage_name: String) -> void:
	progression_stage = stage_name
	var data := _stage_data(stage_name)
	if main_basin != null:
		_apply_village_state(main_basin, String(data.get("village_base", "claimed")))
	if main_overlay_root != null:
		_apply_map_state(main_overlay_root, String(data.get("map_base", "no_selection")))
		main_overlay_root.visible = false
	if main_world_overlay_root != null:
		_apply_world_state(main_world_overlay_root, String(data.get("world_base", "neutral")))
		main_world_overlay_root.visible = false
	if blockout_overlay_root != null:
		_apply_blockout_stage(blockout_overlay_root, stage_name)
		_apply_blockout_view(blockout_overlay_root, progression_view)
	_apply_runtime_view(progression_view)
	print("FULL_PROGRESSION_STAGE=%s" % progression_stage)

func _apply_runtime_view(view_name: String) -> void:
	progression_view = view_name
	if blockout_overlay_root != null:
		_apply_blockout_view(blockout_overlay_root, view_name)
	if cameras.has(view_name):
		_activate_camera(view_name)
		var sizes: Dictionary = _stage_data(progression_stage).get("camera_size", {})
		if sizes.has(view_name):
			(cameras[view_name] as Camera3D).size = float(sizes[view_name])
	print("FULL_PROGRESSION_VIEW=%s" % progression_view)

func _advance_stage() -> void:
	var index := PROGRESSION_STAGES.find(progression_stage)
	if index < 0:
		return
	if index < PROGRESSION_STAGES.size() - 1:
		_apply_runtime_stage(PROGRESSION_STAGES[index + 1])
	else:
		print("FULL_PROGRESSION_STAGE_COMPLETE=empire")

func _cycle_view(direction: int) -> void:
	var index := PROGRESSION_VIEWS.find(progression_view)
	if index < 0:
		return
	var next_index := posmod(index + direction, PROGRESSION_VIEWS.size())
	_apply_runtime_view(PROGRESSION_VIEWS[next_index])

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_accept"):
		_advance_stage()
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_right"):
		_cycle_view(1)
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_left"):
		_cycle_view(-1)
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_cancel"):
		print("FULL_PROGRESSION_INPUT_SEQUENCE_COMPLETE=%s:%s" % [progression_stage, progression_view])
		get_tree().quit(0)
