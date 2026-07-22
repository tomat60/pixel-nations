class_name PixelNationsVisualLanguage
extends RefCounted

const ACCENT_GOLD := Color("c8a45a")
const ACCENT_AURELIAN_RED := Color("7a3028")
const UI_INK := Color("111820")
const UI_INK_SOFT := Color("1b252d")
const UI_TEXT := Color("e8e1d1")
const UI_TEXT_MUTED := Color("aab0aa")

const TERRAIN_GRASS := Color("718054")
const TERRAIN_MEADOW := Color("879565")
const TERRAIN_SOIL := Color("a48156")
const TERRAIN_STONE := Color("756f66")
const TERRAIN_WATER := Color("4d7378")
const TERRAIN_LOCKED_OVERLAY := Color(0.23, 0.29, 0.31, 0.34)
const TERRAIN_HOVER_OVERLAY := Color(0.84, 0.68, 0.32, 0.18)
const TERRAIN_SELECTED_OVERLAY := Color(0.92, 0.70, 0.25, 0.31)
const TERRAIN_CLAIMED_OVERLAY := Color(0.49, 0.16, 0.12, 0.22)

const SCALE_GRAMMAR := {
    "land": {
        "camera": "fixed orthographic diorama",
        "primary_read": "geography and one claimable origin",
        "identity_marker": "founder flag and first-settlement footprint",
        "ui_rule": "one compact land card",
    },
    "settlement_city": {
        "camera": "same azimuth, closer orthographic framing",
        "primary_read": "roads, buildings and visible growth stages",
        "identity_marker": "same founder flag, banner colours and terrain palette",
        "ui_rule": "orders and construction only when contextual",
    },
    "nation": {
        "camera": "regional orthographic overview",
        "primary_read": "connected lands, borders, routes and capital hierarchy",
        "identity_marker": "same heraldry and antique-gold interaction language",
        "ui_rule": "territorial decisions, not dashboard tables",
    },
    "world_atlas": {
        "camera": "strategic atlas overview",
        "primary_read": "10,000-land world and Sector A-01 location",
        "identity_marker": "same region colours, route language and founder heraldry",
        "ui_rule": "atlas context first; no fake full-world clickable grid",
    },
}

static func overlay_for_state(state_name: String) -> Color:
    match state_name:
        "hovered":
            return TERRAIN_HOVER_OVERLAY
        "selected":
            return TERRAIN_SELECTED_OVERLAY
        "claimed":
            return TERRAIN_CLAIMED_OVERLAY
        "locked":
            return TERRAIN_LOCKED_OVERLAY
        _:
            return Color(0, 0, 0, 0)
