# Exact-head evidence includes empire proclamation and persistence across native, Web, and profile reopen.
extends "res://scenes/aurelian/aurelian_decision_loop_v1.gd"

const SESSION := preload("res://scenes/aurelian/aurelian_session_persistence_v2.gd")

const PLAYABLE_MANIFEST_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1_manifest.json"
const NATIONAL_DIRECTIONS := ["trade", "expand", "frontier"]
const CRISIS_RESPONSES := ["shield_greenvale", "keep_east_bridge_open"]
const RIVAL_RESPONSES := ["stand_firm", "negotiate_passage"]
const FRONTIER_PAYOFFS := ["secure_gilded_crossing", "ratify_east_bridge_passage"]
const FRONTIER_PAYOFF_STATES := [
	"world_first_frontier_payoff_gilded_crossing_revealed",
	"map_first_frontier_payoff_gilded_crossing_pending",
	"village_first_frontier_payoff_gilded_crossing_pending",
	"village_first_frontier_payoff_gilded_crossing_secured",
	"map_first_frontier_payoff_gilded_crossing_secured",
	"world_first_frontier_legacy_gilded_crossing_complete",
	"world_first_frontier_payoff_east_bridge_revealed",
	"map_first_frontier_payoff_east_bridge_pending",
	"village_first_frontier_payoff_east_bridge_pending",
	"village_first_frontier_payoff_east_bridge_secured",
	"map_first_frontier_payoff_east_bridge_secured",
	"world_first_frontier_legacy_east_bridge_complete",
]
const IMPERIAL_EXPANSION_STATES := [
	"world_first_imperial_expansion_north_ridge_direction",
	"map_first_imperial_expansion_north_ridge_available",
	"map_first_imperial_expansion_north_ridge_inspected",
	"map_first_imperial_expansion_two_lands_claimed",
	"village_first_imperial_expansion_greenvale_capital_two_lands",
	"world_first_imperial_expansion_two_land_footprint",
]
const NORTH_RIDGE_OUTPOST_STATES := [
	"world_north_ridge_outpost_frontier_need",
	"map_north_ridge_outpost_claimed_inspection",
	"village_north_ridge_outpost_establish_action",
	"map_north_ridge_outpost_established",
	"village_north_ridge_outpost_greenvale_administers",
	"world_north_ridge_outpost_held_two_land_frontier",
]
const NORTH_RIDGE_OUTPOST_ESTABLISHED_STATES := [
	"map_north_ridge_outpost_established",
	"village_north_ridge_outpost_greenvale_administers",
	"world_north_ridge_outpost_held_two_land_frontier",
]
const NORTH_RIDGE_SPECIALIZATIONS := ["trade_post", "watch_post"]
const NORTH_RIDGE_SPECIALIZATION_STATES := [
	"world_north_ridge_specialization_held_frontier",
	"map_north_ridge_specialization_inspection",
	"village_north_ridge_specialization_choice",
	"map_north_ridge_trade_post_committed",
	"village_north_ridge_trade_post_greenvale_administers",
	"world_north_ridge_trade_post_logistics_posture",
	"map_north_ridge_watch_post_committed",
	"village_north_ridge_watch_post_greenvale_administers",
	"world_north_ridge_watch_post_vigilance_posture",
]
const CRISIS_STATES := [
	"world_river_surge_crisis",
	"map_river_surge_response_loci",
	"village_river_surge_response_pending",
	"village_aurelian_imperial_capital_greenvale_shielded",
	"village_aurelian_imperial_capital_bridge_response",
	"map_aurelian_imperial_heartland_greenvale_response",
	"map_aurelian_imperial_heartland_bridge_response",
	"world_aurelian_river_surge_greenvale_response",
	"world_aurelian_river_surge_bridge_response",
]
const RIVAL_STATES := [
	"world_first_rival_countermove",
	"map_first_rival_countermove_east_bridge",
	"map_first_rival_countermove_greenvale",
	"village_first_rival_response_pending",
	"village_first_rival_response_stand_firm",
	"map_first_rival_response_stand_firm",
	"world_first_rival_response_stand_firm",
	"village_first_rival_response_negotiate_passage",
	"map_first_rival_response_negotiate_passage",
	"world_first_rival_response_negotiate_passage",
]
const ENTRY_STATES := [
	"world_neutral",
	"world_trade_selected",
	"map_east_route_selected",
	"map_east_route_claimed",
	"map_east_route_connected",
	"world_trade_route_active",
	"village_trade_dispatched",
	"map_east_route_in_use",
	"world_first_trade_underway",
	"village_city_chartered",
	"map_greenvale_city",
	"world_first_city_recognized",
	"world_first_nation_founded",
	"map_aurelian_homeland",
	"village_greenvale_capital",
	"village_national_mandate_started",
	"map_national_mandate_active",
	"world_national_mandate_underway",
	"village_aurelian_imperial_capital",
	"map_aurelian_imperial_heartland",
	"world_first_empire_proclaimed",
	"world_river_surge_crisis",
	"map_river_surge_response_loci",
	"village_river_surge_response_pending",
	"village_aurelian_imperial_capital_greenvale_shielded",
	"village_aurelian_imperial_capital_bridge_response",
	"map_aurelian_imperial_heartland_greenvale_response",
	"map_aurelian_imperial_heartland_bridge_response",
	"world_aurelian_river_surge_greenvale_response",
	"world_aurelian_river_surge_bridge_response",
	"world_first_rival_countermove",
	"map_first_rival_countermove_east_bridge",
	"map_first_rival_countermove_greenvale",
	"village_first_rival_response_pending",
	"village_first_rival_response_stand_firm",
	"map_first_rival_response_stand_firm",
	"world_first_rival_response_stand_firm",
	"village_first_rival_response_negotiate_passage",
	"map_first_rival_response_negotiate_passage",
	"world_first_rival_response_negotiate_passage",
	"world_first_frontier_payoff_gilded_crossing_revealed",
	"map_first_frontier_payoff_gilded_crossing_pending",
	"village_first_frontier_payoff_gilded_crossing_pending",
	"village_first_frontier_payoff_gilded_crossing_secured",
	"map_first_frontier_payoff_gilded_crossing_secured",
	"world_first_frontier_legacy_gilded_crossing_complete",
	"world_first_frontier_payoff_east_bridge_revealed",
	"map_first_frontier_payoff_east_bridge_pending",
	"village_first_frontier_payoff_east_bridge_pending",
	"village_first_frontier_payoff_east_bridge_secured",
	"map_first_frontier_payoff_east_bridge_secured",
	"world_first_frontier_legacy_east_bridge_complete",
	"world_first_imperial_expansion_north_ridge_direction",
	"map_first_imperial_expansion_north_ridge_available",
	"map_first_imperial_expansion_north_ridge_inspected",
	"map_first_imperial_expansion_two_lands_claimed",
	"village_first_imperial_expansion_greenvale_capital_two_lands",
	"world_first_imperial_expansion_two_land_footprint",
	"world_north_ridge_outpost_frontier_need",
	"map_north_ridge_outpost_claimed_inspection",
	"village_north_ridge_outpost_establish_action",
	"map_north_ridge_outpost_established",
	"village_north_ridge_outpost_greenvale_administers",
	"world_north_ridge_outpost_held_two_land_frontier",
	"world_north_ridge_specialization_held_frontier",
	"map_north_ridge_specialization_inspection",
	"village_north_ridge_specialization_choice",
	"map_north_ridge_trade_post_committed",
	"village_north_ridge_trade_post_greenvale_administers",
	"world_north_ridge_trade_post_logistics_posture",
	"map_north_ridge_watch_post_committed",
	"village_north_ridge_watch_post_greenvale_administers",
	"world_north_ridge_watch_post_vigilance_posture",
	"village_claimed",
	"village_founded",
	"village_developed",
	"map_east_route",
	"village_route_context",
]

var entry_state := "world_neutral"
var playable_contract: Dictionary = {}
var hud_layer: CanvasLayer
var layer_label: Label
var intent_label: Label
var controls_label: Label
var automated_input_mode := false
var automated_frame := 0
var automated_direction := "expand"
var automated_crisis_response := "shield_greenvale"
var automated_rival_response := "stand_firm"
var persistence_enabled := true
var restored_intent := "none"
var settlement_founded := false
var settlement_developed := false
var route_connected := false
var caravan_dispatched := false
var city_chartered := false
var nation_founded := false
var national_direction_cursor := 0
var committed_direction := "none"
var national_mandate_started := false
var empire_proclaimed := false
var imperial_crisis := "none"
var imperial_crisis_response := "none"
var crisis_response_cursor := 0
var first_rival_countermove_response := "none"
var first_frontier_payoff := "none"
var imperial_expansion_target := "none"
var first_imperial_expansion := "none"
var north_ridge_outpost := "none"
var north_ridge_specialization := "none"
var north_ridge_specialization_cursor := 0
var rival_response_cursor := 0
var river_surge_presentation: Node3D
var mandate_marker: Node3D
var dispatch_token: Node3D
var city_marker: Node3D
var homeland_marker: Node3D
var nation_emblem: Node3D
var capital_standards: Node3D
var living_capital_presentation: Node3D
var imperial_presentation: Node3D
var imperial_expansion_presentation: Node3D
var north_ridge_outpost_presentation: Node3D
var north_ridge_specialization_presentation: Node3D

func _ready() -> void:
	if DisplayServer.get_name() == "headless" and not ResourceLoader.exists(GLB_PATH):
		print("PLAYABLE_AURELIAN_HEADLESS_SMOKE=PASS_NO_RENDER_ASSET")
		get_tree().quit(0)
		return
	playable_contract = _load_playable_contract()
	if playable_contract.is_empty():
		get_tree().quit(91)
		return
	automated_input_mode = OS.get_environment("AURELIAN_CAPTURE_PLAYABLE_ENTRY") == "1"
	var requested_automated_direction := OS.get_environment("AURELIAN_AUTOMATED_DIRECTION").to_lower()
	if requested_automated_direction in NATIONAL_DIRECTIONS:
		automated_direction = requested_automated_direction
	var requested_automated_response := OS.get_environment("AURELIAN_AUTOMATED_CRISIS_RESPONSE").to_lower()
	if requested_automated_response in CRISIS_RESPONSES:
		automated_crisis_response = requested_automated_response
	var requested_rival_response := OS.get_environment("AURELIAN_AUTOMATED_RIVAL_RESPONSE").to_lower()
	if requested_rival_response in RIVAL_RESPONSES:
		automated_rival_response = requested_rival_response
	var evidence_state := OS.get_environment("AURELIAN_PLAYABLE_EVIDENCE_STATE").to_lower()
	var evidence_direction := OS.get_environment("AURELIAN_COMMITTED_DIRECTION").to_lower()
	if NATIONAL_DIRECTIONS.has(evidence_direction):
		committed_direction = evidence_direction
		national_direction_cursor = NATIONAL_DIRECTIONS.find(evidence_direction)
	persistence_enabled = evidence_state.is_empty() and not automated_input_mode
	if not OS.get_environment("AURELIAN_EVIDENCE_DIR").is_empty():
		get_window().content_scale_size = STILL_SIZE
		get_window().content_scale_aspect = Window.CONTENT_SCALE_ASPECT_IGNORE
		get_window().size = STILL_SIZE
	if ENTRY_STATES.has(evidence_state):
		entry_state = evidence_state
		settlement_founded = evidence_state in ["village_founded", "village_developed", "village_trade_dispatched", "map_east_route_in_use", "world_first_trade_underway"]
		settlement_developed = evidence_state in ["village_developed", "village_trade_dispatched", "map_east_route_connected", "map_east_route_in_use", "world_trade_route_active", "world_first_trade_underway"]
		route_connected = evidence_state in ["map_east_route_connected", "map_east_route_in_use", "world_trade_route_active", "world_first_trade_underway", "village_trade_dispatched"]
		caravan_dispatched = evidence_state in ["village_trade_dispatched", "map_east_route_in_use", "world_first_trade_underway", "village_city_chartered", "map_greenvale_city", "world_first_city_recognized", "world_first_nation_founded", "map_aurelian_homeland", "village_greenvale_capital"]
		city_chartered = evidence_state in ["village_city_chartered", "map_greenvale_city", "world_first_city_recognized", "world_first_nation_founded", "map_aurelian_homeland", "village_greenvale_capital"]
		nation_founded = evidence_state in ["world_first_nation_founded", "map_aurelian_homeland", "village_greenvale_capital", "village_national_mandate_started", "map_national_mandate_active", "world_national_mandate_underway"]
		national_mandate_started = evidence_state in ["village_national_mandate_started", "map_national_mandate_active", "world_national_mandate_underway", "village_aurelian_imperial_capital", "map_aurelian_imperial_heartland", "world_first_empire_proclaimed"]
		empire_proclaimed = evidence_state in ["village_aurelian_imperial_capital", "map_aurelian_imperial_heartland", "world_first_empire_proclaimed"] or evidence_state in CRISIS_STATES or evidence_state in RIVAL_STATES or evidence_state in FRONTIER_PAYOFF_STATES or evidence_state in IMPERIAL_EXPANSION_STATES or evidence_state in NORTH_RIDGE_OUTPOST_STATES or evidence_state in NORTH_RIDGE_SPECIALIZATION_STATES
		if evidence_state in CRISIS_STATES or evidence_state in RIVAL_STATES or evidence_state in FRONTIER_PAYOFF_STATES or evidence_state in IMPERIAL_EXPANSION_STATES or evidence_state in NORTH_RIDGE_OUTPOST_STATES or evidence_state in NORTH_RIDGE_SPECIALIZATION_STATES:
			imperial_crisis = "river_surge"
			if evidence_state in ["village_aurelian_imperial_capital_greenvale_shielded", "map_aurelian_imperial_heartland_greenvale_response", "world_aurelian_river_surge_greenvale_response"]:
				imperial_crisis_response = "shield_greenvale"
			elif evidence_state in ["village_aurelian_imperial_capital_bridge_response", "map_aurelian_imperial_heartland_bridge_response", "world_aurelian_river_surge_bridge_response", "map_first_rival_countermove_greenvale"]:
				imperial_crisis_response = "keep_east_bridge_open"
				crisis_response_cursor = 1
			elif evidence_state in RIVAL_STATES or evidence_state in FRONTIER_PAYOFF_STATES:
				imperial_crisis_response = automated_crisis_response
				crisis_response_cursor = CRISIS_RESPONSES.find(imperial_crisis_response)
			if evidence_state in ["village_first_rival_response_stand_firm", "map_first_rival_response_stand_firm", "world_first_rival_response_stand_firm"]:
				first_rival_countermove_response = "stand_firm"
			elif evidence_state in ["village_first_rival_response_negotiate_passage", "map_first_rival_response_negotiate_passage", "world_first_rival_response_negotiate_passage"] or evidence_state in FRONTIER_PAYOFF_STATES and "east_bridge" in evidence_state:
				first_rival_countermove_response = "negotiate_passage"
				rival_response_cursor = 1
			elif evidence_state in FRONTIER_PAYOFF_STATES:
				first_rival_countermove_response = "stand_firm"
			if evidence_state in FRONTIER_PAYOFF_STATES and ("secured" in evidence_state or "complete" in evidence_state):
				first_frontier_payoff = "secure_gilded_crossing" if "gilded_crossing" in evidence_state else "ratify_east_bridge_passage"
			elif evidence_state in IMPERIAL_EXPANSION_STATES or evidence_state in NORTH_RIDGE_OUTPOST_STATES or evidence_state in NORTH_RIDGE_SPECIALIZATION_STATES:
				first_rival_countermove_response = automated_rival_response
				rival_response_cursor = RIVAL_RESPONSES.find(first_rival_countermove_response)
				first_frontier_payoff = "secure_gilded_crossing" if first_rival_countermove_response == "stand_firm" else "ratify_east_bridge_passage"
				imperial_expansion_target = "north_ridge"
				first_imperial_expansion = "north_ridge_claimed" if evidence_state in ["map_first_imperial_expansion_two_lands_claimed", "village_first_imperial_expansion_greenvale_capital_two_lands", "world_first_imperial_expansion_two_land_footprint"] or evidence_state in NORTH_RIDGE_OUTPOST_STATES or evidence_state in NORTH_RIDGE_SPECIALIZATION_STATES else "none"
				north_ridge_outpost = "established" if evidence_state in NORTH_RIDGE_OUTPOST_ESTABLISHED_STATES or evidence_state in NORTH_RIDGE_SPECIALIZATION_STATES else "none"
				if evidence_state in NORTH_RIDGE_SPECIALIZATION_STATES:
					north_ridge_specialization = "trade_post" if "trade_post" in evidence_state else ("watch_post" if "watch_post" in evidence_state else "none")
					north_ridge_specialization_cursor = NORTH_RIDGE_SPECIALIZATIONS.find(north_ridge_specialization) if north_ridge_specialization != "none" else 0
	else:
		var restored := SESSION.load_session()
		entry_state = String(restored.get("entry_state", "world_neutral"))
		restored_intent = String(restored.get("selected_intent", "none"))
		settlement_founded = bool(restored.get("settlement_founded", false))
		settlement_developed = bool(restored.get("settlement_developed", false))
		route_connected = bool(restored.get("route_connected", false))
		caravan_dispatched = bool(restored.get("caravan_dispatched", false))
		city_chartered = bool(restored.get("city_chartered", false))
		nation_founded = bool(restored.get("nation_founded", false))
		committed_direction = String(restored.get("national_direction", "none"))
		national_mandate_started = bool(restored.get("national_mandate_started", false))
		empire_proclaimed = bool(restored.get("empire_proclaimed", false))
		imperial_crisis = String(restored.get("imperial_crisis", "none"))
		imperial_crisis_response = String(restored.get("imperial_crisis_response", "none"))
		first_rival_countermove_response = String(restored.get("first_rival_countermove_response", "none"))
		first_frontier_payoff = String(restored.get("first_frontier_payoff", "none"))
		imperial_expansion_target = String(restored.get("imperial_expansion_target", "none"))
		first_imperial_expansion = String(restored.get("first_imperial_expansion", "none"))
		north_ridge_outpost = String(restored.get("north_ridge_outpost", "none"))
		north_ridge_specialization = String(restored.get("north_ridge_specialization", "none"))
		if north_ridge_specialization in NORTH_RIDGE_SPECIALIZATIONS:
			north_ridge_specialization_cursor = NORTH_RIDGE_SPECIALIZATIONS.find(north_ridge_specialization)
		if imperial_crisis_response == "keep_east_bridge_open":
			crisis_response_cursor = 1
		if first_rival_countermove_response == "negotiate_passage":
			rival_response_cursor = 1
		if NATIONAL_DIRECTIONS.has(committed_direction):
			national_direction_cursor = NATIONAL_DIRECTIONS.find(committed_direction)
		else:
			committed_direction = "none"
		print("AURELIAN_NATIONAL_DIRECTION_RESTORED=%s" % committed_direction)
		print("AURELIAN_SESSION_V2_LOAD=%s:%s:%s:%s:%s:%s:%s:%s:%s:%s" % [String(restored.get("status", "unknown")), String(restored.get("adapter", "unknown")), entry_state, restored_intent, settlement_founded, settlement_developed, route_connected, caravan_dispatched, city_chartered, nation_founded])
	if not ENTRY_STATES.has(entry_state):
		entry_state = "world_neutral"
		restored_intent = "none"
		settlement_founded = false
		settlement_developed = false
		route_connected = false
		caravan_dispatched = false
		city_chartered = false
		nation_founded = false
		committed_direction = "none"
		national_mandate_started = false
		empire_proclaimed = false
		imperial_crisis = "none"
		imperial_crisis_response = "none"
		crisis_response_cursor = 0
		first_rival_countermove_response = "none"
		first_frontier_payoff = "none"
		imperial_expansion_target = "none"
		first_imperial_expansion = "none"
		north_ridge_outpost = "none"
		north_ridge_specialization = "none"
		north_ridge_specialization_cursor = 0
		rival_response_cursor = 0
		national_direction_cursor = 0
	if entry_state in ["village_founded", "village_developed", "village_trade_dispatched", "map_east_route_connected", "map_east_route_in_use", "world_trade_route_active", "world_first_trade_underway"]:
		settlement_founded = true
	if entry_state in ["village_developed", "village_trade_dispatched", "map_east_route_connected", "map_east_route_in_use", "world_trade_route_active", "world_first_trade_underway"]:
		settlement_developed = true
	if entry_state in ["map_east_route_connected", "map_east_route_in_use", "world_trade_route_active", "world_first_trade_underway", "village_trade_dispatched"]:
		route_connected = true
	if entry_state in ["village_trade_dispatched", "map_east_route_in_use", "world_first_trade_underway", "village_city_chartered", "map_greenvale_city", "world_first_city_recognized"]:
		caravan_dispatched = true
	if entry_state in ["village_city_chartered", "map_greenvale_city", "world_first_city_recognized", "world_first_nation_founded", "map_aurelian_homeland", "village_greenvale_capital"]:
		city_chartered = true
	if entry_state in ["world_first_nation_founded", "map_aurelian_homeland", "village_greenvale_capital", "village_national_mandate_started", "map_national_mandate_active", "world_national_mandate_underway"]:
		nation_founded = true
	if entry_state in ["village_national_mandate_started", "map_national_mandate_active", "world_national_mandate_underway", "village_aurelian_imperial_capital", "map_aurelian_imperial_heartland", "world_first_empire_proclaimed"]:
		national_mandate_started = true
	if entry_state in ["village_aurelian_imperial_capital", "map_aurelian_imperial_heartland", "world_first_empire_proclaimed"]:
		empire_proclaimed = true
	if entry_state in CRISIS_STATES or entry_state in RIVAL_STATES or entry_state in FRONTIER_PAYOFF_STATES or entry_state in IMPERIAL_EXPANSION_STATES or entry_state in NORTH_RIDGE_OUTPOST_STATES or entry_state in NORTH_RIDGE_SPECIALIZATION_STATES:
		settlement_founded = true
		settlement_developed = true
		route_connected = true
		caravan_dispatched = true
		city_chartered = true
		nation_founded = true
		national_mandate_started = true
		empire_proclaimed = true
		imperial_crisis = "river_surge"
		if entry_state in ["village_aurelian_imperial_capital_greenvale_shielded", "map_aurelian_imperial_heartland_greenvale_response", "world_aurelian_river_surge_greenvale_response"]:
			imperial_crisis_response = "shield_greenvale"
		elif entry_state in ["village_aurelian_imperial_capital_bridge_response", "map_aurelian_imperial_heartland_bridge_response", "world_aurelian_river_surge_bridge_response", "map_first_rival_countermove_greenvale"]:
			imperial_crisis_response = "keep_east_bridge_open"
			crisis_response_cursor = 1
		elif (entry_state in RIVAL_STATES or entry_state in FRONTIER_PAYOFF_STATES) and imperial_crisis_response == "none":
			imperial_crisis_response = "shield_greenvale"
		if entry_state in ["village_first_rival_response_stand_firm", "map_first_rival_response_stand_firm", "world_first_rival_response_stand_firm"]:
			first_rival_countermove_response = "stand_firm"
		elif entry_state in ["village_first_rival_response_negotiate_passage", "map_first_rival_response_negotiate_passage", "world_first_rival_response_negotiate_passage"] or entry_state in FRONTIER_PAYOFF_STATES and "east_bridge" in entry_state:
			first_rival_countermove_response = "negotiate_passage"
			rival_response_cursor = 1
		elif entry_state in FRONTIER_PAYOFF_STATES:
			first_rival_countermove_response = "stand_firm"
		if entry_state in FRONTIER_PAYOFF_STATES and ("secured" in entry_state or "complete" in entry_state):
			first_frontier_payoff = "secure_gilded_crossing" if "gilded_crossing" in entry_state else "ratify_east_bridge_passage"
		elif entry_state in IMPERIAL_EXPANSION_STATES or entry_state in NORTH_RIDGE_OUTPOST_STATES or entry_state in NORTH_RIDGE_SPECIALIZATION_STATES:
			imperial_expansion_target = "north_ridge"
			if first_frontier_payoff == "none":
				first_frontier_payoff = "secure_gilded_crossing" if first_rival_countermove_response == "stand_firm" else "ratify_east_bridge_passage"
			if entry_state in ["map_first_imperial_expansion_two_lands_claimed", "village_first_imperial_expansion_greenvale_capital_two_lands", "world_first_imperial_expansion_two_land_footprint"] or entry_state in NORTH_RIDGE_OUTPOST_STATES or entry_state in NORTH_RIDGE_SPECIALIZATION_STATES:
				first_imperial_expansion = "north_ridge_claimed"
			if entry_state in NORTH_RIDGE_OUTPOST_ESTABLISHED_STATES:
				north_ridge_outpost = "established"
	decision_state = _decision_state_for_entry(entry_state)
	_configure_state_environment(entry_state)
	super()
	if cameras.is_empty():
		return
	dispatch_token = _build_dispatch_token()
	main_decision_overlay_root.add_child(dispatch_token)
	city_marker = _build_city_marker()
	main_basin.add_child(city_marker)
	homeland_marker = _build_homeland_marker()
	main_basin.add_child(homeland_marker)
	nation_emblem = _build_nation_emblem()
	main_basin.add_child(nation_emblem)
	capital_standards = _build_capital_standards()
	main_basin.add_child(capital_standards)
	living_capital_presentation = _build_living_capital_presentation()
	main_basin.add_child(living_capital_presentation)
	imperial_presentation = _build_imperial_presentation()
	main_basin.add_child(imperial_presentation)
	river_surge_presentation = _build_river_surge_presentation()
	main_basin.add_child(river_surge_presentation)
	imperial_expansion_presentation = _build_imperial_expansion_presentation()
	main_basin.add_child(imperial_expansion_presentation)
	north_ridge_outpost_presentation = _build_north_ridge_outpost_presentation()
	main_basin.add_child(north_ridge_outpost_presentation)
	north_ridge_specialization_presentation = _build_north_ridge_specialization_presentation()
	main_basin.add_child(north_ridge_specialization_presentation)
	mandate_marker = _build_national_mandate_marker()
	main_basin.add_child(mandate_marker)
	_build_runtime_hud()
	_apply_entry_state(entry_state)
	set_process_unhandled_input(true)
	if automated_input_mode:
		set_process(true)
	print("PLAYABLE_AURELIAN_ENTRY_READY=%s" % entry_state)
	if not evidence_dir.is_empty():
		call_deferred("_capture_playable_still")
	elif DisplayServer.get_name() == "headless" and not automated_input_mode:
		call_deferred("_complete_headless_smoke")

