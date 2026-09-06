extends "res://scenes/aurelian/production_world_v1.gd"

const VISUAL_GRAMMAR_MANIFEST_PATH := "res://scenes/aurelian/full_progression_visual_grammar_v2_manifest.json"
const V2_STAGES := ["land", "settlement", "city", "nation", "empire"]

var visual_grammar_contract: Dictionary = {}
var v2_stage := "land"

func _ready() -> void:
	visual_grammar_contract = _load_visual_grammar_contract()
	if visual_grammar_contract.is_empty():
		get_tree().quit(231)
		return

	var requested_stage := OS.get_environment("AURELIAN_PROGRESSION_STAGE").to_lower()
	if not requested_stage.is_empty():
		v2_stage = requested_stage
	if not V2_STAGES.has(v2_stage):
		push_error("FULL_PROGRESSION_V2_UNKNOWN_STAGE: %s" % v2_stage)
		get_tree().quit(232)
		return

	_configure_parent_states(v2_stage)
	OS.set_environment("AURELIAN_CAPTURE_VILLAGE_SEQUENCE", "0")
	OS.set_environment("AURELIAN_CAPTURE_MAP_SEQUENCE", "0")
	OS.set_environment("AURELIAN_CAPTURE_WORLD_SEQUENCE", "0")
	super()
	print("FULL_PROGRESSION_VISUAL_GRAMMAR_V2_READY=%s" % v2_stage)

func _load_visual_grammar_contract() -> Dictionary:
	var file := FileAccess.open(VISUAL_GRAMMAR_MANIFEST_PATH, FileAccess.READ)
	if file == null:
		push_error("FULL_PROGRESSION_V2_MANIFEST_MISSING")
		return {}
	var payload = JSON.parse_string(file.get_as_text())
	if not payload is Dictionary:
		push_error("FULL_PROGRESSION_V2_MANIFEST_INVALID")
		return {}
	var contract := payload as Dictionary
	if String(contract.get("contract", "")) != "AURELIAN_FULL_PROGRESSION_VISUAL_GRAMMAR_V2":
		push_error("FULL_PROGRESSION_V2_CONTRACT_INVALID")
		return {}
	if contract.get("stages", []) != V2_STAGES:
		push_error("FULL_PROGRESSION_V2_STAGE_ORDER_INVALID")
		return {}
	return contract

func _configure_parent_states(stage_name: String) -> void:
	var bases: Dictionary = visual_grammar_contract.get("base_village_states", {})
	OS.set_environment("AURELIAN_VILLAGE_STATE", String(bases.get(stage_name, "claimed")))
	OS.set_environment("AURELIAN_MAP_STATE", "no_selection")
	OS.set_environment("AURELIAN_WORLD_STATE", "neutral")

func _populate_world(parent: Node) -> Node3D:
	var basin := super._populate_world(parent)
	if basin == null:
		return null

	# Gate A is intentionally physical-world-first. Inherited Map/World overlays are not
	# allowed to carry Village stage recognition.
	var inherited_map := parent.get_node_or_null("ProductionMapOverlays") as Node3D
	if inherited_map != null:
		inherited_map.visible = false
	var inherited_world := parent.get_node_or_null("ProductionWorldOverlays") as Node3D
	if inherited_world != null:
		inherited_world.visible = false

	var grammar_root := Node3D.new()
	grammar_root.name = "FullProgressionVisualGrammarV2_%s" % v2_stage
	parent.add_child(grammar_root)
	_build_physical_stage(basin, grammar_root, v2_stage)
	return basin

func _build_physical_stage(basin: Node3D, root: Node3D, stage_name: String) -> void:
	match stage_name:
		"land":
			_build_land(root)
		"settlement":
			_build_settlement(basin, root)
		"city":
			_build_city(basin, root)
		"nation":
			_build_nation(basin, root)
		"empire":
			_build_empire(basin, root)

func _physical_material(color_value: String) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = Color(color_value)
	material.roughness = 0.88
	material.metallic = 0.0
	return material

