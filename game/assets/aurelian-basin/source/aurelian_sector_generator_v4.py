import bpy
import hashlib
import json
import math
import random
import sys
from pathlib import Path
from mathutils import Vector

SECTOR_WORLD_SCALE = 0.010
SEA_LEVEL = -0.18
TERRAIN_STEP = 60

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if len(argv) not in (5, 6):
    raise SystemExit(
        "Usage: blender -b --python aurelian_sector_generator_v4.py -- "
        "<canonical_glb> <topology_manifest> <city_manifest> <sector_spec> <output_dir> [seed_override]"
    )

CANONICAL_GLB = Path(argv[0]).resolve()
TOPOLOGY_MANIFEST_PATH = Path(argv[1]).resolve()
CITY_MANIFEST_PATH = Path(argv[2]).resolve()
SPEC_PATH = Path(argv[3]).resolve()
OUTPUT_DIR = Path(argv[4]).resolve()
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
SEED_OVERRIDE = int(argv[5]) if len(argv) == 6 else None

for required in (CANONICAL_GLB, TOPOLOGY_MANIFEST_PATH, CITY_MANIFEST_PATH, SPEC_PATH):
    if not required.is_file():
        raise FileNotFoundError(required)

topology = json.loads(TOPOLOGY_MANIFEST_PATH.read_text())
city_manifest = json.loads(CITY_MANIFEST_PATH.read_text())
spec = json.loads(SPEC_PATH.read_text())

if topology.get("contract") != "AURELIAN_AUTHORED_TERRAIN_V1":
    raise RuntimeError("Unexpected canonical terrain contract")
if city_manifest.get("contract") != "PRODUCTION_VILLAGE_V1":
    raise RuntimeError("Unexpected city-state contract")
if spec.get("contract") != "AURELIAN_SECTOR_GENERATOR_V4_SPEC":
    raise RuntimeError("Unexpected Sector generator spec contract")

SEED = int(SEED_OVERRIDE if SEED_OVERRIDE is not None else spec["seed"])
RNG = random.Random(SEED)
SECTOR_WIDTH, SECTOR_HEIGHT = [float(v) for v in spec["sector_plane"]]
PADDING = float(spec["technical_padding"])
SECTOR_CENTER = Vector((SECTOR_WIDTH * 0.5, SECTOR_HEIGHT * 0.5))
CORE_ORIGIN = Vector(tuple(spec["canonical_core"]["origin"]))
CORE_SCALE = float(spec["canonical_core"]["uniform_scale"])

CANONICAL_RIVER = [tuple(point) for point in topology["river_centerline"]]
for point in topology.get("outflow_extension", []):
    candidate = tuple(point)
    if not CANONICAL_RIVER or candidate != CANONICAL_RIVER[-1]:
        CANONICAL_RIVER.append(candidate)

SOURCE_OBJECTS = {}
CANONICAL_IMPORTED = []
ACTUAL_LOCI = {}
RIVER_POINTS = []


def lerp(a, b, t):
    return a + (b - a) * t


def smoothstep(edge0, edge1, value):
    if edge1 == edge0:
        return 0.0
    t = max(0.0, min(1.0, (value - edge0) / (edge1 - edge0)))
    return t * t * (3.0 - 2.0 * t)


def sector_to_world(point, height=0.0):
    x, y = point
    return Vector(((x - SECTOR_CENTER.x) * SECTOR_WORLD_SCALE,
                   (y - SECTOR_CENTER.y) * SECTOR_WORLD_SCALE,
                   height))


def canonical_to_sector(point):
    x, y = point
    return Vector((CORE_ORIGIN.x + x * CORE_SCALE,
                   CORE_ORIGIN.y + y * CORE_SCALE))


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
    if len(points) < 2:
        return 1e9
    return min(segment_distance(point, points[i], points[i + 1]) for i in range(len(points) - 1))


def gaussian(point, center, radius):
    if radius <= 1e-6:
        return 0.0
    dx = point[0] - center[0]
    dy = point[1] - center[1]
    d = math.hypot(dx, dy) / radius
    return math.exp(-d * d * 1.7)


def ellipse_weight(point, center, radii):
    rx = max(float(radii[0]), 1.0)
    ry = max(float(radii[1]), 1.0)
    dx = (point[0] - center[0]) / rx
    dy = (point[1] - center[1]) / ry
    return math.exp(-(dx * dx + dy * dy) * 1.6)