func _decision_state_for_entry(state_name: String) -> String:
	match state_name:
		"map_east_route_selected", "map_east_route_claimed", "map_east_route_connected", "map_east_route_in_use", "map_greenvale_city", "map_aurelian_homeland", "map_national_mandate_active", "map_aurelian_imperial_heartland", "map_river_surge_response_loci", "map_aurelian_imperial_heartland_greenvale_response", "map_aurelian_imperial_heartland_bridge_response", "map_first_rival_countermove_east_bridge", "map_first_rival_countermove_greenvale", "map_first_rival_response_stand_firm", "map_first_rival_response_negotiate_passage", "map_first_frontier_payoff_gilded_crossing_pending", "map_first_frontier_payoff_gilded_crossing_secured", "map_first_frontier_payoff_east_bridge_pending", "map_first_frontier_payoff_east_bridge_secured", "map_first_imperial_expansion_north_ridge_available", "map_first_imperial_expansion_north_ridge_inspected", "map_first_imperial_expansion_two_lands_claimed", "map_north_ridge_outpost_claimed_inspection", "map_north_ridge_outpost_established", "map_north_ridge_specialization_inspection", "map_north_ridge_trade_post_committed", "map_north_ridge_watch_post_committed":
			return "map_east_route"
		"world_trade_route_active", "world_first_trade_underway", "world_first_city_recognized", "world_first_nation_founded", "world_national_mandate_underway", "world_first_empire_proclaimed", "world_river_surge_crisis", "world_aurelian_river_surge_greenvale_response", "world_aurelian_river_surge_bridge_response", "world_first_rival_countermove", "world_first_rival_response_stand_firm", "world_first_rival_response_negotiate_passage", "world_first_frontier_payoff_gilded_crossing_revealed", "world_first_frontier_legacy_gilded_crossing_complete", "world_first_frontier_payoff_east_bridge_revealed", "world_first_frontier_legacy_east_bridge_complete", "world_first_imperial_expansion_north_ridge_direction", "world_first_imperial_expansion_two_land_footprint", "world_north_ridge_outpost_frontier_need", "world_north_ridge_outpost_held_two_land_frontier", "world_north_ridge_specialization_held_frontier", "world_north_ridge_trade_post_logistics_posture", "world_north_ridge_watch_post_vigilance_posture":
			return "world_trade_selected"
		"village_claimed", "village_founded", "village_developed", "village_trade_dispatched", "village_city_chartered", "village_greenvale_capital", "village_national_mandate_started", "village_aurelian_imperial_capital", "village_river_surge_response_pending", "village_aurelian_imperial_capital_greenvale_shielded", "village_aurelian_imperial_capital_bridge_response", "village_first_rival_response_pending", "village_first_rival_response_stand_firm", "village_first_rival_response_negotiate_passage", "village_first_frontier_payoff_gilded_crossing_pending", "village_first_frontier_payoff_gilded_crossing_secured", "village_first_frontier_payoff_east_bridge_pending", "village_first_frontier_payoff_east_bridge_secured", "village_first_imperial_expansion_greenvale_capital_two_lands", "village_north_ridge_outpost_establish_action", "village_north_ridge_outpost_greenvale_administers", "village_north_ridge_specialization_choice", "village_north_ridge_trade_post_greenvale_administers", "village_north_ridge_watch_post_greenvale_administers":
			return "village_route_context"
		_:
			return state_name

func _configure_state_environment(state_name: String) -> void:
	match state_name:
		"map_east_route_selected":
			OS.set_environment("AURELIAN_WORLD_STATE", "selected_trade")
			OS.set_environment("AURELIAN_MAP_STATE", "selected")
			OS.set_environment("AURELIAN_VILLAGE_STATE", "developed")
			OS.set_environment("AURELIAN_CAPTURE_PRESET", "")
			return
		"map_east_route_claimed", "map_east_route_connected", "map_east_route_in_use", "map_greenvale_city", "map_aurelian_homeland", "map_national_mandate_active", "map_aurelian_imperial_heartland", "map_first_frontier_payoff_gilded_crossing_pending", "map_first_frontier_payoff_gilded_crossing_secured", "map_first_frontier_payoff_east_bridge_pending", "map_first_frontier_payoff_east_bridge_secured", "map_first_imperial_expansion_north_ridge_available", "map_first_imperial_expansion_north_ridge_inspected", "map_first_imperial_expansion_two_lands_claimed", "map_north_ridge_outpost_claimed_inspection", "map_north_ridge_outpost_established", "map_north_ridge_specialization_inspection", "map_north_ridge_trade_post_committed", "map_north_ridge_watch_post_committed":
			OS.set_environment("AURELIAN_WORLD_STATE", "selected_trade")
			OS.set_environment("AURELIAN_MAP_STATE", "east_route_claimed")
			OS.set_environment("AURELIAN_VILLAGE_STATE", "developed" if settlement_developed else ("founded" if settlement_founded else "claimed"))
			OS.set_environment("AURELIAN_CAPTURE_PRESET", "")
			return
		"world_trade_route_active", "world_first_trade_underway", "world_first_city_recognized", "world_first_nation_founded", "world_national_mandate_underway", "world_first_empire_proclaimed", "world_first_frontier_payoff_gilded_crossing_revealed", "world_first_frontier_legacy_gilded_crossing_complete", "world_first_frontier_payoff_east_bridge_revealed", "world_first_frontier_legacy_east_bridge_complete", "world_first_imperial_expansion_north_ridge_direction", "world_first_imperial_expansion_two_land_footprint", "world_north_ridge_outpost_frontier_need", "world_north_ridge_outpost_held_two_land_frontier", "world_north_ridge_specialization_held_frontier", "world_north_ridge_trade_post_logistics_posture", "world_north_ridge_watch_post_vigilance_posture":
			OS.set_environment("AURELIAN_WORLD_STATE", "selected_trade")
			OS.set_environment("AURELIAN_MAP_STATE", "east_route_claimed")
			OS.set_environment("AURELIAN_VILLAGE_STATE", "developed")
			OS.set_environment("AURELIAN_CAPTURE_PRESET", "")
			return
		"village_claimed":
			OS.set_environment("AURELIAN_WORLD_STATE", "selected_trade")
			OS.set_environment("AURELIAN_MAP_STATE", "east_route_claimed")
			OS.set_environment("AURELIAN_VILLAGE_STATE", "claimed")
			OS.set_environment("AURELIAN_CAPTURE_PRESET", "")
			return
		"village_founded":
			OS.set_environment("AURELIAN_WORLD_STATE", "selected_trade")
			OS.set_environment("AURELIAN_MAP_STATE", "east_route_claimed")
			OS.set_environment("AURELIAN_VILLAGE_STATE", "founded")
			OS.set_environment("AURELIAN_CAPTURE_PRESET", "")
			return
		"village_developed", "village_trade_dispatched":
			OS.set_environment("AURELIAN_WORLD_STATE", "selected_trade")
			OS.set_environment("AURELIAN_MAP_STATE", "east_route_claimed")
			OS.set_environment("AURELIAN_VILLAGE_STATE", "developed")
			OS.set_environment("AURELIAN_CAPTURE_PRESET", "")
			return
		"village_city_chartered", "village_greenvale_capital", "village_national_mandate_started", "village_aurelian_imperial_capital", "village_first_frontier_payoff_gilded_crossing_pending", "village_first_frontier_payoff_gilded_crossing_secured", "village_first_frontier_payoff_east_bridge_pending", "village_first_frontier_payoff_east_bridge_secured", "village_first_imperial_expansion_greenvale_capital_two_lands":
			OS.set_environment("AURELIAN_WORLD_STATE", "selected_trade")
			OS.set_environment("AURELIAN_MAP_STATE", "east_route_claimed")
			OS.set_environment("AURELIAN_VILLAGE_STATE", "city_chartered")
			OS.set_environment("AURELIAN_CAPTURE_PRESET", "")
			return
	var states: Dictionary = decision_contract.get("states", {})
	if not states.has(state_name):
		return
	var state: Dictionary = states[state_name]
	OS.set_environment("AURELIAN_WORLD_STATE", String(state.get("world_state", "neutral")))
	OS.set_environment("AURELIAN_MAP_STATE", String(state.get("map_state", "no_selection")))
	OS.set_environment("AURELIAN_VILLAGE_STATE", String(state.get("village_state", "developed")))
	OS.set_environment("AURELIAN_CAPTURE_PRESET", "")

func _capture_playable_still() -> void:
	DirAccess.make_dir_recursive_absolute(evidence_dir)
	for _frame in range(8):
		await get_tree().process_frame
	await RenderingServer.frame_post_draw
	var image := get_viewport().get_texture().get_image()
	if image == null or image.is_empty():
		push_error("PLAYABLE_AURELIAN_EMPTY_CAPTURE")
		get_tree().quit(92)
		return
	if image.get_size() != STILL_SIZE:
		push_error("PLAYABLE_AURELIAN_WRONG_CAPTURE_SIZE=%s" % image.get_size())
		get_tree().quit(93)
		return
	var output_path := evidence_dir.path_join("playable-1440x900.png")
	if image.save_png(output_path) != OK:
		push_error("PLAYABLE_AURELIAN_CAPTURE_SAVE_FAILED=%s" % output_path)
		get_tree().quit(94)
		return
	print("PLAYABLE_AURELIAN_STILL=%s:%s" % [entry_state, output_path])
	get_tree().quit(0)

func _complete_headless_smoke() -> void:
	await get_tree().process_frame
	print("PLAYABLE_AURELIAN_HEADLESS_SMOKE=PASS")
	get_tree().quit(0)

func _load_playable_contract() -> Dictionary:
	var file := FileAccess.open(PLAYABLE_MANIFEST_PATH, FileAccess.READ)
	if file == null:
		push_error("PLAYABLE_AURELIAN_MANIFEST_MISSING")
		return {}
	var payload = JSON.parse_string(file.get_as_text())
	if not payload is Dictionary:
		push_error("PLAYABLE_AURELIAN_MANIFEST_INVALID")
		return {}
	var contract := payload as Dictionary
	if String(contract.get("contract", "")) != "GODOT_PLAYABLE_AURELIAN_ENTRY_V1":
		push_error("PLAYABLE_AURELIAN_CONTRACT_INVALID")
		return {}
	return contract

