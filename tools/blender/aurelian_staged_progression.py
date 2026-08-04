#!/usr/bin/env python3
import bpy
import hashlib
import importlib.util
import json
import math
import sys
from pathlib import Path
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if len(argv) != 3:
    raise SystemExit(
        "Usage: blender -b --python aurelian_staged_progression.py -- "
        "<base_script> <kaykit_root> <output_dir>"
    )

base_script, source_root, output_dir = map(Path, argv)
spec = importlib.util.spec_from_file_location("aurelian_base", base_script)
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)

source_root = source_root.resolve()
output_dir = output_dir.resolve()
output_dir.mkdir(parents=True, exist_ok=True)

ACCEPTED_SOURCE_HEAD = "59fbebf4ba2d7cddb77a8ca4d93701b6bec4599a"
STATES = ("camp", "first_shelter", "developed_settlement")

base.ASSETS.update({
    "barracks": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/red/building_barracks_red.gltf",
    "tent": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/tent.gltf",
    "flag_red": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/flag_red.gltf",
    "barrel": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/barrel.gltf",
    "crate_big": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/crate_A_big.gltf",
    "crate_small": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/crate_A_small.gltf",
    "lumber": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/resource_lumber.gltf",
    "sack": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/sack.gltf",
    "wheelbarrow": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/wheelbarrow.gltf",
})

# Binding accepted pass-3 composition from the #315 source chain.
base.LAYOUTS = {
    "desktop": {
        "extent": (460.0, 420.0),
        "grid": (176, 160),
        "river": [(-230, 95), (-184, 76), (-142, 58), (-106, 43), (-70, 22), (-38, -5), (5, -20), (55, -32), (122, -43), (185, -50), (230, -54)],
        "water_z": -3.3,
        "road_before": [(-136, -103), (-108, -82), (-82, -61), (-61, -42), (-45, -25)],
        "road_after": [(-28, -7), (-8, 5), (12, 14), (34, 23), (58, 36)],
        "bridge": {"position": (-36.5, -15.0), "rotation": 42.0, "length": 24.0},
        "buildings": [
            ("blacksmith", (-5, 8), -12, 9.5),
            ("market", (26, 18), 12, 9.0),
            ("well", (39, 31), 0, 8.5),
            ("house_a", (18, 51), 22, 9.2),
            ("house_b", (47, 47), -12, 9.1),
            ("barracks", (78, 2), -25, 5.2),
            ("church", (54, 84), 8, 11.0),
        ],
        "trees": [(-154, 83, 0), (-137, 105, 18), (-118, 91, -15), (-99, 116, 22), (-79, 96, 5), (-163, 127, -18), (-60, 122, 12), (-141, 64, 8), (-104, 66, -20)],
        "rocks": [(132, -5, 0), (151, 19, 30), (124, 42, -18), (162, 68, 15)],
        "camera": {"position": (132, -170, 132), "target": (8, 18, 5), "ortho": 138.0, "resolution": (1440, 900)},
        "camp": {
            "hearth": (8, 40),
            "spur": [(-2, 8), (5, 20), (9, 31), (12, 42)],
            "shelter_spur": [(12, 42), (13, 46), (15, 49), (18, 51)],
            "props": [
                ("tent", (23, 47), -12, 8.6),
                ("flag_red", (2, 36), 0, 8.0),
                ("crate_big", (15, 36), 18, 7.8),
                ("crate_small", (20, 38), -12, 7.2),
                ("lumber", (25, 35), 8, 7.0),
                ("sack", (11, 34), 0, 6.8),
                ("barrel", (18, 32), 0, 7.0),
                ("wheelbarrow", (29, 39), -20, 7.2),
            ],
        },
    },
    "portrait": {
        "extent": (300.0, 460.0),
        "grid": (118, 180),
        "river": [(-150, -55), (-108, -50), (-68, -45), (-34, -39), (-8, -33), (20, -28), (62, -21), (108, -15), (150, -10)],
        "water_z": -3.3,
        "road_before": [(-4, -92), (-4, -76), (-3, -62), (-3, -50), (-2, -41)],
        "road_after": [(0, -24), (1, -4), (4, 20), (6, 44), (7, 70), (5, 96)],
        "bridge": {"position": (-2, -32), "rotation": 84.0, "length": 22.0},
        "buildings": [
            ("blacksmith", (-16, -1), -15, 8.7),
            ("market", (12, 24), 10, 8.4),
            ("well", (-1, 42), 0, 7.8),
            ("house_a", (18, 55), 22, 8.3),
            ("house_b", (21, 74), -10, 8.0),
            ("barracks", (-26, 68), -20, 5.2),
            ("church", (-4, 104), 5, 10.8),
        ],
        "trees": [(-105, 118, 0), (-88, 145, 16), (-116, 174, -12), (-75, 198, 10), (103, 158, -18), (119, 191, 20)],
        "rocks": [(88, 30, 0), (108, 66, 28), (98, 103, -16)],
        "camera": {"position": (76, -174, 142), "target": (0, 34, 9), "ortho": 152.0, "resolution": (390, 844)},
        "camp": {
            "hearth": (1, 46),
            "spur": [(1, -4), (3, 16), (5, 34), (8, 50)],
            "shelter_spur": [(8, 50), (11, 52), (15, 54), (18, 55)],
            "props": [
                ("tent", (17, 53), -10, 7.8),
                ("flag_red", (-9, 42), 0, 7.2),
                ("crate_big", (7, 40), 15, 7.0),
                ("crate_small", (12, 42), -10, 6.5),
                ("lumber", (17, 39), 8, 6.4),
                ("sack", (3, 37), 0, 6.1),
                ("barrel", (11, 35), 0, 6.3),
                ("wheelbarrow", (23, 43), -18, 6.5),
            ],
        },
    },
}

