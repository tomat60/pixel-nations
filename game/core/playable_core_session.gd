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


func receive_riverbend_supply() -> bool:
	if current_view != VIEW_VILLAGE:
		return false
	var completed_before: Array = state.get("settlement", {}).get("completed_orders", []).duplicate()
	var stone_before := int(state.get("resources", {}).get("stone", 0))
	state = GameState.reduce(state, {"type": "RECEIVE_RIVERBEND_SUPPLY"})
	var completed_after: Array = state.get("settlement", {}).get("completed_orders", [])
	var stone_after := int(state.get("resources", {}).get("stone", 0))
	return (
		completed_after.has(GameState.RIVERBEND_SUPPLY_ORDER_ID)
		and not completed_before.has(GameState.RIVERBEND_SUPPLY_ORDER_ID)
		and stone_after == stone_before + GameState.RIVERBEND_SUPPLY_STONE_REWARD
	)


func commission_highmere_survey() -> bool:
	if current_view != VIEW_VILLAGE:
		return false
	var completed_before: Array = state.get("settlement", {}).get("completed_orders", []).duplicate()
	var stone_before := int(state.get("resources", {}).get("stone", 0))
	state = GameState.reduce(state, {"type": "COMMISSION_HIGHMERE_SURVEY"})
	var completed_after: Array = state.get("settlement", {}).get("completed_orders", [])
	var stone_after := int(state.get("resources", {}).get("stone", 0))
	return (
		completed_after.has(GameState.HIGHMERE_SURVEY_ORDER_ID)
		and not completed_before.has(GameState.HIGHMERE_SURVEY_ORDER_ID)
		and stone_after == stone_before - GameState.HIGHMERE_SURVEY_STONE_COST
	)


func receive_highmere_link_supply() -> bool:
	if current_view != VIEW_VILLAGE:
		return false
	var completed_before: Array = state.get("settlement", {}).get("completed_orders", []).duplicate()
	var stone_before := int(state.get("resources", {}).get("stone", 0))
	state = GameState.reduce(state, {"type": "RECEIVE_HIGHMERE_LINK_SUPPLY"})
	var completed_after: Array = state.get("settlement", {}).get("completed_orders", [])
	var stone_after := int(state.get("resources", {}).get("stone", 0))
	return (
		completed_after.has(GameState.HIGHMERE_LINK_SUPPLY_ORDER_ID)
		and not completed_before.has(GameState.HIGHMERE_LINK_SUPPLY_ORDER_ID)
		and stone_after == stone_before + GameState.HIGHMERE_LINK_SUPPLY_STONE_REWARD
	)


func connect_highmere() -> bool:
	if current_view != VIEW_WORLD:
		return false
	var connected_before: Array = state.get("connected_land_ids", []).duplicate()
	var stone_before := int(state.get("resources", {}).get("stone", 0))
	state = GameState.reduce(state, {"type": "CONNECT_HIGHMERE"})
	var connected_after: Array = state.get("connected_land_ids", [])
	var stone_after := int(state.get("resources", {}).get("stone", 0))
	return (
		connected_after.has(GameState.HIGHMERE_LAND_ID)
		and not connected_before.has(GameState.HIGHMERE_LAND_ID)
		and stone_after == stone_before - GameState.HIGHMERE_LINK_STONE_COST
	)


func receive_northgate_settlement_timber() -> bool:
	if current_view != VIEW_VILLAGE:
		return false
	var completed_before: Array = state.get("settlement", {}).get("completed_orders", []).duplicate()
	var timber_before := int(state.get("resources", {}).get("timber", 0))
	state = GameState.reduce(state, {"type": "RECEIVE_NORTHGATE_SETTLEMENT_TIMBER"})
	var completed_after: Array = state.get("settlement", {}).get("completed_orders", [])
	var timber_after := int(state.get("resources", {}).get("timber", 0))
	return (
		completed_after.has(GameState.NORTHGATE_SETTLEMENT_TIMBER_ORDER_ID)
		and not completed_before.has(GameState.NORTHGATE_SETTLEMENT_TIMBER_ORDER_ID)
		and timber_after == timber_before + GameState.NORTHGATE_SETTLEMENT_TIMBER_REWARD
	)


