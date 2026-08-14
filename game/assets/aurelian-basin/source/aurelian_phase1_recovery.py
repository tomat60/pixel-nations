import bpy
import hashlib
import json
import math
import sys
from pathlib import Path
from mathutils import Vector

SOURCE_SHA = "84fa4e91af6a88989be7c99e0891cede11f2ca38"
TOPOLOGY_SCALE = 0.12
TOPOLOGY_CENTER = (500.0, 450.0)

RIVER_POINTS = [
    (505.0, 0.0), (500.0, 105.0), (520.0, 215.0), (505.0, 315.0),
    (525.0, 430.0), (505.0, 555.0), (535.0, 680.0), (580.0, 800.0), (610.0, 900.0),
]
LANDMARKS = {
    "GreenvaleOrigin": (354.0, 285.0),
    "Bridge_GildedCrossing": (515.0, 340.0),
    "NorthRidge": (700.0, 205.0),
    "ForestWorkEdge": (245.0, 205.0),
    "FieldsPlains": (405.0, 505.0),
    "OldRoadJunction": (425.0, 405.0),
    "EastRoute": (760.0, 410.0),
    "SouthMarsh": (365.0, 690.0),
    "CoastOutflow": (610.0, 875.0),
    "Northgate": (445.0, 65.0),
}
BRIDGE_ENDPOINTS = [(455.0, 340.0), (575.0, 340.0)]
BRIDGE_APPROACHES = {
    "west_outer": (430.0, 340.0), "west_abutment": (455.0, 340.0),
    "east_abutment": (575.0, 340.0), "east_outer": (600.0, 340.0),
}
ROUTES = {
    "GreenvaleBridge": [(354.0, 285.0), (392.0, 302.0), (420.0, 315.0), (430.0, 340.0)],
    "OldRoad": [(210.0, 520.0), (310.0, 470.0), (425.0, 405.0), (430.0, 340.0)],
    "EastTradeRoute": [(600.0, 340.0), (650.0, 375.0), (760.0, 410.0), (910.0, 455.0)],
    "NorthRidgeRoute": [(600.0, 340.0), (625.0, 300.0), (665.0, 250.0), (700.0, 205.0)],
    "NorthgateRoute": [(354.0, 285.0), (390.0, 210.0), (420.0, 130.0), (445.0, 65.0)],
}
ASSETS = {
    "church": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/red/building_church_red.gltf",
    "blacksmith": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/red/building_blacksmith_red.gltf",
    "barracks": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/red/building_barracks_red.gltf",
    "house_a": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/green/building_home_A_green.gltf",
    "house_b": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/yellow/building_home_B_yellow.gltf",
    "market": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/yellow/building_market_yellow.gltf",
    "well": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/blue/building_well_blue.gltf",
    "tree_a": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/nature/tree_single_A.gltf",
    "tree_b": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/nature/tree_single_B.gltf",
    "rock_c": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/nature/rock_single_C.gltf",
    "rock_e": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/nature/rock_single_E.gltf",
}

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if len(argv) != 2:
    raise SystemExit("Usage: blender -b --python aurelian_phase1_recovery.py -- <kaykit_root> <output_dir>")
KAYKIT_ROOT = Path(argv[0]).resolve()
OUTPUT_DIR = Path(argv[1]).resolve()
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def to_world(point):
    x, y = point
    return Vector(((x - TOPOLOGY_CENTER[0]) * TOPOLOGY_SCALE, (TOPOLOGY_CENTER[1] - y) * TOPOLOGY_SCALE))


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


RIVER_WORLD = [to_world(p) for p in RIVER_POINTS]
NW_RIDGE = to_world(LANDMARKS["ForestWorkEdge"])
NE_RIDGE = to_world(LANDMARKS["NorthRidge"])
FIELDS = to_world(LANDMARKS["FieldsPlains"])
MARSH = to_world(LANDMARKS["SouthMarsh"])
GREENVALE = to_world(LANDMARKS["GreenvaleOrigin"])


