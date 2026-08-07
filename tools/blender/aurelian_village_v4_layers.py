#!/usr/bin/env python3
"""Render registered Village V4 cumulative stages for desktop and portrait.

The script builds every order delta in one Blender scene per viewport, toggles
render visibility cumulatively, and writes opaque proof frames. A separate
post-process converts adjacent proof frames into lossless transparent layers.
"""

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
        "Usage: blender -b --python aurelian_village_v4_layers.py -- "
        "<base_script> <kaykit_root> <output_dir>"
    )

base_script, source_root, output_dir = map(Path, argv)
spec = importlib.util.spec_from_file_location("aurelian_base", base_script)
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)

source_root = source_root.resolve()
output_dir = output_dir.resolve()
output_dir.mkdir(parents=True, exist_ok=True)

KAYKIT_COMMIT = "84fa4e91af6a88989be7c99e0891cede11f2ca38"
BASE_SCRIPT_COMMIT = "d001d96117fc9d1de20f3ff57d7a47e2441a0393"
STAGES = (
    "camp",
    "shelter",
    "food",
    "timber",
    "scout",
    "storehouse",
    "market",
    "watch",
    "council",
)

base.ASSETS.update({
    "tent": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/tent.gltf",
    "flag_red": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/flag_red.gltf",
    "barrel": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/barrel.gltf",
    "bucket_water": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/bucket_water.gltf",
    "crate_big": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/crate_A_big.gltf",
    "crate_small": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/crate_A_small.gltf",
    "crate_open": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/crate_open.gltf",
    "ladder": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/ladder.gltf",
    "lumber": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/resource_lumber.gltf",
    "pallet": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/pallet.gltf",
    "sack": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/sack.gltf",
    "target": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/target.gltf",
    "wheelbarrow": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/wheelbarrow.gltf",
    "tree_cut": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/nature/tree_single_A_cut.gltf",
    "grain": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/neutral/building_grain.gltf",
    "scaffolding": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/neutral/building_scaffolding.gltf",
    "council_stage": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/neutral/building_stage_C.gltf",
    "fence": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/neutral/fence_wood_straight.gltf",
    "storehouse": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/green/building_lumbermill_green.gltf",
    "tower": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/red/building_tower_A_red.gltf",
    "house_c": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/red/building_home_A_red.gltf",
    "house_d": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/blue/building_home_B_blue.gltf",
    "house_e": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/yellow/building_home_A_yellow.gltf",
})


