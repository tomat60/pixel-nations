extends SceneTree

const SESSION = preload("res://scenes/aurelian/aurelian_session_persistence_v2.gd")
const TEST_PATH := "user://aurelian-first-third-land-prospect-v1-test.json"
const MANIFEST_PATH := "res://scenes/aurelian/first_third_land_prospect_v1_manifest.json"
const PERSISTENCE_PATH := "res://scenes/aurelian/aurelian_session_persistence_v2.gd"
const CONTROLLER_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1.gd"

var failures: Array[String] = []

func _initialize() -> void:
	_cleanup()
	var manifest := _read_json(MANIFEST_PATH)
	_check(String(manifest.get("contract", "")) == "GODOT_AURELIAN_FIRST_THIRD_LAND_PROSPECT_V1", "manifest_contract")
	_check(int(manifest.get("issue", 0)) == 559, "manifest_issue")
	var prospect: Dictionary = manifest.get("prospect", {})
	var branches: Array = prospect.get("branches", [])
	_check(branches.size() == 2, "exactly_two_branches")
	_check(String(branches[0].get("coordination", "")) == "ridge_convoy_dispatched", "trade_coordination")
	_check(String(branches[0].get("result", "")) == "south_marsh_surveyed", "trade_result")
	_check(_numeric_pair(branches[0].get("accepted_transform", [])) == [365, 690], "south_marsh_transform")
	_check(String(branches[1].get("coordination", "")) == "basin_alert_raised", "watch_coordination")
	_check(String(branches[1].get("result", "")) == "northgate_surveyed", "watch_result")
	_check(_numeric_pair(branches[1].get("accepted_transform", [])) == [445, 65], "northgate_transform")
	_check(bool(prospect.get("exactly_one_prospect", false)), "exactly_one_prospect")
	_check(bool(prospect.get("exactly_one_event", false)), "exactly_one_event")
	_check(not bool(prospect.get("land_claimed", true)), "prospect_not_claimed")
	_check(not bool(prospect.get("repeatable_survey", true)), "survey_not_repeatable")
	var geography: Dictionary = manifest.get("shared_geography", {})
	_check(geography.get("claimed_lands_exactly", []) == ["east_route", "north_ridge"], "manifest_exact_two_lands")
	_check(_numeric_pair(geography.get("south_marsh_transform", [])) == [365, 690], "shared_south_marsh_transform")
	_check(_numeric_pair(geography.get("northgate_transform", [])) == [445, 65], "shared_northgate_transform")
	_check(not bool(geography.get("third_land_claimed", true)), "shared_no_third_claim")

	var pending_trade := _save("world_first_third_land_prospect_revealed", "trade_post", "ridge_logistics_line_open", "ridge_convoy_dispatched", "none", "trade", "shield_greenvale", "stand_firm", "secure_gilded_crossing")
	_check(bool(pending_trade.get("ok", false)), "save_pending_trade")
	var restored := SESSION.load_session(TEST_PATH)
	_check(String(restored.get("first_third_land_prospect", "")) == "none", "pending_has_no_prospect")
	_check(String(restored.get("first_inter_land_coordination", "")) == "ridge_convoy_dispatched", "pending_preserves_trade_coordination")
	_check(restored.get("claimed_lands", []) == ["east_route", "north_ridge"], "pending_preserves_two_lands")

	var trade := _save("world_south_marsh_imperial_prospect", "trade_post", "ridge_logistics_line_open", "ridge_convoy_dispatched", "south_marsh_surveyed", "trade", "shield_greenvale", "stand_firm", "secure_gilded_crossing")
	_check(bool(trade.get("ok", false)), "save_south_marsh")
	restored = SESSION.load_session(TEST_PATH)
	_check(String(restored.get("first_third_land_prospect", "")) == "south_marsh_surveyed", "restore_south_marsh")
	_check(String(restored.get("first_inter_land_coordination", "")) == "ridge_convoy_dispatched", "trade_preserves_coordination")
	_check(String(restored.get("north_ridge_specialization", "")) == "trade_post", "trade_preserves_specialization")
	_check(String(restored.get("north_ridge_outpost", "")) == "established", "trade_preserves_outpost")
	_check(restored.get("claimed_lands", []) == ["east_route", "north_ridge"], "trade_preserves_two_lands")

	var pending_watch := _save("map_third_land_prospect_inspection", "watch_post", "ridge_signal_lit", "basin_alert_raised", "none", "frontier", "keep_east_bridge_open", "negotiate_passage", "ratify_east_bridge_passage")
	_check(bool(pending_watch.get("ok", false)), "save_pending_watch")
	var watch := _save("map_northgate_surveyed", "watch_post", "ridge_signal_lit", "basin_alert_raised", "northgate_surveyed", "frontier", "keep_east_bridge_open", "negotiate_passage", "ratify_east_bridge_passage")
	_check(bool(watch.get("ok", false)), "save_northgate")
	restored = SESSION.load_session(TEST_PATH)
	_check(String(restored.get("first_third_land_prospect", "")) == "northgate_surveyed", "restore_northgate")
	_check(String(restored.get("first_inter_land_coordination", "")) == "basin_alert_raised", "watch_preserves_coordination")
	_check(String(restored.get("north_ridge_specialization", "")) == "watch_post", "watch_preserves_specialization")
	_check(restored.get("claimed_lands", []) == ["east_route", "north_ridge"], "watch_preserves_two_lands")

	var invalid := _save("map_south_marsh_surveyed", "watch_post", "ridge_signal_lit", "basin_alert_raised", "south_marsh_surveyed", "frontier", "keep_east_bridge_open", "negotiate_passage", "ratify_east_bridge_passage")
	_check(String(invalid.get("status", "")) == "invalid_data", "reject_cross_branch_prospect")
	invalid = _save("world_first_third_land_prospect_revealed", "trade_post", "ridge_logistics_line_open", "none", "none", "trade", "shield_greenvale", "stand_firm", "secure_gilded_crossing")
	_check(String(invalid.get("status", "")) == "invalid_data", "reject_prospect_before_coordination")
	invalid = _save("village_third_land_survey_action", "trade_post", "ridge_logistics_line_open", "ridge_convoy_dispatched", "south_marsh_surveyed", "trade", "shield_greenvale", "stand_firm", "secure_gilded_crossing")
	_check(String(invalid.get("status", "")) == "invalid_data", "reject_result_in_pending_state")

	var payload := _read_json(TEST_PATH)
	payload["first_third_land_prospect"] = "both_prospects"
	_write_json(TEST_PATH, payload)
	restored = SESSION.load_session(TEST_PATH)
	_check(String(restored.get("status", "")) == "invalid_value", "reject_unknown_prospect_payload")

	var legacy := _save("world_coordinated_logistics_network", "trade_post", "ridge_logistics_line_open", "ridge_convoy_dispatched", "none", "trade", "shield_greenvale", "stand_firm", "secure_gilded_crossing")
	_check(bool(legacy.get("ok", false)), "save_pre_prospect_profile")
	payload = _read_json(TEST_PATH)
	payload.erase("first_third_land_prospect")
	_write_json(TEST_PATH, payload)
	restored = SESSION.load_session(TEST_PATH)
	_check(bool(restored.get("ok", false)), "load_pre_prospect_profile")
	_check(String(restored.get("first_third_land_prospect", "")) == "none", "legacy_defaults_to_not_completed")
	_check(String(restored.get("first_inter_land_coordination", "")) == "ridge_convoy_dispatched", "legacy_preserves_coordination")
	_check(restored.get("claimed_lands", []) == ["east_route", "north_ridge"], "legacy_preserves_two_lands")

	var persistence := _read_text(PERSISTENCE_PATH)
	for token in [
		"VALID_FIRST_THIRD_LAND_PROSPECTS",
		"FIRST_THIRD_LAND_PROSPECT_PENDING_STATES",
		"SOUTH_MARSH_PROSPECT_STATES",
		"NORTHGATE_PROSPECT_STATES",
		"\"first_third_land_prospect\"",
		"world_first_third_land_prospect_revealed",
		"map_third_land_prospect_inspection",
		"village_third_land_survey_action",
		"map_south_marsh_surveyed",
		"world_south_marsh_imperial_prospect",
		"map_northgate_surveyed",
		"world_northgate_imperial_prospect",
	]:
		_check(persistence.contains(token), "persistence_token_%s" % token)

	var controller := _read_text(CONTROLLER_PATH)
	for token in [
		"FIRST_THIRD_LAND_PROSPECT_STATES",
		"first_third_land_prospect",
		"world_first_third_land_prospect_revealed",
		"map_third_land_prospect_inspection",
		"village_third_land_survey_action",
		"map_south_marsh_surveyed",
		"village_south_marsh_report_acknowledged",
		"world_south_marsh_imperial_prospect",
		"map_northgate_surveyed",
		"village_northgate_report_acknowledged",
		"world_northgate_imperial_prospect",
		"AURELIAN_FIRST_THIRD_LAND_PROSPECT=SOUTH_MARSH_SURVEYED",
		"AURELIAN_FIRST_THIRD_LAND_PROSPECT=NORTHGATE_SURVEYED",
		"AurelianFirstThirdLandProspectPresentation",
		"ReedEdgePulse%02d",
		"GateBeacon",
	]:
		_check(controller.contains(token), "controller_token_%s" % token)
	_check(controller.count("AURELIAN_FIRST_THIRD_LAND_PROSPECT=SOUTH_MARSH_SURVEYED") == 1, "single_south_marsh_event")
	_check(controller.count("AURELIAN_FIRST_THIRD_LAND_PROSPECT=NORTHGATE_SURVEYED") == 1, "single_northgate_event")
	_check(controller.find("world_first_third_land_prospect_revealed") < controller.find("map_third_land_prospect_inspection"), "world_before_map_prospect")
	_check(controller.find("map_third_land_prospect_inspection") < controller.find("village_third_land_survey_action"), "map_before_village_prospect")

	_cleanup()
	_finish()

func _save(state: String, specialization: String, payoff: String, coordination: String, prospect: String, direction: String, crisis_response: String, rival_response: String, frontier_payoff: String) -> Dictionary:
	return SESSION.save_session(
		state, "east_trade", TEST_PATH,
		true, true, true, true, true, true,
		direction, true, true, "river_surge",
		crisis_response, rival_response, frontier_payoff,
		"north_ridge", "north_ridge_claimed", "established", specialization, payoff, coordination, prospect
	)

func _numeric_pair(value: Variant) -> Array[int]:
	if not value is Array or value.size() != 2:
		return []
	return [int(value[0]), int(value[1])]

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
		print("GODOT_AURELIAN_FIRST_THIRD_LAND_PROSPECT_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("GODOT_AURELIAN_FIRST_THIRD_LAND_PROSPECT_V1_TEST_FAILURE: %s" % failure)
	quit(1)
