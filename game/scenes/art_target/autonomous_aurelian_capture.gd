extends Node

const SCENES := {
    "desktop": "res://art_target/autonomous_aurelian/autonomous-desktop.glb",
    "portrait": "res://art_target/autonomous_aurelian/autonomous-portrait.glb",
}

var active_camera: Camera3D
var imported_root: Node3D
var render_viewport: SubViewport
var render_root: Node3D
var capture_mode: String
var capture_path: String
var contract_path: String

func _ready() -> void:
    capture_mode = OS.get_environment("CAPTURE_MODE")
    var width := int(OS.get_environment("CAPTURE_WIDTH"))
    var height := int(OS.get_environment("CAPTURE_HEIGHT"))
    capture_path = OS.get_environment("CAPTURE_PATH")
    contract_path = OS.get_environment("CONTRACT_PATH")
    if not SCENES.has(capture_mode):
        push_error("Unsupported CAPTURE_MODE: " + capture_mode)
        get_tree().quit(21)
        return
    if width <= 0 or height <= 0 or capture_path.is_empty() or contract_path.is_empty():
        push_error("Invalid capture contract environment")
        get_tree().quit(25)
        return

    RenderingServer.set_default_clear_color(Color("#4d5c59"))
    render_viewport = SubViewport.new()
    render_viewport.name = "AutonomousProofViewport"
    render_viewport.size = Vector2i(width, height)
    render_viewport.own_world_3d = true
    render_viewport.transparent_bg = false
    render_viewport.render_target_clear_mode = SubViewport.CLEAR_MODE_ALWAYS
    render_viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
    add_child(render_viewport)

    render_root = Node3D.new()
    render_root.name = "AutonomousProofWorld"
    render_viewport.add_child(render_root)
    render_viewport.world_3d.environment = _make_environment()

    var packed := load(SCENES[capture_mode]) as PackedScene
    if packed == null:
        push_error("Failed to load autonomous Aurelian GLB: " + SCENES[capture_mode])
        get_tree().quit(22)
        return
    imported_root = packed.instantiate() as Node3D
    if imported_root == null:
        push_error("Failed to instantiate autonomous Aurelian GLB")
        get_tree().quit(23)
        return
    render_root.add_child(imported_root)
    _normalize_imported_lights(imported_root)
    active_camera = _find_camera(imported_root)
    if active_camera == null:
        push_error("No imported Camera3D found")
        get_tree().quit(24)
        return
    active_camera.near = 0.1
    active_camera.far = 2000.0
    active_camera.cull_mask = 0xFFFFF
    active_camera.current = true
    call_deferred("_capture")

func _make_environment() -> Environment:
    var environment := Environment.new()
    environment.background_mode = Environment.BG_COLOR
    environment.background_color = Color("#4d5c59")
    environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
    environment.ambient_light_color = Color("#c2c8bc")
    environment.ambient_light_energy = 0.34
    environment.tonemap_mode = Environment.TONE_MAPPER_FILMIC
    environment.tonemap_exposure = 0.0
    return environment

func _normalize_imported_lights(root: Node) -> void:
    var lights: Array[DirectionalLight3D] = []
    _collect_directional_lights(root, lights)
    if lights.is_empty():
        var fallback := DirectionalLight3D.new()
        fallback.name = "AutonomousProofSun"
        fallback.rotation_degrees = Vector3(-42.0, 28.0, 18.0)
        render_root.add_child(fallback)
        lights.append(fallback)
    for light in lights:
        light.light_color = Color("#fff0dc")
        light.light_energy = 0.82
        light.shadow_enabled = true
        light.directional_shadow_max_distance = 320.0

func _collect_directional_lights(root: Node, out: Array[DirectionalLight3D]) -> void:
    if root is DirectionalLight3D:
        out.append(root as DirectionalLight3D)
    for child in root.get_children():
        _collect_directional_lights(child, out)

func _find_camera(root: Node) -> Camera3D:
    if root is Camera3D:
        return root as Camera3D
    for child in root.get_children():
        var found := _find_camera(child)
        if found != null:
            return found
    return null

func _count_nodes(root: Node, class_name_filter: String) -> int:
    var count := 1 if root.get_class() == class_name_filter else 0
    for child in root.get_children():
        count += _count_nodes(child, class_name_filter)
    return count

func _capture() -> void:
    await get_tree().process_frame
    await get_tree().process_frame
    await get_tree().process_frame
    await RenderingServer.frame_post_draw
    await RenderingServer.frame_post_draw
    var image := render_viewport.get_texture().get_image()
    if image.is_empty():
        push_error("Offscreen SubViewport returned an empty image")
        get_tree().quit(26)
        return
    var error := image.save_png(capture_path)
    if error != OK:
        push_error("Failed to save screenshot: " + str(error))
        get_tree().quit(27)
        return
    var contract := {
        "mode": capture_mode,
        "scene_resource": SCENES[capture_mode],
        "capture_backend": "offscreen_subviewport",
        "capture_width": image.get_width(),
        "capture_height": image.get_height(),
        "viewport_width": render_viewport.size.x,
        "viewport_height": render_viewport.size.y,
        "camera": {
            "name": active_camera.name,
            "position": _v3(active_camera.global_position),
            "rotation_degrees": _v3(active_camera.global_rotation_degrees),
            "projection": "orthogonal" if active_camera.projection == Camera3D.PROJECTION_ORTHOGONAL else "perspective",
            "orthographic_size": active_camera.size,
            "near": active_camera.near,
            "far": active_camera.far,
        },
        "environment": {
            "background": "#4d5c59",
            "ambient_color": "#c2c8bc",
            "ambient_energy": 0.34,
            "directional_color": "#fff0dc",
            "directional_energy": 0.82,
            "tonemap": "filmic",
            "exposure": 0.0,
        },
        "mesh_instances": _count_nodes(imported_root, "MeshInstance3D"),
        "camera_nodes": _count_nodes(imported_root, "Camera3D"),
        "directional_lights": _count_nodes(imported_root, "DirectionalLight3D"),
    }
    var file := FileAccess.open(contract_path, FileAccess.WRITE)
    if file == null:
        push_error("Failed to open contract output")
        get_tree().quit(28)
        return
    file.store_string(JSON.stringify(contract, "  ") + "\n")
    render_viewport.render_target_update_mode = SubViewport.UPDATE_DISABLED
    print("AUTONOMOUS_GODOT_CAPTURE_SAVED=" + capture_path)
    print("AUTONOMOUS_GODOT_CONTRACT_SAVED=" + contract_path)
    get_tree().quit()

func _v3(value: Vector3) -> Array:
    return [snappedf(value.x, 0.0001), snappedf(value.y, 0.0001), snappedf(value.z, 0.0001)]
