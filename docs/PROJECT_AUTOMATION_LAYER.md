# Pixel Nations - Project Automation Layer

Lightweight local commands for closing a scoped sprint and preparing a clean ChatGPT handoff.

## Commands

### `npm run pn:handoff`

Use after a sprint, review pass, or manual QA run when you need a compact project report.

It prints:

- Current branch
- Git status summary and whether the tree is clean
- Last 5 commits
- Current smoke result from `public/qa/latest/smoke-result.json`, if present
- Public QA report URL
- World URL
- Local QA report path

On macOS it also attempts to copy the report to the clipboard with `pbcopy`. If clipboard copy fails, the report is still printed.

### `npm run pn:quick`

Use for a fast mechanical check and handoff:

```bash
npm run qa:smoke && npm run pn:handoff
```

This is useful after a small non-visual change where screenshot QA is not required.

### `npm run pn:finish`

Use when closing an implementation sprint that needs the full local verification pass:

```bash
npm run build
npm run qa:smoke
npm run qa:screens
npm run qa:smoke
npm run pn:handoff
```

The smoke test runs again after screenshot QA because `qa:screens` recreates `public/qa/latest`, which can remove the smoke result file. The final handoff should include the latest PASS/FAIL smoke artifact.

## Workflow Rule

Cursor or another AI executor should stop after producing the handoff report. Paste the report into ChatGPT for strategy, review, and the next scoped instruction.

ChatGPT remains the strategist and reviewer. Cursor remains the scoped executor.


## Continuous Operating-System Audit Rule

Pixel Nations must regularly review and improve its own project operating system.

When repeated friction appears in QA, Cursor use, budget, screenshots, handoffs, or user confusion, stop normal sprinting and audit the process before continuing feature work.

This protects quality, speed, and cost control.



## Local Artifact Workspace Rule

Generated audit bundles, merge packages, review bundles, and helper outputs should be organized under:

`/Users/tomchuck/Desktop/Pixel Nations/`

Use category subfolders such as:

- `Audit Bundles`
- `Merge Packages`
- `Review Bundles`
- `Handoffs`
- `Strategy Docs`
- `Temp`

The repo stays at:

`/Users/tomchuck/Desktop/pixel-nations`

The local artifact workspace is separate from the repo.

