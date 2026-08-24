extends SceneTree

const STATE_MANIFEST_PATH := "res://scenes/aurelian/production_village_v1_state_manifest.json"
const EXPANSION_MANIFEST_PATH := "res://scenes/aurelian/aurelian_visible_expansion_v1_manifest.json"
const PRODUCTION_SCRIPT := preload("res://scenes/aurelian/production_village_v1.gd")

var failures: Array[String] = []

func _init() -> void:
	var file := FileAccess.open(STATE_MANIFEST_PATH, FileAccess.READ)
	if file == null:
		_fail("state_manifest_open")
		_finish()
		return
	var payload = JSON.parse_string(file.get_as_text())
	if not payload is Dictionary:
		_fail("state_manifest_parse")
		_finish()
		return
	var manifest := payload as Dictionary

	_check(String(manifest.get("contract", "")) == "PRODUCTION_VILLAGE_V1", "contract")
	_check(String(manifest.get("default_state", "")) == "developed", "default_state")
	_check(PRODUCTION_SCRIPT.VILLAGE_STATES == ["claimed", "founded", "developed"], "script_state_order")
	_check(PRODUCTION_SCRIPT.STATE_MANIFEST_PATH == STATE_MANIFEST_PATH, "script_manifest_path")
	_check(PRODUCTION_SCRIPT.CAMERA_CONTRACT["village"]["size"] >= 8.5, "expanded_village_framing")
	_check(PRODUCTION_SCRIPT.CAMERA_CONTRACT["map"]["size"] >= 17.0, "expanded_map_framing")
	_check(PRODUCTION_SCRIPT.CAMERA_CONTRACT["world"]["size"] >= 23.0, "expanded_world_framing")

	var all_nodes: Array = manifest.get("all_nodes", [])
	_check(all_nodes.size() == 13, "all_nodes_count")
	for node_name in [
		"Greenvale_flag", "Greenvale_blacksmith", "Greenvale_barracks", "Greenvale_church",
		"Greenvale_cottage_west", "Greenvale_cottage_south", "Greenvale_workshop_north",
		"Greenvale_cottage_east", "Greenvale_cottage_lane", "Greenvale_storehouse_fields",
		"Greenvale_workshop_crossing", "Greenvale_shrine_green", "Greenvale_gatehouse_road"
	]:
		_check(all_nodes.has(node_name), "node_%s" % node_name)

	var derived: Dictionary = manifest.get("derived_nodes", {})
	_check(derived.size() == 9, "derived_nodes_count")
	for node_name in derived.keys():
		var spec: Dictionary = derived[node_name]
		_check(String(spec.get("source", "")).begins_with("Greenvale_"), "derived_source_%s" % node_name)
		_check(float(spec.get("scale", 1.0)) < 0.8, "derived_scale_%s" % node_name)
		_check(abs(float(spec.get("rotation_y_degrees", 0.0))) <= 45.0, "derived_rotation_%s" % node_name)

	var states: Dictionary = manifest.get("states", {})
	for state_name in ["claimed", "founded", "developed"]:
		_check(states.has(state_name), "state_%s_present" % state_name)

	if states.has("claimed") and states.has("founded") and states.has("developed"):
		var claimed: Array = (states["claimed"] as Dictionary).get("visible", [])
		var founded: Array = (states["founded"] as Dictionary).get("visible", [])
		var developed: Array = (states["developed"] as Dictionary).get("visible", [])
		_check(claimed == ["Greenvale_flag"], "claimed_single_marker")
		_check(founded.size() == 10, "founded_structure_count")
		_check(developed.size() == 13, "developed_structure_count")
		for node_name in claimed:
			_check(founded.has(node_name), "claimed_subset_founded_%s" % node_name)
		for node_name in founded:
			_check(developed.has(node_name), "founded_subset_developed_%s" % node_name)

	var layout: Dictionary = manifest.get("layout_topology", {})
	_check(layout.size() == 13, "layout_count")
	for node_name in all_nodes:
		_check(layout.has(node_name), "layout_%s" % node_name)
		if layout.has(node_name):
			var coords: Array = layout[node_name]
			_check(coords.size() == 2, "layout_coords_%s" % node_name)
			if coords.size() == 2:
				_check(float(coords[0]) < 515.0, "greenvale_west_of_bridge_%s" % node_name)
				_check(float(coords[1]) < 420.0, "greenvale_north_of_fields_%s" % node_name)

	var anchors: Dictionary = manifest.get("composition_anchors", {})
	for anchor_name in ["village_green", "crossing_road_edge", "fields_work_edge", "forest_edge", "gilded_crossing"]:
		_check(anchors.has(anchor_name), "composition_anchor_%s" % anchor_name)

	var adjustments: Dictionary = manifest.get("presentation_adjustments", {})
	_check(float(adjustments.get("NorthRidge_hill_a", 1.0)) <= 0.4, "hill_a_strongly_reduced")
	_check(float(adjustments.get("NorthRidge_hill_b", 1.0)) <= 0.4, "hill_b_strongly_reduced")
	_check(float(adjustments.get("Bridge_GildedCrossing", 1.0)) > 1.0, "bridge_strengthened")

	var bridge_world: Vector3 = PRODUCTION_SCRIPT.topology_to_godot(Vector2(515.0, 340.0), 0.0)
	var greenvale_world: Vector3 = PRODUCTION_SCRIPT.topology_to_godot(Vector2(354.0, 285.0), 0.0)
	_check(greenvale_world.x < bridge_world.x, "greenvale_west_of_bridge_world")
	_check(greenvale_world.z > bridge_world.z, "greenvale_northwest_relation")
	_finish()

func _check(condition: bool, label: String) -> void:
	if not condition:
		_fail(label)

func _fail(label: String) -> void:
	failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("PRODUCTION_VILLAGE_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("PRODUCTION_VILLAGE_V1_TEST_FAILURE: %s" % failure)
	print("PRODUCTION_VILLAGE_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
