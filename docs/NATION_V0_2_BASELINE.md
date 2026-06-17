# Nation v0.2 Baseline Lock

Status: ACCEPTED BASELINE  
Date: 2026-06-17  
Scope: Pixel Nations public demo gameplay layer  
Stage: land → settlement/city → nation → empire

## Purpose

Nation v0.2 is the first accepted nation-level gameplay baseline for Pixel Nations.

This document locks the current direction so future implementation work does not flatten the nation layer back into a static form, over-expand it into a heavy political simulator, or hide the player's core decision behind unclear state.

## Accepted Player Experience

Nation v0.2 is accepted because it introduces a clear, engaging decision layer at the moment the player turns a city into a nation.

The accepted experience includes:

- Founding Ideology
- Governing Doctrine
- Recommendation based on the player's earlier path
- Dynamic Expected Outcome
- A clearer Nation identity after founding
- Why This Nation Works
- Review Founding Choices
- Start Fresh Demo Path

The player should understand that the nation is not just a page transition. It is the result of their settlement focus, trade connection, alliance direction, and political choice.

## Why It Works

Nation v0.2 works because it follows the Pixel Nations doctrine:

> One land can become an empire. Simple first. Deep later.

The system adds strategic meaning without overwhelming the player.

It succeeds because:

- The player makes a visible political decision.
- The recommendation creates continuity from previous choices.
- The choice feels strategic but remains readable.
- The outcome is immediately visible.
- The player can recover from demo-state confusion by reviewing choices or starting fresh.
- The nation becomes an identity, not only a number increase.

## Locked Product Principles

Future work must preserve these principles:

1. Nation formation must remain choice-driven.
2. Recommendations should come from the player's path, not random flavor.
3. The player must always understand what decision they are making.
4. Previous choices should matter emotionally before they become mathematically complex.
5. The nation layer must support the path toward empire without becoming the final game.
6. Demo-state confusion must never hide a core mechanic without a clear review/reset path.

## Current Accepted Flow

The accepted v0.2 flow is:

1. The player claims one land.
2. The land becomes a settlement/city.
3. The player chooses a settlement path.
4. The player establishes an external trade route.
5. The player forms a political alliance.
6. The player founds a nation.
7. The player chooses ideology and governing doctrine.
8. The nation displays a clear identity and path toward empire.

This is the first true choice chain in the demo.

## Do Not Do Now

Do not expand Nation v0.2 into any of the following yet:

- Full political party system
- Dozens of ideologies
- Complex laws and policies
- Backend nation persistence
- Multiplayer diplomacy
- AI nations
- Real-time war simulation
- Market economy simulation
- Crypto, NFT, wallet, token, mint, or pay-to-win mechanics
- Overly dense numbers that bury the emotional decision
- Hidden mechanics that require devtools, localStorage manipulation, or tester knowledge

These may be considered later only after the core demo has stronger retention, clarity, and strategic identity.

## UX Rule

A player who has already founded a nation must still have a clear way to:

- Enter the nation
- Review the founding choices
- Start a fresh demo path

This rule exists because manual tester confusion exposed a real product issue.

Manual confusion overrides screenshot approval.

## Cursor Rule

Cursor is executor, not strategist.

Cursor must not invent new nation systems, new doctrine structures, or extra ideology complexity without a product brief.

Any future Nation sprint should begin with a scoped product decision, not an open-ended agent request.

## Next Expansion Direction

The recommended next gameplay layer is:

# Empire v0.2 — First Imperial Direction

Empire v0.2 should follow the same pattern:

- One clear player decision
- One visible consequence
- One identity change
- One next objective

Possible first imperial direction choices:

- Crown Empire — legitimacy, order, controlled expansion
- Trade Empire — routes, influence, wealth, soft power
- Frontier Empire — settlement growth, land pressure, expansion momentum

Do not implement Empire v0.2 as a static “Declare Empire” button only.

Empire must become the next emotional and strategic step in the chain:

land → city → nation → empire

## Baseline Acceptance

Nation v0.2 is accepted as the current gameplay baseline after:

- Technical implementation
- Smoke QA pass
- Manual review
- UX safety patch
- Merge to main

This document should be updated only when a future Nation baseline replaces v0.2.
