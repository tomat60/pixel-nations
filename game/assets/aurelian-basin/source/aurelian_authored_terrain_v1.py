import bpy
import hashlib
import json
import math
import sys
from pathlib import Path
from mathutils import Vector

KAYKIT_SHA = "84fa4e91af6a88989be7c99e0891cede11f2ca38"
TOPOLOGY_CENTER = Vector((500.0, 450.0))
TOPOLOGY_SCALE = 0.018

BASIN_OUTLINE = [
    (70, 135), (195, 55), (430, 20), (700, 55), (900, 190),
    (965, 420), (915, 670), (790, 825), (670, 915), (625, 1015),
    (575, 925), (350, 875), (155, 735), (55, 500), (40, 285),
]
RIVER_POINTS = [
    (505, 0), (500, 105), (520, 215), (505, 315), (525, 430),
    (505, 555), (535, 680), (580, 800), (610, 900), (625, 1015),
]
LANDMARKS = {
    "GreenvaleOrigin": (354, 285),
    "Bridge_GildedCrossing": (515, 340),
    "NorthRidge": (700, 205),
    "ForestWorkEdge": (245, 205),
    "FieldsPlains": (405, 505),
    "OldRoadJunction": (425, 405),
    "EastRoute": (760, 410),
    "SouthMarsh": (365, 690),
    "CoastOutflow": (610, 875),
    "Northgate": (445, 65),
}
ROUTES = {
    "GreenvaleCrossing": [(354, 285), (395, 300), (425, 320), (455, 340)],
    "OldRoad": [(210, 520), (310, 470), (425, 405), (455, 340)],
    "EastTradeRoute": [(575, 340), (650, 375), (760, 410), (910, 455)],
    "NorthRidgeRoute": [(575, 340), (625, 300), (665, 250), (700, 205)],
    "NorthgateRoute": [(354, 285), (390, 210), (420, 130), (445, 65)],
}
BRIDGE_ENDPOINTS = [(455, 340), (575, 340)]

ASSETS = {
    "bridge": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/neutral/building_bridge_A.gltf",
    "blacksmith": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/blue/building_blacksmith_blue.gltf",
    "barracks": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/blue/building_barracks_blue.gltf",
    "church": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/blue/building_church_blue.gltf",
    "flag": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/flag_blue.gltf",
    "tree_a": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/nature/tree_single_A.gltf",
    "tree_b": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/nature/tree_single_B.gltf",
    "hill_a": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/nature/hill_single_A.gltf",
    "hill_b": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/nature/hill_single_B.gltf",
    "rock_a": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/nature/rock_single_A.gltf",
    "rock_c": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/nature/rock_single_C.gltf",
}

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if len(argv) != 2:
    raise SystemExit("Usage: blender -b --python aurelian_authored_terrain_v1.py -- <kaykit_root> <output_dir>")
KAYKIT_ROOT = Path(argv[0]).resolve()
OUTPUT_DIR = Path(argv[1]).resolve()
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def topo_to_world(point, height=0.0):
    x, y = point
    return Vector(((x - TOPOLOGY_CENTER.x) * TOPOLOGY_SCALE, (y - TOPOLOGY_CENTER.y) * TOPOLOGY_SCALE, height))


def point_in_polygon(point, polygon):
    x, y = point
    inside = False
    j = len(polygon) - 1
    for i in range(len(polygon)):
        xi, yi = polygon[i]
        xj, yj = polygon[j]
        if (yi > y) != (yj > y):
            crossing_x = (xj - xi) * (y - yi) / (yj - yi) + xi
            if x < crossing_x:
                inside = not inside
        j = i
    return inside


def segment_distance(p, a, b):
    px, py = p
    ax, ay = a
    bx, by = b
    vx, vy = bx - ax, by - ay
    denom = vx * vx + vy * vy
    if denom <= 1e-9:
        return math.hypot(px - ax, py - ay)
    t = max(0.0, min(1.0, ((px - ax) * vx + (py - ay) * vy) / denom))
    qx, qy = ax + t * vx, ay + t * vy
    return math.hypot(px - qx, py - qy)


def distance_to_polyline(point, points):
    return min(segment_distance(point, points[i], points[i + 1]) for i in range(len(points) - 1))


def gaussian(point, center, radius):
    dx = point[0] - center[0]
    dy = point[1] - center[1]
    d = math.hypot(dx, dy) / radius
    return math.exp(-d * d * 1.7)


