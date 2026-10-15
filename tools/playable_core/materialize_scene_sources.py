#!/usr/bin/env python3
"""Materialize the pinned OpenGS + village donors into one reviewable Godot tree.

The output is deliberately not a Pixel Nations product candidate. It proves that
the immutable upstream sources and their notices can be reproduced without
checking hundreds of megabytes of donor files into this repository. The missing
Pixel Nations transform/navigation layer must be supplied and reviewed separately.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import tempfile


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_SPEC = ROOT / "game" / "integration" / "playable_scene_sources.json"
CANONICAL_MAP_DATA = ROOT / "app" / "play" / "lib" / "map-data.ts"
RUNTIME_SOURCE = ROOT / "tools" / "playable_core" / "runtime"
ATLAS_SOURCE = ROOT / "public" / "assets" / "world-map" / "aurelian-basin-v1.png"
TEXT_SUFFIXES = {
    ".cfg", ".css", ".gd", ".gdshader", ".glsl", ".godot", ".html",
    ".import", ".js", ".json", ".md", ".py", ".shader", ".svg",
    ".tres", ".tscn", ".txt", ".uid",
}


class SourceError(RuntimeError):
    pass


def run(*args: str, cwd: Path | None = None) -> str:
    completed = subprocess.run(
        args, cwd=cwd, check=False, text=True, stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if completed.returncode:
        raise SourceError(
            f"command failed ({completed.returncode}): {' '.join(args)}\n"
            f"{completed.stderr.strip()}"
        )
    return completed.stdout


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def clone_pinned(repository: str, commit: str, destination: Path) -> None:
    run("git", "clone", "--filter=blob:none", "--no-checkout", repository, str(destination))
    run("git", "checkout", "--detach", commit, cwd=destination)
    actual = run("git", "rev-parse", "HEAD", cwd=destination).strip()
    if actual != commit:
        raise SourceError(f"commit mismatch: expected {commit}, got {actual}")


def require_paths(source: Path, paths: list[str], label: str) -> None:
    missing = [path for path in paths if not (source / path).is_file()]
    if missing:
        raise SourceError(f"{label} missing required paths: {', '.join(missing)}")


def require_hash(path: Path, expected: str, label: str) -> None:
    actual = sha256(path)
    if actual != expected:
        raise SourceError(f"{label} hash mismatch: expected {expected}, got {actual}")


def tracked_files(repository: Path, prefix: str = "") -> list[Path]:
    args = ("git", "ls-files", "-z", "--", prefix) if prefix else ("git", "ls-files", "-z")
    output = run(*args, cwd=repository)
    return [Path(item) for item in output.split("\0") if item]


def copy_tracked(repository: Path, destination: Path, prefix: str = "") -> int:
    count = 0
    prefix_path = Path(prefix) if prefix else Path()
    for relative in tracked_files(repository, prefix):
        source = repository / relative
        target_relative = relative.relative_to(prefix_path) if prefix else relative
        target = destination / target_relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        count += 1
    return count


def namespace_village(village: Path) -> int:
    changed = 0
    for path in village.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        rewritten = text.replace("res://", "res://village/")
        if rewritten != text:
            path.write_text(rewritten, encoding="utf-8")
            changed += 1
    return changed


def apply_pixel_nations_village_identity(village: Path) -> int:
    """Replace player-visible donor identity while retaining legal/source access."""
    replacements = {
        "The Free Game": "Pixel Nations",
        "Lucas Marques, from Shiva": "Greengate · Aurelian Basin",
        "Primeiro, ligue a escola": "Greengate's first road",
        "Você começa com o Prédio principal, sua praça e a Escola de instrutores. Em Estradas, parta de uma borda da praça até a entrada da escola: 1 pedra por trecho.": (
            "Use the Pixel Nations command panel to build Greengate's road for 5 stone. "
            "Then return to World to see the settlement progress on Greenvale."
        ),
        "Depois, construa lenhador, pedreira e horta. Clique na escola concluída para formar os profissionais.": (
            "Village construction remains available here. The Pixel Nations panel reports the "
            "canonical land, settlement progress and claim count from the current save."
        ),
        "Entendi, vamos começar": "Continue in Greengate",
        "Código e artes do jogo ↗": "Credits, licenses and source ↗",
    }
    targets = [
        village / "ui" / "approved_hud.gd",
        village / "presentation" / "approved_game.gd",
    ]
    changed = 0
    for path in targets:
        text = path.read_text(encoding="utf-8")
        rewritten = text
        for source, replacement in replacements.items():
            rewritten = rewritten.replace(source, replacement)
        if rewritten != text:
            path.write_text(rewritten, encoding="utf-8")
            changed += 1
    hud_text = targets[0].read_text(encoding="utf-8")
    required = (
        "Pixel Nations",
        "Greengate · Aurelian Basin",
        "Greengate's first road",
        "Credits, licenses and source ↗",
    )
    if any(value not in hud_text for value in required):
        raise SourceError("Pixel Nations Village identity transform is incomplete")
    if "The Free Game" in hud_text or "Primeiro, ligue a escola" in hud_text:
        raise SourceError("player-visible donor identity remains after Village transform")
    return changed


def install_a01_atlas_substrate(output: Path) -> dict[str, str]:
    """Install the retained repository-owned painted Aurelian Basin substrate."""
    if not ATLAS_SOURCE.is_file():
        raise SourceError(f"missing retained A-01 atlas source: {ATLAS_SOURCE}")
    destination = output / "pixel_nations" / "a01_atlas_substrate.png"
    shutil.copy2(ATLAS_SOURCE, destination)
    return {
        "source": str(ATLAS_SOURCE.relative_to(ROOT)),
        "source_sha256": sha256(ATLAS_SOURCE),
        "generated_sha256": sha256(destination),
    }


def write_change_notice(output: Path, opengs_commit: str, village_commit: str) -> None:
    notice = f"""# Third-party source changes

