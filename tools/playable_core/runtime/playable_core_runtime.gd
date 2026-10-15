class_name PixelNationsPlayableCore
extends Node

const WorldScene = preload("res://game/main_game.tscn")
const VillageScene = preload("res://village/scenes/approved.tscn")
const ApprovedPeople = preload("res://village/presentation/approved_people.gd")
const Controller = preload("res://pixel_nations/core/playable_core_controller.gd")

const MAP_WIDTH := 960.0
const MAP_HEIGHT := 900.0
const WORLD_LEFT := -133.333333
const WORLD_TOP := -125.0
const WORLD_WIDTH := 266.666666
const WORLD_HEIGHT := 250.0
const ATLAS_OVERVIEW_POSITION := Vector3(-35.0, 0.0, -46.0)
const ATLAS_OVERVIEW_ZOOM := 250.0
const ATLAS_FOCUS_ZOOM := 82.0
const HUD_PAPER := Color("f5e4bd")
const HUD_INK := Color("3a2a18")
const HUD_BRONZE := Color("b58a48")
const HUD_WINE := Color("5c1710")

var controller: Node
var world: Node3D
var village: Node
var village_paved_road: Node3D
var village_harvest_feast: Node3D
var frontier_link: MeshInstance3D
var frontier_link_material: StandardMaterial3D
var highmere_survey_link: MeshInstance3D
var highmere_survey_material: StandardMaterial3D
var northgate_scout_link: MeshInstance3D
var northgate_scout_material: StandardMaterial3D
var atlas_root: Node3D
var land_materials: Dictionary = {}
var land_outline_materials: Dictionary = {}
var land_labels: Dictionary = {}
var land_subtitles: Dictionary = {}
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
var hamlet_button: Button
var storehouse_button: Button
var provisions_button: Button
var feast_button: Button
var focus_button: Button
var overview_button: Button
var save_button: Button
var return_button: Button
var atlas_is_focused := false
var camera_zoom_tween: Tween


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
	player.position = ATLAS_OVERVIEW_POSITION
	player.camera.position.z = ATLAS_OVERVIEW_ZOOM
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
	substrate_material.albedo_texture = load("res://pixel_nations/a01_atlas_substrate.png")
	substrate_material.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	substrate_mesh.material = substrate_material
	substrate.mesh = substrate_mesh
	substrate.position.y = 0.04
	atlas_root.add_child(substrate)
	for land_value in lands:
		_build_land_polygon(land_value as Dictionary)
	_build_land_label("PN-A01-001", "GREENVALE", "HOME · GREENGATE", Color("dbe9ff"))
	_build_land_label("PN-A01-002", "RIVERBEND", "", Color("d6ffff"))
	_build_land_label("PN-A01-003", "HIGHMERE", "", Color("f2ead2"))
	_build_land_label("PN-A01-024", "NORTHGATE", "", Color("e3f1df"))


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
	# Let the retained painting carry the overview. Canonical borders remain
	# present for hit-area legibility, but only selected, claimed and inspected
	# lands rise into the cartographic hierarchy.
	outline_material.albedo_color = Color(0.16, 0.18, 0.14, 0.30)
	outline_material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
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
	land_outline_materials[String(land.get("id", ""))] = outline_material


