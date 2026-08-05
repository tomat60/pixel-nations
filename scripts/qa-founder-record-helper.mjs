const HYDRATION_TIMEOUT = 10000;

export async function dismissFounderRecord(page, {
  depth = "founder-run",
  timeout = HYDRATION_TIMEOUT,
  required = false,
} = {}) {
  const overlay = page.locator(`[data-qa="demo-complete-overlay"][data-record-depth="${depth}"]`).first();
  const appeared = await overlay.waitFor({ state: "visible", timeout }).then(() => true).catch(() => false);

  if (!appeared) {
    if (required) throw new Error(`Expected ${depth} Founder Record before continuing advanced QA.`);
    return false;
  }

  const continueButton = overlay.locator('[data-qa="continue-ruling"]').first();
  await continueButton.waitFor({ state: "visible", timeout: HYDRATION_TIMEOUT });
  await continueButton.click({ force: true });
  await overlay.waitFor({ state: "hidden", timeout: HYDRATION_TIMEOUT });
  return true;
}

export async function openAdvancedFounderRecord(page) {
  const trigger = page.locator('[data-qa="open-founder-record"]').first();
  await trigger.waitFor({ state: "visible", timeout: HYDRATION_TIMEOUT });
  await trigger.click({ force: true });
  const overlay = page.locator('[data-qa="demo-complete-overlay"][data-record-depth="advanced"]').first();
  await overlay.waitFor({ state: "visible", timeout: HYDRATION_TIMEOUT });
  return overlay;
}

export async function assertAurelianRestart(page) {
  await page.locator('[data-qa="aurelian-village-scene"][data-aurelian-stage="camp"]').waitFor({
    state: "visible",
    timeout: HYDRATION_TIMEOUT,
  });
  await page.locator('[data-qa="second-run-started"]').waitFor({ state: "visible", timeout: HYDRATION_TIMEOUT });
}
