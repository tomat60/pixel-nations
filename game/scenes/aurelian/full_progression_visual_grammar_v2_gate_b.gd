extends "res://scenes/aurelian/full_progression_visual_grammar_v2.gd"

const GATE_B_MANIFEST_PATH := "res://scenes/aurelian/full_progression_visual_grammar_v2_gate_b_manifest.json"
const GATE_B_VIEWS := ["village", "map", "world"]

var gate_b_contract: Dictionary = {}
var gate_b_view := "village"
var gate_b_sequence_mode := false
var gate_b_sequence_frame := 0
var gate_b_sequence_sent := false

func _ready() -> void:
	gate_b_contract = _load_gate_b_contract()
	if gate_b_contract.is_empty():
		get_tree().quit(241)
		return

	gate_b_sequence_mode = OS.get_environment("AURELIAN_CAPTURE_GATE_B_INPUT_SEQUENCE") == "1"
	if gate_b_sequence_mode:
		var sequence_step := clampi(int(OS.get_environment("AURELIAN_GATE_B_SEQUENCE_STEP")), 0, V2_STAGES.size() - 1)
		OS.set_environment("AURELIAN_PROGRESSION_STAGE", V2_STAGES[sequence_step])
		OS.set_environment("AURELIAN_PROGRESSION_VIEW", "village")
		OS.set_environment("AURELIAN_CAPTURE_PRESET", "")

	var preset := OS.get_environment("AURELIAN_CAPTURE_PRESET").to_lower()
	var requested_view := OS.get_environment("AURELIAN_PROGRESSION_VIEW").to_lower()
	if GATE_B_VIEWS.has(preset):
		gate_b_view = preset
	elif GATE_B_VIEWS.has(requested_view):
		gate_b_view = requested_view

	super()

	if preset.is_empty() and not cameras.is_empty():
		_activate_camera(gate_b_view)
		set_process(true)
	print("FULL_PROGRESSION_VISUAL_GRAMMAR_V2_GATE_B_READY=%s:%s" % [v2_stage, gate_b_view])

func _load_gate_b_contract() -> Dictionary:
	var file := FileAccess.open(GATE_B_MANIFEST_PATH, FileAccess.READ)
	if file == null:
		push_error("FULL_PROGRESSION_V2_GATE_B_MANIFEST_MISSING")
		return {}
	var payload = JSON.parse_string(file.get_as_text())
	if not payload is Dictionary:
		push_error("FULL_PROGRESSION_V2_GATE_B_MANIFEST_INVALID")
		return {}
	var contract := payload as Dictionary
	if String(contract.get("contract", "")) != "AURELIAN_FULL_PROGRESSION_VISUAL_GRAMMAR_V2_GATE_B":
		push_error("FULL_PROGRESSION_V2_GATE_B_CONTRACT_INVALID")
		return {}
	if contract.get("stages", []) != V2_STAGES or contract.get("views", []) != GATE_B_VIEWS:
		push_error("FULL_PROGRESSION_V2_GATE_B_MATRIX_INVALID")
		return {}
	return contract

func _populate_world(parent: Node) -> Node3D:
	var basin := super._populate_world(parent)
	if basin == null:
		return null

	var preset := OS.get_environment("AURELIAN_CAPTURE_PRESET").to_lower()
	var active_view := gate_b_view
	if GATE_B_VIEWS.has(preset):
		active_view = preset

	var root := Node3D.new()
	root.name = "FullProgressionVisualGrammarV2GateB_%s_%s" % [v2_stage, active_view]
	parent.add_child(root)

	if active_view == "map":
		_build_map_stage(root, v2_stage)
	elif active_view == "world":
		_build_world_stage(root, v2_stage)
	return basin

func _add_boundary_loop(
	root: Node3D,
	prefix: String,
	center: Vector2,
	radius_topology: float,
	color_value: String,
	width: float,
	height: float,
	world_height: float
) -> void:
	var points: Array[Vector2] = []
	for index in range(6):
		var angle := deg_to_rad(60.0 * float(index) + 30.0)
		points.append(center + Vector2(cos(angle), sin(angle)) * radius_topology)
	_add_boundary_polyline(root, prefix, points, true, color_value, width, height, world_height)

func _add_boundary_polyline(
	root: Node3D,
	prefix: String,
	points: Array[Vector2],
	closed: bool,
	color_value: String,
	width: float,
	height: float,
	world_height: float
) -> void:
	if points.size() < 2:
		return
	var segment_count := points.size() if closed else points.size() - 1
	for index in range(segment_count):
		var finish_index := (index + 1) % points.size()
		_add_road(
			root,
			"%s_%02d" % [prefix, index],
			points[index],
			points[finish_index],
			width,
			color_value,
			height,
			world_height
		)

