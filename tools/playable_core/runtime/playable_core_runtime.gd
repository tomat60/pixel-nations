class_name PixelNationsPlayableCore
extends Node

const WorldScene = preload("res://game/main_game.tscn")
const VillageScene = preload("res://village/scenes/approved.tscn")
const Controller = preload("res://pixel_nations/core/playable_core_controller.gd")

const MAP_WIDTH := 960.0
const MAP_HEIGHT := 900.0
const WORLD_LEFT := -133.333333
const WORLD_TOP := -125.0
const WORLD_WIDTH := 266.666666
const WORLD_HEIGHT := 250.0

var controller: Node
var world: Node3D
var village: Node
var village_paved_road: Node3D
var frontier_link: MeshInstance3D
var frontier_link_material: StandardMaterial3D
var highmere_survey_link: MeshInstance3D
var highmere_survey_material: StandardMaterial3D
var northgate_scout_link: MeshInstance3D
var northgate_scout_material: StandardMaterial3D
var atlas_root: Node3D
var land_materials: Dictionary = {}
var land_labels: Dictionary = {}
var lands: Array = []
var selected_land: Dictionary = {}
var ui_layer: CanvasLayer
var panel: PanelContainer
var title_label: Label
var identity_label: Label
var detail_label: Label
var goal_label: Label
var claim_button: Button
var enter_button: Button
var inspect_button: Button
var connect_button: Button
var road_button: Button
var supply_button: Button
var survey_button: Button
var save_button: Button
var return_button: Button


func _ready() -> void:
	_load_lands()
	controller = Controller.new()
	controller.name = "PlayableCoreController"
	add_child(controller)
	controller.snapshot_changed.connect(_render_snapshot)
	controller.view_changed.connect(_on_view_changed)
	world = WorldScene.instantiate()
	world.name = "OpenGSWorld"
	add_child(world)
	for donor_ui_name in ["MapModes", "ProvinceSelected"]:
		var donor_ui := world.get_node_or_null(donor_ui_name)
		if donor_ui is CanvasLayer:
			donor_ui.visible = false
		elif donor_ui is CanvasItem:
			donor_ui.hide()
	var player := world.get_node("Player")
	var donor_handler := Callable(world, "_on_player_province_selected")
	if player.province_selected.is_connected(donor_handler):
		player.province_selected.disconnect(donor_handler)
	player.province_selected.connect(_on_world_position_selected)
	player.position = Vector3(-35.0, 0.0, -46.0)
	player.camera.position.z = 250.0
	_build_a01_atlas()
	_build_frontier_link()
	_build_highmere_survey_link()
	_build_northgate_scout_link()
	_build_ui()
	if not controller.load_game():
		_render_snapshot(controller.current_snapshot())
	print("PN_PLAYABLE_RUNTIME_READY=PASS")


func _load_lands() -> void:
	var file := FileAccess.open("res://pixel_nations/a01_lands.json", FileAccess.READ)
	if file == null:
		push_error("PN_A01_LANDS_MISSING")
		return
	var parsed = JSON.parse_string(file.get_as_text())
	if parsed is Dictionary:
		lands = parsed.get("lands", [])
	if lands.size() != 30:
		push_error("PN_A01_LAND_COUNT_INVALID")


func _build_a01_atlas() -> void:
	var donor_surface := world.get_node_or_null("Map/MeshInstance3D") as MeshInstance3D
	if donor_surface != null:
		donor_surface.visible = false
	var donor_country_labels := world.get_node_or_null("Map/CountryLabels3D")
	if donor_country_labels is Node3D:
		(donor_country_labels as Node3D).visible = false
	atlas_root = Node3D.new()
	atlas_root.name = "CanonicalA01Atlas"
	world.add_child(atlas_root)
	var substrate := MeshInstance3D.new()
	substrate.name = "FictionalAurelianSubstrate"
	var substrate_mesh := PlaneMesh.new()
	substrate_mesh.size = Vector2(500.0, 250.0)
	var substrate_material := StandardMaterial3D.new()
	substrate_material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	substrate_material.albedo_texture = load("res://pixel_nations/a01_atlas_substrate.svg")
	substrate_material.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	substrate_mesh.material = substrate_material
	substrate.mesh = substrate_mesh
	substrate.position.y = 0.04
	atlas_root.add_child(substrate)
	for land_value in lands:
		_build_land_polygon(land_value as Dictionary)
	_build_land_label("PN-A01-001", "GREENVALE\nHOME", Color("dbe9ff"))
	_build_land_label("PN-A01-002", "RIVERBEND", Color("d6ffff"))
	_build_land_label("PN-A01-003", "HIGHMERE", Color("f2ead2"))
	_build_land_label("PN-A01-024", "NORTHGATE", Color("e3f1df"))


