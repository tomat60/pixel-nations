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
import shutil
import subprocess
import tempfile


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_SPEC = ROOT / "game" / "integration" / "playable_scene_sources.json"
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


def write_change_notice(output: Path, opengs_commit: str, village_commit: str) -> None:
    notice = f"""# Third-party source changes

- OpenGS source: Thomas Holtvedt, `{opengs_commit}`, MIT.
- OpenGS files are copied without content changes into the generated project root.
- Village source: Lucas Marques, from Shiva — The Free Game, `{village_commit}`.
- Village files are moved below `res://village/`; textual `res://` references are rewritten to that namespace.
- No artwork, identity, gameplay, canonical A-01 mapping, or navigation transformation is claimed by this materialization step.
- Pixel Nations integration changes must be documented separately before distribution.

The generated tree is evidence/input only. It is not approved release content.
"""
    (output / "THIRD_PARTY_CHANGES.md").write_text(notice, encoding="utf-8")


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

        opengs_files = copy_tracked(opengs_repo, output)
        village_root = output / "village"
        village_files = copy_tracked(village_repo, village_root, "game")
        project_file = village_root / "project.godot"
        if project_file.exists():
            project_file.unlink()
            village_files -= 1
        rewritten_files = namespace_village(village_root)

        notices = output / "third_party" / "the-free-game"
        notices.mkdir(parents=True, exist_ok=True)
        for relative in ("LICENSE", "LICENSE-ASSETS.md", "THIRD_PARTY_NOTICES.md"):
            shutil.copy2(village_repo / relative, notices / relative)
        shutil.copytree(village_repo / "licenses", notices / "licenses")
        write_change_notice(output, opengs["commit"], village["commit"])

    manifest = {
        "schema_version": 1,
        "status": "SOURCE_INPUT_ONLY_NOT_PRODUCT_ACCEPTANCE",
        "opengs_commit": opengs["commit"],
        "village_commit": village["commit"],
        "opengs_files": opengs_files,
        "village_files": village_files,
        "village_text_files_rewritten": rewritten_files,
        "village_scene": "res://village/scenes/approved.tscn",
        "unresolved_release_assets": opengs["unresolved_release_assets"],
        "missing_pixel_nations_transform": True,
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
