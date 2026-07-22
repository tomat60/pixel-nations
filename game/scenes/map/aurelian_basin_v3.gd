extends "res://scenes/map/aurelian_basin_v2.gd"

@onready var authored_camera: Camera3D = $CameraRig/Camera3D
@onready var authored_terrain: Node3D = $BasinTerrain
@onready var authored_props: Node3D = $GeographyProps
@onready var authored_interaction: Node3D = $Interaction
@onready var authored_claimed: Node3D = $ClaimedState

func _build_environment() -> void:
    camera = authored_camera
    camera.look_at(Vector3(0.0, 0.0, 0.8), Vector3.UP)
    camera.current = true

func _build_geography() -> void:
    for region_id in region_defs.keys():
        var definition: Dictionary = region_defs[region_id]
        region_tiles[region_id] = []
        var center := Vector3.ZERO
        for coord in definition["coords"]:
            var tile_position := _hex_to_world(coord)
            tile_position.y = _height_for_coord(coord, region_id)
            center += tile_position
            var tile := _spawn_asset(
                authored_terrain,
                _terrain_asset_for_coord(coord),
                tile_position,
                0.0,
                Vector3.ONE * 1.14
            )
            if tile != null:
                tile.name = "%s_%d_%d" % [region_id, coord.x, coord.y]
                region_tiles[region_id].append(tile)
            _build_tile_interaction(authored_interaction, region_id, coord, tile_position)
        center /= float(definition["coords"].size())
        region_centers[region_id] = center

    _build_region_props(authored_props)
    _build_world_edges()
    claimed_root = authored_claimed
    _refresh_region_visuals()

func _build_world_edges() -> void:
    var entries := [
        ["decoration/nature/hill_single_A.gltf", Vector3(-6.4, 0.02, -4.8), 0.15, 1.45],
        ["decoration/nature/hill_single_B.gltf", Vector3(-5.5, 0.02, -5.8), -0.2, 1.35],
        ["decoration/nature/tree_single_A.gltf", Vector3(-6.8, 0.08, -3.6), 0.4, 1.28],
        ["decoration/nature/tree_single_B.gltf", Vector3(-5.9, 0.08, -2.8), -0.4, 1.22],
        ["decoration/nature/rock_single_A.gltf", Vector3(6.2, 0.06, -3.9), 0.6, 1.35],
        ["decoration/nature/rock_single_C.gltf", Vector3(6.8, 0.06, -2.5), -0.5, 1.18],
        ["decoration/nature/tree_single_A.gltf", Vector3(-5.8, 0.06, 6.0), 0.2, 1.18],
        ["decoration/nature/tree_single_B.gltf", Vector3(5.7, 0.06, 5.8), -0.2, 1.12],
    ]
    for entry in entries:
        _spawn_asset(
            authored_props,
            String(entry[0]),
            entry[1],
            float(entry[2]),
            Vector3.ONE * float(entry[3])
        )

func _refresh_claimed_footprint() -> void:
    super._refresh_claimed_footprint()
    if claimed_root == null:
        return
    if String(state.get("claimed_land_id", "")) != CLAIMABLE_ID:
        return
    var center: Vector3 = region_centers.get(CLAIMABLE_ID, Vector3.ZERO)
    var claim_light := OmniLight3D.new()
    claim_light.name = "FounderWarmth"
    claim_light.position = center + Vector3(0.0, 2.4, 0.0)
    claim_light.light_color = Color("e9b866")
    claim_light.light_energy = 2.1
    claim_light.omni_range = 5.2
    claimed_root.add_child(claim_light)
