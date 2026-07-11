# Pixel Nations — Video / Interaction Review Protocol

This protocol exists to prevent screenshot-only QA from hiding important game progress inside panels, untested interactive states, or fake video evidence.

## Rule

Every merged gameplay PR must have evidence that exercises the new or changed interaction, not just a static screenshot.

## Evidence types

- **Continuous video** means a native browser recording of the scripted walkthrough, currently Playwright `.webm` output in `public/qa/play-latest/videos/`.
- **Screenshots** are checkpoint frames after scripted steps. They are useful for layout/state proof, but they are not proof of smoothness, transitions, or gamefeel.
- **Interaction log** proves which scripted checks passed or failed.

Do not treat a slideshow, GIF made from screenshots, or screenshot sequence as video review. Label it as checkpoint evidence only.

## Artifact retention

- `/play` visual evidence artifacts include screenshots, logs, reports, and continuous `.webm` video.
- Keep `/play` visual evidence artifacts short-lived: 7 days by default.
- Fable artifacts may stay longer because they are small text outputs and are useful for sprint traceability.
- Do not commit generated evidence files into the repo unless a specific release/demo archive is intentionally created.

## Per-PR targeted review

For a normal scoped PR, review only what changed:

- Click every new or changed button.
- Open every new or changed panel/state.
- Trigger every new milestone added by the PR.
- If a PR adds a recorded map objective, the targeted review must claim the target and prove the completed state, not only the pending marker.
- If the milestone appears inside a scrollable panel, the evidence must show that it is visible to the player without depending on hidden scroll unless the scroll itself is part of the intended UX.
- Keep this short; do not record or validate the whole game every time.

## Periodic full walkthrough

After several gameplay PRs, or before any public demo/share, run a full walkthrough:

land claim → village growth → city seed → expansion → nation founding → first era → city institutions → world consequences → reload persistence → empire declaration.

The full walkthrough should intentionally interact with all major moving/clickable elements:

- map claim/select/reset,
- village orders,
- world expansion and sector inspect,
- founding doctrine and ceremony dismissal,
- season choices,
- city/institution milestones,
- frontier objective and objective payoff,
- empire declaration,
- reload persistence.

## Product Lead gate

Green CI, smoke, screenshots, or selector checks do not override hidden-progress or gamefeel concerns. If a new milestone is technically present but not visibly understandable, the PR needs a UX/progression fix before it is treated as accepted product evidence.