func _build_land_polygon(land: Dictionary) -> void:
	var points := PackedVector2Array()
	for raw_point in land.get("points", []):
		points.append(Vector2(float(raw_point[0]), float(raw_point[1])))
	var triangles := Geometry2D.triangulate_polygon(points)
	if triangles.is_empty():
		push_error("PN_A01_POLYGON_INVALID_%s" % String(land.get("id", "")))
		return
	var surface := SurfaceTool.new()
	surface.begin(Mesh.PRIMITIVE_TRIANGLES)
	for index in triangles:
		var point := points[int(index)]
		surface.add_vertex(Vector3(
			WORLD_LEFT + point.x / MAP_WIDTH * WORLD_WIDTH,
			0.18,
			WORLD_TOP + point.y / MAP_HEIGHT * WORLD_HEIGHT
		))
	var mesh := surface.commit()
	var material := StandardMaterial3D.new()
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	material.albedo_color = _terrain_color(String(land.get("terrain", "grassland")))
	material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	material.cull_mode = BaseMaterial3D.CULL_DISABLED
	mesh.surface_set_material(0, material)
	var polygon := MeshInstance3D.new()
	polygon.name = String(land.get("id", "Land")).replace("-", "_")
	polygon.mesh = mesh
	atlas_root.add_child(polygon)
	land_materials[String(land.get("id", ""))] = material
	var outline_material := StandardMaterial3D.new()
	outline_material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	outline_material.albedo_color = Color(0.82, 0.79, 0.61, 0.92)
	outline_material.no_depth_test = true
	var outline_mesh := ImmediateMesh.new()
	outline_mesh.surface_begin(Mesh.PRIMITIVE_LINE_STRIP, outline_material)
	for point in points:
		outline_mesh.surface_add_vertex(Vector3(
			WORLD_LEFT + point.x / MAP_WIDTH * WORLD_WIDTH,
			0.30,
			WORLD_TOP + point.y / MAP_HEIGHT * WORLD_HEIGHT
		))
	var first := points[0]
	outline_mesh.surface_add_vertex(Vector3(
		WORLD_LEFT + first.x / MAP_WIDTH * WORLD_WIDTH,
		0.30,
		WORLD_TOP + first.y / MAP_HEIGHT * WORLD_HEIGHT
	))
	outline_mesh.surface_end()
	var outline := MeshInstance3D.new()
	outline.name = "%s_Border" % polygon.name
	outline.mesh = outline_mesh
	atlas_root.add_child(outline)


func _build_land_label(land_id: String, text_value: String, color: Color) -> void:
	var center := canonical_center_world(land_id)
	var label := Label3D.new()
	label.name = "%s_Label" % land_id.replace("-", "_")
	label.text = text_value
	label.position = Vector3(center.x, 2.0, center.y)
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	label.no_depth_test = true
	label.font_size = 32
	label.outline_size = 12
	label.modulate = color
	label.outline_modulate = Color(0.02, 0.04, 0.05, 0.95)
	label.pixel_size = 0.12
	atlas_root.add_child(label)
	land_labels[land_id] = label