# Desktop and portrait are deliberately composed independently. The semantic
# sequence is shared; positions and cameras are not copied between aspect ratios.
base.LAYOUTS = {
    "desktop": {
        "extent": (340.0, 250.0),
        "grid": (154, 114),
        "river": [(-170, 74), (-128, 58), (-88, 38), (-52, 14), (-12, -5), (38, -20), (92, -31), (170, -39)],
        "water_z": -3.2,
        "road_before": [(-137, -91), (-109, -70), (-82, -45), (-54, -22), (-31, -5)],
        "bridge": {"position": (-25.0, 0.0), "rotation": 42.0, "span": 22.0},
        "camera": {"position": (132, -170, 132), "target": (8, 32, 6), "ortho": 125.0, "resolution": (2048, 1280)},
        "trees": [(-130, 72, 0), (-111, 91, 18), (-91, 80, -14), (-116, 48, 10), (-84, 106, 22), (112, 85, -18), (135, 57, 15), (124, 105, -7)],
        "rocks": [(-120, 8, 0), (-100, 22, 24), (120, -2, -16), (138, 31, 18), (108, 112, -20)],
        "hearth": (4, 29),
        "paths": {
            "camp": [(-20, 4), (-13, 12), (-5, 21), (4, 29)],
            "shelter": [(4, 29), (11, 34), (18, 39)],
            "food": [(4, 29), (-2, 38), (-8, 47)],
            "timber": [(4, 29), (-2, 20), (-7, 13)],
            "scout": [(6, 30), (20, 39), (34, 50), (45, 59)],
            "storehouse": [(6, 27), (18, 22), (30, 18)],
            "market": [(0, 26), (8, 24), (18, 29), (16, 40), (5, 44), (0, 32)],
            "watch": [(20, 31), (34, 28), (47, 24)],
            "council": [(16, 42), (16, 54), (18, 65)],
        },
        "assets": {
            "camp": [
                ("tent", (18, 34), -12, 7.6), ("flag_red", (-5, 29), 0, 7.2),
                ("crate_big", (10, 25), 16, 6.8), ("crate_small", (15, 27), -12, 6.2),
                ("lumber", (21, 23), 8, 6.4), ("sack", (4, 23), 0, 5.8),
                ("barrel", (13, 20), 0, 6.1), ("wheelbarrow", (27, 28), -20, 6.2),
            ],
            "shelter": [("house_a", (20, 43), 20, 8.5)],
            "food": [
                ("grain", (-11, 52), -8, 5.2), ("house_b", (2, 58), -12, 7.4),
                ("sack", (-8, 42), 12, 5.6), ("bucket_water", (-3, 47), 0, 5.6),
                ("fence", (-18, 39), 78, 4.6), ("fence", (0, 46), -12, 4.6),
            ],
            "timber": [
                ("scaffolding", (-7, 13), -16, 7.0), ("tree_cut", (-20, 16), 10, 7.0),
                ("lumber", (-1, 8), 5, 6.6), ("lumber", (-15, 7), -8, 6.1),
                ("pallet", (1, 14), 16, 5.8), ("ladder", (-8, 21), -20, 6.1),
            ],
            "scout": [
                ("tent", (43, 59), -16, 5.8), ("flag_red", (35, 52), -6, 6.2),
                ("flag_red", (49, 63), 10, 6.2), ("target", (50, 54), -14, 6.2),
                ("crate_open", (40, 55), 18, 5.5),
            ],
            "storehouse": [
                ("storehouse", (31, 17), -12, 6.4), ("house_c", (40, 32), 18, 7.6),
                ("crate_big", (23, 13), 10, 6.0), ("crate_small", (28, 10), -10, 5.5),
                ("barrel", (38, 10), 0, 5.8),
            ],
            "market": [
                ("market", (18, 31), 10, 8.2), ("well", (8, 44), 0, 7.4),
                ("house_d", (36, 49), -10, 7.5), ("crate_open", (28, 39), 12, 5.4),
            ],
            "watch": [
                ("tower", (47, 23), -18, 5.3), ("barracks", (48, 42), -24, 5.0),
                ("fence", (55, 31), 67, 5.0), ("fence", (55, 46), 72, 5.0),
            ],
            "council": [
                ("church", (18, 64), 7, 8.7), ("council_stage", (6, 56), -8, 6.6),
                ("house_e", (36, 63), 14, 7.3), ("flag_red", (13, 59), 0, 6.0),
            ],
        },
        "field": {"center": (-10, 42), "rotation": -9, "size": (20, 12)},
        "plaza": {"center": (15, 35), "radius": 12.0},
    },
    "portrait": {
        "extent": (210.0, 350.0),
        "grid": (100, 164),
        "river": [(-105, -48), (-72, -43), (-40, -38), (-10, -32), (20, -25), (58, -18), (105, -10)],
        "water_z": -3.2,
        "road_before": [(0, -156), (0, -126), (0, -96), (0, -67), (0, -42)],
        "bridge": {"position": (0.0, -30.0), "rotation": 90.0, "span": 17.0},
        "camera": {"position": (18, -205, 150), "target": (0, 25, 7), "ortho": 132.0, "resolution": (780, 1688)},
        "trees": [(-70, 70, 0), (-58, 100, 16), (-76, 134, -12), (-56, 164, 10), (68, 96, -18), (79, 130, 20), (63, 174, -8)],
        "rocks": [(-72, 12, 0), (-67, 42, 24), (72, 18, -16), (77, 58, 18), (69, 158, -20)],
        "hearth": (0, 20),
        "paths": {
            "camp": [(0, -22), (0, -8), (0, 7), (0, 20)],
            "shelter": [(0, 20), (-5, 29), (-9, 37)],
            "food": [(0, 20), (8, 31), (13, 42)],
            "timber": [(0, 18), (-8, 13), (-15, 9)],
            "scout": [(0, 22), (2, 38), (5, 52), (8, 66)],
            "storehouse": [(0, 18), (8, 17), (16, 15)],
            "market": [(-5, 30), (0, 41), (8, 48), (3, 57), (-8, 53), (-10, 40)],
            "watch": [(5, 54), (-2, 65), (-10, 73)],
            "council": [(2, 58), (4, 70), (5, 82)],
        },
        "assets": {
            "camp": [
                ("tent", (12, 25), -10, 7.0), ("flag_red", (-10, 20), 0, 6.5),
                ("crate_big", (5, 16), 15, 6.2), ("crate_small", (10, 18), -10, 5.8),
                ("lumber", (15, 14), 8, 5.9), ("sack", (-1, 14), 0, 5.3),
                ("barrel", (8, 11), 0, 5.6), ("wheelbarrow", (19, 21), -18, 5.8),
            ],
            "shelter": [("house_a", (-12, 38), -18, 7.5)],
            "food": [
                ("grain", (14, 44), 8, 4.9), ("house_b", (12, 56), -10, 6.5),
                ("sack", (9, 36), 12, 5.2), ("bucket_water", (5, 41), 0, 5.1),
                ("fence", (18, 36), 82, 4.2), ("fence", (8, 49), -8, 4.2),
            ],
            "timber": [
                ("scaffolding", (-15, 10), -12, 6.2), ("tree_cut", (-23, 16), 8, 6.3),
                ("lumber", (-10, 5), 4, 6.0), ("lumber", (-20, 4), -7, 5.6),
                ("pallet", (-6, 11), 15, 5.3), ("ladder", (-14, 18), -18, 5.5),
            ],
            "scout": [
                ("tent", (10, 66), -14, 5.4), ("flag_red", (-12, 61), -6, 5.8),
                ("flag_red", (15, 69), 10, 5.8), ("target", (18, 61), -12, 5.7),
                ("crate_open", (9, 58), 15, 5.0),
            ],
            "storehouse": [
                ("storehouse", (16, 14), -10, 5.9), ("house_c", (18, 30), 16, 6.7),
                ("crate_big", (9, 9), 10, 5.5), ("crate_small", (14, 6), -10, 5.1),
                ("barrel", (21, 7), 0, 5.3),
            ],
            "market": [
                ("market", (1, 48), 8, 7.1), ("well", (-8, 57), 0, 6.5),
                ("house_d", (14, 64), -9, 6.5), ("crate_open", (9, 54), 12, 4.9),
            ],
            "watch": [
                ("tower", (-14, 70), -16, 4.9), ("barracks", (-8, 82), -22, 4.7),
                ("fence", (-20, 76), 18, 4.6), ("fence", (-17, 88), 24, 4.6),
            ],
            "council": [
                ("church", (5, 84), 5, 7.7), ("council_stage", (-8, 73), -6, 5.8),
                ("house_e", (13, 87), 12, 6.4), ("flag_red", (-2, 77), 0, 5.6),
            ],
        },
        "field": {"center": (14, 39), "rotation": 8, "size": (15, 10)},
        "plaza": {"center": (0, 52), "radius": 9.5},
    },
}


