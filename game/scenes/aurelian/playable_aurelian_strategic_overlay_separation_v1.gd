extends CanvasLayer

const MAP_PREFIX := "map_"
const WORLD_PREFIX := "world_"

var _controller: Node
var _panel: PanelContainer
var _header: Label
var _primary: Label
var _context: Label
var _controls: Label
var _last_state := ""
var _suppressed_labels: Dictionary = {}
var _core_hud_was_visible := true


func _ready() -> void:
	_controller = get_parent()
	_build_overlay()
	_refresh()


func _process(_delta: float) -> void:
	_refresh()


func presentation_for_state(state_name: String) -> Dictionary:
	if state_name.begins_with(MAP_PREFIX):
		return _map_presentation(state_name)
	if state_name.begins_with(WORLD_PREFIX):
		return _world_presentation(state_name)
	return {"visible": false, "view": "", "primary": "", "context": ""}


func _map_presentation(state_name: String) -> Dictionary:
	var primary := "EAST ROUTE | ORIGIN LAND"
	var context := "OWNERSHIP  UNCLAIMED    NETWORK  DORMANT    FRONTIER  NORTH RIDGE"
	if state_name == "map_east_route_selected":
		primary = "SELECTED | EAST ROUTE"
		context = "OBJECTIVE  CLAIM ORIGIN    NETWORK  DORMANT    FRONTIER  NORTH RIDGE"
	elif state_name in ["map_east_route_claimed", "map_east_route_connected", "map_east_route_in_use"]:
		primary = "OWNED | EAST ROUTE"
		context = "CAPITAL  GREENVALE    NETWORK  EAST ROUTE    FRONTIER  NORTH RIDGE"
	elif state_name in ["map_greenvale_city", "map_aurelian_homeland", "map_national_mandate_active"]:
		primary = "HEARTLAND | GREENVALE"
		context = "OWNERSHIP  1 LAND    NETWORK  EAST ROUTE    FRONTIER  NORTH RIDGE"
	elif state_name == "map_aurelian_imperial_heartland":
		primary = "IMPERIAL HEARTLAND | GREENVALE"
		context = "OWNERSHIP  EAST ROUTE    NETWORK  ACTIVE    FRONTIER  NORTH RIDGE"
	elif state_name in ["map_first_imperial_expansion_north_ridge_available", "map_first_imperial_expansion_north_ridge_inspected"]:
		primary = "FRONTIER OBJECTIVE | NORTH RIDGE"
		context = "CAPITAL  GREENVALE    ORIGIN  EAST ROUTE    ACTION  CLAIM LAND 2"
	elif state_name == "map_first_imperial_expansion_two_lands_claimed":
		primary = "OWNED | EAST ROUTE + NORTH RIDGE"
		context = "CAPITAL  GREENVALE    NETWORK  TWO LANDS    FRONTIER  SECURED"
	return {"visible": true, "view": "MAP  |  WHERE", "primary": primary, "context": context}


func _world_presentation(state_name: String) -> Dictionary:
	var primary := "AURELIAN | CHOOSE A DIRECTION"
	var context := "POLITY  UNFOUNDED    ORIGIN  EAST ROUTE    DIRECTION  OPEN"
	if state_name in ["world_trade_selected", "world_trade_route_active", "world_first_trade_underway"]:
		primary = "AURELIAN | EASTERN TRADE"
		context = "POLITY  EMERGING    ORIGIN  GREENVALE    DIRECTION  EAST"
	elif state_name == "world_first_city_recognized":
		primary = "GREENVALE | FIRST CITY"
		context = "POLITY  EMERGING    CAPITAL  GREENVALE    DIRECTION  FOUND NATION"
	elif state_name in ["world_first_nation_founded", "world_national_mandate_underway"]:
		primary = "AURELIAN | FIRST NATION"
		context = "CAPITAL  GREENVALE    SCALE  ONE LAND    DIRECTION  EXPAND"
	elif state_name == "world_first_empire_proclaimed":
		primary = "AURELIAN EMPIRE | GREENVALE"
		context = "SCALE  ONE LAND    CAPITAL  GREENVALE    NEXT  NORTH RIDGE"
	elif state_name == "world_first_imperial_expansion_north_ridge_direction":
		primary = "EXPANSION DIRECTION | NORTH RIDGE"
		context = "EMPIRE  AURELIAN    ORIGIN  EAST ROUTE    NEXT  CLAIM LAND 2"
	elif state_name == "world_first_imperial_expansion_two_land_footprint":
		primary = "AURELIAN EMPIRE | TWO-LAND FOOTPRINT"
		context = "CAPITAL  GREENVALE    LANDS  EAST ROUTE + NORTH RIDGE    NEXT  HOLD"
	return {"visible": true, "view": "WORLD  |  WHY / DIRECTION", "primary": primary, "context": context}


