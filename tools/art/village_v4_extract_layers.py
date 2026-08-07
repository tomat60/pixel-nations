#!/usr/bin/env python3
"""Extract lossless registered RGBA deltas from Village V4 proof renders."""

import argparse
import hashlib
import json
import os
import shutil
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw


STAGES = (
    "camp",
    "shelter",
    "food",
    "timber",
    "scout",
    "storehouse",
    "market",
    "watch",
    "council",
)
EXPECTED = {"desktop": (2048, 1280), "portrait": (780, 1688)}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def frame_path(render_root: Path, mode: str, stage: str) -> Path:
    return render_root / mode / f"stage-{STAGES.index(stage) + 1:02d}-{stage}.png"


def pixel_bounds(mask: np.ndarray):
    ys, xs = np.where(mask)
    if len(xs) == 0:
        return None
    width = mask.shape[1]
    height = mask.shape[0]
    left, right = int(xs.min()), int(xs.max()) + 1
    top, bottom = int(ys.min()), int(ys.max()) + 1
    return {
        "pixels": [left, top, right, bottom],
        "normalized": [
            round(left / width, 6),
            round(top / height, 6),
            round(right / width, 6),
            round(bottom / height, 6),
        ],
        "width_ratio": round((right - left) / width, 6),
        "height_ratio": round((bottom - top) / height, 6),
        "area_ratio": round(((right - left) * (bottom - top)) / (width * height), 6),
    }


