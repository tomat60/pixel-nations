extends SceneTree

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var packed := load("res://scenes/calibration/render_path/render_path_calibration.tscn") as PackedScene
	if packed == null:
		_fail("scene failed to load")
		return
	var instance := packed.instantiate()
	root.add_child(instance)
	await process_frame
	await process_frame

	var main_camera := instance.get_node_or_null("MainCamera") as Camera3D
	var main_primitive := instance.get_node_or_null("MainPrimitive") as MeshInstance3D
	var subviewport := instance.get_node_or_null("EvidenceSubViewport") as SubViewport
	if main_camera == null or not main_camera.is_current():
		_fail("main camera is not current")
		return
	if main_camera.cull_mask != 1:
		_fail("main camera cull mask drift")
		return
	if main_primitive == null or main_primitive.mesh == null or main_primitive.layers != 1:
		_fail("main primitive missing")
		return
	if subviewport == null:
		_fail("SubViewport missing")
		return
	if subviewport.size != Vector2i(1440, 900):
		_fail("SubViewport dimensions drift")
		return
	if not subviewport.own_world_3d:
		_fail("SubViewport does not own World3D")
		return
	if subviewport.render_target_update_mode != SubViewport.UPDATE_ALWAYS:
		_fail("SubViewport update mode drift")
		return
	var sub_camera := subviewport.get_node_or_null("SubViewportCamera") as Camera3D
	var sub_primitive := subviewport.get_node_or_null("SubViewportPrimitive") as MeshInstance3D
	if sub_camera == null or not sub_camera.is_current():
		_fail("SubViewport camera is not current")
		return
	if sub_camera.cull_mask != 1:
		_fail("SubViewport camera cull mask drift")
		return
	if sub_primitive == null or sub_primitive.mesh == null or sub_primitive.layers != 1:
		_fail("SubViewport primitive missing")
		return
	print("GODOT_RENDER_PATH_CALIBRATION_TEST: PASS")
	quit(0)

func _fail(message: String) -> void:
	push_error(message)
	print("GODOT_RENDER_PATH_CALIBRATION_TEST: FAIL: %s" % message)
	quit(1)