func _build_land_label(land_id: String, text_value: String, subtitle_value: String, color: Color) -> void:
	var center := canonical_center_world(land_id)
	var label := Label3D.new()
	label.name = "%s_Label" % land_id.replace("-", "_")
	label.text = text_value
	label.position = Vector3(center.x, 2.0, center.y)
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	label.no_depth_test = true
	label.font_size = 28
	label.outline_size = 10
	label.modulate = color
	label.outline_modulate = Color(0.02, 0.04, 0.05, 0.95)
	label.pixel_size = 0.105
	atlas_root.add_child(label)
	land_labels[land_id] = label
	var subtitle := Label3D.new()
	subtitle.name = "%s_Subtitle" % land_id.replace("-", "_")
	subtitle.text = subtitle_value
	subtitle.position = Vector3(center.x, 1.9, center.y + 3.2)
	subtitle.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	subtitle.no_depth_test = true
	subtitle.font_size = 18
	subtitle.outline_size = 8
	subtitle.modulate = color.darkened(0.08)
	subtitle.outline_modulate = Color(0.02, 0.04, 0.05, 0.95)
	subtitle.pixel_size = 0.095
	subtitle.visible = not subtitle_value.is_empty()
	atlas_root.add_child(subtitle)
	land_subtitles[land_id] = subtitle


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
	# Keep canonical land state legible while allowing the retained painted Basin
	# to carry the physical geography instead of flattening it into opaque parcels.
	color.a = 0.34
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
	# Reuse the retained Village's authored parchment surface so the strategic
	# and settlement views read as one game rather than unrelated overlays.
	var panel_style := StyleBoxTexture.new()
	panel_style.texture = load("res://village/assets/approved/ui/papiro.png")
	panel_style.texture_margin_left = 28
	panel_style.texture_margin_right = 28
	panel_style.texture_margin_top = 28
	panel_style.texture_margin_bottom = 28
	# The parchment's 9-patch border is decorative. Keep layout padding in the
	# explicit MarginContainer below so the authored texture cannot inflate the
	# compact World/Village command panel.
	panel_style.content_margin_left = 0
	panel_style.content_margin_right = 0
	panel_style.content_margin_top = 0
	panel_style.content_margin_bottom = 0
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
	title_label.add_theme_color_override("font_color", HUD_WINE)
	identity_label.add_theme_color_override("font_color", HUD_INK)
	detail_label.add_theme_color_override("font_color", HUD_INK)
	goal_label.add_theme_color_override("font_color", HUD_WINE)
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
	hamlet_button = _button("Found Riverbend Hamlet · 5 timber", "HamletButton", _found_riverbend_hamlet)
	storehouse_button = _button("Build Riverbend Storehouse · 5 stone", "StorehouseButton", _build_riverbend_storehouse)
	provisions_button = _button("Collect Riverbend provisions · +5 food", "ProvisionsButton", _collect_riverbend_storehouse_provisions)
	feast_button = _button("Hold Greengate Harvest Feast · 5 food", "FeastButton", _hold_greengate_harvest_feast)
	focus_button = _button("Focus selected land", "FocusButton", _focus_selected_land)
	overview_button = _button("Return to atlas overview", "OverviewButton", _show_atlas_overview)
	save_button = _button("Save progress", "SaveButton", _save)
	return_button = _button("Return to World", "ReturnButton", _return_world)
	for button in [claim_button, enter_button, inspect_button, connect_button, road_button, supply_button, survey_button, hamlet_button, storehouse_button, provisions_button, feast_button, focus_button, overview_button, save_button, return_button]:
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
	button.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	button.add_theme_stylebox_override("normal", _hud_button_style("normal"))
	button.add_theme_stylebox_override("hover", _hud_button_style("hover"))
	button.add_theme_stylebox_override("pressed", _hud_button_style("pressed"))
	button.add_theme_stylebox_override("disabled", _hud_button_style("disabled"))
	button.add_theme_color_override("font_color", HUD_INK)
	button.add_theme_color_override("font_hover_color", HUD_INK)
	button.add_theme_color_override("font_pressed_color", HUD_INK)
	button.add_theme_color_override("font_disabled_color", Color("766650"))
	button.pressed.connect(handler)
	return button


func _hud_button_style(state: String) -> StyleBoxFlat:
	var surface := Color("c5a475")
	var rim := Color("82613b")
	match state:
		"hover":
			surface = surface.lightened(0.18)
			rim = Color("ad7636")
		"pressed":
			surface = surface.darkened(0.12)
			rim = Color("60442b")
		"disabled":
			surface = Color("b5a48a")
			rim = Color("93826b")
	var style := StyleBoxFlat.new()
	style.bg_color = surface
	style.border_color = rim
	style.set_border_width_all(2)
	style.border_width_top = 4 if state == "pressed" else 2
	style.border_width_bottom = 2 if state == "pressed" else 4
	style.set_corner_radius_all(3)
	style.content_margin_left = 16
	style.content_margin_right = 16
	style.content_margin_top = 8
	style.content_margin_bottom = 8
	style.shadow_color = Color(0.16, 0.10, 0.05, 0.0 if state == "disabled" else 0.22)
	style.shadow_size = 1 if state == "pressed" else 2
	style.shadow_offset = Vector2(0, 0 if state == "pressed" else 1)
	return style


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
			if atlas_is_focused:
				_move_camera_to_land(String(land.get("id", "")))
			return


