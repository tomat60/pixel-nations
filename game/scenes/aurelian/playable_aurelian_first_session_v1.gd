extends "res://scenes/aurelian/playable_aurelian_entry_v1.gd"

const CORE_SESSION_ACTION_OPEN_NORTH_RIDGE := "open_north_ridge"
const CORE_SESSION_ACTION_COMPLETE := "complete"
const CORE_SESSION_ACTION_LEGACY := "legacy"
const CORE_SESSION_EXPANSION_READY_STATE := "world_first_imperial_expansion_north_ridge_direction"
const CORE_SESSION_FINAL_STATE := "world_first_imperial_expansion_two_land_footprint"

func core_session_action_for_state(state_name: String) -> String:
	match state_name:
		"world_first_empire_proclaimed":
			return CORE_SESSION_ACTION_OPEN_NORTH_RIDGE
		CORE_SESSION_FINAL_STATE:
			return CORE_SESSION_ACTION_COMPLETE
		_:
			return CORE_SESSION_ACTION_LEGACY

func _accept_entry() -> void:
	if not _core_session_active():
		super()
		return

	match core_session_action_for_state(entry_state):
		CORE_SESSION_ACTION_OPEN_NORTH_RIDGE:
			if empire_proclaimed and imperial_expansion_target == "none":
				imperial_expansion_target = "north_ridge"
				_apply_entry_state(CORE_SESSION_EXPANSION_READY_STATE)
				print("AURELIAN_CORE_SESSION_EXPANSION_READY=NORTH_RIDGE")
			return
		CORE_SESSION_ACTION_COMPLETE:
			print("AURELIAN_CORE_SESSION_COMPLETE=TWO_LANDS")
			return
		_:
			super()

func _update_runtime_hud() -> void:
	super()
	if not _core_session_active() or intent_label == null or controls_label == null:
		return

	match entry_state:
		"world_first_empire_proclaimed":
			intent_label.text = "Aurelian has become an empire. North Ridge is the next frontier."
			controls_label.text = "[ENTER] Open North Ridge expansion    [LEFT / RIGHT] Inspect empire"
		CORE_SESSION_EXPANSION_READY_STATE:
			intent_label.text = "Adjacent North Ridge is ready to become Aurelian's second land"
			controls_label.text = "[RIGHT] Inspect North Ridge on Map"
		CORE_SESSION_FINAL_STATE:
			intent_label.text = "First session complete: Aurelian now spans East Route and North Ridge"
			controls_label.text = "[RIGHT] Inspect both lands    [LEFT] Review expansion"

func _core_session_active() -> bool:
	if automated_input_mode:
		return false
	if OS.get_environment("AURELIAN_FULL_PROGRESSION") == "1":
		return false
	return OS.get_environment("AURELIAN_PLAYABLE_EVIDENCE_STATE").is_empty()
