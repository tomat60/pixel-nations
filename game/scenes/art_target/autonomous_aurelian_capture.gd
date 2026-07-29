extends Node3D

const SCENES := {
    "desktop": "res://art_target/autonomous_aurelian/autonomous-desktop.glb",
    "portrait": "res://art_target/autonomous_aurelian/autonomous-portrait.glb",
}

var active_camera: Camera3D
var imported_root: Node3D
var capture_mode: String
var contract_path: String
var normalized_material_surfaces := 0
var normalized_textured_surfaces := 0
var normalized_color_surfaces := 0
var cleared_object_material_overrides := 0
var normalized_material_names: Dictionary = {}

func _ready() -> void:
    capture_mode = OS.get_environment("CAPTURE_MODE")
    var width := int(OS.get_environment("CAPTURE_WIDTH"))
    var height := int(OS.get_environment("CAPTURE_HEIGHT"))
    contract_path = OS.get_environment("CONTRACT_PATH")
    if not SCENES.has(capture_mode):
        push_error("Unsupported CAPTURE_MODE: " + capture_mode)
        get_tree().quit(21)
        return
    if width <= 0 or height <= 0 or contract_path.is_empty():
        push_error("Invalid capture contract environment")
        get_tree().quit(25)
        return

    RenderingServer.set_default_clear_color(Color("#4d5c59"))
    get_window().size = Vector2i(width, height)
    var world_environment := WorldEnvironment.new()
    world_environment.name = "AutonomousProofEnvironment"
    world_environment.environment = _make_environment()
    add_child(world_environment)

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

    # Normalize every render property before the GLB enters the SceneTree.
    # This ensures RenderServer registers the proof materials, not the imported overrides.
    _normalize_imported_materials(imported_root)
    _normalize_imported_lights(imported_root)
    active_camera = _find_camera(imported_root)
    if active_camera == null:
        push_error("No imported Camera3D found")
        get_tree().quit(24)
        return
    active_camera.near = 0.1
    active_camera.far = 2000.0
    active_camera.cull_mask = 0xFFFFF
    add_child(imported_root)
    active_camera.current = true
    call_deferred("_write_contract_after_first_frame")

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

func _normalized_color_for_name(material_name: String, source_color: Color) -> Color:
    var lowered := material_name.to_lower()
    if "terrainolive" in lowered:
        return Color(0.29, 0.36, 0.20, 1.0)
    if "terrainforest" in lowered:
        return Color(0.18, 0.29, 0.16, 1.0)
    if "bankearth" in lowered:
        return Color(0.36, 0.27, 0.17, 1.0)
    if "riverteal" in lowered:
        return Color(0.05, 0.31, 0.37, 1.0)
    if "roadochre" in lowered:
        return Color(0.49, 0.36, 0.22, 1.0)
    if "bridgewood" in lowered:
        return Color(0.28, 0.17, 0.08, 1.0)
    if "bridgestone" in lowered:
        return Color(0.38, 0.40, 0.37, 1.0)
    if source_color.r + source_color.g + source_color.b > 0.03:
        return Color(source_color.r, source_color.g, source_color.b, 1.0)
    return Color("#8a9270")