- OpenGS source: Thomas Holtvedt, `{opengs_commit}`, MIT.
- OpenGS scene/data files are copied; generated project.godot is rebranded for Pixel Nations and starts the canonical playable scene.
- The donor `game/main_game.gd` editor-only PNG preview export is removed from the generated runtime: release packs cannot write into `res://`, and these diagnostic previews are not gameplay resources.
- OpenGS `ne2.png` is a Thomas Holtvedt QGIS derivative of the public-domain Natural Earth 2 raster; its exact hash and source URL are pinned in the integration spec.
- Village source: Lucas Marques, from Shiva — The Free Game, `{village_commit}`.
- Village files are moved below `res://village/`; textual `res://` references are rewritten to that namespace.
- Player-visible Village branding and first-run guidance are changed to Pixel Nations / Greengate; donor credits, licenses, source link and notices remain available under Credits.
- Pixel Nations adds a namespaced integration scene, canonical A-01 hit geometry, truthful state UI, and World/Village navigation under `res://pixel_nations/`.
- Canonical land borders are restyled into a state-aware cartographic hierarchy: neutral boundaries recede beneath the painted geography while inspected, claimed and selected lands remain explicit.
- Reachable Atlas labels are split into primary place names and smaller truthful settlement/route-state subtitles so development remains visible without turning overview labels into dense text blocks.
- Claimed and inspected land fills are reduced to translucent cartographic washes; ownership and selection remain explicit through cyan, amber and gold borders and labels while the painted basin stays visible.
- The retained OpenGS overview camera is centered on the painted basin so the strategic surface uses the viewport deliberately instead of leaving a large dead band above it.
- The player-visible Natural Earth surface and labels are hidden. The repository's owner-committed Aurelian Basin prototype painting (`304d1a5aa4690cf001dc0488d7bd95433244b387`) is installed as the broad atlas substrate, with all 30 canonical land polygons rendered above it.
- Canonical land geometry is extracted from the repository's existing `app/play/lib/map-data.ts`; donor geography is not relabeled as Pixel Nations geography.
- The integration remains a rough gameplay candidate and does not claim final visual acceptance.

