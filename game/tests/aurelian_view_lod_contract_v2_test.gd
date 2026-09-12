extends SceneTree

const PRESENTATION = preload("res://scenes/aurelian/production_village_v1.gd")
const MANIFEST_PATH := "res://scenes/aurelian/production_village_v1_state_manifest.json"
const SOURCE_PATH := "res://scenes/aurelian/production_village_v1.gd"

var failures: Array[String] = []

func _initialize() -> void:
	var presentation = PRESENTATION.new()
	presentation.state_contract = _read_json(MANIFEST_PATH)
	var basin := Node3D.new()
	for node_name_variant in presentation.state_contract.get("all_nodes", []):
		var node := Node3D.new()
		node.name = String(node_name_variant)
		basin.add_child(node)

	_check(presentation._apply_village_state(basin, "city_chartered"), "city_state_applies")
	_check(presentation._apply_view_lod("village", basin), "village_lod_applies")
	_check(_visible_names(basin).size() == 19, "village_preserves_all_city_detail")

	_check(presentation._apply_village_state(basin, "city_chartered"), "city_state_restores_before_map")
	_check(presentation._apply_view_lod("map", basin), "map_lod_applies")
	_check(
		_visible_names(basin) == ["Greenvale_church", "Greenvale_city_hall", "Greenvale_flag"],
		"map_retains_only_flag_and_civic_anchor"
	)

	_check(presentation._apply_village_state(basin, "city_chartered"), "city_state_restores_before_world")
	_check(presentation._apply_view_lod("world", basin), "world_lod_applies")
	_check(_visible_names(basin).is_empty(), "world_suppresses_local_building_cluster")

	_check(presentation._apply_village_state(basin, "developed"), "developed_state_restores")
	_check(presentation._apply_view_lod("village", basin), "village_lod_reapplies")
	_check(_visible_names(basin).size() == 13, "return_to_village_restores_exact_developed_state")

	_check(presentation._apply_village_state(basin, "developed"), "developed_state_restores_before_bridge")
	_check(presentation._apply_view_lod("bridge", basin), "technical_bridge_compatibility")
	_check(_visible_names(basin).size() == 13, "technical_bridge_preserves_exact_developed_state")

	var view_lod: Dictionary = presentation.state_contract.get("view_lod", {})
	_check(view_lod.keys().size() == 3, "exact_three_player_view_contract")
	_check(view_lod.has("village") and view_lod.has("map") and view_lod.has("world"), "named_view_contract")
	_check(not view_lod.has("bridge"), "bridge_is_not_fourth_player_view")

	var anchors: Dictionary = presentation.state_contract.get("composition_anchors", {})
	_check(_vec2_matches(anchors.get("gilded_crossing", []), Vector2(515.0, 340.0)), "gilded_crossing_topology_unchanged")
	_check(_vec2_matches(anchors.get("forest_edge", []), Vector2(245.0, 205.0)), "forest_edge_topology_unchanged")

	var source := _read_text(SOURCE_PATH)
	_check(source.contains("node.visible = node.visible and allowed_nodes.has(node_name)"), "lod_is_visibility_intersection")
	_check(source.contains("_apply_view_lod(preset, main_basin)"), "camera_activation_owns_lod")
	_check(source.contains("preset == \"bridge\""), "technical_bridge_owned_explicitly")
	_check(not source.contains("CanvasLayer.new()"), "no_new_screen_space_layer")
	_check(not source.contains("Input.action_press"), "no_synthetic_input")

	presentation.free()
	basin.free()
	_finish()

func _vec2_matches(value: Variant, expected: Vector2) -> bool:
	if not value is Array:
		return false
	var coords := value as Array
	if coords.size() != 2:
		return false
	return is_equal_approx(float(coords[0]), expected.x) and is_equal_approx(float(coords[1]), expected.y)

func _visible_names(root: Node) -> Array[String]:
	var names: Array[String] = []
	for child in root.get_children():
		if child is Node3D and (child as Node3D).visible:
			names.append(String(child.name))
	names.sort()
	return names

func _read_json(path: String) -> Dictionary:
	var payload = JSON.parse_string(_read_text(path))
	if payload is Dictionary:
		return payload as Dictionary
	failures.append("invalid_json_%s" % path)
	return {}

func _read_text(path: String) -> String:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		failures.append("open_%s" % path)
		return ""
	return file.get_as_text()

func _check(condition: bool, label: String) -> void:
	if not condition:
		failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("AURELIAN_VIEW_LOD_CONTRACT_V2_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("AURELIAN_VIEW_LOD_CONTRACT_V2_TEST_FAILURE: %s" % failure)
	print("AURELIAN_VIEW_LOD_CONTRACT_V2_TEST: FAIL (%d)" % failures.size())
	quit(1)
