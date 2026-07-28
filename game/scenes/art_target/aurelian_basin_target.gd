extends Node3D

const MANIFEST_PATH := "res://art_target/kaykit/manifest.json"
var camera: Camera3D

func _ready() -> void:
    _add_environment()
    _add_terrain()
    _add_river()
    _add_road()
    _add_settlement()
    _add_camera()
    call_deferred("_capture")

func _height(x: float, z: float) -> float:
    var rz := 0.18 * x + 3.0 * sin(x / 13.0)
    var channel := -2.4 * exp(-pow(abs(z - rz) / 4.3, 2.0))
    var ridge := 7.5 * exp(-pow((x + 27.0) / 17.0, 2.0) - pow((z + 17.0) / 13.0, 2.0))
    var shoulder := 6.0 * exp(-pow((x - 31.0) / 14.0, 2.0) - pow((z - 5.0) / 20.0, 2.0))
    return channel + ridge + shoulder + 0.22 * sin(x * 0.18) * cos(z * 0.15)

func _add_environment() -> void:
    var world := WorldEnvironment.new()
    var env := Environment.new()
    env.background_mode = Environment.BG_COLOR
    env.background_color = Color("#9eb7b0")
    env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
    env.ambient_light_color = Color("#d9d0b6")
    env.ambient_light_energy = 0.72
    env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
    world.environment = env
    add_child(world)
    var sun := DirectionalLight3D.new()
    sun.rotation_degrees = Vector3(-52, -34, 0)
    sun.light_color = Color("#ffe0aa")
    sun.light_energy = 1.55
    sun.shadow_enabled = true
    add_child(sun)

func _add_terrain() -> void:
    var st := SurfaceTool.new()
    st.begin(Mesh.PRIMITIVE_TRIANGLES)
    var nx := 48
    var nz := 36
    var sx := 92.0
    var sz := 68.0
    for iz in range(nz):
        for ix in range(nx):
            var x0 := -sx/2.0 + sx * ix / nx
            var x1 := -sx/2.0 + sx * (ix+1) / nx
            var z0 := -sz/2.0 + sz * iz / nz
            var z1 := -sz/2.0 + sz * (iz+1) / nz
            var a := Vector3(x0,_height(x0,z0),z0)
            var b := Vector3(x1,_height(x1,z0),z0)
            var c := Vector3(x1,_height(x1,z1),z1)
            var d := Vector3(x0,_height(x0,z1),z1)
            for v in [a,c,b,a,d,c]: st.add_vertex(v)
    st.generate_normals()
    var node := MeshInstance3D.new()
    node.mesh = st.commit()
    var mat := StandardMaterial3D.new()
    mat.albedo_color = Color("#7f8152")
    mat.roughness = 0.96
    node.material_override = mat
    add_child(node)

func _add_river() -> void:
    var st := SurfaceTool.new()
    st.begin(Mesh.PRIMITIVE_TRIANGLES)
    for i in range(36):
        var x0 := -46.0 + 92.0 * i / 36.0
        var x1 := -46.0 + 92.0 * (i+1) / 36.0
        var z0 := 0.18*x0 + 3.0*sin(x0/13.0)
        var z1 := 0.18*x1 + 3.0*sin(x1/13.0)
        var a := Vector3(x0,-2.05,z0-2.5)
        var b := Vector3(x0,-2.05,z0+2.5)
        var c := Vector3(x1,-2.05,z1+2.5)
        var d := Vector3(x1,-2.05,z1-2.5)
        for v in [a,b,c,a,c,d]: st.add_vertex(v)
    st.generate_normals()
    var node := MeshInstance3D.new()
    node.mesh = st.commit()
    var mat := StandardMaterial3D.new()
    mat.albedo_color = Color("#2f6f70")
    mat.roughness = 0.38
    node.material_override = mat
    add_child(node)

