extends RefCounted

const SCHEMA := "pixel_nations.aurelian_session"
const VERSION := 2
const NATIVE_PATH := "user://aurelian-session-v2.json"
const WEB_KEY := "pixel_nations.aurelian_session.v2"
const WEB_PROBE_KEY := "pixel_nations.aurelian_session.v2.probe"
const VALID_STATES := [
	"world_neutral",
	"world_trade_selected",
	"map_east_route",
	"village_route_context",
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
		"world_first_rival_countermove
map_first_rival_countermove_east_bridge
map_first_rival_countermove_greenvale
village_first_rival_response_pending
village_first_rival_response_stand_firm
map_first_rival_response_stand_firm
world_first_rival_response_stand_firm
village_first_rival_response_negotiate_passage
map_first_rival_response_negotiate_passage
world_first_rival_response_negotiate_passage",
	"village_claimed",
	"village_founded",
	"village_developed",
]
const VALID_INTENTS := ["none", "east_trade"]
const VALID_NATIONAL_DIRECTIONS := ["none", "trade", "expand", "frontier"]
const VALID_IMPERIAL_CRISES := ["none", "river_surge"]
const VALID_IMPERIAL_CRISIS_RESPONSES := ["none", "shield_greenvale", "keep_east_bridge_open"]
const VALID_FIRST_RIVAL_COUNTERMOVE_RESPONSES := ["none", "stand_firm", "negotiate_passage"]

static func fallback(status: String, adapter: String) -> Dictionary:
	return {
		"ok": false,
		"status": status,
		"adapter": adapter,
		"schema": SCHEMA,
		"version": VERSION,
		"selected_intent": "none",
		"entry_state": "world_neutral",
		"settlement_founded": false,
		"settlement_developed": false,
		"route_connected": false,
		"caravan_dispatched": false,
		"city_chartered": false,
		"nation_founded": false,
		"national_direction": "none",
		"national_mandate_started": false,
		"empire_proclaimed": false,
		"imperial_crisis": "none",
		"imperial_crisis_response": "none",
		"first_rival_countermove_response": "none",
	}

static func load_session(path: String = NATIVE_PATH) -> Dictionary:
	if OS.has_feature("web"):
		return _load_web()
	return _load_native(path)

