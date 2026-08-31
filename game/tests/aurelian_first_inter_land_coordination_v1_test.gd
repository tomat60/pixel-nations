extends SceneTree

const SESSION = preload("res://scenes/aurelian/aurelian_session_persistence_v2.gd")
const TEST_PATH := "user://aurelian-first-inter-land-coordination-v1-test.json"
const MANIFEST_PATH := "res://scenes/aurelian/first_inter_land_coordination_v1_manifest.json"
const PERSISTENCE_PATH := "res://scenes/aurelian/aurelian_session_persistence_v2.gd"
const CONTROLLER_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1.gd"

var failures: Array[String] = []

func _initialize() -> void:
	_cleanup()
	var manifest := _read_json(MANIFEST_PATH)
	_check(String(manifest.get("contract", "")) == "GODOT_AURELIAN_FIRST_INTER_LAND_COORDINATION_V1", "manifest_contract")
	_check(int(manifest.get("issue", 0)) == 555, "manifest_issue")
	var coordination: Dictionary = manifest.get("coordination", {})
	_check(coordination.get("loci", []) == ["greenvale", "north_ridge"], "coordination_loci")
	_check(bool(coordination.get("exactly_one_operation", false)), "exactly_one_operation")
	_check(bool(coordination.get("exactly_one_event", false)), "exactly_one_event")
	_check(not bool(coordination.get("repeatable_operation", true)), "no_repeatable_operation")
	var branches: Array = coordination.get("branches", [])
	_check(branches.size() == 2, "exactly_two_branches")
	_check(String(branches[0].get("specialization", "")) == "trade_post", "trade_specialization")
	_check(String(branches[0].get("payoff", "")) == "ridge_logistics_line_open", "trade_payoff")
	_check(String(branches[0].get("result", "")) == "ridge_convoy_dispatched", "trade_result")
	_check(String(branches[1].get("specialization", "")) == "watch_post", "watch_specialization")
	_check(String(branches[1].get("payoff", "")) == "ridge_signal_lit", "watch_payoff")
	_check(String(branches[1].get("result", "")) == "basin_alert_raised", "watch_result")
	var geography: Dictionary = manifest.get("shared_geography", {})
	for invariant in ["greenvale_origin_unchanged", "river_spline_unchanged", "east_bridge_transform_unchanged", "north_ridge_transform_unchanged", "gilded_crossing_transform_unchanged", "camera_topology_unchanged"]:
		_check(bool(geography.get(invariant, false)), "geography_%s" % invariant)
	_check(geography.get("claimed_lands_exactly", []) == ["east_route", "north_ridge"], "manifest_exact_two_lands")

	var pending_trade := _save("world_first_inter_land_coordination_revealed", "trade_post", "ridge_logistics_line_open", "none", "trade", "shield_greenvale", "stand_firm", "secure_gilded_crossing")
	_check(bool(pending_trade.get("ok", false)), "save_pending_trade")
	var restored := SESSION.load_session(TEST_PATH)
	_check(String(restored.get("first_inter_land_coordination", "")) == "none", "pending_has_no_coordination")
	_check(String(restored.get("north_ridge_specialization_payoff", "")) == "ridge_logistics_line_open", "pending_preserves_trade_payoff")
	_check(restored.get("claimed_lands", []) == ["east_route", "north_ridge"], "pending_preserves_two_lands")

	var trade := _save("world_coordinated_logistics_network", "trade_post", "ridge_logistics_line_open", "ridge_convoy_dispatched", "trade", "shield_greenvale", "stand_firm", "secure_gilded_crossing")
	_check(bool(trade.get("ok", false)), "save_ridge_convoy")
	restored = SESSION.load_session(TEST_PATH)
	_check(String(restored.get("first_inter_land_coordination", "")) == "ridge_convoy_dispatched", "restore_ridge_convoy")
	_check(String(restored.get("north_ridge_specialization", "")) == "trade_post", "trade_preserves_specialization")
	_check(String(restored.get("north_ridge_specialization_payoff", "")) == "ridge_logistics_line_open", "trade_preserves_payoff")
	_check(String(restored.get("north_ridge_outpost", "")) == "established", "trade_preserves_outpost")

	var pending_watch := _save("map_greenvale_north_ridge_link_inspection", "watch_post", "ridge_signal_lit", "none", "frontier", "keep_east_bridge_open", "negotiate_passage", "ratify_east_bridge_passage")
	_check(bool(pending_watch.get("ok", false)), "save_pending_watch")
	var watch := _save("map_basin_alert_raised", "watch_post", "ridge_signal_lit", "basin_alert_raised", "frontier", "keep_east_bridge_open", "negotiate_passage", "ratify_east_bridge_passage")
	_check(bool(watch.get("ok", false)), "save_basin_alert")
	restored = SESSION.load_session(TEST_PATH)
	_check(String(restored.get("first_inter_land_coordination", "")) == "basin_alert_raised", "restore_basin_alert")
	_check(String(restored.get("north_ridge_specialization", "")) == "watch_post", "watch_preserves_specialization")
	_check(String(restored.get("national_direction", "")) == "frontier", "watch_preserves_direction")
	_check(restored.get("claimed_lands", []) == ["east_route", "north_ridge"], "watch_preserves_two_lands")

	var invalid := _save("map_ridge_convoy_dispatched", "watch_post", "ridge_signal_lit", "ridge_convoy_dispatched", "frontier", "keep_east_bridge_open", "negotiate_passage", "ratify_east_bridge_passage")
	_check(String(invalid.get("status", "")) == "invalid_data", "reject_cross_branch_coordination")
	invalid = _save("world_first_inter_land_coordination_revealed", "trade_post", "none", "none", "trade", "shield_greenvale", "stand_firm", "secure_gilded_crossing")
	_check(String(invalid.get("status", "")) == "invalid_data", "reject_coordination_before_payoff")
	invalid = _save("village_first_inter_land_coordination_action", "trade_post", "ridge_logistics_line_open", "ridge_convoy_dispatched", "trade", "shield_greenvale", "stand_firm", "secure_gilded_crossing")
	_check(String(invalid.get("status", "")) == "invalid_data", "reject_result_in_pending_state")

	var payload := _read_json(TEST_PATH)
	payload["first_inter_land_coordination"] = "hybrid_network"
	_write_json(TEST_PATH, payload)
	restored = SESSION.load_session(TEST_PATH)
	_check(String(restored.get("status", "")) == "invalid_value", "reject_unknown_coordination_payload")

	var legacy := _save("world_north_ridge_logistics_line_active_frontier_role", "trade_post", "ridge_logistics_line_open", "none", "trade", "shield_greenvale", "stand_firm", "secure_gilded_crossing")
	_check(bool(legacy.get("ok", false)), "save_pre_coordination_profile")
	payload = _read_json(TEST_PATH)
	payload.erase("first_inter_land_coordination")
	_write_json(TEST_PATH, payload)
	restored = SESSION.load_session(TEST_PATH)
	_check(bool(restored.get("ok", false)), "load_pre_coordination_profile")
	_check(String(restored.get("first_inter_land_coordination", "")) == "none", "legacy_defaults_to_not_completed")
	_check(String(restored.get("north_ridge_specialization_payoff", "")) == "ridge_logistics_line_open", "legacy_preserves_payoff")
	_check(restored.get("claimed_lands", []) == ["east_route", "north_ridge"], "legacy_preserves_two_lands")

	var persistence := _read_text(PERSISTENCE_PATH)
	for token in [
		"VALID_FIRST_INTER_LAND_COORDINATIONS",
		"FIRST_INTER_LAND_COORDINATION_PENDING_STATES",
		"RIDGE_CONVOY_COORDINATION_STATES",
		"BASIN_ALERT_COORDINATION_STATES",
		"\"first_inter_land_coordination\"",
		"world_first_inter_land_coordination_revealed",
		"map_greenvale_north_ridge_link_inspection",
		"village_first_inter_land_coordination_action",
		"map_ridge_convoy_dispatched",
		"world_coordinated_logistics_network",
		"map_basin_alert_raised",
		"world_coordinated_vigilance_network",
	]:
		_check(persistence.contains(token), "persistence_token_%s" % token)

	var controller := _read_text(CONTROLLER_PATH)
	for token in [
		"FIRST_INTER_LAND_COORDINATION_STATES",
		"first_inter_land_coordination",
		"world_first_inter_land_coordination_revealed",
		"map_greenvale_north_ridge_link_inspection",
		"village_first_inter_land_coordination_action",
		"map_ridge_convoy_dispatched",
		"village_ridge_convoy_greenvale_acknowledges",
		"world_coordinated_logistics_network",
		"map_basin_alert_raised",
		"village_basin_alert_greenvale_acknowledges",
		"world_coordinated_vigilance_network",
		"AURELIAN_FIRST_INTER_LAND_COORDINATION=RIDGE_CONVOY_DISPATCHED",
		"AURELIAN_FIRST_INTER_LAND_COORDINATION=BASIN_ALERT_RAISED",
		"FirstInterLandCoordinationLink",
		"CoordinationPulse%02d",
	]:
		_check(controller.contains(token), "controller_token_%s" % token)
	_check(controller.count("AURELIAN_FIRST_INTER_LAND_COORDINATION=RIDGE_CONVOY_DISPATCHED") == 1, "single_convoy_event")
	_check(controller.count("AURELIAN_FIRST_INTER_LAND_COORDINATION=BASIN_ALERT_RAISED") == 1, "single_alert_event")
	_check(controller.find("world_first_inter_land_coordination_revealed") < controller.find("map_greenvale_north_ridge_link_inspection"), "world_before_map_coordination")
	_check(controller.find("map_greenvale_north_ridge_link_inspection") < controller.find("village_first_inter_land_coordination_action"), "map_before_village_coordination")

	_cleanup()
	_finish()

