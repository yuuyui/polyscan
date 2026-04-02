---
name: Figma work feedback
description: Lessons learned from Figma sync session — what worked and what the user expects
type: feedback
---

Section backgrounds should use design system colors (bg/base), not Figma default white/gray. User called this out explicitly.

**Why:** Components need to be seen in their real dark-theme context to look professional.

**How to apply:** When creating Sections or frames in Figma for component display, always set background to `bg/base` (#0e0d14) bound to the variable. Never leave default Figma white backgrounds.
