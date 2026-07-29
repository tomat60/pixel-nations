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
    raise SystemExit("Usage: blender -b --python override.py -- <base_script> <kaykit_root> <output_dir>")
base_script, source_root, output_dir = map(Path, argv)
spec = importlib.util.spec_from_file_location("aurelian_base", base_script)
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)
source_root = source_root.resolve()
output_dir = output_dir.resolve()
output_dir.mkdir(parents=True, exist_ok=True)

base.ASSETS["barracks"] = "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/red/building_barracks_red.gltf"
base.LAYOUTS = {
    "desktop": {
        "extent": (300.0, 230.0), "grid": (124, 96),
        "river": [(-150,55),(-112,45),(-72,24),(-38,-5),(5,-20),(55,-32),(150,-38)], "water_z": -3.3,
        "road_before": [(-125,-92),(-101,-76),(-80,-58),(-61,-42),(-45,-25)],
        "road_after": [(-28,-7),(-8,5),(12,14),(34,23),(55,34)],
        "bridge": {"position": (-36.5,-15.0), "rotation": 42.0, "length": 24.0},
        "buildings": [("blacksmith",(-5,8),-12,9.5),("market",(26,18),12,9.0),("well",(39,31),0,8.5),("house_a",(20,47),22,9.3),("house_b",(49,43),-12,9.3),("barracks",(69,20),-25,8.0),("church",(75,67),8,9.8)],
        "trees": [(-112,61,0),(-99,77,18),(-87,66,-15),(-76,84,22),(-63,70,5),(-120,88,-18),(-48,88,12),(-103,48,8),(-76,50,-20)],
        "rocks": [(104,7,0),(118,24,30),(98,39,-18),(126,52,15)],
        "camera": {"position": (132,-170,132), "target": (9,12,5), "ortho": 142.0, "resolution": (1440,900)},
        "camera_change_reason": "Pass 1 expands terrain beyond frame and restores the lower-left route to a rear-right landmark."
    },
    "portrait": {
        "extent": (180.0, 310.0), "grid": (82, 136),
        "river": [(-90,-48),(-50,-42),(-15,-34),(20,-28),(55,-22),(90,-15)], "water_z": -3.3,
        "road_before": [(0,-145),(-2,-118),(-4,-91),(-5,-66),(-4,-45)],
        "road_after": [(0,-25),(1,-3),(5,24),(10,52),(14,78)],
        "bridge": {"position": (-2,-34), "rotation": 84.0, "length": 22.0},
        "buildings": [("blacksmith",(-25,-1),-15,8.9),("market",(18,24),10,8.5),("well",(0,41),0,8.0),("house_a",(32,52),22,8.8),("barracks",(-32,64),-20,7.6),("church",(16,101),5,9.5)],
        "trees": [(-67,86,0),(-58,108,16),(-72,129,-12),(-49,142,10),(65,118,-18),(72,145,20)],
        "rocks": [(62,38,0),(70,68,28),(64,92,-16)],
        "camera": {"position": (92,-205,164), "target": (0,8,10), "ortho": 204.0, "resolution": (390,844)},
        "camera_change_reason": "Independent vertical route with foreground approach and rear church landmark."
    }
}

def cube(name, location, dimensions, rotation, material):
    bpy.ops.mesh.primitive_cube_add(location=location, rotation=(0,0,math.radians(rotation)))
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(material)

def low_bridge(config, materials):
    x,y = config["position"]
    angle,length = config["rotation"],config["length"]
    rad = math.radians(angle)
    along = Vector((math.cos(rad),math.sin(rad),0))
    across = Vector((-math.sin(rad),math.cos(rad),0))
    for i in range(13):
        p = Vector((x,y,0.2)) + along*(-length/2 + i*length/12)
        cube(f"BridgePlank_{i:02d}",p,(2.1,6.2,0.28),angle,materials["wood"])
    for offset in (-length*0.28,length*0.28):
        cube("BridgePier",Vector((x,y,-1.5))+along*offset,(2.0,5.1,3.4),angle,materials["stone"])
    for side in (-1,1):
        cube("BridgeRail",Vector((x,y,1.25))+across*(side*3.0),(length,0.22,0.22),angle,materials["wood"])