func _terrain_color(terrain: String) -> Color:
	var colors := {
		"grassland": Color("718b4e"),
		"forest": Color("28583b"),
		"river": Color("3989a4"),
		"hill": Color("856d47"),
		"ruins": Color("695f56"),
		"coast": Color("a8874e"),
		"marsh": Color("466f5a"),
		"field": Color("9e8a4e"),
	}
	var color: Color = colors.get(terrain, Color("718b4e"))
	color.a = 0.94
	return color


func _build_ui() -> void:
	ui_layer = CanvasLayer.new()
	ui_layer.name = "PlayableUI"
	ui_layer.layer = 100
	add_child(ui_layer)
	panel = PanelContainer.new()
	panel.name = "ProgressPanel"
	panel.set_anchors_preset(Control.PRESET_TOP_RIGHT)
	panel.position = Vector2(-346, 16)
	panel.custom_minimum_size = Vector2(330, 0)
	panel.size = Vector2(330, 0)
	var panel_style := StyleBoxFlat.new()
	panel_style.bg_color = Color(0.035, 0.045, 0.05, 0.88)
	panel_style.border_color = Color(0.70, 0.60, 0.34, 0.88)
	panel_style.set_border_width_all(1)
	panel_style.set_corner_radius_all(10)
	panel_style.shadow_color = Color(0.0, 0.0, 0.0, 0.42)
	panel_style.shadow_size = 8
	panel.add_theme_stylebox_override("panel", panel_style)
	ui_layer.add_child(panel)
	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 14)
	margin.add_theme_constant_override("margin_top", 12)
	margin.add_theme_constant_override("margin_right", 14)
	margin.add_theme_constant_override("margin_bottom", 12)
	panel.add_child(margin)
	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 8)
	margin.add_child(column)
	title_label = _label("AURELIAN BASIN · A-01", 16)
	identity_label = _label("Select a canonical land on the map", 18)
	detail_label = _label("0/30 lands · 0 settlements · Stone 10", 14)
	goal_label = _label("NEXT · Select Greenvale", 14)
	title_label.add_theme_color_override("font_color", Color("d6bd78"))
	goal_label.add_theme_color_override("font_color", Color("ead79c"))
	identity_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	detail_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	goal_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	for label in [title_label, identity_label, detail_label, goal_label]:
		column.add_child(label)
	claim_button = _button("Claim selected land", "ClaimButton", _claim)
	enter_button = _button("Enter Greengate", "EnterButton", _enter)
	inspect_button = _button("Inspect Riverbend frontier", "InspectButton", _inspect_frontier)
	connect_button = _button("Connect Riverbend · 5 stone", "ConnectButton", _connect_selected_link)
	road_button = _button("Build village road · 5 stone", "RoadButton", _road)
	supply_button = _button("Receive Riverbend stone · +5", "SupplyButton", _receive_next_supply)
	survey_button = _button("Commission Highmere survey · 5 stone", "SurveyButton", _commission_highmere_survey)
	save_button = _button("Save progress", "SaveButton", _save)
	return_button = _button("Return to World", "ReturnButton", _return_world)
	for button in [claim_button, enter_button, inspect_button, connect_button, road_button, supply_button, survey_button, save_button, return_button]:
		column.add_child(button)


func _label(text_value: String, font_size: int) -> Label:
	var label := Label.new()
	label.text = text_value
	label.add_theme_font_size_override("font_size", font_size)
	return label


func _button(text_value: String, node_name: String, handler: Callable) -> Button:
	var button := Button.new()
	button.name = node_name
	button.text = text_value
	button.custom_minimum_size = Vector2(0, 38)
	button.pressed.connect(handler)
	return button


func _on_world_position_selected(world_position: Vector2) -> void:
	if not world.visible:
		return
	var point := Vector2(
		(world_position.x - WORLD_LEFT) / WORLD_WIDTH * MAP_WIDTH,
		(world_position.y - WORLD_TOP) / WORLD_HEIGHT * MAP_HEIGHT
	)
	for land_value in lands:
		var land: Dictionary = land_value
		var polygon := PackedVector2Array()
		for raw_point in land.get("points", []):
			polygon.append(Vector2(float(raw_point[0]), float(raw_point[1])))
		if Geometry2D.is_point_in_polygon(point, polygon):
			selected_land = land
			controller.select_land_from_map(String(land.get("id", "")))
			return