def terrain_height(point):
    x, y = point
    height = 0.22
    height += 1.65 * gaussian(point, LANDMARKS["NorthRidge"], 165.0)
    height += 0.52 * gaussian(point, LANDMARKS["ForestWorkEdge"], 190.0)
    height += 0.10 * gaussian(point, LANDMARKS["GreenvaleOrigin"], 220.0)
    height -= 0.18 * gaussian(point, LANDMARKS["FieldsPlains"], 180.0)
    height -= 0.32 * gaussian(point, LANDMARKS["SouthMarsh"], 195.0)
    height += 0.07 * math.sin(x * 0.026) * math.cos(y * 0.021)
    height += 0.035 * math.sin((x + y) * 0.041)

    river_distance = distance_to_polyline(point, RIVER_POINTS)
    width = 38.0 + 45.0 * max(0.0, min(1.0, y / 1015.0))
    valley_radius = width * 1.65
    if river_distance < valley_radius:
        t = 1.0 - river_distance / valley_radius
        height -= 0.52 * t * t

    if y > 760.0:
        coast = min(1.0, (y - 760.0) / 255.0)
        height -= 0.42 * coast * coast
    return height


def make_material(name, color, roughness=0.94):
    material = bpy.data.materials.new(name)
    material.diffuse_color = color
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color
        bsdf.inputs["Roughness"].default_value = roughness
    return material


def make_materials():
    return {
        "meadow": make_material("Aurelian_Meadow", (0.20, 0.27, 0.12, 1.0)),
        "forest": make_material("Aurelian_ForestGround", (0.10, 0.17, 0.08, 1.0)),
        "ridge": make_material("Aurelian_Ridge", (0.24, 0.23, 0.20, 1.0)),
        "fields": make_material("Aurelian_Fields", (0.36, 0.28, 0.12, 1.0)),
        "marsh": make_material("Aurelian_Marsh", (0.13, 0.20, 0.15, 1.0)),
        "bank": make_material("Aurelian_Bank", (0.28, 0.21, 0.14, 1.0)),
        "road": make_material("Aurelian_Road", (0.28, 0.19, 0.11, 1.0)),
        "water": make_material("Aurelian_Water", (0.045, 0.15, 0.18, 1.0), 0.42),
        "crop": make_material("Aurelian_Crops", (0.42, 0.34, 0.14, 1.0)),
    }


def material_key(point):
    river_distance = distance_to_polyline(point, RIVER_POINTS)
    if river_distance < 52.0:
        return "bank"
    if math.hypot(point[0] - LANDMARKS["NorthRidge"][0], point[1] - LANDMARKS["NorthRidge"][1]) < 145:
        return "ridge"
    if math.hypot(point[0] - LANDMARKS["ForestWorkEdge"][0], point[1] - LANDMARKS["ForestWorkEdge"][1]) < 175:
        return "forest"
    if math.hypot(point[0] - LANDMARKS["FieldsPlains"][0], point[1] - LANDMARKS["FieldsPlains"][1]) < 175:
        return "fields"
    if point[1] > 625 and (math.hypot(point[0] - LANDMARKS["SouthMarsh"][0], point[1] - LANDMARKS["SouthMarsh"][1]) < 220 or river_distance < 115):
        return "marsh"
    return "meadow"


