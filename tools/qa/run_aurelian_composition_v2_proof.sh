#!/usr/bin/env bash
set -euo pipefail

KAYKIT_SHA="84fa4e91af6a88989be7c99e0891cede11f2ca38"
KAYKIT_ARCHIVE_SHA="cfa7faff403c93fb90e8eeb448c78e6192782802a532bebed0bdb853b39f7028"
BASE_SCRIPT_SHA="d001d96117fc9d1de20f3ff57d7a47e2441a0393"
ACCEPTED_M1_HEAD="e0db68c5943a8c17d523e9c1d0802f7c8641b9ed"
EVIDENCE="evidence/aurelian-composition-v2"

rm -rf "$EVIDENCE" /tmp/kaykit-v2 /tmp/aurelian-v2
mkdir -p "$EVIDENCE" /tmp/kaykit-v2/src /tmp/aurelian-v2

sudo apt-get update -qq
sudo apt-get install -y -qq --no-install-recommends \
  blender python3-numpy python3-pil unzip xvfb libegl1 libgl1-mesa-dri \
  libglx-mesa0 libx11-6 libxcursor1 libxinerama1 libxi6 libxrandr2 >/dev/null

blender --version | head -1
BLENDER_PYTHONPATH="$(python3 - <<'PY'
import pathlib
import numpy
print(pathlib.Path(numpy.__file__).resolve().parent.parent)
PY
)"
env PYTHONPATH="$BLENDER_PYTHONPATH" blender -b --python-expr \
  "import numpy; print('BLENDER_NUMPY=' + numpy.__version__)"

curl -fsSL --retry 3 \
  "https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0/archive/${KAYKIT_SHA}.zip" \
  -o /tmp/kaykit-v2/source.zip
ACTUAL_ARCHIVE_SHA="$(sha256sum /tmp/kaykit-v2/source.zip | cut -d' ' -f1)"
test "$ACTUAL_ARCHIVE_SHA" = "$KAYKIT_ARCHIVE_SHA"
unzip -q /tmp/kaykit-v2/source.zip -d /tmp/kaykit-v2/src
KAYKIT_ROOT="$(find /tmp/kaykit-v2/src -mindepth 1 -maxdepth 1 -type d | head -1)"

curl -fsSL --retry 3 \
  "https://raw.githubusercontent.com/tomat60/pixel-nations/${BASE_SCRIPT_SHA}/tools/blender/aurelian_basin_master.py" \
  -o /tmp/aurelian-v2/aurelian_basin_master.py
grep -F "SOURCE_SHA = \"${KAYKIT_SHA}\"" /tmp/aurelian-v2/aurelian_basin_master.py

curl -fsSL --retry 3 \
  "https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0/${KAYKIT_SHA}/LICENSE.txt" \
  -o "$EVIDENCE/LICENSE.txt"
grep -F "Creative Commons Zero" "$EVIDENCE/LICENSE.txt"

git rev-parse HEAD | tee "$EVIDENCE/input-sha.txt"
printf '%s\n' "$ACCEPTED_M1_HEAD" > "$EVIDENCE/accepted-m1-head.txt"
printf '%s  %s\n' "$ACTUAL_ARCHIVE_SHA" source.zip > "$EVIDENCE/source-archive.sha256"

export XDG_RUNTIME_DIR="${RUNNER_TEMP:-/tmp}/xdg-runtime"
mkdir -p "$XDG_RUNTIME_DIR"
chmod 700 "$XDG_RUNTIME_DIR"

timeout 35m env PYTHONPATH="$BLENDER_PYTHONPATH" LIBGL_ALWAYS_SOFTWARE=1 \
  xvfb-run -a -s "-screen 0 2200x1400x24" \
  blender -b \
  --python tools/blender/aurelian_composition_v2.py \
  -- /tmp/aurelian-v2/aurelian_basin_master.py tools/blender/aurelian_composition_v2_layout.json "$KAYKIT_ROOT" "$PWD/$EVIDENCE" \
  2>&1 | tee "$EVIDENCE/blender.log"

for mode in desktop portrait; do
  for state in camp first_shelter developed_settlement; do
    grep -F "AURELIAN_V2_RENDER_EXPORTED=${state}:${mode}:" "$EVIDENCE/blender.log"
    test -s "$EVIDENCE/aurelian-${state}-${mode}.png"
    test -s "$EVIDENCE/aurelian-${state}-${mode}-contract.json"
  done
done
for state in first_shelter developed_settlement; do
  grep -F "AURELIAN_V2_RENDER_EXPORTED=${state}:master:" "$EVIDENCE/blender.log"
  test -s "$EVIDENCE/aurelian-${state}-master.png"
  test -s "$EVIDENCE/aurelian-${state}-master-contract.json"
