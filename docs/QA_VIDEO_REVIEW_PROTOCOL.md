# Pixel Nations — Video / Interaction Review Protocol

This protocol exists to prevent screenshot-only QA from hiding important game progress inside panels or untested interactive states.

## Rule

Every merged gameplay PR must have evidence that exercises the new or changed interaction, not just a static screenshot.

## Per-PR targeted review

For a normal scoped PR, review only what changed:

- Click every new or changed button.
- Open every new or changed panel/state.
- Trigger every new milestone added by the PR.
- If the milestone appears inside a scrollable panel, the evidence must show that it is visible to the player without depending on hidden scroll unless the scroll itself is part of the intended UX.
- Keep this short; do not record or validate the whole game every time.

## Periodic full walkthrough

After several gameplay PRs, or before any public demo/share, run a full walkthrough:

land claim → village growth → city seed → expansion → nation founding → first era → city institutions → world consequences → reload persistence.

The full walkthrough should intentionally interact with all major moving/clickable elements:

- map claim/select/reset,
- village orders,
- world expansion and sector inspect,
- founding doctrine and ceremony dismissal,
- season choices,
- city/institution milestones,
- reload persistence.

## Product Lead gate

Green CI, smoke, or screenshots do not override hidden-progress concerns. If a new milestone is technically present but not visibly understandable, the PR needs a UX/progression fix before it is treated as accepted product evidence.
