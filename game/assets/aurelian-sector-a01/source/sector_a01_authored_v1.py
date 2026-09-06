import bpy
import hashlib
import json
import math
import sys
from pathlib import Path
from mathutils import Vector

KAYKIT_SHA = "84fa4e91af6a88989be7c99e0891cede11f2ca38"
TOPOLOGY_CENTER = Vector((800.0, 700.0))
TOPOLOGY_SCALE = 0.020
SEA_LEVEL = -0.18

LAND_OUTLINE = [
    (115, 390), (180, 225), (330, 125), (515, 82), (690, 105),
    (820, 58), (1015, 112), (1175, 205), (1320, 325), (1435, 500),
    (1470, 675), (1425, 835), (1330, 985), (1200, 1115), (1040, 1215),
    (855, 1302), (665, 1280), (505, 1210), (350, 1110), (235, 955),
    (150, 785), (105, 610),
]

RIVER_POINTS = [
    (430, 205), (470, 315), (520, 425), (585, 535), (635, 620),
    (705, 705), (800, 750), (910, 780), (1035, 790), (1175, 800), (1360, 775),
]

ANCHORS = {
    "AurelianHome": (635, 620),
    "Pinewatch": (360, 505),
    "Stormcap": (405, 245),
    "EastRidge": (1115, 335),
    "Saltmere": (1285, 790),
    "Southfen": (555, 1060),
    "OldCrown": (1010, 1045),
    "FrontierPass": (790, 190),
}

ASSETS = {
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
    raise SystemExit("Usage: blender -b --python sector_a01_authored_v1.py -- <kaykit_root> <output_dir>")
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


def segment_distance(point, a, b):
    px, py = point
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


def distance_to_outline(point):
    closed = LAND_OUTLINE + [LAND_OUTLINE[0]]
    return distance_to_polyline(point, closed)


def gaussian(point, center, radius):
    dx = point[0] - center[0]
    dy = point[1] - center[1]
    d = math.hypot(dx, dy) / radius
    return math.exp(-d * d * 1.65)


def terrain_height(point):
    x, y = point
    height = 0.56

    # Three distinct relief families form the regional silhouette before any markers.
    height += 2.55 * gaussian(point, ANCHORS["Stormcap"], 185.0)
    height += 1.95 * gaussian(point, ANCHORS["EastRidge"], 205.0)
    height += 1.20 * gaussian(point, ANCHORS["OldCrown"], 175.0)
    height += 0.72 * gaussian(point, ANCHORS["FrontierPass"], 150.0)

    # Aurelian sits in a basin; Southfen is a true lowland rather than a token patch.
    height -= 0.50 * gaussian(point, ANCHORS["AurelianHome"], 175.0)
    height -= 0.46 * gaussian(point, ANCHORS["Southfen"], 165.0)

    # Broad rolling midlands break the procedural-grid read without becoming noise.
    height += 0.11 * math.sin(x * 0.017) * math.cos(y * 0.015)
    height += 0.065 * math.sin((x + y) * 0.026)
    height += 0.045 * math.cos((x - 2.0 * y) * 0.019)

    river_distance = distance_to_polyline(point, RIVER_POINTS)
    valley_radius = 82.0 + 20.0 * max(0.0, min(1.0, y / 1400.0))
    if river_distance < valley_radius:
        t = 1.0 - river_distance / valley_radius
        height -= 0.40 * t * t

    # Pull the irregular perimeter gently down to sea level so the shoreline belongs
    # to the landmass instead of looking like a board plate resting on water.
    coast_distance = distance_to_outline(point)
    if coast_distance < 115.0:
        t = 1.0 - coast_distance / 115.0
        height -= 0.62 * t * t
    return height


def make_material(name, color, roughness=0.95):
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
        "meadow": make_material("SectorA01_Meadow", (0.27, 0.34, 0.19, 1.0)),
        "forest": make_material("SectorA01_ForestGround", (0.12, 0.22, 0.13, 1.0)),
        "ridge": make_material("SectorA01_Ridge", (0.34, 0.33, 0.29, 1.0)),
        "dry": make_material("SectorA01_DryEast", (0.42, 0.36, 0.23, 1.0)),
        "marsh": make_material("SectorA01_Marsh", (0.18, 0.27, 0.22, 1.0)),
        "coast": make_material("SectorA01_Coast", (0.43, 0.40, 0.28, 1.0)),
        "water": make_material("SectorA01_Water", (0.055, 0.20, 0.25, 1.0), 0.42),
    }


