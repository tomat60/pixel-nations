import { escapeHtml } from "./qa-village-progression-lib.mjs";

const imageDataUri = (buffer) => `data:image/png;base64,${buffer.toString("base64")}`;

export async function createContactSheet(browser, filePath, title, rows) {
  const page = await browser.newPage({ viewport: { width: 1960, height: 1080 } });
  const htmlRows = rows.map((row) => {
    const cells = row.frameBuffers.map((buffer, index) => {
      const frame = row.frames[index];
      return `<figure><img src="${imageDataUri(buffer)}"><figcaption>${escapeHtml(frame.phase)}<br>t=${frame.timestampMs.toFixed(1)}ms</figcaption></figure>`;
    }).join("");
    return `<section><h2>${escapeHtml(row.label)} · ${escapeHtml(row.orderId)}</h2><div class="strip">${cells}</div></section>`;
  }).join("");

  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    body{margin:0;padding:20px;background:#070b0c;color:#f7ead2;font-family:ui-monospace,monospace}
    h1{font-size:24px;margin:0 0 20px}h2{font-size:15px;margin:18px 0 8px}
    .strip{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}
    figure{margin:0;background:#111;border:1px solid #39413d;border-radius:6px;overflow:hidden}
    img{display:block;width:100%;height:auto}figcaption{padding:5px 7px;font-size:10px;line-height:1.35}
  </style></head><body><h1>${escapeHtml(title)}</h1>${htmlRows}</body></html>`, { waitUntil: "load" });
  await page.screenshot({ path: filePath, fullPage: true });
  await page.close();
}

export function buildReport(manifest) {
  const rows = manifest.transitions.map((transition) => `<tr>
    <td>${escapeHtml(transition.label)}</td><td>${escapeHtml(transition.orderId)}</td>
    <td>${transition.visibleDelta}</td><td>${transition.stateDelta}</td><td>${transition.selectorDelta}</td>
    <td>${transition.expectedSelectorAppeared ?? "n/a"}</td><td>${transition.measuredTransitionWindowMs.toFixed(1)}ms</td>
  </tr>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Village progression evidence</title><style>
    body{background:#0b0f10;color:#f7ead2;font-family:sans-serif;padding:24px}a{color:#facc15}
    table{border-collapse:collapse;width:100%}th,td{border:1px solid #444;padding:7px;font-size:12px;text-align:left}
  </style></head><body><h1>Village progression evidence</h1>
  <p>Commit: <code>${escapeHtml(manifest.commitSha)}</code></p>
  <p>Run/ref: ${escapeHtml(manifest.githubRunId ?? "local")} / ${escapeHtml(manifest.githubRef ?? "unknown")}</p>
  <p>Village V2 flag: <code>${escapeHtml(manifest.villageV2Flag)}</code></p>
  <p><a href="videos/desktop-village-progression.webm">Raw continuous Playwright WebM</a> · ${manifest.video.byteSize} bytes · SHA-256 ${manifest.video.sha256}</p>
  <table><thead><tr><th>Transition</th><th>Order</th><th>Visual</th><th>State</th><th>Selector</th><th>Stage appeared</th><th>Window</th></tr></thead><tbody>${rows}</tbody></table>
  <p>Warnings: ${manifest.warnings.length ? escapeHtml(manifest.warnings.join(" | ")) : "none"}</p></body></html>`;
}
