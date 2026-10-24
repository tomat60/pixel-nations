# Pixel Nations — GAME PRODUCT AND ENGINE

> Relocated from AGENTS.md verbatim on 2026-10-24. Canonical current-state, accepted ADRs and safety gates retain precedence.

## Product truths

- Core fantasy: **one land can become an empire**.
- Full world: 100 × 100 lands / 10,000 total.
- Current region: Sector A-01 / Aurelian Basin.
- No NPC kingdoms as the default world premise; players create history.
- Avoid crypto, NFT, wallet, mint, token, ETH, Web3, payment, or pay-to-win framing unless a future explicit decision reopens it.
- Preserve existing player identity, persistence, progression semantics, and rollback capability unless the active issue explicitly scopes a migration.

## Current runtime direction

- Godot is the current production incumbent and rollback-safe runtime.
- ADR-001 records the accepted Godot pivot, but the final engine/workflow lock is explicitly reopened only for the bounded AI-native benchmark in issue #731.
- Unity migration is **not authorized** while #731 is open. Unity must materially outperform Godot end-to-end to repay migration; tie or small advantage keeps Godot.
- Next.js `/play` remains a bridge/demo shell and rollback/reference surface, not the production-final scene renderer.
- Do not restart broad React/SVG scene-engine development as the final visual direction.
- Do not infer visual acceptance from runtime acceptance. Current state defines the exact acceptance boundary.

## Current milestone rule

Do not duplicate a milestone snapshot in this file. Read the exact milestone, active issue, active PR, acceptance boundary and next allowed action from `docs/PROJECT_CURRENT_STATE.md` on the current checkout.

When the milestone changes, update `PROJECT_CURRENT_STATE.md`; do not add another convenience summary here. Historical PR or issue references in this file are examples only unless current state explicitly reactivates them.

## Mandatory whole-product portfolio gate

The steward/control-plane must not mechanically infer the next feature from the previous state transition.

Before authorizing a new product milestone when a portfolio trigger applies, perform a lightweight whole-product check against the durable strategy and current evidence.

The check must answer:

1. What is the biggest current bottleneck across world/progression, gameplay/fun, UX/clarity, visuals/gamefeel, strategic depth, technical reliability and demo/business value?
2. What player-visible delta will the proposed sprint create?
3. Why is it better now than the strongest alternatives?
4. What are we deliberately not building?
5. What exact evidence accepts, rejects or stops the sprint?

Mandatory triggers:

- any terminal product `REJECT`;
- a major phase boundary;
- repeated milestones in the same subsystem while another product dimension lags;
- direct user feedback that pace, clarity, gameplay or visual progress is wrong;
- logic/state complexity growing materially faster than visible product value.

At high-leverage phase/system decisions, research relevant production practice, comparable games/workflows and current repo evidence before choosing direction.

The portfolio gate must not become bureaucracy. It can be recorded directly in `PROJECT_CURRENT_STATE.md` or the active issue and does not require a separate PR unless authority actually changes.

Prefer one meaningful reviewable sprint that materially advances the whole product over serial micro-state milestones. If the largest bottleneck is world/progression or visual readability, block deeper mechanics until that bottleneck is addressed.

