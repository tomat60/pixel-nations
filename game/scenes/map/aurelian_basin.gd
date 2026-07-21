extends Node3D

const GameState = preload("res://core/game_state.gd")
const SAVE_PATH := "user://aurelian_basin_save.json"
const CLAIMABLE_ID := "A-01-0042"

var state: Dictionary = GameState.initial_state()
var parcels: Dictionary = {}
var hovered_id := ""
var selected_id := ""

var camera: Camera3D
var selected_label: Label
var trait_label: Label
var status_label: Label
var claim_button: Button

const PARCEL_DATA := [
	{"id": CLAIMABLE_ID, "name": "Hearthmeadow", "trait": "Fertile riverside plain", "pos": Vector3(-1.75, 0.0, 1.15), "height": 0.75, "claimable": true},
	{"id": "A-01-0041", "name": "Northwood", "trait": "Dense timber ridge", "pos": Vector3(-1.75, 0.0, -2.45), "height": 1.05, "claimable": false},
	{"id": "A-01-0043", "name": "Amber Ford", "trait": "Shallow river crossing", "pos": Vector3(1.45, 0.0, -0.65), "height": 0.55, "claimable": false},
	{"id": "A-01-0036", "name": "Westwatch", "trait": "Raised western approach", "pos": Vector3(-4.95, 0.0, -0.65), "height": 1.25, "claimable": false},
	{"id": "A-01-0048", "name": "Sunfield", "trait": "Open southern grassland", "pos": Vector3(1.45, 0.0, 2.95), "height": 0.65, "claimable": false},
	{"id": "A-01-0037", "name": "Stonewake", "trait": "Rocky basin shoulder", "pos": Vector3(1.45, 0.0, -4.25), "height": 1.45, "claimable": false},
	{"id": "A-01-0047", "name": "Willowbank", "trait": "Sheltered river bend", "pos": Vector3(-4.95, 0.0, 2.95), "height": 0.85, "claimable": false},
]

func _ready() -> void:
	_load_state()
	_build_environment()
	_build_basin()
	_build_hud()
	_refresh_all_visuals()
	set_process_unhandled_input(true)

func _build_environment() -> void:
	var world_environment := WorldEnvironment.new()
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color("9aa68b")
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("d8c8aa")
	environment.ambient_light_energy = 0.7
	environment.fog_enabled = true
	environment.fog_light_color = Color("c8c5ae")
	environment.fog_density = 0.012
	world_environment.environment = environment
	add_child(world_environment)

	var sun := DirectionalLight3D.new()
	sun.name = "Sun"
	sun.rotation_degrees = Vector3(-52.0, -32.0, 0.0)
	sun.light_color = Color("ffe1ad")
	sun.light_energy = 1.15
	sun.shadow_enabled = true
	add_child(sun)

	camera = Camera3D.new()
	camera.name = "Camera3D"
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.size = 17.8
	camera.position = Vector3(12.5, 14.0, 12.5)
	camera.look_at(Vector3(-1.4, 0.0, -0.6), Vector3.UP)
	camera.current = true
	add_child(camera)

func _build_basin() -> void:
	var base := MeshInstance3D.new()
	base.name = "BasinBase"
	var base_mesh := CylinderMesh.new()
	base_mesh.top_radius = 8.7
	base_mesh.bottom_radius = 9.2
	base_mesh.height = 0.55
	base_mesh.radial_segments = 12
	base.mesh = base_mesh
	base.position = Vector3(-1.7, -0.45, -0.65)
	base.material_override = _material(Color("6e7d4c"), 0.75)
	add_child(base)

	_build_river()
	_build_routes()

	for parcel_data in PARCEL_DATA:
		_build_parcel(parcel_data)

	_build_scenery()

func _build_parcel(data: Dictionary) -> void:
	var parcel_root := StaticBody3D.new()
	parcel_root.name = String(data.id)
	parcel_root.position = data.pos
	parcel_root.set_meta("land_id", data.id)

	var mesh_instance := MeshInstance3D.new()
	mesh_instance.name = "Terrain"
	var mesh := CylinderMesh.new()
	mesh.top_radius = 2.25
	mesh.bottom_radius = 2.38
	mesh.height = float(data.height)
	mesh.radial_segments = 6
	mesh_instance.mesh = mesh
	mesh_instance.position.y = float(data.height) * 0.5
	parcel_root.add_child(mesh_instance)

	var collision := CollisionShape3D.new()
	var shape := CylinderShape3D.new()
	shape.radius = 2.25
	shape.height = float(data.height) + 0.3
	collision.shape = shape
	collision.position.y = float(data.height) * 0.5
	parcel_root.add_child(collision)

	var marker := MeshInstance3D.new()
	marker.name = "SelectionMarker"
	var marker_mesh := CylinderMesh.new()
	marker_mesh.top_radius = 2.0
	marker_mesh.bottom_radius = 2.0
	marker_mesh.height = 0.035
	marker_mesh.radial_segments = 6
	marker.mesh = marker_mesh
	marker.position.y = float(data.height) + 0.025
	marker.material_override = _material(Color("d9aa55"), 0.15)
	marker.visible = false
	parcel_root.add_child(marker)

	var flag_root := Node3D.new()
	flag_root.name = "ClaimFlag"
	flag_root.position = Vector3(0.55, float(data.height) + 0.05, -0.25)
	flag_root.visible = false
	var pole := MeshInstance3D.new()
	var pole_mesh := CylinderMesh.new()
	pole_mesh.top_radius = 0.035
	pole_mesh.bottom_radius = 0.045
	pole_mesh.height = 1.6
	pole_mesh.radial_segments = 8
	pole.mesh = pole_mesh
	pole.position.y = 0.8
	pole.material_override = _material(Color("5d4632"), 0.55)
	flag_root.add_child(pole)
	var banner := MeshInstance3D.new()
	var banner_mesh := BoxMesh.new()
	banner_mesh.size = Vector3(0.72, 0.38, 0.05)
	banner.mesh = banner_mesh
	banner.position = Vector3(0.34, 1.25, 0.0)
	banner.material_override = _material(Color("a85e35"), 0.35)
	flag_root.add_child(banner)
	parcel_root.add_child(flag_root)

	add_child(parcel_root)
	parcels[data.id] = {
		"root": parcel_root,
		"mesh": mesh_instance,
		"marker": marker,
		"flag": flag_root,
		"data": data,
	}

