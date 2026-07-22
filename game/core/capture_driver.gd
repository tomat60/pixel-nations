extends Node

func _ready() -> void:
    if OS.get_environment("PIXEL_NATIONS_CAPTURE_MODE") != "1":
        return
    call_deferred("_run_capture_sequence")

func _run_capture_sequence() -> void:
    await get_tree().create_timer(3.0).timeout
    var scene := get_tree().current_scene
    if scene != null and scene.has_method("_claim_selected_land"):
        scene.call("_claim_selected_land")
