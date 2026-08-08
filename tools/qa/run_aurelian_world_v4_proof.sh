#!/usr/bin/env bash
set -euo pipefail
WORK_ROOT="${RUNNER_TEMP:-/tmp}/pixel-nations-world-v4"
RENDER_ROOT="$WORK_ROOT/render"
RUNTIME_DIR="$PWD/game/art_target/world_v4"
REVIEW_DIR="$PWD/review/aurelian-world-v4"
case "$WORK_ROOT" in */pixel-nations-world-v4) ;; *) exit 2 ;; esac
rm -rf "$WORK_ROOT" "$RUNTIME_DIR" "$REVIEW_DIR"
mkdir -p "$RENDER_ROOT" "$RUNTIME_DIR" "$REVIEW_DIR"
sudo apt-get update -qq
sudo apt-get install -y -qq --no-install-recommends blender python3-pil xvfb libegl1 libgl1-mesa-dri libglx-mesa0 libx11-6 libxcursor1 libxinerama1 libxi6 libxrandr2 >/dev/null
export XDG_RUNTIME_DIR="${RUNNER_TEMP:-/tmp}/pixel-nations-world-v4-xdg"
mkdir -p "$XDG_RUNTIME_DIR"; chmod 700 "$XDG_RUNTIME_DIR"
timeout 35m env LIBGL_ALWAYS_SOFTWARE=1 xvfb-run -a -s "-screen 0 2200x1800x24" blender -b --python tools/blender/aurelian_world_v4_continuity.py -- "$RENDER_ROOT" 2>&1 | tee "$REVIEW_DIR/blender.log"
python3 tools/art/world_v4_extract.py "$RENDER_ROOT" "$RUNTIME_DIR" "$REVIEW_DIR"
for zoom in basin region; do for view in master desktop portrait; do test -s "$RUNTIME_DIR/$zoom-$view.webp"; done; done
test -s "$RUNTIME_DIR/manifest.json"; test -s "$REVIEW_DIR/evidence-manifest.json"
for sheet in master desktop portrait; do test -s "$REVIEW_DIR/$sheet-contact-sheet.webp"; done
find "$RUNTIME_DIR" "$REVIEW_DIR" -type f ! -name SHA256SUMS.txt -print0 | sort -z | xargs -0 sha256sum > "$REVIEW_DIR/SHA256SUMS.txt"
echo "WORLD_V4_ART_PROOF_READY=$REVIEW_DIR"