func _build_river() -> void:
	var river_points := [
		Vector3(-7.0, 0.05, -4.9), Vector3(-4.8, 0.07, -3.1), Vector3(-2.6, 0.08, -1.9),
		Vector3(-0.2, 0.07, -0.4), Vector3(2.0, 0.06, 1.4), Vector3(4.0, 0.05, 3.2),
	]
	for index in river_points.size() - 1:
		var start: Vector3 = river_points[index]
		var finish: Vector3 = river_points[index + 1]
		var segment := MeshInstance3D.new()
		segment.name = "RiverSegment%d" % index
		var river_mesh := BoxMesh.new()
		var length := start.distance_to(finish)
		river_mesh.size = Vector3(0.78, 0.08, length)
		segment.mesh = river_mesh
		segment.position = (start + finish) * 0.5
		segment.look_at(finish, Vector3.UP)
		segment.material_override = _material(Color("4f7f82"), 0.25)
		add_child(segment)

func _build_routes() -> void:
	var routes := [
		[Vector3(-5.7, 0.28, 4.1), Vector3(-1.7, 0.76, 1.1)],
		[Vector3(-1.7, 0.76, 1.1), Vector3(1.6, 0.66, 3.0)],
		[Vector3(-1.7, 0.76, 1.1), Vector3(1.4, 0.56, -0.7)],
	]
	for index in routes.size():
		var start: Vector3 = routes[index][0]
		var finish: Vector3 = routes[index][1]
		var path_mesh_instance := MeshInstance3D.new()
		var path_mesh := BoxMesh.new()
		path_mesh.size = Vector3(0.24, 0.05, start.distance_to(finish))
		path_mesh_instance.mesh = path_mesh
		path_mesh_instance.position = (start + finish) * 0.5
		path_mesh_instance.look_at(finish, Vector3.UP)
		path_mesh_instance.material_override = _material(Color("9b845e"), 0.65)
		add_child(path_mesh_instance)

func _build_scenery() -> void:
	var tree_positions := [
		Vector3(-3.7, 1.0, -3.0), Vector3(-2.6, 1.0, -3.4), Vector3(-4.2, 1.0, 2.0),
		Vector3(2.6, 1.0, -3.8), Vector3(2.5, 1.0, 2.7), Vector3(-5.9, 1.0, -1.2),
	]
	for pos in tree_positions:
		var tree := Node3D.new()
		tree.position = pos
		var trunk := MeshInstance3D.new()
		var trunk_mesh := CylinderMesh.new()
		trunk_mesh.top_radius = 0.09
		trunk_mesh.bottom_radius = 0.12
		trunk_mesh.height = 0.75
		trunk_mesh.radial_segments = 6
		trunk.mesh = trunk_mesh
		trunk.position.y = 0.37
		trunk.material_override = _material(Color("604b36"), 0.65)
		tree.add_child(trunk)
		var crown := MeshInstance3D.new()
		var crown_mesh := CylinderMesh.new()
		crown_mesh.top_radius = 0.05
		crown_mesh.bottom_radius = 0.55
		crown_mesh.height = 1.15
		crown_mesh.radial_segments = 7
		crown.mesh = crown_mesh
		crown.position.y = 1.15
		crown.material_override = _material(Color("49613f"), 0.75)
		tree.add_child(crown)
		add_child(tree)

