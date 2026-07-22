extends Node3D

const GameState = preload("res://core/game_state.gd")
const VisualLanguage = preload("res://core/visual_language.gd")

const SAVE_PATH := "user://aurelian_basin_v2.json"
const CLAIMABLE_ID := "A-01-0042"
const ASSET_ROOT := "res://assets/aurelian-basin/kaykit/"
const SQRT_THREE := 1.7320508075688772

var state: Dictionary = GameState.initial_state()
var region_defs: Dictionary = {}
var region_tiles: Dictionary = {}
var region_centers: Dictionary = {}
var selected_id := ""
var hovered_id := ""

var camera: Camera3D
var land_name_label: Label
var land_id_label: Label
var land_trait_label: Label
var status_label: Label
var claim_button: Button
var claimed_root: Node3D

var overlay_hover: StandardMaterial3D
var overlay_selected: StandardMaterial3D
var overlay_claimed: StandardMaterial3D
var overlay_locked: StandardMaterial3D

static func region_manifest() -> Dictionary:
    return {
        "A-01-0042": {
            "name": "Hearthmeadow",
            "trait": "Fertile river bend",
            "claimable": true,
            "coords": [Vector2i(0, 0), Vector2i(1, 0), Vector2i(0, 1), Vector2i(1, -1), Vector2i(-1, 1)],
        },
        "A-01-0041": {
            "name": "Northwood",
            "trait": "Timber ridge",
            "claimable": false,
            "coords": [Vector2i(-1, -2), Vector2i(0, -2), Vector2i(-2, -1), Vector2i(-1, -1), Vector2i(0, -1)],
        },
        "A-01-0043": {
            "name": "Amber Ford",
            "trait": "Eastern crossing",
            "claimable": false,
            "coords": [Vector2i(2, -1), Vector2i(2, 0), Vector2i(1, 1), Vector2i(2, 1), Vector2i(3, 0)],
        },
        "A-01-0036": {
            "name": "Westwatch",
            "trait": "Raised western approach",
            "claimable": false,
            "coords": [Vector2i(-3, 0), Vector2i(-2, 0), Vector2i(-3, 1), Vector2i(-2, 1), Vector2i(-3, 2)],
        },
        "A-01-0048": {
            "name": "Sunfield",
            "trait": "Open southern plain",
            "claimable": false,
            "coords": [Vector2i(0, 2), Vector2i(1, 2), Vector2i(2, 2), Vector2i(0, 3), Vector2i(1, 3)],
        },
        "A-01-0037": {
            "name": "Stonewake",
            "trait": "Rocky eastern shoulder",
            "claimable": false,
            "coords": [Vector2i(1, -3), Vector2i(2, -3), Vector2i(2, -2), Vector2i(3, -2), Vector2i(3, -1)],
        },
        "A-01-0047": {
            "name": "Willowbank",
            "trait": "Sheltered southern bank",
            "claimable": false,
            "coords": [Vector2i(-2, 2), Vector2i(-1, 2), Vector2i(-2, 3), Vector2i(-1, 3), Vector2i(-3, 3)],
        },
    }

static func all_region_coordinates_are_unique() -> bool:
    var seen := {}
    for definition in region_manifest().values():
        for coord in definition["coords"]:
            var key := "%d,%d" % [coord.x, coord.y]
            if seen.has(key):
                return false
            seen[key] = true
    return true

func _ready() -> void:
    region_defs = region_manifest()
    _load_state()
    _build_overlay_materials()
    _build_environment()
    _build_geography()
    _build_hud()
    _refresh_claimed_footprint()
    _select_region(CLAIMABLE_ID)

func _build_overlay_materials() -> void:
    overlay_hover = _overlay_material(VisualLanguage.overlay_for_state("hovered"))
    overlay_selected = _overlay_material(VisualLanguage.overlay_for_state("selected"))
    overlay_claimed = _overlay_material(VisualLanguage.overlay_for_state("claimed"))
    overlay_locked = _overlay_material(VisualLanguage.overlay_for_state("locked"))

