---
name: style-library
description: Keeps the library of saved editing styles (per client and format) so every video stays consistent in motion, glitches, sounds, music, transitions, captions and colour. Lists styles, locks one into a video, creates new styles, and logs every approved, rejected or learned rule with a version bump. Use when choosing a style, when asked "which styles do we have", "save this style", "use the same style as last time", "remember this for the client", or after any feedback that should apply to future videos.
---

# Style library

A style is everything that makes a client's videos look and sound like one series. The library is where styles live, and the learning log is how they get better.

## Where it lives
- On the Mac: `Claude video work/_Global library/styles/` (device_bash: `$HOME/mnt/Claude video work/_Global library/styles/`).
  - `<style-id>/style.json`: the rules every department reads (schema: `references/style-schema.md`).
  - `<style-id>/STYLE.md`: the same rules in prose, with the reasons.
  - `<style-id>/CHANGELOG.md`: dated history of that style.
  - `INDEX.md`: generated table of all styles. `LOG.md`: the learning log across all styles.
  - `styles.py`: the tool (a copy is bundled here as `scripts/styles.py`; if the Mac copy is missing or older, commit this one there).
- Mirror: the project doc `claude/style-library.md` holds the INDEX table and the last 20 log lines, so other Claude surfaces can see the styles. Update it whenever a style changes.

## Commands (run on the Mac with device_bash)
```sh
S="$HOME/mnt/Claude video work/_Global library/styles"; cd "$S"
python3 styles.py list                                   # table of styles (also rebuilds INDEX.md)
python3 styles.py show <id> [--section edit]             # one style, or one department's section
python3 styles.py new <id> --name "…" --client "…" [--from <id>] [--use-for "…"]
python3 styles.py set <id> edit.median_shot_s 0.9 --note "Atheeb: cut faster"        # change a field
python3 styles.py add <id> vfx_glitch.types '{"name":"RGB split","frames":3}' --note "liked on draft 2"
python3 styles.py log <id> --dept sound --kind rejected --note "riser on the CTA felt cheap"
python3 styles.py lock <id> "<video folder>/03_project"   # writes style.lock.json, logs the use
python3 styles.py validate [<id>]
```
`set`/`add` bump the minor version; `log` records without bumping (add `--bump patch` if it changes behaviour). Every command appends to the style's CHANGELOG and to LOG.md.

## Choosing a style (for the producer)
1. `list`, then ask Atheeb with AskUserQuestion which style to use: up to 3 matching styles (name + `use_for` in one line) + "New style from references" + "One-off (don't save)".
2. `lock` it into the video's `03_project/`. Departments read `style.lock.json`.
3. One-off videos still get a lock file made from the closest style, so the video stays internally consistent.

## Making a new style
- **From references** (reels Atheeb sends): hand off to `reference-analyst`, which measures them and fills a draft style.
- **From an existing style** (same client, new format; or a variant): `new <id> --from <id>`, then change what differs, each with a `--note`.
- **From a finished video** he liked: read its project files (theme, captions, glitch schedule, sound.json) and write them into a new style.
- Name styles `<client>-<format>` in kebab-case (e.g. `gridd-mmh-ad-story`, `acme-product-ugc`). New styles start as `draft`; the producer promotes to `approved` after the first approved video.

## Logging what was learned (the important part)
- After every piece of feedback, decide: this video only, or the style? Style-level notes go in immediately, in Atheeb's words, with the department that owns them.
- Log approvals as well as rejections; "he liked the 4-frame whip on the reveal" is as valuable as "no risers".
- Keep `approved`/`rejected` entries short and concrete (what, where, why). Put the actual numbers in the department section (e.g. `edit.transitions.vocabulary`), not only in the log.
- Never delete history. If a rule is reversed, `set` the new value with a note that says it replaces the old one.
- Update `STYLE.md` prose when a rule changes meaningfully, and refresh the project mirror doc.
- When a learned rule becomes a plugin default (a skill, reference or kit file changes), that is a plugin update: publish it to GitHub with the producer's `references/publishing-plugin-updates.md`.

## Seeded styles (Nov 21 2026)
`gridd-mmh-ad-story` (approved), `berribot-mmh-explainer` (approved), `claude-showcase-listicle` (draft).
