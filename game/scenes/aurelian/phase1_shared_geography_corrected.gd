extends "res://scenes/aurelian/phase1_shared_geography.gd"

# Phase 1 single bounded correction: Camera3D must be inside the scene tree
# before look_at() is evaluated. No topology, framing, asset or gameplay change.
func _build_cameras() -> void:
	for preset in CAMERA_CONTRACT.keys():
		var definition: Dictionary = CAMERA_CONTRACT[preset]
		var camera := Camera3D.new()
		camera.name = String(definition["node"])
		camera.projection = Camera3D.PROJECTION_ORTHOGONAL
		camera.size = float(definition["size"])
		var focus := topology_to_world_point(definition["center"], 0.0)
		camera.position = focus + Vector3(11.5, 13.0, 11.5)
		add_child(camera)
		camera.look_at(focus, Vector3.UP)
		cameras[preset] = camera