func _build_runtime_hud() -> void:
	hud_layer = CanvasLayer.new()
	hud_layer.name = "PlayableEntryHUD"
	add_child(hud_layer)
	var panel := ColorRect.new()
	panel.name = "DecisionLayerPanel"
	panel.position = Vector2(32, 28)
	panel.size = Vector2(570, 128)
	panel.color = Color("#24312ddd")
	hud_layer.add_child(panel)
	var content := VBoxContainer.new()
	content.position = Vector2(22, 14)
	content.size = Vector2(526, 100)
	content.add_theme_constant_override("separation", 4)
	panel.add_child(content)
	layer_label = Label.new()
	layer_label.add_theme_font_size_override("font_size", 24)
	content.add_child(layer_label)
	intent_label = Label.new()
	intent_label.add_theme_font_size_override("font_size", 17)
	content.add_child(intent_label)
	controls_label = Label.new()
	controls_label.add_theme_font_size_override("font_size", 15)
	controls_label.modulate = Color("#d8e4d6")
	content.add_child(controls_label)

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_accept"):
		_accept_entry()
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_up"):
		_cycle_national_direction(-1)
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_down"):
		_cycle_national_direction(1)
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_right"):
		_right_entry()
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_left") or event.is_action_pressed("ui_cancel"):
		_previous_entry()
		get_viewport().set_input_as_handled()

func _accept_entry() -> void:
	match entry_state:
		"world_neutral":
			_apply_entry_state("world_trade_selected")
		"map_east_route_selected", "map_east_route":
			settlement_founded = false
			_apply_entry_state("map_east_route_claimed")
		"village_claimed":
			settlement_founded = true
			_apply_entry_state("village_founded")
			print("AURELIAN_FIRST_SETTLEMENT_FOUNDING=GREENVALE")
		"village_founded":
			settlement_developed = true
			_apply_entry_state("village_developed")
			print("AURELIAN_FIRST_SETTLEMENT_DEVELOPMENT=GREENVALE")
		"map_east_route_claimed":
			if settlement_developed:
				route_connected = true
				_apply_entry_state("map_east_route_connected")
				print("AURELIAN_FIRST_TRADE_ROUTE_CONNECTION=EAST_ROUTE")
		"village_developed":
			if route_connected and not caravan_dispatched:
				caravan_dispatched = true
				_apply_entry_state("village_trade_dispatched")
				print("AURELIAN_FIRST_TRADE_CARAVAN_DISPATCH=EAST_ROUTE")
		"village_trade_dispatched":
			if caravan_dispatched and not city_chartered:
				city_chartered = true
				_apply_entry_state("village_city_chartered")
				print("AURELIAN_FIRST_CITY_CHARTER=GREENVALE")
		"world_first_city_recognized":
			if city_chartered and not nation_founded:
				nation_founded = true
				_apply_entry_state("world_first_nation_founded")
				print("AURELIAN_FIRST_NATION_FOUNDING=AURELIAN")
		"world_first_nation_founded":
			if nation_founded and committed_direction == "none":
				committed_direction = NATIONAL_DIRECTIONS[national_direction_cursor]
				_apply_entry_state("world_first_nation_founded")
				print("AURELIAN_FIRST_NATIONAL_DIRECTION_COMMITMENT=%s" % committed_direction.to_upper())
		"village_greenvale_capital":
			if committed_direction != "none" and not national_mandate_started:
				national_mandate_started = true
				_apply_entry_state("village_national_mandate_started")
				print("AURELIAN_FIRST_NATIONAL_MANDATE=%s" % committed_direction.to_upper())
		"village_national_mandate_started":
			if national_mandate_started and not empire_proclaimed:
				empire_proclaimed = true
				_apply_entry_state("village_aurelian_imperial_capital")
				print("AURELIAN_FIRST_EMPIRE_PROCLAMATION=AURELIAN")
		"world_first_empire_proclaimed":
			if empire_proclaimed and imperial_crisis == "none":
				imperial_crisis = "river_surge"
				_apply_entry_state("world_river_surge_crisis")
				print("AURELIAN_FIRST_IMPERIAL_CRISIS=RIVER_SURGE")
		"world_aurelian_river_surge_greenvale_response", "world_aurelian_river_surge_bridge_response":
			if imperial_crisis_response != "none" and first_rival_countermove_response == "none":
				_apply_entry_state("world_first_rival_countermove")
				print("AURELIAN_FIRST_RIVAL_COUNTERMOVE=OBSIDIAN_MARCH")
		"village_river_surge_response_pending":
			if imperial_crisis == "river_surge" and imperial_crisis_response == "none":
				imperial_crisis_response = CRISIS_RESPONSES[crisis_response_cursor]
				if imperial_crisis_response == "shield_greenvale":
					_apply_entry_state("village_aurelian_imperial_capital_greenvale_shielded")
					print("AURELIAN_FIRST_IMPERIAL_CRISIS_RESPONSE=SHIELD_GREENVALE")
				else:
					_apply_entry_state("village_aurelian_imperial_capital_bridge_response")
					print("AURELIAN_FIRST_IMPERIAL_CRISIS_RESPONSE=KEEP_EAST_BRIDGE_OPEN")
		"village_first_rival_response_pending":
			if imperial_crisis_response != "none" and first_rival_countermove_response == "none":
				first_rival_countermove_response = RIVAL_RESPONSES[rival_response_cursor]
				if first_rival_countermove_response == "stand_firm":
					_apply_entry_state("village_first_rival_response_stand_firm")
					print("AURELIAN_FIRST_RIVAL_COUNTERMOVE_RESPONSE=STAND_FIRM")
				else:
					_apply_entry_state("village_first_rival_response_negotiate_passage")
					print("AURELIAN_FIRST_RIVAL_COUNTERMOVE_RESPONSE=NEGOTIATE_PASSAGE")
		"world_first_rival_response_stand_firm":
			if first_frontier_payoff == "none":
				_apply_entry_state("world_first_frontier_payoff_gilded_crossing_revealed")
				print("AURELIAN_FIRST_FRONTIER_PAYOFF_REVEAL=SECURE_GILDED_CROSSING")
		"world_first_rival_response_negotiate_passage":
			if first_frontier_payoff == "none":
				_apply_entry_state("world_first_frontier_payoff_east_bridge_revealed")
				print("AURELIAN_FIRST_FRONTIER_PAYOFF_REVEAL=RATIFY_EAST_BRIDGE_PASSAGE")
		"village_first_frontier_payoff_gilded_crossing_pending":
			first_frontier_payoff = "secure_gilded_crossing"
			_apply_entry_state("village_first_frontier_payoff_gilded_crossing_secured")
			print("AURELIAN_FIRST_FRONTIER_PAYOFF=SECURE_GILDED_CROSSING")
		"village_first_frontier_payoff_east_bridge_pending":
			first_frontier_payoff = "ratify_east_bridge_passage"
			_apply_entry_state("village_first_frontier_payoff_east_bridge_secured")
			print("AURELIAN_FIRST_FRONTIER_PAYOFF=RATIFY_EAST_BRIDGE_PASSAGE")
		"world_first_frontier_legacy_gilded_crossing_complete", "world_first_frontier_legacy_east_bridge_complete":
			if first_frontier_payoff != "none" and imperial_expansion_target == "none":
				imperial_expansion_target = "north_ridge"
				_apply_entry_state("world_first_imperial_expansion_north_ridge_direction")
				print("AURELIAN_FIRST_IMPERIAL_EXPANSION_DIRECTION=NORTH_RIDGE")
		"map_first_imperial_expansion_north_ridge_available":
			if imperial_expansion_target == "north_ridge" and first_imperial_expansion == "none":
				_apply_entry_state("map_first_imperial_expansion_north_ridge_inspected")
				print("AURELIAN_FIRST_IMPERIAL_EXPANSION_INSPECT=NORTH_RIDGE")
		"map_first_imperial_expansion_north_ridge_inspected":
			if imperial_expansion_target == "north_ridge" and first_imperial_expansion == "none":
				first_imperial_expansion = "north_ridge_claimed"
				_apply_entry_state("map_first_imperial_expansion_two_lands_claimed")
				print("AURELIAN_FIRST_IMPERIAL_EXPANSION=NORTH_RIDGE")
		"world_first_imperial_expansion_two_land_footprint":
			if first_imperial_expansion == "north_ridge_claimed" and north_ridge_outpost == "none":
				_apply_entry_state("world_north_ridge_outpost_frontier_need")
				print("AURELIAN_NORTH_RIDGE_OUTPOST_NEED=HOLD_FRONTIER")
		"village_north_ridge_outpost_establish_action":
			if first_imperial_expansion == "north_ridge_claimed" and north_ridge_outpost == "none":
				north_ridge_outpost = "established"
				_apply_entry_state("map_north_ridge_outpost_established")
				print("AURELIAN_NORTH_RIDGE_OUTPOST=ESTABLISHED")
		"world_north_ridge_outpost_held_two_land_frontier":
			if north_ridge_outpost == "established" and north_ridge_specialization == "none":
				_apply_entry_state("world_north_ridge_specialization_held_frontier")
				print("AURELIAN_NORTH_RIDGE_SPECIALIZATION_READY=TRADE_POST_OR_WATCH_POST")
		"village_north_ridge_specialization_choice":
			if north_ridge_outpost == "established" and north_ridge_specialization == "none":
				north_ridge_specialization = NORTH_RIDGE_SPECIALIZATIONS[north_ridge_specialization_cursor]
				if north_ridge_specialization == "trade_post":
					_apply_entry_state("map_north_ridge_trade_post_committed")
					print("AURELIAN_NORTH_RIDGE_SPECIALIZATION=TRADE_POST")
				else:
					_apply_entry_state("map_north_ridge_watch_post_committed")
					print("AURELIAN_NORTH_RIDGE_SPECIALIZATION=WATCH_POST")

func _right_entry() -> void:
	match entry_state:
		"world_trade_selected":
			_apply_entry_state("map_east_route_claimed" if settlement_founded else "map_east_route_selected")
		"world_trade_route_active":
			_apply_entry_state("map_east_route_connected")
		"world_first_trade_underway":
			_apply_entry_state("map_east_route_in_use")
		"world_first_city_recognized":
			_apply_entry_state("map_greenvale_city")
		"world_first_nation_founded":
			if committed_direction != "none":
				_apply_entry_state("map_aurelian_homeland")
		"world_national_mandate_underway":
			_apply_entry_state("map_national_mandate_active")
		"world_first_empire_proclaimed":
			_apply_entry_state("map_aurelian_imperial_heartland")
		"world_river_surge_crisis":
			_apply_entry_state("map_river_surge_response_loci")
		"world_aurelian_river_surge_greenvale_response":
			_apply_entry_state("map_aurelian_imperial_heartland_greenvale_response")
		"world_aurelian_river_surge_bridge_response":
			_apply_entry_state("map_aurelian_imperial_heartland_bridge_response")
		"world_first_rival_countermove":
			_apply_entry_state("map_first_rival_countermove_east_bridge" if imperial_crisis_response == "shield_greenvale" else "map_first_rival_countermove_greenvale")
		"map_first_rival_countermove_east_bridge", "map_first_rival_countermove_greenvale":
			_apply_entry_state("village_first_rival_response_pending")
		"world_first_rival_response_stand_firm":
			_apply_entry_state("map_first_rival_response_stand_firm")
		"world_first_rival_response_negotiate_passage":
			_apply_entry_state("map_first_rival_response_negotiate_passage")
		"map_first_rival_response_stand_firm":
			_apply_entry_state("village_first_rival_response_stand_firm")
		"map_first_rival_response_negotiate_passage":
			_apply_entry_state("village_first_rival_response_negotiate_passage")
		"world_first_frontier_payoff_gilded_crossing_revealed":
			_apply_entry_state("map_first_frontier_payoff_gilded_crossing_pending")
		"world_first_frontier_payoff_east_bridge_revealed":
			_apply_entry_state("map_first_frontier_payoff_east_bridge_pending")
		"world_first_frontier_legacy_gilded_crossing_complete":
			_apply_entry_state("map_first_frontier_payoff_gilded_crossing_secured")
		"world_first_frontier_legacy_east_bridge_complete":
			_apply_entry_state("map_first_frontier_payoff_east_bridge_secured")
		"map_first_frontier_payoff_gilded_crossing_pending":
			_apply_entry_state("village_first_frontier_payoff_gilded_crossing_pending")
		"map_first_frontier_payoff_east_bridge_pending":
			_apply_entry_state("village_first_frontier_payoff_east_bridge_pending")
		"map_first_frontier_payoff_gilded_crossing_secured":
			_apply_entry_state("village_first_frontier_payoff_gilded_crossing_secured")
		"map_first_frontier_payoff_east_bridge_secured":
			_apply_entry_state("village_first_frontier_payoff_east_bridge_secured")
		"world_first_imperial_expansion_north_ridge_direction":
			_apply_entry_state("map_first_imperial_expansion_north_ridge_available")
		"map_first_imperial_expansion_two_lands_claimed":
			_apply_entry_state("village_first_imperial_expansion_greenvale_capital_two_lands")
		"world_north_ridge_outpost_frontier_need":
			_apply_entry_state("map_north_ridge_outpost_claimed_inspection")
		"map_north_ridge_outpost_claimed_inspection":
			_apply_entry_state("village_north_ridge_outpost_establish_action")
		"map_north_ridge_outpost_established":
			_apply_entry_state("village_north_ridge_outpost_greenvale_administers")
		"world_north_ridge_specialization_held_frontier":
			_apply_entry_state("map_north_ridge_specialization_inspection")
		"map_north_ridge_specialization_inspection":
			_apply_entry_state("village_north_ridge_specialization_choice")
		"world_north_ridge_trade_post_logistics_posture":
			_apply_entry_state("map_north_ridge_trade_post_committed")
		"world_north_ridge_watch_post_vigilance_posture":
			_apply_entry_state("map_north_ridge_watch_post_committed")
		"map_north_ridge_trade_post_committed":
			_apply_entry_state("village_north_ridge_trade_post_greenvale_administers")
		"map_north_ridge_watch_post_committed":
			_apply_entry_state("village_north_ridge_watch_post_greenvale_administers")
		"map_east_route_claimed":
			_apply_entry_state("village_developed" if settlement_developed else ("village_founded" if settlement_founded else "village_claimed"))
		"map_east_route_connected":
			_apply_entry_state("village_trade_dispatched" if caravan_dispatched else "village_developed")
		"map_east_route_in_use":
			_apply_entry_state("village_city_chartered" if city_chartered else "village_trade_dispatched")
		"map_greenvale_city":
			_apply_entry_state("village_city_chartered")
		"map_aurelian_homeland":
			_apply_entry_state("village_national_mandate_started" if national_mandate_started else "village_greenvale_capital")
		"map_national_mandate_active":
			_apply_entry_state("village_national_mandate_started")
		"map_aurelian_imperial_heartland":
			_apply_entry_state("village_aurelian_imperial_capital")
		"map_river_surge_response_loci":
			_apply_entry_state("village_river_surge_response_pending")
		"map_aurelian_imperial_heartland_greenvale_response":
			_apply_entry_state("village_aurelian_imperial_capital_greenvale_shielded")
		"map_aurelian_imperial_heartland_bridge_response":
			_apply_entry_state("village_aurelian_imperial_capital_bridge_response")
		"map_east_route":
			_apply_entry_state("village_route_context")

func _previous_entry() -> void:
	match entry_state:
		"village_claimed", "village_founded":
			_apply_entry_state("map_east_route_claimed")
		"village_developed":
			_apply_entry_state("map_east_route_connected" if route_connected else "map_east_route_claimed")
		"village_trade_dispatched":
			_apply_entry_state("map_east_route_in_use")
		"village_city_chartered":
			_apply_entry_state("map_greenvale_city")
		"village_greenvale_capital":
			_apply_entry_state("map_aurelian_homeland")
		"village_national_mandate_started":
			_apply_entry_state("map_national_mandate_active")
		"village_aurelian_imperial_capital":
			_apply_entry_state("map_aurelian_imperial_heartland")
		"village_river_surge_response_pending":
			_apply_entry_state("map_river_surge_response_loci")
		"village_aurelian_imperial_capital_greenvale_shielded":
			_apply_entry_state("map_aurelian_imperial_heartland_greenvale_response")
		"village_aurelian_imperial_capital_bridge_response":
			_apply_entry_state("map_aurelian_imperial_heartland_bridge_response")
		"village_first_rival_response_pending":
			_apply_entry_state("map_first_rival_countermove_east_bridge" if imperial_crisis_response == "shield_greenvale" else "map_first_rival_countermove_greenvale")
		"village_first_rival_response_stand_firm":
			_apply_entry_state("map_first_rival_response_stand_firm")
		"village_first_rival_response_negotiate_passage":
			_apply_entry_state("map_first_rival_response_negotiate_passage")
		"village_first_frontier_payoff_gilded_crossing_pending":
			_apply_entry_state("map_first_frontier_payoff_gilded_crossing_pending")
		"village_first_frontier_payoff_east_bridge_pending":
			_apply_entry_state("map_first_frontier_payoff_east_bridge_pending")
		"village_first_frontier_payoff_gilded_crossing_secured":
			_apply_entry_state("map_first_frontier_payoff_gilded_crossing_secured")
		"village_first_frontier_payoff_east_bridge_secured":
			_apply_entry_state("map_first_frontier_payoff_east_bridge_secured")
		"village_first_imperial_expansion_greenvale_capital_two_lands":
			_apply_entry_state("map_first_imperial_expansion_two_lands_claimed")
		"village_north_ridge_outpost_establish_action":
			_apply_entry_state("map_north_ridge_outpost_claimed_inspection")
		"village_north_ridge_outpost_greenvale_administers":
			_apply_entry_state("map_north_ridge_outpost_established")
		"village_north_ridge_specialization_choice":
			_apply_entry_state("map_north_ridge_specialization_inspection")
		"village_north_ridge_trade_post_greenvale_administers":
			_apply_entry_state("map_north_ridge_trade_post_committed")
		"village_north_ridge_watch_post_greenvale_administers":
			_apply_entry_state("map_north_ridge_watch_post_committed")
		"map_north_ridge_specialization_inspection":
			_apply_entry_state("world_north_ridge_specialization_held_frontier")
		"map_north_ridge_trade_post_committed":
			_apply_entry_state("world_north_ridge_trade_post_logistics_posture")
		"map_north_ridge_watch_post_committed":
			_apply_entry_state("world_north_ridge_watch_post_vigilance_posture")
		"map_north_ridge_outpost_claimed_inspection":
			_apply_entry_state("world_north_ridge_outpost_frontier_need")
		"map_north_ridge_outpost_established":
			_apply_entry_state("world_north_ridge_outpost_held_two_land_frontier")
		"map_first_imperial_expansion_north_ridge_available", "map_first_imperial_expansion_north_ridge_inspected":
			_apply_entry_state("world_first_imperial_expansion_north_ridge_direction")
		"map_first_imperial_expansion_two_lands_claimed":
			_apply_entry_state("world_first_imperial_expansion_two_land_footprint")
		"map_east_route_claimed", "map_east_route_selected", "map_east_route":
			_apply_entry_state("world_trade_selected")
		"map_east_route_connected":
			_apply_entry_state("world_trade_route_active")
		"map_east_route_in_use":
			_apply_entry_state("world_first_trade_underway")
		"map_greenvale_city":
			_apply_entry_state("world_first_city_recognized")
		"map_aurelian_homeland":
			_apply_entry_state("world_first_nation_founded")
		"map_national_mandate_active":
			_apply_entry_state("world_national_mandate_underway")
		"map_aurelian_imperial_heartland":
			_apply_entry_state("world_first_empire_proclaimed")
		"map_river_surge_response_loci":
			_apply_entry_state("world_river_surge_crisis")
		"map_aurelian_imperial_heartland_greenvale_response":
			_apply_entry_state("world_aurelian_river_surge_greenvale_response")
		"map_aurelian_imperial_heartland_bridge_response":
			_apply_entry_state("world_aurelian_river_surge_bridge_response")
		"map_first_rival_countermove_east_bridge", "map_first_rival_countermove_greenvale":
			_apply_entry_state("world_first_rival_countermove")
		"map_first_rival_response_stand_firm":
			_apply_entry_state("world_first_rival_response_stand_firm")
		"map_first_rival_response_negotiate_passage":
			_apply_entry_state("world_first_rival_response_negotiate_passage")
		"map_first_frontier_payoff_gilded_crossing_pending":
			_apply_entry_state("world_first_frontier_payoff_gilded_crossing_revealed")
		"map_first_frontier_payoff_east_bridge_pending":
			_apply_entry_state("world_first_frontier_payoff_east_bridge_revealed")
		"map_first_frontier_payoff_gilded_crossing_secured":
			_apply_entry_state("world_first_frontier_legacy_gilded_crossing_complete")
		"map_first_frontier_payoff_east_bridge_secured":
			_apply_entry_state("world_first_frontier_legacy_east_bridge_complete")
		"village_route_context":
			_apply_entry_state("map_east_route")
		"world_trade_selected":
			_apply_entry_state("world_neutral")

