extends Node3D

const MANIFEST_PATH := "res://art_target/kaykit/manifest.json"
const TERRAIN_PATH := "res://art_target/terrain/aurelian_basin.glb"
var camera: Camera3D
var manifest: Dictionary

func _ready() -> void:
    manifest = JSON.parse_string(FileAccess.get_file_as_string(MANIFEST_PATH))
    if manifest.is_empty():
        push_error("Missing curated KayKit manifest")
        get_tree().quit(2)
        return
    _add_environment()
    _load_authored_terrain()
    _add_settlement()
    _add_camera()
    call_deferred("_capture")

func _add_environment() -> void:
    var world := WorldEnvironment.new()
    var env := Environment.new()
    env.background_mode = Environment.BG_COLOR
    env.background_color = Color("#9eb7b0")
    env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
    env.ambient_light_color = Color("#d9d0b6")
    env.ambient_light_energy = 0.72
    env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
    world.environment = env
    add_child(world)

    var sun := DirectionalLight3D.new()
    sun.rotation_degrees = Vector3(-52, -34, 0)
    sun.light_color = Color("#ffe0aa")
    sun.light_energy = 1.55
    sun.shadow_enabled = true
    sun.directional_shadow_max_distance = 140.0
    add_child(sun)

func _load_authored_terrain() -> void:
    var packed = load(TERRAIN_PATH)
    if packed == null:
        push_error("Missing authored terrain: " + TERRAIN_PATH)
        get_tree().quit(3)
        return
    var terrain: Node3D = packed.instantiate()
    terrain.name = "AuthoredTerrainRoot"
    add_child(terrain)

func _place(role: String, pos: Vector3, rot_y: float, scale_value := 2.0) -> void:
    if not manifest.models.has(role):
        push_error("Missing manifest role: " + role)
        return
    var path: String = manifest.models[role].resource_path
    var packed = load(path)
    if packed == null:
        push_error("Missing asset: " + path)
        return
    var node: Node3D = packed.instantiate()
    node.name = role.capitalize()
    node.position = pos
    node.rotation_degrees.y = rot_y
    node.scale = Vector3.ONE * scale_value
    add_child(node)

func _add_settlement() -> void:
    # Crossing, rocky shoulder and founder flag are authored into the terrain/support GLB.
    _place("church", Vector3(20, 0.2, -17), 205, 2.4)
    _place("blacksmith", Vector3(10, -0.1, -5), 150, 2.1)
    _place("barracks", Vector3(25, 0.3, -7), 220, 2.1)
    _place("market", Vector3(16, -0.1, -8), 175, 2.0)
    _place("well", Vector3(17, 0.0, -10), 0, 1.8)
    _place("house_a", Vector3(13, 0.0, -15), 200, 1.9)
    _place("house_b", Vector3(22, 0.2, -11), 165, 1.9)
    _place("house_a", Vector3(18, -0.1, -3), 235, 1.9)

    for p in [Vector3(-31, 5.0, -20), Vector3(-26, 5.4, -16), Vector3(-35, 4.4, -10), Vector3(-22, 4.5, -24), Vector3(-17, 3.0, -19), Vector3(-29, 3.8, -5)]:
        _place("tree", p, float((p.x + p.z) * 9.0), 2.3)
    for p in [Vector3(34, 3.0, -9), Vector3(38, 4.8, 1), Vector3(31, 3.2, 12)]:
        _place("rock", p, 30, 2.4)

    var label := Label3D.new()
    label.text = "Hearthmeadow"
    label.position = Vector3(17, 8, -10)
    label.font_size = 44
    label.outline_size = 10
    label.modulate = Color("#f3dfad")
    add_child(label)

func _add_camera() -> void:
    camera = Camera3D.new()
    camera.projection = Camera3D.PROJECTION_ORTHOGONAL
    camera.size = 58.0
    camera.position = Vector3(58, 58, 66)
    camera.look_at_from_position(camera.position, Vector3(5, 0, -2), Vector3.UP)
    camera.current = true
    add_child(camera)

func _capture() -> void:
    var w := int(OS.get_environment("CAPTURE_WIDTH"))
    var h := int(OS.get_environment("CAPTURE_HEIGHT"))
    if w <= 0 or h <= 0:
        push_error("Missing capture dimensions")
        get_tree().quit(4)
        return
    if h > w:
        camera.size = 78.0
    await get_tree().process_frame
    await get_tree().process_frame
    await get_tree().create_timer(2.0).timeout
    var path := OS.get_environment("CAPTURE_PATH")
    if path.is_empty():
        push_error("Missing capture path")
        get_tree().quit(5)
        return
    var result := get_viewport().get_texture().get_image().save_png(path)
    if result != OK:
        push_error("Capture save failed: " + error_string(result))
        get_tree().quit(6)
        return
    print("CAPTURE_SAVED=" + path + " VIEWPORT=" + str(get_viewport().get_visible_rect().size))
    get_tree().quit()