func _overlay_material(color: Color) -> StandardMaterial3D:
    var material := StandardMaterial3D.new()
    material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
    material.albedo_color = color
    material.metallic = 0.0
    material.roughness = 0.72
    material.emission_enabled = true
    material.emission = Color(color.r, color.g, color.b, 1.0)
    material.emission_energy_multiplier = 0.18
    return material

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
    camera.look_at(Vector3(0.0, 0.0, 0.8), Vector3.UP)
    camera.current = true
    add_child(camera)

func _build_geography() -> void:
    var terrain_root := Node3D.new()
    terrain_root.name = "BasinTerrain"
    add_child(terrain_root)

    var interaction_root := Node3D.new()
    interaction_root.name = "Interaction"
    add_child(interaction_root)

    for region_id in region_defs.keys():
        var definition: Dictionary = region_defs[region_id]
        region_tiles[region_id] = []
        var center := Vector3.ZERO
        for coord in definition["coords"]:
            var position := _hex_to_world(coord)
            position.y = _height_for_coord(coord, region_id)
            center += position

            var terrain_asset := _terrain_asset_for_coord(coord)
            var tile := _spawn_asset(terrain_root, terrain_asset, position, 0.0, Vector3.ONE)
            if tile != null:
                tile.name = "%s_%d_%d" % [region_id, coord.x, coord.y]
                region_tiles[region_id].append(tile)

            _build_tile_interaction(interaction_root, region_id, coord, position)

        center /= float(definition["coords"].size())
        region_centers[region_id] = center

    _build_region_props(terrain_root)

    claimed_root = Node3D.new()
    claimed_root.name = "ClaimedState"
    add_child(claimed_root)

    _refresh_region_visuals()

func _hex_to_world(coord: Vector2i) -> Vector3:
    return Vector3(
        float(coord.x) * 1.5,
        0.0,
        SQRT_THREE * (float(coord.y) + float(coord.x) * 0.5)
    )

func _height_for_coord(coord: Vector2i, region_id: String) -> float:
    if region_id == "A-01-0041":
        return 0.20 + 0.10 * float(abs(coord.x + coord.y) % 2)
    if region_id == "A-01-0037":
        return 0.28 + 0.12 * float(abs(coord.x) % 2)
    if region_id == "A-01-0036":
        return 0.14
    return 0.0

func _terrain_asset_for_coord(coord: Vector2i) -> String:
    var key := "%d,%d" % [coord.x, coord.y]
    var overrides := {
        "-2,1": "tiles/coast/hex_coast_A.gltf",
        "-1,1": "tiles/base/hex_water.gltf",
        "0,1": "tiles/base/hex_water.gltf",
        "1,0": "tiles/rivers/hex_river_crossing_A.gltf",
        "2,0": "tiles/coast/hex_coast_C.gltf",
        "3,0": "tiles/coast/hex_coast_D.gltf",
        "0,0": "tiles/roads/hex_road_A.gltf",
        "1,-1": "tiles/roads/hex_road_B.gltf",
        "0,-1": "tiles/roads/hex_road_C.gltf",
        "-2,0": "tiles/roads/hex_road_A_sloped_low.gltf",
        "2,-1": "tiles/roads/hex_road_A_sloped_high.gltf",
    }
    return String(overrides.get(key, "tiles/base/hex_grass.gltf"))

func _build_tile_interaction(parent: Node3D, region_id: String, coord: Vector2i, position: Vector3) -> void:
    var area := Area3D.new()
    area.name = "Pick_%s_%d_%d" % [region_id, coord.x, coord.y]
    area.position = position + Vector3(0.0, 0.35, 0.0)
    area.input_ray_pickable = true
    area.collision_layer = 1
    area.collision_mask = 1
    area.set_meta("region_id", region_id)

    var collision := CollisionShape3D.new()
    var shape := BoxShape3D.new()
    shape.size = Vector3(1.55, 0.7, 1.72)
    collision.shape = shape
    area.add_child(collision)

    area.mouse_entered.connect(_on_region_mouse_entered.bind(region_id))
    area.mouse_exited.connect(_on_region_mouse_exited.bind(region_id))
    area.input_event.connect(_on_region_input.bind(region_id))
    parent.add_child(area)

