#!/usr/bin/env python3
import bpy, hashlib, importlib.util, json, math, sys
from pathlib import Path
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if len(args) != 4:
    raise SystemExit("Usage: blender -b --python aurelian_composition_v2.py -- <base> <layout.json> <kaykit> <out>")
base_path, layout_path, source_root, out = map(Path, args)
spec = importlib.util.spec_from_file_location("aurelian_base", base_path)
base = importlib.util.module_from_spec(spec); spec.loader.exec_module(base)
layout_data = json.loads(layout_path.read_text())
WORLD, CAMERAS = layout_data["WORLD_LAYOUT"], layout_data["CAMERAS"]
source_root, out = source_root.resolve(), out.resolve(); out.mkdir(parents=True, exist_ok=True)
STATES = ("camp", "first_shelter", "developed_settlement")
ACCEPTED_M1_HEAD = "e0db68c5943a8c17d523e9c1d0802f7c8641b9ed"

base.ASSETS.update({
    "barracks": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/buildings/red/building_barracks_red.gltf",
    "tent": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/tent.gltf",
    "flag_red": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/flag_red.gltf",
    "barrel": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/barrel.gltf",
    "crate_big": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/crate_A_big.gltf",
    "crate_small": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/crate_A_small.gltf",
    "lumber": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/resource_lumber.gltf",
    "sack": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/sack.gltf",
    "wheelbarrow": "addons/kaykit_medieval_hexagon_pack/Assets/gltf/decoration/props/wheelbarrow.gltf",
})
for mode, camera in CAMERAS.items():
    base.LAYOUTS[mode] = {**WORLD, "camera": {
        "position": tuple(camera["target"][i] + camera["offset"][i] for i in range(3)),
        "target": camera["target"], "ortho": camera["ortho"], "resolution": camera["resolution"],
    }}
WORLD_HASH = hashlib.sha256(json.dumps(WORLD, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def terrain_height(_mode, x, y):
    d = base.distance_to_polyline(x, y, WORLD["river"])
    channel = -4.35 * math.exp(-((d / 7.2) ** 2))
    banks = 1.1 * math.exp(-(((d - 10.8) / 3.9) ** 2))
    ridge = 11.5 * math.exp(-(((x + 112) / 38) ** 2) - (((y - 92) / 34) ** 2))
    shoulder = 8.0 * math.exp(-(((x - 125) / 36) ** 2) - (((y - 72) / 46) ** 2))
    plain = -0.55 * math.exp(-(((x + 18) / 70) ** 2) - (((y + 88) / 45) ** 2))
    return channel + banks + ridge + shoulder + plain + 0.28 * math.sin(x * .07) * math.cos(y * .064) + .12 * math.sin((x + y) * .045)
base.terrain_height = terrain_height


def cube(name, loc, dims, angle, mat):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=(0, 0, math.radians(angle)))
    o = bpy.context.object; o.name = name; o.dimensions = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True); o.data.materials.append(mat)
    return o


def ramp(name, endpoint, angle, sign, ground, deck, width, mat):
    a = Vector((math.cos(math.radians(angle)), math.sin(math.radians(angle)), 0)) * sign
    s = Vector((-a.y * sign, a.x * sign, 0)); inner = Vector((*endpoint, 0)); outer = inner + a * 6; h = width / 2
    il, ir, ol, orr = inner + s*h, inner - s*h, outer + s*h, outer - s*h; bottom = min(ground, deck) - .15
    verts = [(il.x,il.y,bottom),(ir.x,ir.y,bottom),(orr.x,orr.y,bottom),(ol.x,ol.y,bottom),
             (il.x,il.y,deck),(ir.x,ir.y,deck),(orr.x,orr.y,ground+.18),(ol.x,ol.y,ground+.18)]
    faces=[(0,1,2,3),(4,7,6,5),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)]
    m=bpy.data.meshes.new(name+"Mesh"); m.from_pydata(verts,[],faces); m.update()
    o=bpy.data.objects.new(name,m); bpy.context.collection.objects.link(o); o.data.materials.append(mat)


def bridge(mat):
    c=WORLD["bridge"]; x,y=c["position"]; angle,length,width=c["rotation"],c["length"],c["width"]
    along=Vector((math.cos(math.radians(angle)),math.sin(math.radians(angle)),0)); across=Vector((-along.y,along.x,0))
    a=Vector((x,y,0))-along*length/2; b=Vector((x,y,0))+along*length/2
    ga,gb=terrain_height("desktop",a.x,a.y),terrain_height("desktop",b.x,b.y); deck=max(ga,gb,.15)+.42
    for i in range(15): cube(f"BridgePlank_{i:02d}",Vector((x,y,deck))+along*(-length/2+i*length/14),(2.15,width,.30),angle,mat["wood"])
    water=WORLD["water_z"]; ph=max(2.5,deck-water)
    for off in (-length*.28,length*.28): cube("BridgePier",Vector((x,y,water+ph/2))+along*off,(2.2,width-1,ph),angle,mat["stone"])
    for end,g,sign,label in ((a,ga,-1,"A"),(b,gb,1,"B")):
        ah=max(1.4,deck-g+.35); cube("BridgeAbutment"+label,(end.x,end.y,g+ah/2),(4.8,width+1.6,ah),angle,mat["stone"])
        ramp("BridgeRamp"+label,(end.x,end.y),angle,sign,g,deck,width+.4,mat["road"])
    for side in (-1,1): cube("BridgeRail",Vector((x,y,deck+1.05))+across*(side*width*.48),(length,.24,.24),angle,mat["wood"])
    return {"center":[x,y],"rotation":angle,"length":length,"width":width,"deck_z":round(deck,4),
            "end_a":[round(a.x,4),round(a.y,4),round(ga,4)],"end_b":[round(b.x,4),round(b.y,4),round(gb,4)]}