def cube(name, location, dimensions, rotation, material):
    bpy.ops.mesh.primitive_cube_add(location=location, rotation=(0, 0, math.radians(rotation)))
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(material)
    return obj


def create_hearth(mode, source, center, materials, placements):
    x, y = center
    z = base.terrain_height(mode, x, y)
    for index, angle in enumerate(range(0, 360, 45)):
        rad = math.radians(angle)
        point = (x + math.cos(rad) * 2.0, y + math.sin(rad) * 2.0)
        _, data = base.import_asset(source, "rock_c", point, angle, 1.9 + (index % 2) * 0.12)
        data["semantic"] = f"camp_hearth_stone_{index}"
        placements.append(data)
    for index, angle in enumerate((45, -45)):
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=8,
            radius=0.23,
            depth=3.4,
            location=(x, y, z + 0.32),
            rotation=(0, math.radians(90), math.radians(angle)),
        )
        log = bpy.context.object
        log.name = f"CampHearthLog_{index}"
        log.data.materials.append(materials["wood"])
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.82, location=(x, y, z + 0.88))
    flame = bpy.context.object
    flame.name = "CampHearthFlame"
    flame.scale = (0.72, 0.72, 1.36)
    flame.data.materials.append(materials["flame"])
    bpy.ops.object.light_add(type="POINT", location=(x, y, z + 1.8))
    light = bpy.context.object
    light.name = "CampHearthWarmLight"
    light.data.energy = 70.0
    light.data.color = (1.0, 0.42, 0.12)
    light.data.shadow_soft_size = 3.5


