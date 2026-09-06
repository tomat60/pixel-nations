import bpy
import hashlib
import json
import math
import random
import sys
from pathlib import Path
from mathutils import Vector

WORLD_SCALE = 0.006
SEA_LEVEL = -0.22
TERRAIN_STEP = 120

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if len(argv) != 4:
    raise SystemExit(
        "Usage: blender -b --python world_atlas_v1.py -- "
        "<canonical_glb> <sector_spec> <atlas_spec> <output_dir>"
    )

CANONICAL_GLB = Path(argv[0]).resolve()
SECTOR_SPEC_PATH = Path(argv[1]).resolve()
ATLAS_SPEC_PATH = Path(argv[2]).resolve()
OUTPUT_DIR = Path(argv[3]).resolve()
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

for required in (CANONICAL_GLB, SECTOR_SPEC_PATH, ATLAS_SPEC_PATH):
    if not required.is_file():
        raise FileNotFoundError(required)

sector_spec = json.loads(SECTOR_SPEC_PATH.read_text())
atlas_spec = json.loads(ATLAS_SPEC_PATH.read_text())
if sector_spec.get("contract") != "AURELIAN_SECTOR_GENERATOR_V4_SPEC":
    raise RuntimeError("Unexpected Sector source spec contract")
if atlas_spec.get("contract") != "PIXEL_NATIONS_WORLD_ATLAS_V1_SPEC":
    raise RuntimeError("Unexpected Atlas spec contract")

SEED = int(atlas_spec["seed"])
RNG = random.Random(SEED)
WORLD_WIDTH, WORLD_HEIGHT = [float(v) for v in atlas_spec["world_plane"]]
PADDING = float(atlas_spec["technical_padding"])
WORLD_CENTER = Vector((WORLD_WIDTH * 0.5, WORLD_HEIGHT * 0.5))
SOURCE_OBJECTS = {}
SOURCE_LIBRARY_OBJECTS = []


def lerp(a, b, t):
    return a + (b - a) * t


def smoothstep(edge0, edge1, value):
    if edge1 == edge0:
        return 0.0
    t = max(0.0, min(1.0, (value - edge0) / (edge1 - edge0)))
    return t * t * (3.0 - 2.0 * t)


def atlas_to_world(point, height=0.0):
    x, y = point
    return Vector(((x - WORLD_CENTER.x) * WORLD_SCALE,
                   (y - WORLD_CENTER.y) * WORLD_SCALE,
                   height))


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


def ellipse_weight(point, center, radii):
    rx = max(float(radii[0]), 1.0)
    ry = max(float(radii[1]), 1.0)
    dx = (point[0] - center[0]) / rx
    dy = (point[1] - center[1]) / ry
    return math.exp(-(dx * dx + dy * dy) * 1.55)


def mix_color(a, b, t):
    t = max(0.0, min(1.0, t))
    return tuple(lerp(a[i], b[i], t) for i in range(4))


def make_material(name, color, roughness=0.94):
    material = bpy.data.materials.new(name)
    material.diffuse_color = color
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color
        bsdf.inputs["Roughness"].default_value = roughness
    return material


def make_vertex_material():
    material = bpy.data.materials.new("PixelNations_Atlas_VertexColor")
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    if bsdf is None:
        raise RuntimeError("Principled BSDF missing")
    vertex_color = nodes.new("ShaderNodeVertexColor")
    vertex_color.layer_name = "AtlasColor"
    links.new(vertex_color.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.97
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
        child_clone.location = child.location.copy()
        child_clone.rotation_euler = child.rotation_euler.copy()
        child_clone.scale = child.scale.copy()
    return clone


def prepare_source_library():
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(CANONICAL_GLB))
    imported = [obj for obj in bpy.data.objects if obj not in before]
    SOURCE_LIBRARY_OBJECTS.extend(imported)
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
    for obj in imported:
        obj.hide_render = True


def purge_source_library():
    for obj in list(SOURCE_LIBRARY_OBJECTS):
        if obj.name in bpy.data.objects:
            bpy.data.objects.remove(obj, do_unlink=True)
    SOURCE_LIBRARY_OBJECTS.clear()
    SOURCE_OBJECTS.clear()


