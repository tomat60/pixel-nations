#!/usr/bin/env python3
"""Render two registered zooms of one deterministic Aurelian landscape."""

import bpy
import json
import math
import sys
from pathlib import Path
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if len(argv) != 1:
    raise SystemExit("Usage: blender -b --python aurelian_world_v4_continuity.py -- <output_dir>")
OUT = Path(argv[0]).resolve()
OUT.mkdir(parents=True, exist_ok=True)

SEEDS = {
    "basin": [(x * 31 + (y % 2) * 15 + ((x * 7 + y * 11) % 9) - 4,
               y * 29 + ((x * 13 + y * 5) % 11) - 5)
              for y in range(5) for x in range(6)],
    "region": [(39 + x * 15 + (y % 2) * 4 + ((x * 3 + y * 7) % 3) - 1,
                24 + y * 14 + ((x * 11 + y * 3) % 3) - 1)
               for y in range(5) for x in range(5)],
}
BOUNDS = {"basin": (-18.0, -18.0, 178.0, 134.0), "region": (31.0, 17.0, 111.0, 93.0)}


def clip(poly, a, b, c):
    result = []
    for p, q in zip(poly, poly[1:] + poly[:1]):
        fp, fq = a * p[0] + b * p[1] - c, a * q[0] + b * q[1] - c
        pin, qin = fp <= 1e-7, fq <= 1e-7
        if pin:
            result.append(p)
        if pin != qin:
            t = fp / (fp - fq)
            result.append((p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])))
    return result


def voronoi(seeds, bounds):
    x0, y0, x1, y1 = bounds
    cells = []
    for i, (sx, sy) in enumerate(seeds):
        poly = [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]
        for j, (tx, ty) in enumerate(seeds):
            if i == j:
                continue
            poly = clip(poly, 2 * (tx - sx), 2 * (ty - sy), tx * tx + ty * ty - sx * sx - sy * sy)
            if len(poly) < 3:
                raise RuntimeError(f"collapsed cell {i}")
        cells.append(poly)
    return cells


def material(name, color, roughness=0.95):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = color
    mat.use_nodes = True
    node = mat.node_tree.nodes.get("Principled BSDF")
    node.inputs["Base Color"].default_value = color
    node.inputs["Roughness"].default_value = roughness
    return mat


def height(x, y):
    ridge = 13.0 * math.exp(-((y - 112.0) / 24.0) ** 2) * (0.62 + 0.38 * math.cos(x / 25.0))
    rolling = 3.0 * math.sin(x / 28.0) + 2.1 * math.cos(y / 19.0) + 1.3 * math.sin((x + y) / 17.0)
    return max(-1.5, ridge + rolling)


def terrain_mesh(mat):
    nx, ny = 45, 37
    verts, faces = [], []
    for y in range(ny):
        py = -24 + y * 4.7
        for x in range(nx):
            px = -24 + x * 4.9
            verts.append((px, py, height(px, py)))
    for y in range(ny - 1):
        for x in range(nx - 1):
            a = y * nx + x
            faces.append((a, a + 1, a + nx + 1, a + nx))
    mesh = bpy.data.meshes.new("AurelianTerrainMesh")
    mesh.from_pydata(verts, [], faces)
    obj = bpy.data.objects.new("AurelianTerrain", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)


def ribbon(name, points, width, z, mat):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = width / 2
    curve.bevel_resolution = 3
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(len(points) - 1)
    for bp, (x, y) in zip(spline.bezier_points, points):
        bp.co = (x, y, z)
        bp.handle_left_type = bp.handle_right_type = "AUTO"
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)


def boundary(name, poly, mat):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = 0.17
    curve.bevel_resolution = 1
    spline = curve.splines.new("POLY")
    spline.points.add(len(poly))
    for point, (x, y) in zip(spline.points, poly + poly[:1]):
        point.co = (x, y, height(x, y) + 0.55, 1)
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)


def cube(name, loc, scale, mat, rotation=0):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=(0, 0, math.radians(rotation)))
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(mat)
    return obj


