extends SceneTree

const MANIFEST_PATH := "res://scenes/aurelian/directional_empire_identity_v1_manifest.json"
const CONTROLLER_PATH := "res://scenes/aurelian/playable_aurelian_entry_v1.gd"
const PERSISTENCE_PATH := "res://scenes/aurelian/aurelian_session_persistence_v2.gd"

var failures: Array[String] = []

func _initialize() -> void:
	var manifest := _read_json(MANIFEST_PATH)
	var controller := _read_text(CONTROLLER_PATH)
	var persistence := _read_text(PERSISTENCE_PATH)
	_check(String(manifest.get("contract", "")) == "GODOT_AURELIAN_DIRECTIONAL_EMPIRE_IDENTITY_V1", "contract")
	_check(int(manifest.get("issue", 0)) == 522, "issue")
	_check(String(manifest.get("authority_baseline_sha", "")) == "d7984bb1fe16247263bb54316f28b6f22181b964", "authority_baseline")
	_check(String(manifest.get("product_baseline_sha", "")) == "ebdc103a3f2a9ff4c8a495e9547a084ae9a6a715", "product_baseline")
	var proclamation: Dictionary = manifest.get("proclamation", {}) as Dictionary
	_check(String(proclamation.get("action", "")) == "Proclaim Aurelian Empire", "action")
	_check(String(proclamation.get("event", "")) == "AURELIAN_FIRST_EMPIRE_PROCLAMATION=AURELIAN", "event")
	_check(controller.count("AURELIAN_FIRST_EMPIRE_PROCLAMATION=AURELIAN") == 1, "single_event_site")
	_check(controller.contains("func _configure_directional_empire_glyph"), "glyph_configurator")
	_check(controller.contains("TorusMesh.new()"), "trade_ring")
	_check(controller.contains("radial_segments = 3"), "expand_triangle")
	_check(controller.contains("frontier_shield := BoxMesh.new()"), "frontier_shield")
	_check(controller.contains("glyph.rotation.z = PI / 4.0"), "frontier_diamond")
	for node_name in ["ImperialCapitalDirectionGlyph", "ImperialHeartlandDirectionGlyph", "ImperialWorldDirectionGlyph"]:
		_check(controller.contains(node_name), node_name)
	for label_format in ["%s IMPERIAL CAPITAL", "%s IMPERIAL HEARTLAND", "AURELIAN %s EMPIRE"]:
		_check(controller.contains(label_format), label_format)
	var bindings: Dictionary = manifest.get("direction_bindings", {}) as Dictionary
	for direction in ["trade", "expand", "frontier"]:
		_check(bindings.has(direction), "binding_%s" % direction)
		var binding: Dictionary = bindings.get(direction, {}) as Dictionary
		_check(not String(binding.get("village_cue", "")).is_empty(), "village_cue_%s" % direction)
		_check(not String(binding.get("map_locus", "")).is_empty(), "map_locus_%s" % direction)
		_check(not String(binding.get("world_cue", "")).is_empty(), "world_cue_%s" % direction)
	_check(controller.contains("Vector2(354.0, 285.0)"), "greenvale_unchanged")
	_check(controller.contains("Vector2(435.0, 313.0)"), "east_route_unchanged")
	_check(controller.contains("Vector2(700.0, 205.0)"), "north_ridge_unchanged")
	_check(controller.contains("Vector2(515.0, 340.0)"), "gilded_crossing_unchanged")
	for field in ["national_direction", "national_mandate_started", "empire_proclaimed"]:
		_check(persistence.contains("\"%s\"" % field), "persistence_%s" % field)
	_finish()

func _read_json(path: String) -> Dictionary:
	var parsed: Variant = JSON.parse_string(_read_text(path))
	return parsed if parsed is Dictionary else {}

func _read_text(path: String) -> String:
	var file := FileAccess.open(path, FileAccess.READ)
	return file.get_as_text() if file != null else ""

func _check(condition: bool, label: String) -> void:
	if not condition:
		failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("GODOT_AURELIAN_DIRECTIONAL_EMPIRE_IDENTITY_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("GODOT_AURELIAN_DIRECTIONAL_EMPIRE_IDENTITY_V1_TEST_FAILURE: %s" % failure)
	quit(1)
