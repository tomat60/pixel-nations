#!/usr/bin/env python3
"""Vendor the exact KayKit subset required by Aurelian Basin V2.

The script is deterministic at the source boundary: it clones one pinned commit,
verifies the checkout, copies only the allowlisted glTF scenes plus their relative
binary/image dependencies, records SHA-256 digests, and leaves no Git credentials.
"""
from __future__ import annotations

import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Iterable

REPOSITORY = "https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0.git"
COMMIT = "84fa4e91af6a88989be7c99e0891cede11f2ca38"
SOURCE_PREFIX = Path("addons/kaykit_medieval_hexagon_pack/Assets/gltf")
LICENSE_PATH = Path("LICENSE.txt")
OUTPUT_ROOT = Path(__file__).resolve().parents[1] / "assets" / "aurelian-basin" / "kaykit"
MANIFEST_PATH = OUTPUT_ROOT.parent / "KAYKIT_SUBSET_MANIFEST.json"

ALLOWLIST = (
    "tiles/base/hex_grass.gltf",
    "tiles/base/hex_water.gltf",
    "tiles/coast/hex_coast_A.gltf",
    "tiles/coast/hex_coast_B.gltf",
    "tiles/coast/hex_coast_C.gltf",
    "tiles/coast/hex_coast_D.gltf",
    "tiles/roads/hex_road_A.gltf",
    "tiles/roads/hex_road_B.gltf",
    "tiles/roads/hex_road_C.gltf",
    "tiles/roads/hex_road_A_sloped_high.gltf",
    "tiles/roads/hex_road_A_sloped_low.gltf",
    "tiles/rivers/hex_river_crossing_A.gltf",
    "tiles/rivers/hex_river_crossing_B.gltf",
    "decoration/nature/hill_single_A.gltf",
    "decoration/nature/hill_single_B.gltf",
    "decoration/nature/hill_single_C.gltf",
    "decoration/nature/tree_single_A.gltf",
    "decoration/nature/tree_single_B.gltf",
    "decoration/nature/rock_single_A.gltf",
    "decoration/nature/rock_single_B.gltf",
    "decoration/nature/rock_single_C.gltf",
    "decoration/props/flag_blue.gltf",
    "buildings/neutral/building_bridge_A.gltf",
    "buildings/blue/building_blacksmith_blue.gltf",
    "buildings/blue/building_barracks_blue.gltf",
    "buildings/blue/building_church_blue.gltf",
)


def run(command: list[str], cwd: Path | None = None) -> str:
    completed = subprocess.run(
        command,
        cwd=cwd,
        check=True,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    return completed.stdout.strip()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def referenced_uris(gltf_path: Path) -> Iterable[str]:
    payload = json.loads(gltf_path.read_text(encoding="utf-8"))
    for buffer in payload.get("buffers", []):
        uri = buffer.get("uri")
        if isinstance(uri, str) and not uri.startswith("data:"):
            yield uri
    for image in payload.get("images", []):
        uri = image.get("uri")
        if isinstance(uri, str) and not uri.startswith("data:"):
            yield uri


def copy_with_manifest(source_root: Path, relative_path: Path, records: list[dict[str, object]]) -> None:
    source = source_root / relative_path
    if not source.is_file():
        raise FileNotFoundError(f"Missing pinned KayKit file: {relative_path}")
    destination = OUTPUT_ROOT / relative_path.relative_to(SOURCE_PREFIX)
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)
    records.append(
        {
            "path": destination.relative_to(OUTPUT_ROOT.parent).as_posix(),
            "bytes": destination.stat().st_size,
            "sha256": sha256(destination),
        }
    )


def main() -> int:
    OUTPUT_ROOT.parent.mkdir(parents=True, exist_ok=True)
    if OUTPUT_ROOT.exists():
        shutil.rmtree(OUTPUT_ROOT)
    OUTPUT_ROOT.mkdir(parents=True)

    records: list[dict[str, object]] = []
    with tempfile.TemporaryDirectory(prefix="pixel-nations-kaykit-") as temp_dir:
        checkout = Path(temp_dir) / "source"
        run(["git", "clone", "--filter=blob:none", "--no-checkout", REPOSITORY, str(checkout)])
        run(["git", "checkout", "--detach", COMMIT], cwd=checkout)
        resolved = run(["git", "rev-parse", "HEAD"], cwd=checkout)
        if resolved != COMMIT:
            raise RuntimeError(f"KayKit checkout mismatch: expected {COMMIT}, got {resolved}")

        seen: set[Path] = set()
        for allowlisted in ALLOWLIST:
            gltf_relative = SOURCE_PREFIX / allowlisted
            gltf_source = checkout / gltf_relative
            if not gltf_source.is_file():
                raise FileNotFoundError(f"Allowlisted glTF missing: {gltf_relative}")

            dependencies = [gltf_relative]
            dependencies.extend(gltf_relative.parent / uri for uri in referenced_uris(gltf_source))
            for relative in dependencies:
                normalized = Path(os.path.normpath(relative.as_posix()))
                if normalized in seen:
                    continue
                seen.add(normalized)
                copy_with_manifest(checkout, normalized, records)

        license_source = checkout / LICENSE_PATH
        license_destination = OUTPUT_ROOT.parent / "KAYKIT_CC0_LICENSE.txt"
        shutil.copy2(license_source, license_destination)
        records.append(
            {
                "path": license_destination.relative_to(OUTPUT_ROOT.parent).as_posix(),
                "bytes": license_destination.stat().st_size,
                "sha256": sha256(license_destination),
            }
        )

    records.sort(key=lambda item: str(item["path"]))
    manifest = {
        "source_repository": REPOSITORY,
        "source_commit": COMMIT,
        "license": "CC0-1.0",
        "allowlisted_gltf_count": len(ALLOWLIST),
        "copied_file_count": len(records),
        "files": records,
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"KAYKIT_SUBSET_VENDOR_PASS commit={COMMIT} files={len(records)}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"KAYKIT_SUBSET_VENDOR_FAIL: {error}", file=sys.stderr)
        raise