func _add_building_clone(
	basin: Node3D,
	source_name: String,
	clone_name: String,
	point: Vector2,
	scale_multiplier: float,
	rotation_y_delta: float
) -> Node3D:
	var source := basin.find_child(source_name, true, false) as Node3D
	if source == null:
		push_error("FULL_PROGRESSION_V2_SOURCE_MISSING: %s" % source_name)
		return null
	var clone := source.duplicate() as Node3D
	if clone == null:
		push_error("FULL_PROGRESSION_V2_CLONE_FAILED: %s" % clone_name)
		return null
	clone.name = clone_name
	clone.visible = true
	clone.scale = source.scale * Vector3(scale_multiplier, scale_multiplier, scale_multiplier)
	clone.rotation_degrees.y += rotation_y_delta
	var target := topology_to_godot(point, 0.0)
	clone.position = Vector3(target.x, source.position.y, target.z)
	source.get_parent().add_child(clone)
	return clone

func _add_road(
	root: Node3D,
	node_name: String,
	from_point: Vector2,
	to_point: Vector2,
	width: float,
	color_value: String = "#927b5fff",
	height: float = 0.035,
	world_height: float = 0.77
) -> MeshInstance3D:
	var start := topology_to_godot(from_point, world_height)
	var finish := topology_to_godot(to_point, world_height)
	var delta := finish - start
	var route := MeshInstance3D.new()
	route.name = node_name
	var mesh := BoxMesh.new()
	mesh.size = Vector3(width, height, max(0.01, delta.length()))
	route.mesh = mesh
	route.position = (start + finish) * 0.5
	route.rotation.y = atan2(delta.x, delta.z)
	route.material_override = _physical_material(color_value)
	root.add_child(route)
	return route

func _add_plaza(
	root: Node3D,
	node_name: String,
	point: Vector2,
	radius: float,
	color_value: String = "#b59a70ff",
	world_height: float = 0.775
) -> MeshInstance3D:
	var plaza := MeshInstance3D.new()
	plaza.name = node_name
	var mesh := CylinderMesh.new()
	mesh.top_radius = radius
	mesh.bottom_radius = radius
	mesh.height = 0.035
	mesh.radial_segments = 32
	plaza.mesh = mesh
	plaza.position = topology_to_godot(point, world_height)
	plaza.material_override = _physical_material(color_value)
	root.add_child(plaza)
	return plaza

func _add_standard(
	root: Node3D,
	node_name: String,
	point: Vector2,
	color_value: String,
	scale_value: float = 1.0,
	world_height: float = 0.78
) -> Node3D:
	var standard := Node3D.new()
	standard.name = node_name
	standard.position = topology_to_godot(point, world_height)

	var pole := MeshInstance3D.new()
	var pole_mesh := CylinderMesh.new()
	pole_mesh.top_radius = 0.025 * scale_value
	pole_mesh.bottom_radius = 0.025 * scale_value
	pole_mesh.height = 0.78 * scale_value
	pole_mesh.radial_segments = 8
	pole.mesh = pole_mesh
	pole.position.y = 0.39 * scale_value
	pole.material_override = _physical_material("#4f4234ff")
	standard.add_child(pole)

	var banner := MeshInstance3D.new()
	var banner_mesh := BoxMesh.new()
	banner_mesh.size = Vector3(0.34, 0.22, 0.035) * scale_value
	banner.mesh = banner_mesh
	banner.position = Vector3(0.16, 0.62, 0.0) * scale_value
	banner.material_override = _physical_material(color_value)
	standard.add_child(banner)
	root.add_child(standard)
	return standard

func _add_wall_segment(
	root: Node3D,
	node_name: String,
	from_point: Vector2,
	to_point: Vector2,
	width: float = 0.10,
	height: float = 0.24,
	world_height: float = 0.79
) -> MeshInstance3D:
	return _add_road(root, node_name, from_point, to_point, width, "#756957ff", height, world_height)

func _build_land(_root: Node3D) -> void:
	# Deliberately no extra urban geometry. The accepted claimed state supplies the lone flag.
	pass

