extends SceneTree

const MANIFEST_PATH := "res://scenes/aurelian/aurelian_first_settlement_development_v1_manifest.json"
const PLAYABLE_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1_manifest.json"
const CONTROLLER_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1.gd"
const PERSISTENCE_PATH := "res://scenes/aurelian/aurelian_session_persistence_v2.gd"
const VILLAGE_MANIFEST_PATH := "res://scenes/aurelian/production_village_v1_state_manifest.json"

var failures: Array[String] = []

func _initialize() -> void:
	var manifest := _read_json(MANIFEST_PATH)
	var playable := _read_json(PLAYABLE_PATH)
	var village := _read_json(VILLAGE_MANIFEST_PATH)
	var controller := _read_text(CONTROLLER_PATH)
	var persistence := _read_text(PERSISTENCE_PATH)

	_check(String(manifest.get("contract", "")) == "GODOT_AURELIAN_FIRST_SETTLEMENT_DEVELOPMENT_V1", "contract")
	_check(int(manifest.get("issue", 0)) == 486, "issue")
	_check(String(manifest.get("before_state", "")) == "village_founded", "before_state")
	_check(String(manifest.get("after_state", "")) == "village_developed", "after_state")
	_check(String(manifest.get("village_visual_state", "")) == "developed", "visual_state")
	_check(int(manifest.get("developed_node_count", 0)) == 13, "developed_node_count")
	_check(String(manifest.get("return_state", "")) == "map_east_route_claimed", "return_claimed_map")
	_check(String(manifest.get("reopen_state", "")) == "village_developed", "reopen_developed")
	var action: Dictionary = manifest.get("action", {})
	_check(String(action.get("label", "")) == "Develop Greenvale", "action_label")
	_check(String(action.get("input", "")) == "ui_accept", "action_input")
	_check(String(action.get("event", "")) == "AURELIAN_FIRST_SETTLEMENT_DEVELOPMENT=GREENVALE", "action_event")
	var regression: Dictionary = manifest.get("regression", {})
	_check(String(regression.get("map_state", "")) == "east_route_claimed", "map_claim_retained")
	_check(String(regression.get("world_intent", "")) == "east_trade", "world_intent_retained")
	_check(regression.get("new_geography", true) == false, "no_new_geography")
	_check(regression.get("new_assets", true) == false, "no_new_assets")
	_check(regression.get("economy", true) == false, "no_economy")

	var forward_path: Array = playable.get("forward_path", [])
	_check(forward_path.has("village_founded"), "playable_founded")
	_check(forward_path.has("village_developed"), "playable_developed")
	_check(forward_path.has("map_east_route_claimed"), "playable_claimed_map")
	_check(controller.contains('"village_founded":'), "founded_transition_source")
	_check(controller.contains('_apply_entry_state("village_developed")'), "explicit_develop_transition")
	_check(controller.contains("Develop Greenvale"), "develop_hud")
	_check(controller.contains("AURELIAN_FIRST_SETTLEMENT_DEVELOPMENT=GREENVALE"), "develop_event")
	_check(controller.count("AURELIAN_FIRST_SETTLEMENT_DEVELOPMENT=GREENVALE") == 1, "event_single_action_site")
	_check(controller.contains('_apply_village_state(main_basin, "developed")'), "accepted_developed_visual")
	_check(controller.contains('"village_developed" if settlement_developed'), "reopen_developed")
	_check(persistence.contains('"village_developed"'), "developed_state_persisted")
	_check(persistence.contains('"settlement_developed"'), "developed_flag_persisted")
	_check(persistence.contains("const VERSION := 2"), "schema_version_2")

	var states: Dictionary = village.get("states", {})
	var developed: Dictionary = states.get("developed", {})
	var visible_nodes: Array = developed.get("visible", [])
	_check(visible_nodes.size() == 13, "accepted_13_node_state")
	_finish()

func _read_json(path: String) -> Dictionary:
	var payload = JSON.parse_string(_read_text(path))
	if payload is Dictionary:
		return payload as Dictionary
	_fail("json_%s" % path)
	return {}

func _read_text(path: String) -> String:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		_fail("open_%s" % path)
		return ""
	return file.get_as_text()

func _check(condition: bool, label: String) -> void:
	if not condition:
		_fail(label)

func _fail(label: String) -> void:
	failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("GODOT_AURELIAN_FIRST_SETTLEMENT_DEVELOPMENT_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("GODOT_AURELIAN_FIRST_SETTLEMENT_DEVELOPMENT_V1_TEST_FAILURE: %s" % failure)
	print("GODOT_AURELIAN_FIRST_SETTLEMENT_DEVELOPMENT_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
