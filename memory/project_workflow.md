---
name: Polyscan workflow and docs
description: Git workflow rules, tutorial phases, and key documentation files for the Polyscan project
type: project
---

## Git Workflow (RULES_DEV.md + RULES_OWNER.md) — strictly enforced
1. Create GitHub Issue first (every feature/bugfix)
2. Wait for owner approval before implementing
3. Work on branch: `feat/issue-<number>-<short-desc>`
4. Create PR with link to Issue (`Closes #<number>`)
5. Owner reviews and merges — never merge yourself

**Why:** Owner enforces strict review flow to maintain quality.

**How to apply:** Always create Issue → wait for approval → branch → PR. Never commit to main directly.

## Key Docs
- `README.md` — Quick start, features, docs index
- `CORE_FEATURES.md` — Architecture spec, features, data model, roadmap
- `TUTORIAL.md` — Full build story Phase 1-11 (research → design → implement → Figma)
- `FIGMA_GUIDE.md` — Figma workflow: archive, sync, audit, error recovery
- `FIGMA_STYLE.md` — Design tokens, typography, component specs
- `RULES_DEV.md` — Git workflow rules (Issue → Branch → PR)
- `RULES_DESIGN.md` — Design workflow rules (Figma)
- `RULES_OWNER.md` — Approval gates (issue / design / PR)

## task-dev Workflow (Phase 5-7 of TUTORIAL)
Referenced as a skill/workflow that:
1. Opens tmux session `polyscan-dev`
2. Spawns subagents to implement by role
3. Writes unit tests from design docs
4. Runs dev server + tunnel for verification
5. Iterates until correct, reports status continuously
