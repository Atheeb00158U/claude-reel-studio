---
name: typography-titles
description: Designs titles, headlines, hook text, lower thirds, number callouts and CTA text in the locked style, and animates them (type-on, word pop, stretch, boil, text behind subject, text as window, path text, neon CTA, counters, blur-reveal). Use for title cards, hook headlines, on-screen headings, "comment KEYWORD" text, lower thirds, fonts and type pairing, or kinetic typography. Running spoken captions belong to the captions skill.
---

# Typography and titles

Read the style first: `style.lock.json` → `captions.fonts` (the faces), `typography` if the style has it (title faces, scale, accent colour, animations), and `ui_motion` (easing, durations).

## Principles
- **Two text systems, never mixed in one moment:** running captions (`captions` skill) and designed titles/headlines (this skill). When a headline is on screen, running captions clear or sit clearly apart.
- **Hierarchy from one move at a time:** scale, weight, colour, placement or motion. Use a fixed scale per style (e.g. headline : small line ≈ 2.5–4 : 1; title : caption ≈ 1.5–2.5 : 1) and don't add new sizes per video.
- **One display face + one accent face per video,** from the style. Display type gets tight tracking (−3 to −5%) and tight leading (0.85–0.95); all-caps gets slightly opened tracking (+2 to +5%) instead.
- **Two colours max:** white (or the plate ink) + the style's accent.
- Space and placement follow the captions skill's contrast and placement rules (safe zones, faces, treatments, measured contrast).

## Steps
1. List the title moments from the plan (hook headline, chapter cards, number callouts, CTA) with their frames.
2. Choose a shape from `references/text-animations.md` (headline stack grammar) and an animation (A1–A13) allowed by the style.
3. Build in raea with `@font-face` fonts; render one still per title and check it against the style and a reference.
4. Run the captions checker on title boxes too (`mode: "title"`) for contrast, safe zone and face overlap.
5. Jigsaw stacks and titles get their **own clean screen** (white or the style's plate), never over a blurred app page. Each word rises in with a blur (24 px over 6 f; the big word 40 px over 8 f), then cut back to the app.
6. Hand entrances to `sound-design` (tick, typing, whoosh, or the single impact on the CTA).

## Learn
New title shapes, animations or faces Atheeb approves → `style-library add <id> typography.… --note`; rejections → `log --kind rejected`.

## Rules
- Write every title, stat, number callout, lower third and CTA you place to `src/data/elements.json` (`name`, `kind`, `box` [x, y, w, h] at its largest, `start`, `end`); qa-delivery's `zone_check.py` keeps them out of the platform's danger zones (Reels: top 220, bottom 450, right rail from y ≈ 1150).
