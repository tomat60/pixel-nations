#!/usr/bin/env bash
set -euo pipefail

GODOT_RELEASE="4.7.1-stable"
KAYKIT_SHA="84fa4e91af6a88989be7c99e0891cede11f2ca38"
EXPECTED_ARCHIVE_SHA="cfa7faff403c93fb90e8eeb448c78e6192782802a532bebed0bdb853b39f7028"
BASE_SCRIPT_SHA="d001d96117fc9d1de20f3ff57d7a47e2441a0393"
ACCEPTED_DESKTOP_PREVIEW_SHA="4abf789798ec27cb9d037a755f56062da3c0e9dd575f26ff013bc576d636df95"
ACCEPTED_PORTRAIT_PREVIEW_SHA="0c23af5b6f7894b6cca21c70c6a3488cb5346100575c13d2421df1e364bf197c"
ACCEPTED_DESKTOP_DHASH="e0e2656dabdb6393"
ACCEPTED_PORTRAIT_DHASH="31c6e6a218998361"
EVIDENCE="evidence/autonomous-aurelian-godot"

restore_project() {
  if [[ -f /tmp/project.godot.original ]]; then
    cp /tmp/project.godot.original game/project.godot
  fi
}
trap restore_project EXIT

rm -rf /tmp/kaykit /tmp/aurelian-base "$EVIDENCE" game/art_target/autonomous_aurelian
mkdir -p /tmp/kaykit/src /tmp/aurelian-base "$EVIDENCE" game/art_target/autonomous_aurelian

sudo apt-get update -qq
sudo apt-get install -y -qq --no-install-recommends blender python3-numpy python3-pil unzip xvfb libegl1 libgl1-mesa-dri libglx-mesa0 libx11-6 libxcursor1 libxinerama1 libxi6 libxrandr2 >/dev/null
blender --version | head -1
BLENDER_PYTHONPATH="$(python3 - <<'PY'
import pathlib
import numpy
print(pathlib.Path(numpy.__file__).resolve().parent.parent)
PY
)"
env PYTHONPATH="$BLENDER_PYTHONPATH" blender -b --python-expr "import numpy; print('BLENDER_NUMPY=' + numpy.__version__)"
python3 - <<'PY'
from PIL import Image
print('PIL_OK=' + Image.__version__)
PY

mkdir -p /tmp/godot
curl -fsSL --retry 3 "https://github.com/godotengine/godot/releases/download/${GODOT_RELEASE}/Godot_v${GODOT_RELEASE}_linux.x86_64.zip" -o /tmp/godot/godot.zip
unzip -q /tmp/godot/godot.zip -d /tmp/godot
GODOT="/tmp/godot/Godot_v${GODOT_RELEASE}_linux.x86_64"
chmod +x "$GODOT"
"$GODOT" --version

curl -fsSL --retry 3 "https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0/archive/${KAYKIT_SHA}.zip" -o /tmp/kaykit/source.zip
ACTUAL_ARCHIVE_SHA="$(sha256sum /tmp/kaykit/source.zip | cut -d' ' -f1)"
test "$ACTUAL_ARCHIVE_SHA" = "$EXPECTED_ARCHIVE_SHA"
unzip -q /tmp/kaykit/source.zip -d /tmp/kaykit/src
KAYKIT_ROOT="$(find /tmp/kaykit/src -mindepth 1 -maxdepth 1 -type d | head -1)"
curl -fsSL --retry 3 "https://raw.githubusercontent.com/tomat60/pixel-nations/${BASE_SCRIPT_SHA}/tools/blender/aurelian_basin_master.py" -o /tmp/aurelian-base/aurelian_basin_master.py
grep -F 'SOURCE_SHA = "84fa4e91af6a88989be7c99e0891cede11f2ca38"' /tmp/aurelian-base/aurelian_basin_master.py
curl -fsSL --retry 3 "https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0/${KAYKIT_SHA}/LICENSE.txt" -o "$EVIDENCE/LICENSE.txt"
grep -F 'Creative Commons Zero' "$EVIDENCE/LICENSE.txt"
git rev-parse HEAD > "$EVIDENCE/input-sha.txt"
git rev-parse HEAD > "$EVIDENCE/output-sha.txt"
printf '%s  %s\n' "$ACTUAL_ARCHIVE_SHA" source.zip > "$EVIDENCE/source-archive.sha256"

