extends SceneTree

const OVERLAY := preload("res://scenes/aurelian/playable_aurelian_strategic_overlay_separation_v1.gd")

var failures := 0


func _init() -> void:
	var overlay = OVERLAY.new()
	_check_map(overlay, "map_east_route_selected", "SELECTED | EAST ROUTE", "CLAIM ORIGIN")
	_check_map(overlay, "map_aurelian_imperial_heartland", "IMPERIAL HEARTLAND | GREENVALE", "NORTH RIDGE")
	_check_map(overlay, "map_first_imperial_expansion_two_lands_claimed", "OWNED | EAST ROUTE + NORTH RIDGE", "TWO LANDS")
	_check_world(overlay, "world_neutral", "AURELIAN | CHOOSE A DIRECTION", "DIRECTION  OPEN")
	_check_world(overlay, "world_first_empire_proclaimed", "AURELIAN EMPIRE | GREENVALE", "NEXT  NORTH RIDGE")
	_check_world(overlay, "world_first_imperial_expansion_two_land_footprint", "AURELIAN EMPIRE | TWO-LAND FOOTPRINT", "EAST ROUTE + NORTH RIDGE")
	var village: Dictionary = overlay.presentation_for_state("village_developed")
	_check(not bool(village.get("visible", true)), "village_overlay_hidden")
	_check(overlay.MAP_PREFIX == "map_" and overlay.WORLD_PREFIX == "world_", "view_prefix_contract")
	overlay.free()
	if failures == 0:
		print("AURELIAN_STRATEGIC_OVERLAY_SEPARATION_V1_TEST=PASS")
		quit(0)
	else:
		push_error("AURELIAN_STRATEGIC_OVERLAY_SEPARATION_V1_TEST=FAIL:%d" % failures)
		quit(1)


func _check_map(overlay: Node, state_name: String, primary: String, token: String) -> void:
	var value: Dictionary = overlay.presentation_for_state(state_name)
	_check(bool(value.get("visible", false)), "%s_visible" % state_name)
	_check(String(value.get("view", "")) == "MAP  |  WHERE", "%s_role" % state_name)
	_check(String(value.get("primary", "")) == primary, "%s_primary" % state_name)
	_check(token in String(value.get("context", "")), "%s_context" % state_name)


func _check_world(overlay: Node, state_name: String, primary: String, token: String) -> void:
	var value: Dictionary = overlay.presentation_for_state(state_name)
	_check(bool(value.get("visible", false)), "%s_visible" % state_name)
	_check(String(value.get("view", "")) == "WORLD  |  WHY / DIRECTION", "%s_role" % state_name)
	_check(String(value.get("primary", "")) == primary, "%s_primary" % state_name)
	_check(token in String(value.get("context", "")), "%s_context" % state_name)


func _check(condition: bool, label: String) -> void:
	if condition:
		print("AURELIAN_STRATEGIC_OVERLAY_CHECK=%s:PASS" % label)
	else:
		failures += 1
		push_error("AURELIAN_STRATEGIC_OVERLAY_CHECK=%s:FAIL" % label)