static func save_session(state: String, intent: String, path: String = NATIVE_PATH, settlement_founded: bool = false, settlement_developed: bool = false, route_connected: bool = false, caravan_dispatched: bool = false, city_chartered: bool = false, nation_founded: bool = false, national_direction: String = "none", national_mandate_started: bool = false, empire_proclaimed: bool = false, imperial_crisis: String = "none", imperial_crisis_response: String = "none", first_rival_countermove_response: String = "none") -> Dictionary:
	if not _is_valid_pair(state, intent):
		return fallback("invalid_data", _adapter_name())
	if not VALID_NATIONAL_DIRECTIONS.has(national_direction):
		return fallback("invalid_data", _adapter_name())
	if national_direction != "none" and not nation_founded:
		return fallback("invalid_data", _adapter_name())
	if national_mandate_started and national_direction == "none":
		return fallback("invalid_data", _adapter_name())
	if empire_proclaimed and not national_mandate_started:
		return fallback("invalid_data", _adapter_name())
	if not VALID_IMPERIAL_CRISES.has(imperial_crisis) or not VALID_IMPERIAL_CRISIS_RESPONSES.has(imperial_crisis_response):
		return fallback("invalid_data", _adapter_name())
	if imperial_crisis != "none" and not empire_proclaimed:
		return fallback("invalid_data", _adapter_name())
	if imperial_crisis_response != "none" and (imperial_crisis != "river_surge" or not empire_proclaimed):
		return fallback("invalid_data", _adapter_name())
	if imperial_crisis == "none" and imperial_crisis_response != "none":
		return fallback("invalid_data", _adapter_name())
	if not VALID_FIRST_RIVAL_COUNTERMOVE_RESPONSES.has(first_rival_countermove_response):
		return fallback("invalid_data", _adapter_name())
	if first_rival_countermove_response != "none" and imperial_crisis_response == "none":
		return fallback("invalid_data", _adapter_name())
	if state in ["village_founded", "village_developed"] and not settlement_founded:
		return fallback("invalid_data", _adapter_name())
	if state == "village_developed" and not settlement_developed:
		return fallback("invalid_data", _adapter_name())
	if settlement_developed and not settlement_founded:
		return fallback("invalid_data", _adapter_name())
	if state in ["map_east_route_connected", "world_trade_route_active"] and not route_connected:
		return fallback("invalid_data", _adapter_name())
	if route_connected and not settlement_developed:
		return fallback("invalid_data", _adapter_name())
	if state in ["village_trade_dispatched", "map_east_route_in_use", "world_first_trade_underway"] and not caravan_dispatched:
		return fallback("invalid_data", _adapter_name())
	if caravan_dispatched and not route_connected:
		return fallback("invalid_data", _adapter_name())
	if city_chartered and not caravan_dispatched:
		return fallback("invalid_data", _adapter_name())
	if nation_founded and not city_chartered:
		return fallback("invalid_data", _adapter_name())
	var city_states := ["village_city_chartered", "map_greenvale_city", "world_first_city_recognized"]
	var nation_states := ["world_first_nation_founded", "map_aurelian_homeland", "village_greenvale_capital", "village_national_mandate_started", "map_national_mandate_active", "world_national_mandate_underway", "village_aurelian_imperial_capital", "map_aurelian_imperial_heartland", "world_first_empire_proclaimed", "world_river_surge_crisis", "map_river_surge_response_loci", "village_river_surge_response_pending", "village_aurelian_imperial_capital_greenvale_shielded", "village_aurelian_imperial_capital_bridge_response", "map_aurelian_imperial_heartland_greenvale_response", "map_aurelian_imperial_heartland_bridge_response", "world_aurelian_river_surge_greenvale_response", "world_aurelian_river_surge_bridge_response", "world_first_rival_countermove", "map_first_rival_countermove_east_bridge", "map_first_rival_countermove_greenvale", "village_first_rival_response_pending", "village_first_rival_response_stand_firm", "map_first_rival_response_stand_firm", "world_first_rival_response_stand_firm", "village_first_rival_response_negotiate_passage", "map_first_rival_response_negotiate_passage", "world_first_rival_response_negotiate_passage"]
	if state in city_states and not city_chartered:
		return fallback("invalid_data", _adapter_name())
	if state in nation_states and not nation_founded:
		return fallback("invalid_data", _adapter_name())
	var mandate_states := ["village_national_mandate_started", "map_national_mandate_active", "world_national_mandate_underway", "village_aurelian_imperial_capital", "map_aurelian_imperial_heartland", "world_first_empire_proclaimed", "world_river_surge_crisis", "map_river_surge_response_loci", "village_river_surge_response_pending", "village_aurelian_imperial_capital_greenvale_shielded", "village_aurelian_imperial_capital_bridge_response", "map_aurelian_imperial_heartland_greenvale_response", "map_aurelian_imperial_heartland_bridge_response", "world_aurelian_river_surge_greenvale_response", "world_aurelian_river_surge_bridge_response", "world_first_rival_countermove", "map_first_rival_countermove_east_bridge", "map_first_rival_countermove_greenvale", "village_first_rival_response_pending", "village_first_rival_response_stand_firm", "map_first_rival_response_stand_firm", "world_first_rival_response_stand_firm", "village_first_rival_response_negotiate_passage", "map_first_rival_response_negotiate_passage", "world_first_rival_response_negotiate_passage"]
	if (state in mandate_states) != national_mandate_started:
		return fallback("invalid_data", _adapter_name())
	var empire_states := ["village_aurelian_imperial_capital", "map_aurelian_imperial_heartland", "world_first_empire_proclaimed", "world_river_surge_crisis", "map_river_surge_response_loci", "village_river_surge_response_pending", "village_aurelian_imperial_capital_greenvale_shielded", "village_aurelian_imperial_capital_bridge_response", "map_aurelian_imperial_heartland_greenvale_response", "map_aurelian_imperial_heartland_bridge_response", "world_aurelian_river_surge_greenvale_response", "world_aurelian_river_surge_bridge_response", "world_first_rival_countermove", "map_first_rival_countermove_east_bridge", "map_first_rival_countermove_greenvale", "village_first_rival_response_pending", "village_first_rival_response_stand_firm", "map_first_rival_response_stand_firm", "world_first_rival_response_stand_firm", "village_first_rival_response_negotiate_passage", "map_first_rival_response_negotiate_passage", "world_first_rival_response_negotiate_passage"]
	if (state in empire_states) != empire_proclaimed:
		return fallback("invalid_data", _adapter_name())
	var crisis_pending_states := ["world_river_surge_crisis", "map_river_surge_response_loci", "village_river_surge_response_pending"]
	var greenvale_response_states := ["village_aurelian_imperial_capital_greenvale_shielded", "map_aurelian_imperial_heartland_greenvale_response", "world_aurelian_river_surge_greenvale_response"]
	var bridge_response_states := ["village_aurelian_imperial_capital_bridge_response", "map_aurelian_imperial_heartland_bridge_response", "world_aurelian_river_surge_bridge_response"]
	var rival_pending_states := ["world_first_rival_countermove", "map_first_rival_countermove_east_bridge", "map_first_rival_countermove_greenvale", "village_first_rival_response_pending"]
	var rival_stand_firm_states := ["village_first_rival_response_stand_firm", "map_first_rival_response_stand_firm", "world_first_rival_response_stand_firm"]
	var rival_negotiate_states := ["village_first_rival_response_negotiate_passage", "map_first_rival_response_negotiate_passage", "world_first_rival_response_negotiate_passage"]
	var rival_countermove_states := rival_pending_states + rival_stand_firm_states + rival_negotiate_states
	if state in crisis_pending_states and (imperial_crisis != "river_surge" or imperial_crisis_response != "none"):
		return fallback("invalid_data", _adapter_name())
	if state in greenvale_response_states and imperial_crisis_response != "shield_greenvale":
		return fallback("invalid_data", _adapter_name())
	if state in bridge_response_states and imperial_crisis_response != "keep_east_bridge_open":
		return fallback("invalid_data", _adapter_name())
	if imperial_crisis_response == "shield_greenvale" and state not in greenvale_response_states and state not in rival_countermove_states:
		return fallback("invalid_data", _adapter_name())
	if imperial_crisis_response == "keep_east_bridge_open" and state not in bridge_response_states and state not in rival_countermove_states:
		return fallback("invalid_data", _adapter_name())
	if state in rival_pending_states and first_rival_countermove_response != "none":
		return fallback("invalid_data", _adapter_name())
	if state in rival_stand_firm_states and first_rival_countermove_response != "stand_firm":
		return fallback("invalid_data", _adapter_name())
	if state in rival_negotiate_states and first_rival_countermove_response != "negotiate_passage":
		return fallback("invalid_data", _adapter_name())
	if first_rival_countermove_response == "stand_firm" and state not in rival_stand_firm_states:
		return fallback("invalid_data", _adapter_name())
	if first_rival_countermove_response == "negotiate_passage" and state not in rival_negotiate_states:
		return fallback("invalid_data", _adapter_name())
	if nation_founded and state not in nation_states:
		return fallback("invalid_data", _adapter_name())
	if city_chartered and not nation_founded and state not in city_states:
		return fallback("invalid_data", _adapter_name())
	if caravan_dispatched and not city_chartered and state not in ["village_trade_dispatched", "map_east_route_in_use", "world_first_trade_underway"]:
		return fallback("invalid_data", _adapter_name())
	var payload := {
		"schema": SCHEMA,
		"version": VERSION,
		"selected_intent": intent,
		"entry_state": state,
		"settlement_founded": settlement_founded,
		"settlement_developed": settlement_developed,
		"route_connected": route_connected,
		"caravan_dispatched": caravan_dispatched,
		"city_chartered": city_chartered,
		"nation_founded": nation_founded,
		"national_direction": national_direction,
		"national_mandate_started": national_mandate_started,
		"empire_proclaimed": empire_proclaimed,
		"imperial_crisis": imperial_crisis,
		"imperial_crisis_response": imperial_crisis_response,
		"first_rival_countermove_response": first_rival_countermove_response,
		"saved_at_utc": Time.get_datetime_string_from_system(true),
	}
	var payload_text := JSON.stringify(payload)
	if OS.has_feature("web"):
		return _save_web(payload_text)
	return _save_native(payload_text, path)

