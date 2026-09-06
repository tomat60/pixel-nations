extends "res://scenes/aurelian/full_progression_visual_grammar_v2_gate_b.gd"

# Gate C1 deliberately preserves the accepted v2 progression semantics while
# replacing late-stage accumulation with a single visual hierarchy per view.
# Land / Settlement / City remain inherited and unchanged.

func _build_nation(basin: Node3D, root: Node3D) -> void:
	# Start from the accepted City footprint, then add one capital hierarchy.
	# Do not carry every previous national accent forward as equal-strength noise.
	_build_city(basin, root)
	_add_plaza(root, "ClarityNationCeremonialCourt", Vector2(350, 212), 0.60, "#b99e70ff")
	_add_road(root, "ClarityNationCeremonialAxis", Vector2(350, 150), Vector2(350, 325), 0.105, "#9d825fff")

	_add_building_clone(basin, "Greenvale_church", "ClarityNationSeat", Vector2(350, 190), 1.24, 0.0)
	_add_building_clone(basin, "Greenvale_barracks", "ClarityNationWingWest", Vector2(305, 218), 0.82, -8.0)
	_add_building_clone(basin, "Greenvale_barracks", "ClarityNationWingEast", Vector2(398, 218), 0.82, 8.0)
	_add_building_clone(basin, "Greenvale_blacksmith", "ClarityNationSouthQuarter", Vector2(350, 432), 0.50, 6.0)

	_add_standard(root, "ClarityNationStandardWest", Vector2(326, 250), "#d2b15aff", 1.02)
	_add_standard(root, "ClarityNationStandardEast", Vector2(374, 250), "#d2b15aff", 1.02)

func _build_empire(basin: Node3D, root: Node3D) -> void:
	# Empire is composed directly from City rather than Nation. This prevents the
	# old City -> Nation -> Empire additive stack from becoming visual clutter.
	_build_city(basin, root)
	_add_plaza(root, "ClarityImperialForum", Vector2(350, 174), 0.78, "#c7ae7cff")
	_add_road(root, "ClarityImperialGrandAxis", Vector2(350, 105), Vector2(350, 450), 0.135, "#a48862ff")
	_add_road(root, "ClarityImperialCrossAxis", Vector2(220, 205), Vector2(485, 205), 0.095, "#9d825fff")

	# One dominant seat-of-power cluster.
	_add_building_clone(basin, "Greenvale_church", "ClarityImperialSeat", Vector2(350, 150), 1.82, 0.0)
	_add_building_clone(basin, "Greenvale_church", "ClarityImperialTowerWest", Vector2(304, 164), 1.20, -8.0)
	_add_building_clone(basin, "Greenvale_church", "ClarityImperialTowerEast", Vector2(398, 164), 1.20, 8.0)
	_add_building_clone(basin, "Greenvale_barracks", "ClarityImperialWingWest", Vector2(272, 198), 1.02, -10.0)
	_add_building_clone(basin, "Greenvale_barracks", "ClarityImperialWingEast", Vector2(432, 198), 1.02, 10.0)

	# Four district anchors are enough to show imperial footprint without the old
	# twelve-building outer ring.
	_add_building_clone(basin, "Greenvale_blacksmith", "ClarityImperialDistrictWest", Vector2(215, 305), 0.56, 22.0)
	_add_building_clone(basin, "Greenvale_barracks", "ClarityImperialDistrictEast", Vector2(492, 305), 0.58, -18.0)
	_add_building_clone(basin, "Greenvale_blacksmith", "ClarityImperialDistrictSouthWest", Vector2(285, 438), 0.54, 14.0)
	_add_building_clone(basin, "Greenvale_barracks", "ClarityImperialDistrictSouthEast", Vector2(420, 438), 0.56, -14.0)

	_add_wall_segment(root, "ClarityImperialWallNorth", Vector2(245, 122), Vector2(458, 122), 0.09, 0.20)
	_add_wall_segment(root, "ClarityImperialWallWest", Vector2(240, 128), Vector2(215, 360), 0.09, 0.20)
	_add_wall_segment(root, "ClarityImperialWallEast", Vector2(463, 128), Vector2(490, 360), 0.09, 0.20)
	_add_wall_segment(root, "ClarityImperialWallSouth", Vector2(250, 390), Vector2(455, 390), 0.09, 0.20)

	_add_standard(root, "ClarityImperialStandardWest", Vector2(325, 246), "#dfba52ff", 1.12)
	_add_standard(root, "ClarityImperialStandardCenter", Vector2(350, 260), "#e5bf50ff", 1.22)
	_add_standard(root, "ClarityImperialStandardEast", Vector2(375, 246), "#dfba52ff", 1.12)