func _build_settlement(basin: Node3D, root: Node3D) -> void:
	_add_road(root, "SettlementCrossingPath", Vector2(285, 332), Vector2(475, 320), 0.055, "#8d765eff")
	_add_road(root, "SettlementFieldsPath", Vector2(350, 332), Vector2(405, 470), 0.045, "#846e58ff")
	_add_plaza(root, "SettlementVillageGreen", Vector2(350, 330), 0.28, "#9f9c6aff")
	_add_building_clone(basin, "Greenvale_blacksmith", "SettlementCottageNorthWest", Vector2(285, 235), 0.46, -28.0)
	_add_building_clone(basin, "Greenvale_barracks", "SettlementCottageSouthEast", Vector2(430, 365), 0.43, 18.0)
	_add_building_clone(basin, "Greenvale_blacksmith", "SettlementWorkshopFields", Vector2(365, 430), 0.42, 31.0)

func _build_city(basin: Node3D, root: Node3D) -> void:
	_add_plaza(root, "CityCivicSquare", Vector2(350, 292), 0.46, "#b49a72ff")
	_add_road(root, "CityAvenueEast", Vector2(245, 300), Vector2(500, 320), 0.085)
	_add_road(root, "CityAvenueSouth", Vector2(350, 205), Vector2(360, 455), 0.075)
	_add_road(root, "CityWestLane", Vector2(245, 225), Vector2(285, 385), 0.055)

	var specs := [
		["Greenvale_blacksmith", "CityNW1", Vector2(235, 225), 0.50, -14.0],
		["Greenvale_barracks", "CityNW2", Vector2(265, 205), 0.49, 18.0],
		["Greenvale_blacksmith", "CityNW3", Vector2(300, 195), 0.46, 32.0],
		["Greenvale_barracks", "CitySW1", Vector2(235, 335), 0.50, -21.0],
		["Greenvale_blacksmith", "CitySW2", Vector2(270, 365), 0.47, 12.0],
		["Greenvale_barracks", "CitySW3", Vector2(305, 392), 0.48, 27.0],
		["Greenvale_blacksmith", "CityE1", Vector2(445, 205), 0.48, -30.0],
		["Greenvale_barracks", "CityE2", Vector2(475, 235), 0.49, 15.0],
		["Greenvale_blacksmith", "CityE3", Vector2(468, 375), 0.46, 24.0],
		["Greenvale_barracks", "CityE4", Vector2(430, 405), 0.48, -18.0]
	]
	for spec in specs:
		_add_building_clone(basin, String(spec[0]), String(spec[1]), spec[2], float(spec[3]), float(spec[4]))

func _build_nation(basin: Node3D, root: Node3D) -> void:
	_build_city(basin, root)
	_add_plaza(root, "CapitalCeremonialCourt", Vector2(350, 218), 0.62, "#c4a66fff")
	_add_road(root, "CapitalCeremonialAxis", Vector2(350, 150), Vector2(350, 335), 0.12, "#a88963ff")
	_add_road(root, "CapitalCrossAxis", Vector2(250, 225), Vector2(455, 225), 0.085, "#a88963ff")

	_add_building_clone(basin, "Greenvale_church", "CapitalSeat", Vector2(350, 196), 1.18, 0.0)
	_add_building_clone(basin, "Greenvale_barracks", "CapitalWingWest", Vector2(310, 220), 0.82, -8.0)
	_add_building_clone(basin, "Greenvale_barracks", "CapitalWingEast", Vector2(392, 220), 0.82, 8.0)
	_add_building_clone(basin, "Greenvale_church", "CapitalTowerWest", Vector2(278, 188), 0.68, -14.0)
	_add_building_clone(basin, "Greenvale_church", "CapitalTowerEast", Vector2(425, 190), 0.68, 14.0)
	_add_building_clone(basin, "Greenvale_blacksmith", "CapitalQuarterNorthWest", Vector2(235, 180), 0.52, 22.0)
	_add_building_clone(basin, "Greenvale_barracks", "CapitalQuarterNorthEast", Vector2(470, 180), 0.52, -22.0)
	_add_building_clone(basin, "Greenvale_blacksmith", "CapitalQuarterSouth", Vector2(350, 440), 0.50, 6.0)

	_add_standard(root, "CapitalStandardWest", Vector2(322, 248), "#d8b75bff", 1.05)
	_add_standard(root, "CapitalStandardEast", Vector2(378, 248), "#d8b75bff", 1.05)
	_add_standard(root, "CapitalStandardAxis", Vector2(350, 270), "#d8b75bff", 1.15)

