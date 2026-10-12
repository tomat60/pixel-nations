#!/usr/bin/env python3
"""Reproduce Pixel Nations' two complete MIT/CC-BY donor scenes at pinned SHAs.
Build-time source staging only: do not commit donor binaries or call this an art PASS.
"""
from __future__ import annotations

import io
import re
import shutil
import urllib.request
import zipfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
GAME = REPO / "game"
STAGE = GAME / "_pn_templates"
SOURCES = (
    ("world", "Thomas-Holtvedt", "opengs", "06838d963cac06b4d345baa6cfe1293a1a237e88", ""),
    ("village", "LucasMarquesShiva", "the-free-game", "7798cd9771f99d5c99422789a9b94a69df6c3e3e", "game/"),
)
TEXT = {".gd", ".tscn", ".tres", ".gdshader", ".shader", ".material", ".theme", ".json", ".csv", ".cfg", ".txt", ".md", ".svg"}
IGNORED = {".git", ".godot", "build", "__pycache__", ".github"}
ARCHIVE_LIMIT = 110 * 1024 * 1024

def get_archive(owner: str, repo: str, sha: str) -> zipfile.ZipFile:
    url = f"https://codeload.github.com/{owner}/{repo}/zip/{sha}"
    req = urllib.request.Request(url, headers={"User-Agent": "PixelNations-Godot-Template-Staging/1"})
    with urllib.request.urlopen(req, timeout=90) as response:
        content = response.read(ARCHIVE_LIMIT + 1)
    if len(content) > ARCHIVE_LIMIT:
        raise RuntimeError(f"Donor archive exceeds scoped size bound: {owner}/{repo}")
    return zipfile.ZipFile(io.BytesIO(content))

def stage_source(kind: str, owner: str, repo: str, sha: str, subdir: str) -> None:
    target = STAGE / kind
    if target.exists():
        shutil.rmtree(target)
    target.mkdir(parents=True)
    z = get_archive(owner, repo, sha)
    names = z.namelist()
    prefix = names[0].split("/")[0] + "/"
    nested = prefix + subdir
    staged = 0
    for member in z.infolist():
        name = member.filename
        if member.is_dir() or not name.startswith(nested):
            continue
        rel = name[len(nested):]
        if not rel or any(part in IGNORED for part in Path(rel).parts):
            continue
        dest = target / rel
        if not dest.resolve().is_relative_to(target.resolve()):
            raise ValueError("Zip traversal rejected")
        dest.parent.mkdir(parents=True, exist_ok=True)
        buf = z.read(member)
        if dest.suffix.lower() in TEXT:
            try:
                content = buf.decode("utf-8")
                # Only alter absolute Godot resource references, not ordinary URLs.
                content = content.replace("res://", f"res://_pn_templates/{kind}/")
                # The original UIDs were assigned by different Godot projects;
                # new paths must take precedence during the merged import.
                if dest.suffix.lower() in {".tscn", ".tres"}:
                    content = re.sub(r' uid="uid://[^"]+"', "", content)
                buf = content.encode()
            except UnicodeDecodeError:
                pass
        dest.write_bytes(buf)
        staged += 1

    legal = STAGE / "notices" / kind
    legal.mkdir(parents=True, exist_ok=True)
    for filename in ("LICENSE", "LICENSE-ASSETS.md"):
        path = prefix + filename
        if path in names:
            (legal / filename).write_bytes(z.read(path))
    (legal / "CHANGES.txt").write_text(
        f"{owner}/{repo}@{sha}\n"
        "The full project scene and support assets were staged under _pn_templates/.\n"
        "Godot res:// references were namespaced; original project UIDs removed.\n"
        "Pixel Nations presentation and scene-entry adaptations are separate scripts.\n"
        "Upstream source/license notices retained. This is a prerelease proof.\n"
    )
    if kind == "world":
        # The source's 2-million-vertex plane is unsuitable for routine
        # software-rendered CI. Preserve full template scene, reduce only LOD.
        p = target / "map/map.tscn"
        s = p.read_text()
        s = s.replace("subdivide_width = 1999", "subdivide_width = 399")
        s = s.replace("subdivide_depth = 999", "subdivide_depth = 199")
        s = s.replace("size = Vector2i(5000, 2500)", "size = Vector2i(2000, 1000)")
        p.write_text(s)
    print(f"PN_DONOR_STAGE_{kind.upper()}=PASS files={staged} commit={sha}", flush=True)