func _build_map_stage(root: Node3D, stage_name: String) -> void:
	if stage_name != "nation" and stage_name != "empire":
		super(root, stage_name)
		return

	var greenvale := Vector2(354, 285)
	var gilded := Vector2(515, 340)
	var ridge := Vector2(700, 205)
	var fields := Vector2(405, 505)
	var forest := Vector2(245, 205)

	if stage_name == "nation":
		var homeland: Array[Vector2] = [
			Vector2(175, 145), Vector2(490, 105), Vector2(760, 150),
			Vector2(790, 385), Vector2(555, 555), Vector2(245, 520), Vector2(145, 330)
		]
		# One boundary, one primary spine, one subordinate branch.
		_add_boundary_polyline(root, "ClarityMapNationHomeland", homeland, true, "#8d7a55ff", 0.070, 0.070, 0.86)
		_add_network(root, "ClarityMapNationSpine", [greenvale, gilded, ridge], "#ae8b5dff", 0.110, 0.87)
		_add_network(root, "ClarityMapNationFieldsBranch", [greenvale, fields], "#806f59ff", 0.060, 0.865)
		_add_standard(root, "ClarityMapNationCapital", greenvale, "#d5ad54ff", 1.78, 0.86)
		_add_standard(root, "ClarityMapNationRidgeSeat", ridge, "#b9955aff", 1.18, 0.86)
		return

	var imperial_extent: Array[Vector2] = [
		Vector2(105, 95), Vector2(430, 48), Vector2(760, 92),
		Vector2(860, 300), Vector2(750, 565), Vector2(525, 650),
		Vector2(250, 610), Vector2(85, 430)
	]
	# Empire does not inherit the Nation boundary. Its single larger boundary and
	# two weighted axes carry the scale change.
	_add_boundary_polyline(root, "ClarityMapEmpireExtent", imperial_extent, true, "#9d8154ff", 0.082, 0.085, 0.90)
	_add_network(root, "ClarityMapEmpirePrimarySpine", [forest, greenvale, gilded, ridge], "#bd955dff", 0.125, 0.91)
	_add_network(root, "ClarityMapEmpireSouthBranch", [greenvale, fields], "#806e58ff", 0.065, 0.905)
	_add_standard(root, "ClarityMapEmpireCapital", greenvale, "#e1b74fff", 2.10, 0.90)
	_add_standard(root, "ClarityMapEmpireRidgeProvince", ridge, "#c39b59ff", 1.38, 0.90)
	_add_standard(root, "ClarityMapEmpireFieldsProvince", fields, "#aa8f61ff", 1.05, 0.90)

func _build_world_stage(basin: Node3D, root: Node3D, stage_name: String) -> void:
	if stage_name != "nation" and stage_name != "empire":
		super(basin, root, stage_name)
		return

	var greenvale := Vector2(354, 285)
	var gilded := Vector2(515, 340)
	var ridge := Vector2(700, 205)
	var fields := Vector2(405, 505)
	var forest := Vector2(245, 205)
	var south := Vector2(365, 690)
	var northgate := Vector2(445, 65)

	if stage_name == "nation":
		var nation_extent: Array[Vector2] = [
			Vector2(155, 125), Vector2(450, 80), Vector2(760, 125),
			Vector2(820, 390), Vector2(590, 575), Vector2(245, 555), Vector2(115, 350)
		]
		_add_boundary_polyline(root, "ClarityWorldNationExtent", nation_extent, true, "#746748ff", 0.065, 0.070, 0.99)
		_add_network(root, "ClarityWorldNationSpine", [forest, greenvale, gilded, ridge], "#ad895aff", 0.120, 1.00)
		_add_network(root, "ClarityWorldNationSouthBranch", [greenvale, fields], "#786b57ff", 0.065, 0.995)
		_add_standard(root, "ClarityWorldNationCapital", greenvale, "#d6ad50ff", 2.12, 0.99)
		_add_standard(root, "ClarityWorldNationRidge", ridge, "#b89458ff", 1.28, 0.99)
		_add_building_clone(basin, "Greenvale_barracks", "ClarityWorldNationRidgeSeat", ridge, 1.06, -12.0)
		_add_building_clone(basin, "Greenvale_blacksmith", "ClarityWorldNationCrossingSeat", gilded, 0.86, 18.0)
		return

	var empire_extent: Array[Vector2] = [
		Vector2(70, 65), Vector2(390, 28), Vector2(760, 58),
		Vector2(910, 285), Vector2(825, 585), Vector2(585, 760),
		Vector2(245, 735), Vector2(55, 470)
	]
	_add_boundary_polyline(root, "ClarityWorldEmpireExtent", empire_extent, true, "#856c45ff", 0.075, 0.080, 1.04)
	_add_network(root, "ClarityWorldEmpirePrimarySpine", [forest, greenvale, gilded, ridge], "#bf975cff", 0.135, 1.05)
	_add_network(root, "ClarityWorldEmpireFrontierAxis", [northgate, greenvale, south], "#7d6651ff", 0.075, 1.045)
	_add_standard(root, "ClarityWorldEmpireCapital", greenvale, "#e4b849ff", 2.62, 1.04)
	_add_standard(root, "ClarityWorldEmpireRidge", ridge, "#c59d59ff", 1.56, 1.04)
	_add_standard(root, "ClarityWorldEmpireNorthgate", northgate, "#a98b5fff", 1.12, 1.04)
	_add_standard(root, "ClarityWorldEmpireSouth", south, "#a98b5fff", 1.08, 1.04)
	_add_building_clone(basin, "Greenvale_church", "ClarityWorldEmpireNorthCitadel", northgate, 1.42, -8.0)
	_add_building_clone(basin, "Greenvale_barracks", "ClarityWorldEmpireRidgeCitadel", ridge, 1.34, 14.0)
	_add_building_clone(basin, "Greenvale_barracks", "ClarityWorldEmpireSouthCitadel", south, 1.26, -18.0)