func _add_network(
	root: Node3D,
	prefix: String,
	points: Array[Vector2],
	color_value: String,
	width: float,
	world_height: float
) -> void:
	for index in range(points.size() - 1):
		_add_road(
			root,
			"%s_%02d" % [prefix, index],
			points[index],
			points[index + 1],
			width,
			color_value,
			0.055,
			world_height
		)

func _build_map_stage(root: Node3D, stage_name: String) -> void:
	var greenvale := Vector2(354, 285)
	var gilded := Vector2(515, 340)
	var ridge := Vector2(700, 205)
	var fields := Vector2(405, 505)
	var forest := Vector2(245, 205)

	match stage_name:
		"land":
			_add_boundary_loop(root, "MapLandClaimBoundary", greenvale, 42.0, "#6d7256ff", 0.055, 0.055, 0.82)
		"settlement":
			_add_boundary_loop(root, "MapSettlementBoundary", greenvale, 72.0, "#777253ff", 0.060, 0.060, 0.82)
			_add_network(root, "MapSettlementRoad", [greenvale, fields], "#8b765dff", 0.070, 0.83)
			_add_standard(root, "MapSettlementAnchor", greenvale, "#a9905fff", 1.20, 0.82)
		"city":
			_add_boundary_loop(root, "MapCityBoundary", greenvale, 116.0, "#82775cff", 0.070, 0.070, 0.83)
			_add_network(root, "MapCityEastRoad", [greenvale, gilded], "#967b5cff", 0.085, 0.84)
			_add_network(root, "MapCityFieldsRoad", [greenvale, fields], "#8f765aff", 0.075, 0.84)
			_add_network(root, "MapCityForestRoad", [greenvale, forest], "#8f765aff", 0.070, 0.84)
			_add_standard(root, "MapCityCrossingNode", gilded, "#b59a67ff", 1.18, 0.84)
			_add_standard(root, "MapCityFieldsNode", fields, "#9f8d5fff", 1.08, 0.84)
		"nation":
			_build_map_stage(root, "city")
			var homeland: Array[Vector2] = [
				Vector2(175, 145), Vector2(490, 105), Vector2(760, 150),
				Vector2(790, 385), Vector2(555, 555), Vector2(245, 520), Vector2(145, 330)
			]
			_add_boundary_polyline(root, "MapNationHomeland", homeland, true, "#a28a5bff", 0.085, 0.085, 0.86)
			_add_network(root, "MapNationRidgeNetwork", [greenvale, gilded, ridge], "#b28f5fff", 0.105, 0.87)
			_add_standard(root, "MapNationCapital", greenvale, "#d3ae55ff", 1.70, 0.86)
			_add_standard(root, "MapNationRidgeSeat", ridge, "#c09d58ff", 1.38, 0.86)
		"empire":
			_build_map_stage(root, "nation")
			var imperial_extent: Array[Vector2] = [
				Vector2(105, 95), Vector2(430, 48), Vector2(760, 92),
				Vector2(860, 300), Vector2(750, 565), Vector2(525, 650),
				Vector2(250, 610), Vector2(85, 430)
			]
			_add_boundary_polyline(root, "MapEmpireExtent", imperial_extent, true, "#b69a65ff", 0.115, 0.120, 0.90)
			_add_network(root, "MapEmpireSouthAxis", [ridge, greenvale, fields], "#c09a62ff", 0.115, 0.90)
			_add_network(root, "MapEmpireWestAxis", [forest, greenvale, gilded], "#b78f5bff", 0.105, 0.90)
			_add_standard(root, "MapEmpireCapital", greenvale, "#e0b84fff", 2.05, 0.90)
			_add_standard(root, "MapEmpireRidgeProvince", ridge, "#cba25cff", 1.58, 0.90)
			_add_standard(root, "MapEmpireCrossingProvince", gilded, "#cba25cff", 1.48, 0.90)
			_add_standard(root, "MapEmpireFieldsProvince", fields, "#c0a064ff", 1.38, 0.90)

