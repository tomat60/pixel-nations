extends "res://scenes/aurelian/world_scale_sector_generator_v4.gd"

const CONTRACT_PATH := "res://scenes/aurelian/campaign_map_terrain_mask_benchmark_v1_manifest.json"
const BENCHMARK_STILL_SIZE := Vector2i(1440, 900)

const TERRAIN_SHADER_CODE := """
shader_type spatial;

uniform sampler2D ownership_mask : filter_linear, repeat_disable;
uniform vec4 owned_tint : source_color = vec4(0.37, 0.56, 0.72, 1.0);
uniform vec4 frontier_tint : source_color = vec4(0.82, 0.72, 0.47, 1.0);
uniform vec4 rival_tint : source_color = vec4(0.65, 0.37, 0.35, 1.0);
uniform vec4 corridor_tint : source_color = vec4(0.88, 0.76, 0.45, 1.0);
uniform float owned_strength = 0.43;
uniform float frontier_strength = 0.48;
uniform float rival_strength = 0.38;
uniform float corridor_strength = 0.58;
uniform vec2 mask_texel = vec2(0.003125, 0.0041666667);

varying vec2 sector_uv;

void vertex() {
    sector_uv = vec2(0.5 + VERTEX.x / 36.0, 0.5 - VERTEX.z / 27.0);
}

void fragment() {
    float inside = step(0.0, sector_uv.x) * step(sector_uv.x, 1.0)
        * step(0.0, sector_uv.y) * step(sector_uv.y, 1.0);
    vec4 mask = texture(ownership_mask, sector_uv) * inside;
    vec4 mx = texture(ownership_mask, sector_uv + vec2(mask_texel.x, 0.0)) * inside;
    vec4 my = texture(ownership_mask, sector_uv + vec2(0.0, mask_texel.y)) * inside;

    vec3 base = COLOR.rgb;
    vec3 color = base;
    color = mix(color, mix(base, owned_tint.rgb, 0.72), mask.r * owned_strength);
    color = mix(color, mix(base, frontier_tint.rgb, 0.76), mask.g * frontier_strength);
    color = mix(color, mix(base, rival_tint.rgb, 0.72), mask.b * rival_strength);
    color = mix(color, corridor_tint.rgb, mask.a * corridor_strength);

    float owned_edge = max(abs(mask.r - mx.r), abs(mask.r - my.r));
    float frontier_edge = max(abs(mask.g - mx.g), abs(mask.g - my.g));
    float rival_edge = max(abs(mask.b - mx.b), abs(mask.b - my.b));
    vec3 edge_color = owned_tint.rgb * owned_edge
        + frontier_tint.rgb * frontier_edge
        + rival_tint.rgb * rival_edge;
    float edge_weight = clamp((owned_edge + frontier_edge + rival_edge) * 1.45, 0.0, 0.72);
    color = mix(color, edge_color, edge_weight);

    ALBEDO = color;
    ROUGHNESS = 0.96;
    METALLIC = 0.0;
    EMISSION = edge_color * 0.055 + corridor_tint.rgb * mask.a * 0.018;
}
"""

var contract: Dictionary = {}

func _ready() -> void:
	sector_spec = _read_json(SPEC_PATH)
	contract = _read_json(CONTRACT_PATH)
	if sector_spec.is_empty() or contract.is_empty():
		push_error("CAMPAIGN_MAP_TERRAIN_MASK_BENCHMARK_V1_LOAD_FAILED")
		get_tree().quit(101)
		return
	if String(contract.get("contract", "")) != "CAMPAIGN_MAP_TERRAIN_MASK_BENCHMARK_V1":
		push_error("CAMPAIGN_MAP_TERRAIN_MASK_BENCHMARK_V1_CONTRACT_INVALID")
		get_tree().quit(102)
		return
	evidence_dir = OS.get_environment("AURELIAN_EVIDENCE_DIR")
	if OS.get_environment("AURELIAN_CAPTURE_CAMPAIGN_MAP_TERRAIN_MASK_BENCHMARK_V1") == "1":
		call_deferred("_capture_benchmark")
		return
	if not _populate_benchmark_world(self):
		return
	var camera := _make_camera(self)
	camera.make_current()