def cube(name, location, dimensions, rotation, material):
    bpy.ops.mesh.primitive_cube_add(
        location=location,
        rotation=(0, 0, math.radians(rotation)),
    )
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(material)
    return obj

def low_bridge(config, materials):
    x, y = config["position"]
    angle, length = config["rotation"], config["length"]
    rad = math.radians(angle)
    along = Vector((math.cos(rad), math.sin(rad), 0))
    across = Vector((-math.sin(rad), math.cos(rad), 0))
    for index in range(13):
        point = Vector((x, y, 0.2)) + along * (-length / 2 + index * length / 12)
        cube(f"BridgePlank_{index:02d}", point, (2.1, 6.2, 0.28), angle, materials["wood"])
    for offset in (-length * 0.28, length * 0.28):
        cube("BridgePier", Vector((x, y, -1.5)) + along * offset, (2.0, 5.1, 3.4), angle, materials["stone"])
    for side in (-1, 1):
        cube("BridgeRail", Vector((x, y, 1.25)) + across * (side * 3.0), (length, 0.22, 0.22), angle, materials["wood"])

def make_emissive_material(name, color, strength):
    material = bpy.data.materials.new(name)
    material.diffuse_color = color
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = 0.65
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = color
        elif "Emission" in bsdf.inputs:
            bsdf.inputs["Emission"].default_value = color
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = strength
    return material

def create_hearth(mode, source, center, materials, placements):
    x, y = center
    z = base.terrain_height(mode, x, y)
    for index, angle in enumerate(range(0, 360, 45)):
        rad = math.radians(angle)
        point = (x + math.cos(rad) * 2.15, y + math.sin(rad) * 2.15)
        _, data = base.import_asset(source, "rock_c", point, angle, 2.0 + (index % 2) * 0.15)
        data["role"] = f"hearth_stone_{index}"
        placements.append(data)

    for index, angle in enumerate((45, -45)):
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=8,
            radius=0.24,
            depth=3.6,
            location=(x, y, z + 0.34),
            rotation=(0, math.radians(90), math.radians(angle)),
        )
        log = bpy.context.object
        log.name = f"HearthLog_{index}"
        log.data.materials.append(materials["wood"])

    flame_outer = make_emissive_material("HearthFlameGold", (1.0, 0.32, 0.04, 1.0), 2.8)
    flame_inner = make_emissive_material("HearthFlameCore", (1.0, 0.75, 0.12, 1.0), 4.0)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.9, location=(x, y, z + 0.9))
    outer = bpy.context.object
    outer.name = "HearthFlameOuter"
    outer.scale = (0.75, 0.75, 1.35)
    outer.data.materials.append(flame_outer)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.58, location=(x, y, z + 1.0))
    inner = bpy.context.object
    inner.name = "HearthFlameInner"
    inner.scale = (0.62, 0.62, 1.15)
    inner.data.materials.append(flame_inner)

    bpy.ops.object.light_add(type="POINT", location=(x, y, z + 2.0))
    light = bpy.context.object
    light.name = "HearthWarmLight"
    light.data.energy = 85.0
    light.data.color = (1.0, 0.42, 0.12)
    light.data.shadow_soft_size = 4.0

def setup_render(mode, preview_path):
    scene = bpy.context.scene
    try:
        scene.render.engine = "BLENDER_EEVEE_NEXT"
    except Exception:
        scene.render.engine = "BLENDER_EEVEE"
    width, height = base.LAYOUTS[mode]["camera"]["resolution"]
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = str(preview_path)
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.exposure = -0.15

    world = bpy.data.worlds.new("AurelianWorld")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.30, 0.36, 0.35, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.55
    scene.world = world

    bpy.ops.object.light_add(type="SUN", location=(0, 0, 120))
    sun = bpy.context.object
    sun.rotation_euler = tuple(math.radians(value) for value in (42, -28, -18))
    sun.data.energy = 1.45
    sun.data.color = (1.0, 0.93, 0.80)

    config = base.LAYOUTS[mode]["camera"]
    bpy.ops.object.camera_add(location=config["position"])
    camera = bpy.context.object
    camera.name = mode.capitalize() + "Camera"
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = config["ortho"]
    base.aim(camera, config["target"])
    scene.camera = camera
    return camera