def checkerboard(size):
    width, height = size
    canvas = Image.new("RGB", size, (34, 38, 34))
    draw = ImageDraw.Draw(canvas)
    tile = max(10, min(width, height) // 18)
    for y in range(0, height, tile):
        for x in range(0, width, tile):
            if ((x // tile) + (y // tile)) % 2 == 0:
                draw.rectangle((x, y, x + tile - 1, y + tile - 1), fill=(48, 54, 48))
    return canvas


def fit(image: Image.Image, size):
    copy = image.copy()
    copy.thumbnail(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", size, (17, 20, 17))
    if copy.mode == "RGBA":
        background = checkerboard(copy.size).convert("RGBA")
        background.alpha_composite(copy)
        copy = background.convert("RGB")
    canvas.paste(copy, ((size[0] - copy.width) // 2, (size[1] - copy.height) // 2))
    return canvas


def make_sheet(images, labels, panel_size, output: Path):
    columns = 3
    rows = 3
    label_height = 30
    sheet = Image.new("RGB", (panel_size[0] * columns, (panel_size[1] + label_height) * rows), (12, 14, 12))
    draw = ImageDraw.Draw(sheet)
    for index, (image, label) in enumerate(zip(images, labels)):
        column = index % columns
        row = index // columns
        x = column * panel_size[0]
        y = row * (panel_size[1] + label_height)
        draw.text((x + 10, y + 9), f"{index + 1:02d}  {label.upper()}", fill=(245, 232, 182))
        sheet.paste(fit(image, panel_size), (x, y + label_height))
    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output, format="WEBP", lossless=True, method=6)


def extract_mode(render_root: Path, runtime_root: Path, review_root: Path, mode: str):
    expected = EXPECTED[mode]
    mode_runtime = runtime_root / mode
    mode_runtime.mkdir(parents=True, exist_ok=True)
    base_source = render_root / mode / "base.png"
    base = Image.open(base_source).convert("RGB")
    if base.size != expected:
        raise SystemExit(f"{mode} base size {base.size} != {expected}")

    base_output = mode_runtime / "base-terrain.webp"
    base.save(base_output, format="WEBP", lossless=True, method=6)
    decoded_base = Image.open(base_output).convert("RGB")
    if np.max(np.abs(np.asarray(decoded_base, dtype=np.int16) - np.asarray(base, dtype=np.int16))) != 0:
        raise SystemExit(f"{mode} lossless base did not decode pixel-exactly")

    previous = np.asarray(base, dtype=np.uint8)
    composed = decoded_base.convert("RGBA")
    cumulative_mask = np.zeros((expected[1], expected[0]), dtype=bool)
    layer_records = []
    stage_images = []
    delta_images = []

    for index, stage in enumerate(STAGES, start=1):
        source = frame_path(render_root, mode, stage)
        current_image = Image.open(source).convert("RGB")
        if current_image.size != expected:
            raise SystemExit(f"{mode}/{stage} size {current_image.size} != {expected}")
        current = np.asarray(current_image, dtype=np.uint8)
        delta = np.abs(current.astype(np.int16) - previous.astype(np.int16))
        changed = np.any(delta > 0, axis=2)
        changed_ratio = float(changed.mean())
        bounds = pixel_bounds(changed)
        if bounds is None or changed_ratio < 0.0002:
            raise SystemExit(f"{mode}/{stage} has no genuine visual delta: ratio={changed_ratio:.8f}")
        if changed_ratio > 0.35:
            raise SystemExit(f"{mode}/{stage} delta is an unbounded frame swap: ratio={changed_ratio:.6f}")

        rgba = np.zeros((expected[1], expected[0], 4), dtype=np.uint8)
        rgba[:, :, :3] = current
        rgba[:, :, 3] = changed.astype(np.uint8) * 255
        layer_image = Image.fromarray(rgba, mode="RGBA")
        layer_output = mode_runtime / f"stage-{index:02d}-{stage}.webp"
        layer_image.save(layer_output, format="WEBP", lossless=True, method=6)
        decoded_layer = Image.open(layer_output).convert("RGBA")
        composed.alpha_composite(decoded_layer)
        reconstruction = np.asarray(composed.convert("RGB"), dtype=np.uint8)
        max_error = int(np.max(np.abs(reconstruction.astype(np.int16) - current.astype(np.int16))))
        if max_error != 0:
            raise SystemExit(f"{mode}/{stage} reconstruction drift: max_error={max_error}")

        cumulative_mask |= changed
        layer_records.append({
            "id": stage,
            "order": index,
            "path": f"{mode}/{layer_output.name}",
            "sha256": sha256(layer_output),
            "byte_size": layer_output.stat().st_size,
            "changed_pixel_ratio": round(changed_ratio, 8),
            "bounds": bounds,
            "reconstruction_max_channel_error": max_error,
        })
        stage_images.append(current_image)
        delta_images.append(decoded_layer)
        previous = current

    developed_bounds = pixel_bounds(cumulative_mask)
    developed_ratio = float(cumulative_mask.mean())
    if developed_bounds is None:
        raise SystemExit(f"{mode} developed frame has no growth")
    if developed_bounds["width_ratio"] < 0.42 or developed_bounds["height_ratio"] < 0.35:
        raise SystemExit(f"{mode} developed footprint is too small: {developed_bounds}")
    if developed_ratio < 0.035:
        raise SystemExit(f"{mode} developed changed-pixel ratio is too small: {developed_ratio:.6f}")

    panel_size = (512, 320) if mode == "desktop" else (260, 562)
    make_sheet(stage_images, STAGES, panel_size, review_root / f"{mode}-stage-contact-sheet.webp")
    make_sheet(delta_images, STAGES, panel_size, review_root / f"{mode}-delta-contact-sheet.webp")

    shelter_source = frame_path(render_root, mode, "shelter")
    developed_source = frame_path(render_root, mode, "council")
    shutil.copy2(shelter_source, review_root / f"{mode}-shelter-proof.png")
    shutil.copy2(developed_source, review_root / f"{mode}-developed-master.png")

    return {
        "resolution": list(expected),
        "base": {
            "path": f"{mode}/{base_output.name}",
            "sha256": sha256(base_output),
            "byte_size": base_output.stat().st_size,
        },
        "layers": layer_records,
        "developed_changed_pixel_ratio": round(developed_ratio, 8),
        "developed_bounds": developed_bounds,
        "final_reconstruction_sha256": hashlib.sha256(np.asarray(composed.convert("RGB"), dtype=np.uint8).tobytes()).hexdigest(),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("render_root", type=Path)
    parser.add_argument("runtime_root", type=Path)
    parser.add_argument("review_root", type=Path)
    args = parser.parse_args()
    args.runtime_root.mkdir(parents=True, exist_ok=True)
    args.review_root.mkdir(parents=True, exist_ok=True)

    render_manifest_path = args.render_root / "render-manifest.json"
    render_manifest = json.loads(render_manifest_path.read_text())
    if tuple(render_manifest.get("stages", [])) != STAGES:
        raise SystemExit("Render manifest stage sequence does not match Village V4 contract")

    modes = {
        mode: extract_mode(args.render_root, args.runtime_root, args.review_root, mode)
        for mode in ("desktop", "portrait")
    }
    manifest = {
        "classification": "PENDING_DIRECT_VISUAL_REVIEW",
        "contract": "VILLAGE_V4_NINE_LAYER_PROOF",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "input_sha": os.environ.get("GITHUB_SHA", "local"),
        "github_run_id": os.environ.get("GITHUB_RUN_ID", "local"),
        "kaykit_commit": render_manifest["kaykit_commit"],
        "base_script_commit": render_manifest["base_script_commit"],
        "stages": list(STAGES),
        "modes": modes,
    }
    (args.runtime_root / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    (args.review_root / "evidence-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    shutil.copy2(render_manifest_path, args.review_root / "render-manifest.json")
    print(f"VILLAGE_V4_LAYER_EXTRACTION_OK={args.runtime_root}")


if __name__ == "__main__":
    main()
