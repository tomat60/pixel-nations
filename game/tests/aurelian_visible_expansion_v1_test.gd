extends SceneTree

const MANIFEST_PATH := "res://scenes/aurelian/aurelian_visible_expansion_v1_manifest.json"
const VILLAGE_PATH := "res://scenes/aurelian/production_village_v1_state_manifest.json"

var failures: Array[String] = []

func _init() -> void:
	var manifest := _read_json(MANIFEST_PATH)
	var village := _read_json(VILLAGE_PATH)
	_check(String(manifest.get("contract", "")) == "AURELIAN_VISIBLE_EXPANSION_V1", "contract")
	_check(int(manifest.get("authority_issue", 0)) == 482, "authority")
	_check(String(manifest.get("shared_geography", "")) == "aurelian_authored_terrain_v1.glb", "shared_geography")
	_check(String(manifest.get("asset_policy", "")).contains("repository-pinned"), "asset_reuse")
	var outcome: Dictionary = manifest.get("visible_outcome", {})
	_check(int(outcome.get("claimed_nodes", 0)) == 1, "claimed_nodes")
	_check(int(outcome.get("founded_nodes", 0)) >= 10, "founded_density")
	_check(int(outcome.get("developed_nodes", 0)) >= int(outcome.get("founded_nodes", 0)), "developed_superset")
	_check((outcome.get("views", []) as Array) == ["village", "map", "world"], "view_roles")
	var regressions: Dictionary = manifest.get("regressions", {})
	for key in ["first_land_claim", "first_settlement_founding", "session_persistence_v2", "shared_topology"]:
		_check(bool(regressions.get(key, false)), "regression_%s" % key)
	var evidence: Array = manifest.get("evidence", [])
	_check(evidence.size() == 5, "evidence_count")
	var states: Dictionary = village.get("states", {})
	_check(((states.get("founded", {}) as Dictionary).get("visible", []) as Array).size() == int(outcome.get("founded_nodes", 0)), "founded_manifest_parity")
	_finish()

func _read_json(path: String) -> Dictionary:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		_fail("open_%s" % path)
		return {}
	var payload = JSON.parse_string(file.get_as_text())
	if not payload is Dictionary:
		_fail("parse_%s" % path)
		return {}
	return payload as Dictionary

func _check(condition: bool, label: String) -> void:
	if not condition:
		_fail(label)

func _fail(label: String) -> void:
	failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("AURELIAN_VISIBLE_EXPANSION_V1_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("AURELIAN_VISIBLE_EXPANSION_V1_TEST_FAILURE: %s" % failure)
	print("AURELIAN_VISIBLE_EXPANSION_V1_TEST: FAIL (%d)" % failures.size())
	quit(1)
