class_name GameState
extends RefCounted

const SCHEMA_VERSION := 4
const CHARTED_LANDS := 30
const ROAD_STONE_COST := 5
const GREENVALE_LAND_ID := "PN-A01-001"
const RIVERBEND_LAND_ID := "PN-A01-002"
const CANONICAL_LAND_IDS := [
	"PN-A01-001", "PN-A01-002", "PN-A01-003", "PN-A01-004", "PN-A01-005",
	"PN-A01-006", "PN-A01-007", "PN-A01-008", "PN-A01-009", "PN-A01-010",
	"PN-A01-011", "PN-A01-012", "PN-A01-013", "PN-A01-014", "PN-A01-015",
	"PN-A01-016", "PN-A01-017", "PN-A01-018", "PN-A01-019", "PN-A01-020",
	"PN-A01-021", "PN-A01-022", "PN-A01-023", "PN-A01-024", "PN-A01-025",
	"PN-A01-026", "PN-A01-027", "PN-A01-028", "PN-A01-029", "PN-A01-030",
]

static func initial_state() -> Dictionary:
	return {
		"schema_version": SCHEMA_VERSION,
		"sector_id": "A-01",
		"selected_land_id": "",
		"claimed_land_id": "",
		"claimed_land_ids": [],
		"inspected_land_ids": [],
		"settlement": {
			"founded": false,
			"name": "",
			"completed_orders": [],
			"built_improvements": [],
		},
		"resources": {
			"food": 0,
			"timber": 0,
			"stone": 10,
		},
	}

static func reduce(state: Dictionary, action: Dictionary) -> Dictionary:
	var next_state := state.duplicate(true)
	var action_type := String(action.get("type", ""))

	match action_type:
		"SELECT_LAND":
			var land_id := String(action.get("land_id", ""))
			if not CANONICAL_LAND_IDS.has(land_id):
				return next_state
			next_state["selected_land_id"] = land_id

		"CLAIM_LAND":
			var land_id := String(action.get("land_id", ""))
			if not CANONICAL_LAND_IDS.has(land_id):
				return next_state
			if String(next_state.get("selected_land_id", "")) != land_id:
				return next_state
			var claimed_land_ids: Array = next_state.get("claimed_land_ids", []).duplicate()
			var home_land_id := String(next_state.get("claimed_land_id", ""))
			if home_land_id.is_empty():
				next_state["claimed_land_id"] = land_id
				claimed_land_ids = [land_id]
				next_state["claimed_land_ids"] = claimed_land_ids
				return next_state
			var inspected: Array = next_state.get("inspected_land_ids", [])
			var settlement: Dictionary = next_state.get("settlement", {})
			var road_built := (settlement.get("built_improvements", []) as Array).has("road")
			if (
				land_id != RIVERBEND_LAND_ID
				or home_land_id != GREENVALE_LAND_ID
				or not inspected.has(RIVERBEND_LAND_ID)
				or not road_built
				or claimed_land_ids.has(RIVERBEND_LAND_ID)
			):
				return next_state
			claimed_land_ids.append(RIVERBEND_LAND_ID)
			next_state["claimed_land_ids"] = claimed_land_ids

		"FOUND_SETTLEMENT":
			if String(next_state.get("claimed_land_id", "")).is_empty():
				return next_state
			var settlement: Dictionary = next_state.get("settlement", {}).duplicate(true)
			if bool(settlement.get("founded", false)):
				return next_state
			settlement["founded"] = true
			settlement["name"] = String(action.get("name", "Aurelian Haven"))
			next_state["settlement"] = settlement

		"COMPLETE_VILLAGE_ORDER":
			var settlement: Dictionary = next_state.get("settlement", {}).duplicate(true)
			if not bool(settlement.get("founded", false)):
				return next_state
			var order_id := String(action.get("order_id", ""))
			if order_id.is_empty():
				return next_state
			var completed_orders: Array = settlement.get("completed_orders", []).duplicate()
			if completed_orders.has(order_id):
				return next_state
			completed_orders.append(order_id)
			settlement["completed_orders"] = completed_orders
			next_state["settlement"] = settlement
			_apply_order_reward(next_state, order_id)

		"BUILD_ROAD":
			var settlement: Dictionary = next_state.get("settlement", {}).duplicate(true)
			if not bool(settlement.get("founded", false)):
				return next_state
			var improvements: Array = settlement.get("built_improvements", []).duplicate()
			if improvements.has("road"):
				return next_state
			var resources: Dictionary = next_state.get("resources", {}).duplicate(true)
			if int(resources.get("stone", 0)) < ROAD_STONE_COST:
				return next_state
			resources["stone"] = int(resources.get("stone", 0)) - ROAD_STONE_COST
			improvements.append("road")
			settlement["built_improvements"] = improvements
			next_state["resources"] = resources
			next_state["settlement"] = settlement

		"INSPECT_LAND":
			var land_id := String(action.get("land_id", ""))
			var settlement: Dictionary = next_state.get("settlement", {})
			var road_built := (settlement.get("built_improvements", []) as Array).has("road")
			if (
				land_id != RIVERBEND_LAND_ID
				or String(next_state.get("selected_land_id", "")) != land_id
				or String(next_state.get("claimed_land_id", "")) != GREENVALE_LAND_ID
				or not road_built
			):
				return next_state
			var inspected: Array = next_state.get("inspected_land_ids", []).duplicate()
			if inspected.has(land_id):
				return next_state
			inspected.append(land_id)
			next_state["inspected_land_ids"] = inspected

		_:
			return next_state

	return next_state

