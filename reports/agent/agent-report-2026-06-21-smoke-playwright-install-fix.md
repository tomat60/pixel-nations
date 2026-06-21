# Agent report — smoke Playwright install fix

- Generated: 2026-06-21
- Branch: `autonomous-production-v1.3`
- PR: #3
- Commit scope: CI infrastructure only

## What changed

Updated `.github/workflows/pn-ci.yml` so the `smoke` job installs Playwright Chromium before running `npm run qa:smoke`:

- `npm ci`
- `npx playwright install --with-deps chromium`
- `timeout 12m npm run qa:smoke`

## Why

The smoke script imports Playwright and launches Chromium. The previous PR #3 workflow installed Playwright browsers only in the optional screenshot job, not in the required smoke job. That made the required smoke gate vulnerable to CI-only browser/dependency failures even when the app build passed.

This follows Playwright's CI guidance: install dependencies, install browsers/system dependencies, then run tests.

## Scope guard

No gameplay, map, globe, backend, auth, database, crypto, wallet, token, NFT, or payment logic was changed.

## Validation status

Not locally executed from ChatGPT environment. GitHub Actions should validate the new commit automatically on PR #3.

## Review rule

Do not merge PR #3 until the fresh PR CI run is green. Do not merge PR #1 until PR #3 is green and PR #1 is rebased/rerun through the corrected pipeline.