def coast_depth(point):
    x, y = point
    coast = atlas_spec["coast"]
    south_line = float(coast["south_base_y"]) + math.sin(x * 0.0014) * 260.0 + math.sin(x * 0.0031 + 1.1) * 105.0
    east_line = float(coast["east_base_x"]) + math.sin(y * 0.0012 + 0.6) * 240.0
    south = y - south_line
    east = x - east_line
    return max(south, east)


def terrain_height(point):
    x, y = point
    phase = (SEED % 1231) * 0.009
    height = 0.34
    height += 0.18 * math.sin(x * 0.00125 + phase) * math.cos(y * 0.00105 - phase * 0.55)
    height += 0.10 * math.sin((x + y) * 0.0018 + phase * 1.2)

    for chain in atlas_spec["relief_chains"]:
        distance = distance_to_polyline(point, chain["points"])
        width = float(chain["width"])
        amplitude = float(chain["amplitude"])
        height += amplitude * math.exp(-((distance / width) ** 2) * 1.85)

    for region in atlas_spec["macro_regions"]:
        weight = ellipse_weight(point, region["center"], region["radius"])
        role = region["role"]
        if role == "basin":
            height -= 0.78 * weight
        elif role == "highland":
            height += 0.72 * weight
        elif role == "upland":
            height += 0.42 * weight
        elif role == "marsh":
            height -= 0.30 * weight
        elif role == "riverland":
            height -= 0.16 * weight

    for water in atlas_spec["water_systems"]:
        distance = distance_to_polyline(point, water["points"])
        valley = float(water["width"]) * 2.35
        if distance < valley:
            t = 1.0 - distance / valley
            height -= 0.70 * t * t

    depth = coast_depth(point)
    if depth > 0.0:
        transition = float(atlas_spec["coast"]["transition"])
        height -= 3.0 * smoothstep(0.0, transition, depth)
    return height


def terrain_color(point, height):
    meadow = (0.215, 0.285, 0.145, 1.0)
    forest = (0.095, 0.175, 0.095, 1.0)
    plains = (0.34, 0.285, 0.14, 1.0)
    marsh = (0.12, 0.205, 0.17, 1.0)
    ridge = (0.285, 0.275, 0.245, 1.0)
    riverland = (0.19, 0.27, 0.18, 1.0)
    color = meadow

    for region in atlas_spec["macro_regions"]:
        weight = ellipse_weight(point, region["center"], region["radius"])
        role = region["role"]
        if role == "forest":
            color = mix_color(color, forest, min(0.52, weight * 0.52))
        elif role == "plains":
            color = mix_color(color, plains, min(0.38, weight * 0.38))
        elif role == "marsh":
            color = mix_color(color, marsh, min(0.42, weight * 0.42))
        elif role == "riverland":
            color = mix_color(color, riverland, min(0.28, weight * 0.28))

    if height > 2.1:
        color = mix_color(color, ridge, min(0.64, (height - 2.1) * 0.16))
    return color


