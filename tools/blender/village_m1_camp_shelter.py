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
    raise SystemExit("Usage: blender -b --python village_m1_camp_shelter.py -- <base_script> <kaykit_root> <output_dir>")

base_script, source_root, output_dir = map(Path, argv)
spec = importlib.util.spec_from_file_location("aurelian_base", base_script)
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)
source_root = source_root.resolve()
output_dir = output_dir.resolve()
output_dir.mkdir(parents=True, exist_ok=True)

PASS_ID = "VILLAGE_M1_CAMP_SHELTER_1"
base.ASSETS["shelter_home"] = "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/red/building_home_A_red.gltf"
base.LAYOUTS = {
    "desktop": {
        "extent": (360.0, 300.0),
        "grid": (144, 120),
        "river": [(178, -145), (154, -105), (143, -62), (146, -20), (159, 28), (180, 78)],
        "water_z": -3.3,
        "road": [(-155, -110), (-112, -82), (-74, -53), (-42, -28), (-15, -11), (0, 0)],
        "shelter_spur": [(5, 3), (14, 9), (24, 16)],
        "camp": (0.0, 0.0),
        "tents": [(-17.0, 7.0, 18.0), (-7.0, -14.0, -14.0)],
        "shelter": {"position": (27.0, 19.0), "rotation": -12.0, "scale": 8.6},
        "trees": [(-118, 58, 0), (-98, 82, 18), (-77, 67, -16), (-58, 91, 22), (-132, 93, -12), (-92, 48, 8)],
        "rocks": [(104, 24, 0), (125, 48, 28), (111, 72, -18)],
        "camera": {"position": (118.0, -150.0, 112.0), "target": (2.0, 8.0, 6.0), "ortho": 112.0, "resolution": (1440, 900)},
    },
    "portrait": {
        "extent": (220.0, 340.0),
        "grid": (94, 146),
        "river": [(108, -165), (91, -115), (84, -70), (88, -20), (98, 45), (110, 105)],
        "water_z": -3.3,
        "road": [(-5, -154), (-4, -116), (-3, -80), (-2, -48), (-1, -22), (0, -5)],
        "shelter_spur": [(0, 1), (0, 14), (0, 29)],
        "camp": (0.0, -5.0),
        "tents": [(-14.0, 2.0, 16.0), (11.0, -17.0, -12.0)],
        "shelter": {"position": (0.0, 38.0), "rotation": 4.0, "scale": 8.3},
        "trees": [(-78, 62, 0), (-65, 94, 20), (-82, 128, -14), (-57, 153, 12), (72, 112, -18)],
        "rocks": [(69, 31, 0), (82, 70, 28), (75, 105, -16)],
        "camera": {"position": (70.0, -158.0, 138.0), "target": (0.0, 26.0, 7.0), "ortho": 136.0, "resolution": (390, 844)},
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


def triangular_tent(name, mode, x, y, rotation, materials):
    z = base.terrain_height(mode, x, y)
    width, depth, height = 7.6, 9.0, 5.8
    verts = [
        (-width / 2, -depth / 2, 0), (width / 2, -depth / 2, 0), (0, -depth / 2, height),
        (-width / 2, depth / 2, 0), (width / 2, depth / 2, 0), (0, depth / 2, height),
    ]
    faces = [(0, 1, 2), (3, 5, 4), (0, 3, 4, 1), (1, 4, 5, 2), (2, 5, 3, 0)]
    mesh = bpy.data.meshes.new(name + "Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = (x, y, z + 0.08)
    obj.rotation_euler.z = math.radians(rotation)
    obj.data.materials.append(materials["canvas"])
    cube(name + "Door", (x, y - 4.58, z + 1.25), (1.6, 0.18, 2.5), rotation, materials["dark"])
    return obj


def campfire(mode, x, y, materials):
    z = base.terrain_height(mode, x, y)
    for index, angle in enumerate((0, 60, -60)):
        cube(f"CampLog_{index}", (x, y, z + 0.32), (4.2, 0.72, 0.62), angle, materials["wood"])
    bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=1.55, radius2=0.35, depth=3.8, location=(x, y, z + 2.15))
    flame = bpy.context.object
    flame.name = "CampFlame"
    flame.data.materials.append(materials["flame"])
    bpy.ops.object.light_add(type="POINT", location=(x, y, z + 3.7))
    light = bpy.context.object
    light.name = "CampWarmLight"
    light.data.energy = 190.0
    light.data.color = (1.0, 0.47, 0.12)
    light.data.shadow_soft_size = 4.0


def person(name, mode, x, y, shirt, materials):
    z = base.terrain_height(mode, x, y)
    bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.52, depth=2.1, location=(x, y, z + 1.05))
    body = bpy.context.object
    body.name = name + "Body"
    body.data.materials.append(materials[shirt])
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.58, location=(x, y, z + 2.5))
    head = bpy.context.object
    head.name = name + "Head"
    head.data.materials.append(materials["skin"])


