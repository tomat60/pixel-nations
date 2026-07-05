# Fable full_play trigger fix

Date: 2026-07-05

Issue-triggered Fable runs only recognized exact titles for repo_audit, cursor_prompts, and weak_prompt. Product issues for full_play did not match the workflow gate, and the script did not support full_play_redesign as a task type.

Fix applied:
- Added full_play_redesign to workflow dispatch choices.
- Allowed issue titles starting with FABLE RUN and containing full_play.
- Routed those issues to FABLE_TASK_TYPE full_play_redesign.
- Raised capped full-play limits only for that task.
- Added script support and a unified fullscreen map-game prompt.

Operating rule: use full_play only for bounded moonshot moments where the project is blocked on game direction or major UX architecture.
