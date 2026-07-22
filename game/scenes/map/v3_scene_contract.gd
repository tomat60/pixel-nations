class_name AurelianBasinV3SceneContract
extends RefCounted

const TARGET_FRAME_OCCUPANCY_MIN := 0.78
const TARGET_FRAME_OCCUPANCY_MAX := 0.86
const REQUIRED_AUTHORED_ROOTS := [
    "Environment",
    "CameraRig",
    "BasinTerrain",
    "GeographyProps",
    "Interaction",
    "ClaimedState",
    "HUDRoot",
]

static func validates_root_names(names: Array[String]) -> bool:
    for required_name in REQUIRED_AUTHORED_ROOTS:
        if not names.has(required_name):
            return false
    return true
