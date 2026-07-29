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
        "extent": (380.0, 300.0), "grid": (152, 120),
        "river": [(-190,72),(-150,59),(-112,45),(-72,24),(-38,-5),(5,-20),(55,-32),(120,-42),(190,-47)], "water_z": -3.3,
        "road_before": [(-136,-103),(-108,-82),(-82,-61),(-61,-42),(-45,-25)],
        "road_after": [(-28,-7),(-8,5),(12,14),(34,23),(58,36)],
        "bridge": {"position": (-36.5,-15.0), "rotation": 42.0, "length": 24.0},
        "buildings": [
            ("blacksmith",(-5,8),-12,9.5),
            ("market",(26,18),12,9.0),
            ("well",(39,31),0,8.5),
            ("house_a",(18,51),22,9.2),
            ("house_b",(47,47),-12,9.1),
            ("barracks",(92,18),-25,6.0),
            ("church",(69,78),8,10.5)
        ],
        "trees": [(-140,72,0),(-124,91,18),(-107,79,-15),(-91,101,22),(-74,84,5),(-148,108,-18),(-57,106,12),(-128,56,8),(-95,58,-20)],
        "rocks": [(125,2,0),(143,23,30),(118,43,-18),(151,63,15)],
        "camera": {"position": (132,-170,132), "target": (8,16,5), "ortho": 138.0, "resolution": (1440,900)},
        "camera_change_reason": "Pass 2 extends terrain beyond the view and separates the frontier barracks from the rear church landmark."
    },
    "portrait": {
        "extent": (260.0, 380.0), "grid": (108, 158),
        "river": [(-130,-52),(-88,-47),(-48,-42),(-15,-35),(20,-28),(62,-21),(104,-15),(130,-12)], "water_z": -3.3,
        "road_before": [(-5,-112),(-5,-91),(-4,-72),(-4,-55),(-3,-43)],
        "road_after": [(0,-25),(1,-4),(4,20),(7,46),(10,78),(9,96)],
        "bridge": {"position": (-2,-34), "rotation": 84.0, "length": 22.0},
        "buildings": [
            ("blacksmith",(-20,-2),-15,8.7),
            ("market",(15,24),10,8.4),
            ("well",(-1,42),0,7.8),
            ("house_a",(24,55),22,8.5),
            ("house_b",(31,76),-10,8.2),
            ("barracks",(-38,72),-20,6.0),
            ("church",(7,108),5,10.5)
        ],
        "trees": [(-92,103,0),(-77,126,16),(-101,150,-12),(-65,168,10),(88,137,-18),(102,166,20)],
        "rocks": [(78,34,0),(94,67,28),(86,98,-16)],
        "camera": {"position": (82,-184,150), "target": (0,28,9), "ortho": 176.0, "resolution": (390,844)},
        "camera_change_reason": "Pass 2 tightens and raises portrait framing so the route enters from the lower band and resolves at an isolated rear church without exposing the terrain board."
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
    contract={"pass":"AUTONOMOUS_DCC_PASS_2","mode":mode,"source_commit":base.SOURCE_SHA,"camera":layout["camera"],"terrain_extent":layout["extent"],"bridge":layout["bridge"],"placements":placements,"preview_sha256":hashlib.sha256(preview.read_bytes()).hexdigest(),"camera_object":camera.name}
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
