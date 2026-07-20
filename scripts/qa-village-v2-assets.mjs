import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const ASSET_DIR = path.join(ROOT, "public/assets/village-v2");
const REPORT_DIR = path.join(ROOT, "public/qa/village-v2-assets");
const REPORT_PATH = path.join(REPORT_DIR, "village-v2-assets-result.json");
const REQUIRED_WIDTH = 2048;
const REQUIRED_HEIGHT = 1152;

const EXPECTED_ASSETS = [
  { id: "base", file: "base-terrain.webp", alpha: false, maxBytes: 1_500_000 },
  { id: "camp", file: "stage-01-camp.webp", alpha: true, maxBytes: 1_000_000 },
  { id: "shelter", file: "stage-02-shelter.webp", alpha: true, maxBytes: 1_000_000 },
  { id: "food", file: "stage-03-food.webp", alpha: true, maxBytes: 1_000_000 },
  { id: "timber", file: "stage-04-timber.webp", alpha: true, maxBytes: 1_000_000 },
  { id: "storehouse", file: "stage-05-storehouse.webp", alpha: true, maxBytes: 1_000_000 },
  { id: "market", file: "stage-06-market.webp", alpha: true, maxBytes: 1_000_000 },
  { id: "watch", file: "stage-07-watch.webp", alpha: true, maxBytes: 1_000_000 },
  { id: "council", file: "stage-08-council.webp", alpha: true, maxBytes: 1_000_000 },
];

function readU24LE(buffer, offset) {
  return buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
}

function parseWebP(buffer) {
  if (buffer.length < 20 || buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error("invalid RIFF/WEBP header");
  }

  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const type = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (data + size > buffer.length) throw new Error(`truncated ${type} chunk`);

    if (type === "VP8X") {
      if (size < 10) throw new Error("invalid VP8X chunk");
      return {
        codec: "VP8X",
        width: readU24LE(buffer, data + 4) + 1,
        height: readU24LE(buffer, data + 7) + 1,
        hasAlpha: Boolean(buffer[data] & 0x10),
      };
    }

    if (type === "VP8 ") {
      if (size < 10 || buffer[data + 3] !== 0x9d || buffer[data + 4] !== 0x01 || buffer[data + 5] !== 0x2a) {
        throw new Error("invalid VP8 frame header");
      }
      return {
        codec: "VP8",
        width: buffer.readUInt16LE(data + 6) & 0x3fff,
        height: buffer.readUInt16LE(data + 8) & 0x3fff,
        hasAlpha: false,
      };
    }

    if (type === "VP8L") {
      if (size < 5 || buffer[data] !== 0x2f) throw new Error("invalid VP8L frame header");
      const b1 = buffer[data + 1];
      const b2 = buffer[data + 2];
      const b3 = buffer[data + 3];
      const b4 = buffer[data + 4];
      return {
        codec: "VP8L",
        width: 1 + b1 + ((b2 & 0x3f) << 8),
        height: 1 + (b2 >> 6) + (b3 << 2) + ((b4 & 0x0f) << 10),
        hasAlpha: true,
      };
    }

    offset = data + size + (size % 2);
  }

  throw new Error("missing VP8/VP8L/VP8X image chunk");
}

async function inspectAsset(definition) {
  const filePath = path.join(ASSET_DIR, definition.file);
  const result = {
    id: definition.id,
    file: definition.file,
    path: path.relative(ROOT, filePath),
    exists: false,
    bytes: 0,
    codec: null,
    width: null,
    height: null,
    hasAlpha: null,
    warnings: [],
    failures: [],
  };

  let buffer;
  try {
    buffer = await fs.readFile(filePath);
    result.exists = true;
    result.bytes = buffer.length;
  } catch (error) {
    result.failures.push(error?.code === "ENOENT" ? "missing required asset" : `unreadable asset: ${error.message}`);
    return result;
  }

  try {
    const metadata = parseWebP(buffer);
    Object.assign(result, metadata);
  } catch (error) {
    result.failures.push(`invalid WebP: ${error.message}`);
    return result;
  }

  if (result.width !== REQUIRED_WIDTH || result.height !== REQUIRED_HEIGHT) {
    result.failures.push(`expected ${REQUIRED_WIDTH}x${REQUIRED_HEIGHT}, got ${result.width}x${result.height}`);
  }
  if (definition.alpha && !result.hasAlpha) {
    result.failures.push("stage layer must support transparency");
  }
  if (!definition.alpha && result.hasAlpha) {
    result.warnings.push("base contains an alpha-capable stream; verify every pixel is opaque during production export");
  }
  if (result.bytes > definition.maxBytes) {
    result.warnings.push(`file exceeds initial budget ${definition.maxBytes} bytes`);
  }

  return result;
}

async function main() {
  const inspected = [];
  for (const definition of EXPECTED_ASSETS) inspected.push(await inspectAsset(definition));

  let extraWebP = [];
  try {
    const entries = await fs.readdir(ASSET_DIR, { withFileTypes: true });
    const expectedNames = new Set(EXPECTED_ASSETS.map((asset) => asset.file));
    extraWebP = entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".webp") && !expectedNames.has(entry.name))
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  const failures = inspected.flatMap((asset) => asset.failures.map((failure) => `${asset.file}: ${failure}`));
  if (extraWebP.length) failures.push(`unexpected WebP assets: ${extraWebP.join(", ")}`);
  const status = failures.length ? "FAIL" : "PASS";
  const report = {
    status,
    generatedAt: new Date().toISOString(),
    requiredCanvas: { width: REQUIRED_WIDTH, height: REQUIRED_HEIGHT },
    expectedAssetCount: EXPECTED_ASSETS.length,
    inspected,
    extraWebP,
    failures,
  };

  await fs.mkdir(REPORT_DIR, { recursive: true });
  await fs.writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Village V2 asset QA ${status}. Report: ${path.relative(ROOT, REPORT_PATH)}`);
  for (const failure of failures) console.error(`- ${failure}`);
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