func _build_empire(basin: Node3D, root: Node3D) -> void:
	_build_nation(basin, root)
	_add_plaza(root, "ImperialForum", Vector2(350, 178), 0.82, "#ccb27cff")
	_add_road(root, "ImperialGrandAxis", Vector2(350, 105), Vector2(350, 455), 0.15, "#aa8d65ff")
	_add_road(root, "ImperialEastWestAxis", Vector2(205, 205), Vector2(505, 205), 0.11, "#aa8d65ff")

	# Unmistakable seat-of-power silhouette built from the accepted medieval asset envelope.
	_add_building_clone(basin, "Greenvale_church", "ImperialSeatCentral", Vector2(350, 155), 1.78, 0.0)
	_add_building_clone(basin, "Greenvale_church", "ImperialSeatTowerWest", Vector2(305, 165), 1.25, -8.0)
	_add_building_clone(basin, "Greenvale_church", "ImperialSeatTowerEast", Vector2(397, 165), 1.25, 8.0)
	_add_building_clone(basin, "Greenvale_barracks", "ImperialPalaceWest", Vector2(275, 195), 1.08, -10.0)
	_add_building_clone(basin, "Greenvale_barracks", "ImperialPalaceEast", Vector2(430, 195), 1.08, 10.0)

	var outer_specs := [
		["Greenvale_blacksmith", "ImperialOuterNW1", Vector2(205, 165), 0.54, -18.0],
		["Greenvale_barracks", "ImperialOuterNW2", Vector2(225, 205), 0.55, 12.0],
		["Greenvale_blacksmith", "ImperialOuterW", Vector2(205, 285), 0.54, 28.0],
		["Greenvale_barracks", "ImperialOuterSW", Vector2(220, 410), 0.56, -12.0],
		["Greenvale_blacksmith", "ImperialOuterS1", Vector2(300, 455), 0.53, 18.0],
		["Greenvale_barracks", "ImperialOuterS2", Vector2(405, 455), 0.56, -18.0],
		["Greenvale_blacksmith", "ImperialOuterSE", Vector2(495, 405), 0.54, 14.0],
		["Greenvale_barracks", "ImperialOuterE", Vector2(505, 300), 0.55, -22.0],
		["Greenvale_blacksmith", "ImperialOuterNE1", Vector2(495, 195), 0.53, 20.0],
		["Greenvale_barracks", "ImperialOuterNE2", Vector2(475, 155), 0.55, -12.0],
		["Greenvale_blacksmith", "ImperialSouthGateWest", Vector2(315, 420), 0.52, -5.0],
		["Greenvale_barracks", "ImperialSouthGateEast", Vector2(390, 420), 0.54, 5.0]
	]
	for spec in outer_specs:
		_add_building_clone(basin, String(spec[0]), String(spec[1]), spec[2], float(spec[3]), float(spec[4]))

	_add_wall_segment(root, "ImperialWallNorth", Vector2(235, 125), Vector2(465, 125))
	_add_wall_segment(root, "ImperialWallWest", Vector2(225, 130), Vector2(205, 360))
	_add_wall_segment(root, "ImperialWallEast", Vector2(475, 130), Vector2(500, 360))
	_add_wall_segment(root, "ImperialWallSouthWest", Vector2(205, 360), Vector2(315, 440))
	_add_wall_segment(root, "ImperialWallSouthEast", Vector2(390, 440), Vector2(500, 360))

	for index in range(6):
		var x := 285.0 + float(index) * 26.0
		_add_standard(root, "ImperialStandard%02d" % index, Vector2(x, 245), "#e0bd55ff", 1.18)