func canonical_center_world(land_id: String) -> Vector2:
	for land_value in lands:
		var land: Dictionary = land_value
		if String(land.get("id", "")) == land_id:
			var center: Array = land.get("center", [0.0, 0.0])
			return Vector2(
				WORLD_LEFT + float(center[0]) / MAP_WIDTH * WORLD_WIDTH,
				WORLD_TOP + float(center[1]) / MAP_HEIGHT * WORLD_HEIGHT
			)
	return Vector2(INF, INF)


func _build_frontier_link() -> void:
	var home := canonical_center_world("PN-A01-001")
	var frontier := canonical_center_world("PN-A01-002")
	var delta := frontier - home
	var route_mesh := BoxMesh.new()
	route_mesh.size = Vector3(delta.length(), 0.45, 1.8)
	frontier_link_material = StandardMaterial3D.new()
	frontier_link_material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	frontier_link_material.emission_enabled = true
	frontier_link_material.emission_energy_multiplier = 2.5
	frontier_link_material.no_depth_test = true
	route_mesh.material = frontier_link_material
	_set_frontier_link_connected(false)
	frontier_link = MeshInstance3D.new()
	frontier_link.name = "GreenvaleRiverbendClaimLink"
	frontier_link.mesh = route_mesh
	frontier_link.position = Vector3((home.x + frontier.x) * 0.5, 1.2, (home.y + frontier.y) * 0.5)
	frontier_link.rotation.y = -atan2(delta.y, delta.x)
	frontier_link.visible = false
	world.add_child(frontier_link)


func _build_highmere_survey_link() -> void:
	var riverbend := canonical_center_world("PN-A01-002")
	var highmere := canonical_center_world("PN-A01-003")
	var delta := highmere - riverbend
	var route_mesh := BoxMesh.new()
	route_mesh.size = Vector3(delta.length(), 0.36, 1.25)
	highmere_survey_material = StandardMaterial3D.new()
	highmere_survey_material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	highmere_survey_material.emission_enabled = true
	highmere_survey_material.emission_energy_multiplier = 2.2
	highmere_survey_material.no_depth_test = true
	route_mesh.material = highmere_survey_material
	_set_highmere_survey_state(false, false, false)
	highmere_survey_link = MeshInstance3D.new()
	highmere_survey_link.name = "RiverbendHighmereSurveyRoute"
	highmere_survey_link.mesh = route_mesh
	highmere_survey_link.position = Vector3((riverbend.x + highmere.x) * 0.5, 1.15, (riverbend.y + highmere.y) * 0.5)
	highmere_survey_link.rotation.y = -atan2(delta.y, delta.x)
	highmere_survey_link.visible = false
	world.add_child(highmere_survey_link)


func _build_northgate_scout_link() -> void:
	var highmere := canonical_center_world("PN-A01-003")
	var northgate := canonical_center_world("PN-A01-024")
	var delta := northgate - highmere
	var route_mesh := BoxMesh.new()
	route_mesh.size = Vector3(delta.length(), 0.30, 1.0)
	northgate_scout_material = StandardMaterial3D.new()
	northgate_scout_material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	northgate_scout_material.emission_enabled = true
	northgate_scout_material.emission_energy_multiplier = 2.0
	northgate_scout_material.no_depth_test = true
	route_mesh.material = northgate_scout_material
	_set_northgate_scout_state(false)
	northgate_scout_link = MeshInstance3D.new()
	northgate_scout_link.name = "HighmereNorthgateScoutRoute"
	northgate_scout_link.mesh = route_mesh
	northgate_scout_link.position = Vector3((highmere.x + northgate.x) * 0.5, 1.1, (highmere.y + northgate.y) * 0.5)
	northgate_scout_link.rotation.y = -atan2(delta.y, delta.x)
	northgate_scout_link.visible = false
	world.add_child(northgate_scout_link)


