extends Node3D

const SCALE := 11.71437541
const MODEL_PATHS := {
    "home": "res://art_target/kaykit_cluster/building_home_A_red.gltf",
    "blacksmith": "res://art_target/kaykit_cluster/building_blacksmith_red.gltf",
    "church": "res://art_target/kaykit_cluster/building_church_red.gltf",
}
const MODEL_POSITIONS := {
    "home": Vector3(-9.0, 0.0, 2.0),
    "blacksmith": Vector3(0.0, 0.0, -1.5),
    "church": Vector3(10.0, 0.0, 1.0),
}
const MODEL_ROTATIONS := {
    "home": 18.0,
    "blacksmith": -8.0,
    "church": -22.0,
}

var camera: Camera3D
var role_contract: Dictionary = {}

func _ready() -> void:
    _add_environment()
    _add_support_geometry()
    for role in ["home", "blacksmith", "church"]:
        await _place_model(role)
    _add_camera()
    await get_tree().process_frame
    call_deferred("_capture")

func _add_environment() -> void:
    var world := WorldEnvironment.new()
    var env := Environment.new()
    env.background_mode = Environment.BG_COLOR
    env.background_color = Color("#9aa9a2")
    env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
    env.ambient_light_color = Color("#d7d0bf")
    env.ambient_light_energy = 0.48
    env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
    env.tonemap_exposure = 0.92
    world.environment = env
    add_child(world)

    var sun := DirectionalLight3D.new()
    sun.rotation_degrees = Vector3(-48.0, -32.0, 0.0)
    sun.light_color = Color("#fff1d4")
    sun.light_energy = 1.05
    sun.shadow_enabled = true
    sun.directional_shadow_max_distance = 90.0
    add_child(sun)

func _box(name: String, position: Vector3, size: Vector3, color: Color) -> void:
    var mesh_instance := MeshInstance3D.new()
    mesh_instance.name = name
    var box := BoxMesh.new()
    box.size = size
    var material := StandardMaterial3D.new()
    material.albedo_color = color
    material.roughness = 0.96
    box.material = material
    mesh_instance.mesh = box
    mesh_instance.position = position
    add_child(mesh_instance)

func _add_support_geometry() -> void:
    _box("Ground", Vector3(0.0, -0.35, 0.0), Vector3(42.0, 0.7, 24.0), Color("#66705a"))
    _box("Road", Vector3(0.0, 0.025, 5.0), Vector3(34.0, 0.05, 3.1), Color("#8b765b"))
    _box("ChannelBed", Vector3(0.0, -0.95, -9.0), Vector3(42.0, 1.2, 4.0), Color("#556a69"))
    _box("ChannelWater", Vector3(0.0, -0.28, -9.0), Vector3(42.0, 0.08, 3.2), Color("#527f83"))

func _place_model(role: String) -> void:
    var packed := load(MODEL_PATHS[role]) as PackedScene
    if packed == null:
        push_error("Missing KayKit model: " + MODEL_PATHS[role])
        get_tree().quit(11)
        return
    var node := packed.instantiate() as Node3D
    node.name = role.capitalize()
    node.scale = Vector3.ONE * SCALE
    node.rotation_degrees.y = MODEL_ROTATIONS[role]
    add_child(node)
    node.position = MODEL_POSITIONS[role]
    await get_tree().process_frame
    var before := _global_aabb(node)
    var root_y_offset := -before.position.y
    node.position.y += root_y_offset
    await get_tree().process_frame
    var final_aabb := _global_aabb(node)
    if abs(final_aabb.position.y) > 0.03:
        push_error("Grounding failed for %s: %.5f" % [role, final_aabb.position.y])
        get_tree().quit(14)
        return
    role_contract[role] = {
        "resource_path": MODEL_PATHS[role],
        "uniform_scale": SCALE,
        "root_y_offset": root_y_offset,
        "position": _v3(node.position),
        "rotation_y_degrees": node.rotation_degrees.y,
        "world_aabb_position": _v3(final_aabb.position),
        "world_aabb_size": _v3(final_aabb.size),
    }