def create_terrain():
    min_x = -int(PADDING)
    min_y = -int(PADDING)
    max_x = int(WORLD_WIDTH + PADDING)
    max_y = int(WORLD_HEIGHT + PADDING)
    xs = list(range(min_x, max_x + TERRAIN_STEP, TERRAIN_STEP))
    ys = list(range(min_y, max_y + TERRAIN_STEP, TERRAIN_STEP))
    grid = {}
    verts = []
    colors = []

    for y in ys:
        for x in xs:
            idx = len(verts)
            grid[(x, y)] = idx
            h = terrain_height((x, y))
            w = atlas_to_world((x, y), h)
            verts.append((w.x, w.y, w.z))
            colors.append(terrain_color((x, y), h))

    faces = []
    for yi in range(len(ys) - 1):
        for xi in range(len(xs) - 1):
            x0, x1 = xs[xi], xs[xi + 1]
            y0, y1 = ys[yi], ys[yi + 1]
            faces.append((grid[(x0, y0)], grid[(x1, y0)], grid[(x1, y1)], grid[(x0, y1)]))

    mesh = bpy.data.meshes.new("PixelNationsWorldAtlasV1TerrainMesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    attr = mesh.color_attributes.new(name="AtlasColor", type="FLOAT_COLOR", domain="POINT")
    for index, color in enumerate(colors):
        attr.data[index].color = color
    terrain = bpy.data.objects.new("PixelNationsWorldAtlasV1Terrain", mesh)
    bpy.context.collection.objects.link(terrain)
    terrain.data.materials.append(make_vertex_material())
    for polygon in terrain.data.polygons:
        polygon.use_smooth = True
    terrain["terrain_face_cells"] = len(faces)
    terrain["technical_padding"] = PADDING
    return terrain


def create_ocean():
    mesh = bpy.data.meshes.new("PixelNationsAtlasOceanMesh")
    span_x = (WORLD_WIDTH + PADDING * 2.4) * WORLD_SCALE
    span_y = (WORLD_HEIGHT + PADDING * 2.4) * WORLD_SCALE
    verts = [(-span_x/2, -span_y/2, SEA_LEVEL), (span_x/2, -span_y/2, SEA_LEVEL),
             (span_x/2, span_y/2, SEA_LEVEL), (-span_x/2, span_y/2, SEA_LEVEL)]
    mesh.from_pydata(verts, [], [(0,1,2,3)])
    mesh.update()
    ocean = bpy.data.objects.new("PixelNationsAtlasOcean", mesh)
    ocean.data.materials.append(make_material("PixelNations_Atlas_Water", (0.045, 0.145, 0.18, 1.0), 0.40))
    bpy.context.collection.objects.link(ocean)


def resample(points, steps=8):
    result = []
    for i in range(len(points) - 1):
        a = Vector(points[i])
        b = Vector(points[i + 1])
        for step in range(steps):
            result.append(a.lerp(b, step / float(steps)))
    result.append(Vector(points[-1]))
    return result


def create_strip(name, points, width, material, z_offset=0.06):
    sampled = resample(points, 8)
    verts = []
    faces = []
    for i, point in enumerate(sampled):
        previous = sampled[max(0, i - 1)]
        following = sampled[min(len(sampled) - 1, i + 1)]
        tangent = (following - previous).normalized()
        normal = Vector((-tangent.y, tangent.x))
        for side in (1.0, -1.0):
            edge = point + normal * (width * 0.5 * side)
            w = atlas_to_world((edge.x, edge.y), terrain_height((edge.x, edge.y)) + z_offset)
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


def create_water_systems():
    water = make_material("PixelNations_Atlas_River", (0.055, 0.19, 0.225, 1.0), 0.38)
    for system in atlas_spec["water_systems"]:
        create_strip("AtlasRiver_" + system["id"], system["points"], float(system["width"]), water)


def clone_source(key, name, point, scale_factor, rotation_deg=0.0):
    source = SOURCE_OBJECTS[key]
    clone = copy_hierarchy(source, name)
    clone.location = atlas_to_world(point, terrain_height(point) + 0.05)
    clone.scale = source.scale * scale_factor
    clone.rotation_euler.z += math.radians(rotation_deg)
    clone.hide_render = False
    for child in clone.children_recursive:
        child.hide_render = False
    return clone


def create_forest_texture():
    for mass in atlas_spec["vegetation_masses"]:
        count = int(mass["density"])
        cx, cy = mass["center"]
        rx, ry = mass["radius"]
        for i in range(count):
            angle = RNG.random() * math.tau
            radius = math.sqrt(RNG.random())
            point = (cx + math.cos(angle) * rx * radius, cy + math.sin(angle) * ry * radius)
            key = "tree_a" if i % 2 == 0 else "tree_b"
            clone_source(key, f"AtlasTree_{mass['id']}_{i:03d}", point, RNG.uniform(0.16, 0.24), RNG.uniform(-180, 180))


def create_relief_landmarks():
    for chain_index, chain in enumerate(atlas_spec["relief_chains"]):
        points = resample(chain["points"], 4)
        for i, point in enumerate(points[1:-1:2]):
            key = "hill_a" if (i + chain_index) % 2 == 0 else "hill_b"
            jitter = Vector((RNG.uniform(-180, 180), RNG.uniform(-120, 120)))
            p = point + jitter
            clone_source(key, f"AtlasHill_{chain_index}_{i:02d}", (p.x, p.y), RNG.uniform(0.24, 0.34), RNG.uniform(-35, 35))


def create_origin_a01():
    center = Vector(tuple(atlas_spec["origin_sector"]["center"]))
    pieces = [
        ("church", Vector((0, -85)), 0.12, 0),
        ("barracks", Vector((-95, 55)), 0.095, -16),
        ("blacksmith", Vector((85, 60)), 0.09, 18),
        ("flag", Vector((0, 35)), 0.085, 0),
    ]
    root = bpy.data.objects.new("AtlasOrigin_A01", None)
    bpy.context.collection.objects.link(root)
    for key, offset, scale_factor, rotation in pieces:
        child = clone_source(key, f"AtlasA01_{key}", tuple(center + offset), scale_factor, rotation)
        child.parent = root
    root["sector_id"] = "A-01"
    root["nested_origin"] = True


def create_sparse_loci():
    for index, locus in enumerate(atlas_spec["strategic_loci"]):
        if locus["id"] == "origin_a01":
            continue
        center = Vector(tuple(locus["center"]))
        for j in range(2):
            offset = Vector(((j * 2 - 1) * 55.0, (j - 0.5) * 45.0))
            key = "rock_a" if (index + j) % 2 == 0 else "rock_c"
            clone_source(key, f"AtlasLocus_{index}_{j}", tuple(center + offset), 0.13, float(index * 17 + j * 29))


def write_manifest(glb_path, blend_path, terrain):
    manifest = {
        "contract": "PIXEL_NATIONS_WORLD_ATLAS_V1",
        "seed": SEED,
        "source_sector_spec_contract": sector_spec["contract"],
        "atlas_spec_sha256": hashlib.sha256(ATLAS_SPEC_PATH.read_bytes()).hexdigest(),
        "sector_spec_sha256": hashlib.sha256(SECTOR_SPEC_PATH.read_bytes()).hexdigest(),
        "canonical_glb_sha256": hashlib.sha256(CANONICAL_GLB.read_bytes()).hexdigest(),
        "macro_region_count": len(atlas_spec["macro_regions"]),
        "relief_chain_count": len(atlas_spec["relief_chains"]),
        "vegetation_mass_count": len(atlas_spec["vegetation_masses"]),
        "water_system_count": len(atlas_spec["water_systems"]),
        "strategic_loci_count": len(atlas_spec["strategic_loci"]),
        "origin_sector": atlas_spec["origin_sector"]["sector_id"],
        "origin_center": atlas_spec["origin_sector"]["center"],
        "terrain_face_cells": int(terrain.get("terrain_face_cells", 0)),
        "technical_padding": PADDING,
        "literal_sector_grid": False,
        "literal_land_grid": False,
        "full_sector_glbs_generated": 0,
        "gameplay_state_changed": False,
        "new_asset_family": False,
        "generator_model": "stable macro geography + seeded sparse detail",
    }
    manifest["blend_sha256"] = hashlib.sha256(blend_path.read_bytes()).hexdigest()
    manifest["glb_sha256"] = hashlib.sha256(glb_path.read_bytes()).hexdigest()
    manifest["glb_bytes"] = glb_path.stat().st_size
    (OUTPUT_DIR / "world_atlas_v1_manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    prepare_source_library()
    terrain = create_terrain()
    create_ocean()
    create_water_systems()
    create_forest_texture()
    create_relief_landmarks()
    create_origin_a01()
    create_sparse_loci()
    purge_source_library()

    scene = bpy.context.scene
    scene["pixel_nations_contract"] = "PIXEL_NATIONS_WORLD_ATLAS_V1"
    scene["atlas_seed"] = SEED
    scene["origin_sector"] = "A-01"
    scene["literal_sector_grid"] = False

    blend_path = OUTPUT_DIR / "world_atlas_v1.blend"
    glb_path = OUTPUT_DIR / "world_atlas_v1.glb"
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    bpy.ops.export_scene.gltf(filepath=str(glb_path), export_format="GLB", export_apply=True, export_cameras=False, export_lights=False)
    if not glb_path.is_file() or glb_path.stat().st_size < 250000:
        raise RuntimeError(f"Atlas GLB export failed or unexpectedly small: {glb_path}")
    write_manifest(glb_path, blend_path, terrain)
    print(f"PIXEL_NATIONS_WORLD_ATLAS_V1_SEED={SEED}")
    print(f"PIXEL_NATIONS_WORLD_ATLAS_V1_GLB={glb_path}")
    print("PIXEL_NATIONS_WORLD_ATLAS_V1=PASS")


main()