def emissive(name,color,strength):
    m=bpy.data.materials.new(name); m.diffuse_color=color; m.use_nodes=True; b=m.node_tree.nodes.get("Principled BSDF")
    if b:
        b.inputs["Base Color"].default_value=color; b.inputs["Roughness"].default_value=.65
        (b.inputs.get("Emission Color") or b.inputs.get("Emission")).default_value=color
        if b.inputs.get("Emission Strength"): b.inputs["Emission Strength"].default_value=strength
    return m


def hearth(mode, source, center, mat, placements, flame=True):
    x,y=center; z=terrain_height(mode,x,y)
    for i,ang in enumerate(range(0,360,45)):
        p=(x+math.cos(math.radians(ang))*2.15,y+math.sin(math.radians(ang))*2.15)
        _,d=base.import_asset(source,"rock_c",p,ang,2+(i%2)*.15); d["layout_id"]=f"hearth_stone_{i}"; placements.append(d)
    if not flame: return
    for i,ang in enumerate((45,-45)):
        bpy.ops.mesh.primitive_cylinder_add(vertices=8,radius=.24,depth=3.6,location=(x,y,z+.34),rotation=(0,math.radians(90),math.radians(ang)))
        bpy.context.object.data.materials.append(mat["wood"])
    outer,inner=emissive("HearthFlameGold",(1,.32,.04,1),2.8),emissive("HearthFlameCore",(1,.75,.12,1),4)
    for name,radius,zz,scale,material in (("Outer",.9,z+.9,(.75,.75,1.35),outer),("Inner",.58,z+1,(.62,.62,1.15),inner)):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=radius,location=(x,y,zz)); o=bpy.context.object; o.name="HearthFlame"+name; o.scale=scale; o.data.materials.append(material)
    bpy.ops.object.light_add(type="POINT",location=(x,y,z+2)); l=bpy.context.object; l.data.energy=85; l.data.color=(1,.42,.12); l.data.shadow_soft_size=4


def plaza(mode, source, mat, placements):
    x,y=WORLD["plaza"]["position"]; z=terrain_height(mode,x,y)
    bpy.ops.mesh.primitive_cylinder_add(vertices=48,radius=WORLD["plaza"]["radius"],depth=.28,location=(x,y,z+.13)); bpy.context.object.data.materials.append(mat["road"])
    hearth(mode,source,(x,y),mat,placements,False)
    for i,(px,py,ang) in enumerate(((10,65,8),(20,68,8),(11,70,98),(20,73,98))): cube(f"HomeYardFence_{i}",(px,py,terrain_height(mode,px,py)+.45),(8,.35,.9),ang,mat["wood"])
    cube("HomeGardenPatch",(17,69,terrain_height(mode,17,69)+.1),(9,6,.18),8,mat["earth"])


def setup(mode,path):
    s=bpy.context.scene
    try: s.render.engine="BLENDER_EEVEE_NEXT"
    except Exception: s.render.engine="BLENDER_EEVEE"
    w,h=base.LAYOUTS[mode]["camera"]["resolution"]; s.render.resolution_x=w; s.render.resolution_y=h; s.render.resolution_percentage=100; s.render.image_settings.file_format="PNG"; s.render.filepath=str(path); s.view_settings.view_transform="Standard"; s.view_settings.exposure=-.15
    world=bpy.data.worlds.new("AurelianWorld"); world.use_nodes=True; world.node_tree.nodes["Background"].inputs["Color"].default_value=(.30,.36,.35,1); world.node_tree.nodes["Background"].inputs["Strength"].default_value=.55; s.world=world
    bpy.ops.object.light_add(type="SUN",location=(0,0,120)); sun=bpy.context.object; sun.rotation_euler=tuple(math.radians(v) for v in (42,-28,-18)); sun.data.energy=1.45; sun.data.color=(1,.93,.80)
    c=base.LAYOUTS[mode]["camera"]; bpy.ops.object.camera_add(location=c["position"]); cam=bpy.context.object; cam.data.type="ORTHO"; cam.data.ortho_scale=c["ortho"]; base.aim(cam,c["target"]); s.camera=cam; return cam


def buildings(state):
    if state=="camp": return []
    if state=="first_shelter": return [x for x in WORLD["buildings"] if x["id"]=="home_primary"]
    return WORLD["buildings"]