func _cycle_national_direction(step: int) -> void:
	if entry_state == "village_north_ridge_specialization_choice" and north_ridge_specialization == "none":
		north_ridge_specialization_cursor = posmod(north_ridge_specialization_cursor + step, NORTH_RIDGE_SPECIALIZATIONS.size())
		_refresh_north_ridge_specialization_presentation(entry_state)
		_update_runtime_hud()
		print("AURELIAN_NORTH_RIDGE_SPECIALIZATION_INSPECT=%s" % NORTH_RIDGE_SPECIALIZATIONS[north_ridge_specialization_cursor].to_upper())
		return
	if entry_state == "village_first_rival_response_pending" and first_rival_countermove_response == "none":
		rival_response_cursor = posmod(rival_response_cursor + step, RIVAL_RESPONSES.size())
		_refresh_river_surge_presentation(entry_state)
		_update_runtime_hud()
		print("AURELIAN_FIRST_RIVAL_RESPONSE_INSPECT=%s" % RIVAL_RESPONSES[rival_response_cursor].to_upper())
		return
	if entry_state == "village_river_surge_response_pending" and imperial_crisis_response == "none":
		crisis_response_cursor = posmod(crisis_response_cursor + step, CRISIS_RESPONSES.size())
		_refresh_river_surge_presentation(entry_state)
		_update_runtime_hud()
		print("AURELIAN_IMPERIAL_CRISIS_RESPONSE_INSPECT=%s" % CRISIS_RESPONSES[crisis_response_cursor].to_upper())
		return
	if entry_state != "world_first_nation_founded" or committed_direction != "none":
		return
	national_direction_cursor = posmod(national_direction_cursor + step, NATIONAL_DIRECTIONS.size())
	_refresh_national_direction_identity()
	_update_runtime_hud()
	print("AURELIAN_NATIONAL_DIRECTION_INSPECT=%s" % NATIONAL_DIRECTIONS[national_direction_cursor].to_upper())

func _direction_color(direction: String) -> String:
	match direction:
		"expand":
			return "#68a978ff"
		"frontier":
			return "#c56b4fff"
		_:
			return "#d7ad42ff"

func _refresh_national_direction_identity() -> void:
	var direction: String = committed_direction if committed_direction != "none" else String(NATIONAL_DIRECTIONS[national_direction_cursor])
	var color := _direction_color(direction)
	if nation_emblem != null:
		var world_hex := nation_emblem.get_node_or_null("NationHex") as MeshInstance3D
		if world_hex != null:
			world_hex.material_override = _material(color, 0.34)
		var nation_label := nation_emblem.get_node_or_null("NationLabel") as Label3D
		if nation_label != null:
			nation_label.text = "AURELIAN / %s" % direction.to_upper() if committed_direction != "none" else "AURELIAN / %s?" % direction.to_upper()
	if homeland_marker != null:
		var homeland_hex := homeland_marker.get_node_or_null("HomelandHex") as MeshInstance3D
		if homeland_hex != null:
			homeland_hex.material_override = _material(color, 0.16)
	if capital_standards != null:
		for standard in capital_standards.get_children():
			if standard.get_child_count() > 1:
				var flag := standard.get_child(1) as MeshInstance3D
				if flag != null:
					flag.material_override = _material(color, 0.24)

func _hide_preclaim_greenvale() -> bool:
	var all_nodes: Array = state_contract.get("all_nodes", [])
	if all_nodes.is_empty():
		push_error("AURELIAN_FIRST_LAND_CLAIM_PRECLAIM_NODES_MISSING")
		return false
	for node_name_variant in all_nodes:
		var node_name := String(node_name_variant)
		var node := _named_node(main_basin, node_name)
		if node == null:
			return false
		node.visible = false
	return true


func _build_national_mandate_marker() -> Node3D:
	var root := Node3D.new()
	root.name = "AurelianNationalMandateLocus"
	var ring := MeshInstance3D.new()
	ring.name = "MandateRing"
	var ring_mesh := TorusMesh.new()
	ring_mesh.inner_radius = 0.34
	ring_mesh.outer_radius = 0.52
	ring_mesh.rings = 24
	ring_mesh.ring_segments = 12
	ring.mesh = ring_mesh
	ring.material_override = _material(_direction_color(committed_direction), 0.42)
	root.add_child(ring)
	var beacon := MeshInstance3D.new()
	beacon.name = "MandateBeacon"
	var beacon_mesh := CylinderMesh.new()
	beacon_mesh.top_radius = 0.07
	beacon_mesh.bottom_radius = 0.16
	beacon_mesh.height = 0.82
	beacon_mesh.radial_segments = 12
	beacon.mesh = beacon_mesh
	beacon.position.y = 0.43
	beacon.material_override = _material(_direction_color(committed_direction), 0.34)
	root.add_child(beacon)
	var label := Label3D.new()
	label.name = "MandateLabel"
	label.font_size = 34
	label.outline_size = 7
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	label.position = Vector3(0.0, 1.12, 0.0)
	root.add_child(label)
	root.visible = false
	return root

func _refresh_national_mandate_marker() -> void:
	if mandate_marker == null or committed_direction == "none":
		return
	var topology := Vector2(435.0, 313.0)
	var locus := "EAST ROUTE"
	match committed_direction:
		"expand":
			topology = Vector2(700.0, 205.0)
			locus = "NORTH RIDGE"
		"frontier":
			topology = Vector2(515.0, 340.0)
			locus = "GILDED CROSSING"
	mandate_marker.position = topology_to_godot(topology, 0.56)
	var label := mandate_marker.get_node_or_null("MandateLabel") as Label3D
	if label != null:
		label.text = "%s MANDATE ACTIVE" % locus
		label.modulate = Color(_direction_color(committed_direction))
	for node_name in ["MandateRing", "MandateBeacon"]:
		var node := mandate_marker.get_node_or_null(node_name) as MeshInstance3D
		if node != null:
			node.material_override = _material(_direction_color(committed_direction), 0.38)

func _build_dispatch_token() -> Node3D:
	var root := Node3D.new()
	root.name = "FirstTradeCaravanDispatch"
	var body := MeshInstance3D.new()
	body.name = "CaravanBody"
	var body_mesh := BoxMesh.new()
	body_mesh.size = Vector3(0.50, 0.24, 0.62)
	body.mesh = body_mesh
	body.position.y = 0.06
	body.material_override = _material("#f2b84bff", 0.24)
	root.add_child(body)
	var cargo := MeshInstance3D.new()
	cargo.name = "CaravanCargo"
	var cargo_mesh := BoxMesh.new()
	cargo_mesh.size = Vector3(0.34, 0.30, 0.34)
	cargo.mesh = cargo_mesh
	cargo.position = Vector3(0.0, 0.31, -0.08)
	cargo.material_override = _material("#b94f3fff", 0.22)
	root.add_child(cargo)
	for side in [-1.0, 1.0]:
		var wheel := MeshInstance3D.new()
		wheel.name = "CaravanWheel"
		var wheel_mesh := CylinderMesh.new()
		wheel_mesh.top_radius = 0.14
		wheel_mesh.bottom_radius = 0.14
		wheel_mesh.height = 0.065
		wheel_mesh.radial_segments = 16
		wheel.mesh = wheel_mesh
		wheel.rotation.z = PI / 2.0
		wheel.position = Vector3(side * 0.29, -0.09, 0.02)
		wheel.material_override = _material("#4a3528ee")
		root.add_child(wheel)
	root.position = topology_to_godot(Vector2(435.0, 313.0), 0.44)
	root.visible = false
	return root

func _build_city_marker() -> Node3D:
	var root := Node3D.new()
	root.name = "GreenvaleFirstCityMarker"
	var base := MeshInstance3D.new()
	base.name = "CityHex"
	var mesh := CylinderMesh.new()
	mesh.top_radius = 0.48
	mesh.bottom_radius = 0.48
	mesh.height = 0.18
	mesh.radial_segments = 6
	base.mesh = mesh
	base.material_override = _material("#d9ad4aff", 0.28)
	root.add_child(base)
	var spire := MeshInstance3D.new()
	spire.name = "CivicSpire"
	var spire_mesh := CylinderMesh.new()
	spire_mesh.top_radius = 0.08
	spire_mesh.bottom_radius = 0.22
	spire_mesh.height = 0.72
	spire_mesh.radial_segments = 6
	spire.mesh = spire_mesh
	spire.position.y = 0.45
	spire.material_override = _material("#f5df8dff", 0.24)
	root.add_child(spire)
	root.position = topology_to_godot(Vector2(354.0, 285.0), 0.58)
	root.visible = false
	return root

func _build_homeland_marker() -> Node3D:
	var root := Node3D.new()
	root.name = "AurelianHomelandCue"
	var field := MeshInstance3D.new()
	field.name = "HomelandHex"
	var field_mesh := CylinderMesh.new()
	field_mesh.top_radius = 1.34
	field_mesh.bottom_radius = 1.34
	field_mesh.height = 0.045
	field_mesh.radial_segments = 6
	field.mesh = field_mesh
	field.material_override = _material("#4f9f6f66", 0.12)
	root.add_child(field)
	var capital := MeshInstance3D.new()
	capital.name = "CapitalMarker"
	var capital_mesh := CylinderMesh.new()
	capital_mesh.top_radius = 0.24
	capital_mesh.bottom_radius = 0.36
	capital_mesh.height = 0.62
	capital_mesh.radial_segments = 6
	capital.mesh = capital_mesh
	capital.position.y = 0.34
	capital.material_override = _material("#f2cf63ff", 0.28)
	root.add_child(capital)
	root.position = topology_to_godot(Vector2(354.0, 285.0), 0.30)
	root.visible = false
	return root

func _build_nation_emblem() -> Node3D:
	var root := Node3D.new()
	root.name = "AurelianNationEmblem"
	var pole := MeshInstance3D.new()
	pole.name = "NationStandardPole"
	var pole_mesh := CylinderMesh.new()
	pole_mesh.top_radius = 0.045
	pole_mesh.bottom_radius = 0.055
	pole_mesh.height = 1.38
	pole_mesh.radial_segments = 12
	pole.mesh = pole_mesh
	pole.position.y = 0.69
	pole.material_override = _material("#d5c9a5ff")
	root.add_child(pole)
	var emblem := MeshInstance3D.new()
	emblem.name = "NationHex"
	var emblem_mesh := CylinderMesh.new()
	emblem_mesh.top_radius = 0.42
	emblem_mesh.bottom_radius = 0.42
	emblem_mesh.height = 0.13
	emblem_mesh.radial_segments = 6
	emblem.mesh = emblem_mesh
	emblem.rotation.x = PI / 2.0
	emblem.position = Vector3(0.0, 1.24, 0.0)
	emblem.material_override = _material("#e3b94fff", 0.34)
	root.add_child(emblem)
	var label := Label3D.new()
	label.name = "NationLabel"
	label.text = "AURELIAN"
	label.font_size = 42
	label.outline_size = 8
	label.modulate = Color("#f5e6aaff")
	label.position = Vector3(0.0, 1.73, 0.0)
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	root.add_child(label)
	root.position = topology_to_godot(Vector2(500.0, 455.0), 0.32)
	root.visible = false
	return root

func _build_capital_standards() -> Node3D:
	var root := Node3D.new()
	root.name = "GreenvaleCapitalStandards"
	var offsets := [Vector3(-0.72, 0.0, -0.36), Vector3(0.72, 0.0, -0.36), Vector3(0.0, 0.0, 0.72)]
	for index in range(3):
		var standard := Node3D.new()
		standard.name = "CapitalStandard%02d" % (index + 1)
		standard.position = offsets[index]
		var pole := MeshInstance3D.new()
		var pole_mesh := CylinderMesh.new()
		pole_mesh.top_radius = 0.028
		pole_mesh.bottom_radius = 0.038
		pole_mesh.height = 0.90
		pole_mesh.radial_segments = 10
		pole.mesh = pole_mesh
		pole.position.y = 0.45
		pole.material_override = _material("#d8cca9ff")
		standard.add_child(pole)
		var flag := MeshInstance3D.new()
		var flag_mesh := BoxMesh.new()
		flag_mesh.size = Vector3(0.36, 0.24, 0.045)
		flag.mesh = flag_mesh
		flag.position = Vector3(0.18, 0.76, 0.0)
		flag.material_override = _material("#d7ad42ff", 0.24)
		standard.add_child(flag)
		root.add_child(standard)
	root.position = topology_to_godot(Vector2(354.0, 285.0), 0.18)
	root.visible = false
	return root

func _build_living_capital_presentation() -> Node3D:
	var root := Node3D.new()
	root.name = "GreenvaleLivingCapitalPresentation"
	var civic_ring := Node3D.new()
	civic_ring.name = "CivicActivityRing"
	root.add_child(civic_ring)
	var plaza := MeshInstance3D.new()
	plaza.name = "CapitalPlaza"
	var plaza_mesh := CylinderMesh.new()
	plaza_mesh.top_radius = 1.58
	plaza_mesh.bottom_radius = 1.58
	plaza_mesh.height = 0.055
	plaza_mesh.radial_segments = 32
	plaza.mesh = plaza_mesh
	plaza.position.y = 0.03
	plaza.material_override = _material("#b69a5638", 0.18)
	civic_ring.add_child(plaza)
	var quarter_offsets := [
		Vector3(-1.35, 0.0, -0.72),
		Vector3(-0.48, 0.0, -1.42),
		Vector3(0.52, 0.0, -1.38),
		Vector3(1.38, 0.0, -0.62),
		Vector3(1.32, 0.0, 0.72),
		Vector3(-1.28, 0.0, 0.78),
	]
	for index in range(quarter_offsets.size()):
		var quarter := MeshInstance3D.new()
		quarter.name = "CivicQuarter%02d" % (index + 1)
		var quarter_mesh := BoxMesh.new()
		quarter_mesh.size = Vector3(0.52, 0.40 + float(index % 2) * 0.12, 0.44)
		quarter.mesh = quarter_mesh
		quarter.position = quarter_offsets[index] + Vector3(0.0, quarter_mesh.size.y * 0.5, 0.0)
		quarter.rotation.y = float(index) * 0.52
		quarter.material_override = _material("#a9654fff" if index % 2 == 0 else "#55758cff", 0.24)
		civic_ring.add_child(quarter)
		var roof := MeshInstance3D.new()
		roof.name = "CapitalRoof%02d" % (index + 1)
		var roof_mesh := CylinderMesh.new()
		roof_mesh.top_radius = 0.06
		roof_mesh.bottom_radius = 0.40
		roof_mesh.height = 0.24
		roof_mesh.radial_segments = 4
		roof.mesh = roof_mesh
		roof.position = quarter.position + Vector3(0.0, quarter_mesh.size.y * 0.5 + 0.12, 0.0)
		roof.rotation.y = quarter.rotation.y + PI * 0.25
		roof.material_override = _material("#d2aa52ff" if index % 2 == 0 else "#8f493fff", 0.20)
		civic_ring.add_child(roof)
	var lantern_offsets := [
		Vector3(-0.92, 0.0, -0.92),
		Vector3(0.92, 0.0, -0.92),
		Vector3(0.92, 0.0, 0.92),
		Vector3(-0.92, 0.0, 0.92),
	]
	for index in range(lantern_offsets.size()):
		var lantern := MeshInstance3D.new()
		lantern.name = "CapitalLantern%02d" % (index + 1)
		var lantern_mesh := CylinderMesh.new()
		lantern_mesh.top_radius = 0.06
		lantern_mesh.bottom_radius = 0.09
		lantern_mesh.height = 0.72
		lantern_mesh.radial_segments = 10
		lantern.mesh = lantern_mesh
		lantern.position = lantern_offsets[index] + Vector3(0.0, 0.36, 0.0)
		lantern.material_override = _material("#f3c85bff", 0.30)
		root.add_child(lantern)
	root.position = topology_to_godot(Vector2(354.0, 285.0), 0.15)
	root.visible = false
	return root