static func _adapter_name() -> String:
	return "web_local_storage" if OS.has_feature("web") else "native_file_access"

static func _is_valid_pair(state: String, intent: String) -> bool:
	if not VALID_STATES.has(state) or not VALID_INTENTS.has(intent):
		return false
	if state == "world_neutral":
		return intent == "none"
	return intent == "east_trade"

static func _validate_payload_text(text: String, adapter: String) -> Dictionary:
	var payload = JSON.parse_string(text)
	if not payload is Dictionary:
		return fallback("malformed", adapter)
	var session := payload as Dictionary
	if String(session.get("schema", "")) != SCHEMA:
		return fallback("unknown_schema", adapter)
	if int(session.get("version", -1)) != VERSION:
		return fallback("unsupported_version", adapter)
	var state := String(session.get("entry_state", ""))
	var intent := String(session.get("selected_intent", ""))
	if not _is_valid_pair(state, intent):
		return fallback("invalid_value", adapter)
	var settlement_founded := bool(session.get("settlement_founded", false))
	var settlement_developed := bool(session.get("settlement_developed", false))
	var route_connected := bool(session.get("route_connected", false))
	var caravan_dispatched := bool(session.get("caravan_dispatched", false))
	var city_chartered := bool(session.get("city_chartered", false))
	var nation_founded := bool(session.get("nation_founded", false))
	var national_direction := String(session.get("national_direction", "none"))
	var national_mandate_started := bool(session.get("national_mandate_started", false))
	var empire_proclaimed := bool(session.get("empire_proclaimed", false))
	var imperial_crisis := String(session.get("imperial_crisis", "none"))
	var imperial_crisis_response := String(session.get("imperial_crisis_response", "none"))
	var first_rival_countermove_response := String(session.get("first_rival_countermove_response", "none"))
	if not VALID_NATIONAL_DIRECTIONS.has(national_direction):
		return fallback("invalid_value", adapter)
	if national_direction != "none" and not nation_founded:
		return fallback("invalid_value", adapter)
	if national_mandate_started and national_direction == "none":
		return fallback("invalid_value", adapter)
	if empire_proclaimed and not national_mandate_started:
		return fallback("invalid_value", adapter)
	if not VALID_IMPERIAL_CRISES.has(imperial_crisis) or not VALID_IMPERIAL_CRISIS_RESPONSES.has(imperial_crisis_response):
		return fallback("invalid_value", adapter)
	if imperial_crisis != "none" and not empire_proclaimed:
		return fallback("invalid_value", adapter)
	if imperial_crisis_response != "none" and (imperial_crisis != "river_surge" or not empire_proclaimed):
		return fallback("invalid_value", adapter)
	if imperial_crisis == "none" and imperial_crisis_response != "none":
		return fallback("invalid_value", adapter)
	if not VALID_FIRST_RIVAL_COUNTERMOVE_RESPONSES.has(first_rival_countermove_response):
		return fallback("invalid_value", adapter)
	if first_rival_countermove_response != "none" and imperial_crisis_response == "none":
		return fallback("invalid_value", adapter)
	if state in ["village_founded", "village_developed"] and not settlement_founded:
		return fallback("invalid_value", adapter)
	if state == "village_developed" and not settlement_developed:
		return fallback("invalid_value", adapter)
	if settlement_developed and not settlement_founded:
		return fallback("invalid_value", adapter)
	if state in ["map_east_route_connected", "world_trade_route_active"] and not route_connected:
		return fallback("invalid_value", adapter)
	if route_connected and not settlement_developed:
		return fallback("invalid_value", adapter)
	if state in ["village_trade_dispatched", "map_east_route_in_use", "world_first_trade_underway"] and not caravan_dispatched:
		return fallback("invalid_value", adapter)
	if caravan_dispatched and not route_connected:
		return fallback("invalid_value", adapter)
	if city_chartered and not caravan_dispatched:
		return fallback("invalid_value", adapter)
	if nation_founded and not city_chartered:
		return fallback("invalid_value", adapter)
	var city_states := ["village_city_chartered", "map_greenvale_city", "world_first_city_recognized"]
	var nation_states := ["world_first_nation_founded", "map_aurelian_homeland", "village_greenvale_capital", "village_national_mandate_started", "map_national_mandate_active", "world_national_mandate_underway", "village_aurelian_imperial_capital", "map_aurelian_imperial_heartland", "world_first_empire_proclaimed", "world_river_surge_crisis", "map_river_surge_response_loci", "village_river_surge_response_pending", "village_aurelian_imperial_capital_greenvale_shielded", "village_aurelian_imperial_capital_bridge_response", "map_aurelian_imperial_heartland_greenvale_response", "map_aurelian_imperial_heartland_bridge_response", "world_aurelian_river_surge_greenvale_response", "world_aurelian_river_surge_bridge_response", "world_first_rival_countermove", "map_first_rival_countermove_east_bridge", "map_first_rival_countermove_greenvale", "village_first_rival_response_pending", "village_first_rival_response_stand_firm", "map_first_rival_response_stand_firm", "world_first_rival_response_stand_firm", "village_first_rival_response_negotiate_passage", "map_first_rival_response_negotiate_passage", "world_first_rival_response_negotiate_passage"]
	if state in city_states and not city_chartered:
		return fallback("invalid_value", adapter)
	if state in nation_states and not nation_founded:
		return fallback("invalid_value", adapter)
	var mandate_states := ["village_national_mandate_started", "map_national_mandate_active", "world_national_mandate_underway", "village_aurelian_imperial_capital", "map_aurelian_imperial_heartland", "world_first_empire_proclaimed", "world_river_surge_crisis", "map_river_surge_response_loci", "village_river_surge_response_pending", "village_aurelian_imperial_capital_greenvale_shielded", "village_aurelian_imperial_capital_bridge_response", "map_aurelian_imperial_heartland_greenvale_response", "map_aurelian_imperial_heartland_bridge_response", "world_aurelian_river_surge_greenvale_response", "world_aurelian_river_surge_bridge_response", "world_first_rival_countermove", "map_first_rival_countermove_east_bridge", "map_first_rival_countermove_greenvale", "village_first_rival_response_pending", "village_first_rival_response_stand_firm", "map_first_rival_response_stand_firm", "world_first_rival_response_stand_firm", "village_first_rival_response_negotiate_passage", "map_first_rival_response_negotiate_passage", "world_first_rival_response_negotiate_passage"]
	if (state in mandate_states) != national_mandate_started:
		return fallback("invalid_value", adapter)
	var empire_states := ["village_aurelian_imperial_capital", "map_aurelian_imperial_heartland", "world_first_empire_proclaimed", "world_river_surge_crisis", "map_river_surge_response_loci", "village_river_surge_response_pending", "village_aurelian_imperial_capital_greenvale_shielded", "village_aurelian_imperial_capital_bridge_response", "map_aurelian_imperial_heartland_greenvale_response", "map_aurelian_imperial_heartland_bridge_response", "world_aurelian_river_surge_greenvale_response", "world_aurelian_river_surge_bridge_response", "world_first_rival_countermove", "map_first_rival_countermove_east_bridge", "map_first_rival_countermove_greenvale", "village_first_rival_response_pending", "village_first_rival_response_stand_firm", "map_first_rival_response_stand_firm", "world_first_rival_response_stand_firm", "village_first_rival_response_negotiate_passage", "map_first_rival_response_negotiate_passage", "world_first_rival_response_negotiate_passage"]
	if (state in empire_states) != empire_proclaimed:
		return fallback("invalid_value", adapter)
	var crisis_pending_states := ["world_river_surge_crisis", "map_river_surge_response_loci", "village_river_surge_response_pending"]
	var greenvale_response_states := ["village_aurelian_imperial_capital_greenvale_shielded", "map_aurelian_imperial_heartland_greenvale_response", "world_aurelian_river_surge_greenvale_response"]
	var bridge_response_states := ["village_aurelian_imperial_capital_bridge_response", "map_aurelian_imperial_heartland_bridge_response", "world_aurelian_river_surge_bridge_response"]
	var rival_pending_states := ["world_first_rival_countermove", "map_first_rival_countermove_east_bridge", "map_first_rival_countermove_greenvale", "village_first_rival_response_pending"]
	var rival_stand_firm_states := ["village_first_rival_response_stand_firm", "map_first_rival_response_stand_firm", "world_first_rival_response_stand_firm"]
	var rival_negotiate_states := ["village_first_rival_response_negotiate_passage", "map_first_rival_response_negotiate_passage", "world_first_rival_response_negotiate_passage"]
	var rival_countermove_states := rival_pending_states + rival_stand_firm_states + rival_negotiate_states
	if state in crisis_pending_states and (imperial_crisis != "river_surge" or imperial_crisis_response != "none"):
		return fallback("invalid_value", adapter)
	if state in greenvale_response_states and imperial_crisis_response != "shield_greenvale":
		return fallback("invalid_value", adapter)
	if state in bridge_response_states and imperial_crisis_response != "keep_east_bridge_open":
		return fallback("invalid_value", adapter)
	if imperial_crisis_response == "shield_greenvale" and state not in greenvale_response_states and state not in rival_countermove_states:
		return fallback("invalid_value", adapter)
	if imperial_crisis_response == "keep_east_bridge_open" and state not in bridge_response_states and state not in rival_countermove_states:
		return fallback("invalid_value", adapter)
	if state in rival_pending_states and first_rival_countermove_response != "none":
		return fallback("invalid_value", adapter)
	if state in rival_stand_firm_states and first_rival_countermove_response != "stand_firm":
		return fallback("invalid_value", adapter)
	if state in rival_negotiate_states and first_rival_countermove_response != "negotiate_passage":
		return fallback("invalid_value", adapter)
	if first_rival_countermove_response == "stand_firm" and state not in rival_stand_firm_states:
		return fallback("invalid_value", adapter)
	if first_rival_countermove_response == "negotiate_passage" and state not in rival_negotiate_states:
		return fallback("invalid_value", adapter)
	if nation_founded and state not in nation_states:
		return fallback("invalid_value", adapter)
	if city_chartered and not nation_founded and state not in city_states:
		return fallback("invalid_value", adapter)
	if caravan_dispatched and not city_chartered and state not in ["village_trade_dispatched", "map_east_route_in_use", "world_first_trade_underway"]:
		return fallback("invalid_value", adapter)
	return {
		"ok": true,
		"status": "restored",
		"adapter": adapter,
		"schema": SCHEMA,
		"version": VERSION,
		"selected_intent": intent,
		"entry_state": state,
		"settlement_founded": settlement_founded,
		"settlement_developed": settlement_developed,
		"route_connected": route_connected,
		"caravan_dispatched": caravan_dispatched,
		"city_chartered": city_chartered,
		"nation_founded": nation_founded,
		"national_direction": national_direction,
		"national_mandate_started": national_mandate_started,
		"empire_proclaimed": empire_proclaimed,
		"imperial_crisis": imperial_crisis,
		"imperial_crisis_response": imperial_crisis_response,
		"first_rival_countermove_response": first_rival_countermove_response,
		"saved_at_utc": String(session.get("saved_at_utc", "")),
	}