def props(state):
    if state=="camp": return WORLD["camp"]["props"]
    if state=="first_shelter":
        keep={"camp_tent","camp_flag","camp_crate_big","camp_lumber","camp_sack","camp_barrel","camp_wheelbarrow"}; return [x for x in WORLD["camp"]["props"] if x["id"] in keep]
    return WORLD["developed_props"]
def roads(state):
    r={k:WORLD["roads"][k] for k in ("far_bank","settlement")}
    if state=="first_shelter": r["shelter_spur"]=WORLD["roads"]["shelter_spur"]
    if state=="developed_settlement":
        for k in ("home_spur","work_spur","landmark_spur"): r[k]=WORLD["roads"][k]
    return r


def render(mode,state):
    base.CURRENT_MODE=mode; bpy.ops.wm.read_factory_settings(use_empty=True)
    mat={"plain":base.make_material("TerrainOlive",(.29,.36,.20,1),.98),"ridge":base.make_material("TerrainForest",(.18,.29,.16,1),.98),"earth":base.make_material("BankEarth",(.36,.27,.17,1),.98),"water":base.make_material("RiverTeal",(.05,.31,.37,1),.35,.02),"road":base.make_material("RoadOchre",(.49,.36,.22,1),.99),"wood":base.make_material("BridgeWood",(.28,.17,.08,1),.93),"stone":base.make_material("BridgeStone",(.38,.40,.37,1),.96)}
    base.create_terrain(mode,mat); base.create_ribbon("RiverBank",mode,WORLD["river"],27,mat["earth"],fixed_z=WORLD["bank_z"]); base.create_ribbon("RiverWater",mode,WORLD["river"],19,mat["water"],fixed_z=WORLD["water_z"])
    rs=roads(state)
    for name,pts in rs.items(): base.create_ribbon("Road_"+name,mode,pts,3.7 if name.endswith("spur") else 5,mat["road"],z_offset=.14)
    bc=bridge(mat); placements=[]; authored=[]
    for item in buildings(state)+props(state):
        _,d=base.import_asset(source_root,item["asset"],item["position"],item["rotation"],item["scale"]); d["layout_id"]=item["id"]; placements.append(d); authored.append(item)
    for i,(x,y,rot) in enumerate(WORLD["trees"]): _,d=base.import_asset(source_root,"tree_a" if i%2==0 else "tree_b",(x,y),rot,7.8+(i%3)*.5); d["layout_id"]=f"tree_{i}"; placements.append(d)
    for i,(x,y,rot) in enumerate(WORLD["rocks"]): _,d=base.import_asset(source_root,"rock_c" if i%2==0 else "rock_e",(x,y),rot,8.5+(i%2)); d["layout_id"]=f"rock_{i}"; placements.append(d)
    plaza(mode,source_root,mat,placements) if state=="developed_settlement" else hearth(mode,source_root,WORLD["camp"]["hearth"],mat,placements,True)
    path=out/f"aurelian-{state}-{mode}.png"; cam=setup(mode,path); bpy.ops.render.render(write_still=True)
    if not path.is_file() or path.stat().st_size<20000: raise RuntimeError(f"V2 render failed: {state}/{mode}")
    contract={"classification":"PENDING_DIRECT_VISUAL_REVIEW","accepted_m1_head":ACCEPTED_M1_HEAD,"state":state,"mode":mode,"source_commit":base.SOURCE_SHA,"world_layout_sha256":WORLD_HASH,"camera":base.LAYOUTS[mode]["camera"],"anchors":{"bridge":bc,"plaza":WORLD["plaza"],"cluster_bounds_hint":{"min":[-32,25],"max":[32,78]}},"roads":rs,"authored_placements":authored,"placements":placements,"preview_sha256":hashlib.sha256(path.read_bytes()).hexdigest(),"camera_object":cam.name}
    (out/f"aurelian-{state}-{mode}-contract.json").write_text(json.dumps(contract,indent=2)+"\n"); print(f"AURELIAN_V2_RENDER_EXPORTED={state}:{mode}:{path}")

for role,rel in base.ASSETS.items():
    if not (source_root/rel).is_file(): raise FileNotFoundError(f"Missing pinned source {role}: {source_root/rel}")
for mode in ("desktop","portrait"):
    for state in STATES: render(mode,state)
for state in ("first_shelter","developed_settlement"): render("master",state)
manifest={"classification":"PENDING_DIRECT_VISUAL_REVIEW","accepted_m1_head":ACCEPTED_M1_HEAD,"source_commit":base.SOURCE_SHA,"world_layout_sha256":WORLD_HASH,"world_layout":WORLD,"cameras":CAMERAS,"states":list(STATES),"assets":{r:{"path":p,"sha256":hashlib.sha256((source_root/p).read_bytes()).hexdigest()} for r,p in base.ASSETS.items()}}
(out/"source-manifest.json").write_text(json.dumps(manifest,indent=2)+"\n"); print(f"AURELIAN_COMPOSITION_V2_EXPORTED={out}")