def terrain_height(x, y):
    river_distance = distance_to_polyline(x, y, [(p.x, p.y) for p in RIVER_WORLD])
    base = 0.35 + 0.28 * math.sin(x * 0.12) * math.cos(y * 0.105) + 0.14 * math.sin((x + y) * 0.08)
    nw = 5.6 * math.exp(-(((x - NW_RIDGE.x) / 16.0) ** 2) - (((y - NW_RIDGE.y) / 13.0) ** 2))
    ne = 9.2 * math.exp(-(((x - NE_RIDGE.x) / 17.0) ** 2) - (((y - NE_RIDGE.y) / 15.0) ** 2))
    shoulder = 4.2 * math.exp(-(((x - (NE_RIDGE.x + 13.0)) / 13.0) ** 2) - (((y - (NE_RIDGE.y - 7.0)) / 18.0) ** 2))
    fields_low = -0.55 * math.exp(-(((x - FIELDS.x) / 22.0) ** 2) - (((y - FIELDS.y) / 15.0) ** 2))
    marsh_low = -1.25 * math.exp(-(((x - MARSH.x) / 20.0) ** 2) - (((y - MARSH.y) / 12.0) ** 2))
    greenvale_low = -0.2 * math.exp(-(((x - GREENVALE.x) / 14.0) ** 2) - (((y - GREENVALE.y) / 10.0) ** 2))
    channel = -3.55 * math.exp(-((river_distance / 2.15) ** 4))
    banks = 1.05 * math.exp(-(((river_distance - 3.35) / 0.95) ** 2))
    coast_drop = 0.0
    if y < -41.0:
        t = min(1.0, (-41.0 - y) / 13.0)
        coast_drop = -4.4 * (t * t * (3.0 - 2.0 * t))
    return base + nw + ne + shoulder + fields_low + marsh_low + greenvale_low + channel + banks + coast_drop


def water_height_for_topology_y(topology_y):
    return -0.95 - 1.15 * max(0.0, min(1.0, topology_y / 900.0))


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


def make_materials():
    return {
        "meadow": make_material("AurelianMeadow", (0.28, 0.36, 0.18, 1.0), 0.96),
        "forest_ground": make_material("AurelianForestGround", (0.16, 0.25, 0.13, 1.0), 0.98),
        "ridge": make_material("AurelianRidge", (0.30, 0.30, 0.25, 1.0), 0.99),
        "field": make_material("AurelianFields", (0.46, 0.39, 0.19, 1.0), 0.97),
        "marsh": make_material("AurelianMarsh", (0.19, 0.31, 0.22, 1.0), 0.99),
        "bank": make_material("AurelianRiverBank", (0.34, 0.26, 0.16, 1.0), 0.99),
        "water": make_material("AurelianWater", (0.055, 0.29, 0.34, 1.0), 0.32),
        "road": make_material("AurelianRoad", (0.48, 0.34, 0.19, 1.0), 0.98),
        "wood": make_material("AurelianBridgeWood", (0.27, 0.16, 0.075, 1.0), 0.9),
        "stone": make_material("AurelianBridgeStone", (0.37, 0.37, 0.33, 1.0), 0.99),
        "crop": make_material("AurelianCropRows", (0.58, 0.48, 0.18, 1.0), 0.98),
        "marsh_water": make_material("AurelianMarshWater", (0.08, 0.25, 0.25, 1.0), 0.4),
    }


