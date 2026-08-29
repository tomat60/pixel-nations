extends SceneTree

const SESSION = preload("res://scenes/aurelian/aurelian_session_persistence_v2.gd")
const TEST_PATH := "user://aurelian-north-ridge-specialization-v1-test.json"
const MANIFEST_PATH := "res://scenes/aurelian/north_ridge_specialization_v1_manifest.json"
const PERSISTENCE_PATH := "res://scenes/aurelian/aurelian_session_persistence_v2.gd"

var failures: Array[String] = []

func _initialize() -> void:
	_cleanup()
	var manifest := _read_json(MANIFEST_PATH)
	_check(String(manifest.get("contract", "")) == "GODOT_AURELIAN_NORTH_RIDGE_SPECIALIZATION_V1", "manifest_contract")
	_check(int(manifest.get("issue", 0)) == 547, "manifest_issue")
	var specialization: Dictionary = manifest.get("specialization", {})
	_check(String(specialization.get("locus", "")) == "north_ridge", "fixed_north_ridge_locus")
	_check(bool(specialization.get("exactly_one_choice", false)), "exactly_one_choice")
	_check(bool(specialization.get("mutually_exclusive", false)), "mutually_exclusive")
	_check(bool(specialization.get("explicit_commit_required", false)), "explicit_commit")
	_check(not bool(specialization.get("repeatable_specialization", true)), "no_repeatable_specialization")
	var choices: Array = specialization.get("choices", [])
	_check(choices.size() == 2, "exactly_two_choices")
	_check(String(choices[0].get("id", "")) == "trade_post", "trade_post_choice")
	_check(String(choices[1].get("id", "")) == "watch_post", "watch_post_choice")
	var geography: Dictionary = manifest.get("shared_geography", {})
	for invariant in ["greenvale_origin_unchanged", "river_spline_unchanged", "east_bridge_transform_unchanged", "north_ridge_transform_unchanged", "gilded_crossing_transform_unchanged", "camera_topology_unchanged"]:
		_check(bool(geography.get(invariant, false)), "geography_%s" % invariant)
	_check(geography.get("claimed_lands_exactly", []) == ["east_route", "north_ridge"], "manifest_exact_two_lands")

	var pending := SESSION.save_session(
		"world_north_ridge_specialization_held_frontier", "east_trade", TEST_PATH,
		true, true, true, true, true, true,
		"trade", true, true, "river_surge",
		"shield_greenvale", "stand_firm", "secure_gilded_crossing",
		"north_ridge", "north_ridge_claimed", "established", "none"
	)
	_check(bool(pending.get("ok", false)), "save_pending_specialization")
	var restored := SESSION.load_session(TEST_PATH)
	_check(String(restored.get("entry_state", "")) == "world_north_ridge_specialization_held_frontier", "restore_pending_state")
	_check(String(restored.get("north_ridge_outpost", "")) == "established", "pending_preserves_outpost")
	_check(String(restored.get("north_ridge_specialization", "")) == "none", "pending_has_no_specialization")
	_check(restored.get("claimed_lands", []) == ["east_route", "north_ridge"], "pending_preserves_two_lands")

	var trade := SESSION.save_session(
		"map_north_ridge_trade_post_committed", "east_trade", TEST_PATH,
		true, true, true, true, true, true,
		"trade", true, true, "river_surge",
		"shield_greenvale", "stand_firm", "secure_gilded_crossing",
		"north_ridge", "north_ridge_claimed", "established", "trade_post"
	)
	_check(bool(trade.get("ok", false)), "save_trade_post")
	restored = SESSION.load_session(TEST_PATH)
	_check(String(restored.get("north_ridge_specialization", "")) == "trade_post", "restore_trade_post")
	_check(String(restored.get("north_ridge_outpost", "")) == "established", "trade_preserves_outpost")
	_check(String(restored.get("first_frontier_payoff", "")) == "secure_gilded_crossing", "trade_preserves_payoff")
	_check(restored.get("claimed_lands", []) == ["east_route", "north_ridge"], "trade_preserves_two_lands")

	var watch := SESSION.save_session(
		"world_north_ridge_watch_post_vigilance_posture", "east_trade", TEST_PATH,
		true, true, true, true, true, true,
		"frontier", true, true, "river_surge",
		"keep_east_bridge_open", "negotiate_passage", "ratify_east_bridge_passage",
		"north_ridge", "north_ridge_claimed", "established", "watch_post"
	)
	_check(bool(watch.get("ok", false)), "save_watch_post")
	restored = SESSION.load_session(TEST_PATH)
	_check(String(restored.get("north_ridge_specialization", "")) == "watch_post", "restore_watch_post")
	_check(String(restored.get("national_direction", "")) == "frontier", "watch_preserves_direction")
	_check(String(restored.get("imperial_crisis_response", "")) == "keep_east_bridge_open", "watch_preserves_crisis")
	_check(String(restored.get("first_rival_countermove_response", "")) == "negotiate_passage", "watch_preserves_rival")
	_check(restored.get("claimed_lands", []) == ["east_route", "north_ridge"], "watch_preserves_two_lands")

	var invalid := SESSION.save_session(
		"map_north_ridge_trade_post_committed", "east_trade", TEST_PATH,
		true, true, true, true, true, true,
		"trade", true, true, "river_surge",
		"shield_greenvale", "stand_firm", "secure_gilded_crossing",
		"north_ridge", "north_ridge_claimed", "established", "watch_post"
	)
	_check(String(invalid.get("status", "")) == "invalid_data", "reject_conflicting_choice")
	invalid = SESSION.save_session(
		"village_north_ridge_specialization_choice", "east_trade", TEST_PATH,
		true, true, true, true, true, true,
		"trade", true, true, "river_surge",
		"shield_greenvale", "stand_firm", "secure_gilded_crossing",
		"north_ridge", "north_ridge_claimed", "established", "trade_post"
	)
	_check(String(invalid.get("status", "")) == "invalid_data", "reject_committed_choice_in_pending_state")
	invalid = SESSION.save_session(
		"map_north_ridge_trade_post_committed", "east_trade", TEST_PATH,
		true, true, true, true, true, true,
		"trade", true, true, "river_surge",
		"shield_greenvale", "stand_firm", "secure_gilded_crossing",
		"north_ridge", "north_ridge_claimed", "none", "trade_post"
	)
	_check(String(invalid.get("status", "")) == "invalid_data", "reject_specialization_before_outpost")

	var payload := _read_json(TEST_PATH)
	payload["north_ridge_specialization"] = "hybrid_post"
	_write_json(TEST_PATH, payload)
	restored = SESSION.load_session(TEST_PATH)
	_check(String(restored.get("status", "")) == "invalid_value", "reject_unknown_specialization_payload")

	var legacy := SESSION.save_session(
		"world_north_ridge_outpost_held_two_land_frontier", "east_trade", TEST_PATH,
		true, true, true, true, true, true,
		"expand", true, true, "river_surge",
		"shield_greenvale", "stand_firm", "secure_gilded_crossing",
		"north_ridge", "north_ridge_claimed", "established"
	)
	_check(bool(legacy.get("ok", false)), "save_pre_specialization_outpost")
	payload = _read_json(TEST_PATH)
	payload.erase("north_ridge_specialization")
	_write_json(TEST_PATH, payload)
	restored = SESSION.load_session(TEST_PATH)
	_check(bool(restored.get("ok", false)), "load_pre_specialization_payload")
	_check(String(restored.get("north_ridge_specialization", "")) == "none", "legacy_defaults_to_unspecialized")
	_check(String(restored.get("north_ridge_outpost", "")) == "established", "legacy_preserves_outpost")

	var persistence := _read_text(PERSISTENCE_PATH)
	for token in [
		"VALID_NORTH_RIDGE_SPECIALIZATIONS",
		"NORTH_RIDGE_SPECIALIZATION_PENDING_STATES",
		"NORTH_RIDGE_TRADE_POST_STATES",
		"NORTH_RIDGE_WATCH_POST_STATES",
		"\"north_ridge_specialization\"",
		"world_north_ridge_specialization_held_frontier",
		"map_north_ridge_specialization_inspection",
		"village_north_ridge_specialization_choice",
		"map_north_ridge_trade_post_committed",
		"village_north_ridge_trade_post_greenvale_administers",
		"world_north_ridge_trade_post_logistics_posture",
		"map_north_ridge_watch_post_committed",
		"village_north_ridge_watch_post_greenvale_administers",
		"world_north_ridge_watch_post_vigilance_posture",
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
		print("GODOT_AURELIAN_NORTH_RIDGE_SPECIALIZATION_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("GODOT_AURELIAN_NORTH_RIDGE_SPECIALIZATION_V1_TEST_FAILURE: %s" % failure)
	quit(1)
