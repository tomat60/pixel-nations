extends RefCounted

const SCHEMA := "pixel_nations.aurelian_session"
const VERSION := 1
const SAVE_PATH := "user://aurelian-session-v1.json"
const VALID_STATES := [
	"world_neutral",
	"world_trade_selected",
	"map_east_route",
	"village_route_context",
]
const VALID_INTENTS := ["none", "east_trade"]

static func fallback(status: String) -> Dictionary:
	return {
		"status": status,
		"schema": SCHEMA,
		"version": VERSION,
		"selected_intent": "none",
		"entry_state": "world_neutral",
	}

static func load_session(path: String = SAVE_PATH) -> Dictionary:
	if not FileAccess.file_exists(path):
		return fallback("missing")
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return fallback("unreadable")
	var text := file.get_as_text()
	file = null
	var payload = JSON.parse_string(text)
	if not payload is Dictionary:
		return fallback("malformed")
	var session := payload as Dictionary
	if String(session.get("schema", "")) != SCHEMA:
		return fallback("unknown_schema")
	if int(session.get("version", -1)) != VERSION:
		return fallback("unsupported_version")
	var state := String(session.get("entry_state", ""))
	var intent := String(session.get("selected_intent", ""))
	if not VALID_STATES.has(state) or not VALID_INTENTS.has(intent):
		return fallback("invalid_value")
	if state == "world_neutral" and intent != "none":
		return fallback("invalid_pair")
	if state != "world_neutral" and intent != "east_trade":
		return fallback("invalid_pair")
	return {
		"status": "restored",
		"schema": SCHEMA,
		"version": VERSION,
		"selected_intent": intent,
		"entry_state": state,
		"saved_at_utc": String(session.get("saved_at_utc", "")),
	}

static func save_session(state: String, intent: String, path: String = SAVE_PATH) -> Error:
	if not VALID_STATES.has(state) or not VALID_INTENTS.has(intent):
		return ERR_INVALID_DATA
	if (state == "world_neutral" and intent != "none") or (state != "world_neutral" and intent != "east_trade"):
		return ERR_INVALID_DATA
	var payload := {
		"schema": SCHEMA,
		"version": VERSION,
		"selected_intent": intent,
		"entry_state": state,
		"saved_at_utc": Time.get_datetime_string_from_system(true),
	}
	var temporary := path + ".tmp"
	var backup := path + ".bak"
	var file := FileAccess.open(temporary, FileAccess.WRITE)
	if file == null:
		return FileAccess.get_open_error()
	file.store_string(JSON.stringify(payload))
	file.flush()
	file = null
	if FileAccess.file_exists(backup):
		DirAccess.remove_absolute(backup)
	if FileAccess.file_exists(path):
		var backup_error := DirAccess.rename_absolute(path, backup)
		if backup_error != OK:
			DirAccess.remove_absolute(temporary)
			return backup_error
	var replace_error := DirAccess.rename_absolute(temporary, path)
	if replace_error != OK:
		if FileAccess.file_exists(backup):
			DirAccess.rename_absolute(backup, path)
		return replace_error
	if FileAccess.file_exists(backup):
		DirAccess.remove_absolute(backup)
	return OK