func found_riverbend_hamlet() -> bool:
	if current_view != VIEW_WORLD:
		return false
	var settlements_before: Array = state.get("settlement_land_ids", []).duplicate()
	var timber_before := int(state.get("resources", {}).get("timber", 0))
	state = GameState.reduce(state, {"type": "FOUND_RIVERBEND_HAMLET"})
	var settlements_after: Array = state.get("settlement_land_ids", [])
	var timber_after := int(state.get("resources", {}).get("timber", 0))
	return (
		settlements_after.has(GameState.RIVERBEND_LAND_ID)
		and not settlements_before.has(GameState.RIVERBEND_LAND_ID)
		and timber_after == timber_before - GameState.RIVERBEND_HAMLET_TIMBER_COST
	)


func receive_riverbend_storehouse_stone() -> bool:
	if current_view != VIEW_VILLAGE:
		return false
	var completed_before: Array = state.get("settlement", {}).get("completed_orders", []).duplicate()
	var stone_before := int(state.get("resources", {}).get("stone", 0))
	state = GameState.reduce(state, {"type": "RECEIVE_RIVERBEND_STOREHOUSE_STONE"})
	var completed_after: Array = state.get("settlement", {}).get("completed_orders", [])
	var stone_after := int(state.get("resources", {}).get("stone", 0))
	return (
		completed_after.has(GameState.RIVERBEND_STOREHOUSE_STONE_ORDER_ID)
		and not completed_before.has(GameState.RIVERBEND_STOREHOUSE_STONE_ORDER_ID)
		and stone_after == stone_before + GameState.RIVERBEND_STOREHOUSE_STONE_REWARD
	)


func build_riverbend_storehouse() -> bool:
	if current_view != VIEW_WORLD:
		return false
	var improvements_before: Dictionary = state.get("settlement_improvements_by_land", {}).duplicate(true)
	var riverbend_before: Array = improvements_before.get(GameState.RIVERBEND_LAND_ID, [])
	var stone_before := int(state.get("resources", {}).get("stone", 0))
	state = GameState.reduce(state, {"type": "BUILD_RIVERBEND_STOREHOUSE"})
	var improvements_after: Dictionary = state.get("settlement_improvements_by_land", {})
	var riverbend_after: Array = improvements_after.get(GameState.RIVERBEND_LAND_ID, [])
	var stone_after := int(state.get("resources", {}).get("stone", 0))
	return (
		riverbend_after.has(GameState.RIVERBEND_STOREHOUSE_IMPROVEMENT_ID)
		and not riverbend_before.has(GameState.RIVERBEND_STOREHOUSE_IMPROVEMENT_ID)
		and stone_after == stone_before - GameState.RIVERBEND_STOREHOUSE_STONE_COST
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
		"settlement_count": int(progress.get("settlement_count", 0)),
		"settlement_land_ids": (progress.get("settlement_land_ids", []) as Array).duplicate(),
		"road_built": bool(progress.get("road_built", false)),
		"inspected_land_ids": (state.get("inspected_land_ids", []) as Array).duplicate(),
		"inspected_frontiers": int(progress.get("inspected_frontiers", 0)),
		"riverbend_inspected": bool(progress.get("riverbend_inspected", false)),
		"riverbend_claimed": bool(progress.get("riverbend_claimed", false)),
		"riverbend_connected": bool(progress.get("riverbend_connected", false)),
		"riverbend_supply_delivered": bool(progress.get("riverbend_supply_delivered", false)),
		"riverbend_supply_status": String(progress.get("riverbend_supply_status", "locked")),
		"highmere_survey_commissioned": bool(progress.get("highmere_survey_commissioned", false)),
		"highmere_inspected": bool(progress.get("highmere_inspected", false)),
		"highmere_claimed": bool(progress.get("highmere_claimed", false)),
		"highmere_link_supply_delivered": bool(progress.get("highmere_link_supply_delivered", false)),
		"highmere_connected": bool(progress.get("highmere_connected", false)),
		"northgate_inspected": bool(progress.get("northgate_inspected", false)),
		"northgate_status": String(progress.get("northgate_status", "locked")),
		"northgate_settlement_timber_delivered": bool(progress.get("northgate_settlement_timber_delivered", false)),
		"riverbend_hamlet_founded": bool(progress.get("riverbend_hamlet_founded", false)),
		"riverbend_storehouse_stone_delivered": bool(progress.get("riverbend_storehouse_stone_delivered", false)),
		"riverbend_storehouse_built": bool(progress.get("riverbend_storehouse_built", false)),
		"highmere_link_status": String(progress.get("highmere_link_status", "locked")),
		"highmere_status": String(progress.get("highmere_status", "locked")),
		"frontier_link_status": String(progress.get("frontier_link_status", "not_started")),
		"stone": int(state.get("resources", {}).get("stone", 0)),
		"timber": int(state.get("resources", {}).get("timber", 0)),
		"frontier_link_stone_cost": GameState.FRONTIER_LINK_STONE_COST,
		"highmere_link_stone_cost": GameState.HIGHMERE_LINK_STONE_COST,
		"riverbend_hamlet_timber_cost": GameState.RIVERBEND_HAMLET_TIMBER_COST,
		"riverbend_storehouse_stone_cost": GameState.RIVERBEND_STOREHOUSE_STONE_COST,
		"nation_status": String(progress.get("nation_status", "not_founded")),
		"next_goal": String(progress.get("next_goal", "")),
	}


