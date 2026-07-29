extends Node3D

const SCALE := 11.71437541
const MODEL_PATHS := {
    "home_a": "res://art_target/aurelian_basin/building_home_A_red.gltf",
    "home_b": "res://art_target/aurelian_basin/building_home_B_red.gltf",
    "blacksmith": "res://art_target/aurelian_basin/building_blacksmith_red.gltf",
    "church": "res://art_target/aurelian_basin/building_church_red.gltf",
    "barracks": "res://art_target/aurelian_basin/building_barracks_red.gltf",
    "market": "res://art_target/aurelian_basin/building_market_red.gltf",
    "well": "res://art_target/aurelian_basin/building_well_red.gltf",
}

const DESKTOP_LAYOUT := {
    "blacksmith": [Vector3(-17.0, 0.0, 4.0), -18.0],
    "home_a": [Vector3(8.0, 0.0, 7.0), 12.0],
    "home_b": [Vector3(24.0, 0.0, 1.0), -12.0],
    "market": [Vector3(8.0, 0.0, -10.0), 8.0],
    "well": [Vector3(20.0, 0.0, -13.0), 0.0],
    "barracks": [Vector3(38.0, 0.0, -9.0), -24.0],
    "church": [Vector3(31.0, 0.0, -30.0), -20.0],
}

const PORTRAIT_LAYOUT := {
    "blacksmith": [Vector3(-13.0, 0.0, 15.0), -12.0],
    "home_a": [Vector3(10.0, 0.0, 2.0), 16.0],
    "market": [Vector3(-9.0, 0.0, -5.0), 6.0],
    "well": [Vector3(12.0, 0.0, -11.0), 0.0],
    "barracks": [Vector3(-23.0, 0.0, -21.0), -18.0],
    "church": [Vector3(18.0, 0.0, -35.0), -12.0],
}

var camera: Camera3D
var role_contract: Dictionary = {}
var capture_mode := "desktop"

func _ready() -> void:
    capture_mode = OS.get_environment("CAPTURE_MODE")
    if capture_mode != "portrait":
        capture_mode = "desktop"
    _add_environment()
    _add_terrain()
    _add_river_and_crossing()
    _add_road()
    var layout: Dictionary = PORTRAIT_LAYOUT if capture_mode == "portrait" else DESKTOP_LAYOUT
    for role_variant in layout.keys():
        var role := String(role_variant)
        await _place_model(role, layout[role][0], float(layout[role][1]))
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
    sun.directional_shadow_max_distance = 190.0
    add_child(sun)

func _material(color: Color, roughness := 0.94) -> StandardMaterial3D:
    var material := StandardMaterial3D.new()
    material.albedo_color = color
    material.roughness = roughness
    return material

func _box(name_value: String, position_value: Vector3, size_value: Vector3, color: Color) -> MeshInstance3D:
    var node := MeshInstance3D.new()
    node.name = name_value
    var mesh := BoxMesh.new()
    mesh.size = size_value
    mesh.material = _material(color)
    node.mesh = mesh
    node.position = position_value
    add_child(node)
    return node

func _segment(name_value: String, start: Vector2, finish: Vector2, width: float, y: float, thickness: float, color: Color) -> void:
    var delta := finish - start
    var length := delta.length()
    var center := (start + finish) * 0.5
    var node := _box(name_value, Vector3(center.x, y, center.y), Vector3(width, thickness, length), color)
    node.rotation.y = -atan2(delta.x, delta.y)

func _add_terrain() -> void:
    _box("ContinuousTerrain", Vector3(0.0, -0.75, -4.0), Vector3(190.0, 1.5, 155.0), Color("#66765b"))
    _box("NorthShoulder", Vector3(27.0, 0.15, -53.0), Vector3(86.0, 0.35, 25.0), Color("#758061"))
    _box("WestShoulder", Vector3(-52.0, 0.08, -8.0), Vector3(30.0, 0.28, 82.0), Color("#6f7c5d"))
    _box("SettlementRise", Vector3(18.0, 0.12, -14.0), Vector3(76.0, 0.25, 57.0), Color("#72805f"))

func _add_river_and_crossing() -> void:
    var river_points := [
        Vector2(-92.0, -36.0), Vector2(-60.0, -28.0), Vector2(-34.0, -11.0),
        Vector2(-15.0, 8.0), Vector2(9.0, 20.0), Vector2(42.0, 27.0), Vector2(92.0, 34.0)
    ]
    for index in range(river_points.size() - 1):
        _segment("RiverBed_%02d" % index, river_points[index], river_points[index + 1], 25.0, -1.35, 1.1, Color("#4d6463"))
        _segment("RiverWater_%02d" % index, river_points[index], river_points[index + 1], 19.0, -0.43, 0.12, Color("#4f858b"))
        _segment("BankNorth_%02d" % index, river_points[index] + Vector2(0.0, -11.0), river_points[index + 1] + Vector2(0.0, -11.0), 4.0, -0.08, 0.25, Color("#596d55"))
        _segment("BankSouth_%02d" % index, river_points[index] + Vector2(0.0, 11.0), river_points[index + 1] + Vector2(0.0, 11.0), 4.0, -0.08, 0.25, Color("#596d55"))

    _box("BridgeDeck", Vector3(-14.0, 0.18, 7.0), Vector3(6.0, 0.55, 29.0), Color("#765b3f"))
    _box("BridgeSupportA", Vector3(-14.0, -0.72, -3.0), Vector3(5.0, 1.9, 2.2), Color("#756b58"))
    _box("BridgeSupportB", Vector3(-14.0, -0.72, 17.0), Vector3(5.0, 1.9, 2.2), Color("#756b58"))
    for plank_index in range(7):
        _box("BridgePlank_%02d" % plank_index, Vector3(-14.0, 0.49, -5.0 + plank_index * 4.0), Vector3(6.5, 0.10, 0.42), Color("#9a7b53"))