def camp_supplies(mode, x, y, materials):
    z = base.terrain_height(mode, x, y)
    cube("SupplyCrateA", (x, y, z + 0.65), (2.4, 2.0, 1.3), 8, materials["wood"])
    cube("SupplyCrateB", (x + 2.2, y + 0.5, z + 0.48), (1.7, 1.5, 0.95), -10, materials["wood"])
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=6, radius=0.9, location=(x - 1.8, y + 0.4, z + 0.78))
    sack = bpy.context.object
    sack.name = "SupplySack"
    sack.scale.z = 1.25
    sack.data.materials.append(materials["sack"])


def founder_flag(mode, x, y, materials):
    z = base.terrain_height(mode, x, y)
    cube("FounderPole", (x, y, z + 2.7), (0.18, 0.18, 5.4), 0, materials["gold"])
    verts = [(x + 0.12, y, z + 5.1), (x + 0.12, y, z + 3.7), (x + 2.2, y, z + 4.45)]
    mesh = bpy.data.meshes.new("FounderFlagMesh")
    mesh.from_pydata(verts, [], [(0, 1, 2)])
    mesh.update()
    flag = bpy.data.objects.new("FounderFlag", mesh)
    bpy.context.collection.objects.link(flag)
    flag.data.materials.append(materials["red"])


def fence_posts(mode, points, materials):
    for index, (x, y) in enumerate(points):
        z = base.terrain_height(mode, x, y)
        cube(f"ShelterFence_{index}", (x, y, z + 1.1), (0.34, 0.34, 2.2), 0, materials["wood"])


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
    scene.render.filepath = str(output_path)
    scene.render.film_transparent = False
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.exposure = -0.15
    world = bpy.data.worlds.new("VillageM1World")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.30, 0.36, 0.35, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.55
    scene.world = world
    bpy.ops.object.light_add(type="SUN", location=(0, 0, 120))
    sun = bpy.context.object
    sun.name = "VillageM1Sun"
    sun.rotation_euler = tuple(math.radians(v) for v in (42, -28, -18))
    sun.data.energy = 1.45
    sun.data.color = (1.0, 0.93, 0.80)
    cfg = base.LAYOUTS[mode]["camera"]
    bpy.ops.object.camera_add(location=cfg["position"])
    camera = bpy.context.object
    camera.name = mode.capitalize() + "VillageM1Camera"
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = cfg["ortho"]
    base.aim(camera, cfg["target"])
    scene.camera = camera
    return camera


