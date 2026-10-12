extends Node

const CoreController = preload("res://core/playable_core_controller.gd")
const WORLD_SCENE := "res://_pn_templates/world/game/main_game.tscn"
const VILLAGE_SCENE := "res://_pn_templates/village/scenes/approved.tscn"

var core: Node

func _ready() -> void:
	core = CoreController.new()
	core.name = "PlayableCoreController"
	add_child(core)
	if FileAccess.file_exists(core.save_path):
		core.load_game()

func enter_village() -> bool:
	if not core.enter_selected_land():
		return false
	core.save_game()
	var error := get_tree().change_scene_to_file(VILLAGE_SCENE)
	if error != OK:
		core.return_to_world()
		push_error("PN_SCENE_SWITCH_TO_VILLAGE_FAILED: %s" % error)
		return false
	print("PN_WORLD_TO_GREENGATE=PASS")
	return true

func return_to_world() -> bool:
	if not core.return_to_world():
		return false
	if not core.save_game():
		push_error("PN_WORLD_RETURN_SAVE_FAILED")
		return false
	var error := get_tree().change_scene_to_file(WORLD_SCENE)
	if error != OK:
		push_error("PN_SCENE_SWITCH_TO_WORLD_FAILED: %s" % error)
		return false
	print("PN_GREENGATE_TO_WORLD=PASS")
	return true