func _focus_selected_land() -> void:
	var land_id := String(controller.current_snapshot().get("selected_land_id", ""))
	if land_id.is_empty():
		return
	atlas_is_focused = true
	_move_camera_to_land(land_id)
	_render_snapshot(controller.current_snapshot())


func _show_atlas_overview() -> void:
	atlas_is_focused = false
	var player := world.get_node("Player")
	player.move_to(Vector2(ATLAS_OVERVIEW_POSITION.x, ATLAS_OVERVIEW_POSITION.z))
	_tween_camera_zoom(ATLAS_OVERVIEW_ZOOM)
	_render_snapshot(controller.current_snapshot())


func _move_camera_to_land(land_id: String) -> void:
	var center := canonical_center_world(land_id)
	if not is_finite(center.x):
		return
	var player := world.get_node("Player")
	# Retain OpenGS camera navigation: its native move_to keeps panning semantics,
	# while the closer scale makes the selected canonical parcel readable.
	player.move_to(center)
	_tween_camera_zoom(ATLAS_FOCUS_ZOOM)


func _tween_camera_zoom(target_zoom: float) -> void:
	var player := world.get_node("Player")
	if camera_zoom_tween != null and camera_zoom_tween.is_running():
		camera_zoom_tween.kill()
	camera_zoom_tween = create_tween()
	camera_zoom_tween.set_trans(Tween.TRANS_SINE)
	camera_zoom_tween.set_ease(Tween.EASE_OUT)
	camera_zoom_tween.tween_property(player.camera, "position:z", target_zoom, 0.35)


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
		controller.receive_riverbend_storehouse_stone()
		if bool(snapshot.get("riverbend_hamlet_founded", false)) and not bool(snapshot.get("riverbend_storehouse_stone_delivered", false)) else (
			controller.receive_northgate_settlement_timber()
			if bool(snapshot.get("northgate_inspected", false)) and not bool(snapshot.get("northgate_settlement_timber_delivered", false)) else (
			controller.receive_highmere_link_supply()
			if bool(snapshot.get("highmere_claimed", false))
			else controller.receive_riverbend_supply()
			)
		)
	)
	if delivered:
		controller.save_game()


func _commission_highmere_survey() -> void:
	if controller.commission_highmere_survey():
		controller.save_game()


func _found_riverbend_hamlet() -> void:
	if controller.found_riverbend_hamlet():
		controller.save_game()


func _build_riverbend_storehouse() -> void:
	if controller.build_riverbend_storehouse():
		controller.save_game()


func _collect_riverbend_storehouse_provisions() -> void:
	if controller.collect_riverbend_storehouse_provisions():
		controller.save_game()


func _hold_greengate_harvest_feast() -> void:
	if controller.hold_greengate_harvest_feast():
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
	# Donor objectives belong to the retained village simulation, not the
	# canonical Pixel Nations save. Keep that simulation running, but do not
	# present its unrelated counter as the player's strategic objective.
	# Reparent both controls under an invisible holder because the donor's
	# responsive layout may otherwise make the tab visible again later.
	var hidden_objectives := Control.new()
	hidden_objectives.name = "PixelNationsHiddenDonorObjectives"
	hidden_objectives.visible = false
	village.hud.add_child(hidden_objectives)
	village.hud._objectives_panel.reparent(hidden_objectives)
	if village.hud._tabs.has("objectives"):
		(village.hud._tabs["objectives"] as Button).reparent(hidden_objectives)
	panel.move_to_front()


func _show_world() -> void:
	if village != null:
		village.process_mode = Node.PROCESS_MODE_DISABLED
		village.queue_free()
		village = null
	village_paved_road = null
	village_harvest_feast = null
	world.visible = true
	world.process_mode = Node.PROCESS_MODE_INHERIT
	panel.move_to_front()