def build_mode(mode):
    base.CURRENT_MODE = mode
    bpy.ops.wm.read_factory_settings(use_empty=True)
    layout = base.LAYOUTS[mode]
    materials = {
        "plain": base.make_material("VillageTerrainOlive", (0.31, 0.38, 0.21, 1), 0.98),
        "ridge": base.make_material("VillageTerrainForest", (0.18, 0.29, 0.16, 1), 0.98),
        "earth": base.make_material("VillageBankEarth", (0.36, 0.27, 0.17, 1), 0.98),
        "water": base.make_material("VillageRiverTeal", (0.05, 0.31, 0.37, 1), 0.35, 0.02),
        "road": base.make_material("VillageRoadOchre", (0.49, 0.36, 0.22, 1), 0.99),
        "wood": base.make_material("CampWood", (0.28, 0.17, 0.08, 1), 0.93),
        "canvas": base.make_material("TentCanvas", (0.58, 0.45, 0.28, 1), 0.96),
        "dark": base.make_material("TentDoor", (0.15, 0.10, 0.07, 1), 0.98),
        "sack": base.make_material("SupplySack", (0.50, 0.40, 0.24, 1), 0.98),
        "skin": base.make_material("PeopleSkin", (0.72, 0.52, 0.34, 1), 0.92),
        "shirt_a": base.make_material("PeopleRed", (0.50, 0.08, 0.05, 1), 0.92),
        "shirt_b": base.make_material("PeopleBlue", (0.08, 0.26, 0.36, 1), 0.92),
        "shirt_c": base.make_material("PeopleGold", (0.60, 0.42, 0.08, 1), 0.92),
        "red": base.make_material("FounderRed", (0.50, 0.045, 0.03, 1), 0.86),
        "gold": base.make_material("FounderGold", (0.76, 0.52, 0.10, 1), 0.75, 0.05),
    }
    flame = base.make_material("CampFlameMaterial", (1.0, 0.18, 0.02, 1), 0.45)
    bsdf = flame.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Emission Color"].default_value = (1.0, 0.12, 0.01, 1)
        bsdf.inputs["Emission Strength"].default_value = 2.8
    materials["flame"] = flame

    base.create_terrain(mode, materials)
    base.create_ribbon("VillageRiver", mode, layout["river"], 18.0, materials["water"], fixed_z=layout["water_z"])
    base.create_ribbon("VillageApproachRoad", mode, layout["road"], 5.0, materials["road"], z_offset=0.12)

    placements = []
    for index, (x, y, rotation) in enumerate(layout["trees"]):
        role = "tree_a" if index % 2 == 0 else "tree_b"
        _, data = base.import_asset(source_root, role, (x, y), rotation, 7.8 + (index % 3) * 0.5)
        placements.append(data)
    for index, (x, y, rotation) in enumerate(layout["rocks"]):
        role = "rock_c" if index % 2 == 0 else "rock_e"
        _, data = base.import_asset(source_root, role, (x, y), rotation, 8.5 + (index % 2))
        placements.append(data)

    cx, cy = layout["camp"]
    for index, (x, y, rotation) in enumerate(layout["tents"]):
        triangular_tent(f"CampTent_{index}", mode, x, y, rotation, materials)
    campfire(mode, cx, cy, materials)
    person("Founder", mode, cx - 4.0, cy + 2.8, "shirt_a", materials)
    person("SettlerA", mode, cx + 4.5, cy + 3.0, "shirt_b", materials)
    person("SettlerB", mode, cx + 1.2, cy - 5.0, "shirt_c", materials)
    camp_supplies(mode, cx - 10.0, cy - 5.5, materials)
    founder_flag(mode, cx + 8.0, cy + 7.0, materials)

    camp_path = output_dir / f"village-m1-{mode}-camp.png"
    camera = setup_render(mode, camp_path)
    bpy.ops.render.render(write_still=True)
    if not camp_path.is_file() or camp_path.stat().st_size < 20000:
        raise RuntimeError(f"Camp render failed for {mode}")

    shelter = layout["shelter"]
    base.create_ribbon("ShelterPath", mode, layout["shelter_spur"], 3.0, materials["road"], z_offset=0.15)
    _, shelter_data = base.import_asset(source_root, "shelter_home", shelter["position"], shelter["rotation"], shelter["scale"])
    placements.append(shelter_data)
    sx, sy = shelter["position"]
    fence_posts(mode, [(sx - 7, sy - 3), (sx - 7, sy + 2), (sx + 7, sy - 3), (sx + 7, sy + 2)], materials)

    shelter_path = output_dir / f"village-m1-{mode}-shelter.png"
    bpy.context.scene.render.filepath = str(shelter_path)
    bpy.ops.render.render(write_still=True)
    if not shelter_path.is_file() or shelter_path.stat().st_size < 20000:
        raise RuntimeError(f"Shelter render failed for {mode}")

    bpy.ops.wm.save_as_mainfile(filepath=str(output_dir / f"village-m1-{mode}.blend"))
    contract = {
        "pass": PASS_ID,
        "mode": mode,
        "source_commit": base.SOURCE_SHA,
        "terrain_extent": list(layout["extent"]),
        "camera": layout["camera"],
        "camp_core": list(layout["camp"]),
        "tents": [list(item) for item in layout["tents"]],
        "shelter": shelter,
        "placements": placements,
        "camp_sha256": hashlib.sha256(camp_path.read_bytes()).hexdigest(),
        "shelter_sha256": hashlib.sha256(shelter_path.read_bytes()).hexdigest(),
        "camera_object": camera.name,
    }
    (output_dir / f"village-m1-{mode}-contract.json").write_text(json.dumps(contract, indent=2) + "\n")
    print(f"VILLAGE_M1_RENDERED={mode}:camp:{camp_path}")
    print(f"VILLAGE_M1_RENDERED={mode}:shelter:{shelter_path}")


for role, relative in base.ASSETS.items():
    path = source_root / relative
    if not path.is_file():
        raise FileNotFoundError(f"Missing pinned source {role}: {path}")

build_mode("desktop")
build_mode("portrait")
manifest = {
    "pass": PASS_ID,
    "source_commit": base.SOURCE_SHA,
    "assets": {
        role: {"path": relative, "sha256": hashlib.sha256((source_root / relative).read_bytes()).hexdigest()}
        for role, relative in base.ASSETS.items()
    },
}
(output_dir / "source-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
print(f"VILLAGE_M1_PACKAGE_RENDERED={output_dir}")