func village_view_model() -> Dictionary:
	var settlement: Dictionary = state.get("settlement", {})
	var progress := GameState.progress(state)
	return {
		"view": VIEW_VILLAGE,
		"land_id": String(state.get("claimed_land_id", "")),
		"settlement_name": String(settlement.get("name", "")),
		"claimed_lands": int(progress.get("claimed_lands", 0)),
		"charted_lands": int(progress.get("charted_lands", 0)),
		"settlement_count": int(progress.get("settlement_count", 0)),
		"nation_status": String(progress.get("nation_status", "not_founded")),
		"next_goal": String(progress.get("next_goal", "")),
		"road_built": (settlement.get("built_improvements", []) as Array).has("road"),
		"stone": int(state.get("resources", {}).get("stone", 0)),
		"timber": int(state.get("resources", {}).get("timber", 0)),
		"road_stone_cost": GameState.ROAD_STONE_COST,
		"riverbend_connected": (state.get("connected_land_ids", []) as Array).has(GameState.RIVERBEND_LAND_ID),
		"riverbend_supply_delivered": (settlement.get("completed_orders", []) as Array).has(GameState.RIVERBEND_SUPPLY_ORDER_ID),
		"riverbend_supply_stone_reward": GameState.RIVERBEND_SUPPLY_STONE_REWARD,
		"highmere_survey_commissioned": (settlement.get("completed_orders", []) as Array).has(GameState.HIGHMERE_SURVEY_ORDER_ID),
		"highmere_survey_stone_cost": GameState.HIGHMERE_SURVEY_STONE_COST,
		"highmere_claimed": (state.get("claimed_land_ids", []) as Array).has(GameState.HIGHMERE_LAND_ID),
		"highmere_link_supply_delivered": (settlement.get("completed_orders", []) as Array).has(GameState.HIGHMERE_LINK_SUPPLY_ORDER_ID),
		"highmere_link_supply_stone_reward": GameState.HIGHMERE_LINK_SUPPLY_STONE_REWARD,
		"highmere_connected": (state.get("connected_land_ids", []) as Array).has(GameState.HIGHMERE_LAND_ID),
		"northgate_inspected": (state.get("inspected_land_ids", []) as Array).has(GameState.NORTHGATE_LAND_ID),
		"northgate_settlement_timber_delivered": (settlement.get("completed_orders", []) as Array).has(GameState.NORTHGATE_SETTLEMENT_TIMBER_ORDER_ID),
		"northgate_settlement_timber_reward": GameState.NORTHGATE_SETTLEMENT_TIMBER_REWARD,
		"riverbend_hamlet_founded": (state.get("settlement_land_ids", []) as Array).has(GameState.RIVERBEND_LAND_ID),
		"riverbend_storehouse_stone_delivered": (settlement.get("completed_orders", []) as Array).has(GameState.RIVERBEND_STOREHOUSE_STONE_ORDER_ID),
		"riverbend_storehouse_stone_reward": GameState.RIVERBEND_STOREHOUSE_STONE_REWARD,
		"riverbend_storehouse_built": ((state.get("settlement_improvements_by_land", {}) as Dictionary).get(GameState.RIVERBEND_LAND_ID, []) as Array).has(GameState.RIVERBEND_STOREHOUSE_IMPROVEMENT_ID),
	}
