extends SceneTree

const HOME_ID := "PN-A01-001"
const FRONTIER_ID := "PN-A01-002"
const HIGHMERE_ID := "PN-A01-003"
const NORTHGATE_ID := "PN-A01-024"
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
	_check(String(ProjectSettings.get_setting("application/config/name", "")) == "Pixel Nations", "runnable_game_uses_canonical_identity")
	var home_world: Vector2 = runtime.canonical_center_world(HOME_ID)
	_check(is_finite(home_world.x), "home_geometry_available")
	var player = runtime.world.get_node("Player")
	_check(not runtime.world.get_node("Map/MeshInstance3D").visible, "natural_earth_surface_hidden")
	_check(runtime.atlas_root != null, "fictional_a01_atlas_instantiated")
	_check(runtime.land_materials.size() == 30, "all_canonical_lands_have_visible_surfaces")
	_check(runtime.land_labels.size() == 4, "home_and_reachable_lands_are_named")
	var substrate := runtime.atlas_root.get_node("FictionalAurelianSubstrate") as MeshInstance3D
	var substrate_material := substrate.mesh.material as StandardMaterial3D
	_check(substrate_material.albedo_texture.resource_path.ends_with("a01_atlas_substrate.png"), "painted_aurelian_substrate_installed")
	var home_material := runtime.land_materials.get(HOME_ID) as StandardMaterial3D
	_check(home_material.albedo_color.a > 0.25 and home_material.albedo_color.a < 0.50, "canonical_land_overlay_preserves_painted_geography")
	_check(runtime.panel.get_theme_stylebox("panel") is StyleBoxTexture, "pixel_nations_panel_reuses_village_parchment")
	_check(runtime.claim_button.get_theme_stylebox("normal") is StyleBoxFlat, "pixel_nations_actions_use_retained_village_button_language")
	_check(runtime.detail_label.get_theme_color("font_color") == runtime.HUD_INK, "parchment_panel_uses_readable_dark_ink")
	var home_screen: Vector2 = player.camera.unproject_position(
		Vector3(home_world.x, 0.0, home_world.y)
	)
	_check(Rect2(Vector2.ZERO, Vector2(root.size)).has_point(home_screen), "home_projects_inside_viewport")
	await _click_position(home_screen)
	_check(String(runtime.controller.current_snapshot().get("selected_land_id", "")) == HOME_ID, "pointer_raycast_selects_home")
	_check(runtime.focus_button.visible and not runtime.overview_button.visible, "selected_land_offers_focus")
	await _click_control(runtime.focus_button)
	await create_timer(0.6).timeout
	_check(runtime.atlas_is_focused, "atlas_focus_mode_enabled")
	_check(player.position.distance_to(Vector3(home_world.x, 0.0, home_world.y)) < 1.0, "atlas_focus_centers_selected_land")
	_check(absf(player.camera.position.z - runtime.ATLAS_FOCUS_ZOOM) < 1.0, "atlas_focus_uses_readable_zoom")
	_check(runtime.overview_button.visible and not runtime.focus_button.visible, "focused_land_offers_overview_recovery")
	_capture("world-home-focused")
	await _click_control(runtime.overview_button)
	await create_timer(0.6).timeout
	_check(not runtime.atlas_is_focused, "atlas_overview_mode_restored")
	_check(player.position.distance_to(runtime.ATLAS_OVERVIEW_POSITION) < 1.0, "atlas_overview_restores_position")
	_check(absf(player.camera.position.z - runtime.ATLAS_OVERVIEW_ZOOM) < 1.0, "atlas_overview_restores_zoom")
	await _click_control(runtime.claim_button)
	_check(String(runtime.controller.current_snapshot().get("claimed_land_id", "")) == HOME_ID, "claim_button_claims_home")
	await process_frame
	_check(runtime.panel.size.x <= 340.0 and runtime.panel.size.y < 420.0, "world_context_panel_is_compact")
	_check(runtime.enter_button.visible and runtime.save_button.visible, "world_shows_relevant_actions")
	_check(not runtime.claim_button.visible and not runtime.inspect_button.visible and not runtime.connect_button.visible, "world_hides_irrelevant_actions")
	_capture("world-claimed")
	await _click_control(runtime.enter_button)
	await process_frame
	await create_timer(0.6).timeout
	_check(String(runtime.controller.current_snapshot().get("view", "")) == "village", "enter_button_opens_village")
	_check(runtime.village != null, "real_village_scene_instantiated")
	_check(String(runtime.village.hud._brand.text) == "Pixel Nations", "village_brand_is_pixel_nations")
	_check(String(runtime.village.hud._credit_label.text) == "Greengate · Aurelian Basin", "village_location_is_canonical")
	_check(String(runtime.village.hud._tutorial_title.text) == "Greengate's first road", "village_onboarding_matches_product_loop")
	_check("Credits" in String(runtime.village.hud._code_button.text), "village_credits_remain_accessible")
	_check(runtime.village_paved_road == null, "canonical_road_absent_before_build")
	_check(runtime.panel.size.x <= 340.0 and runtime.panel.size.y < 460.0, "village_context_panel_is_compact")
	_check(runtime.road_button.visible and runtime.return_button.visible and runtime.save_button.visible, "village_shows_relevant_actions")
	_check(not runtime.claim_button.visible and not runtime.inspect_button.visible and not runtime.connect_button.visible, "village_hides_world_actions")
	var donor_stock_hidden := true
	for stock_button in runtime.village.hud._resource_buttons.values():
		donor_stock_hidden = donor_stock_hidden and not (stock_button as Button).visible
	_check(donor_stock_hidden, "misleading_donor_stock_not_visible")
	await _click_control(runtime.road_button)
	_check(bool(runtime.controller.current_snapshot().get("road_built", false)), "road_action_built")
	_check(int(runtime.controller.current_snapshot().get("stone", -1)) == 5, "road_costs_five_stone")
	_check(runtime.village_paved_road != null, "canonical_road_scene_created")
	if runtime.village_paved_road != null:
		_check(runtime.village_paved_road.get_child_count() == 5, "canonical_road_has_five_real_tiles")
		for tile in runtime.village_paved_road.get_children():
			_check((tile as Node3D).get_node_or_null("StoneSurface") is MeshInstance3D, "canonical_tile_uses_retained_paving_mesh")
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
	await _click_control(runtime.claim_button)
	var claimed_frontier: Dictionary = runtime.controller.current_snapshot()
	_check(bool(claimed_frontier.get("riverbend_claimed", false)), "claim_button_claims_inspected_frontier")
	_check(int(claimed_frontier.get("claimed_lands", -1)) == 2, "frontier_claim_reports_two_of_thirty")
	_check(String(claimed_frontier.get("settlement_name", "")) == "Greengate", "frontier_claim_keeps_single_settlement")
	_check(String(claimed_frontier.get("nation_status", "")) == "not_founded", "frontier_claim_does_not_invent_nation")
	_check(String(claimed_frontier.get("next_goal", "")) == "Connect Riverbend to Greengate", "frontier_claim_reveals_link_goal")
	_check(runtime.frontier_link.visible, "frontier_claim_shows_world_relationship")
	_check(String(claimed_frontier.get("frontier_link_status", "")) == "pending", "frontier_claim_link_is_pending")
	await process_frame
	_capture("world-riverbend-claimed")
	await _click_control(runtime.connect_button)
	var connected_frontier: Dictionary = runtime.controller.current_snapshot()
	_check(bool(connected_frontier.get("riverbend_connected", false)), "connect_button_completes_frontier_link")
	_check(String(connected_frontier.get("frontier_link_status", "")) == "connected", "frontier_link_reports_connected")
	_check(int(connected_frontier.get("stone", -1)) == 0, "frontier_link_costs_remaining_five_stone")
	_check(String(connected_frontier.get("next_goal", "")) == "Return to Greengate for the Riverbend stone shipment", "frontier_link_reveals_honest_next_goal")
	_check(String(connected_frontier.get("nation_status", "")) == "not_founded", "frontier_link_does_not_invent_nation")
	_check(runtime.frontier_link_material.albedo_color.g > runtime.frontier_link_material.albedo_color.r, "connected_frontier_link_turns_green")
	runtime.controller.session.state["claimed_land_ids"] = [HOME_ID]
	runtime.controller.session.state["connected_land_ids"] = []
	runtime.controller.session.state["resources"]["stone"] = 5
	_check(runtime.controller.load_game(), "frontier_claim_reopens")
	var claim_reopened: Dictionary = runtime.controller.current_snapshot()
	_check(bool(claim_reopened.get("riverbend_claimed", false)), "reopen_keeps_frontier_claim")
	_check(bool(claim_reopened.get("riverbend_connected", false)), "reopen_keeps_frontier_connection")
	_check(int(claim_reopened.get("claimed_lands", -1)) == 2, "reopen_keeps_two_claimed_lands")
	_check(int(claim_reopened.get("stone", -1)) == 0, "reopen_keeps_frontier_connection_cost")
	await process_frame
	_capture("world-riverbend-connected")
	await _click_position(home_screen)
	_check(String(runtime.controller.current_snapshot().get("selected_land_id", "")) == HOME_ID, "pointer_reselects_home_for_supply")
	await _click_control(runtime.enter_button)
	await process_frame
	await create_timer(0.6).timeout
	_check(String(runtime.controller.current_snapshot().get("view", "")) == "village", "supply_path_enters_village")
	_check(runtime.village_paved_road != null and runtime.village_paved_road.get_child_count() == 5, "saved_road_reappears_on_village_reentry")
	_check(int(runtime.controller.current_snapshot().get("stone", -1)) == 0, "village_reentry_still_uses_canonical_stock")
	await _click_control(runtime.supply_button)
	var supplied_village: Dictionary = runtime.controller.current_snapshot()
	_check(bool(supplied_village.get("riverbend_supply_delivered", false)), "supply_button_delivers_riverbend_stone")
	_check(int(supplied_village.get("stone", -1)) == 5, "riverbend_supply_restores_five_stone")
	_check(runtime.supply_button.disabled, "riverbend_supply_is_one_time")
	await process_frame
	_capture("village-riverbend-supply")
	await _click_control(runtime.return_button)
	await process_frame
	var supplied_world: Dictionary = runtime.controller.current_snapshot()
	_check(bool(supplied_world.get("riverbend_supply_delivered", false)), "world_reports_riverbend_supply")
	_check(String(supplied_world.get("next_goal", "")) == "Commission the Highmere survey in Greengate", "world_reports_highmere_survey_goal")
	runtime.controller.session.state["settlement"]["completed_orders"] = []
	runtime.controller.session.state["resources"]["stone"] = 0
	_check(runtime.controller.load_game(), "riverbend_supply_reopens")
	var supplied_reopened: Dictionary = runtime.controller.current_snapshot()
	_check(bool(supplied_reopened.get("riverbend_supply_delivered", false)), "reopen_keeps_riverbend_supply")
	_check(int(supplied_reopened.get("stone", -1)) == 5, "reopen_keeps_riverbend_supply_reward")
	await process_frame
	_capture("world-riverbend-supplied")
	await _click_position(home_screen)
	await _click_control(runtime.enter_button)
	await process_frame
	await create_timer(0.6).timeout
	await _click_control(runtime.survey_button)
	var survey_village: Dictionary = runtime.controller.current_snapshot()
	_check(bool(survey_village.get("highmere_survey_commissioned", false)), "survey_button_commissions_highmere")
	_check(int(survey_village.get("stone", -1)) == 0, "highmere_survey_spends_delivered_stone")
	_check(runtime.survey_button.disabled, "highmere_survey_is_one_time")
	await process_frame
	_capture("village-highmere-survey")
	await _click_control(runtime.return_button)
	await process_frame
	var highmere_world: Vector2 = runtime.canonical_center_world(HIGHMERE_ID)
	_check(is_finite(highmere_world.x), "highmere_geometry_available")
	var highmere_screen: Vector2 = player.camera.unproject_position(
		Vector3(highmere_world.x, 0.0, highmere_world.y)
	)
	_check(Rect2(Vector2.ZERO, Vector2(root.size)).has_point(highmere_screen), "highmere_projects_inside_viewport")
	await _click_position(highmere_screen)
	_check(String(runtime.controller.current_snapshot().get("selected_land_id", "")) == HIGHMERE_ID, "pointer_raycast_selects_highmere")
	await _click_control(runtime.inspect_button)
	var inspected_highmere: Dictionary = runtime.controller.current_snapshot()
	_check(bool(inspected_highmere.get("highmere_inspected", false)), "highmere_inspection_recorded")
	_check(int(inspected_highmere.get("claimed_lands", -1)) == 2, "highmere_inspection_does_not_claim_third_land")
	_check(String(inspected_highmere.get("nation_status", "")) == "not_founded", "highmere_inspection_does_not_invent_nation")
	_check(String(inspected_highmere.get("next_goal", "")) == "Choose whether to claim Highmere", "highmere_inspection_reveals_claim_choice")
	_check(runtime.highmere_survey_link.visible, "highmere_survey_shows_world_route")
	_check(runtime.highmere_survey_material.albedo_color.b > runtime.highmere_survey_material.albedo_color.r, "inspected_highmere_route_turns_blue")
	await process_frame
	_capture("world-highmere-inspected")
	await _click_control(runtime.claim_button)
	var claimed_highmere: Dictionary = runtime.controller.current_snapshot()
	_check(bool(claimed_highmere.get("highmere_claimed", false)), "highmere_claim_recorded")
	_check(int(claimed_highmere.get("claimed_lands", -1)) == 3, "highmere_claim_advances_to_three_of_thirty")
	_check(String(claimed_highmere.get("nation_status", "")) == "not_founded", "third_land_does_not_invent_nation")
	_check(String(claimed_highmere.get("settlement_name", "")) == "Greengate", "third_land_does_not_invent_settlement")
	_check(String(claimed_highmere.get("next_goal", "")) == "Return to Greengate for the Highmere ridge stone shipment", "third_land_reports_ridge_supply_goal")
	_check(runtime.highmere_survey_material.albedo_color.r > runtime.highmere_survey_material.albedo_color.g, "claimed_highmere_route_turns_pending_amber")
	_check(runtime.controller.save_game(), "highmere_claim_saves")
	await process_frame
	_capture("world-highmere-claimed")
	runtime.controller.session.state["inspected_land_ids"] = [FRONTIER_ID]
	runtime.controller.session.state["settlement"]["completed_orders"].erase("highmere_survey")
	runtime.controller.session.state["claimed_land_ids"] = [HOME_ID, FRONTIER_ID]
	_check(runtime.controller.load_game(), "highmere_inspection_reopens")
	var highmere_reopened: Dictionary = runtime.controller.current_snapshot()
	_check(bool(highmere_reopened.get("highmere_survey_commissioned", false)), "reopen_keeps_highmere_survey")
	_check(bool(highmere_reopened.get("highmere_inspected", false)), "reopen_keeps_highmere_inspection")
	_check(bool(highmere_reopened.get("highmere_claimed", false)), "reopen_keeps_highmere_claim")
	_check(int(highmere_reopened.get("claimed_lands", -1)) == 3, "reopen_keeps_three_claimed_lands")
	_check(int(highmere_reopened.get("stone", -1)) == 0, "reopen_keeps_highmere_survey_cost")
	await process_frame
	_capture("world-highmere-claimed-reopened")
	await _click_position(home_screen)
	await _click_control(runtime.enter_button)
	await process_frame
	await create_timer(0.6).timeout
	await _click_control(runtime.supply_button)
	var highmere_link_supplied: Dictionary = runtime.controller.current_snapshot()
	_check(bool(highmere_link_supplied.get("highmere_link_supply_delivered", false)), "highmere_ridge_supply_delivered")
	_check(int(highmere_link_supplied.get("stone", -1)) == 5, "highmere_ridge_supply_restores_five_stone")
	_check(runtime.supply_button.disabled, "highmere_ridge_supply_is_one_time")
	await process_frame
	_capture("village-highmere-link-supply")
	await _click_control(runtime.return_button)
	await process_frame
	await _click_position(highmere_screen)
	await _click_control(runtime.connect_button)
	var highmere_connected: Dictionary = runtime.controller.current_snapshot()
	_check(bool(highmere_connected.get("highmere_connected", false)), "highmere_link_completed")
	_check(String(highmere_connected.get("highmere_link_status", "")) == "connected", "highmere_link_reports_connected")
	_check(int(highmere_connected.get("stone", -1)) == 0, "highmere_link_costs_five_stone")
	_check(String(highmere_connected.get("next_goal", "")) == "Inspect Northgate beyond the Highmere ridge", "highmere_link_reveals_northgate")
	_check(String(highmere_connected.get("nation_status", "")) == "not_founded", "highmere_link_does_not_invent_nation")
	_check(runtime.highmere_survey_material.albedo_color.g > runtime.highmere_survey_material.albedo_color.r, "connected_highmere_route_turns_green")
	_check(runtime.controller.save_game(), "highmere_link_saves")
	await process_frame
	_capture("world-highmere-connected")
	runtime.controller.session.state["connected_land_ids"] = [FRONTIER_ID]
	runtime.controller.session.state["resources"]["stone"] = 5
	runtime.controller.session.state["settlement"]["completed_orders"].erase("highmere_link_stone_shipment")
	_check(runtime.controller.load_game(), "highmere_link_reopens")
	var highmere_link_reopened: Dictionary = runtime.controller.current_snapshot()
	_check(bool(highmere_link_reopened.get("highmere_link_supply_delivered", false)), "reopen_keeps_highmere_ridge_supply")
	_check(bool(highmere_link_reopened.get("highmere_connected", false)), "reopen_keeps_highmere_link")
	_check(int(highmere_link_reopened.get("stone", -1)) == 0, "reopen_keeps_highmere_link_cost")
	await process_frame
	_capture("world-highmere-connected-reopened")
	var northgate_world: Vector2 = runtime.canonical_center_world(NORTHGATE_ID)
	_check(is_finite(northgate_world.x), "northgate_geometry_available")
	var northgate_screen: Vector2 = player.camera.unproject_position(Vector3(northgate_world.x, 0.0, northgate_world.y))
	_check(Rect2(Vector2.ZERO, Vector2(root.size)).has_point(northgate_screen), "northgate_projects_inside_viewport")
	await _click_position(northgate_screen)
	_check(String(runtime.controller.current_snapshot().get("selected_land_id", "")) == NORTHGATE_ID, "pointer_raycast_selects_northgate")
	_check(runtime.northgate_scout_link.visible, "highmere_link_shows_northgate_scout_route")
	await _click_control(runtime.inspect_button)
	var northgate_inspected: Dictionary = runtime.controller.current_snapshot()
	_check(bool(northgate_inspected.get("northgate_inspected", false)), "northgate_inspection_recorded")
	_check(int(northgate_inspected.get("claimed_lands", -1)) == 3, "northgate_inspection_does_not_claim_fourth_land")
	_check(String(northgate_inspected.get("nation_status", "")) == "not_founded", "northgate_inspection_does_not_invent_nation")
	_check(String(northgate_inspected.get("next_goal", "")) == "Return to Greengate for the Northgate settlement timber", "northgate_inspection_reports_settlement_supply_goal")
	_check(runtime.northgate_scout_material.albedo_color.b > runtime.northgate_scout_material.albedo_color.r, "inspected_northgate_route_turns_blue")
	_check(not runtime.inspect_button.visible, "completed_northgate_action_is_hidden")
	await process_frame
	_capture("world-northgate-inspected")
	runtime.controller.session.state["inspected_land_ids"].erase(NORTHGATE_ID)
	_check(runtime.controller.load_game(), "northgate_inspection_reopens")
	var northgate_reopened: Dictionary = runtime.controller.current_snapshot()
	_check(bool(northgate_reopened.get("northgate_inspected", false)), "reopen_keeps_northgate_inspection")
	_check(int(northgate_reopened.get("claimed_lands", -1)) == 3, "reopen_keeps_three_claims_after_northgate")
	await process_frame
	_capture("world-northgate-inspected-reopened")
	var home_screen_after_northgate: Vector2 = player.camera.unproject_position(Vector3(home_world.x, 0.0, home_world.y))
	await _click_position(home_screen_after_northgate)
	_check(String(runtime.controller.current_snapshot().get("selected_land_id", "")) == HOME_ID, "pointer_reselects_home_for_settlement_timber")
	await _click_control(runtime.enter_button)
	await process_frame
	_check(String(runtime.controller.current_snapshot().get("view", "")) == "village", "settlement_timber_path_enters_village")
	_check("Northgate settlement timber" in String(runtime.supply_button.text), "village_offers_settlement_timber")
	await _click_control(runtime.supply_button)
	var timber_village: Dictionary = runtime.controller.current_snapshot()
	_check(bool(timber_village.get("northgate_settlement_timber_delivered", false)), "settlement_timber_delivered")
	_check(int(timber_village.get("timber", -1)) == 5, "settlement_timber_adds_five")
	_capture("village-northgate-settlement-timber")
	await _click_control(runtime.return_button)
	await process_frame
	var riverbend_screen_for_hamlet: Vector2 = player.camera.unproject_position(Vector3(frontier_world.x, 0.0, frontier_world.y))
	await _click_position(riverbend_screen_for_hamlet)
	_check(String(runtime.controller.current_snapshot().get("selected_land_id", "")) == FRONTIER_ID, "pointer_selects_riverbend_for_hamlet")
	_check(runtime.hamlet_button.visible and not runtime.hamlet_button.disabled, "riverbend_hamlet_action_is_clickable")
	await _click_control(runtime.hamlet_button)
	var hamlet_world: Dictionary = runtime.controller.current_snapshot()
	_check(bool(hamlet_world.get("riverbend_hamlet_founded", false)), "riverbend_hamlet_founded")
	_check(int(hamlet_world.get("settlement_count", -1)) == 2, "world_reports_two_settlements")
	_check(int(hamlet_world.get("timber", -1)) == 0, "riverbend_hamlet_costs_five_timber")
	_check(String(hamlet_world.get("nation_status", "")) == "not_founded", "riverbend_hamlet_does_not_invent_nation")
	_check("HAMLET" in String((runtime.land_labels.get(FRONTIER_ID) as Label3D).text), "riverbend_label_shows_hamlet")
	await process_frame
	_capture("world-riverbend-hamlet")
	runtime.controller.session.state["settlement_land_ids"] = [HOME_ID]
	_check(runtime.controller.load_game(), "riverbend_hamlet_reopens")
	var hamlet_reopened: Dictionary = runtime.controller.current_snapshot()
	_check(bool(hamlet_reopened.get("riverbend_hamlet_founded", false)), "reopen_keeps_riverbend_hamlet")
	_check(int(hamlet_reopened.get("settlement_count", -1)) == 2, "reopen_keeps_two_settlements")
	_check(String(hamlet_reopened.get("next_goal", "")) == "Return to Greengate for Riverbend Storehouse stone", "hamlet_reopen_reports_storehouse_supply_goal")
	await process_frame
	_capture("world-riverbend-hamlet-reopened")
	var home_screen_for_storehouse: Vector2 = player.camera.unproject_position(Vector3(home_world.x, 0.0, home_world.y))
	await _click_position(home_screen_for_storehouse)
	_check(String(runtime.controller.current_snapshot().get("selected_land_id", "")) == HOME_ID, "pointer_reselects_home_for_storehouse_supply")
	await _click_control(runtime.enter_button)
	await process_frame
	_check("Storehouse stone" in String(runtime.supply_button.text), "village_offers_storehouse_stone")
	await _click_control(runtime.supply_button)
	var storehouse_supply_village: Dictionary = runtime.controller.current_snapshot()
	_check(bool(storehouse_supply_village.get("riverbend_storehouse_stone_delivered", false)), "storehouse_stone_delivered")
	_check(int(storehouse_supply_village.get("stone", -1)) == 5, "storehouse_supply_adds_five_stone")
	_capture("village-riverbend-storehouse-stone")
	await _click_control(runtime.return_button)
	await process_frame
	var riverbend_screen_for_storehouse: Vector2 = player.camera.unproject_position(Vector3(frontier_world.x, 0.0, frontier_world.y))
	await _click_position(riverbend_screen_for_storehouse)
	_check(runtime.storehouse_button.visible and not runtime.storehouse_button.disabled, "riverbend_storehouse_action_is_clickable")
	await _click_control(runtime.storehouse_button)
	var storehouse_world: Dictionary = runtime.controller.current_snapshot()
	_check(bool(storehouse_world.get("riverbend_storehouse_built", false)), "riverbend_storehouse_built")
	_check(int(storehouse_world.get("stone", -1)) == 0, "riverbend_storehouse_costs_five_stone")
	_check(String(storehouse_world.get("nation_status", "")) == "not_founded", "riverbend_storehouse_does_not_invent_nation")
	_check("STOREHOUSE" in String((runtime.land_labels.get(FRONTIER_ID) as Label3D).text), "riverbend_label_shows_storehouse")
	await process_frame
	_capture("world-riverbend-storehouse")
	runtime.controller.session.state["settlement_improvements_by_land"] = {}
	_check(runtime.controller.load_game(), "riverbend_storehouse_reopens")
	var storehouse_reopened: Dictionary = runtime.controller.current_snapshot()
	_check(bool(storehouse_reopened.get("riverbend_storehouse_built", false)), "reopen_keeps_riverbend_storehouse")
	_check(String(storehouse_reopened.get("next_goal", "")) == "Riverbend Storehouse built; its production is not yet playable", "storehouse_reopen_reports_honest_stop_gate")
	await process_frame
	_capture("world-riverbend-storehouse-reopened")
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
