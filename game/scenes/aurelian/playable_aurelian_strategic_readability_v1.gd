extends "res://scenes/aurelian/playable_aurelian_first_session_v6.gd"

const MAP_CAMERA_SIZE := 19.0
const WORLD_CAMERA_SIZE := 25.6
const GREENVALE_MICRODETAIL := [
	"Greenvale_cottage_west",
	"Greenvale_cottage_south",
	"Greenvale_workshop_north",
	"Greenvale_cottage_east",
	"Greenvale_cottage_lane",
	"Greenvale_storehouse_fields",
	"Greenvale_workshop_crossing",
	"Greenvale_shrine_green",
	"Greenvale_gatehouse_road",
	"Greenvale_market_hall",
	"Greenvale_civic_house_west",
	"Greenvale_civic_house_east",
	"Greenvale_watchtower",
	"Greenvale_archive",
]
const MAP_ANCHORS := ["Greenvale_flag", "Greenvale_blacksmith", "Greenvale_barracks", "Greenvale_church", "Greenvale_city_hall"]
const MAP_LABEL_POLICY := {
	"map_east_route_claimed": [],
	"map_greenvale_city": [],
	"map_aurelian_imperial_heartland": ["ImperialHeartlandLabel"],
	"map_first_imperial_expansion_two_lands_claimed": ["NorthRidgeClaimLabel"],
}
const WORLD_LABEL_POLICY := {
	"world_first_city_recognized": ["StrategicLabel"],
	"world_first_nation_founded": ["StrategicLabel", "NationLabel"],
	"world_first_empire_proclaimed": ["FirstEmpireLabel"],
	"world_first_imperial_expansion_two_land_footprint": ["NorthRidgeClaimLabel"],
}

func _ready() -> void:
	super()
	if not cameras.is_empty():
		_apply_strategic_readability(entry_state)

func _apply_entry_state(state_name: String) -> void:
	super(state_name)
	if not cameras.is_empty():
		_apply_strategic_readability(state_name)

func _apply_strategic_readability(state_name: String) -> void:
	_restore_strategic_labels(self)
	if state_name.begins_with("village_"):
		return
	if state_name.begins_with("map_"):
		_set_camera_size("map", MAP_CAMERA_SIZE)
		_reduce_greenvale_microdetail(false)
		_apply_label_policy(self, MAP_LABEL_POLICY.get(state_name, []))
		return
	if state_name.begins_with("world_"):
		_set_camera_size("world", WORLD_CAMERA_SIZE)
		_reduce_greenvale_microdetail(true)
		_apply_label_policy(self, WORLD_LABEL_POLICY.get(state_name, []))

func _set_camera_size(preset: String, size: float) -> void:
	if cameras.has(preset):
		(cameras[preset] as Camera3D).size = size

func _reduce_greenvale_microdetail(world_view: bool) -> void:
	for node_name in GREENVALE_MICRODETAIL:
		var node := main_basin.find_child(node_name, true, false) as Node3D
		if node != null:
			node.visible = false
	if world_view:
		for node_name in MAP_ANCHORS:
			if node_name == "Greenvale_flag":
				continue
			var node := main_basin.find_child(node_name, true, false) as Node3D
			if node != null:
				node.visible = false

func _restore_strategic_labels(root: Node) -> void:
	if root is Label3D:
		(root as Label3D).visible = true
	for child in root.get_children():
		_restore_strategic_labels(child)

func _apply_label_policy(root: Node, allowed: Array) -> void:
	if root is Label3D:
		var label := root as Label3D
		label.visible = allowed.has(label.name)
	for child in root.get_children():
		_apply_label_policy(child, allowed)
