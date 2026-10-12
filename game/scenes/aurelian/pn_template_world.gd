extends Node3D

# Uses the COMPLETE pinned OpenGS map scene, camera and terrain materials.
# All gameplay semantics come from the canonical Pixel Nations controller.
const BridgeScript = preload("res://scenes/aurelian/pn_template_bridge.gd")
const ID_TEXTURE := "res://_pn_templates/world/map/map_data/pn_aurelian_land_ids.png"
const LAND_JSON := "res://_pn_templates/world/map/map_data/pn_aurelian_lands.json"

var bridge: Node
var land_records: Array = []
var land_mask: Image
var selected_land_id := ""
var info: Label
var progress: Label
var feedback: Label
var choose_land: OptionButton
var claim_button: Button
var enter_button: Button

func _ready() -> void:
	_install_opengs_camera_actions()
	bridge = get_tree().root.get_node_or_null("PNGameBridge")
	if bridge == null:
		bridge = BridgeScript.new()
		bridge.name = "PNGameBridge"
		get_tree().root.add_child(bridge)

	# The upstream 3D map, materials and camera remain intact.
	# The expensive donor political-map runtime is not initialized here:
	# real selection uses Pixel Nations' own thirty canonical polygons.
	$MapModes.hide()
	$ProvinceSelected.hide()
	# Imported Texture2D survives export; direct Image.load_from_file does not.
	var id_texture := load(ID_TEXTURE) as Texture2D
	land_mask = id_texture.get_image() if id_texture != null else Image.new()
	var parsed = JSON.parse_string(FileAccess.get_file_as_string(LAND_JSON))
	land_records = parsed if parsed is Array else []
	if land_records.size() != 30:
		push_error("PN_WORLD_CANONICAL_LANDS_NOT_30")
	_make_ui()
	_refresh()
	print("PN_LIVE_ATLAS_READY thirty=",land_records.size())

func _install_opengs_camera_actions() -> void:
	# Original OpenGS input actions live in its project.godot. Since we embed
	# the complete map into Pixel Nations, re-register the necessary actions.
	var keys := {
		"camera_move_forward": KEY_W,
		"camera_move_backward": KEY_S,
		"camera_move_left": KEY_A,
		"camera_move_right": KEY_D,
		"camera_rotate_left": KEY_Q,
		"camera_rotate_right": KEY_E,
		"camera_rotate_up": KEY_Z,
		"camera_rotate_down": KEY_X,
	}
	for name in keys:
		if not InputMap.has_action(name):
			InputMap.add_action(name)
		var event := InputEventKey.new()
		event.physical_keycode = keys[name]
		InputMap.action_add_event(name,event)
	for pair in [
		["camera_zoom_in", MOUSE_BUTTON_WHEEL_UP],
		["camera_zoom_out", MOUSE_BUTTON_WHEEL_DOWN],
		["camera_rotate_mouse", MOUSE_BUTTON_RIGHT],
		["province_select", MOUSE_BUTTON_LEFT],
	]:
		var name: String = pair[0]
		if not InputMap.has_action(name):
			InputMap.add_action(name)
		var event := InputEventMouseButton.new()
		event.button_index = pair[1]
		InputMap.action_add_event(name,event)


func _make_ui() -> void:
	var layer := CanvasLayer.new()
	layer.name = "PixelNationsWorldHUD"
	layer.layer = 120
	add_child(layer)
	var top := Panel.new()
	top.position = Vector2(0,0)
	top.size = Vector2(1440,78)
	var style := StyleBoxFlat.new()
	style.bg_color = Color("#101f26")
	style.border_color = Color("#8d7546")
	style.set_border_width_all(1)
	top.add_theme_stylebox_override("panel",style)
	layer.add_child(top)
	_label(top, "PIXEL NATIONS", Vector2(26,9),Vector2(405,40),29,Color("#e9d1a1"))
	_label(top,"WORLD  /  AURELIAN BASIN  /  SECTOR A-01",Vector2(28,52),Vector2(650,22),13,Color("#a5bab3"))
	_label(top, "ONE LAND CAN BECOME AN EMPIRE",Vector2(1020,27),Vector2(410,22),13,Color("#dfbc7d"))

	var side := Panel.new()
	side.position = Vector2(1090,111)
	side.size = Vector2(330,532)
	side.add_theme_stylebox_override("panel",style)
	layer.add_child(side)
	_label(side,"YOUR FRONTIER",Vector2(18,18),Vector2(300,34),23,Color("#f4d79f"))
	_label(side,"Thirty charted lands · One beginning",Vector2(18,55),Vector2(305,30),13,Color("#bbc9bc"))
	choose_land=OptionButton.new()
	choose_land.position=Vector2(16,100)
	choose_land.size=Vector2(296,42)
	side.add_child(choose_land)
	for row in land_records:
		choose_land.add_item("%s · %s" % [str(row.get("id","")),str(row.get("name",""))])
	choose_land.item_selected.connect(_choose_by_index)
	info=_label(side,"Select a land on the map",Vector2(18,160),Vector2(302,105),17,Color("#e7e4ce"))
	claim_button=_button(side,"CLAIM SELECTED LAND",Vector2(18,270),Vector2(292,44),_claim)
	enter_button=_button(side,"ENTER GREENGATE",Vector2(18,327),Vector2(292,44),_enter)
	progress=_label(side,"0 / 30 lands",Vector2(18,397),Vector2(290,67),17,Color("#d3d8bc"))
	feedback=_label(side,"Click a province or choose from the list.",Vector2(18,471),Vector2(296,48),13,Color("#c1b895"))

	var footer:=Panel.new()
	footer.position=Vector2(22,824)
	footer.size=Vector2(720,48)
	footer.add_theme_stylebox_override("panel",style)
	layer.add_child(footer)
	_label(footer,"A-01   ·   Claim Greenvale → Enter Greengate → Build → Return",Vector2(13,14),Vector2(680,24),14,Color("#e8cd96"))

