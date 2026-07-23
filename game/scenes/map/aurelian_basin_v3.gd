extends "res://scenes/map/aurelian_basin_v2.gd"

@onready var authored_camera: Camera3D = $CameraRig/Camera3D
@onready var authored_terrain: Node3D = $BasinTerrain
@onready var authored_props: Node3D = $GeographyProps
@onready var authored_interaction: Node3D = $Interaction
@onready var authored_claimed: Node3D = $ClaimedState

const AUTHORED_REGION_CENTERS := {
    "A-01-0042": Vector3(0.0, 0.14, 0.45),
    "A-01-0041": Vector3(-2.7, 0.40, -2.65),
    "A-01-0043": Vector3(3.15, 0.12, 0.10),
    "A-01-0036": Vector3(-4.15, 0.22, 0.55),
    "A-01-0048": Vector3(1.25, 0.10, 3.25),
    "A-01-0037": Vector3(3.85, 0.42, -2.75),
    "A-01-0047": Vector3(-2.80, 0.10, 3.30),
}

func _build_environment() -> void:
    camera = authored_camera
    camera.look_at(Vector3(0.0, 0.0, 0.65), Vector3.UP)
    camera.current = true

func _build_geography() -> void:
    # The visible Basin is fully authored in aurelian_basin_v3.tscn. Runtime work is
    # limited to deterministic interaction areas, region identity and KayKit props.
    for region_id in region_defs.keys():
        region_tiles[region_id] = []
        var center: Vector3 = AUTHORED_REGION_CENTERS[region_id]
        region_centers[region_id] = center
        _build_region_interaction(authored_interaction, region_id, center)

    _build_region_props(authored_props)
    _build_world_edges()
    claimed_root = authored_claimed
    _refresh_region_visuals()

func _build_region_interaction(parent: Node3D, region_id: String, center: Vector3) -> void:
    var area := Area3D.new()
    area.name = "Pick_%s" % region_id
    area.position = center + Vector3(0.0, 0.45, 0.0)
    area.input_ray_pickable = true
    area.collision_layer = 1
    area.collision_mask = 1
    area.set_meta("region_id", region_id)

    var collision := CollisionShape3D.new()
    var shape := BoxShape3D.new()
    shape.size = Vector3(2.75, 0.9, 2.45)
    collision.shape = shape
    area.add_child(collision)

    area.mouse_entered.connect(_on_region_mouse_entered.bind(region_id))
    area.mouse_exited.connect(_on_region_mouse_exited.bind(region_id))
    area.input_event.connect(_on_region_input.bind(region_id))
    parent.add_child(area)

func _build_world_edges() -> void:
    var entries := [
        ["decoration/nature/hill_single_A.gltf", Vector3(-5.8, 0.18, -3.9), 0.15, 1.42],
        ["decoration/nature/hill_single_B.gltf", Vector3(-4.9, 0.24, -4.6), -0.2, 1.30],
        ["decoration/nature/tree_single_A.gltf", Vector3(-6.1, 0.22, -2.9), 0.4, 1.20],
        ["decoration/nature/tree_single_B.gltf", Vector3(-5.0, 0.24, -2.0), -0.4, 1.16],
        ["decoration/nature/rock_single_A.gltf", Vector3(5.1, 0.22, -3.2), 0.6, 1.28],
        ["decoration/nature/rock_single_C.gltf", Vector3(5.8, 0.20, -1.7), -0.5, 1.10],
        ["decoration/nature/tree_single_A.gltf", Vector3(-5.2, 0.12, 4.5), 0.2, 1.10],
        ["decoration/nature/tree_single_B.gltf", Vector3(4.9, 0.12, 4.5), -0.2, 1.06],
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

    var activated_route := MeshInstance3D.new()
    activated_route.name = "ActivatedFounderRoad"
    var route_mesh := BoxMesh.new()
    route_mesh.size = Vector3(0.18, 0.035, 2.20)
    activated_route.mesh = route_mesh
    activated_route.position = center + Vector3(0.54, 0.18, 0.96)
    activated_route.rotation.y = -0.26
    var route_material := StandardMaterial3D.new()
    route_material.albedo_color = Color("b88b43")
    route_material.roughness = 0.86
    route_material.emission_enabled = true
    route_material.emission = Color("5b3b18")
    route_material.emission_energy_multiplier = 0.16
    activated_route.material_override = route_material
    claimed_root.add_child(activated_route)

    var claim_light := OmniLight3D.new()
    claim_light.name = "FounderWarmth"
    claim_light.position = center + Vector3(0.0, 2.2, 0.0)
    claim_light.light_color = Color("e5ad59")
    claim_light.light_energy = 1.65
    claim_light.omni_range = 4.5
    claimed_root.add_child(claim_light)
