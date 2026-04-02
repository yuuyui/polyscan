---
name: Polyscan workflow and docs
description: Git workflow rules, tutorial phases, and key documentation files for the Polyscan project
type: project
---

## Git Workflow (WORKFLOW.md) — strictly enforced
1. Create GitHub Issue first (every feature/bugfix)
2. Wait for owner approval before implementing
3. Work on branch: `feat/issue-<number>-<short-desc>`
4. Create PR with link to Issue (`Closes #<number>`)
5. Owner reviews and merges — never merge yourself

**Why:** Owner enforces strict review flow to maintain quality.

**How to apply:** Always create Issue → wait for approval → branch → PR. Never commit to main directly.

## Key Docs
- `TUTORIAL.md` — Full build story Phase 1-11 (research → design → implement → Figma)
- `TASK.md` — V1 implementation checklist (26 steps)
- `TASK_V2.md` — V2 Figma UI overhaul (16 steps)
- `design.md` — Architecture + API spec + component design
- `figma-design-system.md` — Design tokens extracted from tailwind

## task-dev Workflow (Phase 5-7 of TUTORIAL)
Referenced as a skill/workflow that:
1. Opens tmux session `polyscan-dev`
2. Spawns subagents to implement by role
3. Writes unit tests from design docs
4. Runs dev server + tunnel for verification
5. Iterates until correct, reports status continuously