func _claim() -> void:
	if controller.claim_selected_land():
		controller.save_game()


func _enter() -> void:
	controller.enter_selected_land()


func _road() -> void:
	if controller.build_road():
		controller.save_game()


func _inspect_frontier() -> void:
	if controller.inspect_selected_frontier():
		controller.save_game()


func _connect_selected_link() -> void:
	var selected_id := String(controller.current_snapshot().get("selected_land_id", ""))
	var connected: bool = controller.connect_highmere() if selected_id == "PN-A01-003" else controller.connect_riverbend()
	if connected:
		controller.save_game()


func _receive_next_supply() -> void:
	var snapshot: Dictionary = controller.current_snapshot()
	var delivered: bool = (
		controller.receive_highmere_link_supply()
		if bool(snapshot.get("highmere_claimed", false))
		else controller.receive_riverbend_supply()
	)
	if delivered:
		controller.save_game()


func _commission_highmere_survey() -> void:
	if controller.commission_highmere_survey():
		controller.save_game()


func _save() -> void:
	controller.save_game()


func _return_world() -> void:
	if controller.return_to_world():
		controller.save_game()


func _on_view_changed(view: String, snapshot: Dictionary) -> void:
	if view == "village":
		_show_village()
	else:
		_show_world()
	_render_snapshot(snapshot)


func _show_village() -> void:
	world.visible = false
	world.process_mode = Node.PROCESS_MODE_DISABLED
	if village == null:
		village = VillageScene.instantiate()
		village.name = "GreengateVillage"
		add_child(village)
	village.process_mode = Node.PROCESS_MODE_INHERIT
	# The donor's economy is separate from the canonical Pixel Nations save.
	# Never display its 160-stone fixture next to the real five-stone balance.
	for donor_button in village.hud._resource_buttons.values():
		(donor_button as Button).visible = false
	panel.move_to_front()


func _show_world() -> void:
	if village != null:
		village.process_mode = Node.PROCESS_MODE_DISABLED
		village.queue_free()
		village = null
	village_paved_road = null
	world.visible = true
	world.process_mode = Node.PROCESS_MODE_INHERIT
	panel.move_to_front()


