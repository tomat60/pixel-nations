# Agent Role Matrix v1.2

Status: ACTIVE SOURCE OF TRUTH
Purpose: prevent tool confusion and decide which agent/tool should perform each class of work.

## Roles

| Role | Primary tool | Allowed work | Must stop when |
|---|---|---|---|
| Product Lead / Strategy | ChatGPT | roadmap, scope, product decisions, milestone acceptance | implementation details require repo inspection or current source snapshot |
| Implementation Executor | Cursor CLI/headless in cloud | scoped code changes from batch spec | uncertain strategy, new dependency/backend, repeated QA failure |
| GitHub-native Coding Agent | GitHub Copilot cloud agent | issue-to-branch, PR creation, planning, fallback implementation | task is too broad, needs unavailable secrets, cannot pass CI |
| QA Gatekeeper | GitHub Actions + repo scripts | build, smoke, screenshots, handoff, public QA | non-deterministic failure or repeated fail needs human decision |
| Visual/Gamefeel Reviewer | ChatGPT + human review | assess clarity, appeal, user confusion, art direction | screenshot QA passes but user confusion remains |
| Cost-Control Lead | ChatGPT + scripts | compute/model decisions, stop conditions, budget caps | scope expands beyond batch budget |

## Default executor decision tree

1. Is this a strategic/product decision?
   - Use ChatGPT. Do not code.

2. Is this a deterministic audit, docs update, QA sync, or safe patch?
   - Use terminal package or GitHub Action.

3. Is this a scoped implementation batch with source changes?
   - Prefer Cursor CLI/headless in Codespaces/cloud.
   - Use GitHub Copilot cloud agent if it can produce a cleaner PR with less manual work.

4. Is this a broad autonomous milestone?
   - Break into batch specs. Do not run a free-form agent.

5. Is this visual polish or map redesign?
   - Require art direction first. Do not let it block core loop unless it breaks first impression or QA.

## Human checkpoint rules

Human checkpoint is required only for:

- product direction change
- monetization/legal/security/billing/secrets
- new major architecture/backend/dependency
- failed QA after 2 repair attempts
- final milestone review
- agent loop/uncertainty

Human checkpoint is not required for:

- copy polish inside approved scope
- minor component organization
- test fixes inside scope
- mechanical recovery
- CI artifact generation
- branch/PR creation
