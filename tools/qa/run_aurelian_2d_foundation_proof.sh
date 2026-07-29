#!/usr/bin/env bash
set -euo pipefail

GODOT_RELEASE="4.7.1-stable"
KAYKIT_SHA="84fa4e91af6a88989be7c99e0891cede11f2ca38"
EXPECTED_ARCHIVE_SHA="cfa7faff403c93fb90e8eeb448c78e6192782802a532bebed0bdb853b39f7028"
BASE_SCRIPT_SHA="d001d96117fc9d1de20f3ff57d7a47e2441a0393"
ACCEPTED_OVERRIDE_SHA="5a9e99b059337684aebb1a7e57d0aa413b22d04d"
ACCEPTED_DESKTOP_PREVIEW_SHA="4abf789798ec27cb9d037a755f56062da3c0e9dd575f26ff013bc576d636df95"
ACCEPTED_PORTRAIT_PREVIEW_SHA="0c23af5b6f7894b6cca21c70c6a3488cb5346100575c13d2421df1e364bf197c"
ACCEPTED_DESKTOP_DHASH="e0e2656dabdb6393"
ACCEPTED_PORTRAIT_DHASH="31c6e6a218998361"
EVIDENCE="evidence/aurelian-2d-foundation"
ASSET_DIR="game/art_target/aurelian_2d"

restore_project() {
  if [[ -f /tmp/aurelian-2d-project.godot.original ]]; then
    cp /tmp/aurelian-2d-project.godot.original game/project.godot
  fi
}
trap restore_project EXIT

rm -rf /tmp/kaykit /tmp/aurelian-base /tmp/aurelian-accepted "$EVIDENCE" "$ASSET_DIR"
mkdir -p /tmp/kaykit/src /tmp/aurelian-base /tmp/aurelian-accepted "$EVIDENCE" "$ASSET_DIR"

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
import numpy
print('PIL_OK=' + Image.__version__)
print('NUMPY_OK=' + numpy.__version__)
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
curl -fsSL --retry 3 "https://raw.githubusercontent.com/tomat60/pixel-nations/${ACCEPTED_OVERRIDE_SHA}/tools/blender/aurelian_autonomous_override.py" -o /tmp/aurelian-accepted/aurelian_autonomous_override.py
grep -F 'AUTONOMOUS_DCC_PASS_3' /tmp/aurelian-accepted/aurelian_autonomous_override.py
curl -fsSL --retry 3 "https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0/${KAYKIT_SHA}/LICENSE.txt" -o "$EVIDENCE/LICENSE.txt"
grep -F 'Creative Commons Zero' "$EVIDENCE/LICENSE.txt"
git rev-parse HEAD > "$EVIDENCE/input-sha.txt"
git rev-parse HEAD > "$EVIDENCE/output-sha.txt"
printf '%s  %s\n' "$ACTUAL_ARCHIVE_SHA" source.zip > "$EVIDENCE/source-archive.sha256"

export XDG_RUNTIME_DIR="${RUNNER_TEMP:-/tmp}/xdg-runtime"
mkdir -p "$XDG_RUNTIME_DIR"
chmod 700 "$XDG_RUNTIME_DIR"
timeout 15m env PYTHONPATH="$BLENDER_PYTHONPATH" LIBGL_ALWAYS_SOFTWARE=1 xvfb-run -a -s "-screen 0 1600x1200x24" blender -b --python /tmp/aurelian-accepted/aurelian_autonomous_override.py -- /tmp/aurelian-base/aurelian_basin_master.py "$KAYKIT_ROOT" "$PWD/$EVIDENCE" 2>&1 | tee "$EVIDENCE/blender.log"
grep -F 'AUTONOMOUS_PREVIEW_EXPORTED=desktop' "$EVIDENCE/blender.log"
grep -F 'AUTONOMOUS_PREVIEW_EXPORTED=portrait' "$EVIDENCE/blender.log"

ACCEPTED_DESKTOP_PREVIEW_SHA="$ACCEPTED_DESKTOP_PREVIEW_SHA" \
ACCEPTED_PORTRAIT_PREVIEW_SHA="$ACCEPTED_PORTRAIT_PREVIEW_SHA" \
ACCEPTED_DESKTOP_DHASH="$ACCEPTED_DESKTOP_DHASH" \
ACCEPTED_PORTRAIT_DHASH="$ACCEPTED_PORTRAIT_DHASH" \
python3 - <<'PY'
import hashlib, json, os
from pathlib import Path
from PIL import Image
root = Path('evidence/aurelian-2d-foundation')
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
    raise SystemExit(f'accepted visual drift: actual={actual} expected={expected}')
