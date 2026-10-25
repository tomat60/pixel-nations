class_name PixelNationsPlayableCore
extends Node

const WorldScene = preload("res://game/main_game.tscn")
const VillageScene = preload("res://village/scenes/approved.tscn")
const ApprovedPeople = preload("res://village/presentation/approved_people.gd")
const ApprovedCivil = preload("res://village/presentation/approved_civil_buildings.gd")
const Controller = preload("res://pixel_nations/core/playable_core_controller.gd")

const MAP_WIDTH := 960.0
const MAP_HEIGHT := 900.0
const WORLD_LEFT := -133.333333
const WORLD_TOP := -125.0
const WORLD_WIDTH := 266.666666
const WORLD_HEIGHT := 250.0
const ATLAS_OVERVIEW_POSITION := Vector3(0.0, 0.0, 0.0)
# Keep the complete retained painting visible, but let it occupy the strategic
# viewport instead of floating inside a wide band of empty donor background.
const ATLAS_OVERVIEW_ZOOM := 225.0
const ATLAS_FOCUS_ZOOM := 82.0
const ATLAS_RELIEF_COLUMNS := 48
const ATLAS_RELIEF_ROWS := 24
const ATLAS_RELIEF_HEIGHT := 3.0
const ATLAS_STATE_Y := 3.35
const HUD_PAPER := Color("f5e4bd")
const HUD_INK := Color("3a2a18")
const HUD_BRONZE := Color("b58a48")
const HUD_WINE := Color("5c1710")

var controller: Node
var world: Node3D
var village: Node
var village_paved_road: Node3D
var village_granary: Node3D
var village_granary_access: Node3D
var village_granary_sites: Node3D
var village_riverbend_supply_yard: Node3D
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
var frontier_progress: ProgressBar
var route_label: Label
var goal_label: Label
var claim_button: Button
var enter_button: Button
var inspect_button: Button
var connect_button: Button
var road_button: Button
var granary_button: Button
var granary_site_row: HBoxContainer
var granary_plaza_button: Button
var granary_orchard_button: Button
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
var granary_site_choice_active := false

const GRANARY_SITE_TRANSFORMS := {
	"plaza_edge": {"position": Vector3(27.0, 0.0, 44.0), "rotation": -0.12},
	"orchard_lane": {"position": Vector3(43.0, 0.0, 22.5), "rotation": 0.18},
}
const GRANARY_ACCESS_CELLS := {
	# Extend the plaza's west approach into the compact civic footprint.
	"plaza_edge": [Vector2i(10, 15), Vector2i(10, 16), Vector2i(11, 17)],
	# Continue the school's north-east road as a distinct orchard lane.
	"orchard_lane": [Vector2i(14, 12), Vector2i(15, 11), Vector2i(16, 10), Vector2i(17, 9)],
}


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
	substrate.name = "FictionalAurelianRelief"
	var atlas_texture := load("res://pixel_nations/a01_atlas_substrate.png") as Texture2D
	var substrate_mesh := _build_atlas_relief_mesh(atlas_texture)
	var substrate_material := StandardMaterial3D.new()
	# The retained painting remains the authored atlas surface. A broad, shallow
	# mesh lets its mountains, valleys and coast catch real light so World reads
	# as navigable command geography rather than a flat image plate.
	substrate_material.shading_mode = BaseMaterial3D.SHADING_MODE_PER_PIXEL
	substrate_material.albedo_texture = atlas_texture
	substrate_material.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	substrate_material.roughness = 0.82
	# ArrayMesh owns materials per surface; assigning the PrimitiveMesh-style
	# `material` property aborts World construction in Godot 4.7.1.
	substrate_mesh.surface_set_material(0, substrate_material)
	substrate.mesh = substrate_mesh
	substrate.set_meta("relief_columns", ATLAS_RELIEF_COLUMNS)
	substrate.set_meta("relief_rows", ATLAS_RELIEF_ROWS)
	atlas_root.add_child(substrate)
	var relief_light := DirectionalLight3D.new()
	relief_light.name = "AurelianReliefLight"
	relief_light.rotation_degrees = Vector3(-58.0, -32.0, 0.0)
	relief_light.light_color = Color("ffe5ba")
	relief_light.light_energy = 0.78
	relief_light.shadow_enabled = false
	atlas_root.add_child(relief_light)
	for land_value in lands:
		_build_land_polygon(land_value as Dictionary)
	_build_land_label("PN-A01-001", "GREENVALE", "HOME · GREENGATE", Color("dbe9ff"))
	_build_land_label("PN-A01-002", "RIVERBEND", "", Color("d6ffff"))
	_build_land_label("PN-A01-003", "HIGHMERE", "", Color("f2ead2"))
	_build_land_label("PN-A01-024", "NORTHGATE", "", Color("e3f1df"))