func _build_imperial_presentation() -> Node3D:
	var root := Node3D.new()
	root.name = "AurelianImperialPresentation"

	var capital := Node3D.new()
	capital.name = "VillageImperialCapital"
	capital.position = topology_to_godot(Vector2(354.0, 285.0), 0.22)
	var plinth := MeshInstance3D.new()
	plinth.name = "ImperialPlinth"
	var plinth_mesh := CylinderMesh.new()
	plinth_mesh.top_radius = 0.82
	plinth_mesh.bottom_radius = 1.02
	plinth_mesh.height = 0.34
	plinth_mesh.radial_segments = 12
	plinth.mesh = plinth_mesh
	plinth.position.y = 0.17
	plinth.material_override = _material("#5b2f68ff", 0.28)
	capital.add_child(plinth)
	var spire := MeshInstance3D.new()
	spire.name = "ImperialSpire"
	var spire_mesh := CylinderMesh.new()
	spire_mesh.top_radius = 0.12
	spire_mesh.bottom_radius = 0.30
	spire_mesh.height = 2.55
	spire_mesh.radial_segments = 12
	spire.mesh = spire_mesh
	spire.position.y = 1.48
	spire.material_override = _material("#e1b94fff", 0.46)
	capital.add_child(spire)
	for index in range(3):
		var crown_point := MeshInstance3D.new()
		crown_point.name = "ImperialCrownPoint%02d" % (index + 1)
		var crown_mesh := CylinderMesh.new()
		crown_mesh.top_radius = 0.02
		crown_mesh.bottom_radius = 0.18
		crown_mesh.height = 0.68
		crown_mesh.radial_segments = 6
		crown_point.mesh = crown_mesh
		crown_point.position = Vector3((float(index) - 1.0) * 0.34, 2.86, 0.0)
		crown_point.material_override = _material("#f1d36aff", 0.50)
		capital.add_child(crown_point)
	var capital_label := Label3D.new()
	capital_label.name = "ImperialCapitalLabel"
	capital_label.text = "IMPERIAL CAPITAL"
	capital_label.font_size = 46
	capital_label.outline_size = 10
	capital_label.modulate = Color("#ffe28aff")
	capital_label.position = Vector3(0.0, 3.65, 0.0)
	capital_label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	capital.add_child(capital_label)
	var capital_glyph := MeshInstance3D.new()
	capital_glyph.name = "ImperialCapitalDirectionGlyph"
	capital_glyph.position = Vector3(0.0, 3.02, 0.18)
	capital.add_child(capital_glyph)
	root.add_child(capital)

	var heartland := Node3D.new()
	heartland.name = "MapImperialHeartland"
	heartland.position = topology_to_godot(Vector2(354.0, 285.0), 0.52)
	for radius in [1.05, 1.42]:
		var ring := MeshInstance3D.new()
		ring.name = "ImperialHeartlandRing"
		var ring_mesh := TorusMesh.new()
		ring_mesh.inner_radius = radius - 0.07
		ring_mesh.outer_radius = radius + 0.07
		ring_mesh.rings = 32
		ring_mesh.ring_segments = 12
		ring.mesh = ring_mesh
		ring.material_override = _material("#f0c552ff", 0.48)
		heartland.add_child(ring)
	var heartland_label := Label3D.new()
	heartland_label.name = "ImperialHeartlandLabel"
	heartland_label.text = "IMPERIAL HEARTLAND"
	heartland_label.font_size = 38
	heartland_label.outline_size = 9
	heartland_label.modulate = Color("#ffe28aff")
	heartland_label.position = Vector3(0.0, 1.35, 0.0)
	heartland_label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	heartland.add_child(heartland_label)
	var heartland_glyph := MeshInstance3D.new()
	heartland_glyph.name = "ImperialHeartlandDirectionGlyph"
	heartland_glyph.position = Vector3(0.0, 0.24, 0.0)
	heartland.add_child(heartland_glyph)
	root.add_child(heartland)

	var world_emblem := Node3D.new()
	world_emblem.name = "WorldFirstEmpire"
	world_emblem.position = topology_to_godot(Vector2(500.0, 455.0), 0.38)
	var world_hex := MeshInstance3D.new()
	world_hex.name = "ImperialWorldHex"
	var world_hex_mesh := CylinderMesh.new()
	world_hex_mesh.top_radius = 0.78
	world_hex_mesh.bottom_radius = 0.78
	world_hex_mesh.height = 0.18
	world_hex_mesh.radial_segments = 6
	world_hex.mesh = world_hex_mesh
	world_hex.rotation.x = PI / 2.0
	world_hex.position.y = 1.25
	world_hex.material_override = _material("#6f347dff", 0.44)
	world_emblem.add_child(world_hex)
	var world_label := Label3D.new()
	world_label.name = "FirstEmpireLabel"
	world_label.text = "AURELIAN EMPIRE"
	world_label.font_size = 52
	world_label.outline_size = 11
	world_label.modulate = Color("#ffe28aff")
	world_label.position = Vector3(0.0, 2.18, 0.0)
	world_label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	world_emblem.add_child(world_label)
	var world_glyph := MeshInstance3D.new()
	world_glyph.name = "ImperialWorldDirectionGlyph"
	world_glyph.position = Vector3(0.0, 1.25, 0.22)
	world_emblem.add_child(world_glyph)
	root.add_child(world_emblem)

	root.visible = false
	return root

func _configure_directional_empire_glyph(glyph: MeshInstance3D, direction: String, scale: float) -> void:
	glyph.rotation = Vector3.ZERO
	match direction:
		"expand":
			var expansion_arrow := CylinderMesh.new()
			expansion_arrow.top_radius = scale
			expansion_arrow.bottom_radius = scale
			expansion_arrow.height = scale * 0.24
			expansion_arrow.radial_segments = 3
			glyph.mesh = expansion_arrow
			glyph.rotation.x = PI / 2.0
		"frontier":
			var frontier_shield := BoxMesh.new()
			frontier_shield.size = Vector3(scale * 1.25, scale * 1.25, scale * 0.22)
			glyph.mesh = frontier_shield
			glyph.rotation.z = PI / 4.0
		_:
			var trade_ring := TorusMesh.new()
			trade_ring.inner_radius = scale * 0.52
			trade_ring.outer_radius = scale
			trade_ring.rings = 24
			trade_ring.ring_segments = 10
			glyph.mesh = trade_ring
	glyph.material_override = _material(_direction_color(direction), 0.58)

func _refresh_imperial_presentation(state_name: String) -> void:
	if imperial_presentation == null:
		return
	imperial_presentation.visible = state_name in ["village_aurelian_imperial_capital", "map_aurelian_imperial_heartland", "world_first_empire_proclaimed"] or state_name in CRISIS_STATES or state_name in RIVAL_STATES
	var direction := committed_direction if committed_direction in NATIONAL_DIRECTIONS else "trade"
	var direction_title := direction.to_upper()
	var village_marker := imperial_presentation.get_node_or_null("VillageImperialCapital") as Node3D
	var map_marker := imperial_presentation.get_node_or_null("MapImperialHeartland") as Node3D
	var world_marker := imperial_presentation.get_node_or_null("WorldFirstEmpire") as Node3D
	if village_marker != null:
		village_marker.visible = state_name in ["village_aurelian_imperial_capital", "village_river_surge_response_pending", "village_aurelian_imperial_capital_greenvale_shielded", "village_aurelian_imperial_capital_bridge_response", "village_first_rival_response_pending", "village_first_rival_response_stand_firm", "village_first_rival_response_negotiate_passage"]
		var village_label := village_marker.get_node_or_null("ImperialCapitalLabel") as Label3D
		var village_glyph := village_marker.get_node_or_null("ImperialCapitalDirectionGlyph") as MeshInstance3D
		if village_label != null:
			village_label.text = "%s IMPERIAL CAPITAL" % direction_title
			village_label.modulate = Color(_direction_color(direction))
		if village_glyph != null:
			_configure_directional_empire_glyph(village_glyph, direction, 0.34)
	if map_marker != null:
		map_marker.visible = state_name in ["map_aurelian_imperial_heartland", "map_river_surge_response_loci", "map_aurelian_imperial_heartland_greenvale_response", "map_aurelian_imperial_heartland_bridge_response", "map_first_rival_countermove_east_bridge", "map_first_rival_countermove_greenvale", "map_first_rival_response_stand_firm", "map_first_rival_response_negotiate_passage"]
		var map_label := map_marker.get_node_or_null("ImperialHeartlandLabel") as Label3D
		var map_glyph := map_marker.get_node_or_null("ImperialHeartlandDirectionGlyph") as MeshInstance3D
		if map_label != null:
			map_label.text = "%s IMPERIAL HEARTLAND" % direction_title
			map_label.modulate = Color(_direction_color(direction))
		if map_glyph != null:
			_configure_directional_empire_glyph(map_glyph, direction, 0.42)
	if world_marker != null:
		world_marker.visible = state_name in ["world_first_empire_proclaimed", "world_river_surge_crisis", "world_aurelian_river_surge_greenvale_response", "world_aurelian_river_surge_bridge_response", "world_first_rival_countermove", "world_first_rival_response_stand_firm", "world_first_rival_response_negotiate_passage"]
		var world_label := world_marker.get_node_or_null("FirstEmpireLabel") as Label3D
		var world_glyph := world_marker.get_node_or_null("ImperialWorldDirectionGlyph") as MeshInstance3D
		if world_label != null:
			world_label.text = "AURELIAN %s EMPIRE" % direction_title
			world_label.modulate = Color(_direction_color(direction))
		if world_glyph != null:
			_configure_directional_empire_glyph(world_glyph, direction, 0.46)

func _build_river_surge_presentation() -> Node3D:
	var root := Node3D.new()
	root.name = "AurelianRiverSurgePresentation"

	var world_cue := Node3D.new()
	world_cue.name = "RiverSurgeWorldCue"
	world_cue.position = topology_to_godot(Vector2(435.0, 313.0), 0.58)
	for index in range(3):
		var wave := MeshInstance3D.new()
		wave.name = "RiverSurgeWave%02d" % (index + 1)
		var wave_mesh := TorusMesh.new()
		wave_mesh.inner_radius = 0.70 + float(index) * 0.28
		wave_mesh.outer_radius = 0.82 + float(index) * 0.28
		wave_mesh.rings = 28
		wave_mesh.ring_segments = 12
		wave.mesh = wave_mesh
		wave.material_override = _material("#48a8d8ff", 0.58 - float(index) * 0.08)
		world_cue.add_child(wave)
	var world_label := Label3D.new()
	world_label.name = "RiverSurgeWorldLabel"
	world_label.text = "RIVER SURGE"
	world_label.font_size = 24
	world_label.outline_size = 8
	world_label.modulate = Color("#9ee5ffff")
	world_label.position = Vector3(1.35, 0.95, -0.35)
	world_label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	world_cue.add_child(world_label)
	root.add_child(world_cue)

	var greenvale_locus := _build_crisis_locus("GreenvaleResponseLocus", "SHIELD GREENVALE", Vector2(354.0, 285.0), "#5ecb8aff")
	root.add_child(greenvale_locus)
	var bridge_locus := _build_crisis_locus("EastBridgeResponseLocus", "KEEP EAST BRIDGE OPEN", Vector2(515.0, 340.0), "#e6b85cff")
	root.add_child(bridge_locus)

	var village_cue := Node3D.new()
	village_cue.name = "VillageRiverSurgeResponseCue"
	village_cue.position = topology_to_godot(Vector2(354.0, 285.0), 0.62)
	var village_marker := MeshInstance3D.new()
	village_marker.name = "VillageResponseMarker"
	var village_mesh := CylinderMesh.new()
	village_mesh.top_radius = 0.12
	village_mesh.bottom_radius = 0.24
	village_mesh.height = 0.75
	village_mesh.radial_segments = 6
	village_marker.mesh = village_mesh
	village_marker.position.y = 0.375
	village_cue.add_child(village_marker)
	var village_label := Label3D.new()
	village_label.name = "VillageResponseLabel"
	village_label.font_size = 26
	village_label.outline_size = 7
	village_label.position = Vector3(0.85, 1.05, -0.20)
	village_label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	village_cue.add_child(village_label)
	root.add_child(village_cue)

	root.visible = false
	return root

func _build_crisis_locus(node_name: String, label_text: String, topology: Vector2, color: String) -> Node3D:
	var locus := Node3D.new()
	locus.name = node_name
	locus.position = topology_to_godot(topology, 0.48)
	var ring := MeshInstance3D.new()
	ring.name = "ResponseRing"
	var ring_mesh := TorusMesh.new()
	ring_mesh.inner_radius = 0.58
	ring_mesh.outer_radius = 0.75
	ring_mesh.rings = 28
	ring_mesh.ring_segments = 12
	ring.mesh = ring_mesh
	ring.material_override = _material(color, 0.48)
	locus.add_child(ring)
	var beacon := MeshInstance3D.new()
	beacon.name = "ResponseBeacon"
	var beacon_mesh := CylinderMesh.new()
	beacon_mesh.top_radius = 0.06
	beacon_mesh.bottom_radius = 0.18
	beacon_mesh.height = 0.9
	beacon_mesh.radial_segments = 10
	beacon.mesh = beacon_mesh
	beacon.position.y = 0.45
	beacon.material_override = _material(color, 0.34)
	locus.add_child(beacon)
	var label := Label3D.new()
	label.name = "ResponseLabel"
	label.text = label_text
	label.font_size = 32
	label.outline_size = 8
	label.modulate = Color(color)
	label.position = Vector3(-0.95 if node_name == "GreenvaleResponseLocus" else 0.95, 0.95, -0.18)
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	locus.add_child(label)
	return locus

func _refresh_river_surge_presentation(state_name: String) -> void:
	if river_surge_presentation == null:
		return
	river_surge_presentation.visible = state_name in CRISIS_STATES or state_name in RIVAL_STATES or state_name in FRONTIER_PAYOFF_STATES
	var world_cue := river_surge_presentation.get_node_or_null("RiverSurgeWorldCue") as Node3D
	var greenvale_locus := river_surge_presentation.get_node_or_null("GreenvaleResponseLocus") as Node3D
	var bridge_locus := river_surge_presentation.get_node_or_null("EastBridgeResponseLocus") as Node3D
	var village_cue := river_surge_presentation.get_node_or_null("VillageRiverSurgeResponseCue") as Node3D
	if state_name in FRONTIER_PAYOFF_STATES:
		var gilded := "gilded_crossing" in state_name
		var secured := "secured" in state_name or "complete" in state_name
		var payoff_color := "#5ecb8aff" if secured else "#e6b85cff"
		if world_cue != null:
			world_cue.visible = state_name.begins_with("world_")
			var payoff_world_label := world_cue.get_node_or_null("RiverSurgeWorldLabel") as Label3D
			if payoff_world_label != null:
				payoff_world_label.text = ("AURELIAN FRONTIER / GILDED CROSSING SECURED" if secured else "AURELIAN FRONTIER / SECURE GILDED CROSSING") if gilded else ("AURELIAN FRONTIER / EAST BRIDGE PASSAGE RATIFIED" if secured else "AURELIAN FRONTIER / RATIFY EAST BRIDGE PASSAGE")
		if greenvale_locus != null:
			greenvale_locus.visible = false
		if bridge_locus != null:
			bridge_locus.visible = state_name.begins_with("map_")
			var payoff_map_label := bridge_locus.get_node_or_null("ResponseLabel") as Label3D
			if payoff_map_label != null:
				payoff_map_label.text = ("GILDED CROSSING SECURED" if secured else "SECURE GILDED CROSSING") if gilded else ("EAST BRIDGE PASSAGE RATIFIED" if secured else "RATIFY EAST BRIDGE PASSAGE")
				payoff_map_label.modulate = Color(payoff_color)
		if village_cue != null:
			village_cue.visible = state_name.begins_with("village_")
			var payoff_marker := village_cue.get_node_or_null("VillageResponseMarker") as MeshInstance3D
			var payoff_village_label := village_cue.get_node_or_null("VillageResponseLabel") as Label3D
			if payoff_marker != null:
				payoff_marker.material_override = _material(payoff_color, 0.42)
			if payoff_village_label != null:
				payoff_village_label.modulate = Color(payoff_color)
				payoff_village_label.text = ("GILDED CROSSING SECURED" if secured else "ACTION / SECURE GILDED CROSSING") if gilded else ("EAST BRIDGE PASSAGE RATIFIED" if secured else "ACTION / RATIFY EAST BRIDGE PASSAGE")
		return
	var is_world := state_name in ["world_river_surge_crisis", "world_aurelian_river_surge_greenvale_response", "world_aurelian_river_surge_bridge_response", "world_first_rival_countermove", "world_first_rival_response_stand_firm", "world_first_rival_response_negotiate_passage"]
	var is_map_pending := state_name == "map_river_surge_response_loci"
	var is_rival_greenvale := state_name == "map_first_rival_countermove_greenvale"
	var is_rival_bridge := state_name == "map_first_rival_countermove_east_bridge"
	var is_greenvale_map := state_name == "map_aurelian_imperial_heartland_greenvale_response"
	var is_bridge_map := state_name == "map_aurelian_imperial_heartland_bridge_response"
	if world_cue != null:
		world_cue.visible = is_world
		var world_label := world_cue.get_node_or_null("RiverSurgeWorldLabel") as Label3D
		if world_label != null:
			if state_name == "world_first_rival_countermove":
				world_label.text = "OBSIDIAN MARCH / %s PRESSURE" % ("EAST BRIDGE" if imperial_crisis_response == "shield_greenvale" else "GREENVALE")
			elif state_name == "world_first_rival_response_stand_firm":
				world_label.text = "OBSIDIAN MARCH / AURELIAN STANDS FIRM"
			elif state_name == "world_first_rival_response_negotiate_passage":
				world_label.text = "OBSIDIAN MARCH / PASSAGE NEGOTIATED"
			elif state_name == "world_aurelian_river_surge_greenvale_response":
				world_label.text = "RIVER SURGE / GREENVALE SHIELDED"
			elif state_name == "world_aurelian_river_surge_bridge_response":
				world_label.text = "RIVER SURGE / EAST BRIDGE OPEN"
			else:
				world_label.text = "RIVER SURGE"
	if greenvale_locus != null:
		greenvale_locus.visible = is_map_pending or is_greenvale_map or is_rival_greenvale or state_name in ["map_first_rival_response_stand_firm", "map_first_rival_response_negotiate_passage"] and imperial_crisis_response == "keep_east_bridge_open"
		greenvale_locus.scale = Vector3.ONE * (1.14 if is_rival_greenvale or is_map_pending and crisis_response_cursor == 0 else 1.0)
		var greenvale_label := greenvale_locus.get_node_or_null("ResponseLabel") as Label3D
		if greenvale_label != null:
			greenvale_label.text = "OBSIDIAN LEGITIMACY PRESSURE" if is_rival_greenvale else ("STAND FIRM" if state_name == "map_first_rival_response_stand_firm" else ("NEGOTIATED PASSAGE" if state_name == "map_first_rival_response_negotiate_passage" else "SHIELD GREENVALE"))
	if bridge_locus != null:
		bridge_locus.visible = is_map_pending or is_bridge_map or is_rival_bridge or state_name in ["map_first_rival_response_stand_firm", "map_first_rival_response_negotiate_passage"] and imperial_crisis_response == "shield_greenvale"
		bridge_locus.scale = Vector3.ONE * (1.14 if is_rival_bridge or is_map_pending and crisis_response_cursor == 1 else 1.0)
		var bridge_label := bridge_locus.get_node_or_null("ResponseLabel") as Label3D
		if bridge_label != null:
			bridge_label.text = "OBSIDIAN BRIDGE PRESSURE" if is_rival_bridge else ("STAND FIRM" if state_name == "map_first_rival_response_stand_firm" else ("NEGOTIATED PASSAGE" if state_name == "map_first_rival_response_negotiate_passage" else "KEEP EAST BRIDGE OPEN"))
	if village_cue != null:
		village_cue.visible = state_name in ["village_river_surge_response_pending", "village_aurelian_imperial_capital_greenvale_shielded", "village_aurelian_imperial_capital_bridge_response", "village_first_rival_response_pending", "village_first_rival_response_stand_firm", "village_first_rival_response_negotiate_passage"]
		var village_marker := village_cue.get_node_or_null("VillageResponseMarker") as MeshInstance3D
		var village_label := village_cue.get_node_or_null("VillageResponseLabel") as Label3D
		var response: String = imperial_crisis_response if imperial_crisis_response != "none" else String(CRISIS_RESPONSES[crisis_response_cursor])
		if state_name in ["village_first_rival_response_pending", "village_first_rival_response_stand_firm", "village_first_rival_response_negotiate_passage"]:
			response = first_rival_countermove_response if first_rival_countermove_response != "none" else String(RIVAL_RESPONSES[rival_response_cursor])
		var response_color := "#5ecb8aff" if response in ["shield_greenvale", "stand_firm"] else "#e6b85cff"
		if village_marker != null:
			village_marker.material_override = _material(response_color, 0.42)
		if village_label != null:
			village_label.modulate = Color(response_color)
			if response in RIVAL_RESPONSES:
				village_label.text = "STAND FIRM" if response == "stand_firm" else "NEGOTIATE PASSAGE"
			else:
				village_label.text = "SHIELD GREENVALE" if response == "shield_greenvale" else "KEEP EAST BRIDGE OPEN"

