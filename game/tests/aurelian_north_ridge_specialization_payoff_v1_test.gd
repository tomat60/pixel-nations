extends SceneTree

const SESSION = preload("res://scenes/aurelian/aurelian_session_persistence_v2.gd")
const TEST_PATH := "user://aurelian-north-ridge-specialization-payoff-v1-test.json"
const MANIFEST_PATH := "res://scenes/aurelian/north_ridge_specialization_payoff_v1_manifest.json"
const PERSISTENCE_PATH := "res://scenes/aurelian/aurelian_session_persistence_v2.gd"

var failures: Array[String] = []

func _initialize() -> void:
	_cleanup()
	var manifest := _read_json(MANIFEST_PATH)
	_check(String(manifest.get("contract", "")) == "GODOT_AURELIAN_NORTH_RIDGE_SPECIALIZATION_PAYOFF_V1", "manifest_contract")
	_check(int(manifest.get("issue", 0)) == 551, "manifest_issue")
	var payoff: Dictionary = manifest.get("payoff", {})
	_check(String(payoff.get("locus", "")) == "north_ridge", "fixed_north_ridge_locus")
	_check(bool(payoff.get("inherited_specialization_required", false)), "inherited_specialization_required")
	_check(bool(payoff.get("exactly_one_activation", false)), "exactly_one_activation")
	_check(bool(payoff.get("exactly_one_event", false)), "exactly_one_event")
	_check(not bool(payoff.get("repeatable_activation", true)), "no_repeatable_activation")
	var branches: Array = payoff.get("branches", [])
	_check(branches.size() == 2, "exactly_two_branches")
	_check(String(branches[0].get("specialization", "")) == "trade_post", "trade_branch")
	_check(String(branches[0].get("result", "")) == "ridge_logistics_line_open", "trade_result")
	_check(String(branches[1].get("specialization", "")) == "watch_post", "watch_branch")
	_check(String(branches[1].get("result", "")) == "ridge_signal_lit", "watch_result")
	var geography: Dictionary = manifest.get("shared_geography", {})
	for invariant in ["greenvale_origin_unchanged", "river_spline_unchanged", "east_bridge_transform_unchanged", "north_ridge_transform_unchanged", "gilded_crossing_transform_unchanged", "camera_topology_unchanged"]:
		_check(bool(geography.get(invariant, false)), "geography_%s" % invariant)
	_check(geography.get("claimed_lands_exactly", []) == ["east_route", "north_ridge"], "manifest_exact_two_lands")

	var pending_trade := SESSION.save_session(
		"world_north_ridge_specialization_payoff_revealed", "east_trade", TEST_PATH,
		true, true, true, true, true, true,
		"trade", true, true, "river_surge",
		"shield_greenvale", "stand_firm", "secure_gilded_crossing",
		"north_ridge", "north_ridge_claimed", "established", "trade_post", "none"
	)
	_check(bool(pending_trade.get("ok", false)), "save_pending_trade_payoff")
	var restored := SESSION.load_session(TEST_PATH)
	_check(String(restored.get("north_ridge_specialization", "")) == "trade_post", "pending_preserves_trade_specialization")
	_check(String(restored.get("north_ridge_specialization_payoff", "")) == "none", "pending_has_no_payoff")
	_check(restored.get("claimed_lands", []) == ["east_route", "north_ridge"], "pending_preserves_two_lands")

	var trade := SESSION.save_session(
		"world_north_ridge_logistics_line_active_frontier_role", "east_trade", TEST_PATH,
		true, true, true, true, true, true,
		"trade", true, true, "river_surge",
		"shield_greenvale", "stand_firm", "secure_gilded_crossing",
		"north_ridge", "north_ridge_claimed", "established", "trade_post", "ridge_logistics_line_open"
	)
	_check(bool(trade.get("ok", false)), "save_logistics_line")
	restored = SESSION.load_session(TEST_PATH)
	_check(String(restored.get("north_ridge_specialization_payoff", "")) == "ridge_logistics_line_open", "restore_logistics_line")
	_check(String(restored.get("north_ridge_outpost", "")) == "established", "trade_preserves_outpost")
	_check(String(restored.get("first_frontier_payoff", "")) == "secure_gilded_crossing", "trade_preserves_frontier_payoff")

	var watch := SESSION.save_session(
		"map_north_ridge_signal_lit", "east_trade", TEST_PATH,
		true, true, true, true, true, true,
		"frontier", true, true, "river_surge",
		"keep_east_bridge_open", "negotiate_passage", "ratify_east_bridge_passage",
		"north_ridge", "north_ridge_claimed", "established", "watch_post", "ridge_signal_lit"
	)
	_check(bool(watch.get("ok", false)), "save_ridge_signal")
	restored = SESSION.load_session(TEST_PATH)
	_check(String(restored.get("north_ridge_specialization", "")) == "watch_post", "restore_watch_specialization")
	_check(String(restored.get("north_ridge_specialization_payoff", "")) == "ridge_signal_lit", "restore_ridge_signal")
	_check(String(restored.get("national_direction", "")) == "frontier", "watch_preserves_direction")
	_check(restored.get("claimed_lands", []) == ["east_route", "north_ridge"], "watch_preserves_two_lands")

	var invalid := SESSION.save_session(
		"map_north_ridge_logistics_line_open", "east_trade", TEST_PATH,
		true, true, true, true, true, true,
		"frontier", true, true, "river_surge",
		"keep_east_bridge_open", "negotiate_passage", "ratify_east_bridge_passage",
		"north_ridge", "north_ridge_claimed", "established", "watch_post", "ridge_logistics_line_open"
	)
	_check(String(invalid.get("status", "")) == "invalid_data", "reject_cross_branch_payoff")
	invalid = SESSION.save_session(
		"village_north_ridge_specialization_payoff_action", "east_trade", TEST_PATH,
		true, true, true, true, true, true,
		"trade", true, true, "river_surge",
		"shield_greenvale", "stand_firm", "secure_gilded_crossing",
		"north_ridge", "north_ridge_claimed", "established", "trade_post", "ridge_logistics_line_open"
	)
	_check(String(invalid.get("status", "")) == "invalid_data", "reject_duplicate_activation_in_pending_state")
	invalid = SESSION.save_session(
		"world_north_ridge_specialization_payoff_revealed", "east_trade", TEST_PATH,
		true, true, true, true, true, true,
		"trade", true, true, "river_surge",
		"shield_greenvale", "stand_firm", "secure_gilded_crossing",
		"north_ridge", "north_ridge_claimed", "established", "none", "none"
	)
	_check(String(invalid.get("status", "")) == "invalid_data", "reject_payoff_before_specialization")

	var payload := _read_json(TEST_PATH)
	payload["north_ridge_specialization_payoff"] = "hybrid_payoff"
	_write_json(TEST_PATH, payload)
	restored = SESSION.load_session(TEST_PATH)
	_check(String(restored.get("status", "")) == "invalid_value", "reject_unknown_payoff_payload")

	var legacy := SESSION.save_session(
		"world_north_ridge_trade_post_logistics_posture", "east_trade", TEST_PATH,
		true, true, true, true, true, true,
		"trade", true, true, "river_surge",
		"shield_greenvale", "stand_firm", "secure_gilded_crossing",
		"north_ridge", "north_ridge_claimed", "established", "trade_post"
	)
	_check(bool(legacy.get("ok", false)), "save_pre_payoff_specialization")
	payload = _read_json(TEST_PATH)
	payload.erase("north_ridge_specialization_payoff")
	_write_json(TEST_PATH, payload)
	restored = SESSION.load_session(TEST_PATH)
	_check(bool(restored.get("ok", false)), "load_pre_payoff_payload")
	_check(String(restored.get("north_ridge_specialization_payoff", "")) == "none", "legacy_defaults_to_unactivated")
	_check(String(restored.get("north_ridge_specialization", "")) == "trade_post", "legacy_preserves_specialization")

	var persistence := _read_text(PERSISTENCE_PATH)
	for token in [
		"VALID_NORTH_RIDGE_SPECIALIZATION_PAYOFFS",
		"NORTH_RIDGE_SPECIALIZATION_PAYOFF_PENDING_STATES",
		"NORTH_RIDGE_LOGISTICS_LINE_STATES",
		"NORTH_RIDGE_SIGNAL_STATES",
		"\"north_ridge_specialization_payoff\"",
		"world_north_ridge_specialization_payoff_revealed",
		"map_north_ridge_specialization_payoff_inspection",
		"village_north_ridge_specialization_payoff_action",
		"map_north_ridge_logistics_line_open",
		"world_north_ridge_logistics_line_active_frontier_role",
		"map_north_ridge_signal_lit",
		"world_north_ridge_signal_active_frontier_role",
	]:
		_check(persistence.contains(token), "persistence_token_%s" % token)

	_cleanup()
	_finish()

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
		print("GODOT_AURELIAN_NORTH_RIDGE_SPECIALIZATION_PAYOFF_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("GODOT_AURELIAN_NORTH_RIDGE_SPECIALIZATION_PAYOFF_V1_TEST_FAILURE: %s" % failure)
	quit(1)