The generated tree is review evidence only. It is not approved release content.
"""
    (output / "THIRD_PARTY_CHANGES.md").write_text(notice, encoding="utf-8")


LAND_PATTERN = re.compile(
    r'\{ id: "(?P<slug>[^"]+)", pnid: "(?P<pnid>PN-A01-\d{3})", '
    r'name: "(?P<name>[^"]+)", region: "(?P<region>[^"]+)", '
    r'terrain: "(?P<terrain>[^"]+)", role: "(?P<role>[^"]+)".*?'
    r'd: "(?P<path>[^"]+)", cx: (?P<cx>\d+), cy: (?P<cy>\d+) \}'
)


def extract_canonical_lands(source: Path) -> list[dict[str, object]]:
    text = source.read_text(encoding="utf-8")
    lands: list[dict[str, object]] = []
    for match in LAND_PATTERN.finditer(text):
        points = [
            [float(x), float(y)]
            for x, y in re.findall(r"[ML]([0-9.]+) ([0-9.]+)", match.group("path"))
        ]
        lands.append({
            "slug": match.group("slug"),
            "id": match.group("pnid"),
            "name": match.group("name"),
            "region": match.group("region"),
            "terrain": match.group("terrain"),
            "role": match.group("role"),
            "center": [float(match.group("cx")), float(match.group("cy"))],
            "points": points,
        })
    expected = [f"PN-A01-{index:03d}" for index in range(1, 31)]
    actual = [str(land["id"]) for land in lands]
    if actual != expected or any(len(land["points"]) < 3 for land in lands):
        raise SourceError("canonical A-01 geometry extraction did not produce ordered 30-land data")
    return lands


def install_pixel_nations_runtime(output: Path) -> int:
    if not RUNTIME_SOURCE.is_dir():
        raise SourceError(f"missing Pixel Nations runtime templates: {RUNTIME_SOURCE}")
    runtime_target = output / "pixel_nations"
    shutil.copytree(RUNTIME_SOURCE, runtime_target)
    core_target = runtime_target / "core"
    core_target.mkdir(parents=True, exist_ok=True)
    for name in ("game_state.gd", "playable_core_session.gd", "playable_core_controller.gd"):
        target = core_target / name
        source_text = (ROOT / "game" / "core" / name).read_text(encoding="utf-8")
        target.write_text(
            source_text.replace("res://core/", "res://pixel_nations/core/"),
            encoding="utf-8",
        )
    lands = extract_canonical_lands(CANONICAL_MAP_DATA)
    (runtime_target / "a01_lands.json").write_text(
        json.dumps({"schema_version": 1, "canvas": [960, 900], "lands": lands}, indent=2) + "\n",
        encoding="utf-8",
    )
    project = output / "project.godot"
    project_text = project.read_text(encoding="utf-8")
    project_text = re.sub(
        r'run/main_scene="[^"]+"',
        'run/main_scene="res://pixel_nations/playable_core.tscn"',
        project_text,
        count=1,
    )
    if 'config/name="Open Grand Strategy"' not in project_text:
        raise SourceError("unexpected OpenGS project name; refuse unsafe donor rebrand")
    project_text = project_text.replace(
        'config/name="Open Grand Strategy"',
        'config/name="Pixel Nations"',
        1,
    )
    project_text = re.sub(
        r'^config/description="[^"]+"$',
        'config/description="One land can become an empire."',
        project_text,
        count=1,
        flags=re.MULTILINE,
    )
    # Never ship the donor launcher icon under Pixel Nations branding.
    project_text = re.sub(
        r'^config/icon="[^"]+"\n',
        "",
        project_text,
        count=1,
        flags=re.MULTILINE,
    )
    project.write_text(project_text, encoding="utf-8")
    # Keep the proven OpenGS scene, player camera, mouse picking and map collider.
    # Its Earth province DB/GPU SDF generation is unused: PN renders 30 canonical
    # lands on its own atlas and handles selection itself. Generating those
    # donor-only 5000x2500 textures can prevent exported games starting on
    # computers without Vulkan compute support.
    game_entry = output / "game/main_game.gd"
    game_entry_text = game_entry.read_text(encoding="utf-8")
    donor_ready = (
        "func _ready() -> void:\n"
        "\tDataImporter.new(db)\n"
        "\t$Map.create_map_textures(db)\n"
        "\t$Map.create_map_modes(db)\n"
        "\t$Map.create_country_labels(db)\n"
        "\t$Map.get_preview_images()\n"
    )
    pn_ready = (
        "func _ready() -> void:\n"
        "\t# Canonical A-01 gameplay is owned by PixelNationsPlayableCore.\n"
        "\tpass\n"
    )
    if game_entry_text.count(donor_ready) != 1:
        raise SourceError("OpenGS main_game bootstrap changed; refuse unsafe runtime transform")
    game_entry.write_text(game_entry_text.replace(donor_ready, pn_ready, 1), encoding="utf-8")
    return sum(1 for path in runtime_target.rglob("*") if path.is_file())


def materialize(spec_path: Path, output: Path) -> dict[str, object]:
    if output.exists() and any(output.iterdir()):
        raise SourceError(f"output must be absent or empty: {output}")
    output.mkdir(parents=True, exist_ok=True)
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    opengs = spec["opengs"]
    village = spec["village"]

    with tempfile.TemporaryDirectory(prefix="pn-scene-sources-") as temp_name:
        temp = Path(temp_name)
        opengs_repo = temp / "opengs"
        village_repo = temp / "the-free-game"
        clone_pinned(opengs["repository"], opengs["commit"], opengs_repo)
        clone_pinned(village["repository"], village["commit"], village_repo)

        require_paths(opengs_repo, opengs["required_paths"], "OpenGS")
        require_paths(village_repo, village["required_paths"], "village")
        require_hash(opengs_repo / "LICENSE", opengs["license_sha256"], "OpenGS LICENSE")
        require_hash(village_repo / "LICENSE", village["code_license_sha256"], "village LICENSE")
        require_hash(village_repo / "LICENSE-ASSETS.md", village["asset_license_sha256"], "village asset license")
        require_hash(village_repo / "THIRD_PARTY_NOTICES.md", village["third_party_notices_sha256"], "village notices")
        for relative, provenance in opengs.get("asset_provenance", {}).items():
            require_hash(opengs_repo / relative, provenance["sha256"], f"OpenGS asset {relative}")

        opengs_files = copy_tracked(opengs_repo, output)
        village_root = output / "village"
        village_files = copy_tracked(village_repo, village_root, "game")
        project_file = village_root / "project.godot"
        if project_file.exists():
            project_file.unlink()
            village_files -= 1
        rewritten_files = namespace_village(village_root)
        village_identity_files = apply_pixel_nations_village_identity(village_root)

        notices = output / "third_party" / "the-free-game"
        notices.mkdir(parents=True, exist_ok=True)
        for relative in ("LICENSE", "LICENSE-ASSETS.md", "THIRD_PARTY_NOTICES.md"):
            shutil.copy2(village_repo / relative, notices / relative)
        shutil.copytree(village_repo / "licenses", notices / "licenses")
        write_change_notice(output, opengs["commit"], village["commit"])

        runtime_files = install_pixel_nations_runtime(output)
        atlas_substrate = install_a01_atlas_substrate(output)

    manifest = {
        "schema_version": 1,
        "status": "ROUGH_PLAYABLE_TRANSFORM_NOT_PRODUCT_ACCEPTANCE",
        "opengs_commit": opengs["commit"],
        "village_commit": village["commit"],
        "opengs_files": opengs_files,
        "opengs_asset_provenance": opengs.get("asset_provenance", {}),
        "village_files": village_files,
        "village_text_files_rewritten": rewritten_files,
        "village_identity_files_transformed": village_identity_files,
        "village_scene": "res://village/scenes/approved.tscn",
        "playable_scene": "res://pixel_nations/playable_core.tscn",
        "pixel_nations_runtime_files": runtime_files,
        "a01_atlas_substrate": atlas_substrate,
        "unresolved_release_assets": opengs["unresolved_release_assets"],
        "missing_pixel_nations_transform": False,
    }
    (output / ".pn-source-manifest.json").write_text(
        json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    return manifest


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--spec", type=Path, default=DEFAULT_SPEC)
    parser.add_argument("--output", type=Path, required=True)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        manifest = materialize(args.spec.resolve(), args.output.resolve())
    except (OSError, SourceError, ValueError, json.JSONDecodeError) as error:
        print(f"PN_PLAYABLE_SOURCE_BRIDGE=FAIL {error}")
        return 1
    print(json.dumps(manifest, sort_keys=True))
    print("PN_PLAYABLE_SOURCE_BRIDGE=PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
