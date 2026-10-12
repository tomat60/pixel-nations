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
var road_button: Button
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
	var player := world.get_node("Player")
	var donor_handler := Callable(world, "_on_player_province_selected")
	if player.province_selected.is_connected(donor_handler):
		player.province_selected.disconnect(donor_handler)
	player.province_selected.connect(_on_world_position_selected)
	player.position = Vector3(-35.0, 0.0, -46.0)
	player.camera.position.z = 220.0
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


func _build_ui() -> void:
	ui_layer = CanvasLayer.new()
	ui_layer.name = "PlayableUI"
	add_child(ui_layer)
	panel = PanelContainer.new()
	panel.name = "ProgressPanel"
	panel.set_anchors_preset(Control.PRESET_TOP_RIGHT)
	panel.position = Vector2(-380, 24)
	panel.size = Vector2(356, 560)
	ui_layer.add_child(panel)
	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 20)
	margin.add_theme_constant_override("margin_top", 18)
	margin.add_theme_constant_override("margin_right", 20)
	margin.add_theme_constant_override("margin_bottom", 18)
	panel.add_child(margin)
	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 12)
	margin.add_child(column)
	title_label = _label("Sector A-01 / Aurelian Basin", 22)
	identity_label = _label("Select a canonical land on the map", 18)
	detail_label = _label("30 charted lands · 0 claimed", 15)
	goal_label = _label("Next: select Greenvale", 15)
	goal_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	for label in [title_label, identity_label, detail_label, goal_label]:
		column.add_child(label)
	claim_button = _button("Claim selected land", "ClaimButton", _claim)
	enter_button = _button("Enter Greengate", "EnterButton", _enter)
	road_button = _button("Build village road · 5 stone", "RoadButton", _road)
	save_button = _button("Save progress", "SaveButton", _save)
	return_button = _button("Return to World", "ReturnButton", _return_world)
	for button in [claim_button, enter_button, road_button, save_button, return_button]:
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
	button.custom_minimum_size = Vector2(0, 48)
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


func _claim() -> void:
	controller.claim_selected_land()


func _enter() -> void:
	controller.enter_selected_land()


func _road() -> void:
	if controller.build_road():
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
	panel.move_to_front()


func _show_world() -> void:
	if village != null:
		village.process_mode = Node.PROCESS_MODE_DISABLED
		village.queue_free()
		village = null
	world.visible = true
	world.process_mode = Node.PROCESS_MODE_INHERIT
	panel.move_to_front()


func _render_snapshot(snapshot: Dictionary) -> void:
	var view := String(snapshot.get("view", "world"))
	var selected_id := String(snapshot.get("selected_land_id", ""))
	if view == "village":
		title_label.text = "Greengate · %s" % String(snapshot.get("land_id", ""))
		identity_label.text = "Founded settlement"
		detail_label.text = "Stone: %d · Road: %s" % [
			int(snapshot.get("stone", 0)),
			"built" if bool(snapshot.get("road_built", false)) else "not built",
		]
		goal_label.text = "Build one persistent road, save, then return to the World."
	else:
		title_label.text = "Sector A-01 / Aurelian Basin"
		identity_label.text = _land_title(selected_id)
		detail_label.text = "%d/%d claimed · Greengate: %s · Road: %s · Nation: %s" % [
			int(snapshot.get("claimed_lands", 0)), int(snapshot.get("charted_lands", 30)),
			"founded" if bool(snapshot.get("settlement_founded", false)) else "not founded",
			"built" if bool(snapshot.get("road_built", false)) else "not built",
			String(snapshot.get("nation_status", "not_founded")),
		]
		goal_label.text = "Next expansion goal: %s" % String(snapshot.get("next_goal", ""))
	claim_button.visible = view == "world"
	enter_button.visible = view == "world"
	road_button.visible = view == "village"
	return_button.visible = view == "village"
	save_button.visible = true
	claim_button.disabled = selected_id.is_empty() or not String(snapshot.get("claimed_land_id", "")).is_empty()
	enter_button.disabled = selected_id != "PN-A01-001" or String(snapshot.get("claimed_land_id", "")) != "PN-A01-001"
	road_button.disabled = bool(snapshot.get("road_built", false)) or int(snapshot.get("stone", 0)) < 5


func _land_title(land_id: String) -> String:
	if land_id.is_empty():
		return "Select a canonical land on the map"
	for land_value in lands:
		var land: Dictionary = land_value
		if String(land.get("id", "")) == land_id:
			return "%s · %s · %s" % [land_id, String(land.get("name", "")), String(land.get("region", ""))]
	return land_id
