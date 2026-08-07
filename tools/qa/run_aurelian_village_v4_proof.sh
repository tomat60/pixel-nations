#!/usr/bin/env bash
set -euo pipefail

KAYKIT_SHA="84fa4e91af6a88989be7c99e0891cede11f2ca38"
KAYKIT_ARCHIVE_SHA="cfa7faff403c93fb90e8eeb448c78e6192782802a532bebed0bdb853b39f7028"
BASE_SCRIPT_SHA="d001d96117fc9d1de20f3ff57d7a47e2441a0393"
WORK_ROOT="${RUNNER_TEMP:-/tmp}/pixel-nations-village-v4"
RENDER_ROOT="$WORK_ROOT/render"
SOURCE_ROOT="$WORK_ROOT/source"
RUNTIME_DIR="$PWD/game/art_target/village_v4"
REVIEW_DIR="$PWD/review/aurelian-village-v4-m1"

test -f "$PWD/package.json"
test -f "$PWD/AGENTS.md"
case "$WORK_ROOT" in
  */pixel-nations-village-v4) ;;
  *) echo "Unsafe Village V4 work root: $WORK_ROOT" >&2; exit 2 ;;
esac
case "$RUNTIME_DIR" in
  "$PWD"/game/art_target/village_v4) ;;
  *) echo "Unsafe Village V4 runtime root: $RUNTIME_DIR" >&2; exit 2 ;;
esac
case "$REVIEW_DIR" in
  "$PWD"/review/aurelian-village-v4-m1) ;;
  *) echo "Unsafe Village V4 review root: $REVIEW_DIR" >&2; exit 2 ;;
esac

rm -rf "$WORK_ROOT" "$RUNTIME_DIR" "$REVIEW_DIR"
mkdir -p "$RENDER_ROOT" "$SOURCE_ROOT/src" "$RUNTIME_DIR" "$REVIEW_DIR"

sudo apt-get update -qq
sudo apt-get install -y -qq --no-install-recommends \
  blender python3-numpy python3-pil unzip xvfb libegl1 libgl1-mesa-dri \
  libglx-mesa0 libx11-6 libxcursor1 libxinerama1 libxi6 libxrandr2 >/dev/null

blender --version | head -1
curl -fsSL --retry 3 \
  "https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0/archive/${KAYKIT_SHA}.zip" \
  -o "$SOURCE_ROOT/source.zip"
ACTUAL_ARCHIVE_SHA="$(sha256sum "$SOURCE_ROOT/source.zip" | cut -d' ' -f1)"
test "$ACTUAL_ARCHIVE_SHA" = "$KAYKIT_ARCHIVE_SHA"
unzip -q "$SOURCE_ROOT/source.zip" -d "$SOURCE_ROOT/src"
KAYKIT_ROOT="$(find "$SOURCE_ROOT/src" -mindepth 1 -maxdepth 1 -type d | head -1)"

curl -fsSL --retry 3 \
  "https://raw.githubusercontent.com/tomat60/pixel-nations/${BASE_SCRIPT_SHA}/tools/blender/aurelian_basin_master.py" \
  -o "$SOURCE_ROOT/aurelian_basin_master.py"
grep -F "SOURCE_SHA = \"${KAYKIT_SHA}\"" "$SOURCE_ROOT/aurelian_basin_master.py"

curl -fsSL --retry 3 \
  "https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0/${KAYKIT_SHA}/LICENSE.txt" \
  -o "$REVIEW_DIR/LICENSE.txt"
grep -F "Creative Commons Zero" "$REVIEW_DIR/LICENSE.txt"

export XDG_RUNTIME_DIR="${RUNNER_TEMP:-/tmp}/pixel-nations-village-v4-xdg"
mkdir -p "$XDG_RUNTIME_DIR"
chmod 700 "$XDG_RUNTIME_DIR"

timeout 35m env LIBGL_ALWAYS_SOFTWARE=1 \
  xvfb-run -a -s "-screen 0 2200x1800x24" \
  blender -b \
  --python tools/blender/aurelian_village_v4_layers.py \
  -- "$SOURCE_ROOT/aurelian_basin_master.py" "$KAYKIT_ROOT" "$RENDER_ROOT" \
  2>&1 | tee "$REVIEW_DIR/blender.log"

python3 tools/art/village_v4_extract_layers.py "$RENDER_ROOT" "$RUNTIME_DIR" "$REVIEW_DIR"

for mode in desktop portrait; do
  test -s "$RUNTIME_DIR/$mode/base-terrain.webp"
  for entry in \
    01-camp 02-shelter 03-food 04-timber 05-scout \
    06-storehouse 07-market 08-watch 09-council; do
    test -s "$RUNTIME_DIR/$mode/stage-${entry}.webp"
  done
  test -s "$REVIEW_DIR/${mode}-stage-contact-sheet.webp"
  test -s "$REVIEW_DIR/${mode}-delta-contact-sheet.webp"
  test -s "$REVIEW_DIR/${mode}-shelter-proof.png"
  test -s "$REVIEW_DIR/${mode}-developed-master.png"
done
test -s "$RUNTIME_DIR/manifest.json"
test -s "$REVIEW_DIR/evidence-manifest.json"
test -s "$REVIEW_DIR/render-manifest.json"

find "$RUNTIME_DIR" "$REVIEW_DIR" -type f ! -name SHA256SUMS.txt -print0 \
  | sort -z \
  | xargs -0 sha256sum > "$REVIEW_DIR/SHA256SUMS.txt"

echo "VILLAGE_V4_ART_PROOF_READY=$REVIEW_DIR"
echo "VILLAGE_V4_RUNTIME_LAYERS_READY=$RUNTIME_DIR"
echo "VILLAGE_V4_FULL_RENDER_ROOT=$RENDER_ROOT"