func _build_overlay() -> void:
	_panel = PanelContainer.new()
	_panel.name = "StrategicOverlayPanel"
	_panel.offset_left = 36.0
	_panel.offset_top = 30.0
	_panel.offset_right = 704.0
	_panel.offset_bottom = 198.0
	_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var panel_style := StyleBoxFlat.new()
	panel_style.bg_color = Color("26342fff")
	panel_style.border_color = Color("8aa99aff")
	panel_style.set_border_width_all(1)
	panel_style.corner_radius_top_left = 3
	panel_style.corner_radius_top_right = 3
	panel_style.corner_radius_bottom_left = 3
	panel_style.corner_radius_bottom_right = 3
	panel_style.content_margin_left = 24.0
	panel_style.content_margin_right = 24.0
	panel_style.content_margin_top = 16.0
	panel_style.content_margin_bottom = 16.0
	_panel.add_theme_stylebox_override("panel", panel_style)
	add_child(_panel)

	var stack := VBoxContainer.new()
	stack.add_theme_constant_override("separation", 6)
	_panel.add_child(stack)

	_header = Label.new()
	_header.add_theme_font_size_override("font_size", 18)
	_header.add_theme_color_override("font_color", Color("c9ded3ff"))
	stack.add_child(_header)

	_primary = Label.new()
	_primary.add_theme_font_size_override("font_size", 24)
	_primary.add_theme_color_override("font_color", Color("ffffffff"))
	stack.add_child(_primary)

	_context = Label.new()
	_context.add_theme_font_size_override("font_size", 14)
	_context.add_theme_color_override("font_color", Color("b8c8c0ff"))
	stack.add_child(_context)

	_controls = Label.new()
	_controls.add_theme_font_size_override("font_size", 14)
	_controls.add_theme_color_override("font_color", Color("d9e5deff"))
	stack.add_child(_controls)


func _refresh() -> void:
	if _controller == null:
		return
	var state_name := String(_controller.get("entry_state"))
	var strategic := state_name.begins_with(MAP_PREFIX) or state_name.begins_with(WORLD_PREFIX)
	if strategic:
		_suppress_world_space_labels()
		_set_core_hud_visible(false)
		var core_controls := _controller.get("controls_label") as Label
		_controls.text = core_controls.text if core_controls != null else ""
	else:
		_restore_world_space_labels()
		_set_core_hud_visible(true)
	if state_name == _last_state:
		return
	_last_state = state_name
	var presentation := presentation_for_state(state_name)
	_panel.visible = bool(presentation.get("visible", false))
	if not _panel.visible:
		return
	_header.text = String(presentation.get("view", ""))
	_primary.text = String(presentation.get("primary", ""))
	_context.text = String(presentation.get("context", ""))
	print("AURELIAN_STRATEGIC_OVERLAY=%s:%s" % [state_name, _primary.text])


func _suppress_world_space_labels() -> void:
	for node in _walk(_controller):
		if node is Label3D:
			var label := node as Label3D
			var key := label.get_instance_id()
			if not _suppressed_labels.has(key):
				_suppressed_labels[key] = {"node": label, "visible": label.visible}
			label.visible = false


func _restore_world_space_labels() -> void:
	# The controller refreshes every Label3D for the newly entered Village state
	# before this child processes the frame. Do not overwrite that authoritative
	# state with visibility captured from an earlier Map or World frame.
	_suppressed_labels.clear()


func _walk(root: Node) -> Array[Node]:
	var result: Array[Node] = []
	var pending: Array[Node] = [root]
	while not pending.is_empty():
		var node := pending.pop_back()
		result.append(node)
		for child in node.get_children():
			pending.append(child)
	return result


func _set_core_hud_visible(make_visible: bool) -> void:
	var core_hud := _controller.get("hud_layer") as CanvasLayer
	if core_hud == null or core_hud == self:
		return
	if not make_visible and core_hud.visible:
		_core_hud_was_visible = true
		core_hud.visible = false
	elif make_visible and _core_hud_was_visible:
		core_hud.visible = true