func _render_snapshot(snapshot: Dictionary) -> void:
	var view := String(snapshot.get("view", "world"))
	var selected_id := String(snapshot.get("selected_land_id", ""))
	var settlement_count := int(snapshot.get("settlement_count", 0))
	if view == "village":
		title_label.text = "PIXEL NATIONS · GREENGATE"
		identity_label.text = "Greenvale settlement"
		detail_label.text = "Stone %d · Timber %d · Food %d · Road %s\nRiverbend supply %s · Ridge stone %s" % [
			int(snapshot.get("stone", 0)),
			int(snapshot.get("timber", 0)),
			int(snapshot.get("food", 0)),
			"built" if bool(snapshot.get("road_built", false)) else "not built",
			("delivered" if bool(snapshot.get("riverbend_supply_delivered", false)) else (
				"ready" if bool(snapshot.get("riverbend_connected", false)) else "locked"
			)),
			"delivered" if bool(snapshot.get("highmere_link_supply_delivered", false)) else "not delivered",
		]
		if bool(snapshot.get("riverbend_storehouse_stone_delivered", false)) and not bool(snapshot.get("riverbend_storehouse_built", false)):
			goal_label.text = "NEXT · Return to World and build Riverbend Storehouse"
		elif bool(snapshot.get("riverbend_hamlet_founded", false)) and not bool(snapshot.get("riverbend_storehouse_stone_delivered", false)):
			goal_label.text = "NEXT · Receive Riverbend Storehouse stone"
		elif bool(snapshot.get("greengate_harvest_feast_held", false)):
			goal_label.text = "Harvest Feast complete · further settlement growth locked"
		elif bool(snapshot.get("riverbend_storehouse_provisions_collected", false)):
			goal_label.text = "NEXT · Hold the Greengate Harvest Feast with 5 food"
		elif bool(snapshot.get("riverbend_storehouse_built", false)):
			goal_label.text = "NEXT · Select Riverbend and collect its first provisions"
		elif bool(snapshot.get("northgate_settlement_timber_delivered", false)):
			goal_label.text = "NEXT · Return to World and found Riverbend Hamlet"
		elif bool(snapshot.get("northgate_inspected", false)):
			goal_label.text = "NEXT · Receive Northgate settlement timber"
		elif bool(snapshot.get("highmere_link_supply_delivered", false)):
			goal_label.text = "NEXT · Return to World and connect Highmere"
		elif bool(snapshot.get("highmere_claimed", false)):
			goal_label.text = "NEXT · Receive the Highmere ridge stone"
		elif bool(snapshot.get("highmere_survey_commissioned", false)):
			goal_label.text = "NEXT · Return to World and inspect Highmere"
		elif bool(snapshot.get("riverbend_supply_delivered", false)):
			goal_label.text = "NEXT · Commission the Highmere survey"
		else:
			goal_label.text = "NEXT · Build the road or advance the frontier"
	else:
		title_label.text = "AURELIAN BASIN · A-01"
		identity_label.text = _land_title(selected_id)
		detail_label.text = "%d/%d lands · %d settlement%s · Stone %d · Timber %d · Food %d\nRoad %s · Riverbend %s · Highmere %s · Nation not founded" % [
			int(snapshot.get("claimed_lands", 0)), int(snapshot.get("charted_lands", 30)),
			settlement_count,
			"" if settlement_count == 1 else "s",
			int(snapshot.get("stone", 0)),
			int(snapshot.get("timber", 0)),
			int(snapshot.get("food", 0)),
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
	hamlet_button.visible = false
	storehouse_button.visible = false
	provisions_button.visible = false
	feast_button.visible = false
	focus_button.visible = false
	overview_button.visible = false
	return_button.visible = view == "village"
	save_button.visible = true
	focus_button.visible = view == "world" and not selected_id.is_empty() and not atlas_is_focused
	focus_button.disabled = not focus_button.visible
	overview_button.visible = view == "world" and atlas_is_focused
	overview_button.disabled = not overview_button.visible
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
		"Receive Riverbend Storehouse stone · +5"
		if bool(snapshot.get("riverbend_hamlet_founded", false)) and not bool(snapshot.get("riverbend_storehouse_stone_delivered", false)) else (
			"Receive Northgate settlement timber · +5"
			if bool(snapshot.get("northgate_inspected", false)) and not bool(snapshot.get("northgate_settlement_timber_delivered", false)) else (
			"Receive Highmere ridge stone · +5"
			if bool(snapshot.get("highmere_claimed", false))
			else "Receive Riverbend stone · +5"
			)
		)
	)
	if bool(snapshot.get("riverbend_hamlet_founded", false)) and not bool(snapshot.get("riverbend_storehouse_stone_delivered", false)):
		supply_button.disabled = false
	elif bool(snapshot.get("northgate_inspected", false)) and not bool(snapshot.get("northgate_settlement_timber_delivered", false)):
		supply_button.disabled = bool(snapshot.get("northgate_settlement_timber_delivered", false))
	elif bool(snapshot.get("highmere_claimed", false)):
		supply_button.disabled = bool(snapshot.get("highmere_link_supply_delivered", false))
	else:
		supply_button.disabled = (
			not bool(snapshot.get("riverbend_connected", false))
			or bool(snapshot.get("riverbend_supply_delivered", false))
		)
	supply_button.visible = view == "village" and (
		(bool(snapshot.get("riverbend_hamlet_founded", false)) and not bool(snapshot.get("riverbend_storehouse_stone_delivered", false)))
		or (bool(snapshot.get("northgate_inspected", false)) and not bool(snapshot.get("northgate_settlement_timber_delivered", false)))
		or (bool(snapshot.get("highmere_claimed", false)) and not bool(snapshot.get("highmere_link_supply_delivered", false)))
		or (bool(snapshot.get("riverbend_connected", false)) and not bool(snapshot.get("riverbend_supply_delivered", false)))
	)
	survey_button.disabled = (
		not bool(snapshot.get("riverbend_supply_delivered", false))
		or bool(snapshot.get("highmere_survey_commissioned", false))
		or int(snapshot.get("stone", 0)) < int(snapshot.get("highmere_survey_stone_cost", 5))
	)
	survey_button.visible = view == "village" and bool(snapshot.get("riverbend_supply_delivered", false)) and not bool(snapshot.get("highmere_survey_commissioned", false))
	hamlet_button.disabled = (
		selected_id != "PN-A01-002"
		or not bool(snapshot.get("northgate_settlement_timber_delivered", false))
		or bool(snapshot.get("riverbend_hamlet_founded", false))
		or int(snapshot.get("timber", 0)) < int(snapshot.get("riverbend_hamlet_timber_cost", 5))
	)
	hamlet_button.visible = view == "world" and selected_id == "PN-A01-002" and bool(snapshot.get("northgate_settlement_timber_delivered", false)) and not bool(snapshot.get("riverbend_hamlet_founded", false))
	storehouse_button.disabled = (
		selected_id != "PN-A01-002"
		or not bool(snapshot.get("riverbend_storehouse_stone_delivered", false))
		or bool(snapshot.get("riverbend_storehouse_built", false))
		or int(snapshot.get("stone", 0)) < int(snapshot.get("riverbend_storehouse_stone_cost", 5))
	)
	storehouse_button.visible = view == "world" and selected_id == "PN-A01-002" and bool(snapshot.get("riverbend_storehouse_stone_delivered", false)) and not bool(snapshot.get("riverbend_storehouse_built", false))
	provisions_button.disabled = (
		selected_id != "PN-A01-002"
		or not bool(snapshot.get("riverbend_storehouse_built", false))
		or bool(snapshot.get("riverbend_storehouse_provisions_collected", false))
	)
	provisions_button.visible = view == "world" and selected_id == "PN-A01-002" and bool(snapshot.get("riverbend_storehouse_built", false)) and not bool(snapshot.get("riverbend_storehouse_provisions_collected", false))
	feast_button.disabled = (
		not bool(snapshot.get("riverbend_storehouse_provisions_collected", false))
		or bool(snapshot.get("greengate_harvest_feast_held", false))
		or int(snapshot.get("food", 0)) < int(snapshot.get("greengate_harvest_feast_food_cost", 5))
	)
	feast_button.visible = view == "village" and bool(snapshot.get("riverbend_storehouse_provisions_collected", false)) and not bool(snapshot.get("greengate_harvest_feast_held", false))
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
	_sync_village_harvest_feast(snapshot)
	_sync_village_guidance(snapshot)
	panel.reset_size()


