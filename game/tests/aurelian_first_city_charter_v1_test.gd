extends SceneTree

const MANIFEST_PATH := "res://scenes/aurelian/aurelian_first_city_charter_v1_manifest.json"
const PLAYABLE_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1_manifest.json"
const VILLAGE_PATH := "res://scenes/aurelian/production_village_v1_state_manifest.json"
const CONTROLLER_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1.gd"
const PERSISTENCE_PATH := "res://scenes/aurelian/aurelian_session_persistence_v2.gd"

var failures: Array[String] = []

func _initialize() -> void:
	var manifest := _read_json(MANIFEST_PATH)
	var playable := _read_json(PLAYABLE_PATH)
	var village := _read_json(VILLAGE_PATH)
	var controller := _read_text(CONTROLLER_PATH)
	var persistence := _read_text(PERSISTENCE_PATH)
	_check(String(manifest.get("contract", "")) == "GODOT_AURELIAN_FIRST_CITY_CHARTER_V1", "contract")
	_check(int(manifest.get("authority_issue", 0)) == 498, "issue")
	var action: Dictionary = manifest.get("player_action", {})
	_check(String(action.get("label", "")) == "Charter Greenvale", "action_label")
	_check(String(action.get("event", "")) == "AURELIAN_FIRST_CITY_CHARTER=GREENVALE", "action_event")
	_check(bool(action.get("explicit_only", false)), "explicit_only")
	var states: Dictionary = manifest.get("states", {})
	_check(String(states.get("pre_village", "")) == "village_trade_dispatched", "pre_village")
	_check(String(states.get("post_village", "")) == "village_city_chartered", "post_village")
	_check(String(states.get("post_map", "")) == "map_greenvale_city", "post_map")
	_check(String(states.get("post_world", "")) == "world_first_city_recognized", "post_world")
	var visible: Dictionary = manifest.get("visible_outcome", {})
	_check(int(visible.get("developed_nodes", 0)) == 13, "developed_13")
	_check(int(visible.get("chartered_city_nodes", 0)) == 19, "city_19")
	_check(int(visible.get("civic_core_added_nodes", 0)) == 6, "civic_6")
	_check(_topology_is(visible.get("greenvale_origin", []), 354.0, 285.0), "origin")
	var village_states: Dictionary = village.get("states", {})
	var developed: Dictionary = village_states.get("developed", {})
	var city: Dictionary = village_states.get("city_chartered", {})
	_check((developed.get("visible", []) as Array).size() == 13, "village_developed_13")
	_check((city.get("visible", []) as Array).size() == 19, "village_city_19")
	for node in developed.get("visible", []):
		_check((city.get("visible", []) as Array).has(node), "city_superset_%s" % String(node))
	_check((village.get("derived_nodes", {}) as Dictionary).size() == 15, "six_civic_nodes_added")
	var path: Array = playable.get("forward_path", [])
	_check(path.has("village_city_chartered"), "playable_city")
	_check(path.has("map_greenvale_city"), "playable_map_city")
	_check(path.has("world_first_city_recognized"), "playable_world_city")
	_check(controller.contains("Charter Greenvale"), "charter_hud")
	_check(controller.contains('_apply_entry_state("village_city_chartered")'), "explicit_transition")
	_check(controller.count("AURELIAN_FIRST_CITY_CHARTER=GREENVALE") == 1, "event_single_action_site")
	_check(controller.contains("Vector2(354.0, 285.0)"), "city_marker_origin")
	_check(persistence.contains('"city_chartered"'), "city_flag")
	_check(persistence.contains('"map_greenvale_city"'), "map_city_persisted")
	_check(persistence.contains('"world_first_city_recognized"'), "world_city_persisted")
	_check(persistence.contains("const VERSION := 2"), "schema_version_2")
	_finish()

func _topology_is(value, x: float, y: float, epsilon := 0.001) -> bool:
	if not value is Array or value.size() != 2:
		return false
	return abs(float(value[0]) - x) <= epsilon and abs(float(value[1]) - y) <= epsilon

func _read_json(path: String) -> Dictionary:
	var payload = JSON.parse_string(_read_text(path))
	if payload is Dictionary:
		return payload as Dictionary
	failures.append("json_%s" % path)
	return {}

func _read_text(path: String) -> String:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		failures.append("open_%s" % path)
		return ""
	return file.get_as_text()

func _check(condition: bool, label: String) -> void:
	if not condition:
		failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("GODOT_AURELIAN_FIRST_CITY_CHARTER_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("GODOT_AURELIAN_FIRST_CITY_CHARTER_V1_TEST_FAILURE: %s" % failure)
	print("GODOT_AURELIAN_FIRST_CITY_CHARTER_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
