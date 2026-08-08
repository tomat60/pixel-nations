#!/usr/bin/env python3
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw

EXPECTED = {"basin": 30, "region": 25}

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def crop(image, ratio):
    w, h = image.size
    target = ratio[0] / ratio[1]
    if w / h > target:
        nw = round(h * target); return image.crop(((w - nw)//2, 0, (w + nw)//2, h))
    nh = round(w / target); return image.crop((0, (h - nh)//2, w, (h + nh)//2))

def sheet(items, output, panel):
    canvas = Image.new("RGB", (panel[0] * len(items), panel[1] + 36), (18, 21, 18))
    draw = ImageDraw.Draw(canvas)
    for i, (name, image) in enumerate(items):
        thumb = image.copy(); thumb.thumbnail(panel, Image.Resampling.LANCZOS)
        x = i * panel[0]
        draw.text((x + 10, 10), name.upper(), fill=(244, 229, 176))
        canvas.paste(thumb, (x + (panel[0]-thumb.width)//2, 36 + (panel[1]-thumb.height)//2))
    canvas.save(output, "WEBP", lossless=True, method=6)

def main():
    p=argparse.ArgumentParser(); p.add_argument("render",type=Path); p.add_argument("runtime",type=Path); p.add_argument("review",type=Path); a=p.parse_args()
    a.runtime.mkdir(parents=True,exist_ok=True); a.review.mkdir(parents=True,exist_ok=True)
    projection=json.loads((a.render/"projection-manifest.json").read_text())
    records={}; masters=[]; desktops=[]; portraits=[]
    for zoom,count in EXPECTED.items():
        cells=projection["zooms"][zoom]["cells"]
        if len(cells)!=count or any(len(c["world"])<3 for c in cells): raise SystemExit(f"invalid {zoom} cells")
        master=Image.open(a.render/f"{zoom}-master.png").convert("RGB")
        if master.size!=(2048,2048): raise SystemExit(f"invalid {zoom} master size")
        desktop=crop(master,(16,10)).resize((2048,1280),Image.Resampling.LANCZOS)
        portrait=crop(master,(390,844)).resize((780,1688),Image.Resampling.LANCZOS)
        outputs={"master":master,"desktop":desktop,"portrait":portrait}
        records[zoom]={}
        for kind,img in outputs.items():
            out=a.runtime/f"{zoom}-{kind}.webp"; img.save(out,"WEBP",lossless=True,method=6)
            decoded=Image.open(out).convert("RGB")
            if decoded.size!=img.size or decoded.tobytes()!=img.tobytes(): raise SystemExit(f"lossless failure {zoom}/{kind}")
            records[zoom][kind]={"path":out.name,"size":list(img.size),"sha256":sha(out)}
        masters.append((zoom,master)); desktops.append((zoom,desktop)); portraits.append((zoom,portrait))
    sheet(masters,a.review/"master-contact-sheet.webp",(640,640))
    sheet(desktops,a.review/"desktop-contact-sheet.webp",(640,400))
    sheet(portraits,a.review/"portrait-contact-sheet.webp",(260,563))
    evidence={"classification":"PENDING_DIRECT_VISUAL_REVIEW","contract":"WORLD_V4_CONTINUITY_PROOF","outputs":records,"projection":projection}
    (a.runtime/"manifest.json").write_text(json.dumps(evidence,indent=2)+"\n")
    (a.review/"evidence-manifest.json").write_text(json.dumps(evidence,indent=2)+"\n")
    print(f"WORLD_V4_EXTRACTION_OK={a.runtime}")
if __name__=="__main__": main()