static func _load_native(path: String) -> Dictionary:
	if not FileAccess.file_exists(path):
		return fallback("missing", "native_file_access")
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return fallback("unreadable", "native_file_access")
	var text := file.get_as_text()
	file = null
	return _validate_payload_text(text, "native_file_access")

static func _save_native(payload_text: String, path: String) -> Dictionary:
	var temporary := path + ".tmp"
	var backup := path + ".bak"
	var file := FileAccess.open(temporary, FileAccess.WRITE)
	if file == null:
		return fallback("write_open_failed", "native_file_access")
	file.store_string(payload_text)
	file.flush()
	file = null
	if FileAccess.file_exists(backup):
		DirAccess.remove_absolute(backup)
	if FileAccess.file_exists(path):
		var backup_error := DirAccess.rename_absolute(path, backup)
		if backup_error != OK:
			DirAccess.remove_absolute(temporary)
			return fallback("backup_failed", "native_file_access")
	var replace_error := DirAccess.rename_absolute(temporary, path)
	if replace_error != OK:
		if FileAccess.file_exists(backup):
			DirAccess.rename_absolute(backup, path)
		return fallback("replace_failed", "native_file_access")
	if FileAccess.file_exists(backup):
		DirAccess.remove_absolute(backup)
	return {
		"ok": true,
		"status": "stored",
		"adapter": "native_file_access",
	}

