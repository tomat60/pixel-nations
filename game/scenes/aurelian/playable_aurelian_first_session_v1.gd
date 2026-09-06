extends "res://scenes/aurelian/playable_aurelian_entry_v1.gd"

const CORE_SESSION_ACTION_OPEN_NORTH_RIDGE := "open_north_ridge"
const CORE_SESSION_ACTION_COMPLETE := "complete"
const CORE_SESSION_ACTION_LEGACY := "legacy"
const CORE_SESSION_EXPANSION_READY_STATE := "world_first_imperial_expansion_north_ridge_direction"
const CORE_SESSION_FINAL_MAP_STATE := "map_first_imperial_expansion_two_lands_claimed"
const CORE_SESSION_FINAL_STATE := "world_first_imperial_expansion_two_land_footprint"

func core_session_action_for_state(state_name: String) -> String:
	match state_name:
		"world_first_empire_proclaimed":
			return CORE_SESSION_ACTION_OPEN_NORTH_RIDGE
		CORE_SESSION_FINAL_STATE:
			return CORE_SESSION_ACTION_COMPLETE
		_:
			return CORE_SESSION_ACTION_LEGACY

func core_session_right_target_for_state(state_name: String) -> String:
	if state_name == CORE_SESSION_FINAL_STATE:
		return CORE_SESSION_FINAL_MAP_STATE
	return ""

func _apply_entry_state(state_name: String) -> void:
	_sanitize_core_session_state_for_persistence(state_name)
	super(state_name)

func _sanitize_core_session_state_for_persistence(state_name: String) -> void:
	if not _core_session_active() or not IMPERIAL_EXPANSION_STATES.has(state_name):
		return

	# Phase B deliberately skips the legacy crisis/rival/frontier chain. The base
	# controller infers those prerequisites when restoring a late expansion state
	# for old evidence/full-progression flows. Clear only that skipped history
	# before the base renderer persists the restored core-session state.
	imperial_crisis = "none"
	imperial_crisis_response = "none"
	crisis_response_cursor = 0
	first_rival_countermove_response = "none"
	rival_response_cursor = 0
	first_frontier_payoff = "none"

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

func _right_entry() -> void:
	if _core_session_active():
		var target := core_session_right_target_for_state(entry_state)
		if not target.is_empty():
			_apply_entry_state(target)
			return
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
			controls_label.text = "SESSION COMPLETE    [RIGHT] Inspect both lands"

func _core_session_active() -> bool:
	if automated_input_mode:
		return false
	if OS.get_environment("AURELIAN_FULL_PROGRESSION") == "1":
		return false
	return OS.get_environment("AURELIAN_PLAYABLE_EVIDENCE_STATE").is_empty()
