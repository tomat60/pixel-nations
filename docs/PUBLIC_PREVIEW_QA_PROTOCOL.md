# Public Preview QA Protocol v0.1

Status: ACTIVE  
Owner: Product Lead / QA Lead / Visual QA Lead / Release Gatekeeper  
Purpose: make public evidence the default review surface so user screenshots are not required for every visual issue.

## Principle

The user should not need to manually send screenshots to catch every visual regression. The project must publish inspectable evidence.

## Evidence Sources

Priority order:

1. Public Vercel production or preview URL.
2. Public QA report under `/qa/latest/`.
3. Uploaded review bundle generated from current branch.
4. Local screenshots.
5. User screenshot.

User screenshots are valuable, but they are escalation evidence, not the normal QA workflow.

## Public QA Must Include

For public/demo-facing visual work, QA evidence should include:

- landing desktop first fold,
- landing map/world preview,
- landing mobile first fold,
- world desktop,
- world mobile,
- selected/claim state if touched,
- smoke result,
- manifest,
- handoff.

## Release Gate

A public/demo-facing visual change is blocked if:

- QA evidence is stale,
- public report is missing,
- affected screenshot is missing,
- visual issue is visible in public evidence,
- known issue is not documented.

## Known Limitation

Automated screenshots still do not equal art direction approval. They are the evidence that the Visual QA Lead reviews.