def setup_render(mode, preview_path):
    scene = bpy.context.scene
    try: scene.render.engine = "BLENDER_EEVEE_NEXT"
    except Exception: scene.render.engine = "BLENDER_EEVEE"
    width,height = base.LAYOUTS[mode]["camera"]["resolution"]
    scene.render.resolution_x,scene.render.resolution_y = width,height
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = str(preview_path)
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.exposure = -0.15
    world = bpy.data.worlds.new("AurelianWorld")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.30,0.36,0.35,1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.55
    scene.world = world
    bpy.ops.object.light_add(type="SUN", location=(0,0,120))
    sun = bpy.context.object
    sun.rotation_euler = tuple(math.radians(v) for v in (42,-28,-18))
    sun.data.energy = 1.45
    sun.data.color = (1.0,0.93,0.80)
    cfg = base.LAYOUTS[mode]["camera"]
    bpy.ops.object.camera_add(location=cfg["position"])
    camera = bpy.context.object
    camera.name = mode.capitalize()+"Camera"
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = cfg["ortho"]
    base.aim(camera,cfg["target"])
    scene.camera = camera
    return camera

def build_scene(mode, source, out):
    base.CURRENT_MODE = mode
    bpy.ops.wm.read_factory_settings(use_empty=True)
    materials = {
        "plain": base.make_material("TerrainOlive",(0.29,0.36,0.20,1),0.98),
        "ridge": base.make_material("TerrainForest",(0.18,0.29,0.16,1),0.98),
        "earth": base.make_material("BankEarth",(0.36,0.27,0.17,1),0.98),
        "water": base.make_material("RiverTeal",(0.05,0.31,0.37,1),0.35,0.02),
        "road": base.make_material("RoadOchre",(0.49,0.36,0.22,1),0.99),
        "wood": base.make_material("BridgeWood",(0.28,0.17,0.08,1),0.93),
        "stone": base.make_material("BridgeStone",(0.38,0.40,0.37,1),0.96)
    }
    layout = base.LAYOUTS[mode]
    base.create_terrain(mode,materials)
    base.create_ribbon("RiverWater",mode,layout["river"],19.0,materials["water"],fixed_z=layout["water_z"])
    base.create_ribbon("RoadApproach",mode,layout["road_before"],5.0,materials["road"],z_offset=0.12)
    base.create_ribbon("RoadSettlement",mode,layout["road_after"],5.0,materials["road"],z_offset=0.12)
    low_bridge(layout["bridge"],materials)
    placements=[]
    for role,position,rotation,scale in layout["buildings"]:
        _,data=base.import_asset(source,role,position,rotation,scale); placements.append(data)
    for i,(x,y,rotation) in enumerate(layout["trees"]):
        _,data=base.import_asset(source,"tree_a" if i%2==0 else "tree_b",(x,y),rotation,7.8+(i%3)*0.5); placements.append(data)
    for i,(x,y,rotation) in enumerate(layout["rocks"]):
        _,data=base.import_asset(source,"rock_c" if i%2==0 else "rock_e",(x,y),rotation,8.5+(i%2)); placements.append(data)
    preview=out/f"autonomous-{mode}-preview.png"
    camera=setup_render(mode,preview)
    bpy.ops.render.render(write_still=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(out/f"autonomous-{mode}.blend"))
    contract={"pass":"AUTONOMOUS_DCC_PASS_1","mode":mode,"source_commit":base.SOURCE_SHA,"camera":layout["camera"],"terrain_extent":layout["extent"],"bridge":layout["bridge"],"placements":placements,"preview_sha256":hashlib.sha256(preview.read_bytes()).hexdigest(),"camera_object":camera.name}
    (out/f"autonomous-{mode}-contract.json").write_text(json.dumps(contract,indent=2)+"\n")
    print(f"AUTONOMOUS_PREVIEW_EXPORTED={mode}:{preview}")

for role, relative in base.ASSETS.items():
    path = source_root / relative
    if not path.is_file():
        raise FileNotFoundError(f"Missing pinned source {role}: {path}")

build_scene("desktop", source_root, output_dir)
build_scene("portrait", source_root, output_dir)
manifest = {role: {"path": relative, "sha256": hashlib.sha256((source_root / relative).read_bytes()).hexdigest()} for role, relative in base.ASSETS.items()}
(output_dir / "source-manifest.json").write_text(json.dumps({"source_commit": base.SOURCE_SHA, "assets": manifest}, indent=2) + "\n")
print(f"AUTONOMOUS_DCC_PASS_EXPORTED={output_dir}")