def create_field(mode, config, materials):
    x, y = config["center"]
    width, depth = config["size"]
    rotation = config["rotation"]
    z = base.terrain_height(mode, x, y)
    cube("FoodFieldSoil", (x, y, z + 0.13), (width, depth, 0.22), rotation, materials["field_soil"])
    rad = math.radians(rotation)
    along = Vector((math.cos(rad), math.sin(rad), 0))
    across = Vector((-math.sin(rad), math.cos(rad), 0))
    for row in range(-2, 3):
        for column in range(-3, 4):
            point = (
                Vector((x, y, z + 0.42))
                + across * (row * depth / 6.2)
                + along * (column * width / 8.2)
            )
            cube(
                f"FoodCrop_{row + 2}_{column + 3}",
                point,
                (width / 11.0, 0.54, 0.48),
                rotation,
                materials["crop"],
            )


def create_plaza(mode, config, materials):
    x, y = config["center"]
    z = base.terrain_height(mode, x, y)
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=config["radius"], depth=0.24, location=(x, y, z + 0.10))
    plaza = bpy.context.object
    plaza.name = "MarketCivicPlaza"
    plaza.data.materials.append(materials["road"])


def add_asset(source, stage, role, position, rotation, scale, placements, ground_z=None, desired_span=None):
    root, data = base.import_asset(
        source,
        role,
        position,
        rotation,
        scale,
        ground_z=ground_z,
        desired_span=desired_span,
    )
    root.name = f"{stage}__{role}"
    data["semantic_layer"] = stage
    placements.append(data)
    return root


def objects_created_by(callback):
    before = set(bpy.data.objects)
    callback()
    bpy.context.view_layer.update()
    return sorted((obj for obj in bpy.data.objects if obj not in before), key=lambda obj: obj.name)


def populate_layer(mode, stage, layout, source, materials, placements):
    path = layout["paths"][stage]
    base.create_ribbon(f"{stage.title()}Path", mode, path, 3.8 if stage != "market" else 4.8, materials["road"], z_offset=0.14)
    if stage == "camp":
        create_hearth(mode, source, layout["hearth"], materials, placements)
    if stage == "food":
        create_field(mode, layout["field"], materials)
    if stage == "market":
        create_plaza(mode, layout["plaza"], materials)
    for role, position, rotation, scale in layout["assets"][stage]:
        add_asset(source, stage, role, position, rotation, scale, placements)


def setup_render(mode, output_path):
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
    scene.render.image_settings.color_mode = "RGB"
    scene.render.image_settings.color_depth = "8"
    scene.render.image_settings.compression = 35
    scene.render.filepath = str(output_path)
    scene.render.film_transparent = False
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.exposure = -0.12

    world = bpy.data.worlds.new("AurelianVillageV4World")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.30, 0.36, 0.31, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.58
    scene.world = world

    bpy.ops.object.light_add(type="SUN", location=(0, 0, 120))
    sun = bpy.context.object
    sun.name = "AurelianVillageV4Sun"
    sun.rotation_euler = tuple(math.radians(value) for value in (44, -30, -19))
    sun.data.energy = 1.35
    sun.data.color = (1.0, 0.94, 0.82)
    if hasattr(sun.data, "angle"):
        sun.data.angle = math.radians(12)

    config = base.LAYOUTS[mode]["camera"]
    bpy.ops.object.camera_add(location=config["position"])
    camera = bpy.context.object
    camera.name = f"VillageV4{mode.title()}Camera"
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = config["ortho"]
    base.aim(camera, config["target"])
    scene.camera = camera
    return camera


def render_frame(path):
    bpy.context.scene.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)
    if not path.is_file() or path.stat().st_size < 30000:
        raise RuntimeError(f"Village V4 render failed: {path}")
    return hashlib.sha256(path.read_bytes()).hexdigest()


