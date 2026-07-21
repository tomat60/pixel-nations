extends Control

const GameState = preload("res://core/game_state.gd")

@onready var status_label: Label = %StatusLabel
@onready var detail_label: Label = %DetailLabel

func _ready() -> void:
	var actions := [
		{"type": "CLAIM_LAND", "land_id": "A-01-0042"},
		{"type": "FOUND_SETTLEMENT", "name": "Aurelian Haven"},
		{"type": "COMPLETE_VILLAGE_ORDER", "order_id": "shelter"},
	]
	var state := GameState.replay(actions)
	var passed := (
		String(state.get("claimed_land_id", "")) == "A-01-0042"
		and bool(state.get("settlement", {}).get("founded", false))
		and state.get("settlement", {}).get("completed_orders", []).has("shelter")
	)

	status_label.text = "FOUNDATION TEST: %s" % ("PASS" if passed else "FAIL")
	detail_label.text = "Godot %s · Migration Sprint 1\nAurelian Basin core-state proof only\nNo visual migration claim" % Engine.get_version_info().get("string", "unknown")

	if DisplayServer.get_name() == "headless":
		await get_tree().process_frame
		get_tree().quit(0 if passed else 1)
