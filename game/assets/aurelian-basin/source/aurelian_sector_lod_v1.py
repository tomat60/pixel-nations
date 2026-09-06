import bpy
import hashlib
import json
import math
import sys
from pathlib import Path
from mathutils import Vector

TOPOLOGY_SCALE = 0.018
TOPOLOGY_CENTER = Vector((500.0, 450.0))
LOD_STEP = 25
PAD_BOUNDS = (-300, -250, 1300, 1200)
SEA_LEVEL = -0.12
LOD_CITY_SCALE = 0.58

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if len(argv) != 4:
    raise SystemExit(
        "Usage: blender -b --python aurelian_sector_lod_v1.py -- "
        "<canonical_glb> <topology_manifest> <city_manifest> <output_dir>"
    )

CANONICAL_GLB = Path(argv[0]).resolve()
TOPOLOGY_MANIFEST_PATH = Path(argv[1]).resolve()
CITY_MANIFEST_PATH = Path(argv[2]).resolve()
OUTPUT_DIR = Path(argv[3]).resolve()
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

if not CANONICAL_GLB.is_file():
    raise FileNotFoundError(f"Missing canonical Aurelian GLB: {CANONICAL_GLB}")
if not TOPOLOGY_MANIFEST_PATH.is_file():
    raise FileNotFoundError(f"Missing topology manifest: {TOPOLOGY_MANIFEST_PATH}")
if not CITY_MANIFEST_PATH.is_file():
    raise FileNotFoundError(f"Missing city manifest: {CITY_MANIFEST_PATH}")

topology = json.loads(TOPOLOGY_MANIFEST_PATH.read_text())
city_manifest = json.loads(CITY_MANIFEST_PATH.read_text())

if topology.get("contract") != "AURELIAN_AUTHORED_TERRAIN_V1":
    raise RuntimeError("Unexpected canonical terrain contract")
if city_manifest.get("contract") != "PRODUCTION_VILLAGE_V1":
    raise RuntimeError("Unexpected city-state contract")

LANDMARKS = {key: tuple(value) for key, value in topology["landmarks"].items()}
RIVER_POINTS = [tuple(point) for point in topology["river_centerline"]]
for point in topology.get("outflow_extension", []):
    candidate = tuple(point)
    if not RIVER_POINTS or candidate != RIVER_POINTS[-1]:
        RIVER_POINTS.append(candidate)

LOD_CITY_NODES = [
    "Greenvale_flag",
    "Greenvale_blacksmith",
    "Greenvale_barracks",
    "Greenvale_church",
    "Greenvale_gatehouse_road",
    "Greenvale_city_hall",
    "Greenvale_market_hall",
    "Greenvale_civic_house_west",
    "Greenvale_civic_house_east",
    "Greenvale_watchtower",
]


def topo_to_world(point, height=0.0):
    x, y = point
    return Vector(((x - TOPOLOGY_CENTER.x) * TOPOLOGY_SCALE,
                   (y - TOPOLOGY_CENTER.y) * TOPOLOGY_SCALE,
                   height))


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
    if point[1] > 625 and (
        math.hypot(point[0] - LANDMARKS["SouthMarsh"][0], point[1] - LANDMARKS["SouthMarsh"][1]) < 220
        or river_distance < 115
    ):
        return "marsh"
    return "meadow"


def require_material(name):
    material = bpy.data.materials.get(name)
    if material is None:
        raise RuntimeError(f"Canonical material missing after GLB import: {name}")
    return material


def remove_object_tree(root):
    children = list(root.children)
    for child in children:
        remove_object_tree(child)
    bpy.data.objects.remove(root, do_unlink=True)


def copy_hierarchy(source, name):
    clone = source.copy()
    if source.data is not None:
        clone.data = source.data.copy()
    clone.name = name
    bpy.context.collection.objects.link(clone)
    for child in source.children:
        child_clone = copy_hierarchy(child, f"{name}_{child.name}")
        child_clone.parent = clone
        child_clone.matrix_parent_inverse = child.matrix_parent_inverse.copy()
        child_clone.location = child.location.copy()
        child_clone.rotation_euler = child.rotation_euler.copy()
        child_clone.scale = child.scale.copy()
    return clone