# Reuse the donor's authored parchment tutorial card as a canonical, save-driven
# dispatch. A new Village instance must never resurrect completed first-road
# guidance or expose claims that belong to the donor's separate simulation.
func _sync_village_guidance(snapshot: Dictionary) -> void:
	if village == null or not is_instance_valid(village):
		return
	var hud = village.hud
	if not bool(snapshot.get("road_built", false)):
		hud._tutorial_title.text = "Greengate's first road"
		hud._tutorial_intro.text = "Build Greengate's road for 5 stone, then return to World to inspect Riverbend."
		hud._tutorial_more.text = "The Pixel Nations command panel uses the canonical save and resource costs."
	elif bool(snapshot.get("greengate_harvest_feast_held", false)):
		hud._tutorial_title.text = "Greengate Harvest Feast"
		hud._tutorial_intro.text = "%d/%d lands claimed · %d settlements · Nation not founded." % [
			int(snapshot.get("claimed_lands", 0)),
			int(snapshot.get("charted_lands", 30)),
			int(snapshot.get("settlement_count", 0)),
		]
		hud._tutorial_more.text = "Five food provisioned a saved gathering in Greengate's plaza. Further settlement growth is not yet playable."
	elif bool(snapshot.get("riverbend_storehouse_provisions_collected", false)):
		hud._tutorial_title.text = "Riverbend provisions delivered"
		hud._tutorial_intro.text = "%d/%d lands claimed · %d settlements · Nation not founded." % [
			int(snapshot.get("claimed_lands", 0)),
			int(snapshot.get("charted_lands", 30)),
			int(snapshot.get("settlement_count", 0)),
		]
		hud._tutorial_more.text = "The first Storehouse cycle delivered 5 food and is saved. Hold Greengate's Harvest Feast to spend it on a visible settlement gathering."
	elif bool(snapshot.get("riverbend_storehouse_built", false)):
		hud._tutorial_title.text = "Riverbend Storehouse established"
		hud._tutorial_intro.text = "%d/%d lands claimed · %d settlements · Nation not founded." % [
			int(snapshot.get("claimed_lands", 0)),
			int(snapshot.get("charted_lands", 30)),
			int(snapshot.get("settlement_count", 0)),
		]
		hud._tutorial_more.text = "The Storehouse is saved and visible. Return to World, select Riverbend, and collect its first provisions."
	else:
		hud._tutorial_title.text = "Aurelian frontier dispatch"
		hud._tutorial_intro.text = "%d/%d lands claimed · %d settlement%s · Nation not founded." % [
			int(snapshot.get("claimed_lands", 0)),
			int(snapshot.get("charted_lands", 30)),
			int(snapshot.get("settlement_count", 0)),
			"" if int(snapshot.get("settlement_count", 0)) == 1 else "s",
		]
		hud._tutorial_more.text = "Next: %s." % String(snapshot.get("next_goal", "Return to World"))
	hud._tutorial_button.text = "Continue in Greengate"


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