export XDG_RUNTIME_DIR="${RUNNER_TEMP:-/tmp}/xdg-runtime"
mkdir -p "$XDG_RUNTIME_DIR"
chmod 700 "$XDG_RUNTIME_DIR"
timeout 15m env PYTHONPATH="$BLENDER_PYTHONPATH" LIBGL_ALWAYS_SOFTWARE=1 xvfb-run -a -s "-screen 0 1600x1200x24" blender -b --python tools/blender/aurelian_autonomous_override.py -- /tmp/aurelian-base/aurelian_basin_master.py "$KAYKIT_ROOT" "$PWD/$EVIDENCE" 2>&1 | tee "$EVIDENCE/blender.log"
grep -F 'AUTONOMOUS_GLB_EXPORTED=desktop' "$EVIDENCE/blender.log"
grep -F 'AUTONOMOUS_GLB_EXPORTED=portrait' "$EVIDENCE/blender.log"

ACCEPTED_DESKTOP_PREVIEW_SHA="$ACCEPTED_DESKTOP_PREVIEW_SHA" \
ACCEPTED_PORTRAIT_PREVIEW_SHA="$ACCEPTED_PORTRAIT_PREVIEW_SHA" \
ACCEPTED_DESKTOP_DHASH="$ACCEPTED_DESKTOP_DHASH" \
ACCEPTED_PORTRAIT_DHASH="$ACCEPTED_PORTRAIT_DHASH" \
python3 - <<'PY'
import hashlib, json, os
from pathlib import Path
from PIL import Image
root = Path('evidence/autonomous-aurelian-godot')
def dhash(path):
    image = Image.open(path).convert('L').resize((9,8), Image.Resampling.LANCZOS)
    pixels = list(image.getdata())
    value = 0
    for y in range(8):
        row = pixels[y*9:(y+1)*9]
        for x in range(8):
            value = (value << 1) | int(row[x] > row[x+1])
    return f'{value:016x}'
actual = {'desktop': dhash(root/'autonomous-desktop-preview.png'), 'portrait': dhash(root/'autonomous-portrait-preview.png')}
expected = {'desktop': os.environ['ACCEPTED_DESKTOP_DHASH'], 'portrait': os.environ['ACCEPTED_PORTRAIT_DHASH']}
if actual != expected:
    raise SystemExit(f'accepted preview perceptual drift: actual={actual} expected={expected}')
report = {mode:{'accepted_byte_sha256':os.environ[f'ACCEPTED_{mode.upper()}_PREVIEW_SHA'],'reproduced_byte_sha256':hashlib.sha256((root/f'autonomous-{mode}-preview.png').read_bytes()).hexdigest(),'accepted_dhash':expected[mode],'reproduced_dhash':actual[mode]} for mode in ('desktop','portrait')}
(root/'preview-reproduction.json').write_text(json.dumps(report,indent=2)+'\n')
print('ACCEPTED_PREVIEW_PERCEPTUAL_REPRODUCTION_OK')
PY

test "$(stat -c%s "$EVIDENCE/autonomous-desktop.glb")" -gt 500000
test "$(stat -c%s "$EVIDENCE/autonomous-portrait.glb")" -gt 500000
cp "$EVIDENCE/autonomous-desktop.glb" game/art_target/autonomous_aurelian/
cp "$EVIDENCE/autonomous-portrait.glb" game/art_target/autonomous_aurelian/

"$GODOT" --headless --path game --editor --quit 2>&1 | tee "$EVIDENCE/godot-import.log"
! grep -E 'SCRIPT ERROR|Parse Error|Failed to load' "$EVIDENCE/godot-import.log"
test -d game/.godot/imported
cp game/project.godot /tmp/project.godot.original