func _build_imperial_expansion_presentation() -> Node3D:
	var root := Node3D.new()
	root.name = "AurelianFirstImperialExpansionPresentation"
	var ridge := Node3D.new()
	ridge.name = "NorthRidgeOwnershipCue"
	ridge.position = topology_to_godot(Vector2(700.0, 205.0), 0.62)
	var ring := MeshInstance3D.new()
	ring.name = "NorthRidgeClaimRing"
	var ring_mesh := TorusMesh.new()
	ring_mesh.inner_radius = 0.72
	ring_mesh.outer_radius = 0.94
	ring_mesh.rings = 28
	ring_mesh.ring_segments = 14
	ring.mesh = ring_mesh
	ridge.add_child(ring)
	var beacon := MeshInstance3D.new()
	beacon.name = "NorthRidgeClaimBeacon"
	var beacon_mesh := CylinderMesh.new()
	beacon_mesh.top_radius = 0.08
	beacon_mesh.bottom_radius = 0.22
	beacon_mesh.height = 1.08
	beacon_mesh.radial_segments = 10
	beacon.mesh = beacon_mesh
	beacon.position.y = 0.54
	ridge.add_child(beacon)
	var ridge_label := Label3D.new()
	ridge_label.name = "NorthRidgeClaimLabel"
	ridge_label.font_size = 30
	ridge_label.outline_size = 8
	ridge_label.position = Vector3(0.0, 1.32, 0.0)
	ridge_label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	ridge.add_child(ridge_label)
	root.add_child(ridge)
	var capital := Node3D.new()
	capital.name = "GreenvaleTwoLandAdministrationCue"
	capital.position = topology_to_godot(Vector2(354.0, 285.0), 0.66)
	var capital_ring := MeshInstance3D.new()
	capital_ring.name = "GreenvaleAdministrationRing"
	var capital_mesh := TorusMesh.new()
	capital_mesh.inner_radius = 0.78
	capital_mesh.outer_radius = 1.02
	capital_mesh.rings = 28
	capital_mesh.ring_segments = 14
	capital_ring.mesh = capital_mesh
	capital_ring.material_override = _material("#d7ad42ff", 0.46)
	capital.add_child(capital_ring)
	var capital_label := Label3D.new()
	capital_label.name = "GreenvaleAdministrationLabel"
	capital_label.text = "GREENVALE CAPITAL / 2 LANDS"
	capital_label.font_size = 28
	capital_label.outline_size = 8
	capital_label.position = Vector3(0.0, 1.12, 0.0)
	capital_label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	capital.add_child(capital_label)
	root.add_child(capital)
	root.visible = false
	return root

func _refresh_imperial_expansion_presentation(state_name: String) -> void:
	if imperial_expansion_presentation == null:
		return
	var active := state_name in IMPERIAL_EXPANSION_STATES
	imperial_expansion_presentation.visible = active
	if not active:
		return
	var claimed := first_imperial_expansion == "north_ridge_claimed"
	var inspected := state_name == "map_first_imperial_expansion_north_ridge_inspected"
	var ridge := imperial_expansion_presentation.get_node_or_null("NorthRidgeOwnershipCue") as Node3D
	var capital := imperial_expansion_presentation.get_node_or_null("GreenvaleTwoLandAdministrationCue") as Node3D
	var color := "#68a978ff" if claimed else ("#f2cf63ff" if inspected else "#9ebbd1ff")
	if ridge != null:
		ridge.visible = not state_name.begins_with("village_")
		var label := ridge.get_node_or_null("NorthRidgeClaimLabel") as Label3D
		if label != null:
			label.modulate = Color(color)
			if state_name == "world_first_imperial_expansion_two_land_footprint":
				label.text = "AURELIAN / FIRST TWO-LAND FOOTPRINT"
			elif claimed:
				label.text = "NORTH RIDGE CLAIMED / LAND 2"
			elif inspected:
				label.text = "NORTH RIDGE INSPECTED / CLAIM READY"
			else:
				label.text = "NORTH RIDGE / ADJACENT LAND"
		for node_name in ["NorthRidgeClaimRing", "NorthRidgeClaimBeacon"]:
			var cue := ridge.get_node_or_null(node_name) as MeshInstance3D
			if cue != null:
				cue.material_override = _material(color, 0.46)
	if capital != null:
		capital.visible = claimed and state_name in ["map_first_imperial_expansion_two_lands_claimed", "village_first_imperial_expansion_greenvale_capital_two_lands", "world_first_imperial_expansion_two_land_footprint"]

func _build_north_ridge_outpost_presentation() -> Node3D:
	var root := Node3D.new()
	root.name = "AurelianNorthRidgeOutpostPresentation"
	var ridge := Node3D.new()
	ridge.name = "NorthRidgeOutpostCue"
	ridge.position = topology_to_godot(Vector2(700.0, 205.0), 0.64)
	var claim_ring := MeshInstance3D.new()
	claim_ring.name = "OutpostClaimedRing"
	var claim_mesh := TorusMesh.new()
	claim_mesh.inner_radius = 0.86
	claim_mesh.outer_radius = 1.06
	claim_mesh.rings = 28
	claim_mesh.ring_segments = 16
	claim_ring.mesh = claim_mesh
	claim_ring.material_override = _material("#9ebbd1ff", 0.34)
	ridge.add_child(claim_ring)
	var platform := MeshInstance3D.new()
	platform.name = "OutpostPlatform"
	var platform_mesh := CylinderMesh.new()
	platform_mesh.top_radius = 0.72
	platform_mesh.bottom_radius = 0.82
	platform_mesh.height = 0.18
	platform_mesh.radial_segments = 12
	platform.mesh = platform_mesh
	platform.position.y = 0.12
	platform.material_override = _material("#6b523aff", 0.18)
	ridge.add_child(platform)
	for index in range(4):
		var tower := MeshInstance3D.new()
		tower.name = "OutpostTower%02d" % (index + 1)
		var tower_mesh := CylinderMesh.new()
		tower_mesh.top_radius = 0.14
		tower_mesh.bottom_radius = 0.22
		tower_mesh.height = 1.24
		tower_mesh.radial_segments = 8
		tower.mesh = tower_mesh
		var angle := TAU * float(index) / 4.0
		tower.position = Vector3(cos(angle) * 0.52, 0.72, sin(angle) * 0.52)
		tower.material_override = _material("#8d6542ff", 0.22)
		ridge.add_child(tower)
	var beacon := MeshInstance3D.new()
	beacon.name = "OutpostBeacon"
	var beacon_mesh := CylinderMesh.new()
	beacon_mesh.top_radius = 0.07
	beacon_mesh.bottom_radius = 0.12
	beacon_mesh.height = 1.72
	beacon_mesh.radial_segments = 10
	beacon.mesh = beacon_mesh
	beacon.position.y = 1.02
	beacon.material_override = _material("#d7ad42ff", 0.38)
	ridge.add_child(beacon)
	var label := Label3D.new()
	label.name = "NorthRidgeOutpostLabel"
	label.font_size = 30
	label.outline_size = 9
	label.position = Vector3(0.0, 2.05, 0.0)
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	ridge.add_child(label)
	root.add_child(ridge)
	var capital := Node3D.new()
	capital.name = "GreenvaleOutpostAdministrationCue"
	capital.position = topology_to_godot(Vector2(354.0, 285.0), 0.74)
	var admin_ring := MeshInstance3D.new()
	admin_ring.name = "OutpostAdministrationRing"
	var admin_mesh := TorusMesh.new()
	admin_mesh.inner_radius = 0.86
	admin_mesh.outer_radius = 1.10
	admin_mesh.rings = 28
	admin_mesh.ring_segments = 16
	admin_ring.mesh = admin_mesh
	admin_ring.material_override = _material("#d7ad42ff", 0.38)
	capital.add_child(admin_ring)
	var admin_label := Label3D.new()
	admin_label.name = "OutpostAdministrationLabel"
	admin_label.font_size = 27
	admin_label.outline_size = 8
	admin_label.position = Vector3(0.0, 1.28, 0.0)
	admin_label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	capital.add_child(admin_label)
	root.add_child(capital)
	root.visible = false
	return root

func _refresh_north_ridge_outpost_presentation(state_name: String) -> void:
	if north_ridge_outpost_presentation == null:
		return
	var active := state_name in NORTH_RIDGE_OUTPOST_STATES
	north_ridge_outpost_presentation.visible = active
	if not active:
		return
	var established := north_ridge_outpost == "established"
	var ridge := north_ridge_outpost_presentation.get_node_or_null("NorthRidgeOutpostCue") as Node3D
	var capital := north_ridge_outpost_presentation.get_node_or_null("GreenvaleOutpostAdministrationCue") as Node3D
	if ridge != null:
		ridge.visible = not state_name.begins_with("village_")
		var label := ridge.get_node_or_null("NorthRidgeOutpostLabel") as Label3D
		if label != null:
			label.modulate = Color("#68a978ff" if established else "#9ebbd1ff")
			label.text = "NORTH RIDGE OUTPOST / HELD FRONTIER" if state_name == "world_north_ridge_outpost_held_two_land_frontier" else ("NORTH RIDGE OUTPOST / ESTABLISHED" if established else "NORTH RIDGE CLAIMED / OUTPOST NEEDED")
		var ring := ridge.get_node_or_null("OutpostClaimedRing") as MeshInstance3D
		if ring != null:
			ring.material_override = _material("#68a978ff" if established else "#9ebbd1ff", 0.38)
		for node_name in ["OutpostPlatform", "OutpostBeacon", "OutpostTower01", "OutpostTower02", "OutpostTower03", "OutpostTower04"]:
			var cue := ridge.get_node_or_null(node_name) as MeshInstance3D
			if cue != null:
				cue.visible = established
	if capital != null:
		capital.visible = state_name.begins_with("village_")
		var admin_label := capital.get_node_or_null("OutpostAdministrationLabel") as Label3D
		if admin_label != null:
			admin_label.text = "GREENVALE ADMINISTERS NORTH RIDGE OUTPOST" if established else "ESTABLISH NORTH RIDGE OUTPOST"


func _build_north_ridge_specialization_presentation() -> Node3D:
	var root := Node3D.new()
	root.name = "AurelianNorthRidgeSpecializationPresentation"
	var ridge := Node3D.new()
	ridge.name = "NorthRidgeSpecializationCue"
	ridge.position = topology_to_godot(Vector2(700.0, 205.0), 0.66)
	var base := MeshInstance3D.new()
	base.name = "SpecializationBase"
	var base_mesh := CylinderMesh.new()
	base_mesh.top_radius = 0.84
	base_mesh.bottom_radius = 0.94
	base_mesh.height = 0.22
	base_mesh.radial_segments = 12
	base.mesh = base_mesh
	base.position.y = 0.13
	base.material_override = _material("#5c4938ff", 0.20)
	ridge.add_child(base)
	var trade := Node3D.new()
	trade.name = "TradePostCue"
	for index in range(3):
		var cargo := MeshInstance3D.new()
		cargo.name = "Cargo%02d" % (index + 1)
		var cargo_mesh := BoxMesh.new()
		cargo_mesh.size = Vector3(0.46, 0.42, 0.52)
		cargo.mesh = cargo_mesh
		cargo.position = Vector3(-0.55 + float(index) * 0.55, 0.34, 0.18 if index % 2 == 0 else -0.20)
		cargo.material_override = _material("#d7ad42ff", 0.30)
		trade.add_child(cargo)
	var route_bar := MeshInstance3D.new()
	route_bar.name = "TradeRouteBar"
	var route_mesh := BoxMesh.new()
	route_mesh.size = Vector3(2.25, 0.12, 0.16)
	route_bar.mesh = route_mesh
	route_bar.position = Vector3(0.0, 0.24, -0.62)
	route_bar.material_override = _material("#e2c36fff", 0.40)
	trade.add_child(route_bar)
	ridge.add_child(trade)
	var watch := Node3D.new()
	watch.name = "WatchPostCue"
	var mast := MeshInstance3D.new()
	mast.name = "WatchMast"
	var mast_mesh := CylinderMesh.new()
	mast_mesh.top_radius = 0.12
	mast_mesh.bottom_radius = 0.25
	mast_mesh.height = 2.18
	mast_mesh.radial_segments = 10
	mast.mesh = mast_mesh
	mast.position.y = 1.20
	mast.material_override = _material("#668fb5ff", 0.30)
	watch.add_child(mast)
	var lookout := MeshInstance3D.new()
	lookout.name = "WatchLookout"
	var lookout_mesh := CylinderMesh.new()
	lookout_mesh.top_radius = 0.58
	lookout_mesh.bottom_radius = 0.48
	lookout_mesh.height = 0.28
	lookout_mesh.radial_segments = 10
	lookout.mesh = lookout_mesh
	lookout.position.y = 2.16
	lookout.material_override = _material("#9ecce6ff", 0.44)
	watch.add_child(lookout)
	ridge.add_child(watch)
	var label := Label3D.new()
	label.name = "NorthRidgeSpecializationLabel"
	label.font_size = 29
	label.outline_size = 9
	label.position = Vector3(0.0, 2.72, 0.0)
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	ridge.add_child(label)
	root.add_child(ridge)
	var capital := Node3D.new()
	capital.name = "GreenvaleSpecializationAdministrationCue"
	capital.position = topology_to_godot(Vector2(354.0, 285.0), 0.78)
	var capital_ring := MeshInstance3D.new()
	capital_ring.name = "SpecializationAdministrationRing"
	var ring_mesh := TorusMesh.new()
	ring_mesh.inner_radius = 0.90
	ring_mesh.outer_radius = 1.14
	ring_mesh.rings = 28
	ring_mesh.ring_segments = 16
	capital_ring.mesh = ring_mesh
	capital.add_child(capital_ring)
	var capital_label := Label3D.new()
	capital_label.name = "SpecializationAdministrationLabel"
	capital_label.font_size = 27
	capital_label.outline_size = 8
	capital_label.position = Vector3(0.0, 1.34, 0.0)
	capital_label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	capital.add_child(capital_label)
	root.add_child(capital)
	root.visible = false
	return root

func _refresh_north_ridge_specialization_presentation(state_name: String) -> void:
	if north_ridge_specialization_presentation == null:
		return
	var active := state_name in NORTH_RIDGE_SPECIALIZATION_STATES
	north_ridge_specialization_presentation.visible = active
	if not active:
		return
	var preview := NORTH_RIDGE_SPECIALIZATIONS[north_ridge_specialization_cursor] if north_ridge_specialization == "none" else north_ridge_specialization
	var trade_active := preview == "trade_post"
	var color := "#d7ad42ff" if trade_active else "#668fb5ff"
	var ridge := north_ridge_specialization_presentation.get_node_or_null("NorthRidgeSpecializationCue") as Node3D
	var capital := north_ridge_specialization_presentation.get_node_or_null("GreenvaleSpecializationAdministrationCue") as Node3D
	if ridge != null:
		ridge.visible = not state_name.begins_with("village_")
		var trade := ridge.get_node_or_null("TradePostCue") as Node3D
		var watch := ridge.get_node_or_null("WatchPostCue") as Node3D
		if trade != null:
			trade.visible = trade_active
		if watch != null:
			watch.visible = not trade_active
		var label := ridge.get_node_or_null("NorthRidgeSpecializationLabel") as Label3D
		if label != null:
			label.modulate = Color(color)
			label.text = "NORTH RIDGE / TRADE POST" if trade_active else "NORTH RIDGE / WATCH POST"
	if capital != null:
		capital.visible = state_name.begins_with("village_")
		var ring := capital.get_node_or_null("SpecializationAdministrationRing") as MeshInstance3D
		if ring != null:
			ring.material_override = _material(color, 0.42)
		var label := capital.get_node_or_null("SpecializationAdministrationLabel") as Label3D
		if label != null:
			label.modulate = Color(color)
			label.text = "GREENVALE COMMITS TRADE POST" if trade_active else "GREENVALE COMMITS WATCH POST"