def material_key(point, height):
    if distance_to_outline(point) < 72.0:
        return "coast"
    if gaussian(point, ANCHORS["Pinewatch"], 220.0) > 0.40:
        return "forest"
    if gaussian(point, ANCHORS["Southfen"], 190.0) > 0.46:
        return "marsh"
    if gaussian(point, ANCHORS["EastRidge"], 260.0) > 0.30 and point[0] > 950:
        return "dry"
    if height > 1.55:
        return "ridge"
    return "meadow"


def create_terrain(materials):
    step = 20
    grid = {}
    verts = []
    min_x = min(p[0] for p in LAND_OUTLINE) - step
    max_x = max(p[0] for p in LAND_OUTLINE) + step
    min_y = min(p[1] for p in LAND_OUTLINE) - step
    max_y = max(p[1] for p in LAND_OUTLINE) + step

    for y in range(min_y, max_y + 1, step):
        for x in range(min_x, max_x + 1, step):
            if not point_in_polygon((x, y), LAND_OUTLINE):
                continue
            index = len(verts)
            grid[(x, y)] = index
            h = terrain_height((x, y))
            w = topo_to_world((x, y), h)
            verts.append((w.x, w.y, w.z))

    faces = []
    centers = []
    for y in range(min_y, max_y, step):
        for x in range(min_x, max_x, step):
            keys = [(x, y), (x + step, y), (x + step, y + step), (x, y + step)]
            if not all(key in grid for key in keys):
                continue
            faces.append(tuple(grid[key] for key in keys))
            centers.append((x + step * 0.5, y + step * 0.5))

    if len(faces) < 2500:
        raise RuntimeError(f"Sector A-01 terrain unexpectedly sparse: {len(faces)} cells")

    mesh = bpy.data.meshes.new("SectorA01AuthoredTerrainMesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new("SectorA01AuthoredTerrain", mesh)
    bpy.context.collection.objects.link(obj)
    obj["terrain_face_cells"] = len(faces)

    order = ["meadow", "forest", "ridge", "dry", "marsh", "coast"]
    for key in order:
        obj.data.materials.append(materials[key])
    for poly, center in zip(obj.data.polygons, centers):
        poly.material_index = order.index(material_key(center, terrain_height(center)))
        poly.use_smooth = True
    return obj


def create_ocean(materials):
    bpy.ops.mesh.primitive_plane_add(size=1.0, location=(0.0, 0.0, SEA_LEVEL))
    ocean = bpy.context.object
    ocean.name = "SectorA01Ocean"
    ocean.scale = (42.0, 36.0, 1.0)
    ocean.data.materials.append(materials["water"])
    return ocean


def resample(points, steps=8):
    result = []
    for i in range(len(points) - 1):
        a = Vector(points[i])
        b = Vector(points[i + 1])
        for step in range(steps):
            result.append(a.lerp(b, step / float(steps)))
    result.append(Vector(points[-1]))
    return result


def create_strip(name, points, width_fn, z_fn, material):
    sampled = resample(points)
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
        t = max(0.0, min(1.0, point.x / 1500.0))
        return 26.0 + 44.0 * t

    def z_fn(center, _edge, _i, _n):
        return terrain_height((center.x, center.y)) + 0.045

    return create_strip("SectorA01River", RIVER_POINTS, width_fn, z_fn, materials["water"])


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
    root.location = (p.x, p.y, p.z - lower.z * factor + 0.018)
    return root


def create_aurelian_home():
    root = bpy.data.objects.new("AurelianHome", None)
    bpy.context.collection.objects.link(root)
    placements = [
        ("church", (626, 604), 0.78, 2),
        ("barracks", (652, 618), 0.64, 14),
        ("blacksmith", (615, 640), 0.58, -18),
        ("flag", (642, 596), 0.34, 0),
    ]
    for key, point, span, rotation in placements:
        import_asset(key, point, span, rotation, f"AurelianHome_{key}").parent = root
    return root


def create_tree_cluster(name, center, points, span=0.70):
    root = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(root)
    for i, offset in enumerate(points):
        point = (center[0] + offset[0], center[1] + offset[1])
        key = "tree_a" if i % 2 == 0 else "tree_b"
        import_asset(key, point, span + 0.06 * (i % 3), i * 31.0, f"{name}_{i:02d}").parent = root
    return root


def create_highland_cluster(name, center, scale=1.0):
    root = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(root)
    specs = [
        ("hill_a", (-44, 12), 2.25 * scale, -12),
        ("hill_b", (28, -18), 2.05 * scale, 17),
        ("rock_a", (-5, 34), 0.82 * scale, 31),
        ("rock_c", (52, 28), 0.75 * scale, -24),
    ]
    for key, offset, span, rot in specs:
        point = (center[0] + offset[0], center[1] + offset[1])
        import_asset(key, point, span, rot, f"{name}_{key}").parent = root
    return root


def create_marsh(materials):
    root = bpy.data.objects.new("SouthfenWetlands", None)
    bpy.context.collection.objects.link(root)
    center = ANCHORS["Southfen"]
    for i in range(7):
        angle = i * (math.tau / 7.0)
        point = (center[0] + math.cos(angle) * (35 + 7 * i), center[1] + math.sin(angle) * (20 + 5 * i))
        w = topo_to_world(point, terrain_height(point) + 0.025)
        bpy.ops.mesh.primitive_cylinder_add(vertices=18, radius=0.45 + 0.07 * (i % 3), depth=0.025, location=(w.x, w.y, w.z))
        pool = bpy.context.object
        pool.name = f"SouthfenPool_{i:02d}"
        pool.scale.y = 0.62 + 0.08 * (i % 2)
        pool.data.materials.append(materials["water"])
    return root


def create_places(materials):
    create_aurelian_home()

    forest_offsets = [
        (-95,-40),(-70,15),(-50,-75),(-30,-15),(-10,45),(20,-55),(40,5),(65,55),
        (85,-20),(100,35),(-90,80),(-55,95),(-20,80),(15,110),(55,95),(90,90),
        (-120,25),(-110,-90),(120,-65),(125,10),(5,-110),(55,-120),(-40,-125),(95,125),
    ]
    create_tree_cluster("PinewatchForest", ANCHORS["Pinewatch"], forest_offsets, 0.72)

    create_highland_cluster("StormcapHighlands", ANCHORS["Stormcap"], 1.12)
    create_highland_cluster("EastRidgeHighlands", ANCHORS["EastRidge"], 0.96)
    create_highland_cluster("OldCrownRelief", ANCHORS["OldCrown"], 0.70)

    import_asset("barracks", ANCHORS["Pinewatch"], 0.52, -18, "PinewatchKeep")
    import_asset("church", ANCHORS["OldCrown"], 0.60, 11, "OldCrownRuins")
    import_asset("blacksmith", ANCHORS["Saltmere"], 0.55, 28, "SaltmereHarbor")
    import_asset("flag", ANCHORS["FrontierPass"], 0.35, 0, "FrontierPassFlag")
    create_marsh(materials)


def add_semantic_anchors():
    for name, point in ANCHORS.items():
        empty = bpy.data.objects.new(name + "_Anchor", None)
        w = topo_to_world(point, terrain_height(point))
        empty.location = (w.x, w.y, w.z)
        empty.empty_display_type = "PLAIN_AXES"
        empty.empty_display_size = 0.32
        bpy.context.collection.objects.link(empty)


def write_manifests(glb_path, blend_path):
    terrain = bpy.data.objects.get("SectorA01AuthoredTerrain")
    face_cells = int(terrain.get("terrain_face_cells", 0)) if terrain else 0
    manifest = {
        "contract": "WORLD_SCALE_AUTHORED_SECTOR_A01_V1",
        "representation": "authored irregular regional landmass + integrated river/relief/biomes",
        "land_outline": LAND_OUTLINE,
        "river_centerline": RIVER_POINTS,
        "anchors": ANCHORS,
        "relief_families": ["StormcapHighlands", "EastRidgeHighlands", "OldCrownRelief"],
        "aurelian_role": "subordinate regional home cluster",
        "atlas_implemented": False,
        "runtime_generated_terrain": False,
        "visible_grid_representation": False,
        "literal_10000_land_rendering": False,
        "terrain_face_cells": face_cells,
        "kaykit_source_commit": KAYKIT_SHA,
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
    create_ocean(materials)
    create_terrain(materials)
    create_river(materials)
    create_places(materials)
    add_semantic_anchors()

    scene = bpy.context.scene
    scene["pixel_nations_contract"] = "WORLD_SCALE_AUTHORED_SECTOR_A01_V1"
    scene["kaykit_source_commit"] = KAYKIT_SHA
    scene["atlas_implemented"] = False
    scene["runtime_generated_terrain"] = False

    blend_path = OUTPUT_DIR / "sector_a01_authored_v1.blend"
    glb_path = OUTPUT_DIR / "sector_a01_authored_v1.glb"
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    bpy.ops.export_scene.gltf(filepath=str(glb_path), export_format="GLB", export_apply=True, export_cameras=False, export_lights=False)
    if not glb_path.is_file() or glb_path.stat().st_size < 180000:
        raise RuntimeError(f"Sector GLB export failed or unexpectedly small: {glb_path}")
    write_manifests(glb_path, blend_path)
    print(f"WORLD_SCALE_AUTHORED_SECTOR_BLEND={blend_path}")
    print(f"WORLD_SCALE_AUTHORED_SECTOR_GLB={glb_path}")
    print("WORLD_SCALE_AUTHORED_SECTOR_A01_V1=PASS")


main()