def make_map_from_canonical_data() -> None:
    # This is CANONICAL DATA TRANSLATION, not a production-art generator.
    # The source remains app/play/lib/map-data.ts with its 30 land polygons.
    try:
        from PIL import Image, ImageDraw
    except ImportError as e:
        raise RuntimeError("Pillow must be installed only in the cloud build") from e
    source = (REPO / "app/play/lib/map-data.ts").read_text()
    plots = re.findall(r'\{ id: "[^"]+", pnid: "(PN-A01-\d{3})".*?, d: "(M[^"]+)"', source)
    if len(plots) != 30 or len(set(p for p, _ in plots)) != 30:
        raise RuntimeError(f"Canonical polygon parse failed; expected 30, got {len(plots)}")
    # Store exact per-land raster IDs for reliable click selection. RGB red = N.
    w, h = 1000, 900
    ids = Image.new("RGB", (w, h), (0, 0, 0))
    visual = Image.new("RGB", (w, h), (32, 66, 65))
    draw_id = ImageDraw.Draw(ids)
    draw_visual = ImageDraw.Draw(visual)
    palette = [(83, 113, 83), (55, 97, 79), (116, 105, 75), (92, 113, 96),
               (131, 113, 75), (81, 115, 120), (72, 106, 79), (108, 117, 77)]
    for id_, path in plots:
        index = int(id_.rsplit("-", 1)[1])
        xy = [int(v) for v in re.findall(r"-?\d+", path)]
        if len(xy) % 2 or len(xy) < 6:
            raise ValueError(f"Invalid canonical outline: {id_}")
        pts = list(zip(xy[::2], xy[1::2]))
        draw_id.polygon(pts, fill=(index, 0, 0))
        draw_visual.polygon(pts, fill=palette[(index - 1) % len(palette)],
                            outline=(163, 148, 109), width=3)
    src = STAGE / "world/map/map_data"
    ids.save(src / "pn_aurelian_land_ids.png")
    visual.save(src / "pn_aurelian_world_surface.png")
    import json
    names = re.findall(r'pnid: "(PN-A01-\d{3})", name: "([^"]+)"', source)
    if len(names) != 30:
        raise RuntimeError(f"Invalid canonical land name count: {len(names)}")
    (src / "pn_aurelian_lands.json").write_text(
        json.dumps([{"id": id_, "name": name} for id_, name in names], indent=2)
    )
    print("PN_CANONICAL_MAP_RASTER=PASS count=30", flush=True)

def patch_template_world() -> None:
    base = STAGE / "world"
    # Retain existing map renderer/3D scene and camera rather than making a new
    # dummy map scene. Overlay and gameplay come from Pixel Nations scripts.
    main = base / "game/main_game.tscn"
    s = main.read_text()
    s = s.replace("res://_pn_templates/world/game/main_game.gd",
                  "res://scenes/aurelian/pn_template_world.gd")
    main.write_text(s)
    mat = base / "map/map_shaders/map3D.tres"
    s = mat.read_text().replace("res://_pn_templates/world/map/map_data/ne2.png",
                                "res://_pn_templates/world/map/map_data/pn_aurelian_world_surface.png")
    s = s.replace("shader_parameter/terrain_saturation = 1.4000000665",
                  "shader_parameter/terrain_saturation = 1.0")
    mat.write_text(s)

def main() -> None:
    for args in SOURCES:
        stage_source(*args)
    make_map_from_canonical_data()
    patch_template_world()
    scene = STAGE / "village/scenes/approved.tscn"
    original = scene.read_text()
    target = "res://_pn_templates/village/presentation/approved_game.gd"
    if target not in original:
        raise RuntimeError("Original village scene root script not found")
    scene.write_text(original.replace(target, "res://scenes/aurelian/pn_template_village.gd"))
    assert (STAGE / "village/scenes/approved.tscn").exists(), "Complete Village missing"
    assert (STAGE / "world/game/main_game.tscn").exists(), "Complete atlas scene missing"
    for kind in ("world", "village"):
        assert (STAGE / "notices" / kind / "LICENSE").exists()
    assert (STAGE / "notices/village/LICENSE-ASSETS.md").exists()
    print("PN_COMPLETE_TEMPLATE_STAGING=PASS", flush=True)

if __name__ == "__main__":
    main()