static func javascript_string_literal(value: String) -> String:
	return JSON.stringify(value)

static func _web_eval_json(code: String) -> Dictionary:
	if not OS.has_feature("web"):
		return fallback("bridge_unavailable", "web_local_storage")
	var raw = JavaScriptBridge.eval(code, true)
	if not raw is String:
		return fallback("bridge_result_invalid", "web_local_storage")
	var parsed = JSON.parse_string(String(raw))
	if parsed is Dictionary:
		return parsed as Dictionary
	return fallback("bridge_result_malformed", "web_local_storage")

static func _probe_web_storage() -> Dictionary:
	var key_literal := javascript_string_literal(WEB_PROBE_KEY)
	var code := "(function(){try{var s=window.localStorage;var k=%s;var v='probe';s.setItem(k,v);var ok=s.getItem(k)===v;s.removeItem(k);return JSON.stringify({ok:ok,status:ok?'available':'probe_failed',adapter:'web_local_storage'});}catch(e){return JSON.stringify({ok:false,status:'unavailable',adapter:'web_local_storage'});}})()" % key_literal
	return _web_eval_json(code)

static func _load_web() -> Dictionary:
	var probe := _probe_web_storage()
	if not bool(probe.get("ok", false)):
		return fallback(String(probe.get("status", "unavailable")), "web_local_storage")
	var key_literal := javascript_string_literal(WEB_KEY)
	var code := "(function(){try{var v=window.localStorage.getItem(%s);return JSON.stringify({ok:true,status:v===null?'missing':'loaded',value:v,adapter:'web_local_storage'});}catch(e){return JSON.stringify({ok:false,status:'unavailable',adapter:'web_local_storage'});}})()" % key_literal
	var result := _web_eval_json(code)
	if not bool(result.get("ok", false)):
		return fallback(String(result.get("status", "unavailable")), "web_local_storage")
	if result.get("value", null) == null:
		return fallback("missing", "web_local_storage")
	return _validate_payload_text(String(result.get("value", "")), "web_local_storage")

static func _save_web(payload_text: String) -> Dictionary:
	var probe := _probe_web_storage()
	if not bool(probe.get("ok", false)):
		return fallback(String(probe.get("status", "unavailable")), "web_local_storage")
	var key_literal := javascript_string_literal(WEB_KEY)
	var value_literal := javascript_string_literal(payload_text)
	var code := "(function(){try{var s=window.localStorage;var k=%s;var v=%s;s.setItem(k,v);var ok=s.getItem(k)===v;return JSON.stringify({ok:ok,status:ok?'stored':'verify_failed',adapter:'web_local_storage'});}catch(e){return JSON.stringify({ok:false,status:'unavailable',adapter:'web_local_storage'});}})()" % [key_literal, value_literal]
	var result := _web_eval_json(code)
	if bool(result.get("ok", false)):
		return result
	return fallback(String(result.get("status", "unavailable")), "web_local_storage")