# Project the saved feast onto the retained donor's authored plaza and character
# system. These are the same articulated residents and cargo meshes used by the
# running settlement, arranged around its existing benches rather than replaced
# with unrelated generated art or abstract placeholder props.
func _sync_village_harvest_feast(snapshot: Dictionary) -> void:
	if village == null or not is_instance_valid(village):
		return
	if not bool(snapshot.get("greengate_harvest_feast_held", false)):
		if village_harvest_feast != null and is_instance_valid(village_harvest_feast):
			village_harvest_feast.queue_free()
			village_harvest_feast = null
		return
	if village_harvest_feast != null and is_instance_valid(village_harvest_feast):
		return
	village_harvest_feast = Node3D.new()
	village_harvest_feast.name = "PixelNationsGreengateHarvestFeast"
	village.world.add_child(village_harvest_feast)
	var donor_terrain: Node3D = village.world.terrain
	var center := Vector3(20.0, 0.0, 35.0)
	var guests := [
		{"role": "resident", "cargo": "food", "at": Vector2(18.1, 34.0)},
		{"role": "servant", "cargo": "loaves", "at": Vector2(21.9, 34.0)},
		{"role": "farmer", "cargo": "food", "at": Vector2(18.1, 36.0)},
		{"role": "vintner", "cargo": "wine", "at": Vector2(21.9, 36.0)},
	]
	for index in range(guests.size()):
		var guest: Dictionary = guests[index]
		var actor: Node3D = ApprovedPeople.create(String(guest.role), 9000 + index, 1)
		var at: Vector2 = guest.at
		actor.position = Vector3(at.x, donor_terrain.support_height(at.x, at.y) + 0.002, at.y)
		actor.rotation.y = atan2(-(center.x - at.x), -(center.z - at.y))
		ApprovedPeople.animate(actor, float(index) * 0.7, false, false, true, String(guest.cargo))
		village_harvest_feast.add_child(actor)
	var feast_light := OmniLight3D.new()
	feast_light.name = "HarvestLanternGlow"
	feast_light.position = Vector3(20.0, donor_terrain.support_height(20.0, 35.0) + 3.2, 35.0)
	feast_light.light_color = Color("ffd28a")
	feast_light.light_energy = 2.2
	feast_light.omni_range = 9.0
	feast_light.shadow_enabled = false
	village_harvest_feast.add_child(feast_light)


