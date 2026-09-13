extends SceneTree

const CONTROLLER = preload("res://scenes/aurelian/playable_aurelian_first_session_v6.gd")
const MANIFEST_PATH := "res://scenes/aurelian/aurelian_frontier_capacity_v2_manifest.json"

var failures: Array[String] = []

func _initialize() -> void:
	var controller = CONTROLLER.new()
	controller.north_ridge_outpost = "none"
	controller.north_ridge_specialization = "none"
	_check(controller.frontier_capacity() == 0, "unheld_frontier_has_no_capacity")
	controller.north_ridge_outpost = "established"
	_check(controller.frontier_capacity() == 1, "established_unspecialized_frontier_has_capacity")
	controller.north_ridge_specialization = "trade_post"
	_check(controller.frontier_capacity() == 0, "trade_commit_consumes_capacity")
	controller.north_ridge_specialization = "watch_post"
	_check(controller.frontier_capacity() == 0, "watch_commit_consumes_capacity")

	controller.imperial_crisis = "river_surge"
	controller.imperial_crisis_response = "shield_greenvale"
	controller.first_rival_countermove_response = "stand_firm"
	controller.first_frontier_payoff = "secure_gilded_crossing"
	controller.imperial_expansion_target = "north_ridge"
	controller.first_imperial_expansion = "north_ridge_claimed"
	controller.north_ridge_outpost = "established"
	controller.north_ridge_specialization = "trade_post"
	controller._sanitize_core_session_state_for_persistence("world_north_ridge_trade_post_logistics_posture")
	_check(controller.imperial_crisis == "none", "late_restore_does_not_invent_crisis")
	_check(controller.imperial_crisis_response == "none", "late_restore_does_not_invent_crisis_response")
	_check(controller.first_rival_countermove_response == "none", "late_restore_does_not_invent_rival_response")
	_check(controller.first_frontier_payoff == "none", "late_restore_does_not_invent_frontier_payoff")
	_check(controller.imperial_expansion_target == "north_ridge", "late_restore_preserves_target")
	_check(controller.first_imperial_expansion == "north_ridge_claimed", "late_restore_preserves_claim")
	_check(controller.north_ridge_outpost == "established", "late_restore_preserves_outpost")
	_check(controller.north_ridge_specialization == "trade_post", "late_restore_preserves_specialization")
	controller.free()

	var manifest := _read_json(MANIFEST_PATH)
	_check(String(manifest.get("contract", "")) == "AURELIAN_FRONTIER_CAPACITY_V2", "manifest_contract")
	_check(int(manifest.get("before_commit", -1)) == 1, "manifest_before")
	_check(int(manifest.get("after_commit", -1)) == 0, "manifest_after")
	_check(manifest.get("new_persistent_fields", ["unexpected"]) == [], "no_new_persistence")
	_check(manifest.get("specializations", []) == ["trade_post", "watch_post"], "both_existing_branches")
	_check(bool(manifest.get("first_35_inputs_unchanged", false)), "first_35_unchanged")
	_finish()

func _read_json(path: String) -> Dictionary:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		failures.append("open_manifest")
		return {}
	var payload = JSON.parse_string(file.get_as_text())
	if payload is Dictionary:
		return payload as Dictionary
	failures.append("parse_manifest")
	return {}

func _check(condition: bool, label: String) -> void:
	if not condition:
		failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("AURELIAN_FRONTIER_CAPACITY_V2_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("AURELIAN_FRONTIER_CAPACITY_V2_TEST_FAILURE: %s" % failure)
	print("AURELIAN_FRONTIER_CAPACITY_V2_TEST: FAIL (%d)" % failures.size())
	quit(1)