done
grep -F "AURELIAN_COMPOSITION_V2_EXPORTED=" "$EVIDENCE/blender.log"

python3 - <<'PY'
import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageStat

root = Path("evidence/aurelian-composition-v2")
states = ("camp", "first_shelter", "developed_settlement")
dimensions = {"desktop": (1440, 900), "portrait": (390, 844), "master": (2048, 1152)}


def pixel_delta(a_path, b_path):
    a = np.asarray(Image.open(a_path).convert("RGB"), dtype=np.int16)
    b = np.asarray(Image.open(b_path).convert("RGB"), dtype=np.int16)
    if a.shape != b.shape:
        raise SystemExit(f"shape mismatch: {a.shape} vs {b.shape}")
    delta = np.abs(a - b)
    changed = np.any(delta >= 4, axis=2)
    return {
        "changed_pixel_ratio": round(float(changed.mean()), 6),
        "mean_absolute_channel_error": round(float(delta.mean()), 6),
        "p99_channel_error": round(float(np.percentile(delta, 99)), 3),
        "max_channel_error": int(delta.max()),
    }


def fit(image, width, height):
    copy = image.copy()
    copy.thumbnail((width, height), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (width, height), (18, 20, 17))
    canvas.paste(copy, ((width - copy.width) // 2, (height - copy.height) // 2))
    return canvas


def render_stats(path, expected_size):
    image = Image.open(path).convert("RGB")
    if image.size != expected_size:
        raise SystemExit(f"dimension mismatch {path.name}: {image.size} != {expected_size}")
    stat = ImageStat.Stat(image)
    variance = sum(stat.var) / 3.0
    colors = len(set(image.resize((180, 120)).getdata()))
    if path.stat().st_size < 20000 or variance < 40 or colors < 128:
        raise SystemExit(f"weak render {path.name}: bytes={path.stat().st_size} variance={variance:.3f} colors={colors}")
    return {"sha256": hashlib.sha256(path.read_bytes()).hexdigest(), "bytes": path.stat().st_size, "width": image.width, "height": image.height, "variance": round(variance, 3), "unique_sample_colors": colors}

qa = {"classification": "PENDING_DIRECT_VISUAL_REVIEW", "images": {}, "deltas": {}, "parity": {}, "binary_gates": {}}
contracts = {}
for mode in ("desktop", "portrait"):
    qa["images"][mode] = {}
    contracts[mode] = {}
    for state in states:
        image_path = root / f"aurelian-{state}-{mode}.png"
        contract_path = root / f"aurelian-{state}-{mode}-contract.json"
        qa["images"][mode][state] = render_stats(image_path, dimensions[mode])
        contracts[mode][state] = json.loads(contract_path.read_text())

for state in ("first_shelter", "developed_settlement"):
    path = root / f"aurelian-{state}-master.png"
    qa["images"].setdefault("master", {})[state] = render_stats(path, dimensions["master"])
    contracts.setdefault("master", {})[state] = json.loads((root / f"aurelian-{state}-master-contract.json").read_text())

hashes = {contract["world_layout_sha256"] for mode_contracts in contracts.values() for contract in mode_contracts.values()}
if len(hashes) != 1:
    raise SystemExit(f"world-layout parity failed: {sorted(hashes)}")
qa["parity"]["world_layout_sha256"] = next(iter(hashes))

for state in states:
    desktop = contracts["desktop"][state]
    portrait = contracts["portrait"][state]
    if desktop["authored_placements"] != portrait["authored_placements"]:
        raise SystemExit(f"orientation-specific placements detected: {state}")
    if desktop["roads"] != portrait["roads"]:
        raise SystemExit(f"orientation-specific roads detected: {state}")
    if desktop["anchors"]["bridge"] != portrait["anchors"]["bridge"]:
        raise SystemExit(f"orientation-specific bridge detected: {state}")
    qa["parity"][state] = "PASS"

first_home = next(item for item in contracts["desktop"]["first_shelter"]["authored_placements"] if item["id"] == "home_primary")
developed_home = next(item for item in contracts["desktop"]["developed_settlement"]["authored_placements"] if item["id"] == "home_primary")
if first_home != developed_home:
    raise SystemExit("first shelter position does not persist into developed cluster")

for mode in ("desktop", "portrait"):
    camp = root / f"aurelian-camp-{mode}.png"
    shelter = root / f"aurelian-first_shelter-{mode}.png"
    developed = root / f"aurelian-developed_settlement-{mode}.png"
    qa["deltas"][mode] = {
        "camp_to_first_shelter": pixel_delta(camp, shelter),
        "first_shelter_to_developed": pixel_delta(shelter, developed),
        "camp_to_developed": pixel_delta(camp, developed),
    }
    if qa["deltas"][mode]["camp_to_first_shelter"]["changed_pixel_ratio"] <= 0.001:
        raise SystemExit(f"camp→shelter visual change too small: {mode}")
    if qa["deltas"][mode]["first_shelter_to_developed"]["changed_pixel_ratio"] <= 0.005:
        raise SystemExit(f"shelter→developed visual change too small: {mode}")

for mode in ("desktop", "portrait"):
    panel_w, panel_h = ((480, 300) if mode == "desktop" else (260, 562))
    top = 42
    sheet = Image.new("RGB", (panel_w * 3, panel_h + top), (12, 14, 12))
    draw = ImageDraw.Draw(sheet)
    labels = ("CAMP", "FIRST SHELTER", "DEVELOPED SETTLEMENT")
    for index, (state, label) in enumerate(zip(states, labels)):
        image = Image.open(root / f"aurelian-{state}-{mode}.png").convert("RGB")
        sheet.paste(fit(image, panel_w, panel_h), (index * panel_w, top))
        draw.text((index * panel_w + 12, 12), label, fill=(245, 236, 196))
    sheet.save(root / f"contact-sheet-{mode}.png")

    old = Path(f"review/aurelian-staged-progression-m1/aurelian-developed_settlement-{mode}.png")
    if old.is_file():
        comparison = Image.new("RGB", (panel_w * 2, panel_h + top), (12, 14, 12))
        compare_draw = ImageDraw.Draw(comparison)
        comparison.paste(fit(Image.open(old).convert("RGB"), panel_w, panel_h), (0, top))
        comparison.paste(fit(Image.open(root / f"aurelian-developed_settlement-{mode}.png").convert("RGB"), panel_w, panel_h), (panel_w, top))
        compare_draw.text((12, 12), "M1 DEVELOPED", fill=(245, 236, 196))
        compare_draw.text((panel_w + 12, 12), "V2 DEVELOPED", fill=(245, 236, 196))
        comparison.save(root / f"before-after-{mode}.png")

bridge = contracts["desktop"]["developed_settlement"]["anchors"]["bridge"]
authored = contracts["desktop"]["developed_settlement"]["authored_placements"]
ids = {item["id"] for item in authored}
roads = contracts["desktop"]["developed_settlement"]["roads"]
qa["binary_gates"] = {
    "one_world_layout": len(hashes) == 1,
    "bridge_has_two_grounded_ends": len(bridge["end_a"]) == 3 and len(bridge["end_b"]) == 3,
    "bridge_rotation_within_contract": 84.0 <= float(bridge["rotation"]) <= 114.0,
    "developed_has_plaza_anchor": contracts["desktop"]["developed_settlement"]["anchors"]["plaza"]["radius"] >= 10.0,
    "compact_home_cluster_declared": {"home_primary", "home_secondary", "home_upper"}.issubset(ids),
    "landmark_connected_spur": "landmark_spur" in roads and "landmark_keep" in ids,
    "work_connected_spur": "work_spur" in roads and "work_blacksmith" in ids,
    "first_shelter_persists": first_home == developed_home,
    "master_developed_2048x1152": qa["images"]["master"]["developed_settlement"]["width"] == 2048,
    "master_shelter_same_camera": contracts["master"]["first_shelter"]["camera"] == contracts["master"]["developed_settlement"]["camera"],
}
if not all(qa["binary_gates"].values()):
    raise SystemExit(f"deterministic V2 gates failed: {qa['binary_gates']}")

(root / "composition-v2-qa.json").write_text(json.dumps(qa, indent=2) + "\n")
print("AURELIAN_COMPOSITION_V2_QA_OK")
PY

cat > "$EVIDENCE/evidence-manifest.json" <<EOF
{
  "classification": "PENDING_DIRECT_VISUAL_REVIEW",
  "input_sha": "$(git rev-parse HEAD)",
  "accepted_m1_head": "${ACCEPTED_M1_HEAD}",
  "kaykit_commit": "${KAYKIT_SHA}",
  "kaykit_archive_sha256": "${ACTUAL_ARCHIVE_SHA}",
  "base_script_commit": "${BASE_SCRIPT_SHA}",
  "viewports": {"desktop": "1440x900", "portrait": "390x844", "master": "2048x1152"},
  "states": ["camp", "first_shelter", "developed_settlement"],
  "review_contract": "owner + GPT-5.6 direct review, then Fable asset review"
}
EOF

find "$EVIDENCE" -type f ! -name SHA256SUMS.txt -print0 | sort -z | xargs -0 sha256sum > "$EVIDENCE/SHA256SUMS.txt"
echo "AURELIAN_COMPOSITION_V2_EVIDENCE_READY=$EVIDENCE"
