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
	"village_claimed",
	"village_founded",
]
const VALID_INTENTS := ["none", "east_trade"]

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
	}

static func load_session(path: String = NATIVE_PATH) -> Dictionary:
	if OS.has_feature("web"):
		return _load_web()
	return _load_native(path)

static func save_session(state: String, intent: String, path: String = NATIVE_PATH, settlement_founded: bool = false) -> Dictionary:
	if not _is_valid_pair(state, intent):
		return fallback("invalid_data", _adapter_name())
	if state == "village_founded" and not settlement_founded:
		return fallback("invalid_data", _adapter_name())
	var payload := {
		"schema": SCHEMA,
		"version": VERSION,
		"selected_intent": intent,
		"entry_state": state,
		"settlement_founded": settlement_founded,
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
	if state == "village_founded" and not settlement_founded:
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