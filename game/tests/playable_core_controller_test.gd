extends SceneTree

const PlayableCoreController = preload("res://core/playable_core_controller.gd")
const HOME_LAND_ID := "PN-A01-001"
const OTHER_LAND_ID := "PN-A01-002"

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
	_expect(rejection_count == 6, "emits one rejection for each invalid action")
	_expect(view_events == ["village", "world"], "emits exact navigation transitions")

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