func _render_snapshot(snapshot: Dictionary) -> void:
	var view := String(snapshot.get("view", "world"))
	var selected_id := String(snapshot.get("selected_land_id", ""))
	if view == "village":
		title_label.text = "PIXEL NATIONS · GREENGATE"
		identity_label.text = "Greenvale settlement"
		detail_label.text = "Stone %d · Road %s\nRiverbend supply %s · Ridge stone %s" % [
			int(snapshot.get("stone", 0)),
			"built" if bool(snapshot.get("road_built", false)) else "not built",
			("delivered" if bool(snapshot.get("riverbend_supply_delivered", false)) else (
				"ready" if bool(snapshot.get("riverbend_connected", false)) else "locked"
			)),
			"delivered" if bool(snapshot.get("highmere_link_supply_delivered", false)) else "not delivered",
		]
		goal_label.text = (
			"NEXT · Return to World and connect Highmere"
			if bool(snapshot.get("highmere_link_supply_delivered", false)) else (
				"NEXT · Receive the Highmere ridge stone"
				if bool(snapshot.get("highmere_claimed", false)) else (
					"NEXT · Return to World and inspect Highmere"
					if bool(snapshot.get("highmere_survey_commissioned", false)) else (
						"NEXT · Commission the Highmere survey"
						if bool(snapshot.get("riverbend_supply_delivered", false))
						else "NEXT · Build the road or advance the frontier"
					)
				)
			)
		)
	else:
		title_label.text = "AURELIAN BASIN · A-01"
		identity_label.text = _land_title(selected_id)
		detail_label.text = "%d/%d lands · %d settlement · Stone %d\nRoad %s · Riverbend %s · Highmere %s · Nation not founded" % [
			int(snapshot.get("claimed_lands", 0)), int(snapshot.get("charted_lands", 30)),
			1 if bool(snapshot.get("settlement_founded", false)) else 0,
			int(snapshot.get("stone", 0)),
			"built" if bool(snapshot.get("road_built", false)) else "not built",
			("linked" if bool(snapshot.get("riverbend_connected", false)) else (
				"claimed" if bool(snapshot.get("riverbend_claimed", false)) else (
				"inspected" if bool(snapshot.get("riverbend_inspected", false)) else "not inspected"
			))),
			String(snapshot.get("highmere_status", "locked")).replace("_", " "),
		]
		goal_label.text = "NEXT · %s" % String(snapshot.get("next_goal", ""))
	claim_button.visible = false
	enter_button.visible = false
	inspect_button.visible = false
	connect_button.visible = false
	road_button.visible = false
	supply_button.visible = false
	survey_button.visible = false
	return_button.visible = view == "village"
	save_button.visible = true
	var selected_claimed := (snapshot.get("claimed_land_ids", []) as Array).has(selected_id)
	var riverbend_claim_ready := (
		selected_id == "PN-A01-002"
		and bool(snapshot.get("riverbend_inspected", false))
		and not bool(snapshot.get("riverbend_claimed", false))
	)
	var highmere_claim_ready := (
		selected_id == "PN-A01-003"
		and bool(snapshot.get("highmere_inspected", false))
		and not bool(snapshot.get("highmere_claimed", false))
	)
	var home_claim_ready := selected_id == "PN-A01-001" and String(snapshot.get("claimed_land_id", "")).is_empty()
	claim_button.visible = view == "world" and (home_claim_ready or riverbend_claim_ready or highmere_claim_ready)
	claim_button.text = "Claim Highmere ridge" if selected_id == "PN-A01-003" else "Claim selected land"
	claim_button.disabled = selected_id.is_empty() or selected_claimed or (
		not String(snapshot.get("claimed_land_id", "")).is_empty()
		and not (riverbend_claim_ready or highmere_claim_ready)
	)
	enter_button.visible = view == "world" and selected_id == "PN-A01-001" and String(snapshot.get("claimed_land_id", "")) == "PN-A01-001"
	enter_button.disabled = not enter_button.visible
	var riverbend_inspection_ready := (
		selected_id == "PN-A01-002"
		and bool(snapshot.get("road_built", false))
		and not bool(snapshot.get("riverbend_inspected", false))
	)
	var highmere_inspection_ready := (
		selected_id == "PN-A01-003"
		and bool(snapshot.get("highmere_survey_commissioned", false))
		and not bool(snapshot.get("highmere_inspected", false))
	)
	var northgate_inspection_ready := (
		selected_id == "PN-A01-024"
		and bool(snapshot.get("highmere_connected", false))
		and not bool(snapshot.get("northgate_inspected", false))
	)
	inspect_button.text = (
		"Inspect Northgate frontier" if selected_id == "PN-A01-024" else (
			"Inspect Highmere frontier" if selected_id == "PN-A01-003" else "Inspect Riverbend frontier"
		)
	)
	inspect_button.disabled = not (riverbend_inspection_ready or highmere_inspection_ready or northgate_inspection_ready)
	inspect_button.visible = view == "world" and selected_id in ["PN-A01-002", "PN-A01-003", "PN-A01-024"] and not (
		bool(snapshot.get("riverbend_inspected", false)) if selected_id == "PN-A01-002" else (
			bool(snapshot.get("highmere_inspected", false)) if selected_id == "PN-A01-003" else bool(snapshot.get("northgate_inspected", false))
		)
	)
	var highmere_link_selected := selected_id == "PN-A01-003"
	connect_button.text = "Connect Highmere ridge · 5 stone" if highmere_link_selected else "Connect Riverbend · 5 stone"
	connect_button.disabled = (
		(
			not bool(snapshot.get("highmere_claimed", false))
			or not bool(snapshot.get("highmere_link_supply_delivered", false))
			or bool(snapshot.get("highmere_connected", false))
			or int(snapshot.get("stone", 0)) < int(snapshot.get("highmere_link_stone_cost", 5))
		)
		if highmere_link_selected else (
			selected_id != "PN-A01-002"
			or not bool(snapshot.get("riverbend_claimed", false))
			or bool(snapshot.get("riverbend_connected", false))
			or int(snapshot.get("stone", 0)) < int(snapshot.get("frontier_link_stone_cost", 5))
		)
	)
	connect_button.visible = view == "world" and (
		(selected_id == "PN-A01-002" and bool(snapshot.get("riverbend_claimed", false)) and not bool(snapshot.get("riverbend_connected", false)))
		or (selected_id == "PN-A01-003" and bool(snapshot.get("highmere_claimed", false)) and not bool(snapshot.get("highmere_connected", false)))
	)
	road_button.disabled = bool(snapshot.get("road_built", false)) or int(snapshot.get("stone", 0)) < 5
	road_button.visible = view == "village" and not bool(snapshot.get("road_built", false))
	supply_button.text = (
		"Receive Highmere ridge stone · +5"
		if bool(snapshot.get("highmere_claimed", false))
		else "Receive Riverbend stone · +5"
	)
	supply_button.disabled = (
		bool(snapshot.get("highmere_link_supply_delivered", false))
		if bool(snapshot.get("highmere_claimed", false)) else (
			not bool(snapshot.get("riverbend_connected", false))
			or bool(snapshot.get("riverbend_supply_delivered", false))
		)
	)
	supply_button.visible = view == "village" and (
		(bool(snapshot.get("highmere_claimed", false)) and not bool(snapshot.get("highmere_link_supply_delivered", false)))
		or (bool(snapshot.get("riverbend_connected", false)) and not bool(snapshot.get("riverbend_supply_delivered", false)))
	)
	survey_button.disabled = (
		not bool(snapshot.get("riverbend_supply_delivered", false))
		or bool(snapshot.get("highmere_survey_commissioned", false))
		or int(snapshot.get("stone", 0)) < int(snapshot.get("highmere_survey_stone_cost", 5))
	)
	survey_button.visible = view == "village" and bool(snapshot.get("riverbend_supply_delivered", false)) and not bool(snapshot.get("highmere_survey_commissioned", false))
	if frontier_link != null:
		frontier_link.visible = view == "world" and bool(snapshot.get("riverbend_claimed", false))
		_set_frontier_link_connected(bool(snapshot.get("riverbend_connected", false)))
	if highmere_survey_link != null:
		highmere_survey_link.visible = view == "world" and bool(snapshot.get("highmere_survey_commissioned", false))
		_set_highmere_survey_state(
			bool(snapshot.get("highmere_inspected", false)),
			bool(snapshot.get("highmere_claimed", false)),
			bool(snapshot.get("highmere_connected", false))
		)
	if northgate_scout_link != null:
		northgate_scout_link.visible = view == "world" and bool(snapshot.get("highmere_connected", false))
		_set_northgate_scout_state(bool(snapshot.get("northgate_inspected", false)))
	_refresh_land_visuals(snapshot)
	_sync_village_road_visual(snapshot)
	panel.reset_size()


