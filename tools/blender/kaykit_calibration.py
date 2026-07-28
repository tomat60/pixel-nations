import bpy
import hashlib
import json
import sys
from pathlib import Path
from mathutils import Vector

SOURCE_SHA = "84fa4e91af6a88989be7c99e0891cede11f2ca38"
MODELS = {
    "church": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/red/building_church_red.gltf",
    "blacksmith": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/red/building_blacksmith_red.gltf",
    "barracks": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/red/building_barracks_red.gltf",
    "house_a": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/red/building_home_A_red.gltf",
    "house_b": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/red/building_home_B_red.gltf",
    "market": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/red/building_market_red.gltf",
    "well": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/red/building_well_red.gltf",
    "tree": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/nature/hills_A_trees.gltf",
    "rock": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/nature/rock_single_A.gltf",
}


def vec(values):
    return [round(float(v), 6) for v in values]


def bounds_for(objects):
    points = []
    for obj in objects:
        if obj.type != "MESH":
            continue
        for corner in obj.bound_box:
            points.append(obj.matrix_world @ Vector(corner))
    if not points:
        raise RuntimeError("Imported scene contains no mesh bounds")
    lower = Vector((min(p.x for p in points), min(p.y for p in points), min(p.z for p in points)))
    upper = Vector((max(p.x for p in points), max(p.y for p in points), max(p.z for p in points)))
    return lower, upper, upper - lower


def make_material(name, rgba, roughness=0.9):
    material = bpy.data.materials.new(name)
    material.diffuse_color = rgba
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = rgba
        bsdf.inputs["Roughness"].default_value = roughness
    return material


def aim(camera, target):
    camera.rotation_euler = (Vector(target) - camera.location).to_track_quat("-Z", "Y").to_euler()


def configure_render(scene, output_path, dims):
    try:
        scene.render.engine = "BLENDER_EEVEE_NEXT"
    except Exception:
        scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 640
    scene.render.resolution_y = 640
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.render.filepath = str(output_path)
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.exposure = 0.0
    scene.view_settings.gamma = 1.0

    world = bpy.data.worlds.new("CalibrationWorld")
    world.use_nodes = True
    background = world.node_tree.nodes.get("Background")
    background.inputs["Color"].default_value = (0.155, 0.175, 0.19, 1.0)
    background.inputs["Strength"].default_value = 0.7
    scene.world = world

    footprint = max(dims.x, dims.y, 0.1)
    height = max(dims.z, 0.1)
    extent = max(footprint, height)

    bpy.ops.mesh.primitive_plane_add(size=max(extent * 7.0, 12.0), location=(0.0, 0.0, -0.025))
    ground = bpy.context.object
    ground.name = "CalibrationGround"
    ground.data.materials.append(make_material("CalibrationGroundMaterial", (0.22, 0.235, 0.245, 1.0), 0.96))

    bpy.ops.object.light_add(type="AREA", location=(extent * 2.2, -extent * 2.0, extent * 3.0))
    key = bpy.context.object
    key.name = "NeutralKey"
    key.data.energy = max(450.0, extent * extent * 120.0)
    key.data.shape = "DISK"
    key.data.size = max(extent * 2.2, 4.0)
    aim(key, (0.0, 0.0, height * 0.45))

    bpy.ops.object.light_add(type="AREA", location=(-extent * 2.0, extent * 1.4, extent * 1.8))
    fill = bpy.context.object
    fill.name = "NeutralFill"
    fill.data.energy = max(180.0, extent * extent * 45.0)
    fill.data.size = max(extent * 2.8, 5.0)
    aim(fill, (0.0, 0.0, height * 0.35))

    bpy.ops.object.light_add(type="SUN", location=(0.0, 0.0, extent * 3.0))
    sun = bpy.context.object
    sun.name = "NeutralSun"
    sun.rotation_euler = (0.72, -0.55, -0.35)
    sun.data.energy = 1.25
    sun.data.angle = 0.18

    bpy.ops.object.camera_add()
    camera = bpy.context.object
    camera.name = "CalibrationCamera"
    camera.data.type = "ORTHO"
    camera.location = (extent * 1.75, -extent * 2.15, extent * 1.55 + height * 0.55)
    aim(camera, (0.0, 0.0, height * 0.42))
    camera.data.ortho_scale = max(footprint * 1.65, height * 1.7, 3.5)
    scene.camera = camera


def main():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    if len(argv) != 2:
        raise SystemExit("Usage: blender -b --python kaykit_calibration.py -- <source_root> <output_dir>")
    source_root = Path(argv[0]).resolve()
    output_dir = Path(argv[1]).resolve()
    thumbs_dir = output_dir / "thumbnails"
    output_dir.mkdir(parents=True, exist_ok=True)
    thumbs_dir.mkdir(parents=True, exist_ok=True)

    report = {
        "source_commit": SOURCE_SHA,
        "coordinate_system": "Blender after glTF import: X right, Y depth, Z up",
        "models": {},
    }

    for role, relative in MODELS.items():
        source = source_root / relative
        if not source.is_file():
            raise FileNotFoundError(f"Missing pinned model: {source}")
        bpy.ops.wm.read_factory_settings(use_empty=True)
        before = set(bpy.data.objects)
        bpy.ops.import_scene.gltf(filepath=str(source))
        imported = [obj for obj in bpy.data.objects if obj not in before]
        meshes = [obj for obj in imported if obj.type == "MESH"]
        lower, upper, dims = bounds_for(meshes)
        roots = [obj for obj in imported if obj.parent is None or obj.parent not in imported]
        origins = [vec(obj.matrix_world.translation) for obj in roots]

        center = (lower + upper) * 0.5
        offset = Vector((-center.x, -center.y, -lower.z))
        for root in roots:
            root.location += offset
        bpy.context.view_layer.update()

        native_hash = hashlib.sha256(source.read_bytes()).hexdigest()
        thumb = thumbs_dir / f"{role}.png"
        configure_render(bpy.context.scene, thumb, dims)
        bpy.ops.render.render(write_still=True)
        if not thumb.is_file() or thumb.stat().st_size < 2048:
            raise RuntimeError(f"Thumbnail render failed for {role}")

        report["models"][role] = {
            "source_path": relative,
            "sha256": native_hash,
            "mesh_object_count": len(meshes),
            "root_origins": origins,
            "aabb_min": vec(lower),
            "aabb_max": vec(upper),
            "dimensions": {"x": round(dims.x, 6), "y": round(dims.y, 6), "z": round(dims.z, 6)},
            "footprint_max": round(max(dims.x, dims.y), 6),
            "thumbnail": f"thumbnails/{role}.png",
        }
        print(f"CALIBRATED_MODEL={role} dimensions={vec(dims)} sha256={native_hash}")

    house_width = report["models"]["house_a"]["footprint_max"]
    if house_width <= 0:
        raise RuntimeError("Invalid house reference width")
    report["normalization"] = {
        "reference_role": "house_a",
        "reference_native_footprint": house_width,
        "proposed_house_footprint_world_units": 10.0,
        "proposed_uniform_scale": round(10.0 / house_width, 8),
        "status": "PROPOSAL_REQUIRES_REVIEW",
    }
    metrics_path = output_dir / "kaykit-metrics.json"
    metrics_path.write_text(json.dumps(report, indent=2) + "\n")
    print(f"KAYKIT_CALIBRATION_EXPORTED={metrics_path}")


if __name__ == "__main__":
    main()
