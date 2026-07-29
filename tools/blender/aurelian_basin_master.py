import bpy
import hashlib
import json
import math
import sys
from pathlib import Path
from mathutils import Vector

SOURCE_SHA = "84fa4e91af6a88989be7c99e0891cede11f2ca38"
BLUEPRINT_SHA = "3c61f8ade5e582da9798ce8a6f1bc9ac69ecebe2"
UNIFORM_SCALE = 11.71437541

ASSETS = {
    "church": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/red/building_church_red.gltf",
    "blacksmith": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/red/building_blacksmith_red.gltf",
    "barracks": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/blue/building_barracks_blue.gltf",
    "house_a": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/green/building_home_A_green.gltf",
    "house_b": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/yellow/building_home_B_yellow.gltf",
    "market": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/yellow/building_market_yellow.gltf",
    "well": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/blue/building_well_blue.gltf",
    "bridge": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/neutral/building_bridge_A.gltf",
    "tree_a": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/nature/tree_single_A.gltf",
    "tree_b": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/nature/tree_single_B.gltf",
    "rock_c": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/nature/rock_single_C.gltf",
    "rock_e": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/nature/rock_single_E.gltf",
}

LAYOUTS = {
    "desktop": {
        "extent": (190.0, 145.0),
        "grid": (112, 86),
        "river": [(-95.0, 38.0), (-58.0, 27.0), (-18.0, 5.0), (28.0, -11.0), (95.0, -22.0)],
        "water_z": -2.55,
        "road_before": [(-84.0, -62.0), (-65.0, -48.0), (-48.0, -33.0), (-31.0, -16.0), (-22.0, -2.0)],
        "road_after": [(-12.0, 11.0), (4.0, 18.0), (22.0, 23.0), (40.0, 29.0), (55.0, 36.0)],
        "bridge": {"position": (-17.0, 5.0), "rotation": 42.0},
        "buildings": [
            ("blacksmith", (5.0, 17.0), -18.0),
            ("market", (25.0, 16.0), 12.0),
            ("well", (34.0, 27.0), 0.0),
            ("house_a", (23.0, 43.0), 22.0),
            ("house_b", (44.0, 34.0), -12.0),
            ("barracks", (59.0, 15.0), -26.0),
            ("church", (61.0, 53.0), 10.0),
        ],
        "trees": [(-76, 44, 0), (-66, 56, 18), (-56, 48, -12), (-47, 61, 25), (-38, 50, 5), (-82, 63, -18), (-28, 65, 14), (-70, 35, 8), (-50, 37, -22), (-88, 49, 30)],
        "rocks": [(72, 5, 0), (79, 17, 35), (68, 29, -20), (86, 34, 12), (75, 47, -30)],
        "camera": {"position": (112.0, -142.0, 112.0), "target": (4.0, 5.0, 8.0), "ortho": 118.0, "resolution": (1440, 900)},
        "camera_change_reason": "Measured building AABBs plus the full approach-to-landmark route require a wider orthographic field than the provisional size 30; the accepted region hierarchy is retained.",
    },
    "portrait": {
        "extent": (118.0, 190.0),
        "grid": (80, 126),
        "river": [(-59.0, -18.0), (-31.0, -13.0), (0.0, -6.0), (31.0, 0.0), (59.0, 5.0)],
        "water_z": -2.55,
        "road_before": [(-8.0, -91.0), (-7.0, -70.0), (-5.0, -49.0), (-3.0, -29.0), (-1.0, -13.0)],
        "road_after": [(1.0, 1.0), (3.0, 14.0), (6.0, 29.0), (9.0, 44.0), (12.0, 63.0)],
        "bridge": {"position": (0.0, -6.0), "rotation": 84.0},
        "buildings": [
            ("blacksmith", (-20.0, 12.0), -18.0),
            ("market", (5.0, 12.0), 12.0),
            ("well", (8.0, 31.0), 0.0),
            ("house_a", (27.0, 22.0), 24.0),
            ("house_b", (28.0, 43.0), -10.0),
            ("barracks", (-22.0, 43.0), -25.0),
            ("church", (13.0, 69.0), 8.0),
        ],
        "trees": [(-47, 52, 0), (-40, 68, 20), (-50, 82, -15), (-34, 91, 12), (42, 74, -18), (48, 91, 22), (-45, 32, 8)],
        "rocks": [(45, 18, 0), (49, 36, 30), (43, 55, -18), (50, 69, 15)],
        "camera": {"position": (78.0, -157.0, 139.0), "target": (0.0, -4.0, 10.0), "ortho": 148.0, "resolution": (390, 844)},
        "camera_change_reason": "The rejected portrait camera produced a roof pile. A longer north-facing field is required for the locked approach-crossing-commons-landmark progression and independent role silhouettes.",
    },
}