# Project only the canonical BUILD_ROAD action onto the retained donor's real
# textured road geometry; do not mutate its separate simulation or resource stock.
# Five physical paved tiles connect the plaza's east edge to the school entrance.
func _sync_village_road_visual(snapshot: Dictionary) -> void:
	if village == null or not is_instance_valid(village):
		return
	if not bool(snapshot.get("road_built", false)):
		if village_paved_road != null and is_instance_valid(village_paved_road):
			village_paved_road.queue_free()
			village_paved_road = null
		return
	if village_paved_road != null and is_instance_valid(village_paved_road):
		return
	var donor_terrain: Node3D = village.world.terrain
	village_paved_road = Node3D.new()
	village_paved_road.name = "PixelNationsCanonicalRoad"
	donor_terrain.roads.add_child(village_paved_road)
	var cells: Array[Vector2i] = [
		Vector2i(10, 14), Vector2i(11, 14), Vector2i(12, 14),
		Vector2i(13, 14), Vector2i(13, 13),
	]
	for cell in cells:
		var tile := Node3D.new()
		tile.name = "CanonicalRoadTile_%d_%d" % [cell.x, cell.y]
		village_paved_road.add_child(tile)
		# Uses the existing authored, terrain-conforming stone mesh/material.
		donor_terrain._build_road_visual(
			tile, {"cell": cell, "stage": "complete"}, Vector4.ONE
		)


