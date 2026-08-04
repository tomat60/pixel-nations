#!/usr/bin/env python3
from pathlib import Path

path = Path("tools/blender/aurelian_staged_progression.py")
text = path.read_text()

replacements = [
    (
        '            "spur": [(-2, 8), (5, 20), (9, 31), (12, 42)],\n',
        '            "spur": [(-2, 8), (5, 20), (9, 31), (12, 42)],\n'
        '            "shelter_spur": [(12, 42), (13, 46), (15, 49), (18, 51)],\n',
    ),
    (
        '            "spur": [(1, -4), (3, 16), (5, 34), (8, 50)],\n',
        '            "spur": [(1, -4), (3, 16), (5, 34), (8, 50)],\n'
        '            "shelter_spur": [(8, 50), (11, 52), (15, 54), (18, 55)],\n',
    ),
    (
        '        keep = {"flag_red", "crate_big", "lumber", "sack", "barrel"}\n',
        '        keep = {"tent", "flag_red", "crate_big", "lumber", "sack", "barrel", "wheelbarrow"}\n',
    ),
    (
        '    base.create_ribbon("RoadSettlement", mode, state_road_after(layout, state), 5.0, materials["road"], z_offset=0.12)\n'
        '    low_bridge(layout["bridge"], materials)\n',
        '    base.create_ribbon("RoadSettlement", mode, state_road_after(layout, state), 5.0, materials["road"], z_offset=0.12)\n'
        '    if state == "first_shelter":\n'
        '        base.create_ribbon("ShelterPath", mode, layout["camp"]["shelter_spur"], 3.6, materials["road"], z_offset=0.14)\n'
        '    low_bridge(layout["bridge"], materials)\n',
    ),
]

for old, new in replacements:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"correction replacement mismatch: expected 1, got {count}: {old!r}")
    text = text.replace(old, new, 1)

path.write_text(text)
print("AURELIAN_M1_VISUAL_CORRECTION_APPLIED")
