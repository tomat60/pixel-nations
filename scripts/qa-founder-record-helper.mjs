const HYDRATION_TIMEOUT = 10000;

export async function waitForFounderRecord(page, {
  depth = "founder-run",
  timeout = HYDRATION_TIMEOUT,
  required = false,
  rehydrateState = null,
  storageKey = null,
} = {}) {
  const selector = `[data-qa="demo-complete-overlay"][data-record-depth="${depth}"]`;
  let overlay = page.locator(selector).first();
  let appeared = await overlay.waitFor({ state: "visible", timeout }).then(() => true).catch(() => false);

  // React hydration can occasionally persist the initial client state before the
  // reducer applies a QA seed. Reapply the exact seed once, then require the same
  // product UI. This is bounded recovery, not an unbounded test retry.
  if (!appeared && rehydrateState && storageKey) {
    const token = `pn-qa-seed-${depth}-${Date.now()}-${Math.random()}`;
    await page.addInitScript(({ key, state, token }) => {
      if (window.sessionStorage.getItem(token) === "applied") return;
      window.localStorage.setItem(key, JSON.stringify(state));
      window.sessionStorage.setItem(token, "applied");
    }, { key: storageKey, state: rehydrateState, token });
    await page.evaluate(({ key, state }) => {
      window.localStorage.setItem(key, JSON.stringify(state));
    }, { key: storageKey, state: rehydrateState });
    await page.reload({ waitUntil: "domcontentloaded", timeout: HYDRATION_TIMEOUT });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    overlay = page.locator(selector).first();
    appeared = await overlay.waitFor({ state: "visible", timeout }).then(() => true).catch(() => false);
  }

  if (!appeared && required) throw new Error(`Expected ${depth} Founder Record before continuing advanced QA.`);
  return appeared ? overlay : null;
}

export async function dismissFounderRecord(page, {
  depth = "founder-run",
  timeout = HYDRATION_TIMEOUT,
  required = false,
  rehydrateState = null,
  storageKey = null,
} = {}) {
  const overlay = await waitForFounderRecord(page, { depth, timeout, required, rehydrateState, storageKey });
  if (!overlay) return false;

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
