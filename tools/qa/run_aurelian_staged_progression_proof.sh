#!/usr/bin/env bash
set -euo pipefail

KAYKIT_SHA="84fa4e91af6a88989be7c99e0891cede11f2ca38"
KAYKIT_ARCHIVE_SHA="cfa7faff403c93fb90e8eeb448c78e6192782802a532bebed0bdb853b39f7028"
BASE_SCRIPT_SHA="d001d96117fc9d1de20f3ff57d7a47e2441a0393"
ACCEPTED_SOURCE_HEAD="59fbebf4ba2d7cddb77a8ca4d93701b6bec4599a"
ACCEPTED_DESKTOP_DHASH="e0e2656dabdb6393"
ACCEPTED_PORTRAIT_DHASH="31c6e6a218998361"
EVIDENCE="evidence/aurelian-staged-progression-m1"

rm -rf "$EVIDENCE" /tmp/kaykit-staged /tmp/aurelian-staged
mkdir -p "$EVIDENCE" /tmp/kaykit-staged/src /tmp/aurelian-staged

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
  -o /tmp/kaykit-staged/source.zip
ACTUAL_ARCHIVE_SHA="$(sha256sum /tmp/kaykit-staged/source.zip | cut -d' ' -f1)"
test "$ACTUAL_ARCHIVE_SHA" = "$KAYKIT_ARCHIVE_SHA"
unzip -q /tmp/kaykit-staged/source.zip -d /tmp/kaykit-staged/src
KAYKIT_ROOT="$(find /tmp/kaykit-staged/src -mindepth 1 -maxdepth 1 -type d | head -1)"

curl -fsSL --retry 3 \
  "https://raw.githubusercontent.com/tomat60/pixel-nations/${BASE_SCRIPT_SHA}/tools/blender/aurelian_basin_master.py" \
  -o /tmp/aurelian-staged/aurelian_basin_master.py
grep -F "SOURCE_SHA = \"${KAYKIT_SHA}\"" /tmp/aurelian-staged/aurelian_basin_master.py

curl -fsSL --retry 3 \
  "https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0/${KAYKIT_SHA}/LICENSE.txt" \
  -o "$EVIDENCE/LICENSE.txt"
grep -F "Creative Commons Zero" "$EVIDENCE/LICENSE.txt"

git rev-parse HEAD | tee "$EVIDENCE/input-sha.txt"
printf '%s\n' "$ACCEPTED_SOURCE_HEAD" > "$EVIDENCE/accepted-source-head.txt"
printf '%s  %s\n' "$ACTUAL_ARCHIVE_SHA" source.zip > "$EVIDENCE/source-archive.sha256"

export XDG_RUNTIME_DIR="${RUNNER_TEMP:-/tmp}/xdg-runtime"
mkdir -p "$XDG_RUNTIME_DIR"
chmod 700 "$XDG_RUNTIME_DIR"

timeout 30m env PYTHONPATH="$BLENDER_PYTHONPATH" LIBGL_ALWAYS_SOFTWARE=1 \
  xvfb-run -a -s "-screen 0 1600x1200x24" \
  blender -b \
  --python tools/blender/aurelian_staged_progression.py \
  -- /tmp/aurelian-staged/aurelian_basin_master.py "$KAYKIT_ROOT" "$PWD/$EVIDENCE" \
  2>&1 | tee "$EVIDENCE/blender.log"

for mode in desktop portrait; do
  for state in camp first_shelter developed_settlement; do
    grep -F "AURELIAN_STAGED_RENDER_EXPORTED=${state}:${mode}:" "$EVIDENCE/blender.log"
    test -s "$EVIDENCE/aurelian-${state}-${mode}.png"
    test -s "$EVIDENCE/aurelian-${state}-${mode}-contract.json"
  done
done
grep -F "AURELIAN_STAGED_PROGRESSION_EXPORTED=" "$EVIDENCE/blender.log"

ACCEPTED_DESKTOP_DHASH="$ACCEPTED_DESKTOP_DHASH" \
ACCEPTED_PORTRAIT_DHASH="$ACCEPTED_PORTRAIT_DHASH" \
ACCEPTED_SOURCE_HEAD="$ACCEPTED_SOURCE_HEAD" \
python3 - <<'PY'
import hashlib
import json
import os
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageStat

root = Path("evidence/aurelian-staged-progression-m1")
states = ("camp", "first_shelter", "developed_settlement")
dimensions = {"desktop": (1440, 900), "portrait": (390, 844)}
accepted = {
    "desktop": os.environ["ACCEPTED_DESKTOP_DHASH"],
    "portrait": os.environ["ACCEPTED_PORTRAIT_DHASH"],
}

def dhash(path):
    image = Image.open(path).convert("L").resize((9, 8), Image.Resampling.LANCZOS)
    pixels = list(image.getdata())
    value = 0
    for y in range(8):
        row = pixels[y * 9:(y + 1) * 9]
        for x in range(8):
            value = (value << 1) | int(row[x] > row[x + 1])
    return f"{value:016x}"

