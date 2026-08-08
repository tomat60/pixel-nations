#!/usr/bin/env bash
set -euo pipefail

KAYKIT_SHA="84fa4e91af6a88989be7c99e0891cede11f2ca38"
KAYKIT_ARCHIVE_SHA="cfa7faff403c93fb90e8eeb448c78e6192782802a532bebed0bdb853b39f7028"
BASE_SCRIPT_SHA="d001d96117fc9d1de20f3ff57d7a47e2441a0393"
PROOF_RENDERER_SHA="a0728c4a1cede32249fbe13c99f4d5933d119c24"
WORK_ROOT="${RUNNER_TEMP:-/tmp}/pixel-nations-village-v4-reauthor"
RENDER_ROOT="$WORK_ROOT/render"
SOURCE_ROOT="$WORK_ROOT/source"
RUNTIME_DIR="$PWD/game/art_target/village_v4_reauthor"
REVIEW_DIR="$PWD/review/aurelian-village-v4-m2"

rm -rf "$WORK_ROOT" "$RUNTIME_DIR" "$REVIEW_DIR"
mkdir -p "$RENDER_ROOT" "$SOURCE_ROOT/src" "$RUNTIME_DIR" "$REVIEW_DIR"

sudo apt-get update -qq
sudo apt-get install -y -qq --no-install-recommends \
  blender python3-numpy python3-pil unzip xvfb libegl1 libgl1-mesa-dri \
  libglx-mesa0 libx11-6 libxcursor1 libxinerama1 libxi6 libxrandr2 >/dev/null

curl -fsSL --retry 3 \
  "https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0/archive/${KAYKIT_SHA}.zip" \
  -o "$SOURCE_ROOT/source.zip"
test "$(sha256sum "$SOURCE_ROOT/source.zip" | cut -d' ' -f1)" = "$KAYKIT_ARCHIVE_SHA"
unzip -q "$SOURCE_ROOT/source.zip" -d "$SOURCE_ROOT/src"
KAYKIT_ROOT="$(find "$SOURCE_ROOT/src" -mindepth 1 -maxdepth 1 -type d | head -1)"

curl -fsSL --retry 3 \
  "https://raw.githubusercontent.com/tomat60/pixel-nations/${BASE_SCRIPT_SHA}/tools/blender/aurelian_basin_master.py" \
  -o "$SOURCE_ROOT/aurelian_basin_master.py"
curl -fsSL --retry 3 \
  "https://raw.githubusercontent.com/tomat60/pixel-nations/${PROOF_RENDERER_SHA}/tools/blender/aurelian_village_v4_layers.py" \
  -o "$SOURCE_ROOT/aurelian_village_v4_layers.py"
curl -fsSL --retry 3 \
  "https://raw.githubusercontent.com/tomat60/pixel-nations/${PROOF_RENDERER_SHA}/tools/art/village_v4_extract_layers.py" \
  -o "$SOURCE_ROOT/village_v4_extract_layers.py"

# Single evidence-backed M2 correction: tighten portrait framing only.
# Desktop, topology, assets, roads, river and bridge remain frozen.
python3 - <<'PY'
from pathlib import Path
p = Path("tools/blender/aurelian_village_v4_reauthor.py")
s = p.read_text()
old = '"camera": {"position": (22, -190, 151), "target": (0, 31, 7), "ortho": 108.0, "resolution": (780, 1688)}'
new = '"camera": {"position": (22, -190, 151), "target": (0, 31, 7), "ortho": 94.0, "resolution": (780, 1688)}'
if s.count(old) != 1:
    raise SystemExit("Portrait camera contract changed; refusing broad correction.")
p.write_text(s.replace(old, new))
PY

export XDG_RUNTIME_DIR="${RUNNER_TEMP:-/tmp}/pixel-nations-village-v4-reauthor-xdg"
mkdir -p "$XDG_RUNTIME_DIR"
chmod 700 "$XDG_RUNTIME_DIR"

timeout 35m env LIBGL_ALWAYS_SOFTWARE=1 \
  xvfb-run -a -s "-screen 0 2200x1800x24" \
  blender -b \
  --python tools/blender/aurelian_village_v4_reauthor.py \
  -- "$SOURCE_ROOT/aurelian_village_v4_layers.py" "$SOURCE_ROOT/aurelian_basin_master.py" "$KAYKIT_ROOT" "$RENDER_ROOT" \
  2>&1 | tee "$REVIEW_DIR/blender.log"

python3 "$SOURCE_ROOT/village_v4_extract_layers.py" "$RENDER_ROOT" "$RUNTIME_DIR" "$REVIEW_DIR"

for mode in desktop portrait; do
  test -s "$RUNTIME_DIR/$mode/base-terrain.webp"
  test -s "$REVIEW_DIR/${mode}-stage-contact-sheet.webp"
  test -s "$REVIEW_DIR/${mode}-delta-contact-sheet.webp"
  test -s "$REVIEW_DIR/${mode}-shelter-proof.png"
  test -s "$REVIEW_DIR/${mode}-developed-master.png"
done

test -s "$RUNTIME_DIR/manifest.json"
test -s "$REVIEW_DIR/evidence-manifest.json"
test -s "$REVIEW_DIR/render-manifest.json"

python3 - "$REVIEW_DIR/evidence-manifest.json" <<'PY'
import json, sys
m=json.load(open(sys.argv[1]))
for mode in ("desktop","portrait"):
    b=m["modes"][mode]["developed_bounds"]
    # Deliberately stronger than the rejected proof's generic floor.
    if b["width_ratio"] < 0.55 or b["height_ratio"] < 0.48:
        raise SystemExit(f"{mode} Village V4 footprint still too small: {b}")
print("VILLAGE_V4_REAUTHOR_FOOTPRINT_GATE=PASS")
PY

find "$RUNTIME_DIR" "$REVIEW_DIR" -type f ! -name SHA256SUMS.txt -print0 \
  | sort -z | xargs -0 sha256sum > "$REVIEW_DIR/SHA256SUMS.txt"

echo "VILLAGE_V4_REAUTHOR_READY=$REVIEW_DIR"