func _global_aabb(root: Node3D) -> AABB:
    var found := false
    var merged := AABB()
    var stack: Array[Node] = [root]
    while not stack.is_empty():
        var current := stack.pop_back()
        if current is MeshInstance3D:
            var mesh_instance := current as MeshInstance3D
            if mesh_instance.mesh != null:
                var aabb := mesh_instance.global_transform * mesh_instance.mesh.get_aabb()
                if not found:
                    merged = aabb
                    found = true
                else:
                    merged = merged.merge(aabb)
        for child in current.get_children():
            stack.push_back(child)
    if not found:
        push_error("No mesh found under " + root.name)
        get_tree().quit(12)
    return merged

func _add_camera() -> void:
    camera = Camera3D.new()
    camera.projection = Camera3D.PROJECTION_ORTHOGONAL
    var mode := OS.get_environment("CAPTURE_MODE")
    if mode == "portrait":
        camera.position = Vector3(50.0, 38.0, 0.0)
        camera.size = 44.0
        camera.look_at_from_position(camera.position, Vector3(0.0, 3.2, 0.5), Vector3.UP)
    else:
        camera.position = Vector3(39.0, 34.0, 45.0)
        camera.size = 30.0
        camera.look_at_from_position(camera.position, Vector3(0.0, 3.0, 0.0), Vector3.UP)
    camera.current = true
    add_child(camera)

func _capture() -> void:
    var width := int(OS.get_environment("CAPTURE_WIDTH"))
    var height := int(OS.get_environment("CAPTURE_HEIGHT"))
    if width <= 0 or height <= 0:
        push_error("Invalid capture dimensions")
        get_tree().quit(13)
        return
    DisplayServer.window_set_size(Vector2i(width, height))
    await get_tree().process_frame
    await get_tree().process_frame
    await get_tree().create_timer(2.0).timeout
    var capture_path := OS.get_environment("CAPTURE_PATH")
    var contract_path := OS.get_environment("CONTRACT_PATH")
    var image := get_viewport().get_texture().get_image()
    var save_error := image.save_png(capture_path)
    if save_error != OK:
        push_error("Screenshot save failed: %s" % save_error)
        get_tree().quit(15)
        return
    var contract := {
        "mode": OS.get_environment("CAPTURE_MODE"),
        "capture_width": image.get_width(),
        "capture_height": image.get_height(),
        "uniform_scale": SCALE,
        "scale_correction_used": false,
        "environment": {
            "background": "#9aa9a2",
            "ambient_source": "color",
            "ambient_color": "#d7d0bf",
            "ambient_energy": 0.48,
            "tonemap": "filmic",
            "exposure": 0.92,
        },
        "directional_light": {
            "rotation_degrees": [-48.0, -32.0, 0.0],
            "color": "#fff1d4",
            "energy": 1.05,
            "shadows": true,
            "shadow_max_distance": 90.0,
        },
        "camera": {
            "projection": "orthogonal",
            "position": _v3(camera.position),
            "orthographic_size": camera.size,
            "target": [0.0, 3.2 if OS.get_environment("CAPTURE_MODE") == "portrait" else 3.0, 0.5 if OS.get_environment("CAPTURE_MODE") == "portrait" else 0.0],
        },
        "roles": role_contract,
    }
    var contract_file := FileAccess.open(contract_path, FileAccess.WRITE)
    if contract_file == null:
        push_error("Contract file open failed: " + contract_path)
        get_tree().quit(16)
        return
    contract_file.store_string(JSON.stringify(contract, "  ") + "\n")
    contract_file.close()
    print("CALIBRATION_CAPTURE_SAVED=" + capture_path)
    print("CALIBRATION_CONTRACT_SAVED=" + contract_path)
    get_tree().quit()

func _v3(value: Vector3) -> Array:
    return [snappedf(value.x, 0.0001), snappedf(value.y, 0.0001), snappedf(value.z, 0.0001)]