func _packed_points(value: Variant) -> PackedVector2Array:
	var result := PackedVector2Array()
	if not value is Array:
		return result
	for item_variant in value:
		if item_variant is Array and item_variant.size() == 2:
			result.append(Vector2(float(item_variant[0]), float(item_variant[1])))
	return result

func _point_in_polygon(point: Vector2, polygon: PackedVector2Array) -> bool:
	if polygon.size() < 3:
		return false
	var inside := false
	var j := polygon.size() - 1
	for i in range(polygon.size()):
		var pi := polygon[i]
		var pj := polygon[j]
		if ((pi.y > point.y) != (pj.y > point.y)):
			var denom := pj.y - pi.y
			if abs(denom) > 0.000001:
				var crossing_x := (pj.x - pi.x) * (point.y - pi.y) / denom + pi.x
				if point.x < crossing_x:
					inside = not inside
		j = i
	return inside

func _segment_distance(point: Vector2, a: Vector2, b: Vector2) -> float:
	var ab := b - a
	var denom := ab.length_squared()
	if denom <= 0.000001:
		return point.distance_to(a)
	var t: float = clampf((point - a).dot(ab) / denom, 0.0, 1.0)
	return point.distance_to(a + ab * t)

func _make_mask_texture() -> ImageTexture:
	var mask_size_data: Array = contract.get("mask_size", [320, 240])
	var width := int(mask_size_data[0])
	var height := int(mask_size_data[1])
	var image := Image.create(width, height, false, Image.FORMAT_RGBA8)
	image.fill(Color(0.0, 0.0, 0.0, 0.0))

	var plane: Array = sector_spec.get("sector_plane", [3600, 2700])
	var sector_width := float(plane[0])
	var sector_height := float(plane[1])
	var regions: Dictionary = contract.get("regions", {})
	var owned := _packed_points((regions.get("owned", {}) as Dictionary).get("points", []))
	var frontier := _packed_points((regions.get("frontier", {}) as Dictionary).get("points", []))
	var rival := _packed_points((regions.get("rival", {}) as Dictionary).get("points", []))
	var corridor: Dictionary = contract.get("expansion_corridor", {})
	var from_data: Array = corridor.get("from", [0, 0])
	var to_data: Array = corridor.get("to", [0, 0])
	var corridor_from := Vector2(float(from_data[0]), float(from_data[1]))
	var corridor_to := Vector2(float(to_data[0]), float(to_data[1]))
	var corridor_width := float(corridor.get("width", 100.0))

	for y in range(height):
		for x in range(width):
			var point := Vector2(
				(float(x) + 0.5) / float(width) * sector_width,
				(float(y) + 0.5) / float(height) * sector_height
			)
			var owned_value := 1.0 if _point_in_polygon(point, owned) else 0.0
			var frontier_value := 1.0 if _point_in_polygon(point, frontier) else 0.0
			var rival_value := 1.0 if _point_in_polygon(point, rival) else 0.0
			var corridor_distance := _segment_distance(point, corridor_from, corridor_to)
			var corridor_value: float = clampf(1.0 - corridor_distance / corridor_width, 0.0, 1.0)
			corridor_value = corridor_value * corridor_value
			image.set_pixel(x, y, Color(owned_value, frontier_value, rival_value, corridor_value))

	return ImageTexture.create_from_image(image)

