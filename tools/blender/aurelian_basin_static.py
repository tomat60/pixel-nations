import bpy
import math
from pathlib import Path
from mathutils import Vector

OUT = Path('/tmp/aurelian_basin.glb')

bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(name, color, roughness=0.9, metallic=0.0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1.0)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metallic
    return m

terrain_mat = mat('Basin_Olive', (0.32, 0.34, 0.18), 0.96)
water_mat = mat('River_Teal', (0.05, 0.28, 0.30), 0.34, 0.05)
road_mat = mat('Road_Ochre', (0.48, 0.34, 0.20), 0.98)
bank_mat = mat('Bank_Earth', (0.38, 0.27, 0.15), 0.98)


def river_z(x):
    return 0.18 * x + 3.0 * math.sin(x / 13.0)


def height(x, z):
    channel = -2.8 * math.exp(-((z - river_z(x)) / 5.2) ** 2)
    ridge = 7.5 * math.exp(-((x + 27.0) / 17.0) ** 2 - ((z + 17.0) / 13.0) ** 2)
    shoulder = 6.0 * math.exp(-((x - 31.0) / 14.0) ** 2 - ((z - 5.0) / 20.0) ** 2)
    undulation = 0.22 * math.sin(x * 0.18) * math.cos(z * 0.15)
    return channel + ridge + shoulder + undulation


def grid_mesh(name, nx=64, nz=48, sx=104.0, sz=78.0):
    verts=[]; faces=[]
    for iz in range(nz+1):
        z=-sz/2 + sz*iz/nz
        for ix in range(nx+1):
            x=-sx/2 + sx*ix/nx
            verts.append((x, z, height(x,z)))
    for iz in range(nz):
        for ix in range(nx):
            a=iz*(nx+1)+ix; b=a+1; d=(iz+1)*(nx+1)+ix; c=d+1
            faces.append((a,b,c,d))
    mesh=bpy.data.meshes.new(name+'Mesh'); mesh.from_pydata(verts,[],faces); mesh.update()
    obj=bpy.data.objects.new(name,mesh); bpy.context.collection.objects.link(obj)
    obj.data.materials.append(terrain_mat)
    return obj

terrain=grid_mesh('AuthoredTerrain')


def ribbon(name, points, width, z_offset, material):
    verts=[]; faces=[]
    for i,p in enumerate(points):
        prev=Vector(points[max(0,i-1)]); nxt=Vector(points[min(len(points)-1,i+1)])
        tangent=(nxt-prev).normalized(); side=Vector((-tangent.y,tangent.x,0)).normalized()*width*0.5
        v=Vector(p)
        verts.append(tuple(v+side)); verts.append(tuple(v-side))
    for i in range(len(points)-1):
        a=2*i; b=a+1; c=a+3; d=a+2; faces.append((a,b,c,d))
    mesh=bpy.data.meshes.new(name+'Mesh'); mesh.from_pydata(verts,[],faces); mesh.update()
    obj=bpy.data.objects.new(name,mesh); bpy.context.collection.objects.link(obj)
    obj.data.materials.append(material)
    return obj

river=[]
for i in range(65):
    x=-52+104*i/64
    river.append((x, river_z(x), -2.12))
ribbon('RiverSurface', river, 5.4, 0, water_mat)

# Exposed banks make the channel readable around the bridge and along the bend.
for sign in (-1,1):
    bank=[]
    for i in range(65):
        x=-52+104*i/64; z=river_z(x)+sign*3.1
        bank.append((x,z,height(x,z)+0.08))
    ribbon('RiverBankL' if sign<0 else 'RiverBankR', bank, 1.15, 0, bank_mat)

road_xy=[(3,38),(2,28),(1,18),(0,8),(0,4),(7,-4),(15,-10),(20,-13)]
road=[]
for x,z in road_xy:
    road.append((x,z,height(x,z)+0.20))
ribbon('RoadBed', road, 3.0, 0, road_mat)

# Flattened founder pads and commons are support geometry, not gameplay parcels.
def disk(name, x, z, radius, material):
    y=height(x,z)+0.10
    verts=[(x,z,y)]
    seg=32
    for i in range(seg):
        a=2*math.pi*i/seg
        verts.append((x+radius*math.cos(a),z+radius*math.sin(a),y))
    faces=[]
    for i in range(seg): faces.append((0,1+i,1+((i+1)%seg)))
    mesh=bpy.data.meshes.new(name+'Mesh'); mesh.from_pydata(verts,[],faces); mesh.update()
    obj=bpy.data.objects.new(name,mesh); bpy.context.collection.objects.link(obj); obj.data.materials.append(road_mat)

for name,x,z,r in [('Commons',17,-9,5.4),('ChurchPad',20,-17,3.6),('BlacksmithPad',10,-5,3.2),('BarracksPad',25,-7,3.5)]:
    disk(name,x,z,r,road_mat)

# Bridge abutments are authored support geometry sockets.
for x,z in [(-1.2,1.0),(1.2,5.7)]:
    bpy.ops.mesh.primitive_cube_add(location=(x,z,-0.35),scale=(2.5,1.8,1.1))
    o=bpy.context.object; o.name='BridgeAbutment'; o.data.materials.append(bank_mat)

# Blender Z-up -> glTF/Godot Y-up conversion is handled by exporter.
bpy.ops.object.select_all(action='SELECT')
OUT.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(OUT), export_format='GLB', use_selection=True, export_apply=True)
print(f'AURELIAN_TERRAIN_EXPORTED={OUT}')