def state_buildings(layout, state):
    if state == "camp":
        return []
    if state == "first_shelter":
        return [placement for placement in layout["buildings"] if placement[0] == "house_a"]
    return list(layout["buildings"])

def state_road_after(layout, state):
    if state == "developed_settlement":
        return layout["road_after"]
    return layout["camp"]["spur"]

def state_props(layout, state):
    if state == "camp":
        return list(layout["camp"]["props"])
    if state == "first_shelter":
        keep = {"tent", "flag_red", "crate_big", "lumber", "sack", "barrel", "wheelbarrow"}
        return [placement for placement in layout["camp"]["props"] if placement[0] in keep]
    return []

def build_scene(mode, state, source, out):
    base.CURRENT_MODE = mode
    bpy.ops.wm.read_factory_settings(use_empty=True)

    materials = {
        "plain": base.make_material("TerrainOlive", (0.29, 0.36, 0.20, 1), 0.98),
        "ridge": base.make_material("TerrainForest", (0.18, 0.29, 0.16, 1), 0.98),
        "earth": base.make_material("BankEarth", (0.36, 0.27, 0.17, 1), 0.98),
        "water": base.make_material("RiverTeal", (0.05, 0.31, 0.37, 1), 0.35, 0.02),
        "road": base.make_material("RoadOchre", (0.49, 0.36, 0.22, 1), 0.99),
        "wood": base.make_material("BridgeWood", (0.28, 0.17, 0.08, 1), 0.93),
        "stone": base.make_material("BridgeStone", (0.38, 0.40, 0.37, 1), 0.96),
    }

    layout = base.LAYOUTS[mode]
    base.create_terrain(mode, materials)
    base.create_ribbon("RiverWater", mode, layout["river"], 19.0, materials["water"], fixed_z=layout["water_z"])
    base.create_ribbon("RoadApproach", mode, layout["road_before"], 5.0, materials["road"], z_offset=0.12)
    base.create_ribbon("RoadSettlement", mode, state_road_after(layout, state), 5.0, materials["road"], z_offset=0.12)
    if state == "first_shelter":
        base.create_ribbon("ShelterPath", mode, layout["camp"]["shelter_spur"], 3.6, materials["road"], z_offset=0.14)
    low_bridge(layout["bridge"], materials)

    placements = []
    for role, position, rotation, scale in state_buildings(layout, state):
        _, data = base.import_asset(source, role, position, rotation, scale)
        placements.append(data)

    for index, (x, y, rotation) in enumerate(layout["trees"]):
        _, data = base.import_asset(
            source,
            "tree_a" if index % 2 == 0 else "tree_b",
            (x, y),
            rotation,
            7.8 + (index % 3) * 0.5,
        )
        placements.append(data)

    for index, (x, y, rotation) in enumerate(layout["rocks"]):
        _, data = base.import_asset(
            source,
            "rock_c" if index % 2 == 0 else "rock_e",
            (x, y),
            rotation,
            8.5 + (index % 2),
        )
        placements.append(data)

    if state != "developed_settlement":
        create_hearth(mode, source, layout["camp"]["hearth"], materials, placements)
        for role, position, rotation, scale in state_props(layout, state):
            _, data = base.import_asset(source, role, position, rotation, scale)
            placements.append(data)

    preview = out / f"aurelian-{state}-{mode}.png"
    camera = setup_render(mode, preview)
    bpy.ops.render.render(write_still=True)

    if not preview.is_file() or preview.stat().st_size < 20000:
        raise RuntimeError(f"Staged render failed: {state}/{mode}")

    contract = {
        "classification": "PENDING_DIRECT_VISUAL_REVIEW",
        "accepted_source_head": ACCEPTED_SOURCE_HEAD,
        "state": state,
        "mode": mode,
        "source_commit": base.SOURCE_SHA,
        "camera": layout["camera"],
        "terrain_extent": layout["extent"],
        "bridge": layout["bridge"],
        "road_after": state_road_after(layout, state),
        "placements": placements,
        "preview_sha256": hashlib.sha256(preview.read_bytes()).hexdigest(),
        "camera_object": camera.name,
    }
    (out / f"aurelian-{state}-{mode}-contract.json").write_text(
        json.dumps(contract, indent=2) + "\n"
    )
    print(f"AURELIAN_STAGED_RENDER_EXPORTED={state}:{mode}:{preview}")

for role, relative in base.ASSETS.items():
    path = source_root / relative
    if not path.is_file():
        raise FileNotFoundError(f"Missing pinned source {role}: {path}")

for mode in ("desktop", "portrait"):
    for state in STATES:
        build_scene(mode, state, source_root, output_dir)

manifest = {
    "accepted_source_head": ACCEPTED_SOURCE_HEAD,
    "source_commit": base.SOURCE_SHA,
    "states": list(STATES),
    "assets": {
        role: {
            "path": relative,
            "sha256": hashlib.sha256((source_root / relative).read_bytes()).hexdigest(),
        }
        for role, relative in base.ASSETS.items()
    },
}
(output_dir / "source-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
print(f"AURELIAN_STAGED_PROGRESSION_EXPORTED={output_dir}")