func _refresh_land_visuals(snapshot: Dictionary) -> void:
	var selected_id := String(snapshot.get("selected_land_id", ""))
	var claimed_ids: Array = snapshot.get("claimed_land_ids", []) as Array
	var inspected_ids: Array = snapshot.get("inspected_land_ids", []) as Array
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
		var outline_material := land_outline_materials.get(land_id) as StandardMaterial3D
		if outline_material != null:
			var outline_color := Color(0.16, 0.18, 0.14, 0.30)
			if inspected_ids.has(land_id):
				outline_color = Color(0.92, 0.66, 0.24, 0.94)
			if claimed_ids.has(land_id):
				outline_color = Color(0.58, 0.88, 0.94, 0.96)
			if land_id == selected_id:
				outline_color = Color(1.0, 0.82, 0.34, 1.0)
			outline_material.albedo_color = outline_color
	var labels_visible := String(snapshot.get("view", "world")) == "world"
	for land_id_value in land_labels.keys():
		var label_land_id := String(land_id_value)
		var label := land_labels.get(label_land_id) as Label3D
		var subtitle := land_subtitles.get(label_land_id) as Label3D
		var label_color := Color("c9c6b0")
		if inspected_ids.has(label_land_id):
			label_color = Color("f0be65")
		if claimed_ids.has(label_land_id):
			label_color = Color("bdebf0")
		if label_land_id == selected_id:
			label_color = Color("ffd66d")
		label.visible = labels_visible
		label.modulate = label_color
		if subtitle != null:
			subtitle.visible = labels_visible and not subtitle.text.is_empty()
			subtitle.modulate = label_color.darkened(0.08)
	var riverbend_subtitle := land_subtitles.get("PN-A01-002") as Label3D
	if riverbend_subtitle != null:
		riverbend_subtitle.text = (
			"HAMLET · STOREHOUSE"
			if bool(snapshot.get("riverbend_storehouse_built", false)) else (
				"HAMLET" if bool(snapshot.get("riverbend_hamlet_founded", false)) else ""
			)
		)
		riverbend_subtitle.visible = labels_visible and not riverbend_subtitle.text.is_empty()
	var highmere_subtitle := land_subtitles.get("PN-A01-003") as Label3D
	if highmere_subtitle != null:
		highmere_subtitle.text = (
			"CONNECTED" if bool(snapshot.get("highmere_connected", false)) else (
				"CLAIMED" if bool(snapshot.get("highmere_claimed", false)) else (
					"SURVEYED" if bool(snapshot.get("highmere_inspected", false)) else ""
				)
			)
		)
		highmere_subtitle.visible = labels_visible and not highmere_subtitle.text.is_empty()
	var northgate_subtitle := land_subtitles.get("PN-A01-024") as Label3D
	if northgate_subtitle != null:
		northgate_subtitle.text = "SCOUTED" if bool(snapshot.get("northgate_inspected", false)) else ""
		northgate_subtitle.visible = labels_visible and not northgate_subtitle.text.is_empty()


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
