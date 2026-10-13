extends SceneTree

const HOME_ID := "PN-A01-001"
const FRONTIER_ID := "PN-A01-002"
var failures: Array[String] = []


func _initialize() -> void:
	call_deferred("_run")


func _check(condition: bool, label: String) -> void:
	if not condition:
		failures.append(label)
		push_error("PN_PLAYABLE_RUNTIME_FAIL: %s" % label)


func _run() -> void:
	root.content_scale_size = Vector2i(1440, 900)
	root.size = Vector2i(1440, 900)
	var packed := load("res://pixel_nations/playable_core.tscn") as PackedScene
	_check(packed != null, "scene_loads")
	if packed == null:
		quit(1)
		return
	var runtime = packed.instantiate()
	runtime.controller = null
	root.add_child(runtime)
	await process_frame
	await process_frame
	await create_timer(0.5).timeout
	var save_path := "user://pixel-nations-runtime-contract.json"
	DirAccess.remove_absolute(ProjectSettings.globalize_path(save_path))
	runtime.controller.save_path = save_path
	var home_world: Vector2 = runtime.canonical_center_world(HOME_ID)
	_check(is_finite(home_world.x), "home_geometry_available")
	var player = runtime.world.get_node("Player")
	var home_screen: Vector2 = player.camera.unproject_position(
		Vector3(home_world.x, 0.0, home_world.y)
	)
	_check(Rect2(Vector2.ZERO, Vector2(root.size)).has_point(home_screen), "home_projects_inside_viewport")
	await _click_position(home_screen)
	_check(String(runtime.controller.current_snapshot().get("selected_land_id", "")) == HOME_ID, "pointer_raycast_selects_home")
	await _click_control(runtime.claim_button)
	_check(String(runtime.controller.current_snapshot().get("claimed_land_id", "")) == HOME_ID, "claim_button_claims_home")
	await process_frame
	_capture("world-claimed")
	await _click_control(runtime.enter_button)
	await process_frame
	await create_timer(0.6).timeout
	_check(String(runtime.controller.current_snapshot().get("view", "")) == "village", "enter_button_opens_village")
	_check(runtime.village != null, "real_village_scene_instantiated")
	await _click_control(runtime.road_button)
	_check(bool(runtime.controller.current_snapshot().get("road_built", false)), "road_action_built")
	_check(int(runtime.controller.current_snapshot().get("stone", -1)) == 5, "road_costs_five_stone")
	await process_frame
	_capture("village-road-built")
	await _click_control(runtime.return_button)
	await process_frame
	var world_snapshot: Dictionary = runtime.controller.current_snapshot()
	_check(String(world_snapshot.get("view", "")) == "world", "return_button_opens_world")
	_check(bool(world_snapshot.get("road_built", false)), "world_reports_road")
	_check(String(world_snapshot.get("nation_status", "")) == "not_founded", "nation_status_truthful")
	runtime.controller.session.state = runtime.controller.session.state.duplicate(true)
	runtime.controller.session.state["selected_land_id"] = ""
	runtime.controller.session.state["claimed_land_id"] = ""
	runtime.controller.session.state["settlement"] = {
		"founded": false, "name": "", "built_improvements": []
	}
	_check(runtime.controller.load_game(), "saved_game_reopens")
	var reopened: Dictionary = runtime.controller.current_snapshot()
	_check(String(reopened.get("view", "")) == "world", "reopen_starts_world")
	_check(bool(reopened.get("road_built", false)), "reopen_keeps_road")
	_check(String(reopened.get("claimed_land_id", "")) == HOME_ID, "reopen_keeps_claim")
	var frontier_world: Vector2 = runtime.canonical_center_world(FRONTIER_ID)
	_check(is_finite(frontier_world.x), "frontier_geometry_available")
	var frontier_screen: Vector2 = player.camera.unproject_position(
		Vector3(frontier_world.x, 0.0, frontier_world.y)
	)
	_check(Rect2(Vector2.ZERO, Vector2(root.size)).has_point(frontier_screen), "frontier_projects_inside_viewport")
	await _click_position(frontier_screen)
	_check(String(runtime.controller.current_snapshot().get("selected_land_id", "")) == FRONTIER_ID, "pointer_raycast_selects_frontier")
	await _click_control(runtime.inspect_button)
	var inspected: Dictionary = runtime.controller.current_snapshot()
	_check(bool(inspected.get("riverbend_inspected", false)), "frontier_inspection_recorded")
	_check(int(inspected.get("claimed_lands", -1)) == 1, "inspection_does_not_invent_claim")
	_check(String(inspected.get("next_goal", "")) == "Choose whether to claim Riverbend", "inspection_reveals_honest_next_goal")
	runtime.controller.session.state["inspected_land_ids"] = []
	_check(runtime.controller.load_game(), "frontier_inspection_reopens")
	var inspected_reopened: Dictionary = runtime.controller.current_snapshot()
	_check(bool(inspected_reopened.get("riverbend_inspected", false)), "reopen_keeps_frontier_inspection")
	await process_frame
	_capture("world-frontier-inspected")
	if failures.is_empty():
		print("PN_PLAYABLE_POINTER_PATH=PASS")
		print("PN_PLAYABLE_RUNTIME_CONTRACT=PASS")
		quit(0)
	else:
		print("PN_PLAYABLE_RUNTIME_CONTRACT=FAIL count=%d" % failures.size())
		quit(1)


func _click_control(control: BaseButton) -> void:
	_check(control.visible and not control.disabled, "%s_is_clickable" % control.name)
	await _click_position(control.get_global_rect().get_center())


func _click_position(position: Vector2) -> void:
	root.warp_mouse(position)
	var motion := InputEventMouseMotion.new()
	motion.position = position
	motion.global_position = position
	root.push_input(motion)
	await process_frame
	for pressed in [true, false]:
		var event := InputEventMouseButton.new()
		event.button_index = MOUSE_BUTTON_LEFT
		event.pressed = pressed
		event.position = position
		event.global_position = position
		root.push_input(event)
		await process_frame
	await physics_frame


func _capture(stem: String) -> void:
	var folder := OS.get_environment("PN_CLOUD_EVIDENCE_DIR")
	if folder.is_empty():
		return
	var image := root.get_viewport().get_texture().get_image()
	if image.get_size() != Vector2i(1440, 900):
		failures.append("%s_frame_dimensions" % stem)
		return
	image.save_png(folder.path_join("%s-1440x900.png" % stem))
	image.resize(360, 225, Image.INTERPOLATE_LANCZOS)
	image.save_png(folder.path_join("%s-360x225.png" % stem))