def build_mode(mode, source, out):
    base.CURRENT_MODE = mode
    bpy.ops.wm.read_factory_settings(use_empty=True)
    layout = base.LAYOUTS[mode]
    materials = {
        "plain": base.make_material("TerrainOlive", (0.31, 0.38, 0.23, 1), 0.98),
        "ridge": base.make_material("TerrainForest", (0.19, 0.30, 0.17, 1), 0.98),
        "earth": base.make_material("BankEarth", (0.38, 0.29, 0.18, 1), 0.98),
        "water": base.make_material("RiverTeal", (0.05, 0.31, 0.37, 1), 0.34, 0.02),
        "road": base.make_material("RoadOchre", (0.50, 0.38, 0.23, 1), 0.99),
        "wood": base.make_material("HearthWood", (0.28, 0.17, 0.08, 1), 0.93),
        "field_soil": base.make_material("FieldSoil", (0.29, 0.19, 0.10, 1), 0.99),
        "crop": base.make_material("FieldCrop", (0.42, 0.55, 0.16, 1), 0.96),
        "flame": base.make_material("HearthFlame", (1.0, 0.36, 0.04, 1), 0.62),
    }

    base.create_terrain(mode, materials)
    base.create_ribbon("RiverWater", mode, layout["river"], 18.0, materials["water"], fixed_z=layout["water_z"])
    base.create_ribbon("RoadApproach", mode, layout["road_before"], 4.8, materials["road"], z_offset=0.12)
    bridge = layout["bridge"]
    base.import_asset(
        source,
        "bridge",
        bridge["position"],
        bridge["rotation"],
        1.0,
        ground_z=layout["water_z"] - 0.35,
        desired_span=bridge["span"],
    )
    tree_scale = 6.0 if mode == "desktop" else 5.5
    rock_scale = 6.5 if mode == "desktop" else 5.8
    for index, (x, y, rotation) in enumerate(layout["trees"]):
        base.import_asset(
            source,
            "tree_a" if index % 2 == 0 else "tree_b",
            (x, y),
            rotation,
            tree_scale + (index % 3) * 0.4,
        )
    for index, (x, y, rotation) in enumerate(layout["rocks"]):
        base.import_asset(
            source,
            "rock_c" if index % 2 == 0 else "rock_e",
            (x, y),
            rotation,
            rock_scale + (index % 2) * 0.6,
        )

    layer_objects = {}
    layer_placements = {}
    for stage in STAGES:
        placements = []
        layer_objects[stage] = objects_created_by(
            lambda stage=stage, placements=placements: populate_layer(
                mode, stage, layout, source, materials, placements
            )
        )
        layer_placements[stage] = placements

    mode_dir = out / mode
    mode_dir.mkdir(parents=True, exist_ok=True)
    camera = setup_render(mode, mode_dir / "base.png")
    for objects in layer_objects.values():
        for obj in objects:
            obj.hide_render = True

    frames = {"base": {"path": f"{mode}/base.png", "sha256": render_frame(mode_dir / "base.png")}}
    for stage in STAGES:
        for obj in layer_objects[stage]:
            obj.hide_render = False
        frame_path = mode_dir / f"stage-{STAGES.index(stage) + 1:02d}-{stage}.png"
        frames[stage] = {"path": f"{mode}/{frame_path.name}", "sha256": render_frame(frame_path)}
        print(f"VILLAGE_V4_STAGE_RENDERED={mode}:{stage}:{frame_path}")

    return {
        "resolution": list(layout["camera"]["resolution"]),
        "camera": layout["camera"],
        "terrain_extent": list(layout["extent"]),
        "bridge": layout["bridge"],
        "camera_object": camera.name,
        "frames": frames,
        "placements": layer_placements,
    }


for role, relative in base.ASSETS.items():
    path = source_root / relative
    if not path.is_file():
        raise FileNotFoundError(f"Missing pinned source {role}: {path}")

mode_contracts = {mode: build_mode(mode, source_root, output_dir) for mode in ("desktop", "portrait")}
manifest = {
    "classification": "PENDING_DIRECT_VISUAL_REVIEW",
    "contract": "VILLAGE_V4_NINE_LAYER_PROOF",
    "kaykit_commit": KAYKIT_COMMIT,
    "base_script_commit": BASE_SCRIPT_COMMIT,
    "stages": list(STAGES),
    "modes": mode_contracts,
    "assets": {
        role: {
            "path": relative,
            "sha256": hashlib.sha256((source_root / relative).read_bytes()).hexdigest(),
        }
        for role, relative in base.ASSETS.items()
    },
}
(output_dir / "render-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
print(f"VILLAGE_V4_REGISTERED_RENDER_COMPLETE={output_dir}")
