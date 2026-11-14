@AGENTS.md

## Claude Code execution method (2026-11-14)
This is a task method, not a new source of product authority. All AGENTS.md, current-state, safety, cost, privacy and release rules take precedence.
- Reconnaissance: inspect the current code, active issue, accepted decisions and relevant git history before proposing a fix. Ask codebase questions rather than guessing or rerunning old work.
- Define one authorized vertical outcome and how to verify it before edits; use a brief plan for complex changes, but do not request routine owner approvals already delegated.
- Feedback loop: implement -> run targeted tests -> inspect actual output (screenshots, live behavior or physical bench evidence) -> correct -> rerun. Obtain a fresh-context review when valuable and affordable.
- Report the exact branch/head, tests and visible evidence to the existing issue/PR. Distinguish built, tested, merged, deployed and owner-accepted. Do not create duplicate status files, stewards or workstreams.
- Use CLI/MCP, Claude SDK or isolated parallel sessions only when they reduce total effort within existing permissions and budget. Never add a subscription or bypass an external-action gate.
- Reference talk: https://lnkd.in/p/eVdcRS4M ; maintained guidance: https://code.claude.com/docs/en/best-practices
- Project-specific completion target: a real playable Godot path with input, visible world state and save/re-entry proof, captured from the current build. A mockup, CI pass or merged PR is not gameplay acceptance.