func _animate_living_capital_presentation(delta: float) -> void:
	var seconds := float(Time.get_ticks_msec()) / 1000.0
	if dispatch_token != null and dispatch_token.visible:
		var route_mix := (sin(seconds * 0.82) + 1.0) * 0.5
		var route_point := Vector2(354.0, 285.0).lerp(Vector2(515.0, 340.0), route_mix)
		dispatch_token.position = topology_to_godot(route_point, 0.44 + sin(seconds * 2.4) * 0.035)
		dispatch_token.rotation.y += delta * 0.75
	if living_capital_presentation != null and living_capital_presentation.visible:
		for index in range(4):
			var lantern := living_capital_presentation.get_node_or_null("CapitalLantern%02d" % (index + 1)) as Node3D
			if lantern != null:
				var lantern_pulse := 1.0 + sin(seconds * 2.2 + float(index) * 0.9) * 0.10
				lantern.scale = Vector3(1.0, lantern_pulse, 1.0)
	if homeland_marker != null and homeland_marker.visible:
		var map_pulse := 1.0 + sin(seconds * 2.0) * 0.025
		homeland_marker.scale = Vector3.ONE * map_pulse
	if nation_emblem != null and nation_emblem.visible:
		var world_pulse := 1.0 + sin(seconds * 1.6) * 0.02
		nation_emblem.scale = Vector3.ONE * world_pulse

func _reveal_living_capital() -> void:
	if living_capital_presentation == null:
		return
	living_capital_presentation.scale = Vector3.ONE * 0.72
	var tween := create_tween()
	tween.set_trans(Tween.TRANS_BACK)
	tween.set_ease(Tween.EASE_OUT)
	tween.tween_property(living_capital_presentation, "scale", Vector3.ONE, 0.72)

func _set_trade_world_underway(underway: bool) -> void:
	if main_world_overlay_root == null:
		return
	var label := main_world_overlay_root.get_node_or_null("Direction_EastTrade/StrategicLabel") as Label3D
	if label != null:
		label.text = "TRADE UNDERWAY" if underway else "TRADE"

func _apply_entry_state(state_name: String) -> void:
	if not ENTRY_STATES.has(state_name):
		push_error("PLAYABLE_AURELIAN_UNKNOWN_STATE=%s" % state_name)
		return
	var previous_state := entry_state
	entry_state = state_name
	main_world_overlay_root.visible = state_name.begins_with("world_")
	main_overlay_root.visible = state_name.begins_with("map_")
	main_decision_overlay_root.visible = state_name in RIVAL_STATES or state_name in FRONTIER_PAYOFF_STATES or state_name in IMPERIAL_EXPANSION_STATES or state_name in NORTH_RIDGE_OUTPOST_STATES or state_name in ["village_route_context", "map_east_route_connected", "map_east_route_in_use", "world_trade_route_active", "world_first_trade_underway", "map_greenvale_city", "world_first_city_recognized", "world_first_nation_founded", "map_aurelian_homeland", "village_national_mandate_started", "map_national_mandate_active", "world_national_mandate_underway", "village_aurelian_imperial_capital", "map_aurelian_imperial_heartland", "world_first_empire_proclaimed"]
	if dispatch_token != null:
		dispatch_token.visible = state_name in ["map_east_route_in_use", "world_first_trade_underway", "map_greenvale_city", "world_first_city_recognized", "world_first_nation_founded", "map_aurelian_homeland"]
	if city_marker != null:
		city_marker.visible = state_name in ["village_city_chartered", "map_greenvale_city", "world_first_city_recognized", "world_first_nation_founded", "map_aurelian_homeland", "village_greenvale_capital"]
	if homeland_marker != null:
		homeland_marker.visible = state_name in ["map_aurelian_homeland", "map_aurelian_imperial_heartland", "map_first_imperial_expansion_two_lands_claimed"]
	if nation_emblem != null:
		nation_emblem.visible = state_name in ["world_first_nation_founded", "world_first_empire_proclaimed"]
	if capital_standards != null:
		capital_standards.visible = state_name in ["village_greenvale_capital", "village_aurelian_imperial_capital"]
	if mandate_marker != null:
		mandate_marker.visible = state_name in ["map_national_mandate_active", "map_aurelian_imperial_heartland"]
		_refresh_national_mandate_marker()
	if living_capital_presentation != null:
		living_capital_presentation.visible = state_name in ["village_greenvale_capital", "village_national_mandate_started", "village_aurelian_imperial_capital"]
		if living_capital_presentation.visible and previous_state != state_name:
			_reveal_living_capital()
	_refresh_imperial_presentation(state_name)
	_refresh_river_surge_presentation(state_name)
	_refresh_imperial_expansion_presentation(state_name)
	_refresh_north_ridge_outpost_presentation(state_name)
	_refresh_north_ridge_specialization_presentation(state_name)
	_set_trade_world_underway(false)
	_refresh_national_direction_identity()
	match state_name:
		"world_neutral":
			if not _hide_preclaim_greenvale():
				push_error("AURELIAN_FIRST_LAND_CLAIM_PRECLAIM_VISIBILITY_FAILED")
			_apply_world_state(main_world_overlay_root, "neutral")
			_activate_camera("world")
		"world_trade_selected":
			if settlement_founded:
				if not _apply_village_state(main_basin, "developed" if settlement_developed else "founded"):
					push_error("AURELIAN_FIRST_SETTLEMENT_FOUNDING_VILLAGE_STATE_FAILED")
			else:
				if not _hide_preclaim_greenvale():
					push_error("AURELIAN_FIRST_LAND_CLAIM_PRECLAIM_VISIBILITY_FAILED")
			_apply_world_state(main_world_overlay_root, "selected_trade")
			_activate_camera("world")
		"world_trade_route_active":
			if not _apply_village_state(main_basin, "developed"):
				push_error("AURELIAN_FIRST_TRADE_ROUTE_CONNECTION_VILLAGE_STATE_FAILED")
			_apply_world_state(main_world_overlay_root, "selected_trade")
			_activate_camera("world")
		"world_first_trade_underway":
			if not _apply_village_state(main_basin, "developed"):
				push_error("AURELIAN_FIRST_TRADE_CARAVAN_DISPATCH_VILLAGE_STATE_FAILED")
			_apply_world_state(main_world_overlay_root, "selected_trade")
			_set_trade_world_underway(true)
			_activate_camera("world")
		"world_first_city_recognized":
			if not _apply_village_state(main_basin, "city_chartered"):
				push_error("AURELIAN_FIRST_CITY_CHARTER_VILLAGE_STATE_FAILED")
			_apply_world_state(main_world_overlay_root, "selected_trade")
			_set_trade_world_underway(true)
			_activate_camera("world")
		"world_first_nation_founded", "world_national_mandate_underway", "world_first_empire_proclaimed", "world_river_surge_crisis", "world_aurelian_river_surge_greenvale_response", "world_aurelian_river_surge_bridge_response", "world_first_rival_countermove", "world_first_rival_response_stand_firm", "world_first_rival_response_negotiate_passage", "world_first_frontier_payoff_gilded_crossing_revealed", "world_first_frontier_legacy_gilded_crossing_complete", "world_first_frontier_payoff_east_bridge_revealed", "world_first_frontier_legacy_east_bridge_complete", "world_first_imperial_expansion_north_ridge_direction", "world_first_imperial_expansion_two_land_footprint", "world_north_ridge_outpost_frontier_need", "world_north_ridge_outpost_held_two_land_frontier", "world_north_ridge_specialization_held_frontier", "world_north_ridge_trade_post_logistics_posture", "world_north_ridge_watch_post_vigilance_posture":
			if not _apply_village_state(main_basin, "city_chartered"):
				push_error("AURELIAN_FIRST_NATION_FOUNDING_CAPITAL_STATE_FAILED")
			_apply_world_state(main_world_overlay_root, "selected_trade")
			_set_trade_world_underway(true)
			_activate_camera("world")
		"map_east_route_selected":
			if not _hide_preclaim_greenvale():
				push_error("AURELIAN_FIRST_LAND_CLAIM_PRECLAIM_VISIBILITY_FAILED")
			_apply_map_state(main_overlay_root, "selected")
			_activate_camera("map")
		"map_east_route":
			_apply_map_state(main_overlay_root, "selected")
			_activate_camera("map")
		"map_east_route_claimed":
			_apply_map_state(main_overlay_root, "east_route_claimed")
			if not _apply_village_state(main_basin, "developed" if settlement_developed else ("founded" if settlement_founded else "claimed")):
				push_error("AURELIAN_FIRST_SETTLEMENT_FOUNDING_VILLAGE_STATE_FAILED" if settlement_founded else "AURELIAN_FIRST_LAND_CLAIM_VILLAGE_STATE_FAILED")
			_activate_camera("map")
			print("AURELIAN_FIRST_LAND_CLAIM=EAST_ROUTE")
		"map_east_route_connected", "map_east_route_in_use":
			_apply_map_state(main_overlay_root, "east_route_claimed")
			if not _apply_village_state(main_basin, "developed"):
				push_error("AURELIAN_FIRST_TRADE_ROUTE_CONNECTION_VILLAGE_STATE_FAILED")
			_activate_camera("map")
		"map_greenvale_city":
			_apply_map_state(main_overlay_root, "east_route_claimed")
			if not _apply_village_state(main_basin, "city_chartered"):
				push_error("AURELIAN_FIRST_CITY_CHARTER_VILLAGE_STATE_FAILED")
			_activate_camera("map")
		"map_aurelian_homeland", "map_national_mandate_active", "map_aurelian_imperial_heartland", "map_river_surge_response_loci", "map_aurelian_imperial_heartland_greenvale_response", "map_aurelian_imperial_heartland_bridge_response", "map_first_rival_countermove_east_bridge", "map_first_rival_countermove_greenvale", "map_first_rival_response_stand_firm", "map_first_rival_response_negotiate_passage", "map_first_frontier_payoff_gilded_crossing_pending", "map_first_frontier_payoff_gilded_crossing_secured", "map_first_frontier_payoff_east_bridge_pending", "map_first_frontier_payoff_east_bridge_secured", "map_first_imperial_expansion_north_ridge_available", "map_first_imperial_expansion_north_ridge_inspected", "map_first_imperial_expansion_two_lands_claimed", "map_north_ridge_outpost_claimed_inspection", "map_north_ridge_outpost_established", "map_north_ridge_specialization_inspection", "map_north_ridge_trade_post_committed", "map_north_ridge_watch_post_committed":
			_apply_map_state(main_overlay_root, "east_route_claimed")
			if not _apply_village_state(main_basin, "city_chartered"):
				push_error("AURELIAN_FIRST_NATION_FOUNDING_CAPITAL_STATE_FAILED")
			_activate_camera("map")
		"village_claimed":
			_apply_map_state(main_overlay_root, "east_route_claimed")
			if not _apply_village_state(main_basin, "claimed"):
				push_error("AURELIAN_FIRST_LAND_CLAIM_VILLAGE_STATE_FAILED")
			_activate_camera("village")
		"village_founded":
			settlement_founded = true
			_apply_map_state(main_overlay_root, "east_route_claimed")
			if not _apply_village_state(main_basin, "founded"):
				push_error("AURELIAN_FIRST_SETTLEMENT_FOUNDING_VILLAGE_STATE_FAILED")
			_activate_camera("village")
		"village_developed", "village_trade_dispatched":
			settlement_founded = true
			settlement_developed = true
			_apply_map_state(main_overlay_root, "east_route_claimed")
			if not _apply_village_state(main_basin, "developed"):
				push_error("AURELIAN_FIRST_SETTLEMENT_DEVELOPMENT_VILLAGE_STATE_FAILED")
			_activate_camera("village")
		"village_city_chartered":
			settlement_founded = true
			settlement_developed = true
			route_connected = true
			caravan_dispatched = true
			city_chartered = true
			_apply_map_state(main_overlay_root, "east_route_claimed")
			if not _apply_village_state(main_basin, "city_chartered"):
				push_error("AURELIAN_FIRST_CITY_CHARTER_VILLAGE_STATE_FAILED")
			_activate_camera("village")
		"village_greenvale_capital", "village_national_mandate_started", "village_aurelian_imperial_capital", "village_river_surge_response_pending", "village_aurelian_imperial_capital_greenvale_shielded", "village_aurelian_imperial_capital_bridge_response", "village_first_rival_response_pending", "village_first_rival_response_stand_firm", "village_first_rival_response_negotiate_passage", "village_first_frontier_payoff_gilded_crossing_pending", "village_first_frontier_payoff_gilded_crossing_secured", "village_first_frontier_payoff_east_bridge_pending", "village_first_frontier_payoff_east_bridge_secured", "village_first_imperial_expansion_greenvale_capital_two_lands", "village_north_ridge_outpost_establish_action", "village_north_ridge_outpost_greenvale_administers", "village_north_ridge_specialization_choice", "village_north_ridge_trade_post_greenvale_administers", "village_north_ridge_watch_post_greenvale_administers":
			settlement_founded = true
			settlement_developed = true
			route_connected = true
			caravan_dispatched = true
			city_chartered = true
			nation_founded = true
			_apply_map_state(main_overlay_root, "east_route_claimed")
			if not _apply_village_state(main_basin, "city_chartered"):
				push_error("AURELIAN_FIRST_NATION_FOUNDING_CAPITAL_STATE_FAILED")
			_activate_camera("village")
		"village_route_context":
			_activate_camera("village")
	_update_runtime_hud()
	if persistence_enabled:
		restored_intent = "none" if entry_state == "world_neutral" else "east_trade"
		var save_result := SESSION.save_session(entry_state, restored_intent, SESSION.NATIVE_PATH, settlement_founded, settlement_developed, route_connected, caravan_dispatched, city_chartered, nation_founded, committed_direction, national_mandate_started, empire_proclaimed, imperial_crisis, imperial_crisis_response, first_rival_countermove_response, first_frontier_payoff, imperial_expansion_target, first_imperial_expansion, north_ridge_outpost, north_ridge_specialization)
		print("AURELIAN_NATIONAL_DIRECTION_SAVE=%s" % committed_direction)
		print("AURELIAN_SESSION_V2_SAVE_ACK=%s:%s:%s:%s:%s:%s:%s:%s:%s:%s" % [String(save_result.get("status", "unknown")), String(save_result.get("adapter", "unknown")), entry_state, restored_intent, settlement_founded, settlement_developed, route_connected, caravan_dispatched, city_chartered, nation_founded])
		if not bool(save_result.get("ok", false)) and String(save_result.get("status", "")) != "unavailable":
			push_error("AURELIAN_SESSION_V2_SAVE_FAILED=%s" % String(save_result.get("status", "unknown")))
	print("PLAYABLE_AURELIAN_ENTRY_STATE=%s" % entry_state)

