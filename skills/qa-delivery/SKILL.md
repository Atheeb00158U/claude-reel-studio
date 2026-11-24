---
name: qa-delivery
description: Checks every draft before Atheeb sees it (style compliance, captions, faces, pacing, sources, mattes, glitch frames, grade, loudness, intelligibility) and delivers the final files, delivery notes and editable project to the Mac. Use before showing any draft, when asked "can you spot your faults", or when delivering a finished video.
---

# QA and delivery

## Before every draft
1. **Run the project's checklist** `claude/reel-qa-checklist.md` (every past mistake and its check) and `references/qa-before-delivery.md`.
2. **Style compliance** against `style.lock.json`, department by department: format and fps; cut rule and shot lengths; only allowed transitions/effects/glitches and within budget; caption mode, words per chunk, faces, sizes, reveal, positions and treatment (run `captions/scripts/caption_check.py` on a clean pass and attach the report); UI tokens and durations; LUT applied; SFX palette and events per minute; music rule, levels and master. List any deviation and either fix it or say why.
2b. **Sources and rights:** `footage-research/scripts/check_assets.py <video folder> --credits` must report 0 FAIL for the video's rights mode (quality floor, licence allowed in the mode, CC BY creators, no repeated moments). Its credits go into DELIVERY_NOTES and the post caption.
2d. **Danger zones (platform UI): captions, stats, titles, CTAs.** `python3 scripts/zone_check.py <render.mp4> --platform <format.platform> --captions <captions.json> --elements <src/data/elements.json> --out-dir 04_renders/drafts/qa/` must report **0 FAIL**. It checks every declared box exactly, and OCRs the real frames (2 fps), so text nobody declared (a stat inside a card, a source super, a lower third) is caught too. Reels zones (`scripts/safe_zones.py`, from Atheeb's graphic): top 220 px, bottom 450 px, right 35 px, left 40 px, and the like/comment/share rail, a 100 px column inside the right edge from y ≈ 1150 down. Attach `zone_sheet.jpg` (flagged moments with the zones in red). WARN = small or moving text, usually signage in the footage: look at it, fix it if it carries meaning. Ignore only a deliberate full-frame end card (`--ignore a-b`).
2c. **Sound:** `earshot measure` on the master (LUFS, true peak, bands) every time; `earshot timeline --video` when the listening models are available. State which was done.
3. **Contact sheets:** first/middle/last frame of every shot; every caption chunk at its completed frame; every multi-line stack; every frame of every glitch burst and carousel move; every effect.
4. **Look for:** text over eyes or faces, clipped words, illegible text on bright footage, source bugs and supers, repeated source moments, wrong people, unreadable hero artefacts, matte rims, grades that look unlit or fake.
5. **Sound:** loudness and true peak, no clipping, bed silences, ASR of the master against the script.
6. `raea check out.mp4 --shape <aspect> --platform reels` on the render.

## Delivery
- MP4 (libx264 + AAC, `+faststart`, under 30 MB) into the video's `04_renders/final/`; the editable raea project (no node_modules) into `03_project/`, with `style.lock.json`.
- `DELIVERY_NOTES.md`: style id and version; what was and wasn't checked; engine (raea, or Remotion with the approval noted); every clip, still, track and SFX with source and rights; unconfirmed facts; anything AI-generated.
- Update the video's README, the project progress doc, and (via `style-library`) the style's `examples`.
- Large files: `device_commit_files` ≤30 MB per file, ≤100 MB per call; on HTTP 400, `SendUserFile` first and commit by `fileUuid`.