func _refresh_land_visuals(snapshot: Dictionary) -> void:
	var selected_id := String(snapshot.get("selected_land_id", ""))
	var claimed_ids: Array = snapshot.get("claimed_land_ids", []) as Array
	for land_value in lands:
		var land: Dictionary = land_value
		var land_id := String(land.get("id", ""))
		var material := land_materials.get(land_id) as StandardMaterial3D
		if material == null:
			continue
		var color := _terrain_color(String(land.get("terrain", "grassland")))
		if claimed_ids.has(land_id):
			color = Color("2868b8") if land_id == "PN-A01-001" else Color("2b8b88")
			color.a = 0.98
		elif land_id == "PN-A01-003" and bool(snapshot.get("highmere_inspected", false)):
			color = Color(0.42, 0.68, 0.78, 0.98)
		elif land_id == "PN-A01-024" and bool(snapshot.get("northgate_inspected", false)):
			color = Color(0.42, 0.72, 0.62, 0.98)
		if land_id == selected_id:
			color = color.lightened(0.22)
		material.albedo_color = color
	for label_value in land_labels.values():
		(label_value as Label3D).visible = String(snapshot.get("view", "world")) == "world"


func _set_frontier_link_connected(connected: bool) -> void:
	if frontier_link_material == null:
		return
	frontier_link_material.albedo_color = (
		Color(0.30, 0.92, 0.48, 1.0) if connected else Color(0.95, 0.68, 0.18, 1.0)
	)
	frontier_link_material.emission = (
		Color(0.12, 0.72, 0.32, 1.0) if connected else Color(0.95, 0.47, 0.08, 1.0)
	)


func _set_northgate_scout_state(inspected: bool) -> void:
	if northgate_scout_material == null:
		return
	northgate_scout_material.albedo_color = Color(0.28, 0.78, 0.92, 1.0) if inspected else Color(0.72, 0.76, 0.58, 1.0)
	northgate_scout_material.emission = Color(0.12, 0.58, 0.86, 1.0) if inspected else Color(0.48, 0.52, 0.26, 1.0)


func _set_highmere_survey_state(inspected: bool, claimed: bool, connected: bool) -> void:
	if highmere_survey_material == null:
		return
	highmere_survey_material.albedo_color = (
		Color(0.30, 0.92, 0.48, 1.0) if connected else (
			Color(0.95, 0.68, 0.18, 1.0) if claimed else (
			Color(0.38, 0.86, 0.95, 1.0) if inspected else Color(0.72, 0.74, 0.70, 1.0)
		))
	)
	highmere_survey_material.emission = (
		Color(0.12, 0.72, 0.32, 1.0) if connected else (
			Color(0.95, 0.47, 0.08, 1.0) if claimed else (
			Color(0.12, 0.62, 0.82, 1.0) if inspected else Color(0.42, 0.44, 0.40, 1.0)
		))
	)


func _land_title(land_id: String) -> String:
	if land_id.is_empty():
		return "Select a canonical land on the map"
	for land_value in lands:
		var land: Dictionary = land_value
		if String(land.get("id", "")) == land_id:
			var relationship := ""
			if land_id == "PN-A01-002":
				relationship = " · east of Greenvale"
			elif land_id == "PN-A01-003":
				relationship = " · north of Riverbend"
			elif land_id == "PN-A01-024":
				relationship = " · beyond the Highmere ridge"
			return "%s · %s · %s%s" % [
				land_id, String(land.get("name", "")), String(land.get("region", "")), relationship
			]
	return land_id