func _build_region_props(parent: Node3D) -> void:
    _spawn_cluster(parent, "A-01-0041", [
        ["decoration/nature/hill_single_A.gltf", Vector3(-0.8, 0.0, -0.4), 0.0, 0.85],
        ["decoration/nature/tree_single_A.gltf", Vector3(0.4, 0.0, -0.5), 0.3, 0.95],
        ["decoration/nature/tree_single_B.gltf", Vector3(-0.1, 0.0, 0.7), -0.4, 0.88],
    ])
    _spawn_cluster(parent, "A-01-0037", [
        ["decoration/nature/hill_single_B.gltf", Vector3(0.4, 0.0, -0.5), -0.2, 0.95],
        ["decoration/nature/rock_single_A.gltf", Vector3(-0.7, 0.0, 0.4), 0.6, 1.05],
        ["decoration/nature/rock_single_C.gltf", Vector3(0.7, 0.0, 0.6), -0.5, 0.92],
    ])
    _spawn_cluster(parent, "A-01-0036", [
        ["decoration/nature/hill_single_C.gltf", Vector3(-0.5, 0.0, 0.0), 0.1, 0.85],
        ["decoration/nature/rock_single_B.gltf", Vector3(0.8, 0.0, 0.5), 0.5, 0.82],
    ])
    _spawn_cluster(parent, "A-01-0047", [
        ["decoration/nature/tree_single_A.gltf", Vector3(-0.8, 0.0, 0.3), -0.2, 0.90],
        ["decoration/nature/tree_single_B.gltf", Vector3(0.6, 0.0, -0.5), 0.4, 0.86],
    ])
    _spawn_cluster(parent, "A-01-0048", [
        ["decoration/nature/tree_single_B.gltf", Vector3(0.8, 0.0, 0.4), -0.3, 0.72],
    ])
    _spawn_cluster(parent, "A-01-0043", [
        ["buildings/neutral/building_bridge_A.gltf", Vector3(-0.2, 0.05, 0.0), 0.0, 0.62],
        ["decoration/nature/rock_single_A.gltf", Vector3(0.9, 0.0, -0.7), 0.4, 0.76],
    ])
    _spawn_cluster(parent, CLAIMABLE_ID, [
        ["decoration/nature/tree_single_A.gltf", Vector3(-1.0, 0.0, 0.7), 0.3, 0.72],
        ["decoration/nature/rock_single_B.gltf", Vector3(1.0, 0.0, -0.6), -0.3, 0.62],
    ])

func _spawn_cluster(parent: Node3D, region_id: String, entries: Array) -> void:
    var center: Vector3 = region_centers[region_id]
    for entry in entries:
        var relative_path := String(entry[0])
        var offset: Vector3 = entry[1]
        var yaw := float(entry[2])
        var uniform_scale := float(entry[3])
        _spawn_asset(parent, relative_path, center + offset + Vector3(0.0, 0.08, 0.0), yaw, Vector3.ONE * uniform_scale)

func _spawn_asset(parent: Node, relative_path: String, position: Vector3, yaw: float, asset_scale: Vector3) -> Node3D:
    var resource_path := ASSET_ROOT + relative_path
    if not ResourceLoader.exists(resource_path):
        push_error("AURELIAN_BASIN_ASSET_MISSING: %s — run game/tools/vendor_kaykit_subset.py" % resource_path)
        return null
    var packed := load(resource_path) as PackedScene
    if packed == null:
        push_error("AURELIAN_BASIN_ASSET_LOAD_FAILED: %s" % resource_path)
        return null
    var instance := packed.instantiate() as Node3D
    if instance == null:
        push_error("AURELIAN_BASIN_ASSET_INSTANCE_FAILED: %s" % resource_path)
        return null
    instance.position = position
    instance.rotation.y = yaw
    instance.scale = asset_scale
    parent.add_child(instance)
    return instance