func _build_hud() -> void:
	var canvas := CanvasLayer.new()
	canvas.name = "HUD"
	add_child(canvas)

	var title_panel := PanelContainer.new()
	title_panel.position = Vector2(28, 24)
	title_panel.size = Vector2(360, 118)
	canvas.add_child(title_panel)
	var title_box := VBoxContainer.new()
	title_box.add_theme_constant_override("separation", 4)
	title_panel.add_child(title_box)
	var title := Label.new()
	title.text = "AURELIAN BASIN · SECTOR A-01"
	title.add_theme_font_size_override("font_size", 20)
	title_box.add_child(title)
	selected_label = Label.new()
	selected_label.text = "Inspect a land"
	selected_label.add_theme_font_size_override("font_size", 17)
	title_box.add_child(selected_label)
	trait_label = Label.new()
	trait_label.text = "Move the pointer across the basin"
	title_box.add_child(trait_label)

	var action_panel := PanelContainer.new()
	action_panel.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	action_panel.position = Vector2(-330, -138)
	action_panel.size = Vector2(300, 104)
	canvas.add_child(action_panel)
	var action_box := VBoxContainer.new()
	action_box.add_theme_constant_override("separation", 8)
	action_panel.add_child(action_box)
	status_label = Label.new()
	status_label.text = "One land may become your realm."
	action_box.add_child(status_label)
	claim_button = Button.new()
	claim_button.text = "CLAIM LAND"
	claim_button.disabled = true
	claim_button.pressed.connect(_claim_selected_land)
	action_box.add_child(claim_button)

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseMotion:
		_update_hover(event.position)
	elif event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
		_select_under_pointer(event.position)

func _update_hover(screen_position: Vector2) -> void:
	var land_id := _pick_land(screen_position)
	if land_id == hovered_id:
		return
	hovered_id = land_id
	_refresh_all_visuals()
	if selected_id.is_empty() and not hovered_id.is_empty():
		_show_land_details(hovered_id)

func _select_under_pointer(screen_position: Vector2) -> void:
	var land_id := _pick_land(screen_position)
	if land_id.is_empty():
		selected_id = ""
		_show_default_details()
	else:
		selected_id = land_id
		_show_land_details(land_id)
	_refresh_all_visuals()

func _pick_land(screen_position: Vector2) -> String:
	var origin := camera.project_ray_origin(screen_position)
	var direction := camera.project_ray_normal(screen_position)
	var query := PhysicsRayQueryParameters3D.create(origin, origin + direction * 100.0)
	query.collide_with_areas = false
	query.collide_with_bodies = true
	var result := get_world_3d().direct_space_state.intersect_ray(query)
	if result.is_empty():
		return ""
	var collider = result.get("collider")
	if collider and collider.has_meta("land_id"):
		return String(collider.get_meta("land_id"))
	return ""

func _claim_selected_land() -> void:
	if selected_id != CLAIMABLE_ID or _is_claimed():
		return
	state = GameState.reduce(state, {"type": "CLAIM_LAND", "land_id": selected_id})
	_save_state()
	status_label.text = "Hearthmeadow claimed · the first banner is raised."
	claim_button.disabled = true
	_refresh_all_visuals()

func _refresh_all_visuals() -> void:
	for land_id in parcels.keys():
		var parcel: Dictionary = parcels[land_id]
		var data: Dictionary = parcel.data
		var base_color := Color("7f8b56")
		if float(data.height) > 1.1:
			base_color = Color("747654")
		elif String(data.id) == CLAIMABLE_ID:
			base_color = Color("8f985c")
		var roughness := 0.78
		parcel.marker.visible = false
		parcel.flag.visible = false
		if String(land_id) == hovered_id:
			base_color = base_color.lightened(0.08)
		if String(land_id) == selected_id:
			base_color = base_color.lightened(0.13)
			parcel.marker.visible = true
		if String(land_id) == CLAIMABLE_ID and _is_claimed():
			base_color = Color("9b8d50")
			parcel.flag.visible = true
		parcel.mesh.material_override = _material(base_color, roughness)
	_update_claim_button()

func _update_claim_button() -> void:
	if claim_button == null:
		return
	claim_button.disabled = selected_id != CLAIMABLE_ID or _is_claimed()
	claim_button.text = "CLAIMED" if _is_claimed() else "CLAIM LAND"

func _show_land_details(land_id: String) -> void:
	if not parcels.has(land_id):
		_show_default_details()
		return
	var data: Dictionary = parcels[land_id].data
	selected_label.text = "%s · %s" % [data.name, data.id]
	trait_label.text = data.trait
	if land_id == CLAIMABLE_ID:
		status_label.text = "Claimed land" if _is_claimed() else "A viable first holding."
	else:
		status_label.text = "Locked · establish your first holding nearby."

func _show_default_details() -> void:
	selected_label.text = "Inspect a land"
	trait_label.text = "Move the pointer across the basin"
	status_label.text = "One land may become your realm."

func _is_claimed() -> bool:
	return String(state.get("claimed_land_id", "")) == CLAIMABLE_ID

func _load_state() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		return
	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file == null:
		return
	var loaded := GameState.from_json(file.get_as_text())
	if loaded is Dictionary and int(loaded.get("schema_version", 0)) == GameState.SCHEMA_VERSION:
		state = loaded

func _save_state() -> void:
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file != null:
		file.store_string(GameState.to_json(state))

func _material(color: Color, roughness: float) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.roughness = roughness
	material.metallic = 0.0
	return material
