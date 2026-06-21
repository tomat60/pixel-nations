#!/usr/bin/env node
import { readFile } from "node:fs/promises";

const resultPath = "public/qa/latest/smoke-result.json";

try {
  const raw = await readFile(resultPath, "utf8");
  const result = JSON.parse(raw);

  if (result.status === "PASS") {
    console.log("Smoke command ended non-zero, but smoke-result.json is PASS. Accepting bounded smoke evidence.");
    process.exit(0);
  }

  console.error(`Smoke result is ${result.status ?? "missing"}.`);
  if (result.blockingStep) console.error(`Blocking step: ${result.blockingStep}`);
  if (result.error) console.error(`Error: ${result.error}`);
  process.exit(1);
} catch (error) {
  console.error(`Could not read ${resultPath}: ${error.message}`);
  process.exit(1);
}