func _apply_terrain_mask(parent: Node) -> bool:
	var terrain := parent.find_child("AurelianSectorGeneratorV4Terrain", true, false) as MeshInstance3D
	if terrain == null or terrain.mesh == null:
		push_error("CAMPAIGN_MAP_TERRAIN_MASK_BENCHMARK_V1_TERRAIN_MISSING")
		return false
	var shader := Shader.new()
	shader.code = TERRAIN_SHADER_CODE
	var material := ShaderMaterial.new()
	material.shader = shader
	material.set_shader_parameter("ownership_mask", _make_mask_texture())
	var regions: Dictionary = contract.get("regions", {})
	var owned: Dictionary = regions.get("owned", {})
	var frontier: Dictionary = regions.get("frontier", {})
	var rival: Dictionary = regions.get("rival", {})
	var corridor: Dictionary = contract.get("expansion_corridor", {})
	material.set_shader_parameter("owned_tint", Color(String(owned.get("tint", "#5f8fb8"))))
	material.set_shader_parameter("frontier_tint", Color(String(frontier.get("tint", "#d2b878"))))
	material.set_shader_parameter("rival_tint", Color(String(rival.get("tint", "#a65f58"))))
	material.set_shader_parameter("corridor_tint", Color(String(corridor.get("tint", "#e0c174"))))
	material.set_shader_parameter("owned_strength", float(owned.get("strength", 0.43)))
	material.set_shader_parameter("frontier_strength", float(frontier.get("strength", 0.48)))
	material.set_shader_parameter("rival_strength", float(rival.get("strength", 0.38)))
	material.set_shader_parameter("corridor_strength", float(corridor.get("strength", 0.58)))
	var mask_size_data: Array = contract.get("mask_size", [320, 240])
	material.set_shader_parameter("mask_texel", Vector2(1.0 / float(mask_size_data[0]), 1.0 / float(mask_size_data[1])))
	for surface in range(terrain.mesh.get_surface_count()):
		terrain.set_surface_override_material(surface, material)
	return true

func _populate_benchmark_world(parent: Node) -> bool:
	if not super._populate_world(parent):
		return false
	return _apply_terrain_mask(parent)

func _capture_benchmark() -> void:
	if evidence_dir.is_empty():
		push_error("CAMPAIGN_MAP_TERRAIN_MASK_BENCHMARK_V1_MISSING_EVIDENCE_DIR")
		get_tree().quit(103)
		return
	DirAccess.make_dir_recursive_absolute(evidence_dir)
	var viewport := SubViewport.new()
	viewport.name = "CampaignMapTerrainMaskBenchmarkViewport"
	viewport.size = BENCHMARK_STILL_SIZE
	viewport.own_world_3d = true
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	viewport.render_target_clear_mode = SubViewport.CLEAR_MODE_ALWAYS
	viewport.transparent_bg = false
	add_child(viewport)
	var scene_root := Node3D.new()
	scene_root.name = "CampaignMapTerrainMaskBenchmarkWorld"
	viewport.add_child(scene_root)
	if not _populate_benchmark_world(scene_root):
		get_tree().quit(104)
		return
	var camera := _make_camera(scene_root)
	camera.make_current()
	for _frame in range(16):
		await get_tree().process_frame
	await RenderingServer.frame_post_draw
	var image := viewport.get_texture().get_image()
	if image == null or image.is_empty() or image.get_size() != BENCHMARK_STILL_SIZE:
		push_error("CAMPAIGN_MAP_TERRAIN_MASK_BENCHMARK_V1_CAPTURE_FAILED")
		get_tree().quit(105)
		return
	var output_path := evidence_dir.path_join("campaign-map-terrain-mask-benchmark-v1-1440x900.png")
	if image.save_png(output_path) != OK:
		push_error("CAMPAIGN_MAP_TERRAIN_MASK_BENCHMARK_V1_SAVE_FAILED")
		get_tree().quit(106)
		return
	print("CAMPAIGN_MAP_TERRAIN_MASK_BENCHMARK_V1_STILL=%s" % output_path)
	print("CAMPAIGN_MAP_TERRAIN_MASK_BENCHMARK_V1_MASK=runtime_dynamic")
	get_tree().quit(0)