patch_project_dimensions() {
  local width="$1"
  local height="$2"
  cp /tmp/project.godot.original game/project.godot
  python3 - "$width" "$height" <<'PY'
import re, sys
from pathlib import Path
width, height = map(int, sys.argv[1:])
path = Path('game/project.godot')
text = path.read_text()
for key, value in {
    'window/size/viewport_width': width,
    'window/size/viewport_height': height,
    'window/size/window_width_override': width,
    'window/size/window_height_override': height,
}.items():
    text, count = re.subn(rf'^{re.escape(key)}=\d+$', f'{key}={value}', text, flags=re.MULTILINE)
    if count != 1:
        raise SystemExit(f'project setting replacement failed: {key} count={count}')
path.write_text(text)
PY
}

select_movie_frame() {
  local mode="$1"
  local width="$2"
  local height="$3"
  python3 - "$mode" "$width" "$height" <<'PY'
import hashlib, json, shutil, sys
from pathlib import Path
from PIL import Image, ImageStat
mode, width, height = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
root = Path('evidence/autonomous-aurelian-godot')
frames = sorted(root.glob(f'{mode}-frame????????.png'))
if not frames:
    raise SystemExit(f'no MovieWriter frames found for {mode}')
records = []
valid = []
for path in frames:
    image = Image.open(path).convert('RGB')
    stat = ImageStat.Stat(image)
    luminance = sum(stat.mean) / 3.0
    variance = sum(stat.var) / 3.0
    sample = list(image.resize((240,150)).getdata())
    unique_sample_colors = len(set(sample))
    black_fraction = sum(1 for pixel in sample if max(pixel) < 5) / len(sample)
    record = {
        'name': path.name,
        'width': image.width,
        'height': image.height,
        'bytes': path.stat().st_size,
        'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
        'luminance': round(luminance, 6),
        'variance': round(variance, 6),
        'unique_sample_colors': unique_sample_colors,
        'black_fraction': round(black_fraction, 6),
    }
    records.append(record)
    if image.size == (width, height):
        valid.append((variance, unique_sample_colors, path.stat().st_size, path, record))
if not valid:
    raise SystemExit(f'no exact-size MovieWriter frames for {mode}: {records}')
valid.sort(key=lambda item: (item[0], item[1], item[2]))
selected = valid[-1]
first = valid[0][3]
last = valid[-1][3] if valid[-1][3] == frames[-1] else frames[-1]
output = root / (f'godot-desktop-1440x900.png' if mode == 'desktop' else f'godot-portrait-390x844.png')
shutil.copy2(selected[3], output)
shutil.copy2(frames[0], root / f'{mode}-movie-first.png')
shutil.copy2(frames[-1], root / f'{mode}-movie-last.png')
report = {
    'mode': mode,
    'expected_dimensions': [width, height],
    'frame_count': len(frames),
    'selection_rule': 'max_variance_then_unique_sample_colors_then_bytes',
    'selected': selected[4],
    'first_frame': records[0],
    'last_frame': records[-1],
    'frames': records,
}
(root / f'{mode}-frame-selection.json').write_text(json.dumps(report, indent=2) + '\n')
print(f'MOVIE_FRAME_SELECTED={mode}:{selected[3].name}:variance={selected[0]:.6f}:colors={selected[1]}:bytes={selected[2]}')
PY
  rm -f "$EVIDENCE/${mode}-frame"????????.png "$EVIDENCE/${mode}-frame.wav"
}

capture_mode() {
  local mode="$1"
  local width="$2"
  local height="$3"
  patch_project_dimensions "$width" "$height"
  rm -f "$EVIDENCE/${mode}-frame"*.png "$EVIDENCE/${mode}-frame.wav"
  timeout 90s xvfb-run -a -s "-screen 0 ${width}x${height}x24" env CAPTURE_MODE="$mode" CAPTURE_WIDTH="$width" CAPTURE_HEIGHT="$height" CONTRACT_PATH="$PWD/$EVIDENCE/godot-${mode}-contract.json" "$GODOT" --path game --audio-driver Dummy --rendering-method gl_compatibility --resolution "${width}x${height}" --position 0,0 --write-movie "$PWD/$EVIDENCE/${mode}-frame.png" --fixed-fps 30 --quit-after 24 --disable-vsync res://scenes/art_target/autonomous_aurelian_capture.tscn 2>&1 | tee "$EVIDENCE/godot-${mode}.log"
  grep -F 'Movie Maker mode enabled' "$EVIDENCE/godot-${mode}.log"
  grep -F 'AUTONOMOUS_GODOT_MATERIAL_SURFACES=' "$EVIDENCE/godot-${mode}.log"
  grep -F 'AUTONOMOUS_GODOT_TEXTURED_SURFACES=' "$EVIDENCE/godot-${mode}.log"
  grep -F "AUTONOMOUS_GODOT_SCENE_READY=${mode}" "$EVIDENCE/godot-${mode}.log"
  select_movie_frame "$mode" "$width" "$height"
}