report = {mode:{'accepted_byte_sha256':os.environ[f'ACCEPTED_{mode.upper()}_PREVIEW_SHA'],'reproduced_byte_sha256':hashlib.sha256((root/f'autonomous-{mode}-preview.png').read_bytes()).hexdigest(),'accepted_dhash':expected[mode],'reproduced_dhash':actual[mode]} for mode in ('desktop','portrait')}
(root/'accepted-render-reproduction.json').write_text(json.dumps(report,indent=2)+'\n')
print('ACCEPTED_AURELIAN_RENDERS_REPRODUCED')
PY

cp "$EVIDENCE/autonomous-desktop-preview.png" "$ASSET_DIR/aurelian-desktop.png"
cp "$EVIDENCE/autonomous-portrait-preview.png" "$ASSET_DIR/aurelian-portrait.png"

"$GODOT" --headless --path game --editor --quit 2>&1 | tee "$EVIDENCE/godot-import.log"
! grep -E 'SCRIPT ERROR|Parse Error|Failed to load' "$EVIDENCE/godot-import.log"
test -d game/.godot/imported
cp game/project.godot /tmp/aurelian-2d-project.godot.original

patch_project_dimensions() {
  local width="$1"
  local height="$2"
  cp /tmp/aurelian-2d-project.godot.original game/project.godot
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

select_frame() {
  local mode="$1"
  local width="$2"
  local height="$3"
  python3 - "$mode" "$width" "$height" <<'PY'
import hashlib, json, shutil, sys
from pathlib import Path
from PIL import Image, ImageStat
mode, width, height = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
root = Path('evidence/aurelian-2d-foundation')
frames = sorted(root.glob(f'{mode}-frame????????.png'))
if not frames:
    raise SystemExit(f'no MovieWriter frames for {mode}')
records=[]
valid=[]
for path in frames:
    image=Image.open(path).convert('RGB')
    stat=ImageStat.Stat(image)
    variance=sum(stat.var)/3.0
    luminance=sum(stat.mean)/3.0
    sample=list(image.resize((240,150)).getdata())
    colors=len(set(sample))
    record={'name':path.name,'width':image.width,'height':image.height,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'luminance':round(luminance,6),'variance':round(variance,6),'unique_sample_colors':colors}
    records.append(record)
    if image.size==(width,height):
        valid.append((variance,colors,path.stat().st_size,path,record))
if not valid:
    raise SystemExit(f'no exact-size frames for {mode}: {records}')
valid.sort(key=lambda item:(item[0],item[1],item[2]))
selected=valid[-1]
output=root/(f'godot-desktop-1440x900.png' if mode=='desktop' else 'godot-portrait-390x844.png')
shutil.copy2(selected[3],output)
shutil.copy2(frames[0],root/f'{mode}-movie-first.png')
shutil.copy2(frames[-1],root/f'{mode}-movie-last.png')
(root/f'{mode}-frame-selection.json').write_text(json.dumps({'mode':mode,'frame_count':len(frames),'selection_rule':'max_variance_then_colors_then_bytes','selected':selected[4],'first':records[0],'last':records[-1],'frames':records},indent=2)+'\n')
print(f'AURELIAN_2D_FRAME_SELECTED={mode}:{selected[3].name}:variance={selected[0]:.6f}:colors={selected[1]}:bytes={selected[2]}')
PY
  rm -f "$EVIDENCE/${mode}-frame"????????.png "$EVIDENCE/${mode}-frame.wav"
}

capture_mode() {
  local mode="$1"
  local width="$2"
  local height="$3"
  patch_project_dimensions "$width" "$height"
  rm -f "$EVIDENCE/${mode}-frame"*.png "$EVIDENCE/${mode}-frame.wav"
  timeout 60s xvfb-run -a -s "-screen 0 ${width}x${height}x24" env CAPTURE_MODE="$mode" CAPTURE_WIDTH="$width" CAPTURE_HEIGHT="$height" CONTRACT_PATH="$PWD/$EVIDENCE/godot-${mode}-contract.json" "$GODOT" --path game --audio-driver Dummy --rendering-method gl_compatibility --resolution "${width}x${height}" --position 0,0 --write-movie "$PWD/$EVIDENCE/${mode}-frame.png" --fixed-fps 30 --quit-after 12 --disable-vsync res://scenes/art_target/aurelian_2d_capture.tscn 2>&1 | tee "$EVIDENCE/godot-${mode}.log"
  grep -F "AURELIAN_2D_MAP_READY=${mode}" "$EVIDENCE/godot-${mode}.log"
  select_frame "$mode" "$width" "$height"
}

capture_mode desktop 1440 900
capture_mode portrait 390 844
restore_project
! grep -E 'SCRIPT ERROR|Parse Error|Failed to load' "$EVIDENCE/godot-desktop.log" "$EVIDENCE/godot-portrait.log"

python3 - <<'PY'
import hashlib, json
from pathlib import Path
import numpy as np
from PIL import Image, ImageStat
root=Path('evidence/aurelian-2d-foundation')
pairs={
    'desktop':(root/'autonomous-desktop-preview.png',root/'godot-desktop-1440x900.png',(1440,900)),
    'portrait':(root/'autonomous-portrait-preview.png',root/'godot-portrait-390x844.png',(390,844)),
}
def dhash(path):
    image=Image.open(path).convert('L').resize((9,8),Image.Resampling.LANCZOS)
    pixels=list(image.getdata()); value=0
    for y in range(8):
        row=pixels[y*9:(y+1)*9]
        for x in range(8): value=(value<<1)|int(row[x]>row[x+1])
    return f'{value:016x}'
qa={}
for mode,(source_path,captured_path,dims) in pairs.items():
    source=Image.open(source_path).convert('RGB')
    captured=Image.open(captured_path).convert('RGB')
    if source.size!=dims or captured.size!=dims:
        raise SystemExit(f'dimension mismatch {mode}: source={source.size} captured={captured.size}')
    source_hash=dhash(source_path); captured_hash=dhash(captured_path)
    if source_hash!=captured_hash:
        raise SystemExit(f'perceptual hash mismatch {mode}: source={source_hash} captured={captured_hash}')
    a=np.asarray(source,dtype=np.int16); b=np.asarray(captured,dtype=np.int16)
    delta=np.abs(a-b)
    mae=float(delta.mean()); p99=float(np.percentile(delta,99)); max_error=int(delta.max())
    stat=ImageStat.Stat(captured)
    luminance=sum(stat.mean)/3.0; variance=sum(stat.var)/3.0
    sample=list(captured.resize((240,150)).getdata()); colors=len(set(sample))
    if captured_path.stat().st_size<20000 or variance<45 or colors<256 or mae>3.0 or p99>12.0:
        raise SystemExit(f'2D proof QA failed {mode}: bytes={captured_path.stat().st_size} variance={variance:.3f} colors={colors} mae={mae:.4f} p99={p99:.2f} max={max_error}')
    contract=json.loads((root/f'godot-{mode}-contract.json').read_text())
    if contract['node_3d_count']!=0 or contract['canvas_item_count']!=1 or contract['texture_width']!=dims[0] or contract['texture_height']!=dims[1]:
        raise SystemExit(f'invalid 2D contract {mode}: {contract}')
    qa[mode]={'source_sha256':hashlib.sha256(source_path.read_bytes()).hexdigest(),'captured_sha256':hashlib.sha256(captured_path.read_bytes()).hexdigest(),'source_dhash':source_hash,'captured_dhash':captured_hash,'bytes':captured_path.stat().st_size,'luminance':round(luminance,3),'variance':round(variance,3),'unique_sample_colors':colors,'mean_absolute_error':round(mae,6),'p99_channel_error':round(p99,3),'max_channel_error':max_error,'contract':contract}
input_sha=(root/'input-sha.txt').read_text().strip(); output_sha=(root/'output-sha.txt').read_text().strip()
if input_sha!=output_sha: raise SystemExit('input/output SHA mismatch')
final={'classification':'PENDING_DIRECT_VISUAL_REVIEW','input_sha':input_sha,'output_sha':output_sha,'source_commit':'84fa4e91af6a88989be7c99e0891cede11f2ca38','accepted_override_commit':'5a9e99b059337684aebb1a7e57d0aa413b22d04d','accepted_render_reproduction':json.loads((root/'accepted-render-reproduction.json').read_text()),'godot_2d_qa':qa,'frame_selection':{'desktop':json.loads((root/'desktop-frame-selection.json').read_text()),'portrait':json.loads((root/'portrait-frame-selection.json').read_text())}}
(root/'final-contract.json').write_text(json.dumps(final,indent=2)+'\n')
print('AURELIAN_2D_FOUNDATION_EVIDENCE_OK')
PY

find "$EVIDENCE" -type f ! -name SHA256SUMS.txt -print0 | sort -z | xargs -0 sha256sum > "$EVIDENCE/SHA256SUMS.txt"
echo AURELIAN_2D_FOUNDATION_PROOF_COMPLETE
