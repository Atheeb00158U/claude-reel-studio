# QA before delivery (learned on the MMH videos)

- Run `claude/reel-qa-checklist.md`.
- Make contact sheets of:
  - every shot's first, middle and last frames, which catch pans, cuts inside a clip, bugs and supers;
  - every multi-line stack (`preview_stacks.py`);
  - every frame of every glitch burst and carousel/showcase move.
- Check the clip/in-point list for repeats.
- Contact sheet of every chunk at its completed frame (`wf(last word)+5`) and of every transition, effect and quote beat. Check: text never over faces/eyes, legible on bright or busy footage (raise dim or move it), no clipped words, no stack overlapping key numbers, no chunk lingering into a quote beat, mattes clean at full size, and every picture matching its line in subject, setting and background.
- `earshot measure` on the master (−14 LUFS, TP ≤ −1.5 dBTP, no clipping) and `earshot timeline <final>.mp4` (it reads the video's own cuts) for cut sync and section moods (no "mysterious", "dark and tense", "sad"). Scan the music bed for silences or drop-outs inside the span used. ASR the master against the script.
- Run the style bible's not-AI checklist: real sources only, small plain captions, grammar-split stacks, text moves for the picture, one accent, documents highlighted, mostly hard cuts.
- Delivery notes (`DELIVERY_NOTES.md` in the project): what was checked and not, every clip's source title/year, every copyrighted still with its source page, music and SFX with licences (Mixkit / Pixabay / commercial tracks used at the user's request), any typeset, sampled, generated or replicated material. Built-from-scratch UI (e.g. notification cards) uses shadcn tokens and shows no invented text.
- When a note is ambiguous ("the transition doesn't make sense"), fix the most likely one and say which one, so the user can point at another.

## Motion-graphics checks (added v0.6, from the Wealthometry rejections)
- Every graphic is a real app/artefact rebuilt accurately: no invented cards, no text-only plates, no client-website highlight, no PPT-style chart plate.
- Each beat opens pre-zoomed and only pans: no zoom-out/zoom-in between beats.
- Few words on screen; bubbles fit their text and timestamp; nothing hidden under the status bar (overlays drawn after it).
- Layout grammar holds: no split→split, full→full or face→face.
- Sound: no per-word ticks; one sound per meaningful event; about 20–35 events/min.
- Every spoken word is in the captions (check after removing any big or behind-the-head word).
