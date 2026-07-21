class_name GameState
extends RefCounted

const SCHEMA_VERSION := 1

static func initial_state() -> Dictionary:
	return {
		"schema_version": SCHEMA_VERSION,
		"sector_id": "A-01",
		"claimed_land_id": "",
		"settlement": {
			"founded": false,
			"name": "",
			"completed_orders": [],
		},
		"resources": {
			"food": 0,
			"timber": 0,
		},
	}

static func reduce(state: Dictionary, action: Dictionary) -> Dictionary:
	var next_state := state.duplicate(true)
	var action_type := String(action.get("type", ""))

	match action_type:
		"CLAIM_LAND":
			var land_id := String(action.get("land_id", ""))
			if land_id.is_empty() or not String(next_state.get("claimed_land_id", "")).is_empty():
				return next_state
			next_state["claimed_land_id"] = land_id

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
		return parsed
	return {}

static func _apply_order_reward(state: Dictionary, order_id: String) -> void:
	var resources: Dictionary = state.get("resources", {}).duplicate(true)
	match order_id:
		"shelter":
			resources["timber"] = int(resources.get("timber", 0)) + 5
		"food":
			resources["food"] = int(resources.get("food", 0)) + 5
	state["resources"] = resources