static func replay(actions: Array) -> Dictionary:
	var state := initial_state()
	for action in actions:
		if action is Dictionary:
			state = reduce(state, action)
	return state

static func to_json(state: Dictionary) -> String:
	return JSON.stringify(state)

static func from_json(payload: String) -> Dictionary:
	var parsed = JSON.parse_string(payload)
	if parsed is Dictionary:
		return _normalize_state(parsed)
	return {}

static func progress(state: Dictionary) -> Dictionary:
	var claimed_land_ids: Array = state.get("claimed_land_ids", [])
	var claimed := not claimed_land_ids.is_empty()
	var settlement: Dictionary = state.get("settlement", {})
	var founded := bool(settlement.get("founded", false))
	var road_built := (settlement.get("built_improvements", []) as Array).has("road")
	var riverbend_inspected := (state.get("inspected_land_ids", []) as Array).has(RIVERBEND_LAND_ID)
	var riverbend_claimed := claimed_land_ids.has(RIVERBEND_LAND_ID)
	var next_goal := "Select and claim Greenvale"
	if claimed and not founded:
		next_goal = "Found Greengate"
	elif founded and not road_built:
		next_goal = "Build Greengate road"
	elif road_built and not riverbend_inspected:
		next_goal = "Inspect Riverbend, Greenvale's eastern neighbor"
	elif riverbend_inspected and not riverbend_claimed:
		next_goal = "Choose whether to claim Riverbend"
	elif riverbend_claimed:
		next_goal = "Connect Riverbend to Greengate"
	return {
		"claimed_lands": claimed_land_ids.size(),
		"charted_lands": CHARTED_LANDS,
		"settlement_founded": founded,
		"road_built": road_built,
		"inspected_frontiers": 1 if riverbend_inspected else 0,
		"riverbend_inspected": riverbend_inspected,
		"riverbend_claimed": riverbend_claimed,
		"frontier_link_status": "pending" if riverbend_claimed else "not_started",
		"nation_status": "not_founded",
		"next_goal": next_goal,
	}

static func _apply_order_reward(state: Dictionary, order_id: String) -> void:
	var resources: Dictionary = state.get("resources", {}).duplicate(true)
	match order_id:
		"shelter":
			resources["timber"] = int(resources.get("timber", 0)) + 5
		"food":
			resources["food"] = int(resources.get("food", 0)) + 5
	state["resources"] = resources

static func _normalize_state(saved: Dictionary) -> Dictionary:
	var normalized := initial_state()
	normalized["sector_id"] = String(saved.get("sector_id", "A-01"))

	var claimed_land_id := String(saved.get("claimed_land_id", ""))
	var claimed_is_valid := CANONICAL_LAND_IDS.has(claimed_land_id)
	if claimed_is_valid:
		normalized["claimed_land_id"] = claimed_land_id
		normalized["claimed_land_ids"] = [claimed_land_id]

	var selected_land_id := String(saved.get("selected_land_id", ""))
	if CANONICAL_LAND_IDS.has(selected_land_id):
		normalized["selected_land_id"] = selected_land_id
	elif CANONICAL_LAND_IDS.has(claimed_land_id):
		normalized["selected_land_id"] = claimed_land_id

	var saved_settlement = saved.get("settlement", {})
	if saved_settlement is Dictionary:
		var settlement: Dictionary = normalized["settlement"]
		var founded := claimed_is_valid and bool(saved_settlement.get("founded", false))
		settlement["founded"] = founded
		settlement["name"] = String(saved_settlement.get("name", "")) if founded else ""
		var completed_orders = saved_settlement.get("completed_orders", [])
		if founded and completed_orders is Array:
			settlement["completed_orders"] = completed_orders.duplicate()
		var built_improvements = saved_settlement.get("built_improvements", [])
		if founded and built_improvements is Array and built_improvements.has("road"):
			settlement["built_improvements"] = ["road"]
		normalized["settlement"] = settlement

	var saved_inspected = saved.get("inspected_land_ids", [])
	var normalized_settlement: Dictionary = normalized.get("settlement", {})
	var normalized_road_built := (
		(normalized_settlement.get("built_improvements", []) as Array).has("road")
	)
	if (
		saved_inspected is Array
		and saved_inspected.has(RIVERBEND_LAND_ID)
		and claimed_land_id == GREENVALE_LAND_ID
		and normalized_road_built
	):
		normalized["inspected_land_ids"] = [RIVERBEND_LAND_ID]

	var saved_claimed_land_ids = saved.get("claimed_land_ids", [])
	if (
		saved_claimed_land_ids is Array
		and saved_claimed_land_ids.has(RIVERBEND_LAND_ID)
		and claimed_land_id == GREENVALE_LAND_ID
		and normalized["inspected_land_ids"].has(RIVERBEND_LAND_ID)
	):
		normalized["claimed_land_ids"] = [GREENVALE_LAND_ID, RIVERBEND_LAND_ID]

	var saved_resources = saved.get("resources", {})
	if saved_resources is Dictionary:
		var resources: Dictionary = normalized["resources"]
		resources["food"] = int(saved_resources.get("food", resources["food"]))
		resources["timber"] = int(saved_resources.get("timber", resources["timber"]))
		resources["stone"] = int(saved_resources.get("stone", resources["stone"]))
		normalized["resources"] = resources

	return normalized