func _save(state: String, specialization: String, payoff: String, result: String, direction: String, crisis_response: String, rival_response: String, frontier_payoff: String) -> Dictionary:
	return SESSION.save_session(
		state, "east_trade", TEST_PATH,
		true, true, true, true, true, true,
		direction, true, true, "river_surge",
		crisis_response, rival_response, frontier_payoff,
		"north_ridge", "north_ridge_claimed", "established", specialization, payoff, result
	)

func _read_json(path: String) -> Dictionary:
	var parsed: Variant = JSON.parse_string(_read_text(path))
	return parsed if parsed is Dictionary else {}

func _read_text(path: String) -> String:
	var file := FileAccess.open(path, FileAccess.READ)
	return file.get_as_text() if file != null else ""

func _write_json(path: String, payload: Dictionary) -> void:
	var file := FileAccess.open(path, FileAccess.WRITE)
	if file != null:
		file.store_string(JSON.stringify(payload))
		file.flush()

func _cleanup() -> void:
	for suffix in ["", ".tmp", ".bak"]:
		var path: String = TEST_PATH + suffix
		if FileAccess.file_exists(path):
			DirAccess.remove_absolute(path)

func _check(condition: bool, label: String) -> void:
	if not condition:
		failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("GODOT_AURELIAN_FIRST_INTER_LAND_COORDINATION_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("GODOT_AURELIAN_FIRST_INTER_LAND_COORDINATION_V1_TEST_FAILURE: %s" % failure)
	quit(1)
