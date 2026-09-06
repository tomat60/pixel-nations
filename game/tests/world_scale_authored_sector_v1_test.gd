extends SceneTree

const GLB_PATH := "res://assets/aurelian-sector-a01/export/sector_a01_authored_v1.glb"
const SCENE_PATH := "res://scenes/aurelian/world_scale_authored_sector_v1.tscn"

func _initialize() -> void:
	var failures: Array[String] = []

	if not FileAccess.file_exists(GLB_PATH):
		failures.append("missing generated Sector A-01 GLB")

	var packed := load(GLB_PATH) as PackedScene
	if packed == null:
		failures.append("Sector A-01 GLB does not load as PackedScene")
	else:
		var instance := packed.instantiate() as Node3D
		if instance == null:
			failures.append("Sector A-01 GLB does not instantiate")
		else:
			for required_name in [
				"SectorA01AuthoredTerrain",
				"SectorA01River",
				"AurelianHome",
				"PinewatchForest",
				"StormcapHighlands",
				"EastRidgeHighlands",
				"SouthfenPool_00",
				"OldCrownRuins",
				"SaltmereHarbor",
				"FrontierPassFlag",
			]:
				if instance.find_child(required_name, true, false) == null:
					failures.append("missing authored node: %s" % required_name)
			if instance.find_child("WorldAtlas", true, false) != null:
				failures.append("Atlas implementation leaked into Sector-only gate")
			instance.queue_free()

	var scene := load(SCENE_PATH) as PackedScene
	if scene == null:
		failures.append("authored Sector presentation scene does not load")

	var script_text := FileAccess.get_file_as_string("res://scenes/aurelian/world_scale_authored_sector_v1.gd")
	if script_text.contains("10000") or script_text.contains("10x10") or script_text.contains("WorldAtlas"):
		failures.append("grid/literal-world implementation leaked into Sector presentation")
	if not script_text.contains("SECTOR_CAMERA_SIZE"):
		failures.append("dedicated regional camera contract missing")

	if failures.is_empty():
		print("WORLD_SCALE_AUTHORED_SECTOR_V1_TEST: PASS")
		quit(0)
		return

	for failure in failures:
		push_error("WORLD_SCALE_AUTHORED_SECTOR_V1_TEST: %s" % failure)
	print("WORLD_SCALE_AUTHORED_SECTOR_V1_TEST: FAIL count=%d" % failures.size())
	quit(1)