def create_sector_terrain(materials):
    min_x, min_y, max_x, max_y = PAD_BOUNDS
    grid = {}
    verts = []
    for y in range(min_y, max_y + 1, LOD_STEP):
        for x in range(min_x, max_x + 1, LOD_STEP):
            grid[(x, y)] = len(verts)
            w = topo_to_world((x, y), terrain_height((x, y)))
            verts.append((w.x, w.y, w.z))

    faces = []
    centers = []
    for y in range(min_y, max_y, LOD_STEP):
        for x in range(min_x, max_x, LOD_STEP):
            keys = [(x, y), (x + LOD_STEP, y), (x + LOD_STEP, y + LOD_STEP), (x, y + LOD_STEP)]
            if not all(key in grid for key in keys):
                continue
            faces.append(tuple(grid[key] for key in keys))
            centers.append((x + LOD_STEP * 0.5, y + LOD_STEP * 0.5))

    mesh = bpy.data.meshes.new("AurelianSectorLODMesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()

    obj = bpy.data.objects.new("AurelianSectorLODTerrain", mesh)
    bpy.context.collection.objects.link(obj)
    obj["terrain_face_cells"] = len(faces)
    obj["technical_padding_only"] = True

    order = ["meadow", "forest", "ridge", "fields", "marsh", "bank"]
    for key in order:
        obj.data.materials.append(materials[key])
    for poly, center in zip(obj.data.polygons, centers):
        poly.material_index = order.index(material_key(center))
        poly.use_smooth = True
    return obj


def create_outer_water(water_material):
    min_x, min_y, max_x, max_y = PAD_BOUNDS
    center = topo_to_world(((min_x + max_x) * 0.5, (min_y + max_y) * 0.5), SEA_LEVEL)
    span_x = (max_x - min_x + 800) * TOPOLOGY_SCALE
    span_y = (max_y - min_y + 800) * TOPOLOGY_SCALE
    bpy.ops.mesh.primitive_plane_add(size=1.0, location=(center.x, center.y, center.z))
    water = bpy.context.object
    water.name = "AurelianSectorLODOuterWater"
    water.scale = (span_x, span_y, 1.0)
    water.data.materials.append(water_material)
    water["technical_edges_intended_off_camera"] = True
    return water


def reposition_existing_city_sources():
    layout = city_manifest["layout_topology"]
    for name in ["Greenvale_flag", "Greenvale_blacksmith", "Greenvale_barracks", "Greenvale_church"]:
        node = bpy.data.objects.get(name)
        if node is None:
            raise RuntimeError(f"Canonical city source missing: {name}")
        target = topo_to_world(layout[name], 0.0)
        node.location.x = target.x
        node.location.y = target.y
        node.scale = node.scale * LOD_CITY_SCALE


def create_city_lod():
    derived = city_manifest["derived_nodes"]
    layout = city_manifest["layout_topology"]
    parent = bpy.data.objects.get("GreenvaleOrigin")
    if parent is None:
        raise RuntimeError("GreenvaleOrigin missing from canonical GLB")

    for name in LOD_CITY_NODES:
        if bpy.data.objects.get(name) is not None:
            continue
        spec = derived.get(name)
        if spec is None:
            raise RuntimeError(f"LOD city node has no accepted derived spec: {name}")
        source = bpy.data.objects.get(spec["source"])
        if source is None:
            raise RuntimeError(f"LOD source missing: {spec['source']}")
        clone = copy_hierarchy(source, name)
        clone.parent = parent
        target = topo_to_world(layout[name], 0.0)
        clone.location.x = target.x
        clone.location.y = target.y
        multiplier = float(spec.get("scale", 1.0))
        clone.scale = source.scale * multiplier
        clone.rotation_euler.z += math.radians(float(spec.get("rotation_y_degrees", 0.0)))

    allowed = set(LOD_CITY_NODES)
    for obj in list(bpy.data.objects):
        if obj.name.startswith("Greenvale_") and obj.name not in allowed:
            if obj.parent and obj.parent.name in allowed:
                continue
            remove_object_tree(obj)


def write_manifest(glb_path, blend_path, terrain):
    payload = {
        "contract": "AURELIAN_SECTOR_LOD_V1",
        "source_contract": topology["contract"],
        "city_contract": city_manifest["contract"],
        "source_glb_sha256": hashlib.sha256(CANONICAL_GLB.read_bytes()).hexdigest(),
        "topology_manifest_sha256": hashlib.sha256(TOPOLOGY_MANIFEST_PATH.read_bytes()).hexdigest(),
        "city_manifest_sha256": hashlib.sha256(CITY_MANIFEST_PATH.read_bytes()).hexdigest(),
        "kaykit_source_commit": topology["kaykit_source_commit"],
        "topology_reused": True,
        "canonical_landmarks": topology["landmarks"],
        "river_centerline": topology["river_centerline"],
        "routes_reused": topology["routes"],
        "new_semantic_anchors": 0,
        "technical_padding_only": True,
        "padding_bounds": list(PAD_BOUNDS),
        "terrain_step": LOD_STEP,
        "terrain_face_cells": int(terrain.get("terrain_face_cells", 0)),
        "lod_city_nodes": LOD_CITY_NODES,
        "new_asset_family": False,
        "gameplay_state_changed": False,
        "atlas_implemented": False,
        "technical_edges_intended_off_camera": True,
        "representation_delta": "campaign-scale LOD/composition only",
    }
    payload["blend_sha256"] = hashlib.sha256(blend_path.read_bytes()).hexdigest()
    payload["glb_sha256"] = hashlib.sha256(glb_path.read_bytes()).hexdigest()
    payload["glb_bytes"] = glb_path.stat().st_size
    (OUTPUT_DIR / "aurelian_sector_lod_v1_manifest.json").write_text(json.dumps(payload, indent=2) + "\n")


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(CANONICAL_GLB))

    canonical_terrain = bpy.data.objects.get("AurelianAuthoredTerrain")
    if canonical_terrain is None:
        raise RuntimeError("Canonical terrain object missing from GLB")

    materials = {
        "meadow": require_material("Aurelian_Meadow"),
        "forest": require_material("Aurelian_ForestGround"),
        "ridge": require_material("Aurelian_Ridge"),
        "fields": require_material("Aurelian_Fields"),
        "marsh": require_material("Aurelian_Marsh"),
        "bank": require_material("Aurelian_Bank"),
        "water": require_material("Aurelian_Water"),
    }

    remove_object_tree(canonical_terrain)
    terrain = create_sector_terrain(materials)
    create_outer_water(materials["water"])
    reposition_existing_city_sources()
    create_city_lod()

    scene = bpy.context.scene
    scene["pixel_nations_contract"] = "AURELIAN_SECTOR_LOD_V1"
    scene["source_contract"] = topology["contract"]
    scene["topology_reused"] = True
    scene["new_semantic_anchors"] = 0
    scene["new_asset_family"] = False

    blend_path = OUTPUT_DIR / "aurelian_sector_lod_v1.blend"
    glb_path = OUTPUT_DIR / "aurelian_sector_lod_v1.glb"
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    bpy.ops.export_scene.gltf(
        filepath=str(glb_path),
        export_format="GLB",
        export_apply=True,
        export_cameras=False,
        export_lights=False,
    )
    if not glb_path.is_file() or glb_path.stat().st_size < 250000:
        raise RuntimeError(f"Sector LOD GLB export failed or unexpectedly small: {glb_path}")
    write_manifest(glb_path, blend_path, terrain)
    print(f"AURELIAN_SECTOR_LOD_BLEND={blend_path}")
    print(f"AURELIAN_SECTOR_LOD_GLB={glb_path}")
    print("AURELIAN_SECTOR_LOD_V1=PASS")


main()