func _build_hud() -> void:
    var canvas := CanvasLayer.new()
    canvas.name = "HUD"
    add_child(canvas)

    var title_panel := PanelContainer.new()
    title_panel.position = Vector2(28, 24)
    title_panel.size = Vector2(330, 98)
    title_panel.add_theme_stylebox_override("panel", _panel_style(0.88))
    canvas.add_child(title_panel)

    var title_box := VBoxContainer.new()
    title_box.add_theme_constant_override("separation", 2)
    title_panel.add_child(title_box)
    var sector_label := Label.new()
    sector_label.text = "SECTOR A-01"
    sector_label.add_theme_color_override("font_color", VisualLanguage.ACCENT_GOLD)
    sector_label.add_theme_font_size_override("font_size", 14)
    title_box.add_child(sector_label)
    var basin_label := Label.new()
    basin_label.text = "AURELIAN BASIN"
    basin_label.add_theme_color_override("font_color", VisualLanguage.UI_TEXT)
    basin_label.add_theme_font_size_override("font_size", 24)
    title_box.add_child(basin_label)
    var line := Label.new()
    line.text = "Choose where your history begins."
    line.add_theme_color_override("font_color", VisualLanguage.UI_TEXT_MUTED)
    line.add_theme_font_size_override("font_size", 13)
    title_box.add_child(line)

    var card := PanelContainer.new()
    card.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
    card.position = Vector2(-390, -238)
    card.size = Vector2(360, 208)
    card.add_theme_stylebox_override("panel", _panel_style(0.94))
    canvas.add_child(card)

    var content := VBoxContainer.new()
    content.add_theme_constant_override("separation", 7)
    card.add_child(content)

    land_name_label = Label.new()
    land_name_label.add_theme_color_override("font_color", VisualLanguage.UI_TEXT)
    land_name_label.add_theme_font_size_override("font_size", 23)
    content.add_child(land_name_label)

    land_id_label = Label.new()
    land_id_label.add_theme_color_override("font_color", VisualLanguage.ACCENT_GOLD)
    land_id_label.add_theme_font_size_override("font_size", 13)
    content.add_child(land_id_label)

    land_trait_label = Label.new()
    land_trait_label.add_theme_color_override("font_color", VisualLanguage.UI_TEXT_MUTED)
    land_trait_label.add_theme_font_size_override("font_size", 14)
    content.add_child(land_trait_label)

    status_label = Label.new()
    status_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
    status_label.add_theme_color_override("font_color", VisualLanguage.UI_TEXT_MUTED)
    status_label.add_theme_font_size_override("font_size", 13)
    content.add_child(status_label)

    claim_button = Button.new()
    claim_button.text = "CLAIM LAND"
    claim_button.custom_minimum_size = Vector2(0, 44)
    claim_button.add_theme_color_override("font_color", VisualLanguage.UI_INK)
    claim_button.add_theme_font_size_override("font_size", 15)
    claim_button.add_theme_stylebox_override("normal", _button_style(VisualLanguage.ACCENT_GOLD))
    claim_button.add_theme_stylebox_override("hover", _button_style(Color("ddbd70")))
    claim_button.add_theme_stylebox_override("pressed", _button_style(Color("aa8744")))
    claim_button.pressed.connect(_claim_selected_land)
    content.add_child(claim_button)

func _panel_style(alpha: float) -> StyleBoxFlat:
    var style := StyleBoxFlat.new()
    style.bg_color = Color(VisualLanguage.UI_INK.r, VisualLanguage.UI_INK.g, VisualLanguage.UI_INK.b, alpha)
    style.border_color = Color(VisualLanguage.ACCENT_GOLD.r, VisualLanguage.ACCENT_GOLD.g, VisualLanguage.ACCENT_GOLD.b, 0.34)
    style.set_border_width_all(1)
    style.set_corner_radius_all(8)
    style.content_margin_left = 18
    style.content_margin_right = 18
    style.content_margin_top = 14
    style.content_margin_bottom = 14
    return style

func _button_style(color: Color) -> StyleBoxFlat:
    var style := StyleBoxFlat.new()
    style.bg_color = color
    style.set_corner_radius_all(6)
    style.content_margin_top = 10
    style.content_margin_bottom = 10
    return style

func _on_region_mouse_entered(region_id: String) -> void:
    hovered_id = region_id
    _refresh_region_visuals()

func _on_region_mouse_exited(region_id: String) -> void:
    if hovered_id == region_id:
        hovered_id = ""
    _refresh_region_visuals()