func _build_world_stage(root: Node3D, stage_name: String) -> void:
	var greenvale := Vector2(354, 285)
	var gilded := Vector2(515, 340)
	var ridge := Vector2(700, 205)
	var fields := Vector2(405, 505)
	var forest := Vector2(245, 205)
	var south := Vector2(365, 690)
	var northgate := Vector2(445, 65)

	match stage_name:
		"land":
			_add_boundary_loop(root, "WorldLandFootprint", greenvale, 48.0, "#686f55ff", 0.080, 0.070, 0.93)
			_add_standard(root, "WorldLandSeat", greenvale, "#9d8c5eff", 1.35, 0.93)
		"settlement":
			_add_boundary_loop(root, "WorldSettlementFootprint", greenvale, 88.0, "#747254ff", 0.085, 0.075, 0.94)
			_add_network(root, "WorldSettlementReach", [greenvale, gilded], "#88745aff", 0.095, 0.95)
			_add_standard(root, "WorldSettlementSeat", greenvale, "#ad9560ff", 1.50, 0.94)
		"city":
			_add_boundary_loop(root, "WorldCityRegion", Vector2(365, 320), 155.0, "#81775aff", 0.095, 0.085, 0.96)
			_add_network(root, "WorldCityNetworkEast", [forest, greenvale, gilded], "#987b59ff", 0.105, 0.97)
			_add_network(root, "WorldCityNetworkSouth", [greenvale, fields], "#92775aff", 0.095, 0.97)
			_add_standard(root, "WorldCitySeat", greenvale, "#c29f5dff", 1.72, 0.96)
			_add_standard(root, "WorldCityCrossing", gilded, "#aa8d5eff", 1.25, 0.96)
		"nation":
			var nation_extent: Array[Vector2] = [
				Vector2(155, 125), Vector2(450, 80), Vector2(760, 125),
				Vector2(820, 390), Vector2(590, 575), Vector2(245, 555), Vector2(115, 350)
			]
			_add_boundary_polyline(root, "WorldNationExtent", nation_extent, true, "#a68c5cff", 0.120, 0.110, 0.99)
			_add_network(root, "WorldNationSpine", [forest, greenvale, gilded, ridge], "#b18d5cff", 0.130, 1.00)
			_add_network(root, "WorldNationSouthLink", [greenvale, fields], "#a8865aff", 0.115, 1.00)
			_add_standard(root, "WorldNationCapital", greenvale, "#d6ad50ff", 2.05, 0.99)
			_add_standard(root, "WorldNationRidge", ridge, "#bd9858ff", 1.55, 0.99)
			_add_standard(root, "WorldNationCrossing", gilded, "#b4935cff", 1.40, 0.99)
		"empire":
			var empire_extent: Array[Vector2] = [
				Vector2(70, 65), Vector2(390, 28), Vector2(760, 58),
				Vector2(910, 285), Vector2(825, 585), Vector2(585, 760),
				Vector2(245, 735), Vector2(55, 470)
			]
			_add_boundary_polyline(root, "WorldEmpireExtent", empire_extent, true, "#bb9d65ff", 0.155, 0.145, 1.04)
			_add_network(root, "WorldEmpireEastWest", [forest, greenvale, gilded, ridge], "#c29b60ff", 0.155, 1.05)
			_add_network(root, "WorldEmpireNorthSouth", [northgate, greenvale, fields, south], "#b9915bff", 0.145, 1.05)
			_add_standard(root, "WorldEmpireCapital", greenvale, "#e4b849ff", 2.55, 1.04)
			_add_standard(root, "WorldEmpireRidge", ridge, "#c9a15aff", 1.90, 1.04)
			_add_standard(root, "WorldEmpireCrossing", gilded, "#c49d5aff", 1.72, 1.04)
			_add_standard(root, "WorldEmpireFields", fields, "#b99b62ff", 1.62, 1.04)
			_add_standard(root, "WorldEmpireForest", forest, "#b99b62ff", 1.52, 1.04)
			_add_road(root, "WorldEmpireWestFrontier", Vector2(85, 160), Vector2(70, 600), 0.18, "#77584fff", 0.16, 1.06)
			_add_road(root, "WorldEmpireNorthFrontier", Vector2(205, 70), Vector2(760, 55), 0.18, "#77584fff", 0.16, 1.06)

func _unhandled_input(event: InputEvent) -> void:
	if not event.is_action_pressed("ui_accept"):
		return
	var stage_index := V2_STAGES.find(v2_stage)
	if stage_index < 0:
		return
	if stage_index >= V2_STAGES.size() - 1:
		print("FULL_PROGRESSION_VISUAL_GRAMMAR_V2_GATE_B_INPUT_SEQUENCE_COMPLETE=%s" % v2_stage)
		get_tree().quit(0)
		return
	OS.set_environment("AURELIAN_PROGRESSION_STAGE", V2_STAGES[stage_index + 1])
	OS.set_environment("AURELIAN_PROGRESSION_VIEW", gate_b_view)
	if gate_b_sequence_mode:
		OS.set_environment("AURELIAN_GATE_B_SEQUENCE_STEP", str(stage_index + 1))
	call_deferred("_reload_gate_b_scene")

func _reload_gate_b_scene() -> void:
	var result := get_tree().reload_current_scene()
	if result != OK:
		push_error("FULL_PROGRESSION_V2_GATE_B_RELOAD_FAILED=%s" % result)
		get_tree().quit(242)

func _process(_delta: float) -> void:
	if not gate_b_sequence_mode:
		super(_delta)
		return
	gate_b_sequence_frame += 1
	if gate_b_sequence_sent or gate_b_sequence_frame < 75:
		return
	gate_b_sequence_sent = true
	var press := InputEventAction.new()
	press.action = "ui_accept"
	press.pressed = true
	Input.parse_input_event(press)
	var release := InputEventAction.new()
	release.action = "ui_accept"
	release.pressed = false
	Input.parse_input_event(release)