def mix_color(a, b, t):
    t = max(0.0, min(1.0, t))
    return tuple(lerp(a[i], b[i], t) for i in range(4))


def make_vertex_material():
    material = bpy.data.materials.new("Aurelian_Sector_V4_VertexColor")
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    if bsdf is None:
        raise RuntimeError("Principled BSDF missing")
    vertex_color = nodes.new("ShaderNodeVertexColor")
    vertex_color.layer_name = "SectorColor"
    links.new(vertex_color.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.96
    return material


def require_material(name):
    material = bpy.data.materials.get(name)
    if material is None:
        raise RuntimeError(f"Canonical material missing: {name}")
    return material


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


def delete_object_tree(root):
    for child in list(root.children):
        delete_object_tree(child)
    if root.name in bpy.data.objects:
        bpy.data.objects.remove(root, do_unlink=True)


def prepare_source_library():
    global CANONICAL_IMPORTED
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(CANONICAL_GLB))
    CANONICAL_IMPORTED = [obj for obj in bpy.data.objects if obj not in before]

    names = {
        "blacksmith": "Greenvale_blacksmith",
        "barracks": "Greenvale_barracks",
        "church": "Greenvale_church",
        "flag": "Greenvale_flag",
        "tree_a": "ForestTree_00",
        "tree_b": "ForestTree_01",
        "hill_a": "NorthRidge_hill_a",
        "hill_b": "NorthRidge_hill_b",
        "rock_a": "NorthRidge_rock_a",
        "rock_c": "NorthRidge_rock_c",
    }
    for key, name in names.items():
        obj = bpy.data.objects.get(name)
        if obj is None:
            raise RuntimeError(f"Canonical source object missing: {name}")
        SOURCE_OBJECTS[key] = obj


def build_actual_loci():
    jitter_fraction = float(spec["variation"]["placement_jitter_fraction"])
    for slot in spec["macro_locus_slots"]:
        center = Vector(tuple(slot["center"]))
        radius = float(slot.get("radius", 0.0))
        if slot.get("fixed", False) or radius <= 0.0:
            point = center
        else:
            angle = RNG.uniform(0.0, math.tau)
            distance = radius * jitter_fraction * math.sqrt(RNG.random())
            point = center + Vector((math.cos(angle), math.sin(angle))) * distance
        ACTUAL_LOCI[slot["id"]] = {
            "point": (float(point.x), float(point.y)),
            "role": slot["role"],
            "terrain": slot["terrain"],
            "settlement_archetype": slot.get("settlement_archetype"),
        }


def build_river_points():
    global RIVER_POINTS
    upstream = [tuple(point) for point in spec["river_extensions"]["upstream"]]
    core = [tuple(canonical_to_sector(point)) for point in CANONICAL_RIVER]
    downstream = [tuple(point) for point in spec["river_extensions"]["downstream"]]
    RIVER_POINTS = upstream + core + downstream


def terrain_height(point):
    x, y = point
    phase = (SEED % 997) * 0.013
    height = 0.20
    height += 0.12 * math.sin(x * 0.0041 + phase) * math.cos(y * 0.0035 - phase * 0.7)
    height += 0.07 * math.sin((x + y) * 0.0064 + phase * 1.3)

    for chain in spec["relief_chains"]:
        distance = distance_to_polyline(point, chain["points"])
        width = float(chain["width"])
        amplitude = float(chain["amplitude"])
        height += amplitude * math.exp(-((distance / width) ** 2) * 2.1)

    for locus in ACTUAL_LOCI.values():
        center = locus["point"]
        terrain = locus["terrain"]
        if terrain == "basin":
            height -= 0.54 * gaussian(point, center, 280.0)
        elif terrain == "ridge":
            height += 0.72 * gaussian(point, center, 260.0)
        elif terrain == "upland":
            height += 0.48 * gaussian(point, center, 260.0)
        elif terrain == "marsh":
            height -= 0.34 * gaussian(point, center, 270.0)
        elif terrain == "coast":
            height -= 0.28 * gaussian(point, center, 300.0)

    river_distance = distance_to_polyline(point, RIVER_POINTS)
    if river_distance < 190.0:
        t = 1.0 - river_distance / 190.0
        height -= 0.62 * t * t

    # A partial south-east coast. The terrain continues outside camera on all
    # technical edges, so this is geography, never the boundary of the mesh.
    coastline = 2240.0 + (x - 2550.0) * 0.16 + math.sin(x * 0.004) * 90.0
    coast_depth = y - coastline
    if coast_depth > 0.0:
        height -= 2.25 * smoothstep(0.0, 500.0, coast_depth)
    return height


