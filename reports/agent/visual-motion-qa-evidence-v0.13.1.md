# Visual Motion QA Evidence v0.13.1

- Generated: 2026-06-30T21:39:53.343Z
- Branch: `agent/visual-motion-qa-evidence-v0.13.1`
- Issue: #38

## Changed files

- `scripts/qa-screenshots.mjs`
- `public/qa/latest/index.html`
- `public/qa/latest/report.html`
- `public/qa/latest/manifest.json`
- `public/qa/latest/handoff.txt`
- `public/qa/latest/handoff.json`
- `public/qa/latest/smoke-result.json`
- `public/qa/latest/screenshots/*`
- `reports/agent/visual-motion-qa-evidence-v0.13.1.md`

## What changed

- Added explicit `/world` evidence captures for desktop first viewport, mobile first viewport, mobile after claim, and queued-action motion samples.
- Added per-artifact `capturedAt`, `path`, and `evidence` metadata to `public/qa/latest/manifest.json`.
- Added an issue-specific evidence section to `public/qa/latest/report.html`.
- Refreshed local public QA artifacts and handoff files.

## Required `/world` evidence artifacts

| Evidence | Artifact path | Captured at |
|---|---|---|
| Desktop first viewport | `public/qa/latest/screenshots/desktop-world-first-viewport.png` | 2026-06-30T21:39:33.707Z |
| Mobile first viewport | `public/qa/latest/screenshots/mobile-world-first-viewport.png` | 2026-06-30T21:38:29.881Z |
| Mobile after claim | `public/qa/latest/screenshots/mobile-world-after-claim.png` | 2026-06-30T21:38:46.764Z |
| Queued action sample 0 | `public/qa/latest/screenshots/mobile-world-motion-queued-action-00.png` | 2026-06-30T21:38:54.075Z |
| Queued action sample 1 | `public/qa/latest/screenshots/mobile-world-motion-queued-action-01.png` | 2026-06-30T21:38:55.792Z |
| Queued action sample 2 | `public/qa/latest/screenshots/mobile-world-motion-queued-action-02.png` | 2026-06-30T21:38:57.506Z |

## Validation

- `npm run build`: PASS
- `npm run qa:smoke`: PASS, 8/8 steps passed
- `npm run qa:screens`: PASS, 35 screenshots generated
- `npm run pn:handoff`: PASS, local handoff generated
- `npm run pn:status`: PASS exit code; local evidence is FRESH

## Notes

- `npm ci` was used only to install existing locked dependencies after `next` was missing locally.
- `npx playwright install chromium` was used after smoke failed for a missing Playwright Chromium browser.
- `pn:status` public QA check reports the deployed public handoff is still from an older branch until this branch is deployed.
