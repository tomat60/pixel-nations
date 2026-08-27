extends SceneTree

const MANIFEST_PATH := "res://scenes/aurelian/river_surge_crisis_v1_manifest.json"
const CONTROLLER_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1.gd"
const PERSISTENCE_PATH := "res://scenes/aurelian/aurelian_session_persistence_v2.gd"

var failures: Array[String] = []

func _initialize() -> void:
	var manifest := _read_json(MANIFEST_PATH)
	var persistence := _read_text(PERSISTENCE_PATH)
	var controller := _read_text(CONTROLLER_PATH)
	_check(String(manifest.get("contract", "")) == "GODOT_AURELIAN_RIVER_SURGE_CRISIS_V1", "contract")
	_check(int(manifest.get("issue", 0)) == 526, "issue")
	_check(String(manifest.get("authority_baseline_sha", "")) == "1f5399a849f6736c5a178d3198184ad338a7eb39", "authority_baseline")
	_check(String(manifest.get("product_baseline_sha", "")) == "bcd97f7970856551d91fa325609761eb542c32c1", "product_baseline")
	var crisis: Dictionary = manifest.get("crisis", {}) as Dictionary
	_check(String(crisis.get("id", "")) == "river_surge", "crisis_id")
	_check(bool(crisis.get("explicit_player_response_required", false)), "explicit_response")
	_check(not bool(crisis.get("resolution_simulation_allowed", true)), "no_resolution_simulation")
	var responses: Dictionary = manifest.get("responses", {}) as Dictionary
	_check(responses.size() == 2, "exactly_two_responses")
	_check(responses.has("shield_greenvale"), "shield_greenvale")
	_check(responses.has("keep_east_bridge_open"), "keep_east_bridge_open")
	_check(String((responses.get("shield_greenvale", {}) as Dictionary).get("map_locus", "")) == "greenvale", "greenvale_locus")
	_check(String((responses.get("keep_east_bridge_open", {}) as Dictionary).get("map_locus", "")) == "east_bridge", "east_bridge_locus")
	var event: Dictionary = manifest.get("event", {}) as Dictionary
	_check(String(event.get("format", "")) == "AURELIAN_FIRST_IMPERIAL_CRISIS_RESPONSE=SHIELD_GREENVALE|KEEP_EAST_BRIDGE_OPEN", "event")
	_check(bool(event.get("single_event", false)), "single_event")
	_check(bool(event.get("idempotent", false)), "idempotent")
	_check(not bool(event.get("restore_event_emission_allowed", true)), "no_restore_event")
	var geography: Dictionary = manifest.get("shared_geography", {}) as Dictionary
	for field in [
		"greenvale_origin_unchanged",
		"river_spline_unchanged",
		"river_banks_unchanged",
		"east_bridge_transform_unchanged",
		"bridge_landings_unchanged",
		"east_route_unchanged",
		"north_ridge_unchanged",
		"gilded_crossing_unchanged",
	]:
		_check(bool(geography.get(field, false)), field)
	_check(not bool(geography.get("ownership_change_allowed", true)), "no_ownership_change")
	_check(not bool(geography.get("second_land_allowed", true)), "no_second_land")
	for state_name in [
		"world_river_surge_crisis",
		"map_river_surge_response_loci",
		"village_river_surge_response_pending",
		"village_aurelian_imperial_capital_greenvale_shielded",
		"village_aurelian_imperial_capital_bridge_response",
		"map_aurelian_imperial_heartland_greenvale_response",
		"map_aurelian_imperial_heartland_bridge_response",
		"world_aurelian_river_surge_greenvale_response",
		"world_aurelian_river_surge_bridge_response",
	]:
		_check(persistence.contains("\\\"%s\\\"" % state_name), "persistence_state_%s" % state_name)
	for field in ["imperial_crisis", "imperial_crisis_response"]:
		_check(persistence.contains("\\\"%s\\\"" % field), "persistence_field_%s" % field)
	_check(persistence.contains("VALID_IMPERIAL_CRISES"), "valid_crises")
	_check(persistence.contains("VALID_IMPERIAL_CRISIS_RESPONSES"), "valid_responses")
	_check(persistence.contains("imperial_crisis_response == \\\"shield_greenvale\\\""), "greenvale_validation")
	_check(persistence.contains("imperial_crisis_response == \\\"keep_east_bridge_open\\\""), "bridge_validation")
	_check(not controller.is_empty(), "controller_available")
	for required_controller_token in [
		"CRISIS_RESPONSES",
		"world_river_surge_crisis",
		"map_river_surge_response_loci",
		"village_river_surge_response_pending",
		"_build_river_surge_presentation",
		"GreenvaleResponseLocus",
		"EastBridgeResponseLocus",
		"AURELIAN_FIRST_IMPERIAL_CRISIS_RESPONSE=SHIELD_GREENVALE",
		"AURELIAN_FIRST_IMPERIAL_CRISIS_RESPONSE=KEEP_EAST_BRIDGE_OPEN",
		"SESSION.save_session(entry_state",
		"imperial_crisis, imperial_crisis_response",
	]:
		_check(controller.contains(required_controller_token), "controller_%s" % required_controller_token)
	_check(controller.contains("[UP / DOWN] Inspect responses"), "normal_input_response_inspection")
	_check(controller.contains("[ENTER] Commit response"), "explicit_response_commit")
	_check(controller.contains("Vector2(354.0, 285.0)"), "accepted_greenvale_topology")
	_check(controller.contains("Vector2(515.0, 340.0)"), "accepted_east_bridge_topology")
	_finish()

func _read_json(path: String) -> Dictionary:
	var parsed: Variant = JSON.parse_string(_read_text(path))
	return parsed if parsed is Dictionary else {}

func _read_text(path: String) -> String:
	var file := FileAccess.open(path, FileAccess.READ)
	return file.get_as_text() if file != null else ""

func _check(condition: bool, label: String) -> void:
	if not condition:
		failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("GODOT_AURELIAN_RIVER_SURGE_CRISIS_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("GODOT_AURELIAN_RIVER_SURGE_CRISIS_V1_TEST_FAILURE: %s" % failure)
	quit(1)