def terrain_color(point, height):
    meadow = (0.20, 0.27, 0.12, 1.0)
    forest = (0.10, 0.17, 0.08, 1.0)
    fields = (0.36, 0.28, 0.12, 1.0)
    marsh = (0.13, 0.20, 0.15, 1.0)
    ridge = (0.24, 0.23, 0.20, 1.0)
    bank = (0.28, 0.21, 0.14, 1.0)
    color = meadow

    for mass in spec["vegetation_masses"]:
        weight = ellipse_weight(point, mass["center"], mass["radius"])
        color = mix_color(color, forest, min(0.72, weight * 0.72))

    for mass in spec["land_use_masses"]:
        weight = ellipse_weight(point, mass["center"], mass["radius"])
        target = fields if mass["kind"] == "fields" else marsh
        color = mix_color(color, target, min(0.58, weight * 0.58))

    if height > 1.5:
        color = mix_color(color, ridge, min(0.65, (height - 1.5) * 0.20))

    river_distance = distance_to_polyline(point, RIVER_POINTS)
    if river_distance < 150.0:
        color = mix_color(color, bank, min(0.42, (1.0 - river_distance / 150.0) * 0.42))
    return color


def create_terrain():
    min_x = -int(PADDING)
    min_y = -int(PADDING)
    max_x = int(SECTOR_WIDTH + PADDING)
    max_y = int(SECTOR_HEIGHT + PADDING)

    xs = list(range(min_x, max_x + TERRAIN_STEP, TERRAIN_STEP))
    ys = list(range(min_y, max_y + TERRAIN_STEP, TERRAIN_STEP))
    grid = {}
    verts = []
    colors = []

    for y in ys:
        for x in xs:
            index = len(verts)
            grid[(x, y)] = index
            h = terrain_height((x, y))
            world = sector_to_world((x, y), h)
            verts.append((world.x, world.y, world.z))
            colors.append(terrain_color((x, y), h))

    faces = []
    for yi in range(len(ys) - 1):
        for xi in range(len(xs) - 1):
            x = xs[xi]
            y = ys[yi]
            keys = [(x, y), (xs[xi + 1], y), (xs[xi + 1], ys[yi + 1]), (x, ys[yi + 1])]
            faces.append(tuple(grid[key] for key in keys))

    mesh = bpy.data.meshes.new("AurelianSectorGeneratorV4TerrainMesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    color_attr = mesh.color_attributes.new(name="SectorColor", type="FLOAT_COLOR", domain="POINT")
    for index, color in enumerate(colors):
        color_attr.data[index].color = color

    terrain = bpy.data.objects.new("AurelianSectorGeneratorV4Terrain", mesh)
    bpy.context.collection.objects.link(terrain)
    terrain.data.materials.append(make_vertex_material())
    for polygon in terrain.data.polygons:
        polygon.use_smooth = True
    terrain["technical_padding"] = PADDING
    terrain["terrain_face_cells"] = len(faces)
    return terrain


def resample(points, steps=8):
    result = []
    for index in range(len(points) - 1):
        a = Vector(points[index])
        b = Vector(points[index + 1])
        for step in range(steps):
            result.append(a.lerp(b, step / float(steps)))
    result.append(Vector(points[-1]))
    return result


def create_strip(name, points, width, material, z_offset=0.05):
    sampled = resample(points, 8)
    verts = []
    faces = []
    for index, point in enumerate(sampled):
        previous = sampled[max(0, index - 1)]
        following = sampled[min(len(sampled) - 1, index + 1)]
        tangent = (following - previous).normalized()
        normal = Vector((-tangent.y, tangent.x))
        for side in (1.0, -1.0):
            edge = point + normal * (width * 0.5 * side)
            h = terrain_height((edge.x, edge.y)) + z_offset
            world = sector_to_world((edge.x, edge.y), h)
            verts.append((world.x, world.y, world.z))
    for index in range(len(sampled) - 1):
        base = index * 2
        faces.append((base, base + 1, base + 3, base + 2))
    mesh = bpy.data.meshes.new(name + "Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(material)
    return obj


def create_water_and_river(materials):
    width_world = (SECTOR_WIDTH + PADDING * 2.8) * SECTOR_WORLD_SCALE
    height_world = (SECTOR_HEIGHT + PADDING * 2.8) * SECTOR_WORLD_SCALE
    bpy.ops.mesh.primitive_plane_add(size=1.0, location=(0.0, 0.0, SEA_LEVEL))
    ocean = bpy.context.object
    ocean.name = "AurelianSectorV4OuterWater"
    ocean.scale = (width_world, height_world, 1.0)
    ocean.data.materials.append(materials["water"])

    root = bpy.data.objects.new("AurelianSectorV4River", None)
    bpy.context.collection.objects.link(root)
    sampled = resample(RIVER_POINTS, 4)
    for index in range(len(sampled) - 1):
        t = float(index) / float(max(1, len(sampled) - 2))
        width = lerp(58.0, 118.0, t)
        segment = create_strip(f"SectorRiver_{index:03d}", [sampled[index], sampled[index + 1]], width, materials["water"], 0.06)
        segment.parent = root


def clone_source(key, name, sector_point, scale_factor, rotation_deg=0.0):
    source = SOURCE_OBJECTS[key]
    clone = copy_hierarchy(source, name)
    point = Vector(sector_point)
    world = sector_to_world((point.x, point.y), terrain_height((point.x, point.y)) + 0.04)
    clone.location = (world.x, world.y, world.z)
    clone.scale = source.scale * scale_factor
    clone.rotation_euler.z += math.radians(rotation_deg)
    return clone


def create_irregular_patch(name, center, radii, material, seed_offset, vertices=18):
    rng = random.Random(SEED + seed_offset)
    points = []
    for index in range(vertices):
        angle = math.tau * index / float(vertices)
        jitter = rng.uniform(0.84, 1.12)
        x = center[0] + math.cos(angle) * radii[0] * jitter
        y = center[1] + math.sin(angle) * radii[1] * jitter
        points.append((x, y))
    verts = []
    center_h = terrain_height(center) + 0.035
    center_world = sector_to_world(center, center_h)
    verts.append((center_world.x, center_world.y, center_world.z))
    for point in points:
        h = terrain_height(point) + 0.035
        world = sector_to_world(point, h)
        verts.append((world.x, world.y, world.z))
    faces = []
    for index in range(vertices):
        faces.append((0, index + 1, ((index + 1) % vertices) + 1))
    mesh = bpy.data.meshes.new(name + "Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(material)
    return obj


def create_land_use_patches(materials):
    for index, mass in enumerate(spec["land_use_masses"]):
        material = materials["fields"] if mass["kind"] == "fields" else materials["marsh"]
        create_irregular_patch(
            "SectorPatch_%s" % mass["id"],
            tuple(mass["center"]),
            tuple(mass["radius"]),
            material,
            100 + index,
        )


def create_vegetation():
    for mass_index, mass in enumerate(spec["vegetation_masses"]):
        root = bpy.data.objects.new("SectorForest_%s" % mass["id"], None)
        bpy.context.collection.objects.link(root)
        rng = random.Random(SEED + 500 + mass_index)
        rx, ry = mass["radius"]
        for index in range(int(mass["density"])):
            angle = rng.uniform(0.0, math.tau)
            distance = math.sqrt(rng.random())
            point = (
                mass["center"][0] + math.cos(angle) * rx * distance,
                mass["center"][1] + math.sin(angle) * ry * distance,
            )
            source_key = "tree_a" if index % 2 == 0 else "tree_b"
            scale = rng.uniform(*spec["variation"]["tree_scale"])
            tree = clone_source(source_key, "SectorTree_%s_%03d" % (mass["id"], index), point, scale, rng.uniform(-180.0, 180.0))
            tree.parent = root


def create_relief_props():
    for chain_index, chain in enumerate(spec["relief_chains"]):
        root = bpy.data.objects.new("SectorRelief_%s" % chain["id"], None)
        bpy.context.collection.objects.link(root)
        rng = random.Random(SEED + 800 + chain_index)
        points = resample(chain["points"], 4)
        for index, point in enumerate(points[1:-1:2]):
            offset = Vector((rng.uniform(-80.0, 80.0), rng.uniform(-55.0, 55.0)))
            target = point + offset
            key = "hill_a" if index % 2 == 0 else "hill_b"
            hill = clone_source(key, "SectorHill_%s_%02d" % (chain["id"], index), target, rng.uniform(0.42, 0.64), rng.uniform(-35.0, 35.0))
            hill.parent = root


def create_field_rows(materials):
    mass = next(item for item in spec["land_use_masses"] if item["kind"] == "fields")
    rng = random.Random(SEED + 1200)
    root = bpy.data.objects.new("SectorFieldRows", None)
    bpy.context.collection.objects.link(root)
    for index in range(8):
        y = mass["center"][1] - 145 + index * 40 + rng.uniform(-8.0, 8.0)
        x0 = mass["center"][0] - 250 + rng.uniform(-20.0, 20.0)
        x1 = mass["center"][0] + 245 + rng.uniform(-20.0, 20.0)
        row = create_strip("SectorFieldRow_%02d" % index, [(x0, y), (x1, y + rng.uniform(-25.0, 25.0))], 10.0, materials["crop"], 0.055)
        row.parent = root


def create_settlement(archetype_name, locus_id, center, settlement_index):
    if archetype_name is None:
        return None
    archetype = spec["settlement_archetypes"][archetype_name]
    rng = random.Random(SEED + 2000 + settlement_index * 97)
    root = bpy.data.objects.new("SectorSettlement_%s" % locus_id, None)
    bpy.context.collection.objects.link(root)

    if archetype_name == "ruin_poi":
        for index in range(4):
            angle = math.tau * index / 4.0 + rng.uniform(-0.2, 0.2)
            distance = rng.uniform(24.0, 52.0)
            point = (center[0] + math.cos(angle) * distance, center[1] + math.sin(angle) * distance)
            rock = clone_source("rock_a" if index % 2 == 0 else "rock_c", "SectorRuin_%02d" % index, point, rng.uniform(0.20, 0.30), rng.uniform(-180.0, 180.0))
            rock.parent = root
        return root

    sources = list(archetype["sources"])
    piece_count = int(archetype["piece_count"])
    spacing_min, spacing_max = spec["variation"]["building_spacing"]
    scale_min, scale_max = archetype["span"]
    rotation_limit = float(spec["variation"]["rotation_degrees"])

    for index in range(piece_count):
        angle = (math.tau * index / max(1, piece_count)) + rng.uniform(-0.38, 0.38)
        distance = rng.uniform(spacing_min, spacing_max) * (0.70 if archetype_name == "capital_home" else 1.0)
        point = (center[0] + math.cos(angle) * distance, center[1] + math.sin(angle) * distance)
        key = sources[index % len(sources)]
        scale = rng.uniform(scale_min, scale_max)
        building = clone_source(key, "SectorBuilding_%s_%02d" % (locus_id, index), point, scale, rng.uniform(-rotation_limit, rotation_limit))
        building.parent = root

    if archetype.get("with_flag", False):
        flag = clone_source("flag", "SectorFlag_%s" % locus_id, center, 0.34, 0.0)
        flag.parent = root
    return root


def create_settlements():
    settlement_index = 0
    for slot in spec["macro_locus_slots"]:
        archetype_name = slot.get("settlement_archetype")
        if archetype_name is None:
            continue
        locus = ACTUAL_LOCI[slot["id"]]
        create_settlement(archetype_name, slot["id"], locus["point"], settlement_index)
        settlement_index += 1


def create_macro_roads(materials):
    home = ACTUAL_LOCI["aurelian_home"]["point"]
    connections = [
        "westwood", "northwatch", "eastbank", "golden_plain", "southfen"
    ]
    root = bpy.data.objects.new("SectorMacroRoads", None)
    bpy.context.collection.objects.link(root)
    for index, locus_id in enumerate(connections):
        target = ACTUAL_LOCI[locus_id]["point"]
        midpoint = ((home[0] + target[0]) * 0.5, (home[1] + target[1]) * 0.5)
        rng = random.Random(SEED + 3000 + index)
        bend = (midpoint[0] + rng.uniform(-80.0, 80.0), midpoint[1] + rng.uniform(-80.0, 80.0))
        road = create_strip("SectorRoad_%s" % locus_id, [home, bend, target], 11.0, materials["road"], 0.07)
        road.parent = root


def remove_canonical_sources():
    top_level = [obj for obj in CANONICAL_IMPORTED if obj.name in bpy.data.objects and (obj.parent is None or obj.parent not in CANONICAL_IMPORTED)]
    for obj in top_level:
        if obj.name in bpy.data.objects:
            delete_object_tree(obj)


def write_manifest(glb_path, blend_path, terrain):
    settlements = []
    for slot in spec["macro_locus_slots"]:
        archetype = slot.get("settlement_archetype")
        if archetype is not None:
            settlements.append({
                "locus_id": slot["id"],
                "archetype": archetype,
                "point": list(ACTUAL_LOCI[slot["id"]]["point"]),
            })

    payload = {
        "contract": "AURELIAN_SECTOR_GENERATOR_V4",
        "sector_id": spec["sector_id"],
        "seed": SEED,
        "spec_sha256": hashlib.sha256(SPEC_PATH.read_bytes()).hexdigest(),
        "canonical_glb_sha256": hashlib.sha256(CANONICAL_GLB.read_bytes()).hexdigest(),
        "topology_manifest_sha256": hashlib.sha256(TOPOLOGY_MANIFEST_PATH.read_bytes()).hexdigest(),
        "city_manifest_sha256": hashlib.sha256(CITY_MANIFEST_PATH.read_bytes()).hexdigest(),
        "kaykit_source_commit": topology["kaykit_source_commit"],
        "topography_profile": spec["topography_profile"],
        "canonical_core_origin": spec["canonical_core"]["origin"],
        "canonical_core_scale": CORE_SCALE,
        "canonical_landmarks": topology["landmarks"],
        "canonical_routes": topology["routes"],
        "canonical_river": topology["river_centerline"],
        "macro_loci": ACTUAL_LOCI,
        "macro_loci_count": len(ACTUAL_LOCI),
        "settlements": settlements,
        "settlement_count": len(settlements),
        "relief_chain_count": len(spec["relief_chains"]),
        "vegetation_mass_count": len(spec["vegetation_masses"]),
        "terrain_face_cells": int(terrain.get("terrain_face_cells", 0)),
        "technical_padding": PADDING,
        "new_asset_family": False,
        "gameplay_state_changed": False,
        "atlas_implemented": False,
        "generator_model": "fixed canonical core + deterministic macro terrain + seeded regional LOD archetypes",
    }
    payload["blend_sha256"] = hashlib.sha256(blend_path.read_bytes()).hexdigest()
    payload["glb_sha256"] = hashlib.sha256(glb_path.read_bytes()).hexdigest()
    payload["glb_bytes"] = glb_path.stat().st_size
    (OUTPUT_DIR / "aurelian_sector_generator_v4_manifest.json").write_text(json.dumps(payload, indent=2) + "\n")


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    prepare_source_library()
    build_actual_loci()
    build_river_points()

    materials = {
        "water": require_material("Aurelian_Water"),
        "road": require_material("Aurelian_Road"),
        "fields": require_material("Aurelian_Fields"),
        "marsh": require_material("Aurelian_Marsh"),
        "crop": require_material("Aurelian_Crops"),
    }

    terrain = create_terrain()
    create_water_and_river(materials)
    create_land_use_patches(materials)
    create_vegetation()
    create_relief_props()
    create_field_rows(materials)
    create_settlements()
    create_macro_roads(materials)
    remove_canonical_sources()

    scene = bpy.context.scene
    scene["pixel_nations_contract"] = "AURELIAN_SECTOR_GENERATOR_V4"
    scene["sector_seed"] = SEED
    scene["canonical_core_preserved"] = True
    scene["new_asset_family"] = False

    blend_path = OUTPUT_DIR / "aurelian_sector_generator_v4.blend"
    glb_path = OUTPUT_DIR / "aurelian_sector_generator_v4.glb"
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    bpy.ops.export_scene.gltf(
        filepath=str(glb_path),
        export_format="GLB",
        export_apply=True,
        export_cameras=False,
        export_lights=False,
    )
    if not glb_path.is_file() or glb_path.stat().st_size < 250000:
        raise RuntimeError(f"Sector v4 GLB export failed or unexpectedly small: {glb_path}")
    write_manifest(glb_path, blend_path, terrain)
    print(f"AURELIAN_SECTOR_GENERATOR_V4_SEED={SEED}")
    print(f"AURELIAN_SECTOR_GENERATOR_V4_BLEND={blend_path}")
    print(f"AURELIAN_SECTOR_GENERATOR_V4_GLB={glb_path}")
    print("AURELIAN_SECTOR_GENERATOR_V4=PASS")


main()
