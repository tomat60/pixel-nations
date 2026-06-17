# Gameplay Vertical Slice v0.2 Baseline

## Status

Accepted on main after:

- Settlement v0.2 — First Founder Choice
- Trade Route v0.2 — First External Connection
- Alliance v0.2 — First Political Choice

Current baseline commit:

- main includes settlement focus, trade route outcome choice, and alliance political outcome choice.
- Smoke QA must remain PASS before any merge.

## Product Direction

Pixel Nations is no longer only a narrated page-to-page prototype.

The current demo now contains the first gameplay-shaped vertical slice:

1. Claim one land.
2. Found the first settlement.
3. Choose settlement focus.
4. Build the civic core.
5. Choose first trade route.
6. Choose political alliance strategy.
7. Found first nation.
8. Create empire.

This preserves the core fantasy:

> One land can becommpire.

## Accepted Gameplay Pattern

Each major progression step should now include:

- one clear player decision,
- one visible consequence,
- one short identity change,
- one local state update,
- one next objective.

Do not add large systems until this simple pattern feels good.

## Accepted v0.2 Decisions

### Settlement Focus

The settlement founder choice is accepted as the first internal identity decision.

Accepted options:

- Growth Charter
- Trade Charter
- Defense Charter

The choice may affect starting stats, settlement level, founder identity, and civic core outcome.

### Trade Route

The first trade route is accepted as the first external economic/world connection.

Accepted options:

- Iron Coast
- Ember Basin
- Crownlands

The choice may affect population, influence, settlement level, route identity, resource flow, history, and alliance default.

### Alliance Strategy

The first regional alliance is accepted as the first political choice.

Partner selection may affect:

- alliance strategy,
- alliance identity,
- diplomatic reach,
- political status,
- population,
- influence,
- nation context.

## Guardrails

Do not replace these choices with static forms.

Do not add backend, multiplayer, wallets, NFTs, tokens, crypto, or pay-to-win loops.

Do not overbuild economy, diplomacy, AI nations, combat, or markets yet.

Do not make choices mathematically complex before they are emotionally clear.

Do not let Cursor invent product direction.

## Next Product Opportunities

The next strategic candidates are:

1. Nation v0.2 — First Governing Doctrine
2. Empire v0.2 — First Imperial Doctrine
3. Demo Summary / Chronicle Screen
4. Manual smoke test script after gameplay v0.2 is stable
5. World Map v10 only after gameplay clarity remains intact

Recommended next feature:

> Nation v0.2 — First Governing Doctrine

Reason: nation currently has ideology selection, but it should inherit context from settlement focus, trade route, and alliance strategy more visibly before the empire ending.

## QA Rules

Before merge:

- `npm run build`
- `npm run qa:smoke`
- update `public/qa/latest`
- `npm run pn:handoff`

Manual user confusion overrides screenshot approval.

## Stop Condition

This baseline remains valid until a later approved baseline document replaces it.