def aim(camera, target):
    camera.rotation_euler = (Vector(target) - camera.location).to_track_quat("-Z", "Y").to_euler()


def setup_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    mats = {
        "land": material("WarmOliveLand", (0.28, 0.38, 0.20, 1)),
        "water": material("AurelianTeal", (0.035, 0.25, 0.32, 1), 0.34),
        "road": material("OchreRoad", (0.46, 0.34, 0.19, 1)),
        "line": material("SubtleLandBoundary", (0.72, 0.65, 0.43, 1)),
        "roof": material("GreenvaleRoof", (0.34, 0.18, 0.10, 1)),
        "stone": material("BridgeStone", (0.46, 0.43, 0.34, 1)),
    }
    terrain_mesh(mats["land"])
    river = [(-24, 26), (8, 32), (38, 43), (65, 50), (92, 59), (126, 64), (184, 72)]
    ribbon("CanonicalRiver", river, 7.8, -0.9, mats["water"])
    ribbon("GreenvaleRoad", [(61, -20), (65, 9), (68, 35), (70, 52), (84, 78)], 2.4, 0.6, mats["road"])
    cube("CanonicalBridge", (68, 51, 1.6), (8.2, 2.1, 0.65), mats["stone"], 18)
    for dx, dy, s in [(-4, 0, 1.0), (3, 3, 0.85), (1, -4, 0.72), (7, -2, 0.66)]:
        x, y = 72 + dx, 68 + dy
        cube("GreenvaleBuilding", (x, y, height(x, y) + 1.7 * s), (2.2 * s, 2.0 * s, 1.7 * s), mats["roof"], 22)
    world = bpy.data.worlds.new("AurelianWorld")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.24, 0.31, 0.29, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.65
    bpy.context.scene.world = world
    bpy.ops.object.light_add(type="SUN", location=(0, 0, 140))
    sun = bpy.context.object
    sun.rotation_euler = tuple(math.radians(v) for v in (42, -28, -22))
    sun.data.energy = 1.45
    return mats


def render_zoom(name, cells, mats):
    boundary_objects = []
    for i, poly in enumerate(cells):
        before = set(bpy.data.objects)
        boundary(f"{name}_cell_{i:02d}", poly, mats["line"])
        boundary_objects.extend(o for o in bpy.data.objects if o not in before)
    cfg = {
        "basin": ((206, -238, 218), (78, 56, 5), 196.0),
        "region": ((150, -128, 132), (71, 57, 4), 94.0),
    }[name]
    bpy.ops.object.camera_add(location=cfg[0])
    camera = bpy.context.object
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = cfg[2]
    aim(camera, cfg[1])
    bpy.context.scene.camera = camera
    scene = bpy.context.scene
    try:
        scene.render.engine = "BLENDER_EEVEE_NEXT"
    except Exception:
        scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = scene.render.resolution_y = 2048
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGB"
    scene.render.filepath = str(OUT / f"{name}-master.png")
    scene.view_settings.view_transform = "Standard"
    bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(camera, do_unlink=True)
    for obj in boundary_objects:
        bpy.data.objects.remove(obj, do_unlink=True)


def normalize(poly, bounds):
    x0, y0, x1, y1 = bounds
    return [[round((x - x0) / (x1 - x0), 7), round((y - y0) / (y1 - y0), 7)] for x, y in poly]


mats = setup_scene()
manifest = {"contract": "WORLD_V4_CONTINUITY_PROOF", "zooms": {}}
for zoom in ("basin", "region"):
    cells = voronoi(SEEDS[zoom], BOUNDS[zoom])
    render_zoom(zoom, cells, mats)
    manifest["zooms"][zoom] = {
        "cell_count": len(cells),
        "bounds": list(BOUNDS[zoom]),
        "greenvale_world": [72, 68],
        "cells": [{"id": f"{zoom}-{i + 1:02d}", "world": p, "normalized": normalize(p, BOUNDS[zoom])} for i, p in enumerate(cells)],
    }
(OUT / "projection-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
print(f"WORLD_V4_RENDER_OK={OUT}")
