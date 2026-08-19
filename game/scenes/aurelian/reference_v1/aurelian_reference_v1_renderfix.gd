extends "res://scenes/aurelian/reference_v1/aurelian_reference_v1.gd"

func _vertex_color_material(roughness: float) -> StandardMaterial3D:
	var material := super._vertex_color_material(roughness)
	material.cull_mode = BaseMaterial3D.CULL_DISABLED
	return material

func _build_water() -> void:
	var river := MeshInstance3D.new()
	river.name = "RiverWater"
	var outflow_points: Array = RIVER_POINTS.duplicate()
	outflow_points.append(Vector2(620, 980))
	outflow_points.append(Vector2(650, 1080))
	outflow_points.append(Vector2(690, 1200))
	river.mesh = _ribbon_mesh(_resample_polyline(outflow_points, 7), 0.80, 4.20, -0.075)
	var water_material := _material(COLOR_WATER, 0.32)
	water_material.cull_mode = BaseMaterial3D.CULL_DISABLED
	river.material_override = water_material
	add_child(river)