func _build_atlas_relief_mesh(texture: Texture2D) -> ArrayMesh:
	var image := texture.get_image()
	var surface := SurfaceTool.new()
	surface.begin(Mesh.PRIMITIVE_TRIANGLES)
	for row in range(ATLAS_RELIEF_ROWS):
		for column in range(ATLAS_RELIEF_COLUMNS):
			var uv00 := Vector2(float(column) / ATLAS_RELIEF_COLUMNS, float(row) / ATLAS_RELIEF_ROWS)
			var uv10 := Vector2(float(column + 1) / ATLAS_RELIEF_COLUMNS, uv00.y)
			var uv01 := Vector2(uv00.x, float(row + 1) / ATLAS_RELIEF_ROWS)
			var uv11 := Vector2(uv10.x, uv01.y)
			for uv in [uv00, uv01, uv10, uv10, uv01, uv11]:
				surface.set_uv(uv)
				surface.add_vertex(_atlas_relief_vertex(uv, image))
	surface.generate_normals()
	return surface.commit()


func _atlas_relief_vertex(uv: Vector2, image: Image) -> Vector3:
	var sample_x := clampi(int(uv.x * float(image.get_width() - 1)), 0, image.get_width() - 1)
	var sample_y := clampi(int(uv.y * float(image.get_height() - 1)), 0, image.get_height() - 1)
	# Average a small neighborhood so painted brush detail remains texture, not
	# noisy terrain spikes. Blue-dominant ocean stays low; brighter neutral and
	# green land rises into one continuous atlas relief.
	var sample := Color(0.0, 0.0, 0.0, 1.0)
	var sample_count := 0.0
	var radius := maxi(2, int(image.get_width() / 240))
	for offset_y in [-radius, 0, radius]:
		for offset_x in [-radius, 0, radius]:
			sample += image.get_pixel(
				clampi(sample_x + offset_x, 0, image.get_width() - 1),
				clampi(sample_y + offset_y, 0, image.get_height() - 1)
			)
			sample_count += 1.0
	sample /= sample_count
	var brightness := sample.get_luminance()
	var water_weight := clampf((sample.b - sample.r * 0.92) * 2.8, 0.0, 1.0)
	var land_height := clampf(brightness * 0.82 + sample.r * 0.18, 0.0, 1.0)
	var height := lerpf(land_height * ATLAS_RELIEF_HEIGHT, -0.20, water_weight)
	return Vector3(
		lerpf(-250.0, 250.0, uv.x),
		height,
		lerpf(-125.0, 125.0, uv.y)
	)


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
			ATLAS_STATE_Y,
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
			ATLAS_STATE_Y + 0.12,
			WORLD_TOP + point.y / MAP_HEIGHT * WORLD_HEIGHT
		))
	var first := points[0]
	outline_mesh.surface_add_vertex(Vector3(
		WORLD_LEFT + first.x / MAP_WIDTH * WORLD_WIDTH,
		ATLAS_STATE_Y + 0.12,
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
	label.position = Vector3(center.x, ATLAS_STATE_Y + 1.8, center.y)
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	label.no_depth_test = true
	label.font_size = 32
	label.outline_size = 12
	label.modulate = color
	label.outline_modulate = Color(0.02, 0.04, 0.05, 0.95)
	label.pixel_size = 0.12
	atlas_root.add_child(label)
	land_labels[land_id] = label
	var subtitle := Label3D.new()
	subtitle.name = "%s_Subtitle" % land_id.replace("-", "_")
	subtitle.text = subtitle_value
	subtitle.position = Vector3(center.x, ATLAS_STATE_Y + 1.7, center.y + 3.2)
	subtitle.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	subtitle.no_depth_test = true
	subtitle.font_size = 18
	subtitle.outline_size = 8
	subtitle.modulate = color.darkened(0.08)
	subtitle.outline_modulate = Color(0.02, 0.04, 0.05, 0.95)
	subtitle.pixel_size = 0.095
	subtitle.visible = false
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
	# Neutral hit areas should not recolor the authored Basin into a patchwork.
	# Their faint wash and border preserve parcel discovery; explicit inspected,
	# claimed and selected states rise into the hierarchy in _refresh_land_visuals.
	color.a = 0.10
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
	frontier_progress = ProgressBar.new()
	frontier_progress.name = "FrontierProgress"
	frontier_progress.min_value = 0
	frontier_progress.max_value = 30
	frontier_progress.value = 0
	frontier_progress.show_percentage = false
	frontier_progress.custom_minimum_size = Vector2(0, 8)
	frontier_progress.mouse_filter = Control.MOUSE_FILTER_IGNORE
	frontier_progress.add_theme_stylebox_override("background", _progress_style(Color("6a543b80")))
	frontier_progress.add_theme_stylebox_override("fill", _progress_style(HUD_BRONZE))
	route_label = _label("ROUTES · No links established\nNATION · Not founded", 13)
	goal_label = _label("NEXT · Select Greenvale", 14)
	title_label.add_theme_color_override("font_color", HUD_WINE)
	identity_label.add_theme_color_override("font_color", HUD_INK)
	detail_label.add_theme_color_override("font_color", HUD_INK)
	route_label.add_theme_color_override("font_color", HUD_INK)
	goal_label.add_theme_color_override("font_color", HUD_WINE)
	identity_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	detail_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	route_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	goal_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	for label in [title_label, identity_label, detail_label]:
		column.add_child(label)
	column.add_child(frontier_progress)
	column.add_child(route_label)
	column.add_child(goal_label)
	claim_button = _button("Claim selected land", "ClaimButton", _claim)
	enter_button = _button("Enter Greengate", "EnterButton", _enter)
	inspect_button = _button("Inspect Riverbend frontier", "InspectButton", _inspect_frontier)
	connect_button = _button("Connect Riverbend · 5 stone", "ConnectButton", _connect_selected_link)
	road_button = _button("Build village road · 5 stone", "RoadButton", _road)
	granary_button = _button("Choose Granary site · 3 stone", "GranaryButton", _open_granary_site_choice)
	granary_site_row = HBoxContainer.new()
	granary_site_row.name = "GranarySiteChoices"
	granary_site_row.add_theme_constant_override("separation", 8)
	granary_plaza_button = _button("Plaza edge", "GranaryPlazaButton", _choose_granary_site.bind("plaza_edge"))
	granary_orchard_button = _button("Orchard lane", "GranaryOrchardButton", _choose_granary_site.bind("orchard_lane"))
	granary_plaza_button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	granary_orchard_button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	granary_site_row.add_child(granary_plaza_button)
	granary_site_row.add_child(granary_orchard_button)
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
	for button in [claim_button, enter_button, inspect_button, connect_button, road_button, granary_button, supply_button, survey_button, hamlet_button, storehouse_button, provisions_button, feast_button, focus_button, overview_button, save_button, return_button]:
		column.add_child(button)
	column.add_child(granary_site_row)
	column.move_child(granary_site_row, granary_button.get_index() + 1)


func _label(text_value: String, font_size: int) -> Label:
	var label := Label.new()
	label.text = text_value
	label.add_theme_font_size_override("font_size", font_size)
	return label


func _progress_style(color: Color) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.set_corner_radius_all(3)
	return style


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
	# Once Highmere is connected, the newly revealed route to Northgate is the
	# player's visible navigation affordance. Give its interior the same
	# forgiving destination hit area as the commissioned Highmere survey route.
	if northgate_scout_link != null and northgate_scout_link.visible:
		var highmere := canonical_center_world("PN-A01-003")
		var northgate := canonical_center_world("PN-A01-024")
		var northgate_route := northgate - highmere
		var northgate_progress := clampf(
			(world_position - highmere).dot(northgate_route) / northgate_route.length_squared(),
			0.0,
			1.0
		)
		var northgate_closest := highmere + northgate_route * northgate_progress
		if (
			northgate_progress >= 0.15
			and northgate_progress <= 0.85
			and world_position.distance_to(northgate_closest) <= 6.0
		):
			_select_land_by_id("PN-A01-024")
			return
	# A commissioned survey route is player-facing navigation, not decoration.
	# Give the thin rendered line a forgiving world-space hit area and select
	# its destination before the underlying land polygon consumes the click.
	if highmere_survey_link != null and highmere_survey_link.visible:
		var riverbend := canonical_center_world("PN-A01-002")
		var highmere := canonical_center_world("PN-A01-003")
		var route := highmere - riverbend
		var route_progress := clampf((world_position - riverbend).dot(route) / route.length_squared(), 0.0, 1.0)
		var closest := riverbend + route * route_progress
		# Keep the settlement and destination endpoints owned by their land
		# polygons; only the visible interior of the route acts as a shortcut.
		if route_progress >= 0.15 and route_progress <= 0.85 and world_position.distance_to(closest) <= 6.0:
			_select_land_by_id("PN-A01-003")
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
			_select_land_by_id(String(land.get("id", "")))
			return


func _select_land_by_id(land_id: String) -> void:
	for land_value in lands:
		var land: Dictionary = land_value
		if String(land.get("id", "")) != land_id:
			continue
		selected_land = land
		controller.select_land_from_map(land_id)
		if atlas_is_focused:
			_move_camera_to_land(land_id)
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
	frontier_link.position = Vector3((home.x + frontier.x) * 0.5, ATLAS_STATE_Y + 0.75, (home.y + frontier.y) * 0.5)
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
	highmere_survey_link.position = Vector3((riverbend.x + highmere.x) * 0.5, ATLAS_STATE_Y + 0.70, (riverbend.y + highmere.y) * 0.5)
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
	northgate_scout_link.position = Vector3((highmere.x + northgate.x) * 0.5, ATLAS_STATE_Y + 0.65, (highmere.y + northgate.y) * 0.5)
	northgate_scout_link.rotation.y = -atan2(delta.y, delta.x)
	northgate_scout_link.visible = false
	world.add_child(northgate_scout_link)


func _claim() -> void:
	if controller.claim_selected_land():
		controller.save_game()


func _enter() -> void:
	var snapshot: Dictionary = controller.current_snapshot()
	# When a frontier explicitly sends the player back for its shipment, make
	# the visible CTA complete that navigation instead of requiring map knowledge.
	if (
		String(snapshot.get("view", "")) == "world"
		and (
			(
				String(snapshot.get("selected_land_id", "")) == "PN-A01-002"
				and bool(snapshot.get("riverbend_hamlet_founded", false))
				and not bool(snapshot.get("riverbend_storehouse_stone_delivered", false))
			)
			or (
				String(snapshot.get("selected_land_id", "")) == "PN-A01-002"
				and bool(snapshot.get("riverbend_storehouse_provisions_collected", false))
				and not bool(snapshot.get("greengate_harvest_feast_held", false))
			)
			or
			(
				String(snapshot.get("selected_land_id", "")) == "PN-A01-003"
				and bool(snapshot.get("highmere_claimed", false))
				and not bool(snapshot.get("highmere_link_supply_delivered", false))
			)
			or (
				String(snapshot.get("selected_land_id", "")) == "PN-A01-024"
				and bool(snapshot.get("northgate_inspected", false))
				and not bool(snapshot.get("northgate_settlement_timber_delivered", false))
			)
		)
	):
		controller.select_land_from_map("PN-A01-001")
	controller.enter_selected_land()


func _road() -> void:
	if controller.build_road():
		controller.save_game()


func _open_granary_site_choice() -> void:
	var snapshot: Dictionary = controller.current_snapshot()
	if (
		String(snapshot.get("view", "")) == "village"
		and bool(snapshot.get("road_built", false))
		and not bool(snapshot.get("greengate_granary_built", false))
		and int(snapshot.get("stone", 0)) >= int(snapshot.get("greengate_granary_stone_cost", 3))
	):
		granary_site_choice_active = true
		_render_snapshot(snapshot)


func _choose_granary_site(site_id: String) -> void:
	if not GRANARY_SITE_TRANSFORMS.has(site_id):
		return
	granary_site_choice_active = false
	if controller.build_greengate_granary(site_id):
		controller.save_game()
	else:
		granary_site_choice_active = true
		_render_snapshot(controller.current_snapshot())


func _on_granary_site_input(
	_camera: Node,
	event: InputEvent,
	_event_position: Vector3,
	_normal: Vector3,
	_shape_idx: int,
	site_id: String
) -> void:
	if (
		granary_site_choice_active
		and event is InputEventMouseButton
		and event.button_index == MOUSE_BUTTON_LEFT
		and event.pressed
	):
		_choose_granary_site(site_id)


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
		# This button is canonical Pixel Nations progression, not the donor's
		# one-shot tutorial dismiss control. Keep the dispatch visible as its
		# action changes from Granary purchase to World navigation.
		var donor_tutorial_handler := Callable(village.hud, "_dismiss_tutorial")
		if village.hud._tutorial_button.pressed.is_connected(donor_tutorial_handler):
			village.hud._tutorial_button.pressed.disconnect(donor_tutorial_handler)
		village.hud._tutorial_button.pressed.connect(_on_village_tutorial_pressed)
	village.process_mode = Node.PROCESS_MODE_INHERIT
	# The retained top bar is useful Village chrome, but its economy is separate.
	# _render_snapshot feeds it only the canonical Pixel Nations stock.
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
	# The donor status sidebar reports its separate simulation in Portuguese and
	# competes with the canonical dispatch. Preserve its refresh logic under the
	# same hidden holder rather than relying on our panel to cover it visually.
	village.hud._status_panel.reparent(hidden_objectives)
	# The retained donor's Build/Roads/Trades/Guard dock issues commands to a
	# different simulation that is NOT part of the Pixel Nations save. Its
	# buttons look like real construction choices but create no canonical land
	# progress. Hide that whole dock instead of exposing deceptive actions.
	# Keep the donor scene/simulation intact; canonical context actions remain
	# in our panel, with village resources in the retained top bar.
	village.hud._dock.reparent(hidden_objectives)
	panel.move_to_front()


func _show_world() -> void:
	if village != null:
		village.process_mode = Node.PROCESS_MODE_DISABLED
		village.queue_free()
		village = null
	village_paved_road = null
	village_granary = null
	village_granary_access = null
	village_granary_sites = null
	granary_site_choice_active = false
	village_riverbend_supply_yard = null
	village_harvest_feast = null
	world.visible = true
	world.process_mode = Node.PROCESS_MODE_INHERIT
	panel.move_to_front()


func _render_snapshot(snapshot: Dictionary) -> void:
	var view := String(snapshot.get("view", "world"))
	var selected_id := String(snapshot.get("selected_land_id", ""))
	var settlement_count := int(snapshot.get("settlement_count", 0))
	# The retained Village already owns the narrative/status hierarchy through
	# its parchment dispatch card. In that view this panel is navigation and
	# action chrome only; repeating the same progression copy obscures the scene.
	for label in [title_label, identity_label, detail_label, route_label, goal_label]:
		label.visible = view == "world"
	frontier_progress.visible = view == "world"
	if view == "village":
		if village != null:
			village.hud.set_pixel_nations_resources({
				"stone": int(snapshot.get("stone", 0)),
				"timber": int(snapshot.get("timber", 0)),
				"food": int(snapshot.get("food", 0)),
			})
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
		detail_label.text = "FRONTIER · %d / %d CLAIMED · %d SETTLEMENT%s\nSTOCKPILE · STONE %d · TIMBER %d · FOOD %d" % [
			int(snapshot.get("claimed_lands", 0)), int(snapshot.get("charted_lands", 30)),
			settlement_count,
			"" if settlement_count == 1 else "S",
			int(snapshot.get("stone", 0)),
			int(snapshot.get("timber", 0)),
			int(snapshot.get("food", 0)),
		]
		frontier_progress.max_value = max(1, int(snapshot.get("charted_lands", 30)))
		frontier_progress.value = int(snapshot.get("claimed_lands", 0))
		route_label.text = "ROUTES · ROAD %s · RIVERBEND %s · HIGHMERE %s\nNATION · NOT FOUNDED" % [
			"BUILT" if bool(snapshot.get("road_built", false)) else "NOT BUILT",
			("LINKED" if bool(snapshot.get("riverbend_connected", false)) else (
				"CLAIMED" if bool(snapshot.get("riverbend_claimed", false)) else (
					"INSPECTED" if bool(snapshot.get("riverbend_inspected", false)) else "NOT INSPECTED"
			))),
			String(snapshot.get("highmere_status", "locked")).replace("_", " ").to_upper(),
		]
		goal_label.text = "NEXT · %s" % String(snapshot.get("next_goal", ""))
	claim_button.visible = false
	enter_button.visible = false
	inspect_button.visible = false
	connect_button.visible = false
	road_button.visible = false
	granary_button.visible = false
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
	var highmere_return_ready := (
		view == "world"
		and selected_id == "PN-A01-003"
		and bool(snapshot.get("highmere_claimed", false))
		and not bool(snapshot.get("highmere_link_supply_delivered", false))
	)
	var riverbend_storehouse_return_ready := (
		view == "world"
		and selected_id == "PN-A01-002"
		and bool(snapshot.get("riverbend_hamlet_founded", false))
		and not bool(snapshot.get("riverbend_storehouse_stone_delivered", false))
	)
	var riverbend_feast_return_ready := (
		view == "world"
		and selected_id == "PN-A01-002"
		and bool(snapshot.get("riverbend_storehouse_provisions_collected", false))
		and not bool(snapshot.get("greengate_harvest_feast_held", false))
	)
	var northgate_return_ready := (
		view == "world"
		and selected_id == "PN-A01-024"
		and bool(snapshot.get("northgate_inspected", false))
		and not bool(snapshot.get("northgate_settlement_timber_delivered", false))
	)
	enter_button.visible = (
		view == "world"
		and String(snapshot.get("claimed_land_id", "")) == "PN-A01-001"
		and (selected_id == "PN-A01-001" or riverbend_storehouse_return_ready or riverbend_feast_return_ready or highmere_return_ready or northgate_return_ready)
	)
	# The first entrance actually creates a settlement in the canonical state.
	# Never label that founding action as merely visiting an existing village.
	enter_button.text = (
		"Return to Greengate · feast"
		if riverbend_feast_return_ready else (
			"Return to Greengate · stone"
			if riverbend_storehouse_return_ready else (
				"Return to Greengate · timber"
				if northgate_return_ready else (
					"Return to Greengate for ridge stone"
					if highmere_return_ready else (
						"Found Greengate" if settlement_count == 0 else "Enter Greengate"
					)
				)
			)
		)
	)
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
		or (
			selected_id == "PN-A01-003"
			and bool(snapshot.get("highmere_claimed", false))
			and bool(snapshot.get("highmere_link_supply_delivered", false))
			and not bool(snapshot.get("highmere_connected", false))
		)
	)
	road_button.disabled = bool(snapshot.get("road_built", false)) or int(snapshot.get("stone", 0)) < 5
	road_button.visible = view == "village" and not bool(snapshot.get("road_built", false))
	granary_button.visible = (
		view == "village"
		and bool(snapshot.get("road_built", false))
		and not bool(snapshot.get("greengate_granary_built", false))
	)
	granary_button.text = "Select a highlighted build site" if granary_site_choice_active else "Choose Granary site · 3 stone"
	granary_button.disabled = int(snapshot.get("stone", 0)) < int(snapshot.get("greengate_granary_stone_cost", 3))
	granary_site_row.visible = view == "village" and granary_site_choice_active
	granary_plaza_button.disabled = not granary_site_choice_active
	granary_orchard_button.disabled = not granary_site_choice_active
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
	# The retained parchment dispatch is the single player-facing Highmere action.
	# Keep the command-panel control wired for compatibility, but hide the
	# duplicate so an unaided player has one clear action and the runtime test
	# cannot silently bypass the dominant journey guidance.
	survey_button.visible = false
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
	_sync_village_granary_sites(snapshot)
	_sync_village_granary(snapshot)
	_sync_village_riverbend_supply_yard(snapshot)
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
	elif granary_site_choice_active:
		hud._tutorial_title.text = "Choose the Granary footprint"
		hud._tutorial_intro.text = "Choose Plaza edge for a compact civic core or Orchard lane for an eastern work quarter."
		hud._tutorial_more.text = "Use either named HUD choice or click its stone footprint. Both cost 3 stone and the location is saved."
	elif (
		not bool(snapshot.get("greengate_granary_built", false))
		and int(snapshot.get("stone", 0)) >= int(snapshot.get("greengate_granary_stone_cost", 3))
	):
		hud._tutorial_title.text = "Greengate's first granary"
		hud._tutorial_intro.text = "The road is open. Build a Granary for 3 stone before returning to World."
		hud._tutorial_more.text = "Five stone will remain for the Riverbend connection, so this upgrade cannot block expansion."
	elif bool(snapshot.get("greengate_harvest_feast_held", false)):
		hud._tutorial_title.text = "Greengate Harvest Feast"
		hud._tutorial_intro.text = "%d/%d lands claimed · %d settlements · Nation not founded." % [
			int(snapshot.get("claimed_lands", 0)),
			int(snapshot.get("charted_lands", 30)),
			int(snapshot.get("settlement_count", 0)),
		]
		hud._tutorial_more.text = "The feast is saved and its gathering remains in the plaza. Return to World to choose your next frontier direction; Nation is not yet founded."
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
	var road_action_ready := (
		not bool(snapshot.get("road_built", false))
		and int(snapshot.get("stone", 0)) >= int(snapshot.get("road_stone_cost", 5))
	)
	var granary_action_ready := (
		bool(snapshot.get("road_built", false))
		and not bool(snapshot.get("greengate_granary_built", false))
		and int(snapshot.get("stone", 0)) >= int(snapshot.get("greengate_granary_stone_cost", 3))
	)
	var riverbend_supply_ready := (
		bool(snapshot.get("riverbend_connected", false))
		and not bool(snapshot.get("riverbend_supply_delivered", false))
	)
	var highmere_survey_ready := (
		bool(snapshot.get("riverbend_supply_delivered", false))
		and not bool(snapshot.get("highmere_survey_commissioned", false))
		and int(snapshot.get("stone", 0)) >= int(snapshot.get("highmere_survey_stone_cost", 5))
	)
	if road_action_ready:
		hud._tutorial_button.text = "Build Greengate Road · 5 stone"
	elif granary_action_ready:
		hud._tutorial_button.text = "Select a highlighted build site" if granary_site_choice_active else "Choose Granary site · 3 stone"
	elif riverbend_supply_ready:
		hud._tutorial_button.text = "Receive Riverbend stone · +5"
	elif highmere_survey_ready:
		hud._tutorial_button.text = "Commission Highmere survey · 5 stone"
	elif _village_guidance_requires_world(snapshot):
		hud._tutorial_button.text = "Return to World"
	else:
		hud._tutorial_button.text = "Continue in Greengate"
	hud._tutorial_button.disabled = granary_site_choice_active


# The parchment dispatch must point at the same place as its copy. Keep the
# decision state-driven so copy edits cannot silently break the navigation.
func _village_guidance_requires_world(snapshot: Dictionary) -> bool:
	if (
		bool(snapshot.get("road_built", false))
		and not bool(snapshot.get("greengate_granary_built", false))
		and int(snapshot.get("stone", 0)) >= int(snapshot.get("greengate_granary_stone_cost", 3))
	):
		return false
	return (
		(bool(snapshot.get("road_built", false)) and not bool(snapshot.get("riverbend_inspected", false)))
		or (bool(snapshot.get("highmere_survey_commissioned", false)) and not bool(snapshot.get("highmere_inspected", false)))
		or (bool(snapshot.get("highmere_link_supply_delivered", false)) and not bool(snapshot.get("highmere_connected", false)))
		or (bool(snapshot.get("highmere_connected", false)) and not bool(snapshot.get("northgate_inspected", false)))
		or (bool(snapshot.get("northgate_settlement_timber_delivered", false)) and not bool(snapshot.get("riverbend_hamlet_founded", false)))
		or (bool(snapshot.get("riverbend_storehouse_stone_delivered", false)) and not bool(snapshot.get("riverbend_storehouse_built", false)))
		or (bool(snapshot.get("riverbend_storehouse_built", false)) and not bool(snapshot.get("riverbend_storehouse_provisions_collected", false)))
		or bool(snapshot.get("greengate_harvest_feast_held", false))
	)


func _on_village_tutorial_pressed() -> void:
	var snapshot: Dictionary = controller.current_snapshot()
	if (
		not bool(snapshot.get("road_built", false))
		and int(snapshot.get("stone", 0)) >= int(snapshot.get("road_stone_cost", 5))
	):
		_road()
	elif (
		bool(snapshot.get("road_built", false))
		and not bool(snapshot.get("greengate_granary_built", false))
		and int(snapshot.get("stone", 0)) >= int(snapshot.get("greengate_granary_stone_cost", 3))
	):
		_open_granary_site_choice()
	elif (
		bool(snapshot.get("riverbend_connected", false))
		and not bool(snapshot.get("riverbend_supply_delivered", false))
	):
		_receive_next_supply()
	elif (
		bool(snapshot.get("riverbend_supply_delivered", false))
		and not bool(snapshot.get("highmere_survey_commissioned", false))
		and int(snapshot.get("stone", 0)) >= int(snapshot.get("highmere_survey_stone_cost", 5))
	):
		_commission_highmere_survey()
	elif _village_guidance_requires_world(snapshot):
		_return_world()


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


# Site selection happens on the live terrain, not in an abstract menu. Each
# footprint reuses the accepted authored paving mesh and owns a real Area3D hit
# target. The temporary pads disappear as soon as the saved choice is built.
func _sync_village_granary_sites(snapshot: Dictionary) -> void:
	if village == null or not is_instance_valid(village):
		return
	var should_show := (
		granary_site_choice_active
		and bool(snapshot.get("road_built", false))
		and not bool(snapshot.get("greengate_granary_built", false))
	)
	if not should_show:
		if village_granary_sites != null and is_instance_valid(village_granary_sites):
			village_granary_sites.queue_free()
			village_granary_sites = null
		return
	if village_granary_sites != null and is_instance_valid(village_granary_sites):
		return
	if village_paved_road == null or village_paved_road.get_child_count() == 0:
		push_error("PN_GRANARY_SITE_ROAD_TEMPLATE_MISSING")
		return
	var road_template := village_paved_road.get_child(0) as Node3D
	var surface_template := road_template.get_node_or_null("StoneSurface") as MeshInstance3D
	if surface_template == null or surface_template.mesh == null:
		push_error("PN_GRANARY_SITE_SURFACE_TEMPLATE_MISSING")
		return
	var terrain: Node3D = village.world.terrain
	village_granary_sites = Node3D.new()
	village_granary_sites.name = "PixelNationsGranaryBuildSites"
	village.world.add_child(village_granary_sites)
	for site_id in ["plaza_edge", "orchard_lane"]:
		var site: Dictionary = GRANARY_SITE_TRANSFORMS[site_id]
		var center: Vector3 = site["position"]
		center.y = terrain.ground_surface_height(center.x, center.z) + 0.03
		var pad := Area3D.new()
		pad.name = "GranarySite_%s" % site_id
		pad.position = center
		pad.input_ray_pickable = true
		pad.set_meta("granary_site", site_id)
		pad.input_event.connect(_on_granary_site_input.bind(site_id))
		village_granary_sites.add_child(pad)
		var collision := CollisionShape3D.new()
		var footprint := BoxShape3D.new()
		footprint.size = Vector3(8.0, 1.0, 8.0)
		collision.shape = footprint
		collision.position.y = 0.45
		pad.add_child(collision)
		for dx in [-2.5, 0.0, 2.5]:
			for dz in [-2.5, 0.0, 2.5]:
				var stone := MeshInstance3D.new()
				stone.name = "Footprint_%s_%s" % [str(dx), str(dz)]
				stone.mesh = surface_template.mesh
				stone.material_override = surface_template.material_override
				stone.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
				stone.position = Vector3(dx, 0.01, dz)
				pad.add_child(stone)
		# A restrained colored survey disk anchors each named HUD choice to the
		# terrain. Never put screen-facing text into the 3D scene: it obscures
		# the retained Village at small viewports.
		var marker := MeshInstance3D.new()
		marker.name = "SiteMarker"
		var disk := CylinderMesh.new()
		disk.top_radius = 0.9
		disk.bottom_radius = 0.9
		disk.height = 0.08
		marker.mesh = disk
		var marker_material := StandardMaterial3D.new()
		marker_material.albedo_color = Color("d9ad52") if site_id == "plaza_edge" else Color("5ea69a")
		marker_material.emission_enabled = true
		marker_material.emission = marker_material.albedo_color * 0.35
		marker_material.roughness = 0.8
		marker.material_override = marker_material
		marker.position = Vector3(0.0, 0.08, 0.0)
		marker.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		pad.add_child(marker)


# A paid Greengate improvement must have a PHYSICAL result in the retained
# interactive Godot scene. Use the donor's authored storehouse architecture,
# on a free plot south of the central plaza, not a full-screen painting.
# The canonical saved improvement (not the donor simulation) owns its lifecycle.
func _sync_village_granary(snapshot: Dictionary) -> void:
	if village == null or not is_instance_valid(village):
		return
	if not bool(snapshot.get("greengate_granary_built", false)):
		if village_granary != null and is_instance_valid(village_granary):
			village_granary.queue_free()
			village_granary = null
		if village_granary_access != null and is_instance_valid(village_granary_access):
			village_granary_access.queue_free()
			village_granary_access = null
		return
	var terrain: Node3D = village.world.terrain
	var site_id := String(snapshot.get("greengate_granary_site", "plaza_edge"))
	var site: Dictionary = GRANARY_SITE_TRANSFORMS.get(site_id, GRANARY_SITE_TRANSFORMS["plaza_edge"])
	if village_granary == null or not is_instance_valid(village_granary):
		village_granary = ApprovedCivil.building("store")
		village_granary.name = "PixelNationsGreengateGranary"
		# Village geometry is 1:1 donor world metres. Avoid plaza and both original
		# buildings while keeping the new building in the existing camera sightline.
		var site_position: Vector3 = site["position"]
		var x := site_position.x
		var z := site_position.z
		village_granary.position = Vector3(x, terrain.support_height(x, z) + 0.06, z)
		village_granary.rotation.y = float(site["rotation"])
		village_granary.set_meta("granary_site", site_id)
		village.world.add_child(village_granary)
	if village_granary_access == null or not is_instance_valid(village_granary_access):
		village_granary_access = Node3D.new()
		village_granary_access.name = "PixelNationsGreengateGranaryAccess"
		village_granary_access.set_meta("granary_site", site_id)
		terrain.roads.add_child(village_granary_access)
		for cell: Vector2i in GRANARY_ACCESS_CELLS.get(site_id, GRANARY_ACCESS_CELLS["plaza_edge"]):
			var tile := Node3D.new()
			tile.name = "GranaryAccessTile_%d_%d" % [cell.x, cell.y]
			village_granary_access.add_child(tile)
			# The same terrain-conforming authored stone used by the paid first road
			# makes the saved site decision legible as settlement layout, not a prop.
			terrain._build_road_visual(
				tile, {"cell": cell, "stage": "complete"}, Vector4.ONE
			)


# Riverbend's Storehouse remains physically located on Riverbend in strategic
# state. Once it is built, Greengate gains a real receiving yard beside the
# existing school road. This is the visible Greengate endpoint for that saved
# supply route, not a claim that the Riverbend building moved here.
func _sync_village_riverbend_supply_yard(snapshot: Dictionary) -> void:
	if village == null or not is_instance_valid(village):
		return
	if not bool(snapshot.get("riverbend_storehouse_built", false)):
		if village_riverbend_supply_yard != null and is_instance_valid(village_riverbend_supply_yard):
			village_riverbend_supply_yard.queue_free()
			village_riverbend_supply_yard = null
		return
	if village_riverbend_supply_yard != null and is_instance_valid(village_riverbend_supply_yard):
		return
	var donor_terrain: Node3D = village.world.terrain
	village_riverbend_supply_yard = Node3D.new()
	village_riverbend_supply_yard.name = "PixelNationsGreengateRiverbendSupplyYard"
	village.world.add_child(village_riverbend_supply_yard)
	var store := ApprovedCivil.building("store") as Node3D
	store.name = "RiverbendReceivingDepot"
	var center := Vector3(37.5, 0.0, 35.0)
	center.y = donor_terrain.support_height(center.x, center.z) + 0.002
	store.position = center
	store.set_meta("canonical_state", "riverbend_storehouse_built")
	store.set_meta("gameplay_role", "greengate_receiving_yard")
	village_riverbend_supply_yard.add_child(store)
	# Extend the accepted five-tile road with its already-rendered authored stone
	# surface. Sharing this proven ArrayMesh avoids the donor's private empty
	# MultiMesh marker path while keeping real geometry and road material.
	var road_template: Node3D = null
	if village_paved_road != null and village_paved_road.get_child_count() > 0:
		road_template = village_paved_road.get_child(0) as Node3D
	var surface_template: MeshInstance3D = null
	if road_template != null:
		surface_template = road_template.get_node_or_null("StoneSurface") as MeshInstance3D
	if surface_template == null or surface_template.mesh == null:
		push_error("PN_SUPPLY_YARD_ROAD_TEMPLATE_MISSING")
		return
	var source_ground: float = donor_terrain.ground_surface_height(road_template.position.x, road_template.position.z)
	for cell in [Vector2i(13, 15), Vector2i(13, 16), Vector2i(14, 16), Vector2i(15, 16)]:
		var tile := MeshInstance3D.new()
		tile.name = "SupplyYardRoadTile_%d_%d" % [cell.x, cell.y]
		tile.mesh = surface_template.mesh
		tile.material_override = surface_template.material_override
		tile.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		var target := Vector3(float(cell.x) * 2.5, 0.0, float(cell.y) * 2.5)
		target.y = donor_terrain.ground_surface_height(target.x, target.z) - source_ground
		tile.position = target
		village_riverbend_supply_yard.add_child(tile)


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
			# Claimed land should read as player state without painting over the
			# retained basin. The explicit cyan border and label carry ownership.
			color.a = 0.46
		elif land_id == "PN-A01-003" and bool(snapshot.get("highmere_inspected", false)):
			color = Color(0.42, 0.68, 0.78, 0.40)
		elif land_id == "PN-A01-024" and bool(snapshot.get("northgate_inspected", false)):
			color = Color(0.42, 0.72, 0.62, 0.40)
		if land_id == selected_id:
			color = color.lightened(0.22)
			color.a = minf(color.a + 0.10, 0.56)
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
			subtitle.modulate = label_color.darkened(0.08)
	var riverbend_subtitle := land_subtitles.get("PN-A01-002") as Label3D
	if riverbend_subtitle != null:
		riverbend_subtitle.text = (
			"HAMLET · STOREHOUSE"
			if bool(snapshot.get("riverbend_storehouse_built", false)) else (
				"HAMLET" if bool(snapshot.get("riverbend_hamlet_founded", false)) else ""
			)
		)
	var highmere_subtitle := land_subtitles.get("PN-A01-003") as Label3D
	if highmere_subtitle != null:
		highmere_subtitle.text = (
			"CONNECTED" if bool(snapshot.get("highmere_connected", false)) else (
				"CLAIMED" if bool(snapshot.get("highmere_claimed", false)) else (
					"SURVEYED" if bool(snapshot.get("highmere_inspected", false)) else ""
				)
			)
		)
	var northgate_subtitle := land_subtitles.get("PN-A01-024") as Label3D
	if northgate_subtitle != null:
		northgate_subtitle.text = "SCOUTED" if bool(snapshot.get("northgate_inspected", false)) else ""
	for land_id_value in land_subtitles.keys():
		var subtitle_land_id := String(land_id_value)
		var subtitle := land_subtitles.get(subtitle_land_id) as Label3D
		subtitle.visible = (
			labels_visible
			and atlas_is_focused
			and subtitle_land_id == selected_id
			and not subtitle.text.is_empty()
		)


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
