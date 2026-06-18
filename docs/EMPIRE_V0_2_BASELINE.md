# Empire v0.2 Baseline Lock

Status: ACCEPTED BASELINE
Date: 2026-06-18
Scope: Pixel Nations public demo gameplay layer
Stage: land → settlement/city → nation → empire

## Purpose

Empire v0.2 is the first accepted empire-level gameplay baseline for Pixel Nations.

This document locks the current direction so future implementation work does not reduce the empire layer to a static success screen, over-expand it into a heavy empire simulator, or detach it from the player’s earlier path.

Empire must remain the emotional and strategic culmination of the demo path:

> One land can become an empire.

## Accepted Player Experience

Empire v0.2 is accepted because it introduces a clear final strategic identity choice after the player has formed a nation.

The accepted experience includes:

- First Imperial Direction
- Three clear directions: Crown Empire, Trade Empire, Frontier Empire
- Recommendation based on the player’s previous path
- Dynamic Expected Outcome
- Clear imperial identity after founding
- “Why This Empire Works”
- Review Imperial Direction
- Start Fresh Demo Path

The empire is no longer only the final page of the demo. It is the result of the player’s accumulated choices.

## Accepted Imperial Directions

### Crown Empire

Theme: legitimacy, order, controlled rule

Crown Empire is for players whose path leans toward civic authority, crown legitimacy, and structured rule.

It should feel like an empire built through law, banners, ceremony, and political continuity.

Accepted identity:
The empire expands through law, banners, ceremonies, and controlled succession of power.

### Trade Empire

Theme: routes, wealth, contracts, soft power

Trade Empire is for players whose path leans toward commerce, markets, trade routes, and commercial dependence.

It should feel like an empire built through roads, contracts, ports, markets, and resource flow.

Accepted identity:
The empire expands by making neighbors depend on its roads, markets, contracts, and resource flow.

### Frontier Empire

Theme: expansion, settlement pressure, borders, land momentum

Frontier Empire is for players whose path leans toward defense, industry, borders, and expansion.

It should feel like an empire built through settlement pressure, secured frontiers, and controlled risk.

Accepted identity:
The empire expands through settlement pressure, secured borders, frontier ambition, and controlled risk.

## Why It Works

Empire v0.2 works because it follows the same pattern that made Nation v0.2 successful:

1. The player makes one readable decision.
2. The game recommends an option based on previous choices.
3. The outcome changes visibly.
4. The empire gains a clear identity.
5. The player can recover from already-completed demo state.

This preserves simplicity while adding depth.

The system is not deep because it has many buttons. It is deep because the player can feel a path forming across several stages.

## Current Accepted Flow

The accepted v0.2 chain is:

1. Claim land
2. Build settlement/city
3. Choose settlement focus
4. Establish trade route
5. Form alliance
6. Found nation
7. Choose founding ideology
8. Choose governing doctrine
9. Declare empire
10. Choose first imperial direction
11. See why this empire works

This is now the core public-demo gameplay spine.

## Locked Product Principles

Future Empire work must preserve these principles:

1. Empire formation must be choice-driven.
2. Imperial identity must reflect the earlier path.
3. The recommendation must be understandable.
4. The empire must feel like a culmination, not a detached upgrade.
5. The player must always be able to review or reset completed demo state.
6. The system must remain simple first, deep later.
7. Visual polish must not replace gameplay clarity.

## UX Safety Rule

If the player has already founded an empire, `/empire/create` must not hide the mechanic without explanation.

The founded state must provide:

- Enter Empire
- Review Imperial Direction
- Start Fresh Demo Path

This mirrors the Nation v0.2 rule and prevents tester confusion.

Manual confusion overrides screenshot approval.

## Do Not Do Now

Do not expand Empire v0.2 into any of the following yet:

- Full AI empire system
- Real-time war simulation
- Multiplayer conquest
- Complex diplomacy
- Full economic simulation
- Dozens of imperial laws or policies
- Backend persistence
- Crypto, NFT, wallet, token, mint, or pay-to-win mechanics
- More imperial directions
- Sliders, spreadsheets, or dense number panels
- Another map rebuild without a dedicated map brief and mobile QA decision

These may be considered later only after the core public demo is clearer, more stable, and more compelling to first-time testers.

## Mobile Map Risk Separation

The known mobile map framing issue is not part of Empire v0.2.

It remains an open quality risk documented separately.

Do not mix the Empire v0.2 gameplay baseline with a rushed map fix. The map needs its own Mobile Map Framing Review with Product, UX, Mobile QA, and Design Department input.

## Cursor Rule

Cursor is executor, not strategist.

Cursor must not invent new empire systems, new empire directions, extra policy layers, or map changes without a product brief.

Future Empire work must begin with a scoped product decision and acceptance criteria.

## Next Recommended Expansion

Do not immediately add another major gameplay system.

Recommended next strategic step:

# Mobile Map Framing Review

Reason:
A first-time tester reported a mobile map framing/cropping issue. This affects first impression and public demo credibility.

After that review, choose one of:

1. Mobile map framing fix
2. Public demo polish pass
3. First-time tester script and feedback collection
4. Empire v0.3 only if the demo’s first impression is strong enough

## Baseline Acceptance

Empire v0.2 is accepted as the current empire gameplay baseline after:

- Implementation on main
- Smoke QA pass
- Manual review
- QA governance lock
- Handoff verification

This document should be updated only when a future Empire baseline replaces v0.2.