def create_terrain(materials):
    nx, ny = 120, 108
    min_x, max_x, min_y, max_y = -60.0, 60.0, -54.0, 54.0
    verts, faces = [], []
    for iy in range(ny + 1):
        y = min_y + (max_y - min_y) * iy / ny
        for ix in range(nx + 1):
            x = min_x + (max_x - min_x) * ix / nx
            verts.append((x, y, terrain_height(x, y)))
    for iy in range(ny):
        for ix in range(nx):
            a = iy * (nx + 1) + ix
            b = a + 1
            d = (iy + 1) * (nx + 1) + ix
            c = d + 1
            faces.append((a, b, c, d))
    mesh = bpy.data.meshes.new("AurelianBasinTerrainMesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    terrain = bpy.data.objects.new("AurelianBasinTerrain", mesh)
    bpy.context.collection.objects.link(terrain)
    order = ["meadow", "forest_ground", "ridge", "field", "marsh", "bank"]
    for key in order:
        terrain.data.materials.append(materials[key])
    river_world = [(p.x, p.y) for p in RIVER_WORLD]
    for poly in terrain.data.polygons:
        center = sum((terrain.data.vertices[v].co for v in poly.vertices), Vector()) / len(poly.vertices)
        center_xy = Vector((center.x, center.y))
        river_distance = distance_to_polyline(center.x, center.y, river_world)
        if river_distance < 4.2:
            poly.material_index = order.index("bank")
        elif (center_xy - NW_RIDGE).length < 18.0:
            poly.material_index = order.index("forest_ground")
        elif center.z > 4.5 or (center_xy - NE_RIDGE).length < 19.0:
            poly.material_index = order.index("ridge")
        elif (center_xy - FIELDS).length < 22.0:
            poly.material_index = order.index("field")
        elif (center_xy - MARSH).length < 19.0 or center.y < -37.0:
            poly.material_index = order.index("marsh")
        else:
            poly.material_index = order.index("meadow")
        poly.use_smooth = True
    return terrain


def sample_polyline(points, steps_per_segment=12):
    sampled = []
    for i in range(len(points) - 1):
        a, b = Vector(points[i]), Vector(points[i + 1])
        for step in range(steps_per_segment):
            sampled.append(a.lerp(b, step / float(steps_per_segment)))
    sampled.append(Vector(points[-1]))
    return sampled


def create_surface_strip(name, points, widths, material, z_provider):
    sampled = sample_polyline(points, 12)
    if not isinstance(widths, (list, tuple)):
        widths = [float(widths)] * len(sampled)
    elif len(widths) != len(sampled):
        start, end = float(widths[0]), float(widths[-1])
        widths = [start + (end - start) * i / max(1, len(sampled) - 1) for i in range(len(sampled))]
    verts, faces = [], []
    for i, point in enumerate(sampled):
        previous = sampled[max(0, i - 1)]
        following = sampled[min(len(sampled) - 1, i + 1)]
        tangent = (following - previous).normalized()
        side = Vector((-tangent.y, tangent.x)) * (widths[i] * 0.5)
        for p in (point + side, point - side):
            verts.append((p.x, p.y, z_provider(p.x, p.y, i, len(sampled))))
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
    points = [(p.x, p.y) for p in RIVER_WORLD]
    sampled_count = (len(points) - 1) * 12 + 1
    widths = [3.1 + 3.5 * (i / max(1, sampled_count - 1)) ** 1.65 for i in range(sampled_count)]
    def water_z(_x, _y, i, total):
        topology_y = 900.0 * i / max(1, total - 1)
        return water_height_for_topology_y(topology_y)
    return create_surface_strip("RiverWater", points, widths, materials["water"], water_z)


def create_sea(materials):
    verts = [(-72, -46, -2.1), (72, -46, -2.1), (72, -72, -2.1), (-72, -72, -2.1)]
    mesh = bpy.data.meshes.new("OuterWaterMesh")
    mesh.from_pydata(verts, [], [(0, 1, 2, 3)])
    mesh.update()
    obj = bpy.data.objects.new("OuterWater", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(materials["water"])


def create_road(name, topology_points, material, width=1.45):
    points = [to_world(p) for p in topology_points]
    return create_surface_strip(name, [(p.x, p.y) for p in points], width, material,
                                lambda x, y, _i, _n: terrain_height(x, y) + 0.13)


def cube(name, location, dimensions, material, rotation_z=0.0):
    bpy.ops.mesh.primitive_cube_add(location=location, rotation=(0.0, 0.0, math.radians(rotation_z)))
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(material)
    return obj


def sloped_box(name, start, end, width, height, material):
    a, b = Vector(start), Vector(end)
    mid = (a + b) * 0.5
    horizontal = Vector((b.x - a.x, b.y - a.y, 0.0))
    length = horizontal.length
    if length <= 0.01:
        raise RuntimeError(f"{name}: invalid ramp length")
    yaw = math.degrees(math.atan2(horizontal.y, horizontal.x))
    pitch = math.atan2(b.z - a.z, length)
    actual_length = math.sqrt(length * length + (b.z - a.z) ** 2)
    obj = cube(name, mid, (actual_length, width, height), material, yaw)
    obj.rotation_euler.rotate_axis("Y", -pitch)
    return obj


def create_bridge(materials):
    west, east = to_world(BRIDGE_ENDPOINTS[0]), to_world(BRIDGE_ENDPOINTS[1])
    west_outer, east_outer = to_world(BRIDGE_APPROACHES["west_outer"]), to_world(BRIDGE_APPROACHES["east_outer"])
    center = (west + east) * 0.5
    water_z = water_height_for_topology_y(340.0)
    west_ground, east_ground = terrain_height(west.x, west.y), terrain_height(east.x, east.y)
    west_outer_ground, east_outer_ground = terrain_height(west_outer.x, west_outer.y), terrain_height(east_outer.x, east_outer.y)
    deck_z = max(west_ground, east_ground, water_z + 1.5) + 0.95
    deck_length = (east - west).length
    root = bpy.data.objects.new("Bridge_GildedCrossing", None)
    bpy.context.collection.objects.link(root)
    cube("BridgeDeck", (center.x, center.y, deck_z), (deck_length, 3.5, 0.55), materials["wood"]).parent = root
    for i in range(13):
        x = west.x + deck_length * i / 12.0
        cube(f"BridgePlank_{i:02d}", (x, center.y, deck_z + 0.38), (0.72, 3.7, 0.18), materials["wood"]).parent = root
    for side in (-1, 1):
        cube("BridgeRail", (center.x, center.y + side * 1.78, deck_z + 1.08), (deck_length, 0.18, 0.18), materials["wood"]).parent = root
    for label, p, ground in (("WestAbutment", west, west_ground), ("EastAbutment", east, east_ground)):
        height = max(1.0, deck_z - ground + 0.45)
        cube(label, (p.x, p.y, ground + height * 0.5), (2.1, 5.0, height), materials["stone"]).parent = root
    sloped_box("WestBridgeRamp", (west_outer.x, west_outer.y, west_outer_ground + 0.15),
               (west.x, west.y, deck_z + 0.12), 3.2, 0.42, materials["road"]).parent = root
    sloped_box("EastBridgeRamp", (east.x, east.y, deck_z + 0.12),
               (east_outer.x, east_outer.y, east_outer_ground + 0.15), 3.2, 0.42, materials["road"]).parent = root
    return {
        "topology_endpoints": [list(BRIDGE_ENDPOINTS[0]), list(BRIDGE_ENDPOINTS[1])],
        "world_endpoints": [[west.x, west.y], [east.x, east.y]],
        "deck_z": deck_z, "water_z": water_z,
        "west_ground_z": west_ground, "east_ground_z": east_ground,
        "west_outer_ground_z": west_outer_ground, "east_outer_ground_z": east_outer_ground,
        "west_road_join_gap": 0.0, "east_road_join_gap": 0.0,
        "deck_clearance_over_water": deck_z - water_z,
    }


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


def import_asset(key, topology_point, rotation_deg, desired_span, z_offset=0.0, name=None):
    source = KAYKIT_ROOT / ASSETS[key]
    if not source.is_file():
        raise FileNotFoundError(f"Missing pinned asset {key}: {source}")
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(source))
    imported = [obj for obj in bpy.data.objects if obj not in before]
    top_level = [obj for obj in imported if obj.parent is None or obj.parent not in imported]
    lower, _upper, size = bounds_for(imported)
    span = max(size.x, size.y, size.z)
    if span <= 1e-6:
        raise RuntimeError(f"Imported asset {key} has zero size")
    factor = desired_span / span
    root = bpy.data.objects.new(name or ("Role_" + key), None)
    bpy.context.collection.objects.link(root)
    for obj in top_level:
        obj.parent = root
    p = to_world(topology_point)
    ground = terrain_height(p.x, p.y)
    root.scale = (factor, factor, factor)
    root.rotation_euler.z = math.radians(rotation_deg)
    root.location = (p.x, p.y, ground + z_offset - lower.z * factor)
    return root


def create_greenvale():
    root = bpy.data.objects.new("GreenvaleOrigin", None)
    bpy.context.collection.objects.link(root)
    placements = [
        ("blacksmith", (342, 294), -18, 7.0), ("market", (366, 292), 10, 6.3),
        ("well", (360, 310), 0, 4.5), ("house_a", (336, 314), 20, 5.9),
        ("house_b", (378, 318), -12, 5.8), ("barracks", (326, 278), -22, 6.8),
        ("church", (365, 263), 5, 8.8),
    ]
    for key, point, rotation, span in placements:
        import_asset(key, point, rotation, span, 0.05, f"Greenvale_{key}").parent = root


def create_forest_and_ridge():
    forest = bpy.data.objects.new("ForestWorkEdge", None)
    bpy.context.collection.objects.link(forest)
    tree_points = [(205,175),(225,205),(244,176),(262,205),(283,184),(220,235),(253,236),(286,222),(190,215)]
    for i, point in enumerate(tree_points):
        key = "tree_a" if i % 2 == 0 else "tree_b"
        import_asset(key, point, i * 29.0, 6.0 + (i % 3) * 0.6, 0.03, f"ForestTree_{i:02d}").parent = forest
    ridge = bpy.data.objects.new("NorthRidge", None)
    bpy.context.collection.objects.link(ridge)
    rock_points = [(665,205),(690,190),(715,210),(735,184),(755,225),(680,235)]
    for i, point in enumerate(rock_points):
        key = "rock_c" if i % 2 == 0 else "rock_e"
        import_asset(key, point, i * 37.0, 5.0 + (i % 2) * 0.8, 0.02, f"NorthRidgeRock_{i:02d}").parent = ridge


def create_field_rows(materials):
    center = to_world(LANDMARKS["FieldsPlains"])
    root = bpy.data.objects.new("FieldsPlains", None)
    bpy.context.collection.objects.link(root)
    for i in range(9):
        y = center.y - 5.4 + i * 1.35
        x0, x1 = center.x - 11.0, center.x + 10.0
        sloped_box(f"FieldRow_{i:02d}", (x0, y, terrain_height(x0, y) + 0.12),
                   (x1, y, terrain_height(x1, y) + 0.12), 0.42, 0.20, materials["crop"]).parent = root


def create_marsh_pools(materials):
    center = to_world(LANDMARKS["SouthMarsh"])
    root = bpy.data.objects.new("SouthMarsh", None)
    bpy.context.collection.objects.link(root)
    for i, (dx, dy, sx, sy) in enumerate([(-5,2,5.5,2.5),(3,-1,4.0,2.0),(7,4,3.3,1.7)]):
        z = min(-0.85, terrain_height(center.x + dx, center.y + dy) + 0.25)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=12, location=(center.x + dx, center.y + dy, z))
        obj = bpy.context.object
        obj.name = f"MarshPool_{i:02d}"
        obj.scale = (sx, sy, 0.08)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        obj.data.materials.append(materials["marsh_water"])
        obj.parent = root