func _normalize_imported_materials(root: Node) -> void:
    if root is MeshInstance3D:
        var mesh_instance := root as MeshInstance3D
        if mesh_instance.material_override != null or mesh_instance.material_overlay != null:
            cleared_object_material_overrides += 1
        mesh_instance.material_override = null
        mesh_instance.material_overlay = null
        mesh_instance.transparency = 0.0
        mesh_instance.visible = true
        mesh_instance.visibility_range_begin = 0.0
        mesh_instance.visibility_range_end = 0.0
        if mesh_instance.mesh != null:
            for surface in range(mesh_instance.mesh.get_surface_count()):
                var source_material := mesh_instance.mesh.surface_get_material(surface)
                var proof_material := StandardMaterial3D.new()
                var material_name := "missing"
                if source_material != null and not source_material.resource_name.is_empty():
                    material_name = source_material.resource_name
                proof_material.resource_name = "Proof_" + material_name
                proof_material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
                proof_material.cull_mode = BaseMaterial3D.CULL_DISABLED
                proof_material.transparency = BaseMaterial3D.TRANSPARENCY_DISABLED
                proof_material.disable_receive_shadows = true
                proof_material.vertex_color_use_as_albedo = false
                if source_material is BaseMaterial3D:
                    var source_base := source_material as BaseMaterial3D
                    proof_material.uv1_scale = source_base.uv1_scale
                    proof_material.uv1_offset = source_base.uv1_offset
                    proof_material.texture_filter = source_base.texture_filter
                    if source_base.albedo_texture != null:
                        proof_material.albedo_texture = source_base.albedo_texture
                        proof_material.albedo_color = Color.WHITE
                        normalized_textured_surfaces += 1
                    else:
                        proof_material.albedo_color = _normalized_color_for_name(material_name, source_base.albedo_color)
                        normalized_color_surfaces += 1
                else:
                    proof_material.albedo_color = Color("#8a9270")
                    normalized_color_surfaces += 1
                mesh_instance.set_surface_override_material(surface, proof_material)
                normalized_material_surfaces += 1
                normalized_material_names[material_name] = int(normalized_material_names.get(material_name, 0)) + 1
    for child in root.get_children():
        _normalize_imported_materials(child)

func _normalize_imported_lights(root: Node) -> void:
    var lights: Array[DirectionalLight3D] = []
    _collect_directional_lights(root, lights)
    if lights.is_empty():
        var fallback := DirectionalLight3D.new()
        fallback.name = "AutonomousProofSun"
        fallback.rotation_degrees = Vector3(-42.0, 28.0, 18.0)
        root.add_child(fallback)
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

func _write_contract_after_first_frame() -> void:
    await get_tree().process_frame
    await RenderingServer.frame_post_draw
    var viewport_size := get_viewport().get_visible_rect().size
    var contract := {
        "mode": capture_mode,
        "scene_resource": SCENES[capture_mode],
        "capture_backend": "godot_movie_writer_png",
        "material_registration": "normalized_off_tree_before_render_server_registration",
        "viewport_width": int(viewport_size.x),
        "viewport_height": int(viewport_size.y),
        "window_width": get_window().size.x,
        "window_height": get_window().size.y,
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
            "material_mode": "fresh_unshaded_standard_preserve_texture_uv",
        },
        "mesh_instances": _count_nodes(imported_root, "MeshInstance3D"),
        "camera_nodes": _count_nodes(imported_root, "Camera3D"),
        "directional_lights": _count_nodes(imported_root, "DirectionalLight3D"),
        "normalized_material_surfaces": normalized_material_surfaces,
        "normalized_textured_surfaces": normalized_textured_surfaces,
        "normalized_color_surfaces": normalized_color_surfaces,
        "cleared_object_material_overrides": cleared_object_material_overrides,
        "normalized_material_names": normalized_material_names,
    }
    var file := FileAccess.open(contract_path, FileAccess.WRITE)
    if file == null:
        push_error("Failed to open contract output")
        get_tree().quit(28)
        return
    file.store_string(JSON.stringify(contract, "  ") + "\n")
    print("AUTONOMOUS_GODOT_MATERIAL_SURFACES=" + str(normalized_material_surfaces))
    print("AUTONOMOUS_GODOT_TEXTURED_SURFACES=" + str(normalized_textured_surfaces))
    print("AUTONOMOUS_GODOT_COLOR_SURFACES=" + str(normalized_color_surfaces))
    print("AUTONOMOUS_GODOT_CLEARED_OBJECT_OVERRIDES=" + str(cleared_object_material_overrides))
    print("AUTONOMOUS_GODOT_SCENE_READY=" + capture_mode)
    print("AUTONOMOUS_GODOT_CONTRACT_SAVED=" + contract_path)

func _v3(value: Vector3) -> Array:
    return [snappedf(value.x, 0.0001), snappedf(value.y, 0.0001), snappedf(value.z, 0.0001)]
