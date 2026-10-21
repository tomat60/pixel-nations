extends SceneTree

const ENTRY_SCENE = preload("res://scenes/aurelian/playable_aurelian_entry_v1.tscn")

var failures: Array[String] = []


func _initialize() -> void:
	OS.set_environment("AURELIAN_FULL_PROGRESSION", "1")
	call_deferred("_run")


func _run() -> void:
	# Each direction runs in its own Godot process and isolated user profile. This
	# keeps the production persistence layer enabled without allowing one variant's
	# saved final state to contaminate the next variant.
	var direction := OS.get_environment("AURELIAN_DIRECTION_VARIANT").to_lower()
	match direction:
		"trade":
			_exercise_variant("trade", "shield_greenvale", "stand_firm", "trade_post")
		"expand":
			_exercise_variant("expand", "shield_greenvale", "negotiate_passage", "watch_post")
		"frontier":
			_exercise_variant("frontier", "keep_east_bridge_open", "negotiate_passage", "trade_post")
		_:
			failures.append("unknown_or_missing_direction_%s" % direction)
	if failures.is_empty():
		print("AURELIAN_DIRECTION_TRANSITION_HARNESS_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("AURELIAN_DIRECTION_TRANSITION_HARNESS_V1_TEST_FAILURE: %s" % failure)
	print("AURELIAN_DIRECTION_TRANSITION_HARNESS_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)


func _exercise_variant(direction: String, crisis_response: String, rival_response: String, specialization: String) -> void:
	var runtime = ENTRY_SCENE.instantiate()
	root.add_child(runtime)

	# The renderer movie separately proves the real click/claim/Greengate/road/World
	# input path. Start this deep-branch contract at the first Nation decision and
	# invoke the same production transition methods without replaying 8430 frames.
	for property in ["settlement_founded", "settlement_developed", "route_connected", "caravan_dispatched", "city_chartered", "nation_founded"]:
		runtime.set(property, true)
	runtime.set("national_direction_cursor", ["trade", "expand", "frontier"].find(direction))
	runtime.call("_apply_entry_state", "world_first_nation_founded")
	runtime.call("_accept_entry")
	_expect(runtime.get("committed_direction") == direction, direction, "direction_commitment")

	runtime.call("_right_entry")
	runtime.call("_right_entry")
	runtime.call("_accept_entry")
	_expect(bool(runtime.get("national_mandate_started")), direction, "mandate_started")
	runtime.call("_previous_entry")
	runtime.call("_previous_entry")
	runtime.call("_right_entry")
	runtime.call("_right_entry")
	runtime.call("_accept_entry")
	_expect(bool(runtime.get("empire_proclaimed")), direction, "empire_proclaimed")
	runtime.call("_previous_entry")
	runtime.call("_previous_entry")

	runtime.call("_accept_entry")
	runtime.call("_right_entry")
	runtime.call("_right_entry")
	if crisis_response == "keep_east_bridge_open":
		runtime.call("_cycle_national_direction", 1)
	runtime.call("_accept_entry")
	_expect(runtime.get("imperial_crisis_response") == crisis_response, direction, "crisis_%s" % crisis_response)
	runtime.call("_previous_entry")
	runtime.call("_previous_entry")
	runtime.call("_accept_entry")
	runtime.call("_right_entry")
	runtime.call("_right_entry")
	if rival_response == "negotiate_passage":
		runtime.call("_cycle_national_direction", 1)
	runtime.call("_accept_entry")
	_expect(runtime.get("first_rival_countermove_response") == rival_response, direction, "rival_%s" % rival_response)
	runtime.call("_previous_entry")
	runtime.call("_previous_entry")

	runtime.call("_accept_entry")
	runtime.call("_right_entry")
	runtime.call("_right_entry")
	runtime.call("_accept_entry")
	var expected_frontier_payoff := "secure_gilded_crossing" if rival_response == "stand_firm" else "ratify_east_bridge_passage"
	_expect(runtime.get("first_frontier_payoff") == expected_frontier_payoff, direction, "frontier_payoff")
	runtime.call("_previous_entry")
	runtime.call("_previous_entry")
	runtime.call("_accept_entry")
	runtime.call("_right_entry")
	runtime.call("_accept_entry")
	runtime.call("_accept_entry")
	runtime.call("_previous_entry")
	_expect(runtime.get("first_imperial_expansion") == "north_ridge_claimed", direction, "north_ridge_claimed")

	runtime.call("_accept_entry")
	runtime.call("_right_entry")
	runtime.call("_right_entry")
	runtime.call("_accept_entry")
	runtime.call("_previous_entry")
	_expect(runtime.get("north_ridge_outpost") == "established", direction, "outpost_established")
	runtime.call("_accept_entry")
	runtime.call("_right_entry")
	runtime.call("_right_entry")
	if specialization == "watch_post":
		runtime.call("_cycle_national_direction", 1)
	runtime.call("_accept_entry")
	runtime.call("_previous_entry")
	_expect(runtime.get("north_ridge_specialization") == specialization, direction, "specialization_%s" % specialization)

	runtime.call("_accept_entry")
	runtime.call("_right_entry")
	runtime.call("_right_entry")
	runtime.call("_accept_entry")
	runtime.call("_previous_entry")
	var expected_specialization_payoff := "ridge_logistics_line_open" if specialization == "trade_post" else "ridge_signal_lit"
	_expect(runtime.get("north_ridge_specialization_payoff") == expected_specialization_payoff, direction, "specialization_payoff")
	runtime.call("_accept_entry")
	runtime.call("_right_entry")
	runtime.call("_right_entry")
	runtime.call("_accept_entry")
	var expected_coordination := "ridge_convoy_dispatched" if specialization == "trade_post" else "basin_alert_raised"
	_expect(runtime.get("first_inter_land_coordination") == expected_coordination, direction, "coordination")
	runtime.call("_right_entry")
	runtime.call("_right_entry")
	var expected_final_state := "world_coordinated_logistics_network" if specialization == "trade_post" else "world_coordinated_vigilance_network"
	_expect(runtime.get("entry_state") == expected_final_state, direction, "final_state")
	print("AURELIAN_DIRECTION_TRANSITION_VARIANT_PASS=%s" % direction.to_upper())

	runtime.free()


func _expect(condition: bool, direction: String, label: String) -> void:
	if not condition:
		failures.append("%s_%s" % [direction, label])