func _label(parent:Control, text:String, pos:Vector2, dim:Vector2, size:int, color:Color) -> Label:
	var label := Label.new()
	label.text=text
	label.position=pos
	label.size=dim
	label.add_theme_color_override("font_color",color)
	label.add_theme_font_size_override("font_size",size)
	label.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
	parent.add_child(label)
	return label

func _button(parent:Control, text:String, pos:Vector2, dim:Vector2, callback:Callable) -> Button:
	var btn := Button.new()
	btn.text=text
	btn.position=pos
	btn.size=dim
	btn.pressed.connect(callback)
	parent.add_child(btn)
	return btn

func _on_player_province_selected(world_pos: Vector2) -> void:
	if land_mask == null or land_mask.is_empty():
		return
	# OpenGS' retained scene uses a 500×250 world plane.
	var point = Vector2i(
		roundi((world_pos.x + 250.0) * float(land_mask.get_width()) / 500.0),
		roundi((world_pos.y + 125.0) * float(land_mask.get_height()) / 250.0)
	)
	if point.x < 0 or point.y < 0 or point.x >= land_mask.get_width() or point.y >= land_mask.get_height():
		return
	var ordinal := roundi(land_mask.get_pixel(point.x,point.y).r*255)
	if ordinal >= 1 and ordinal <= land_records.size():
		_select_land(str(land_records[ordinal-1].get("id","")))

func _choose_by_index(index:int) -> void:
	if index >= 0 and index < land_records.size():
		_select_land(str(land_records[index].get("id","")))

func _select_land(id:String) -> void:
	if not bridge.core.select_land_from_map(id):
		# Re-selecting the current plot is legitimate; ignore only invalid ID.
		if not bridge.core.current_snapshot().get("selected_land_id","") == id:
			feedback.text="This land cannot be selected."
			return
	selected_land_id=id
	for index in range(land_records.size()):
		if str(land_records[index].get("id","")) == id:
			choose_land.select(index)
			break
	feedback.text="Selected: " + id
	_refresh()

func _claim() -> void:
	if bridge.core.claim_selected_land():
		bridge.core.save_game()
		feedback.text="Land claimed. Greengate can now be founded."
	else:
		feedback.text="Choose an available land first. Only one first claim."
	_refresh()

func _enter() -> void:
	if selected_land_id != "PN-A01-001":
		feedback.text="Greengate starts in Greenvale (PN-A01-001)."
		return
	if not bridge.enter_village():
		feedback.text="Claim Greenvale first to enter Greengate."

func _refresh() -> void:
	var data:Dictionary = bridge.core.current_snapshot()
	var selected=str(data.get("selected_land_id",""))
	selected_land_id=selected
	var claim=str(data.get("claimed_land_id",""))
	var name="Unselected land"
	for index in range(land_records.size()):
		if str(land_records[index].get("id","")) == selected:
			name=str(land_records[index].get("name",""))
			choose_land.select(index)
			break
	info.text="%s\n%s\n%s" % [name,selected if not selected.is_empty() else "Choose one of the 30 lands",
		"CLAIMED" if selected == claim and not claim.is_empty() else "Not claimed"]
	progress.text="%d / %d lands claimed\nGreengate: %s   ·   Road: %s" % [
		int(data.get("claimed_lands",0)),int(data.get("charted_lands",30)),
		"Founded" if data.get("settlement_founded",false) else "Not founded",
		"Built" if data.get("road_built",false) else "Not built"
	]
	claim_button.disabled=selected.is_empty() or not claim.is_empty()
	enter_button.disabled=selected != "PN-A01-001" or claim != "PN-A01-001"
