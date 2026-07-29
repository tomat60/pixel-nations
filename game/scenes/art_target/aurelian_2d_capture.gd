extends Node2D

const TEXTURES := {
    "desktop": "res://art_target/aurelian_2d/aurelian-desktop.png",
    "portrait": "res://art_target/aurelian_2d/aurelian-portrait.png",
}

var capture_mode: String
var contract_path: String
var map_sprite: Sprite2D
var map_texture: Texture2D

func _ready() -> void:
    capture_mode = OS.get_environment("CAPTURE_MODE")
    contract_path = OS.get_environment("CONTRACT_PATH")
    var width := int(OS.get_environment("CAPTURE_WIDTH"))
    var height := int(OS.get_environment("CAPTURE_HEIGHT"))
    if not TEXTURES.has(capture_mode):
        push_error("Unsupported CAPTURE_MODE: " + capture_mode)
        get_tree().quit(21)
        return
    if width <= 0 or height <= 0 or contract_path.is_empty():
        push_error("Invalid 2D capture contract environment")
        get_tree().quit(22)
        return

    RenderingServer.set_default_clear_color(Color("#1d2524"))
    get_window().size = Vector2i(width, height)
    map_texture = load(TEXTURES[capture_mode]) as Texture2D
    if map_texture == null:
        push_error("Failed to load accepted Aurelian texture: " + TEXTURES[capture_mode])
        get_tree().quit(23)
        return
    if map_texture.get_width() != width or map_texture.get_height() != height:
        push_error("Accepted texture dimensions do not match capture dimensions")
        get_tree().quit(24)
        return

    map_sprite = Sprite2D.new()
    map_sprite.name = "AurelianAcceptedMap"
    map_sprite.texture = map_texture
    map_sprite.centered = false
    map_sprite.position = Vector2.ZERO
    map_sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
    add_child(map_sprite)
    call_deferred("_write_contract")

func _write_contract() -> void:
    await get_tree().process_frame
    await RenderingServer.frame_post_draw
    var viewport_size := get_viewport().get_visible_rect().size
    var contract := {
        "mode": capture_mode,
        "capture_backend": "godot_movie_writer_canvas_2d",
        "texture_resource": TEXTURES[capture_mode],
        "texture_width": map_texture.get_width(),
        "texture_height": map_texture.get_height(),
        "viewport_width": int(viewport_size.x),
        "viewport_height": int(viewport_size.y),
        "window_width": get_window().size.x,
        "window_height": get_window().size.y,
        "sprite_position": [map_sprite.position.x, map_sprite.position.y],
        "sprite_centered": map_sprite.centered,
        "texture_filter": "nearest",
        "canvas_item_count": 1,
        "node_3d_count": 0,
    }
    var file := FileAccess.open(contract_path, FileAccess.WRITE)
    if file == null:
        push_error("Failed to open 2D contract output")
        get_tree().quit(25)
        return
    file.store_string(JSON.stringify(contract, "  ") + "\n")
    print("AURELIAN_2D_MAP_READY=" + capture_mode)
    print("AURELIAN_2D_CONTRACT_SAVED=" + contract_path)
