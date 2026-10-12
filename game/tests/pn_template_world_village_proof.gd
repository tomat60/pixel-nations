extends SceneTree

const WORLD := "res://_pn_templates/world/game/main_game.tscn"
const VILLAGE := "res://_pn_templates/village/scenes/approved.tscn"

func _initialize() -> void:
	call_deferred("_proof")

func _frame(name: String) -> void:
	var img := root.get_viewport().get_texture().get_image()
	if img.get_size() != Vector2i(1440,900):
		push_error("PN_TEMPLATE_BAD_FRAME_SIZE: "+str(img.get_size()))
		quit(15)
		return
	var dir := OS.get_environment("PN_CLOUD_EVIDENCE_DIR")
	if img.save_png(dir.path_join(name + "-1440x900.png")) != OK:
		push_error("PN_TEMPLATE_FRAME_SAVE_FAILED")
		quit(16)
		return
	img.resize(360,225,Image.INTERPOLATE_LANCZOS)
	if img.save_png(dir.path_join(name + "-360x225.png")) != OK:
		push_error("PN_TEMPLATE_THUMB_SAVE_FAILED")
		quit(17)
		return
	print("PN_TEMPLATE_RENDER_FRAME=PASS "+name)

func _proof() -> void:
	root.content_scale_size=Vector2i(1440,900)
	root.size=Vector2i(1440,900)
	if change_scene_to_file(WORLD) != OK:
		push_error("PN_TEMPLATE_WORLD_LOAD_FAILED")
		quit(2)
		return
	await process_frame
	await process_frame
	await create_timer(0.7).timeout
	var world:=current_scene
	if world == null or not world.has_method("_select_land"):
		push_error("PN_TEMPLATE_WORLD_ENTRY_FAILED")
		quit(3)
		return
	world._select_land("PN-A01-001")
	world._claim()
	if world.bridge.core.current_snapshot().get("claimed_land_id","") != "PN-A01-001":
		push_error("PN_TEMPLATE_CLAIM_FAILED")
		quit(4)
		return
	_frame("aurelian-world")
	world._enter()
	await process_frame
	await process_frame
	await create_timer(0.8).timeout
	var village:=current_scene
	if village == null or not village.has_method("_pn_build_road"):
		push_error("PN_TEMPLATE_VILLAGE_ENTRY_FAILED")
		quit(5)
		return
	if village.sim == null:
		push_error("PN_TEMPLATE_DONOR_SIM_MISSING")
		quit(6)
		return
	village._pn_build_road()
	var bridge=root.get_node_or_null("PNGameBridge")
	if bridge == null or not bool(bridge.core.current_snapshot().get("road_built",false)):
		push_error("PN_TEMPLATE_REAL_ROAD_NOT_BUILT")
		quit(7)
		return
	_frame("greengate-village")
	village._pn_return_world()
	await process_frame
	await process_frame
	await create_timer(0.5).timeout
	world=current_scene
	if world == null or not world.has_method("_enter"):
		push_error("PN_TEMPLATE_WORLD_RETURN_FAILED")
		quit(8)
		return
	if not bool(bridge.core.current_snapshot().get("road_built",false)):
		push_error("PN_TEMPLATE_PROGRESS_NOT_SAVED")
		quit(9)
		return
	_frame("aurelian-after-return")
	world._enter()
	await process_frame
	await process_frame
	await create_timer(0.5).timeout
	village=current_scene
	if village == null or village.sim == null:
		push_error("PN_TEMPLATE_REENTER_FAILED")
		quit(10)
		return
	if not bool(bridge.core.current_snapshot().get("road_built",false)):
		push_error("PN_TEMPLATE_REOPEN_LOST_PROGRESS")
		quit(11)
		return
	print("PN_TEMPLATE_WORLD_VILLAGE_BUILD_WORLD_REENTER=PASS")
	quit(0)
