extends "res://_pn_templates/village/presentation/approved_game.gd"

# Full The Free Game approved scene remains intact. Pixel Nations adds an
# unobtrusive scene navigator and authoritative one-land progression adapter.
const PN_VILLAGE_SAVE := "user://pn-greengate-village-slice-v1.json"
var pn_bridge: Node
var pn_build: Button
var pn_status: Label

func _ready() -> void:
	super._ready()
	pn_bridge = get_tree().root.get_node_or_null("PNGameBridge")
	if pn_bridge == null:
		push_error("PN_VILLAGE_CANNOT_FIND_CANONICAL_BRIDGE")
		return
	if FileAccess.file_exists(PN_VILLAGE_SAVE):
		_load_paths([PN_VILLAGE_SAVE])
	var overlay:=CanvasLayer.new()
	overlay.name="PixelNationsVillageNavigation"
	overlay.layer=150
	add_child(overlay)
	var panel:=Panel.new()
	panel.position=Vector2(12, get_viewport().get_visible_rect().size.y-142)
	panel.size=Vector2(494,126)
	var bg:=StyleBoxFlat.new()
	bg.bg_color=Color("#14262a")
	bg.border_color=Color("#d5b66d")
	bg.set_border_width_all(2)
	bg.set_corner_radius_all(5)
	panel.add_theme_stylebox_override("panel",bg)
	overlay.add_child(panel)
	var title:=Label.new()
	title.position=Vector2(14,8)
	title.size=Vector2(470,30)
	title.text="GREENGATE  ·  PN-A01-001"
	title.add_theme_color_override("font_color",Color("#ead8a7"))
	title.add_theme_font_size_override("font_size",19)
	panel.add_child(title)
	pn_build=Button.new()
	pn_build.text="BUILD FIRST ROAD  ·  5 STONE"
	pn_build.position=Vector2(14,48)
	pn_build.size=Vector2(245,38)
	pn_build.pressed.connect(_pn_build_road)
	panel.add_child(pn_build)
	var back:=Button.new()
	back.text="← WORLD MAP"
	back.position=Vector2(272,48)
	back.size=Vector2(206,38)
	back.pressed.connect(_pn_return_world)
	panel.add_child(back)
	pn_status=Label.new()
	pn_status.position=Vector2(14,96)
	pn_status.size=Vector2(466,26)
	pn_status.add_theme_color_override("font_color",Color("#d6caa9"))
	panel.add_child(pn_status)
	_pn_refresh()
	print("PN_GREENGATE_DONOR_READY")

func _pn_build_road() -> void:
	if pn_bridge == null:
		return
	var state:Dictionary=pn_bridge.core.current_snapshot()
	if state.get("road_built",false):
		pn_status.text="Road already built. This is a permanent improvement."
		return
	if int(state.get("stone",0)) < 5:
		pn_status.text="Not enough stone to build a road."
		return
	var build_cell:=Vector2i(-999,-999)
	for xx in range(2,22):
		if build_cell.x != -999:
			break
		for yy in range(2,22):
			var cell=Vector2i(xx,yy)
			if sim.can_place_road(cell).is_empty():
				build_cell=cell
				break
	if build_cell.x < 0:
		pn_status.text="No valid road cell. No resources were spent."
		return
	var result:Dictionary=sim.command("road",{"cell":build_cell})
	if not result.get("ok",false):
		pn_status.text="Village road placement failed. Progress not advanced."
		return
	if not pn_bridge.core.build_road():
		push_error("PN_VILLAGE_ROAD_CANONICAL_STATE_REJECTED_AFTER_DONOR_BUILD")
		pn_status.text="State mismatch. Return blocked until recovered."
		return
	if not _write_save(PN_VILLAGE_SAVE) or not pn_bridge.core.save_game():
		push_error("PN_VILLAGE_ROAD_SAVE_FAILED")
		pn_status.text="Save failed. Please retry before returning."
		return
	hud.refresh()
	_pn_refresh()
	print("PN_GREENGATE_REAL_ROAD_BUILT=PASS cell=",build_cell)

func _pn_return_world() -> void:
	if pn_bridge == null:
		return
	if not _write_save(PN_VILLAGE_SAVE):
		pn_status.text="Save failed. Cannot return safely."
		return
	pn_bridge.return_to_world()

func _pn_refresh() -> void:
	if pn_bridge == null:
		return
	var state:Dictionary=pn_bridge.core.current_snapshot()
	var built=bool(state.get("road_built",false))
	pn_build.disabled=built
	pn_status.text="First road built" if built else "Stone: %d   ·   Develop the first settlement" % int(state.get("stone",0))