def pixel_delta(a_path, b_path):
    a = np.asarray(Image.open(a_path).convert("RGB"), dtype=np.int16)
    b = np.asarray(Image.open(b_path).convert("RGB"), dtype=np.int16)
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

qa = {
    "classification": "PENDING_DIRECT_VISUAL_REVIEW",
    "accepted_source_head": os.environ["ACCEPTED_SOURCE_HEAD"],
    "images": {},
    "deltas": {},
}

for mode, expected_size in dimensions.items():
    qa["images"][mode] = {}
    for state in states:
        path = root / f"aurelian-{state}-{mode}.png"
        image = Image.open(path).convert("RGB")
        if image.size != expected_size:
            raise SystemExit(f"dimension mismatch {state}/{mode}: {image.size}")
        stat = ImageStat.Stat(image)
        variance = sum(stat.var) / 3.0
        colors = len(set(image.resize((180, 120)).getdata()))
        if path.stat().st_size < 20000 or variance < 40 or colors < 128:
            raise SystemExit(
                f"weak render {state}/{mode}: bytes={path.stat().st_size} "
                f"variance={variance:.3f} colors={colors}"
            )
        qa["images"][mode][state] = {
            "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
            "dhash": dhash(path),
            "bytes": path.stat().st_size,
            "width": image.width,
            "height": image.height,
            "variance": round(variance, 3),
            "unique_sample_colors": colors,
        }

    developed_dhash = qa["images"][mode]["developed_settlement"]["dhash"]
    if developed_dhash != accepted[mode]:
        raise SystemExit(
            f"accepted developed visual drift {mode}: "
            f"actual={developed_dhash} expected={accepted[mode]}"
        )

    camp = root / f"aurelian-camp-{mode}.png"
    shelter = root / f"aurelian-first_shelter-{mode}.png"
    developed = root / f"aurelian-developed_settlement-{mode}.png"
    deltas = {
        "camp_to_first_shelter": pixel_delta(camp, shelter),
        "first_shelter_to_developed": pixel_delta(shelter, developed),
        "camp_to_developed": pixel_delta(camp, developed),
    }
    if not (0.001 <= deltas["camp_to_first_shelter"]["changed_pixel_ratio"] <= 0.30):
        raise SystemExit(f"camp→shelter delta out of bounds {mode}: {deltas}")
    if not (0.005 <= deltas["first_shelter_to_developed"]["changed_pixel_ratio"] <= 0.65):
        raise SystemExit(f"shelter→developed delta out of bounds {mode}: {deltas}")
    if deltas["camp_to_developed"]["changed_pixel_ratio"] <= deltas["camp_to_first_shelter"]["changed_pixel_ratio"]:
        raise SystemExit(f"developed state lacks larger visual growth {mode}: {deltas}")
    qa["deltas"][mode] = deltas

    if mode == "desktop":
        panel_w, panel_h = 480, 300
    else:
        panel_w, panel_h = 260, 562
    top = 42
    sheet = Image.new("RGB", (panel_w * 3, panel_h + top), (12, 14, 12))
    draw = ImageDraw.Draw(sheet)
    labels = ("CAMP", "FIRST SHELTER", "DEVELOPED SETTLEMENT")
    for index, (state, label) in enumerate(zip(states, labels)):
        image = Image.open(root / f"aurelian-{state}-{mode}.png").convert("RGB")
        sheet.paste(fit(image, panel_w, panel_h), (index * panel_w, top))
        draw.text((index * panel_w + 12, 12), label, fill=(245, 236, 196))
    sheet.save(root / f"contact-sheet-{mode}.png")

(root / "staged-progression-qa.json").write_text(json.dumps(qa, indent=2) + "\n")
print("AURELIAN_STAGED_PROGRESSION_QA_OK")
PY

cat > "$EVIDENCE/evidence-manifest.json" <<EOF
{
  "classification": "PENDING_DIRECT_VISUAL_REVIEW",
  "input_sha": "$(git rev-parse HEAD)",
  "accepted_source_head": "${ACCEPTED_SOURCE_HEAD}",
  "kaykit_commit": "${KAYKIT_SHA}",
  "kaykit_archive_sha256": "${ACTUAL_ARCHIVE_SHA}",
  "base_script_commit": "${BASE_SCRIPT_SHA}",
  "viewports": {
    "desktop": "1440x900",
    "portrait": "390x844"
  },
  "states": [
    "camp",
    "first_shelter",
    "developed_settlement"
  ]
}
EOF

find "$EVIDENCE" -type f ! -name SHA256SUMS.txt -print0 \
  | sort -z \
  | xargs -0 sha256sum > "$EVIDENCE/SHA256SUMS.txt"

echo "AURELIAN_STAGED_PROGRESSION_EVIDENCE_READY=$EVIDENCE"
