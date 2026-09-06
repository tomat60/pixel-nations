extends SceneTree

const CONTRACT_PATH := "res://scenes/aurelian/full_progression_clarity_composition_v1_candidate.json"

var failures: Array[String] = []

func _init() -> void:
	var file := FileAccess.open(CONTRACT_PATH, FileAccess.READ)
	if file == null:
		_fail("contract_open")
		_finish()
		return
	var payload = JSON.parse_string(file.get_as_text())
	if not payload is Dictionary:
		_fail("contract_parse")
		_finish()
		return
	var contract := payload as Dictionary
	_check(String(contract.get("contract", "")) == "AURELIAN_FULL_PROGRESSION_CLARITY_COMPOSITION_V1_C1", "contract_name")
	_check(int(contract.get("authority_issue", 0)) == 570, "authority_issue")
	_check(contract.get("stages", []) == ["nation", "empire"], "stages")
	_check(contract.get("views", []) == ["village", "map", "world"], "views")
	_check(int(contract.get("source_frames", 0)) == 6, "source_frames")
	var acceptance: Dictionary = contract.get("acceptance", {})
	for key in [
		"materially_less_clutter",
		"nation_empire_remain_distinct",
		"primary_focal_point_faster_to_identify",
		"physical_progression_preserved",
		"direct_baseline_review_required",
		"green_ci_not_sufficient"
	]:
		_check(bool(acceptance.get(key, false)), "acceptance_%s" % key)
	var forbidden: Array = contract.get("forbidden", [])
	for required in ["new mechanics", "new asset family", "new geography", "main playable controller rewrite", "full 15-frame spend before C1 pass", "MAX", "paid tools"]:
		_check(forbidden.has(required), "forbidden_%s" % required.replace(" ", "_"))
	_finish()

func _check(condition: bool, label: String) -> void:
	if not condition:
		_fail(label)

func _fail(label: String) -> void:
	failures.append(label)

func _finish() -> void:
	if failures.is_empty():
		print("AURELIAN_FULL_PROGRESSION_CLARITY_COMPOSITION_V1_CANDIDATE_TEST: PASS")
		quit(0)
		return
	for failure in failures:
		push_error("AURELIAN_FULL_PROGRESSION_CLARITY_COMPOSITION_V1_CANDIDATE_TEST_FAILURE: %s" % failure)
	print("AURELIAN_FULL_PROGRESSION_CLARITY_COMPOSITION_V1_CANDIDATE_TEST: FAIL (%d)" % failures.size())
	quit(1)