func _add_road() -> void:
    var road_points := [
        Vector2(-58.0, 55.0), Vector2(-40.0, 39.0), Vector2(-23.0, 22.0),
        Vector2(-14.0, 8.0), Vector2(-3.0, -1.0), Vector2(12.0, -5.0), Vector2(26.0, -11.0)
    ]
    for index in range(road_points.size() - 1):
        _segment("Road_%02d" % index, road_points[index], road_points[index + 1], 5.0, 0.035, 0.07, Color("#9a805d"))
    _box("Commons", Vector3(14.0, 0.025, -8.0), Vector3(24.0, 0.05, 19.0), Color("#7d8062"))

func _place_model(role: String, position_value: Vector3, rotation_value: float) -> void:
    var packed := load(MODEL_PATHS[role]) as PackedScene
    if packed == null:
        push_error("Missing KayKit model: " + MODEL_PATHS[role])
        get_tree().quit(11)
        return
    var node := packed.instantiate() as Node3D
    node.name = role.capitalize()
    node.scale = Vector3.ONE * SCALE
    node.rotation_degrees.y = rotation_value
    add_child(node)
    node.position = position_value
    await get_tree().process_frame
    var before: AABB = _global_aabb(node)
    var root_y_offset := -before.position.y
    node.position.y += root_y_offset
    await get_tree().process_frame
    var final_aabb: AABB = _global_aabb(node)
    if abs(final_aabb.position.y) > 0.05:
        push_error("Grounding failed for %s: %.5f" % [role, final_aabb.position.y])
        get_tree().quit(12)
        return
    role_contract[role] = {
        "resource_path": MODEL_PATHS[role],
        "uniform_scale": SCALE,
        "root_y_offset": root_y_offset,
        "position": _v3(node.position),
        "rotation_y_degrees": rotation_value,
        "world_aabb_position": _v3(final_aabb.position),
        "world_aabb_size": _v3(final_aabb.size),
    }

func _global_aabb(root: Node3D) -> AABB:
    var found := false
    var merged := AABB()
    var stack: Array[Node] = [root]
    while not stack.is_empty():
        var current: Node = stack.pop_back() as Node
        if current is MeshInstance3D:
            var mesh_instance := current as MeshInstance3D
            if mesh_instance.mesh != null:
                var aabb: AABB = mesh_instance.global_transform * mesh_instance.mesh.get_aabb()
                merged = aabb if not found else merged.merge(aabb)
                found = true
        for child in current.get_children():
            stack.push_back(child)
    if not found:
        push_error("No mesh found under " + root.name)
        get_tree().quit(13)
    return merged

func _add_camera() -> void:
    camera = Camera3D.new()
    camera.projection = Camera3D.PROJECTION_ORTHOGONAL
    if capture_mode == "portrait":
        camera.position = Vector3(31.0, 42.0, 57.0)
        camera.size = 52.0
        camera.look_at_from_position(camera.position, Vector3(0.0, 4.0, 4.0), Vector3.UP)
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
        get_tree().quit(14)
        return
    var target_size := Vector2i(width, height)
    var root_window: Window = get_tree().root
    root_window.content_scale_size = target_size
    root_window.size = target_size
    DisplayServer.window_set_size(target_size)
    await get_tree().process_frame
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
    var target := [0.0, 4.0, 4.0] if capture_mode == "portrait" else [0.0, 3.0, 0.0]
    var contract := {
        "mode": capture_mode,
        "capture_width": image.get_width(),
        "capture_height": image.get_height(),
        "blueprint_source_sha": "3c61f8ade5e582da9798ce8a6f1bc9ac69ecebe2",
        "uniform_scale": SCALE,
        "environment": {"background":"#9aa9a2","ambient_color":"#d7d0bf","ambient_energy":0.48,"tonemap":"filmic","exposure":0.92},
        "directional_light": {"rotation_degrees":[-48.0,-32.0,0.0],"color":"#fff1d4","energy":1.05},
        "camera": {"projection":"orthogonal","position":_v3(camera.position),"orthographic_size":camera.size,"target":target},
        "rules": {"max_primary_overlap":0.30,"spacing_world":[14.0,18.0,22.0],"road_width":5.0,"bridge_deck_width":6.0,"bridge_span":27.0},
        "roles": role_contract,
    }
    var contract_file := FileAccess.open(contract_path, FileAccess.WRITE)
    if contract_file == null:
        push_error("Contract file open failed")
        get_tree().quit(16)
        return
    contract_file.store_string(JSON.stringify(contract, "  ") + "\n")
    contract_file.close()
    print("AURELIAN_FRAME_CAPTURE_SAVED=" + capture_path)
    print("AURELIAN_FRAME_CONTRACT_SAVED=" + contract_path)
    get_tree().quit()

func _v3(value: Vector3) -> Array:
    return [snappedf(value.x, 0.0001), snappedf(value.y, 0.0001), snappedf(value.z, 0.0001)]