func _on_region_input(_camera: Node, event: InputEvent, _position: Vector3, _normal: Vector3, _shape_idx: int, region_id: String) -> void:
    if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
        _select_region(region_id)

func _select_region(region_id: String) -> void:
    if not region_defs.has(region_id):
        return
    selected_id = region_id
    _refresh_region_visuals()
    _refresh_hud()

func _refresh_region_visuals() -> void:
    for region_id in region_defs.keys():
        var material: Material = null
        var claimed_id := String(state.get("claimed_land_id", ""))
        if region_id == claimed_id:
            material = overlay_claimed
        elif region_id == selected_id:
            material = overlay_selected
        elif region_id == hovered_id:
            material = overlay_hover
        elif not bool(region_defs[region_id]["claimable"]):
            material = overlay_locked
        for tile in region_tiles.get(region_id, []):
            _apply_overlay(tile, material)

func _apply_overlay(root: Node, material: Material) -> void:
    for node in root.find_children("*", "MeshInstance3D", true, false):
        var mesh_instance := node as MeshInstance3D
        mesh_instance.material_overlay = material

func _refresh_hud() -> void:
    if selected_id.is_empty() or not region_defs.has(selected_id):
        return
    var definition: Dictionary = region_defs[selected_id]
    land_name_label.text = String(definition["name"])
    land_id_label.text = selected_id
    land_trait_label.text = String(definition["trait"])

    var claimed_id := String(state.get("claimed_land_id", ""))
    if selected_id == claimed_id:
        status_label.text = "Founder land claimed. The first settlement footprint now exists in the world."
        claim_button.text = "LAND CLAIMED"
        claim_button.disabled = true
    elif not claimed_id.is_empty():
        status_label.text = "Your origin is already established in %s." % String(region_defs[claimed_id]["name"])
        claim_button.text = "ORIGIN ALREADY CHOSEN"
        claim_button.disabled = true
    elif bool(definition["claimable"]):
        status_label.text = "Fertile ground, a river crossing and routes into the wider basin."
        claim_button.text = "CLAIM LAND"
        claim_button.disabled = false
    else:
        status_label.text = "Visible strategic land. Claiming is locked in this first demo slice."
        claim_button.text = "NOT AVAILABLE"
        claim_button.disabled = true

func _claim_selected_land() -> void:
    if selected_id != CLAIMABLE_ID:
        return
    state = GameState.reduce(state, {"type": "CLAIM_LAND", "land_id": selected_id})
    _save_state()
    _refresh_claimed_footprint()
    _refresh_region_visuals()
    _refresh_hud()

func _refresh_claimed_footprint() -> void:
    if claimed_root == null:
        return
    for child in claimed_root.get_children():
        child.queue_free()

    if String(state.get("claimed_land_id", "")) != CLAIMABLE_ID:
        return

    var center: Vector3 = region_centers[CLAIMABLE_ID]
    _spawn_asset(claimed_root, "decoration/props/flag_blue.gltf", center + Vector3(0.0, 0.12, 0.0), 0.0, Vector3.ONE * 0.92)
    _spawn_asset(claimed_root, "buildings/blue/building_blacksmith_blue.gltf", center + Vector3(-0.85, 0.08, 0.8), -0.35, Vector3.ONE * 0.34)
    _spawn_asset(claimed_root, "buildings/blue/building_barracks_blue.gltf", center + Vector3(0.85, 0.08, 0.55), 0.35, Vector3.ONE * 0.31)
    _spawn_asset(claimed_root, "buildings/blue/building_church_blue.gltf", center + Vector3(0.1, 0.08, -0.85), 0.0, Vector3.ONE * 0.30)

func _save_state() -> void:
    var save_file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
    if save_file == null:
        push_error("AURELIAN_BASIN_SAVE_OPEN_FAILED")
        return
    save_file.store_string(GameState.to_json(state))

func _load_state() -> void:
    if not FileAccess.file_exists(SAVE_PATH):
        state = GameState.initial_state()
        return
    var save_file := FileAccess.open(SAVE_PATH, FileAccess.READ)
    if save_file == null:
        state = GameState.initial_state()
        return
    var restored := GameState.from_json(save_file.get_as_text())
    state = restored if not restored.is_empty() else GameState.initial_state()
