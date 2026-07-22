extends "res://scenes/map/aurelian_basin_v2.gd"

func _build_environment() -> void:
    var world_environment := WorldEnvironment.new()
    world_environment.name = "Environment"
    var environment := Environment.new()
    environment.background_mode = Environment.BG_COLOR
    environment.background_color = Color("223039")
    environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
    environment.ambient_light_color = Color("d6c9ad")
    environment.ambient_light_energy = 0.62
    environment.fog_enabled = true
    environment.fog_light_color = Color("a9b0a2")
    environment.fog_density = 0.008
    world_environment.environment = environment
    add_child(world_environment)

    var sun := DirectionalLight3D.new()
    sun.name = "LateMorningSun"
    sun.rotation_degrees = Vector3(-48.0, -34.0, 0.0)
    sun.light_color = Color("ffe0ab")
    sun.light_energy = 1.18
    sun.shadow_enabled = true
    add_child(sun)

    var fill := DirectionalLight3D.new()
    fill.name = "CoolFill"
    fill.rotation_degrees = Vector3(-62.0, 142.0, 0.0)
    fill.light_color = Color("8ea5aa")
    fill.light_energy = 0.22
    fill.shadow_enabled = false
    add_child(fill)

    camera = Camera3D.new()
    camera.name = "Camera3D"
    camera.projection = Camera3D.PROJECTION_ORTHOGONAL
    camera.size = 17.2
    camera.position = Vector3(13.2, 14.5, 13.2)
    add_child(camera)
    camera.look_at(Vector3(0.0, 0.0, 0.8), Vector3.UP)
    camera.current = true
