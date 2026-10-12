extends SceneTree

const HOME_ID := "PN-A01-001"
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
	runtime._on_world_position_selected(home_world)
	_check(String(runtime.controller.current_snapshot().get("selected_land_id", "")) == HOME_ID, "canonical_hit_selects_home")
	runtime.claim_button.pressed.emit()
	_check(String(runtime.controller.current_snapshot().get("claimed_land_id", "")) == HOME_ID, "claim_button_claims_home")
	await process_frame
	_capture("world-claimed")
	runtime.enter_button.pressed.emit()
	await process_frame
	await create_timer(0.6).timeout
	_check(String(runtime.controller.current_snapshot().get("view", "")) == "village", "enter_button_opens_village")
	_check(runtime.village != null, "real_village_scene_instantiated")
	runtime.road_button.pressed.emit()
	_check(bool(runtime.controller.current_snapshot().get("road_built", false)), "road_action_built")
	_check(int(runtime.controller.current_snapshot().get("stone", -1)) == 5, "road_costs_five_stone")
	await process_frame
	_capture("village-road-built")
	runtime.return_button.pressed.emit()
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
	await process_frame
	_capture("world-reopened")
	if failures.is_empty():
		print("PN_PLAYABLE_RUNTIME_CONTRACT=PASS")
		quit(0)
	else:
		print("PN_PLAYABLE_RUNTIME_CONTRACT=FAIL count=%d" % failures.size())
		quit(1)


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