func _update_runtime_hud() -> void:
	if layer_label == null:
		return
	match entry_state:
		"world_neutral":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "Choose Aurelian's strategic direction"
			controls_label.text = "[ENTER] Select eastern Trade"
		"world_trade_selected":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "Trade selected: eastern route opportunity"
			controls_label.text = "[RIGHT] Open claimed Map    [LEFT] Clear" if settlement_founded else "[RIGHT] Open Map    [LEFT] Clear"
		"world_trade_route_active":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "Eastern Trade active through connected East Route"
			controls_label.text = "[RIGHT] Inspect connected Map"
		"world_first_trade_underway":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "First eastern trade caravan is underway"
			controls_label.text = "[RIGHT] Inspect route in use"
		"world_first_city_recognized":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "Greenvale recognized as Aurelian's first city"
			controls_label.text = "[ENTER] Found Aurelian Nation    [RIGHT] Inspect city on Map"
		"world_national_mandate_underway":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "%s mandate underway for Aurelian" % committed_direction.capitalize()
			controls_label.text = "[RIGHT] Inspect active mandate locus"
		"world_first_empire_proclaimed":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "First Aurelian Empire proclaimed, preserving %s direction" % committed_direction.capitalize()
			controls_label.text = "[ENTER] Face River Surge    [RIGHT] Inspect imperial heartland"
		"world_river_surge_crisis":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "River Surge threatens Greenvale and the East Bridge"
			controls_label.text = "[RIGHT] Inspect both response loci"
		"world_aurelian_river_surge_greenvale_response":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "%s Empire records: Greenvale shielded" % committed_direction.capitalize()
			controls_label.text = "[ENTER] Reveal Obsidian March countermove    [RIGHT] Inspect Greenvale response"
		"world_aurelian_river_surge_bridge_response":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "%s Empire records: East Bridge kept open" % committed_direction.capitalize()
			controls_label.text = "[ENTER] Reveal Obsidian March countermove    [RIGHT] Inspect East Bridge response"
		"world_first_rival_countermove":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "Obsidian March reacts at %s because of the River Surge response" % ("East Bridge" if imperial_crisis_response == "shield_greenvale" else "Greenvale")
			controls_label.text = "[RIGHT] Inspect pressured locus on Map"
		"world_first_rival_response_stand_firm":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "%s Aurelian Empire records: Stand Firm" % committed_direction.capitalize()
			controls_label.text = "[ENTER] Reveal derived frontier payoff    [RIGHT] Inspect recorded response on Map"
		"world_first_rival_response_negotiate_passage":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "%s Aurelian Empire records: Negotiate Passage" % committed_direction.capitalize()
			controls_label.text = "[ENTER] Reveal derived frontier payoff    [RIGHT] Inspect recorded response on Map"
		"world_first_frontier_payoff_gilded_crossing_revealed":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "Stand Firm creates a frontier payoff at Gilded Crossing"
			controls_label.text = "[RIGHT] Inspect pending payoff on Map"
		"world_first_frontier_legacy_gilded_crossing_complete":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "Aurelian frontier legacy: Gilded Crossing secured"
			controls_label.text = "[ENTER] Reveal North Ridge expansion direction    [RIGHT] Inspect secured frontier"
		"world_first_frontier_payoff_east_bridge_revealed":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "Negotiated Passage creates a frontier payoff at East Bridge"
			controls_label.text = "[RIGHT] Inspect pending payoff on Map"
		"world_first_frontier_legacy_east_bridge_complete":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "Aurelian frontier legacy: East Bridge passage ratified"
			controls_label.text = "[ENTER] Reveal North Ridge expansion direction    [RIGHT] Inspect secured frontier"
		"world_first_imperial_expansion_north_ridge_direction":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "Completed frontier legacy opens adjacent North Ridge"
			controls_label.text = "[RIGHT] Inspect North Ridge on Map"
		"world_first_imperial_expansion_two_land_footprint":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "Aurelian records its first two-land imperial footprint"
			controls_label.text = "[ENTER] Assess why North Ridge must be held    [RIGHT] Inspect both lands"
		"world_north_ridge_outpost_frontier_need":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "North Ridge must hold the exposed second-land frontier"
			controls_label.text = "[RIGHT] Inspect claimed North Ridge on Map"
		"world_north_ridge_outpost_held_two_land_frontier":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "North Ridge Outpost holds the two-land frontier"
			controls_label.text = "[ENTER] Choose its first specialization    [RIGHT] Inspect established outpost on Map"
		"world_north_ridge_specialization_held_frontier":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "The held frontier now needs a lasting North Ridge role"
			controls_label.text = "[RIGHT] Inspect specialization locus on Map"
		"world_north_ridge_trade_post_logistics_posture":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "Trade Post extends Aurelian logistics across the two-land frontier"
			controls_label.text = "[RIGHT] Inspect committed Trade Post"
		"world_north_ridge_watch_post_vigilance_posture":
			layer_label.text = "WORLD  |  WHY"
			intent_label.text = "Watch Post gives Aurelian vigilance across the two-land frontier"
			controls_label.text = "[RIGHT] Inspect committed Watch Post"
		"map_first_frontier_payoff_gilded_crossing_pending":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "Gilded Crossing is the pending payoff locus"
			controls_label.text = "[RIGHT] Open Village action    [LEFT] World"
		"map_first_frontier_payoff_gilded_crossing_secured":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "Gilded Crossing is secured in the existing frontier"
			controls_label.text = "[RIGHT] Reopen capital record    [LEFT] World"
		"map_first_frontier_payoff_east_bridge_pending":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "East Bridge is the pending passage locus"
			controls_label.text = "[RIGHT] Open Village action    [LEFT] World"
		"map_first_frontier_payoff_east_bridge_secured":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "East Bridge passage is ratified on the existing route"
			controls_label.text = "[RIGHT] Reopen capital record    [LEFT] World"
		"map_first_imperial_expansion_north_ridge_available":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "North Ridge is the only adjacent land available"
			controls_label.text = "[ENTER] Inspect North Ridge    [LEFT] World"
		"map_first_imperial_expansion_north_ridge_inspected":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "North Ridge inspected: East Route remains the homeland"
			controls_label.text = "[ENTER] Claim North Ridge    [LEFT] World"
		"map_first_imperial_expansion_two_lands_claimed":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "Claimed lands: East Route and North Ridge"
			controls_label.text = "[RIGHT] Open Greenvale capital    [LEFT] World"
		"village_first_imperial_expansion_greenvale_capital_two_lands":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "Greenvale imperial capital administers two claimed lands"
			controls_label.text = "[LEFT] Return to two-land Map"
		"map_north_ridge_outpost_claimed_inspection":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "Claimed North Ridge has no frontier presence yet"
			controls_label.text = "[RIGHT] Open Greenvale establishment action    [LEFT] World"
		"village_north_ridge_outpost_establish_action":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "Greenvale can establish one fixed North Ridge Outpost"
			controls_label.text = "[ENTER] Establish North Ridge Outpost    [LEFT] Map"
		"map_north_ridge_outpost_established":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "One established outpost now marks claimed North Ridge"
			controls_label.text = "[RIGHT] Open Greenvale administration    [LEFT] World"
		"village_north_ridge_outpost_greenvale_administers":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "Greenvale imperial capital administers North Ridge Outpost"
			controls_label.text = "[LEFT] Return to established outpost Map"
		"map_north_ridge_specialization_inspection":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "Existing North Ridge Outpost is the only specialization locus"
			controls_label.text = "[RIGHT] Choose its role in Village    [LEFT] World"
		"village_north_ridge_specialization_choice":
			layer_label.text = "VILLAGE  |  HOW"
			var inspected_specialization := "Trade Post" if north_ridge_specialization_cursor == 0 else "Watch Post"
			intent_label.text = "Choose one lasting North Ridge role: %s" % inspected_specialization
			controls_label.text = "[UP / DOWN] Trade Post / Watch Post    [ENTER] Commit role    [LEFT] Map"
		"map_north_ridge_trade_post_committed":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "Trade Post is committed at the existing North Ridge Outpost"
			controls_label.text = "[RIGHT] Open Greenvale administration    [LEFT] World"
		"village_north_ridge_trade_post_greenvale_administers":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "Greenvale administers North Ridge Trade Post logistics"
			controls_label.text = "[LEFT] Return to committed Map"
		"map_north_ridge_watch_post_committed":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "Watch Post is committed at the existing North Ridge Outpost"
			controls_label.text = "[RIGHT] Open Greenvale administration    [LEFT] World"
		"village_north_ridge_watch_post_greenvale_administers":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "Greenvale administers North Ridge Watch Post vigilance"
			controls_label.text = "[LEFT] Return to committed Map"
		"village_first_frontier_payoff_gilded_crossing_pending":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "Capital action ready: Secure Gilded Crossing"
			controls_label.text = "[ENTER] Secure Gilded Crossing    [LEFT] Map"
		"village_first_frontier_payoff_gilded_crossing_secured":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "Capital records Gilded Crossing secured"
			controls_label.text = "[LEFT] Map"
		"village_first_frontier_payoff_east_bridge_pending":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "Capital action ready: Ratify East Bridge Passage"
			controls_label.text = "[ENTER] Ratify East Bridge Passage    [LEFT] Map"
		"village_first_frontier_payoff_east_bridge_secured":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "Capital records East Bridge passage ratified"
			controls_label.text = "[LEFT] Map"
		"world_first_nation_founded":
			layer_label.text = "WORLD  |  WHY"
			if committed_direction == "none":
				var inspected: String = String(NATIONAL_DIRECTIONS[national_direction_cursor]).capitalize()
				intent_label.text = "Inspect national direction: %s" % inspected
				controls_label.text = "[UP / DOWN] Trade / Expand / Frontier    [ENTER] Commit Aurelian Direction"
			else:
				intent_label.text = "Aurelian direction committed: %s" % committed_direction.capitalize()
				controls_label.text = "[RIGHT] Inspect homeland context"
		"map_east_route_selected":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "East Route selected near Gilded Crossing"
			controls_label.text = "[ENTER] Claim East Route    [LEFT] World"
		"map_east_route_claimed":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "East Route claimed for Aurelian"
			controls_label.text = "[ENTER] Connect East Route    [RIGHT] Reopen Greenvale    [LEFT] World" if settlement_developed else ("[RIGHT] Reopen Greenvale    [LEFT] World" if settlement_founded else "[RIGHT] Open claimed land    [LEFT] World")
		"map_east_route_connected":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "East Route connected: Greenvale to Gilded Crossing"
			controls_label.text = "[RIGHT] Reopen developed Greenvale    [LEFT] World"
		"map_east_route_in_use":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "First caravan dispatched along the connected East Route"
			controls_label.text = "[RIGHT] Reopen Greenvale    [LEFT] World"
		"map_greenvale_city":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "Greenvale city anchors the East Route at its accepted origin"
			controls_label.text = "[RIGHT] Open first city    [LEFT] World"
		"map_aurelian_homeland":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "Aurelian homeland context: %s direction" % committed_direction.capitalize()
			controls_label.text = "[RIGHT] Open Greenvale capital    [LEFT] World"
		"map_national_mandate_active":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "%s mandate active at %s" % [committed_direction.capitalize(), _mandate_locus_label()]
			controls_label.text = "[RIGHT] Open mandate in Greenvale    [LEFT] World"
		"map_aurelian_imperial_heartland":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "%s imperial heartland anchored at Greenvale and %s" % [committed_direction.capitalize(), _mandate_locus_label()]
			controls_label.text = "[RIGHT] Open imperial capital    [LEFT] World"
		"map_river_surge_response_loci":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "River Surge response loci: Greenvale and East Bridge"
			controls_label.text = "[RIGHT] Choose response in Village    [LEFT] World"
		"map_aurelian_imperial_heartland_greenvale_response":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "Selected response anchored at Greenvale"
			controls_label.text = "[RIGHT] Reopen imperial capital    [LEFT] World"
		"map_aurelian_imperial_heartland_bridge_response":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "Selected response anchored at East Bridge"
			controls_label.text = "[RIGHT] Reopen imperial capital    [LEFT] World"
		"map_first_rival_countermove_east_bridge":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "Obsidian March pressures the existing East Bridge"
			controls_label.text = "[RIGHT] Choose Aurelian response in Village    [LEFT] World"
		"map_first_rival_countermove_greenvale":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "Obsidian March pressures legitimacy at existing Greenvale"
			controls_label.text = "[RIGHT] Choose Aurelian response in Village    [LEFT] World"
		"map_first_rival_response_stand_firm":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "Stand Firm recorded at the pressured existing locus"
			controls_label.text = "[LEFT] Record response in World"
		"map_first_rival_response_negotiate_passage":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "Negotiated Passage recorded at the pressured existing locus"
			controls_label.text = "[LEFT] Record response in World"
		"village_claimed":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "East Route is claimed: no settlement exists yet"
			controls_label.text = "[ENTER] Found Greenvale    [LEFT / ESC] Return to claimed Map"
		"village_founded":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "Greenvale founded: ready for visible development"
			controls_label.text = "[ENTER] Develop Greenvale    [LEFT / ESC] Return to claimed Map"
		"village_developed":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "Greenvale developed into a visible working settlement"
			controls_label.text = "[ENTER] Dispatch First Caravan    [LEFT / ESC] Return to connected Map" if route_connected else "[LEFT / ESC] Return to claimed Map"
		"village_trade_dispatched":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "First caravan dispatched from developed Greenvale"
			controls_label.text = "[ENTER] Charter Greenvale    [LEFT / ESC] Inspect route in use"
		"village_city_chartered":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "Greenvale chartered with a visible civic core"
			controls_label.text = "[LEFT / ESC] Inspect city on Map"
		"village_greenvale_capital":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "Greenvale capital identity: %s direction" % committed_direction.capitalize()
			controls_label.text = "[ENTER] %s    [LEFT / ESC] Inspect Aurelian homeland" % _mandate_action_label()
		"village_national_mandate_started":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "%s mandate started from Greenvale" % committed_direction.capitalize()
			controls_label.text = "[ENTER] Proclaim Aurelian Empire    [LEFT / ESC] Inspect active mandate locus"
		"village_aurelian_imperial_capital":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "Greenvale is the %s Aurelian imperial capital" % committed_direction.capitalize()
			controls_label.text = "[LEFT / ESC] Inspect imperial heartland"
		"village_river_surge_response_pending":
			layer_label.text = "VILLAGE  |  HOW"
			var inspected_response := "Shield Greenvale" if crisis_response_cursor == 0 else "Keep East Bridge Open"
			intent_label.text = "Choose the first imperial crisis response: %s" % inspected_response
			controls_label.text = "[UP / DOWN] Inspect responses    [ENTER] Commit response    [LEFT] Map"
		"village_aurelian_imperial_capital_greenvale_shielded":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "Greenvale shield response committed"
			controls_label.text = "[LEFT / ESC] Inspect Greenvale response on Map"
		"village_aurelian_imperial_capital_bridge_response":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "East Bridge access response committed"
			controls_label.text = "[LEFT / ESC] Inspect East Bridge response on Map"
		"village_first_rival_response_pending":
			layer_label.text = "VILLAGE  |  HOW"
			var inspected_rival_response := "Stand Firm" if rival_response_cursor == 0 else "Negotiate Passage"
			intent_label.text = "Choose Aurelian response to Obsidian March: %s" % inspected_rival_response
			controls_label.text = "[UP / DOWN] Inspect responses    [ENTER] Commit response    [LEFT] Map"
		"village_first_rival_response_stand_firm":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "Aurelian Empire stands firm at the pressured locus"
			controls_label.text = "[LEFT / ESC] Inspect result on Map"
		"village_first_rival_response_negotiate_passage":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "Aurelian Empire negotiates passage at the pressured locus"
			controls_label.text = "[LEFT / ESC] Inspect result on Map"
		"map_east_route":
			layer_label.text = "MAP  |  WHERE"
			intent_label.text = "Legacy East Route selection restored"
			controls_label.text = "[ENTER] Claim East Route    [RIGHT] Legacy Village    [LEFT] World"
		"village_route_context":
			layer_label.text = "VILLAGE  |  HOW"
			intent_label.text = "Legacy Greenvale route context"
			controls_label.text = "[LEFT / ESC] Return to Map"


func _mandate_action_label() -> String:
	match committed_direction:
		"expand":
			return "Commission Basin Survey"
		"frontier":
			return "Establish Frontier Watch"
		_:
			return "Dispatch Trade Delegation"

func _mandate_locus_label() -> String:
	match committed_direction:
		"expand":
			return "North Ridge"
		"frontier":
			return "Gilded Crossing"
		_:
			return "East Route"

func _emit_action(action_name: String) -> void:
	var event := InputEventAction.new()
	event.action = action_name
	event.pressed = true
	Input.parse_input_event(event)
	event = InputEventAction.new()
	event.action = action_name
	event.pressed = false
	Input.parse_input_event(event)

func _process(_delta: float) -> void:
	_animate_living_capital_presentation(_delta)
	if not automated_input_mode:
		super(_delta)
		return
	automated_frame += 1
	if automated_frame == 120:
		_emit_action("ui_accept")
	elif automated_frame == 270:
		_emit_action("ui_right")
	elif automated_frame == 420:
		_emit_action("ui_accept")
	elif automated_frame == 570:
		_emit_action("ui_right")
	elif automated_frame == 690:
		_emit_action("ui_accept")
	elif automated_frame == 810:
		_emit_action("ui_accept")
	elif automated_frame == 930:
		_emit_action("ui_left")
	elif automated_frame == 1050:
		_emit_action("ui_accept")
	elif automated_frame == 1170:
		_emit_action("ui_left")
	elif automated_frame == 1290:
		_emit_action("ui_right")
	elif automated_frame == 1410:
		_emit_action("ui_right")
	elif automated_frame == 1530:
		_emit_action("ui_accept")
	elif automated_frame == 1650:
		_emit_action("ui_left")
	elif automated_frame == 1770:
		_emit_action("ui_left")
	elif automated_frame == 1890:
		_emit_action("ui_right")
	elif automated_frame == 2010:
		_emit_action("ui_right")
	elif automated_frame == 2130:
		_emit_action("ui_left")
	elif automated_frame == 2250:
		_emit_action("ui_left")
	elif automated_frame == 2370:
		_emit_action("ui_right")
	elif automated_frame == 2490:
		_emit_action("ui_right")
	elif automated_frame == 2610:
		_emit_action("ui_accept")
	elif automated_frame == 2730:
		_emit_action("ui_left")
	elif automated_frame == 2850:
		_emit_action("ui_left")
	elif automated_frame == 2970:
		_emit_action("ui_right")
	elif automated_frame == 3090:
		_emit_action("ui_right")
	elif automated_frame == 3210:
		_emit_action("ui_left")
	elif automated_frame == 3330:
		_emit_action("ui_left")
	elif automated_frame == 3450:
		_emit_action("ui_accept")
	elif automated_frame == 3570 and automated_direction in ["expand", "frontier"]:
		_emit_action("ui_down")
	elif automated_frame == 3690 and automated_direction in ["expand", "frontier"]:
		_emit_action("ui_down")
	elif automated_frame == 3810 and automated_direction == "expand":
		_emit_action("ui_up")
	elif automated_frame == 3930:
		_emit_action("ui_accept")
	elif automated_frame == 4050:
		_emit_action("ui_right")
	elif automated_frame == 4170:
		_emit_action("ui_right")
	elif automated_frame == 4290:
		_emit_action("ui_accept")
	elif automated_frame == 4410:
		_emit_action("ui_left")
	elif automated_frame == 4470:
		_emit_action("ui_left")
	elif automated_frame == 4530:
		_emit_action("ui_right")
	elif automated_frame == 4590:
		_emit_action("ui_right")
	elif automated_frame == 4650:
		_emit_action("ui_accept")
	elif automated_frame == 4710:
		_emit_action("ui_left")
	elif automated_frame == 4770:
		_emit_action("ui_left")
	elif automated_frame == 4830:
		_emit_action("ui_accept")
	elif automated_frame == 4890:
		_emit_action("ui_right")
	elif automated_frame == 4950:
		_emit_action("ui_right")
	elif automated_frame == 5010 and automated_crisis_response == "keep_east_bridge_open":
		_emit_action("ui_down")
	elif automated_frame == 5070:
		_emit_action("ui_accept")
	elif automated_frame == 5130:
		_emit_action("ui_left")
	elif automated_frame == 5190:
		_emit_action("ui_left")
	elif automated_frame == 5250:
		_emit_action("ui_accept")
	elif automated_frame == 5310:
		_emit_action("ui_right")
	elif automated_frame == 5370:
		_emit_action("ui_right")
	elif automated_frame == 5430 and automated_rival_response == "negotiate_passage":
		_emit_action("ui_down")
	elif automated_frame == 5490:
		_emit_action("ui_accept")
	elif automated_frame == 5550:
		_emit_action("ui_left")
	elif automated_frame == 5610:
		_emit_action("ui_left")
	elif automated_frame == 5670:
		_emit_action("ui_accept")
	elif automated_frame == 5730:
		_emit_action("ui_right")
	elif automated_frame == 5790:
		_emit_action("ui_right")
	elif automated_frame == 5850:
		_emit_action("ui_accept")
	elif automated_frame == 5910:
		_emit_action("ui_left")
	elif automated_frame == 5970:
		_emit_action("ui_left")
	elif automated_frame == 6030:
		_emit_action("ui_accept")
	elif automated_frame == 6090:
		_emit_action("ui_right")
	elif automated_frame == 6150:
		_emit_action("ui_accept")
	elif automated_frame == 6210:
		_emit_action("ui_accept")
	elif automated_frame == 6270:
		_emit_action("ui_right")
	elif automated_frame == 6330:
		_emit_action("ui_left")
	elif automated_frame == 6390:
		_emit_action("ui_left")
	elif automated_frame == 6450:
		_emit_action("ui_accept")
	elif automated_frame == 6510:
		_emit_action("ui_right")
	elif automated_frame == 6570:
		_emit_action("ui_right")
	elif automated_frame == 6630:
		_emit_action("ui_accept")
	elif automated_frame == 6690:
		_emit_action("ui_right")
	elif automated_frame == 6750:
		_emit_action("ui_left")
	elif automated_frame == 6810:
		_emit_action("ui_left")
	elif automated_frame >= 6870:
		print("PLAYABLE_AURELIAN_INPUT_SEQUENCE_COMPLETE=6870")
		get_tree().quit(0)