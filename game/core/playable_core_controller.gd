class_name PlayableCoreController
extends Node

const PlayableCoreSession = preload("res://core/playable_core_session.gd")

signal snapshot_changed(snapshot: Dictionary)
signal view_changed(view: String, snapshot: Dictionary)
signal action_rejected(action: String, reason: String)

@export var save_path := "user://pixel_nations_playable_core.json"

var session := PlayableCoreSession.new()


func _ready() -> void:
	_publish_snapshot()


func current_snapshot() -> Dictionary:
	var snapshot := (
		session.village_view_model()
		if session.current_view == PlayableCoreSession.VIEW_VILLAGE
		else session.world_view_model()
	)
	return snapshot.duplicate(true)


func select_land_from_map(land_id: String) -> bool:
	if session.select_land(land_id):
		_publish_snapshot()
		return true
	return _reject("select_land", "Land selection is unavailable or unchanged.")


func claim_selected_land() -> bool:
	if session.claim_selected_land():
		_publish_snapshot()
		return true
	return _reject("claim_land", "Select an unclaimed canonical A-01 land first.")


func enter_selected_land() -> bool:
	if session.enter_greengate():
		_publish_view()
		return true
	return _reject("enter_land", "Greengate can be entered only from claimed PN-A01-001.")


func build_road() -> bool:
	if session.build_greengate_road():
		_publish_snapshot()
		return true
	return _reject("build_road", "The Greengate road requires the Village view and 5 stone.")


func return_to_world() -> bool:
	if session.return_to_world():
		_publish_view()
		return true
	return _reject("return_world", "Already viewing the World.")


func save_game() -> bool:
	if session.save_to_path(save_path):
		return true
	return _reject("save_game", "The save file could not be written.")


func load_game() -> bool:
	if session.load_from_path(save_path):
		_publish_view()
		return true
	return _reject("load_game", "No valid playable-core save was found.")


func _publish_snapshot() -> void:
	snapshot_changed.emit(current_snapshot())


func _publish_view() -> void:
	var snapshot := current_snapshot()
	view_changed.emit(String(snapshot.get("view", "")), snapshot)
	snapshot_changed.emit(snapshot)


func _reject(action: String, reason: String) -> bool:
	action_rejected.emit(action, reason)
	return false