capture_mode desktop 1440 900
capture_mode portrait 390 844
restore_project
! grep -E 'SCRIPT ERROR|Parse Error|Failed to load' "$EVIDENCE/godot-desktop.log" "$EVIDENCE/godot-portrait.log"
echo AUTONOMOUS_GODOT_MOVIE_FRAMES_CAPTURED

python3 - <<'PY'
import hashlib, json
from pathlib import Path
from PIL import Image, ImageStat
root = Path('evidence/autonomous-aurelian-godot')
expected = {'godot-desktop-1440x900.png': (1440,900), 'godot-portrait-390x844.png': (390,844)}
qa = {}
for name, dims in expected.items():
    path = root / name
    if not path.exists():
        raise SystemExit(f'missing Godot PNG: {name}')
    image = Image.open(path).convert('RGB')
    if image.size != dims:
        raise SystemExit(f'wrong Godot dimensions {name}: {image.size}')
    stat = ImageStat.Stat(image)
    luminance = sum(stat.mean) / 3.0
    variance = sum(stat.var) / 3.0
    pixels = list(image.resize((240,150)).getdata())
    near_white = sum(1 for p in pixels if min(p) > 245) / len(pixels)
    unique_sample_colors = len(set(pixels))
    if path.stat().st_size < 20000 or variance < 45.0 or luminance < 30.0 or luminance > 215.0 or near_white > 0.05 or unique_sample_colors < 64:
        raise SystemExit(f'Godot image QA failed {name}: bytes={path.stat().st_size} lum={luminance:.2f} var={variance:.2f} white={near_white:.4f} colors={unique_sample_colors}')
    qa[name] = {'width':dims[0],'height':dims[1],'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'luminance':round(luminance,3),'variance':round(variance,3),'near_white':round(near_white,5),'unique_sample_colors':unique_sample_colors}
contracts = {}
for contract_name in ('godot-desktop-contract.json','godot-portrait-contract.json'):
    contract = json.loads((root/contract_name).read_text())
    if contract['camera_nodes'] < 1 or contract['mesh_instances'] < 20 or contract['normalized_material_surfaces'] < 20 or contract['normalized_textured_surfaces'] < 10 or contract['normalized_color_surfaces'] < 7:
        raise SystemExit(f'invalid imported scene contract: {contract}')
    if contract['camera']['projection'] != 'orthogonal':
        raise SystemExit('imported camera is not orthogonal')
    contracts[contract_name] = contract
input_sha = (root/'input-sha.txt').read_text().strip()
output_sha = (root/'output-sha.txt').read_text().strip()
if input_sha != output_sha:
    raise SystemExit('input/output SHA mismatch')
final = {
    'classification':'PENDING_DIRECT_VISUAL_REVIEW',
    'input_sha':input_sha,
    'output_sha':output_sha,
    'source_commit':'84fa4e91af6a88989be7c99e0891cede11f2ca38',
    'preview_reproduction':json.loads((root/'preview-reproduction.json').read_text()),
    'frame_selection': {
        'desktop': json.loads((root/'desktop-frame-selection.json').read_text()),
        'portrait': json.loads((root/'portrait-frame-selection.json').read_text()),
    },
    'godot_images':qa,
    'contracts':contracts,
}
(root/'final-contract.json').write_text(json.dumps(final,indent=2)+'\n')
print('AUTONOMOUS_GODOT_EVIDENCE_OK')
PY

find "$EVIDENCE" -type f ! -name SHA256SUMS.txt -print0 | sort -z | xargs -0 sha256sum > "$EVIDENCE/SHA256SUMS.txt"
echo AUTONOMOUS_AURELIAN_GODOT_PROOF_COMPLETE
