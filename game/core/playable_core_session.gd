class_name PlayableCoreSession
extends RefCounted

const GameState = preload("res://core/game_state.gd")

const VIEW_WORLD := "world"
const VIEW_VILLAGE := "village"
const GREENGATE_LAND_ID := "PN-A01-001"
const GREENGATE_NAME := "Greengate"

var state: Dictionary = GameState.initial_state()
var current_view := VIEW_WORLD


func select_land(land_id: String) -> bool:
	if current_view != VIEW_WORLD:
		return false
	var previous := String(state.get("selected_land_id", ""))
	state = GameState.reduce(state, {"type": "SELECT_LAND", "land_id": land_id})
	return String(state.get("selected_land_id", "")) == land_id and previous != land_id


func claim_selected_land() -> bool:
	if current_view != VIEW_WORLD:
		return false
	var selected_land_id := String(state.get("selected_land_id", ""))
	if selected_land_id.is_empty():
		return false
	var previous_claims: Array = state.get("claimed_land_ids", []).duplicate()
	state = GameState.reduce(state, {"type": "CLAIM_LAND", "land_id": selected_land_id})
	var current_claims: Array = state.get("claimed_land_ids", [])
	return current_claims.has(selected_land_id) and current_claims.size() > previous_claims.size()


func enter_greengate() -> bool:
	if current_view != VIEW_WORLD:
		return false
	if String(state.get("selected_land_id", "")) != GREENGATE_LAND_ID:
		return false
	if String(state.get("claimed_land_id", "")) != GREENGATE_LAND_ID:
		return false
	state = GameState.reduce(state, {"type": "FOUND_SETTLEMENT", "name": GREENGATE_NAME})
	if not bool(state.get("settlement", {}).get("founded", false)):
		return false
	current_view = VIEW_VILLAGE
	return true


func build_greengate_road() -> bool:
	if current_view != VIEW_VILLAGE:
		return false
	var stone_before := int(state.get("resources", {}).get("stone", 0))
	state = GameState.reduce(state, {"type": "BUILD_ROAD"})
	var road_built := (state.get("settlement", {}).get("built_improvements", []) as Array).has("road")
	var stone_after := int(state.get("resources", {}).get("stone", 0))
	return road_built and stone_after == stone_before - GameState.ROAD_STONE_COST


func inspect_selected_frontier() -> bool:
	if current_view != VIEW_WORLD:
		return false
	var selected_land_id := String(state.get("selected_land_id", ""))
	var inspected_before: Array = state.get("inspected_land_ids", []).duplicate()
	state = GameState.reduce(state, {"type": "INSPECT_LAND", "land_id": selected_land_id})
	var inspected_after: Array = state.get("inspected_land_ids", [])
	return inspected_after.has(selected_land_id) and not inspected_before.has(selected_land_id)


func connect_riverbend() -> bool:
	if current_view != VIEW_WORLD:
		return false
	var connected_before: Array = state.get("connected_land_ids", []).duplicate()
	var stone_before := int(state.get("resources", {}).get("stone", 0))
	state = GameState.reduce(state, {"type": "CONNECT_RIVERBEND"})
	var connected_after: Array = state.get("connected_land_ids", [])
	var stone_after := int(state.get("resources", {}).get("stone", 0))
	return (
		connected_after.has(GameState.RIVERBEND_LAND_ID)
		and not connected_before.has(GameState.RIVERBEND_LAND_ID)
		and stone_after == stone_before - GameState.FRONTIER_LINK_STONE_COST
	)


func return_to_world() -> bool:
	if current_view != VIEW_VILLAGE:
		return false
	current_view = VIEW_WORLD
	return true


func save_to_path(path: String) -> bool:
	var file := FileAccess.open(path, FileAccess.WRITE)
	if file == null:
		return false
	file.store_string(GameState.to_json(state))
	return true


func load_from_path(path: String) -> bool:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return false
	var restored := GameState.from_json(file.get_as_text())
	if restored.is_empty():
		return false
	state = restored
	current_view = VIEW_WORLD
	return true


func world_view_model() -> Dictionary:
	var progress := GameState.progress(state)
	var settlement: Dictionary = state.get("settlement", {})
	return {
		"view": VIEW_WORLD,
		"selected_land_id": String(state.get("selected_land_id", "")),
		"claimed_land_id": String(state.get("claimed_land_id", "")),
		"claimed_land_ids": (state.get("claimed_land_ids", []) as Array).duplicate(),
		"claimed_lands": int(progress.get("claimed_lands", 0)),
		"charted_lands": int(progress.get("charted_lands", 0)),
		"settlement_name": String(settlement.get("name", "")),
		"settlement_founded": bool(progress.get("settlement_founded", false)),
		"road_built": bool(progress.get("road_built", false)),
		"inspected_land_ids": (state.get("inspected_land_ids", []) as Array).duplicate(),
		"inspected_frontiers": int(progress.get("inspected_frontiers", 0)),
		"riverbend_inspected": bool(progress.get("riverbend_inspected", false)),
		"riverbend_claimed": bool(progress.get("riverbend_claimed", false)),
		"riverbend_connected": bool(progress.get("riverbend_connected", false)),
		"frontier_link_status": String(progress.get("frontier_link_status", "not_started")),
		"stone": int(state.get("resources", {}).get("stone", 0)),
		"frontier_link_stone_cost": GameState.FRONTIER_LINK_STONE_COST,
		"nation_status": String(progress.get("nation_status", "not_founded")),
		"next_goal": String(progress.get("next_goal", "")),
	}


func village_view_model() -> Dictionary:
	var settlement: Dictionary = state.get("settlement", {})
	return {
		"view": VIEW_VILLAGE,
		"land_id": String(state.get("claimed_land_id", "")),
		"settlement_name": String(settlement.get("name", "")),
		"road_built": (settlement.get("built_improvements", []) as Array).has("road"),
		"stone": int(state.get("resources", {}).get("stone", 0)),
		"road_stone_cost": GameState.ROAD_STONE_COST,
	}