func _road_segment(a: Vector3, b: Vector3) -> void:
    var node := MeshInstance3D.new()
    var mesh := BoxMesh.new()
    mesh.size = Vector3(2.6,0.14,a.distance_to(b))
    node.mesh = mesh
    node.position = (a+b)/2.0
    node.position.y += 0.18
    node.look_at_from_position(node.position,b,Vector3.UP)
    var mat := StandardMaterial3D.new()
    mat.albedo_color = Color("#a4875e")
    node.material_override = mat
    add_child(node)

func _add_road() -> void:
    var pts := [Vector3(2,_height(2,31),31),Vector3(1,_height(1,18),18),Vector3(0,_height(0,4),4),Vector3(7,_height(7,-4),-4),Vector3(15,_height(15,-10),-10)]
    for i in range(pts.size()-1): _road_segment(pts[i],pts[i+1])

func _manifest() -> Dictionary:
    return JSON.parse_string(FileAccess.get_file_as_string(MANIFEST_PATH))

func _place(role: String, pos: Vector3, rot_y: float, scale_value := 2.0) -> void:
    var path: String = _manifest().models[role].resource_path
    var packed = load(path)
    if packed == null:
        push_error("Missing asset: " + path)
        return
    var node: Node3D = packed.instantiate()
    node.position = pos
    node.rotation_degrees.y = rot_y
    node.scale = Vector3.ONE * scale_value
    add_child(node)

func _add_settlement() -> void:
    _place("bridge",Vector3(0,-0.9,3.4),-80,2.2)
    _place("church",Vector3(20,_height(20,-17),-17),205,2.4)
    _place("blacksmith",Vector3(10,_height(10,-5),-5),150,2.1)
    _place("barracks",Vector3(25,_height(25,-7),-7),220,2.1)
    _place("market",Vector3(16,_height(16,-8),-8),175,2.0)
    _place("house",Vector3(13,_height(13,-15),-15),200,1.9)
    _place("house",Vector3(22,_height(22,-11),-11),165,1.9)
    _place("house",Vector3(18,_height(18,-3),-3),235,1.9)
    for p in [Vector3(-31,0,-20),Vector3(-26,0,-16),Vector3(-35,0,-10),Vector3(-22,0,-24),Vector3(-17,0,-19),Vector3(-29,0,-5)]:
        p.y = _height(p.x,p.z)
        _place("tree",p,float((p.x+p.z)*9.0),2.3)
    for p in [Vector3(34,0,-9),Vector3(38,0,1),Vector3(31,0,12)]:
        p.y = _height(p.x,p.z)
        _place("rock",p,30,2.4)
    _place("mountain",Vector3(39,_height(39,8),8),15,3.0)
    var label := Label3D.new()
    label.text = "Hearthmeadow"
    label.position = Vector3(17,8,-10)
    label.font_size = 44
    label.outline_size = 10
    label.modulate = Color("#f3dfad")
    add_child(label)

func _add_camera() -> void:
    camera = Camera3D.new()
    camera.projection = Camera3D.PROJECTION_ORTHOGONAL
    camera.size = 58.0
    camera.position = Vector3(58,58,66)
    camera.look_at_from_position(camera.position,Vector3(5,0,-2),Vector3.UP)
    camera.current = true
    add_child(camera)

func _capture() -> void:
    var w := int(OS.get_environment("CAPTURE_WIDTH"))
    var h := int(OS.get_environment("CAPTURE_HEIGHT"))
    if w > 0 and h > 0:
        DisplayServer.window_set_size(Vector2i(w,h))
        if h > w: camera.size = 78.0
    await get_tree().process_frame
    await get_tree().process_frame
    await get_tree().create_timer(2.0).timeout
    var path := OS.get_environment("CAPTURE_PATH")
    if not path.is_empty():
        get_viewport().get_texture().get_image().save_png(path)
        print("CAPTURE_SAVED=" + path)
        get_tree().quit()
