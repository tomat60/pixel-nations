extends Node3D

const SCENES := {
    "desktop": "res://art_target/autonomous_aurelian/autonomous-desktop.glb",
    "portrait": "res://art_target/autonomous_aurelian/autonomous-portrait.glb",
}

var active_camera: Camera3D
var imported_root: Node3D

func _ready() -> void:
    _add_environment()
    var mode := OS.get_environment("CAPTURE_MODE")
    if not SCENES.has(mode):
        push_error("Unsupported CAPTURE_MODE: " + mode)
        get_tree().quit(21)
        return
    var packed := load(SCENES[mode]) as PackedScene
    if packed == null:
        push_error("Failed to load autonomous Aurelian GLB: " + SCENES[mode])
        get_tree().quit(22)
        return
    imported_root = packed.instantiate() as Node3D
    if imported_root == null:
        push_error("Failed to instantiate autonomous Aurelian GLB")
        get_tree().quit(23)
        return
    add_child(imported_root)
    await get_tree().process_frame
    _normalize_imported_lights(imported_root)
    active_camera = _find_camera(imported_root)
    if active_camera == null:
        push_error("No imported Camera3D found")
        get_tree().quit(24)
        return
    active_camera.current = true
    call_deferred("_capture")

func _add_environment() -> void:
    var world := WorldEnvironment.new()
    var environment := Environment.new()
    environment.background_mode = Environment.BG_COLOR
    environment.background_color = Color("#4d5c59")
    environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
    environment.ambient_light_color = Color("#c2c8bc")
    environment.ambient_light_energy = 0.34
    environment.tonemap_mode = Environment.TONE_MAPPER_FILMIC
    environment.tonemap_exposure = 0.0
    world.environment = environment
    add_child(world)

func _normalize_imported_lights(root: Node) -> void:
    var lights: Array[DirectionalLight3D] = []
    _collect_directional_lights(root, lights)
    if lights.is_empty():
        var fallback := DirectionalLight3D.new()
        fallback.name = "AutonomousProofSun"
        fallback.rotation_degrees = Vector3(-42.0, 28.0, 18.0)
        add_child(fallback)
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
    var width := int(OS.get_environment("CAPTURE_WIDTH"))
    var height := int(OS.get_environment("CAPTURE_HEIGHT"))
    var capture_path := OS.get_environment("CAPTURE_PATH")
    var contract_path := OS.get_environment("CONTRACT_PATH")
    if width <= 0 or height <= 0 or capture_path.is_empty() or contract_path.is_empty():
        push_error("Invalid capture contract environment")
        get_tree().quit(25)
        return
    DisplayServer.window_set_size(Vector2i(width, height))
    await get_tree().process_frame
    await get_tree().process_frame
    await get_tree().process_frame
    await get_tree().create_timer(2.0).timeout
    var image := get_viewport().get_texture().get_image()
    var error := image.save_png(capture_path)
    if error != OK:
        push_error("Failed to save screenshot: " + str(error))
        get_tree().quit(26)
        return
    var contract := {
        "mode": OS.get_environment("CAPTURE_MODE"),
        "scene_resource": SCENES[OS.get_environment("CAPTURE_MODE")],
        "capture_width": image.get_width(),
        "capture_height": image.get_height(),
        "camera": {
            "name": active_camera.name,
            "position": _v3(active_camera.global_position),
            "rotation_degrees": _v3(active_camera.global_rotation_degrees),
            "projection": "orthogonal" if active_camera.projection == Camera3D.PROJECTION_ORTHOGONAL else "perspective",
            "orthographic_size": active_camera.size,
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
        get_tree().quit(27)
        return
    file.store_string(JSON.stringify(contract, "  ") + "\n")
    print("AUTONOMOUS_GODOT_CAPTURE_SAVED=" + capture_path)
    print("AUTONOMOUS_GODOT_CONTRACT_SAVED=" + contract_path)
    get_tree().quit()

func _v3(value: Vector3) -> Array:
    return [snappedf(value.x, 0.0001), snappedf(value.y, 0.0001), snappedf(value.z, 0.0001)]
