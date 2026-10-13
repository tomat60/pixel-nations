extends SceneTree

const PlayableCoreController = preload("res://core/playable_core_controller.gd")
const HOME_LAND_ID := "PN-A01-001"
const OTHER_LAND_ID := "PN-A01-002"
const HIGHMERE_LAND_ID := "PN-A01-003"

var failures := 0
var rejection_count := 0
var view_events: Array[String] = []


func _initialize() -> void:
	call_deferred("_run")


func _run() -> void:
	var save_path := "user://playable_core_controller_test.json"
	_remove_save(save_path)

	var controller := PlayableCoreController.new()
	controller.save_path = save_path
	controller.action_rejected.connect(func(_action: String, _reason: String) -> void:
		rejection_count += 1
	)
	controller.view_changed.connect(func(view: String, _snapshot: Dictionary) -> void:
		view_events.append(view)
	)
	root.add_child(controller)

	_expect(String(controller.current_snapshot().get("view", "")) == "world", "starts in World")
	_expect(not controller.enter_selected_land(), "rejects entry before claim")
	_expect(not controller.commission_highmere_survey(), "rejects Highmere survey from World")
	_expect(controller.select_land_from_map(OTHER_LAND_ID), "selects another canonical land")
	_expect(controller.claim_selected_land(), "claims the selected canonical land")
	_expect(not controller.enter_selected_land(), "does not relabel another land as Greengate")

	var fresh := PlayableCoreController.new()
	fresh.save_path = save_path
	fresh.action_rejected.connect(func(_action: String, _reason: String) -> void:
		rejection_count += 1
	)
	fresh.view_changed.connect(func(view: String, _snapshot: Dictionary) -> void:
		view_events.append(view)
	)
	root.add_child(fresh)

	_expect(fresh.select_land_from_map(HOME_LAND_ID), "selects canonical Greengate land")
	_expect(fresh.claim_selected_land(), "claims canonical Greengate land")
	_expect(not fresh.build_road(), "rejects Village action from World")
	_expect(fresh.enter_selected_land(), "enters Greengate from claimed land")
	var before := fresh.current_snapshot()
	_expect(int(before.get("stone", -1)) == 10, "shows starting stone")
	_expect(int(before.get("road_stone_cost", -1)) == 5, "shows factual road cost")
	_expect(fresh.build_road(), "builds one real road")
	var after := fresh.current_snapshot()
	_expect(bool(after.get("road_built", false)), "shows built road")
	_expect(int(after.get("stone", -1)) == 5, "deducts five stone")
	_expect(not fresh.build_road(), "rejects duplicate road")
	_expect(fresh.save_game(), "saves playable-core state")
	_expect(fresh.return_to_world(), "returns to World")
	var world := fresh.current_snapshot()
	_expect(bool(world.get("road_built", false)), "World reports road progress")
	_expect(String(world.get("next_goal", "")) == "Inspect Riverbend, Greenvale's eastern neighbor", "World reports honest next goal")
	_expect(fresh.select_land_from_map(OTHER_LAND_ID), "selects Riverbend frontier")
	_expect(fresh.inspect_selected_frontier(), "inspects Riverbend after road")
	_expect(not fresh.inspect_selected_frontier(), "rejects duplicate frontier inspection")
	_expect(fresh.claim_selected_land(), "claims inspected Riverbend frontier")
	_expect(not fresh.claim_selected_land(), "rejects duplicate Riverbend claim")
	_expect(fresh.save_game(), "saves inspected frontier")

	var reopened := PlayableCoreController.new()
	reopened.save_path = save_path
	reopened.action_rejected.connect(func(_action: String, _reason: String) -> void:
		rejection_count += 1
	)
	root.add_child(reopened)
	_expect(reopened.load_game(), "reopens saved state")
	var restored := reopened.current_snapshot()
	_expect(String(restored.get("view", "")) == "world", "reopen starts in World")
	_expect(String(restored.get("claimed_land_id", "")) == HOME_LAND_ID, "reopen preserves claimed land")
	_expect(bool(restored.get("road_built", false)), "reopen preserves road")
	_expect(int(restored.get("claimed_lands", -1)) == 2, "reopen reports two claimed lands")
	_expect(int(restored.get("charted_lands", -1)) == 30, "reopen reports canonical A-01 total")
	_expect(bool(restored.get("riverbend_inspected", false)), "reopen preserves Riverbend inspection")
	_expect(bool(restored.get("riverbend_claimed", false)), "reopen preserves Riverbend claim")
	_expect(String(restored.get("settlement_name", "")) == "Greengate", "reopen keeps Greengate as only settlement")
	_expect(String(restored.get("nation_status", "")) == "not_founded", "reopen keeps nation unfounded")
	_expect(String(restored.get("next_goal", "")) == "Connect Riverbend to Greengate", "reopen reports honest link goal")
	_expect(reopened.connect_riverbend(), "connects claimed Riverbend to Greengate")
	var connected := reopened.current_snapshot()
	_expect(bool(connected.get("riverbend_connected", false)), "reports completed Riverbend connection")
	_expect(String(connected.get("frontier_link_status", "")) == "connected", "reports factual connected status")
	_expect(int(connected.get("stone", -1)) == 0, "connection spends remaining five stone")
	_expect(String(connected.get("next_goal", "")) == "Return to Greengate for the Riverbend stone shipment", "reports honest post-connection goal")
	_expect(not reopened.connect_riverbend(), "rejects duplicate Riverbend connection")
	_expect(reopened.save_game(), "saves completed Riverbend connection")
	_expect(reopened.select_land_from_map(HOME_LAND_ID), "reselects Greenvale for supply")
	_expect(reopened.enter_selected_land(), "reenters Greengate for supply")
	_expect(reopened.receive_riverbend_supply(), "receives one Riverbend stone shipment")
	var supplied := reopened.current_snapshot()
	_expect(int(supplied.get("stone", -1)) == 5, "shipment restores five stone")
	_expect(bool(supplied.get("riverbend_supply_delivered", false)), "Village reports delivered shipment")
	_expect(not reopened.receive_riverbend_supply(), "rejects duplicate Riverbend shipment")
	_expect(reopened.save_game(), "saves delivered Riverbend shipment")
	_expect(reopened.return_to_world(), "returns to World after supply")
	reopened.session.state["settlement"]["completed_orders"] = []
	reopened.session.state["resources"]["stone"] = 0
	_expect(reopened.load_game(), "reloads delivered Riverbend shipment")
	var supplied_reopened := reopened.current_snapshot()
	_expect(bool(supplied_reopened.get("riverbend_supply_delivered", false)), "reopen preserves delivered shipment")
	_expect(int(supplied_reopened.get("stone", -1)) == 5, "reopen preserves shipment reward")
	_expect(String(supplied_reopened.get("next_goal", "")) == "Commission the Highmere survey in Greengate", "reports honest Highmere survey goal")
	_expect(reopened.enter_selected_land(), "reenters Greengate for Highmere survey")
	_expect(reopened.commission_highmere_survey(), "commissions Highmere survey for five stone")
	var survey_village := reopened.current_snapshot()
	_expect(bool(survey_village.get("highmere_survey_commissioned", false)), "Village reports Highmere survey")
	_expect(int(survey_village.get("stone", -1)) == 0, "Highmere survey spends delivered stone")
	_expect(not reopened.commission_highmere_survey(), "rejects duplicate Highmere survey")
	_expect(reopened.save_game(), "saves Highmere survey")
	_expect(reopened.return_to_world(), "returns to World for Highmere inspection")
	_expect(reopened.select_land_from_map(HIGHMERE_LAND_ID), "selects canonical Highmere")
	_expect(reopened.inspect_selected_frontier(), "inspects surveyed Highmere")
	_expect(not reopened.inspect_selected_frontier(), "rejects duplicate Highmere inspection")
	_expect(reopened.save_game(), "saves Highmere inspection")
	reopened.session.state["inspected_land_ids"] = [OTHER_LAND_ID]
	reopened.session.state["settlement"]["completed_orders"].erase("highmere_survey")
	_expect(reopened.load_game(), "reloads Highmere survey and inspection")
	var highmere_reopened := reopened.current_snapshot()
	_expect(bool(highmere_reopened.get("highmere_survey_commissioned", false)), "reopen preserves Highmere survey")
	_expect(bool(highmere_reopened.get("highmere_inspected", false)), "reopen preserves Highmere inspection")
	_expect(int(highmere_reopened.get("claimed_lands", -1)) == 2, "Highmere inspection does not claim third land")
	_expect(String(highmere_reopened.get("nation_status", "")) == "not_founded", "Highmere inspection does not invent nation")
	_expect(String(highmere_reopened.get("next_goal", "")) == "Choose whether to claim Highmere", "reports honest Highmere claim choice")
	_expect(reopened.claim_selected_land(), "claims inspected Highmere as third land")
	var highmere_claimed := reopened.current_snapshot()
	_expect(bool(highmere_claimed.get("highmere_claimed", false)), "reports Highmere claim")
	_expect(int(highmere_claimed.get("claimed_lands", -1)) == 3, "reports three of thirty claimed")
	_expect(String(highmere_claimed.get("settlement_name", "")) == "Greengate", "keeps Greengate as only settlement")
	_expect(String(highmere_claimed.get("nation_status", "")) == "not_founded", "third land does not invent nation")
	_expect(String(highmere_claimed.get("next_goal", "")) == "Return to Greengate for the Highmere ridge stone shipment", "reports honest Highmere supply goal")
	_expect(not reopened.connect_highmere(), "rejects Highmere link before ridge supply")
	_expect(not reopened.claim_selected_land(), "rejects duplicate Highmere claim")
	_expect(reopened.save_game(), "saves Highmere claim")
	reopened.session.state["claimed_land_ids"] = [HOME_LAND_ID, OTHER_LAND_ID]
	_expect(reopened.load_game(), "reloads Highmere claim")
	var highmere_claim_reopened := reopened.current_snapshot()
	_expect(bool(highmere_claim_reopened.get("highmere_claimed", false)), "reopen preserves Highmere claim")
	_expect(int(highmere_claim_reopened.get("claimed_lands", -1)) == 3, "reopen preserves three claimed lands")
	_expect(reopened.select_land_from_map(HOME_LAND_ID), "reselects Greenvale for ridge supply")
	_expect(reopened.enter_selected_land(), "reenters Greengate for ridge supply")
	_expect(reopened.receive_highmere_link_supply(), "receives one Highmere ridge stone shipment")
	var highmere_supplied := reopened.current_snapshot()
	_expect(bool(highmere_supplied.get("highmere_link_supply_delivered", false)), "Village reports Highmere ridge shipment")
	_expect(int(highmere_supplied.get("stone", -1)) == 5, "ridge shipment restores five stone")
	_expect(not reopened.receive_highmere_link_supply(), "rejects duplicate Highmere ridge shipment")
	_expect(reopened.save_game(), "saves Highmere ridge shipment")
	_expect(reopened.return_to_world(), "returns to World for Highmere link")
	_expect(reopened.select_land_from_map(HIGHMERE_LAND_ID), "reselects Highmere for link")
	_expect(reopened.connect_highmere(), "connects Highmere ridge to Riverbend")
	var highmere_connected := reopened.current_snapshot()
	_expect(bool(highmere_connected.get("highmere_connected", false)), "reports completed Highmere link")
	_expect(String(highmere_connected.get("highmere_link_status", "")) == "connected", "reports factual Highmere connected status")
	_expect(int(highmere_connected.get("stone", -1)) == 0, "Highmere link spends five stone")
	_expect(String(highmere_connected.get("next_goal", "")) == "Highmere is linked; the next expansion is not yet playable", "reports honest post-link stop gate")
	_expect(String(highmere_connected.get("nation_status", "")) == "not_founded", "Highmere link does not invent nation")
	_expect(not reopened.connect_highmere(), "rejects duplicate Highmere link")
	_expect(reopened.save_game(), "saves Highmere link")
	reopened.session.state["connected_land_ids"] = [OTHER_LAND_ID]
	reopened.session.state["resources"]["stone"] = 5
	_expect(reopened.load_game(), "reloads Highmere link")
	var highmere_link_reopened := reopened.current_snapshot()
	_expect(bool(highmere_link_reopened.get("highmere_link_supply_delivered", false)), "reopen preserves Highmere ridge shipment")
	_expect(bool(highmere_link_reopened.get("highmere_connected", false)), "reopen preserves Highmere link")
	_expect(int(highmere_link_reopened.get("stone", -1)) == 0, "reopen preserves Highmere link cost")
	_expect(rejection_count == 15, "emits one rejection for each invalid action")
	_expect(view_events == ["village", "world"], "emits exact observed navigation transitions")

	_remove_save(save_path)
	if failures == 0:
		print("PN_PLAYABLE_CORE_CONTROLLER_TESTS: PASS")
		quit(0)
	else:
		push_error("PN_PLAYABLE_CORE_CONTROLLER_TESTS: FAIL (%d)" % failures)
		quit(1)


func _expect(condition: bool, message: String) -> void:
	if condition:
		return
	failures += 1
	push_error("EXPECTATION FAILED: " + message)


func _remove_save(path: String) -> void:
	if FileAccess.file_exists(path):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(path))
