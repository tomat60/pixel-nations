extends SceneTree

const MANIFEST_PATH := "res://scenes/aurelian/aurelian_first_nation_founding_v1_manifest.json"
const PLAYABLE_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1_manifest.json"
const CONTROLLER_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1.gd"
const PERSISTENCE_PATH := "res://scenes/aurelian/aurelian_session_persistence_v2.gd"

var failures: Array[String] = []

func _initialize() -> void:
	var manifest := _read_json(MANIFEST_PATH)
	var playable := _read_json(PLAYABLE_PATH)
	var controller := _read_text(CONTROLLER_PATH)
	var persistence := _read_text(PERSISTENCE_PATH)
	_check(String(manifest.get("contract", "")) == "GODOT_AURELIAN_FIRST_NATION_FOUNDING_V1", "contract")
	_check(int(manifest.get("authority_issue", 0)) == 502, "issue")
	var action: Dictionary = manifest.get("player_action", {})
	_check(String(action.get("label", "")) == "Found Aurelian Nation", "action_label")
	_check(String(action.get("event", "")) == "AURELIAN_FIRST_NATION_FOUNDING=AURELIAN", "action_event")
	_check(bool(action.get("explicit_only", false)), "explicit_only")
	var states: Dictionary = manifest.get("states", {})
	_check(String(states.get("pre_world", "")) == "world_first_city_recognized", "pre_world")
	_check(String(states.get("post_world", "")) == "world_first_nation_founded", "post_world")
	_check(String(states.get("post_map", "")) == "map_aurelian_homeland", "post_map")
	_check(String(states.get("post_village", "")) == "village_greenvale_capital", "post_village")
	var visible: Dictionary = manifest.get("visible_outcome", {})
	_check(int(visible.get("city_nodes_preserved", 0)) == 19, "city_19")
	_check(int(visible.get("civic_standards_added_max", 0)) == 3, "standards_3")
	_check(_topology_is(visible.get("greenvale_origin", []), 354.0, 285.0), "origin")
	_check(int(visible.get("map_homeland_boundaries", 0)) == 1, "homeland_boundary")
	_check(int(visible.get("map_capital_markers", 0)) == 1, "capital_marker")
	_check(int(visible.get("world_nation_emblems", 0)) == 1, "nation_emblem")
	var path: Array = playable.get("forward_path", [])
	for state in ["world_first_nation_founded", "map_aurelian_homeland", "village_greenvale_capital"]:
		_check(path.has(state), "playable_%s" % state)
	_check(controller.contains("Found Aurelian Nation"), "nation_hud")
	_check(controller.contains('_apply_entry_state("world_first_nation_founded")'), "explicit_transition")
	_check(controller.count("AURELIAN_FIRST_NATION_FOUNDING=AURELIAN") == 1, "event_single_action_site")
	_check(controller.contains("func _build_homeland_marker()"), "homeland_builder")
	_check(controller.contains("func _build_nation_emblem()"), "emblem_builder")
	_check(controller.contains("func _build_capital_standards()"), "standards_builder")
	_check(controller.contains("Vector2(354.0, 285.0)"), "greenvale_origin")
	_check(controller.contains("range(3)"), "three_standards")
	_check(persistence.contains('"nation_founded"'), "nation_flag")
	_check(persistence.contains('"map_aurelian_homeland"'), "map_homeland_persisted")
	_check(persistence.contains('"world_first_nation_founded"'), "world_nation_persisted")
	_check(persistence.contains('"village_greenvale_capital"'), "capital_persisted")
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
		print("GODOT_AURELIAN_FIRST_NATION_FOUNDING_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("GODOT_AURELIAN_FIRST_NATION_FOUNDING_V1_TEST_FAILURE: %s" % failure)
	print("GODOT_AURELIAN_FIRST_NATION_FOUNDING_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