def add_semantic_empties():
    for name, topo in LANDMARKS.items():
        p = to_world(topo)
        empty = bpy.data.objects.new(name if name not in bpy.data.objects else name + "_Anchor", None)
        empty.empty_display_type = "PLAIN_AXES"
        empty.empty_display_size = 1.2
        empty.location = (p.x, p.y, terrain_height(p.x, p.y))
        bpy.context.collection.objects.link(empty)


def build_manifest(bridge_contract):
    landmarks = {}
    for name, topo in LANDMARKS.items():
        p = to_world(topo)
        landmarks[name] = {"topology": [topo[0], topo[1]], "blender_world": [p.x, p.y, terrain_height(p.x, p.y)]}
    river = []
    for i, topo in enumerate(RIVER_POINTS):
        p = to_world(topo)
        prev = to_world(RIVER_POINTS[max(0, i - 1)])
        nxt = to_world(RIVER_POINTS[min(len(RIVER_POINTS) - 1, i + 1)])
        tangent = (nxt - prev).normalized()
        side = Vector((-tangent.y, tangent.x))
        bank_a, bank_b = p + side * 4.15, p - side * 4.15
        river.append({
            "topology": [topo[0], topo[1]], "center_world": [p.x, p.y],
            "water_z": water_height_for_topology_y(topo[1]),
            "bank_a_z": terrain_height(bank_a.x, bank_a.y), "bank_b_z": terrain_height(bank_b.x, bank_b.y),
        })
    routes = {}
    for name, points in ROUTES.items():
        routes[name] = []
        for topo in points:
            p = to_world(topo)
            routes[name].append({"topology": [topo[0], topo[1]], "blender_world": [p.x, p.y, terrain_height(p.x, p.y) + 0.13]})
    return {
        "contract": "AURELIAN_BASIN_PHASE1_RECOVERY_V1", "kaykit_source_commit": SOURCE_SHA,
        "topology_plane": [1000, 900], "topology_center": list(TOPOLOGY_CENTER), "topology_scale": TOPOLOGY_SCALE,
        "landmarks": landmarks, "river_centerline": river, "bridge": bridge_contract, "routes": routes,
        "cameras": {
            "village": {"topology_center": [425, 315], "ortho_size": 52.0},
            "map": {"topology_center": [500, 435], "ortho_size": 103.0},
            "world": {"topology_center": [500, 465], "ortho_size": 132.0},
            "bridge": {"topology_center": [515, 340], "ortho_size": 27.0},
        },
    }


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    materials = make_materials()
    create_terrain(materials)
    create_river(materials)
    create_sea(materials)
    for route_name, topo_points in ROUTES.items():
        create_road(route_name, topo_points, materials["road"], 1.65 if route_name == "GreenvaleBridge" else 1.45)
    bridge_contract = create_bridge(materials)
    create_greenvale()
    create_forest_and_ridge()
    create_field_rows(materials)
    create_marsh_pools(materials)
    add_semantic_empties()
    scene = bpy.context.scene
    scene["pixel_nations_contract"] = "AURELIAN_BASIN_PHASE1_RECOVERY_V1"
    scene["kaykit_source_commit"] = SOURCE_SHA
    scene["topology_scale"] = TOPOLOGY_SCALE
    blend_path = OUTPUT_DIR / "aurelian_basin_phase1_recovery.blend"
    glb_path = OUTPUT_DIR / "aurelian_basin_phase1_recovery.glb"
    manifest_path = OUTPUT_DIR / "transform-manifest.json"
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    bpy.ops.export_scene.gltf(filepath=str(glb_path), export_format="GLB", export_apply=True,
                              export_cameras=False, export_lights=False)
    if not glb_path.is_file() or glb_path.stat().st_size < 250000:
        raise RuntimeError(f"GLB export failed or unexpectedly small: {glb_path}")
    manifest = build_manifest(bridge_contract)
    manifest["blend_sha256"] = hashlib.sha256(blend_path.read_bytes()).hexdigest()
    manifest["glb_sha256"] = hashlib.sha256(glb_path.read_bytes()).hexdigest()
    manifest["glb_bytes"] = glb_path.stat().st_size
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    source_manifest = {key: {"path": rel, "sha256": hashlib.sha256((KAYKIT_ROOT / rel).read_bytes()).hexdigest()}
                       for key, rel in ASSETS.items()}
    (OUTPUT_DIR / "source-manifest.json").write_text(json.dumps({"source_commit": SOURCE_SHA, "assets": source_manifest}, indent=2) + "\n")
    print(f"AURELIAN_RECOVERY_BLEND={blend_path}")
    print(f"AURELIAN_RECOVERY_GLB={glb_path}")
    print(f"AURELIAN_RECOVERY_MANIFEST={manifest_path}")
    print("AURELIAN_RECOVERY_AUTHORING=PASS")


for key, relative in ASSETS.items():
    if not (KAYKIT_ROOT / relative).is_file():
        raise FileNotFoundError(f"Missing pinned source {key}: {KAYKIT_ROOT / relative}")
main()