def create_authored_terrain(materials):
    step = 10
    grid = {}
    verts = []
    for y in range(0, 1031, step):
        for x in range(20, 981, step):
            if not point_in_polygon((x, y), BASIN_OUTLINE):
                continue
            index = len(verts)
            grid[(x, y)] = index
            w = topo_to_world((x, y), terrain_height((x, y)))
            verts.append((w.x, w.y, w.z))

    faces = []
    face_centers = []
    for y in range(0, 1021, step):
        for x in range(20, 971, step):
            keys = [(x, y), (x + step, y), (x + step, y + step), (x, y + step)]
            if not all(key in grid for key in keys):
                continue
            faces.append(tuple(grid[key] for key in keys))
            face_centers.append((x + step * 0.5, y + step * 0.5))

    if len(faces) < 6200:
        raise RuntimeError(f"Aurelian Basin terrain coverage unexpectedly sparse: {len(faces)} cells")

    mesh = bpy.data.meshes.new("AurelianAuthoredTerrainMesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new("AurelianAuthoredTerrain", mesh)
    bpy.context.collection.objects.link(obj)
    obj["terrain_face_cells"] = len(faces)

    order = ["meadow", "forest", "ridge", "fields", "marsh", "bank"]
    for key in order:
        obj.data.materials.append(materials[key])
    for poly, center in zip(obj.data.polygons, face_centers):
        poly.material_index = order.index(material_key(center))
        poly.use_smooth = True
    return obj


def resample(points, steps=10):
    result = []
    for i in range(len(points) - 1):
        a = Vector(points[i])
        b = Vector(points[i + 1])
        for step in range(steps):
            result.append(a.lerp(b, step / float(steps)))
    result.append(Vector(points[-1]))
    return result


def create_strip(name, points, width_fn, z_fn, material):
    sampled = resample(points, 10)
    verts = []
    faces = []
    for i, point in enumerate(sampled):
        previous = sampled[max(0, i - 1)]
        following = sampled[min(len(sampled) - 1, i + 1)]
        tangent = (following - previous).normalized()
        normal = Vector((-tangent.y, tangent.x))
        width = width_fn(point, i, len(sampled))
        for side in (1.0, -1.0):
            edge = point + normal * (width * 0.5 * side)
            w = topo_to_world((edge.x, edge.y), z_fn(point, edge, i, len(sampled)))
            verts.append((w.x, w.y, w.z))
    for i in range(len(sampled) - 1):
        a = i * 2
        faces.append((a, a + 1, a + 3, a + 2))
    mesh = bpy.data.meshes.new(name + "Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(material)
    return obj


def create_river(materials):
    def width_fn(point, _i, _n):
        t = max(0.0, min(1.0, point.y / 1015.0))
        return 34.0 + 118.0 * (t ** 1.65)

    def z_fn(center, _edge, _i, _n):
        return terrain_height((center.x, center.y)) + 0.055

    return create_strip("RiverWater", RIVER_POINTS, width_fn, z_fn, materials["water"])


def create_roads(materials):
    root = bpy.data.objects.new("RoadNetwork", None)
    bpy.context.collection.objects.link(root)
    for name, points in ROUTES.items():
        road = create_strip(
            name,
            points,
            lambda _p, _i, _n: 12.0 if name in ("GreenvaleCrossing", "EastTradeRoute") else 10.0,
            lambda center, _edge, _i, _n: terrain_height((center.x, center.y)) + 0.065,
            materials["road"],
        )
        road.parent = root
    return root


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


def import_asset(key, topology_point, desired_span, rotation_deg=0.0, name=None):
    source = KAYKIT_ROOT / ASSETS[key]
    if not source.is_file():
        raise FileNotFoundError(f"Missing pinned KayKit asset {key}: {source}")
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(source))
    imported = [obj for obj in bpy.data.objects if obj not in before]
    top_level = [obj for obj in imported if obj.parent is None or obj.parent not in imported]
    lower, _upper, size = bounds_for(imported)
    span = max(size.x, size.y, size.z)
    if span <= 1e-6:
        raise RuntimeError(f"Asset {key} has zero bounds")
    factor = desired_span / span
    root = bpy.data.objects.new(name or ("Asset_" + key), None)
    bpy.context.collection.objects.link(root)
    for obj in top_level:
        obj.parent = root
    p = topo_to_world(topology_point, terrain_height(topology_point))
    root.scale = (factor, factor, factor)
    root.rotation_euler.z = math.radians(rotation_deg)
    root.location = (p.x, p.y, p.z - lower.z * factor + 0.02)
    return root


def create_greenvale():
    root = bpy.data.objects.new("GreenvaleOrigin", None)
    bpy.context.collection.objects.link(root)
    placements = [
        ("blacksmith", (315, 300), 0.88, -12),
        ("barracks", (382, 305), 0.92, 10),
        ("church", (350, 245), 1.02, 2),
        ("flag", (365, 278), 0.50, 0),
    ]
    for key, point, span, rotation in placements:
        import_asset(key, point, span, rotation, f"Greenvale_{key}").parent = root
    return root


def create_bridge():
    root = import_asset("bridge", LANDMARKS["Bridge_GildedCrossing"], 2.25, 90.0, "Bridge_GildedCrossing")
    root.scale.x *= 0.42
    p = topo_to_world(LANDMARKS["Bridge_GildedCrossing"], terrain_height(LANDMARKS["Bridge_GildedCrossing"]))
    root.location.z = p.z + 0.14
    return root


def create_landmarks():
    forest = bpy.data.objects.new("ForestWorkEdge", None)
    bpy.context.collection.objects.link(forest)
    tree_points = [(195, 165), (220, 205), (250, 170), (275, 210), (205, 235), (250, 240), (290, 185)]
    for i, point in enumerate(tree_points):
        key = "tree_a" if i % 2 == 0 else "tree_b"
        import_asset(key, point, 0.92 + 0.06 * (i % 3), i * 29.0, f"ForestTree_{i:02d}").parent = forest

    ridge = bpy.data.objects.new("NorthRidge", None)
    bpy.context.collection.objects.link(ridge)
    for key, point, span, rotation in [
        ("hill_a", (675, 215), 2.5, -12), ("hill_b", (720, 195), 2.3, 16),
        ("rock_a", (690, 230), 0.92, 31), ("rock_c", (745, 225), 0.86, -28),
    ]:
        import_asset(key, point, span, rotation, f"NorthRidge_{key}").parent = ridge


def create_field_rows(materials):
    root = bpy.data.objects.new("FieldsPlains", None)
    bpy.context.collection.objects.link(root)
    center = LANDMARKS["FieldsPlains"]
    for i in range(7):
        y = center[1] - 42 + i * 14
        points = [(center[0] - 72, y), (center[0] + 82, y + 8)]
        row = create_strip(
            f"FieldRow_{i:02d}", points,
            lambda _p, _i, _n: 4.0,
            lambda c, _e, _i, _n: terrain_height((c.x, c.y)) + 0.06,
            materials["crop"],
        )
        row.parent = root


def add_semantic_anchors():
    for name, point in LANDMARKS.items():
        empty = bpy.data.objects.new(name if name not in bpy.data.objects else name + "_Anchor", None)
        w = topo_to_world(point, terrain_height(point))
        empty.location = (w.x, w.y, w.z)
        empty.empty_display_type = "PLAIN_AXES"
        empty.empty_display_size = 0.35
        bpy.context.collection.objects.link(empty)


def write_manifests(glb_path, blend_path):
    terrain = bpy.data.objects.get("AurelianAuthoredTerrain")
    terrain_face_cells = int(terrain.get("terrain_face_cells", 0)) if terrain else 0
    manifest = {
        "contract": "AURELIAN_AUTHORED_TERRAIN_V1",
        "topology_plane": [1000, 900],
        "extended_outflow_y": 1015,
        "basin_outline": BASIN_OUTLINE,
        "river_centerline": RIVER_POINTS[:9],
        "outflow_extension": RIVER_POINTS[8:],
        "bridge": {"center": list(LANDMARKS["Bridge_GildedCrossing"]), "endpoints": BRIDGE_ENDPOINTS, "asset": ASSETS["bridge"]},
        "routes": ROUTES,
        "landmarks": LANDMARKS,
        "kaykit_source_commit": KAYKIT_SHA,
        "visual_technique": "authored irregular Blender terrain mesh + imported KayKit props",
        "rectangular_outer_water_plane": False,
        "runtime_generated_terrain": False,
        "terrain_face_cells": terrain_face_cells,
    }
    manifest["blend_sha256"] = hashlib.sha256(blend_path.read_bytes()).hexdigest()
    manifest["glb_sha256"] = hashlib.sha256(glb_path.read_bytes()).hexdigest()
    manifest["glb_bytes"] = glb_path.stat().st_size
    (OUTPUT_DIR / "transform-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")

    sources = {}
    for key, rel in ASSETS.items():
        path = KAYKIT_ROOT / rel
        sources[key] = {"path": rel, "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}
    (OUTPUT_DIR / "source-manifest.json").write_text(json.dumps({"source_commit": KAYKIT_SHA, "assets": sources}, indent=2) + "\n")


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for key, rel in ASSETS.items():
        if not (KAYKIT_ROOT / rel).is_file():
            raise FileNotFoundError(f"Missing pinned source {key}: {KAYKIT_ROOT / rel}")

    materials = make_materials()
    create_authored_terrain(materials)
    create_river(materials)
    create_roads(materials)
    create_bridge()
    create_greenvale()
    create_landmarks()
    create_field_rows(materials)
    add_semantic_anchors()

    scene = bpy.context.scene
    scene["pixel_nations_contract"] = "AURELIAN_AUTHORED_TERRAIN_V1"
    scene["kaykit_source_commit"] = KAYKIT_SHA
    scene["rectangular_outer_water_plane"] = False

    blend_path = OUTPUT_DIR / "aurelian_authored_terrain_v1.blend"
    glb_path = OUTPUT_DIR / "aurelian_authored_terrain_v1.glb"
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    bpy.ops.export_scene.gltf(filepath=str(glb_path), export_format="GLB", export_apply=True, export_cameras=False, export_lights=False)
    if not glb_path.is_file() or glb_path.stat().st_size < 200000:
        raise RuntimeError(f"GLB export failed or unexpectedly small: {glb_path}")
    write_manifests(glb_path, blend_path)
    print(f"AURELIAN_AUTHORED_BLEND={blend_path}")
    print(f"AURELIAN_AUTHORED_GLB={glb_path}")
    print("AURELIAN_AUTHORED_TERRAIN=PASS")


main()
