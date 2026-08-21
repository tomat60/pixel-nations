extends SceneTree

const PLAYABLE_MANIFEST_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1_manifest.json"
const MAP_MANIFEST_PATH := "res://scenes/aurelian/production_map_v1_manifest.json"
const VILLAGE_MANIFEST_PATH := "res://scenes/aurelian/production_village_v1_state_manifest.json"
const CONTROLLER_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1.gd"
const PERSISTENCE_PATH := "res://scenes/aurelian/aurelian_session_persistence_v2.gd"

var failures: Array[String] = []

func _initialize() -> void:
	var playable := _read_json(PLAYABLE_MANIFEST_PATH)
	var map_manifest := _read_json(MAP_MANIFEST_PATH)
	var village := _read_json(VILLAGE_MANIFEST_PATH)
	var controller := _read_text(CONTROLLER_PATH)
	var persistence := _read_text(PERSISTENCE_PATH)

	_check(playable.get("forward_path", []) == ["world_neutral", "world_trade_selected", "map_east_route_selected", "map_east_route_claimed", "village_claimed"], "claim_forward_path")
	_check(playable.get("backward_path", []) == ["village_claimed", "map_east_route_claimed", "world_trade_selected"], "claim_backward_path")
	var runtime: Dictionary = playable.get("runtime_rules", {})
	_check(runtime.get("claim_is_explicit_player_action", false) == true, "explicit_claim_runtime")
	_check(runtime.get("economy_claimed", true) == false, "no_economy")

	var overlays: Array = map_manifest.get("overlays", [])
	var selected := _overlay_by_id(overlays, "Land_EastRouteSelected")
	var claimed := _overlay_by_id(overlays, "Land_EastRouteClaimed")
	_check(not selected.is_empty(), "selected_overlay")
	_check(not claimed.is_empty(), "claimed_overlay")
	_check(selected.get("topology", []) == [760, 410], "selected_topology")
	_check(claimed.get("topology", []) == [760, 410], "claimed_topology")
	_check(String(selected.get("shape", "")) == "selected_ring", "selected_shape")
	_check(String(claimed.get("shape", "")) == "claimed_hex", "claimed_shape")
	_check(String(selected.get("color", "")) != String(claimed.get("color", "")), "selected_claimed_color_distinction")
	var map_states: Dictionary = map_manifest.get("states", {})
	_check(map_states.has("east_route_claimed"), "claimed_map_state")
	_check((map_states.get("east_route_claimed", {}) as Dictionary).get("visible", []).has("Land_EastRouteClaimed"), "claimed_marker_visible")

	var village_states: Dictionary = village.get("states", {})
	_check(village_states.has("claimed"), "village_claimed_exists")
	_check(controller.contains("[ENTER] Claim East Route"), "claim_hud_language")
	_check(controller.contains("AURELIAN_FIRST_LAND_CLAIM=EAST_ROUTE"), "claim_event")
	_check(controller.contains('_apply_map_state(main_overlay_root, "east_route_claimed")'), "claimed_map_binding")
	_check(controller.contains('_apply_village_state(main_basin, "claimed")'), "claimed_village_binding")
	_check(persistence.contains('"map_east_route_selected"'), "persist_selected")
	_check(persistence.contains('"map_east_route_claimed"'), "persist_claimed")
	_check(persistence.contains('"village_claimed"'), "persist_village_claimed")
	_check(persistence.contains("const VERSION := 2"), "schema_v2_unchanged")
	_finish()

func _overlay_by_id(overlays: Array, overlay_id: String) -> Dictionary:
	for variant in overlays:
		if variant is Dictionary and String((variant as Dictionary).get("id", "")) == overlay_id:
			return variant as Dictionary
	return {}

func _read_json(path: String) -> Dictionary:
	var text := _read_text(path)
	var payload = JSON.parse_string(text)
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
		print("GODOT_AURELIAN_FIRST_LAND_CLAIM_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("GODOT_AURELIAN_FIRST_LAND_CLAIM_V1_TEST_FAILURE: %s" % failure)
	print("GODOT_AURELIAN_FIRST_LAND_CLAIM_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
