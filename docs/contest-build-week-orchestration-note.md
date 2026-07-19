# Build Week orchestration note

Pixel Nations is directed and co-created by GPT-5.6 acting as Product Lead, Creative Director, Technical Strategist, QA Lead and project orchestrator.

GPT-5.6 defines product direction, scopes tasks, chooses tools, delegates bounded work, reviews diffs and evidence, rejects weak or misleading implementations, and decides what may merge.

Fable, the scoped executor, Cursor, GitHub Actions and deterministic QA scripts are delegated tools inside that GPT-5.6-led workflow. Their outputs are not accepted automatically. They are reviewed against product goals, cost constraints, allowed files, QA evidence and submission quality.

Examples of GPT-5.6 control in the repository history include:
- narrowing broad Fable ideas into bounded gameplay slices;
- repairing the scoped executor after model, context and patch-format failures;
- rejecting a hidden-selector QA shortcut in PR #185 despite green checks;
- splitting the post-crisis payoff feature into state, UI and real QA slices;
- prioritizing contest visual clarity over adding new systems.

This note exists to preserve an accurate Build Week narrative: GPT-5.6 is the coordinating creator and decision-maker; Fable and other agents are tools it directs.