def hex_rgba(value):
    value = value.lstrip("#")
    return tuple(int(value[i:i + 2], 16) / 255.0 for i in (0, 2, 4)) + (1.0,)


def make_material(name, color, roughness=0.9, metallic=0.0):
    material = bpy.data.materials.new(name)
    material.diffuse_color = color
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
    return material


def aim(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


def point_segment_distance(px, py, ax, ay, bx, by):
    vx, vy = bx - ax, by - ay
    wx, wy = px - ax, py - ay
    denom = vx * vx + vy * vy
    if denom <= 1e-9:
        return math.hypot(px - ax, py - ay)
    t = max(0.0, min(1.0, (wx * vx + wy * vy) / denom))
    qx, qy = ax + t * vx, ay + t * vy
    return math.hypot(px - qx, py - qy)


def distance_to_polyline(x, y, points):
    return min(point_segment_distance(x, y, *points[i], *points[i + 1]) for i in range(len(points) - 1))


def terrain_height(mode, x, y):
    layout = LAYOUTS[mode]
    dist = distance_to_polyline(x, y, layout["river"])
    channel = -4.4 * math.exp(-((dist / 7.4) ** 2))
    banks = 1.15 * math.exp(-(((dist - 10.5) / 3.8) ** 2))
    if mode == "desktop":
        ridge = 14.0 * math.exp(-(((x + 58.0) / 30.0) ** 2) - (((y - 52.0) / 24.0) ** 2))
        shoulder = 10.5 * math.exp(-(((x - 73.0) / 24.0) ** 2) - (((y - 22.0) / 34.0) ** 2))
        plain = -0.7 * math.exp(-(((x + 28.0) / 48.0) ** 2) - (((y + 54.0) / 30.0) ** 2))
    else:
        ridge = 12.5 * math.exp(-(((x + 43.0) / 21.0) ** 2) - (((y - 74.0) / 40.0) ** 2))
        shoulder = 9.0 * math.exp(-(((x - 47.0) / 18.0) ** 2) - (((y - 48.0) / 48.0) ** 2))
        plain = -0.6 * math.exp(-(((x + 5.0) / 36.0) ** 2) - (((y + 72.0) / 42.0) ** 2))
    undulation = 0.34 * math.sin(x * 0.095) * math.cos(y * 0.078) + 0.16 * math.sin((x + y) * 0.055)
    return channel + banks + ridge + shoulder + plain + undulation


def sample_polyline(points, steps_per_segment=12):
    sampled = []
    for index in range(len(points) - 1):
        a = Vector((points[index][0], points[index][1], 0.0))
        b = Vector((points[index + 1][0], points[index + 1][1], 0.0))
        for step in range(steps_per_segment):
            t = step / float(steps_per_segment)
            p = a.lerp(b, t)
            sampled.append((p.x, p.y))
    sampled.append(tuple(points[-1]))
    return sampled


def create_ribbon(name, mode, points, width, material, z_offset=0.08, fixed_z=None):
    sampled = sample_polyline(points)
    verts = []
    faces = []
    for index, point in enumerate(sampled):
        previous = Vector(sampled[max(0, index - 1)])
        following = Vector(sampled[min(len(sampled) - 1, index + 1)])
        tangent = (following - previous).normalized()
        side = Vector((-tangent.y, tangent.x)) * (width * 0.5)
        left = Vector(point) + side
        right = Vector(point) - side
        if fixed_z is None:
            left_z = terrain_height(mode, left.x, left.y) + z_offset
            right_z = terrain_height(mode, right.x, right.y) + z_offset
        else:
            left_z = right_z = fixed_z
        verts.extend([(left.x, left.y, left_z), (right.x, right.y, right_z)])
    for index in range(len(sampled) - 1):
        a = index * 2
        faces.append((a, a + 1, a + 3, a + 2))
    mesh = bpy.data.meshes.new(name + "Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(material)
    return obj


def create_terrain(mode, materials):
    layout = LAYOUTS[mode]
    sx, sy = layout["extent"]
    nx, ny = layout["grid"]
    verts = []
    faces = []
    for iy in range(ny + 1):
        y = -sy * 0.5 + sy * iy / ny
        for ix in range(nx + 1):
            x = -sx * 0.5 + sx * ix / nx
            verts.append((x, y, terrain_height(mode, x, y)))
    for iy in range(ny):
        for ix in range(nx):
            a = iy * (nx + 1) + ix
            b = a + 1
            d = (iy + 1) * (nx + 1) + ix
            c = d + 1
            faces.append((a, b, c, d))
    mesh = bpy.data.meshes.new("AurelianContinuousTerrainMesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    terrain = bpy.data.objects.new("AurelianContinuousTerrain", mesh)
    bpy.context.collection.objects.link(terrain)
    terrain.data.materials.append(materials["plain"])
    terrain.data.materials.append(materials["ridge"])
    terrain.data.materials.append(materials["earth"])
    for polygon in terrain.data.polygons:
        center = terrain.data.vertices[polygon.vertices[0]].co
        average_z = sum(terrain.data.vertices[v].co.z for v in polygon.vertices) / len(polygon.vertices)
        river_distance = distance_to_polyline(center.x, center.y, layout["river"])
        if average_z > 4.5:
            polygon.material_index = 1
        elif river_distance < 10.0:
            polygon.material_index = 2
        else:
            polygon.material_index = 0
        polygon.use_smooth = True
    return terrain


def bounds_for(objects):
    points = []
    for obj in objects:
        if obj.type != "MESH":
            continue
        for corner in obj.bound_box:
            points.append(obj.matrix_world @ Vector(corner))
    if not points:
        raise RuntimeError("Imported asset has no mesh bounds")
    lower = Vector((min(p.x for p in points), min(p.y for p in points), min(p.z for p in points)))
    upper = Vector((max(p.x for p in points), max(p.y for p in points), max(p.z for p in points)))
    return lower, upper, upper - lower


def import_asset(source_root, key, position, rotation_deg, scale, ground_z=None, desired_span=None):
    source = source_root / ASSETS[key]
    if not source.is_file():
        raise FileNotFoundError(f"Missing pinned asset {key}: {source}")
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(source))
    imported = [obj for obj in bpy.data.objects if obj not in before]
    top_level = [obj for obj in imported if obj.parent is None or obj.parent not in imported]
    root = bpy.data.objects.new("Role_" + key, None)
    bpy.context.collection.objects.link(root)
    for obj in top_level:
        obj.parent = root
    root.rotation_euler.z = math.radians(rotation_deg)
    root.scale = (scale, scale, scale)
    bpy.context.view_layer.update()
    lower, upper, dims = bounds_for(imported)
    if desired_span is not None:
        current_span = max(dims.x, dims.y)
        if current_span <= 0:
            raise RuntimeError(f"Invalid span for {key}")
        factor = desired_span / current_span
        root.scale = tuple(component * factor for component in root.scale)
        bpy.context.view_layer.update()
        lower, upper, dims = bounds_for(imported)
    center = (lower + upper) * 0.5
    root.location.x += position[0] - center.x
    root.location.y += position[1] - center.y
    target_z = terrain_height(CURRENT_MODE, position[0], position[1]) if ground_z is None else ground_z
    root.location.z += target_z - lower.z
    bpy.context.view_layer.update()
    lower, upper, dims = bounds_for(imported)
    return root, {
        "role": key,
        "source_path": ASSETS[key],
        "source_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "position": [round(position[0], 4), round(position[1], 4), round(root.location.z, 4)],
        "rotation_z_degrees": rotation_deg,
        "world_aabb_min": [round(v, 4) for v in lower],
        "world_aabb_max": [round(v, 4) for v in upper],
        "world_aabb_size": [round(v, 4) for v in dims],
    }


def create_founder_flag(mode, location, materials):
    x, y = location
    z = terrain_height(mode, x, y)
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.12, depth=5.8, location=(x, y, z + 2.9))
    pole = bpy.context.object
    pole.name = "FounderFlagPole"
    pole.data.materials.append(materials["gold"])
    verts = [(x + 0.14, y, z + 5.5), (x + 0.14, y, z + 3.7), (x + 2.2, y, z + 4.7)]
    mesh = bpy.data.meshes.new("FounderFlagClothMesh")
    mesh.from_pydata(verts, [], [(0, 1, 2)])
    mesh.update()
    cloth = bpy.data.objects.new("FounderFlagCloth", mesh)
    bpy.context.collection.objects.link(cloth)
    cloth.data.materials.append(materials["red"])


def setup_render(mode, output_path):
    scene = bpy.context.scene
    try:
        scene.render.engine = "BLENDER_EEVEE_NEXT"
    except Exception:
        scene.render.engine = "BLENDER_EEVEE"
    width, height = LAYOUTS[mode]["camera"]["resolution"]
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = str(output_path)
    scene.render.film_transparent = False
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.exposure = 0.92
    scene.view_settings.gamma = 1.0
    world = bpy.data.worlds.new("AurelianWorld")
    world.use_nodes = True
    background = world.node_tree.nodes.get("Background")
    background.inputs["Color"].default_value = hex_rgba("#9aa9a2")
    background.inputs["Strength"].default_value = 0.48
    scene.world = world
    bpy.ops.object.light_add(type="SUN", location=(0.0, 0.0, 90.0))
    sun = bpy.context.object
    sun.name = "AurelianSun"
    sun.rotation_euler = tuple(math.radians(v) for v in (48.0, -32.0, -20.0))
    sun.data.energy = 1.05
    sun.data.color = hex_rgba("#fff1d4")[:3]
    sun.data.angle = math.radians(14.0)
    camera_cfg = LAYOUTS[mode]["camera"]
    bpy.ops.object.camera_add(location=camera_cfg["position"])
    camera = bpy.context.object
    camera.name = mode.capitalize() + "Camera"
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = camera_cfg["ortho"]
    aim(camera, camera_cfg["target"])
    scene.camera = camera
    return camera


def build_scene(mode, source_root, output_dir, blueprint):
    global CURRENT_MODE
    CURRENT_MODE = mode
    bpy.ops.wm.read_factory_settings(use_empty=True)
    materials = {
        "plain": make_material("Terrain_Olive", (0.34, 0.39, 0.22, 1.0), 0.97),
        "ridge": make_material("Terrain_Wooded", (0.23, 0.31, 0.18, 1.0), 0.98),
        "earth": make_material("Terrain_Bank_Earth", (0.34, 0.25, 0.16, 1.0), 0.98),
        "water": make_material("River_Teal", (0.08, 0.34, 0.39, 1.0), 0.32, 0.03),
        "road": make_material("Road_Ochre", (0.53, 0.40, 0.25, 1.0), 0.99),
        "red": make_material("Founder_Red", (0.50, 0.045, 0.03, 1.0), 0.86),
        "gold": make_material("Founder_Gold", (0.76, 0.52, 0.10, 1.0), 0.75, 0.05),
    }
    layout = LAYOUTS[mode]
    create_terrain(mode, materials)
    create_ribbon("RiverWater", mode, layout["river"], 19.0, materials["water"], fixed_z=layout["water_z"])
    create_ribbon("RoadApproach", mode, layout["road_before"], 5.0, materials["road"], z_offset=0.10)
    create_ribbon("RoadSettlement", mode, layout["road_after"], 5.0, materials["road"], z_offset=0.10)
    placements = []
    bridge_cfg = layout["bridge"]
    _, bridge_data = import_asset(source_root, "bridge", bridge_cfg["position"], bridge_cfg["rotation"], 1.0, ground_z=layout["water_z"] - 0.35, desired_span=27.0)
    placements.append(bridge_data)
    for role, position, rotation in layout["buildings"]:
        _, data = import_asset(source_root, role, position, rotation, UNIFORM_SCALE)
        placements.append(data)
    for index, (x, y, rotation) in enumerate(layout["trees"]):
        key = "tree_a" if index % 2 == 0 else "tree_b"
        _, data = import_asset(source_root, key, (x, y), rotation, 8.8 + (index % 3) * 0.7)
        placements.append(data)
    for index, (x, y, rotation) in enumerate(layout["rocks"]):
        key = "rock_c" if index % 2 == 0 else "rock_e"
        _, data = import_asset(source_root, key, (x, y), rotation, 10.0 + (index % 2) * 1.8)
        placements.append(data)
    create_founder_flag(mode, (15.0, 27.0) if mode == "desktop" else (-1.0, 30.0), materials)
    preview_path = output_dir / f"blender-{mode}-preview.png"
    camera = setup_render(mode, preview_path)
    bpy.ops.render.render(write_still=True)
    if not preview_path.is_file() or preview_path.stat().st_size < 20000:
        raise RuntimeError(f"Blender preview failed for {mode}")
    glb_path = output_dir / f"aurelian-basin-{mode}.glb"
    bpy.ops.export_scene.gltf(filepath=str(glb_path), export_format="GLB", export_cameras=True, export_apply=True)
    if not glb_path.is_file() or glb_path.stat().st_size < 100000:
        raise RuntimeError(f"GLB export failed for {mode}")
    blend_path = output_dir / f"aurelian-basin-{mode}.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    contract = {
        "mode": mode,
        "source_commit": SOURCE_SHA,
        "blueprint_commit": BLUEPRINT_SHA,
        "blueprint_status": blueprint.get("status"),
        "uniform_scale": UNIFORM_SCALE,
        "max_primary_silhouette_overlap": blueprint["rules"]["max_primary_silhouette_overlap"],
        "road_width_world": 5.0,
        "river_clear_width_world": 19.0,
        "bridge_clear_span_world": 27.0,
        "camera": {
            "position": list(layout["camera"]["position"]),
            "target": list(layout["camera"]["target"]),
            "orthographic_size": layout["camera"]["ortho"],
            "resolution": list(layout["camera"]["resolution"]),
            "change_reason": layout["camera_change_reason"],
        },
        "placements": placements,
        "preview_sha256": hashlib.sha256(preview_path.read_bytes()).hexdigest(),
        "glb_sha256": hashlib.sha256(glb_path.read_bytes()).hexdigest(),
        "glb_bytes": glb_path.stat().st_size,
        "camera_object": camera.name,
    }
    (output_dir / f"blender-{mode}-contract.json").write_text(json.dumps(contract, indent=2) + "\n")
    print(f"BLENDER_MASTER_EXPORTED={mode}:{glb_path}")


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    if len(argv) != 3:
        raise SystemExit("Usage: blender -b --python aurelian_basin_master.py -- <kaykit_root> <blueprint_json> <output_dir>")
    source_root = Path(argv[0]).resolve()
    blueprint_path = Path(argv[1]).resolve()
    output_dir = Path(argv[2]).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    blueprint = json.loads(blueprint_path.read_text())
    if blueprint.get("source", {}).get("kaykit_commit") != SOURCE_SHA:
        raise RuntimeError("Blueprint KayKit commit mismatch")
    if float(blueprint.get("source", {}).get("uniform_scale", 0.0)) != UNIFORM_SCALE:
        raise RuntimeError("Blueprint scale mismatch")
    for key, relative in ASSETS.items():
        source = source_root / relative
        if not source.is_file():
            raise FileNotFoundError(f"Pinned source missing {key}: {source}")
    build_scene("desktop", source_root, output_dir, blueprint)
    build_scene("portrait", source_root, output_dir, blueprint)
    manifest = {
        "source_commit": SOURCE_SHA,
        "blueprint_commit": BLUEPRINT_SHA,
        "assets": {key: {"path": path, "sha256": hashlib.sha256((source_root / path).read_bytes()).hexdigest()} for key, path in ASSETS.items()},
    }
    (output_dir / "source-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"AURELIAN_DCC_PACKAGE_EXPORTED={output_dir}")


CURRENT_MODE = "desktop"

if __name__ == "__main__":
    main()
