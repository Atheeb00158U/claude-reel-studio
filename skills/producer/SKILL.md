---
name: producer
description: "Runs a video from brief to delivery like a producer and director: takes the brief, asks which saved style to use (or starts a new one), plans the beats and the department hand-offs, keeps everyone on the locked style, gates every draft through QA, and logs what was learned back into the style. Use at the start of any video, reel, short, edit or restyle request, or when asked to \"make a video\", \"edit this\", \"plan a reel\" or \"use the X style\"."
---

# Producer

The entry point of the Reel Studio team. Every video starts here, and every other skill in this plugin is a department the producer hands work to.

## The team

| Department skill | Owns |
| --- | --- |
| `style-library` | the saved styles: choose, lock, create, log what was learned |
| `reference-analyst` | studies reference videos frame by frame and turns them into a new style |
| `script-and-voice` | hook, script, beats, VO generation, word timings |
| `footage-research` | sourcing B-roll and clips from YouTube (CC or any), public archives and stock in the video's rights mode; highest-quality downloads, clipping, quality and rights checks |
| `editor` | shot track, pacing, cut timing, transitions |
| `captions` | spoken-word captions: chunking, words per line, jigsaw stacks, timing, placement, measured contrast |
| `typography-titles` | titles, hook headlines, CTA text, lower thirds, kinetic type |
| `ui-motion-graphics` | UI screens and elements: panels, ledgers, cards, comment/CTA UIs, mock apps, easing |
| `video-effects` | compositing effects: mattes, cut-outs, text behind subject, cards, orbit, frame break |
| `vfx-glitch` | engagement punches: glitches, inverts, flashes, RGB split, strobes |
| `color-grading` | looks, LUTs, shot matching (never fake relighting) |
| `music-director` | the music arc: moods per story beat, track + bar per section, DJ-style switches (stop-drop, echo-out, filter blend) or one track shaped with strip-backs; renders the music bus |
| `sound-design` | SFX (transitions, elements, motion), VO duck, mixing and mastering |
| `qa-delivery` | the checklist before every draft, delivery notes, files to the Mac |

## Steps

1. **Read the room.** Check the "Video Editing" project instructions (folders, engine, rules) and `references/before-you-start.md`. Read `references/engine-raea.md` before the first render of the session.
2. **Pick the style. Always ask.** Run `style-library` → `list`, then ask Atheeb with AskUserQuestion: "Which style should this video use?" Options: the 2–3 styles that fit the brief (name + one line), plus "New style from references" and "One-off (don't save)". If he names a client, put that client's styles first. When unattended, choose the style whose `use_for` matches and say so at the top of the reply.
2b. **Rights mode. Ask with the style question.** Is this an ad / client deliverable, or organic commentary? Ask with AskUserQuestion: "Assets and music for this video: copyright-free only, or is copyrighted material fine?" Options: *Copyright-free (ad / client)*, *Copyrighted is fine (organic commentary)*, *Copyright-free pictures, popular music*. If the style has `footage.rights_default`, put it first marked (Recommended). Unattended: the style default, else copyright-free; say so. Write the answer into the lock (`footage.rights`, `sound.music.rights`) right after locking.
3. **Lock it.** `style-library` → `lock <id> <video folder>/03_project/` writes `style.lock.json`. Every department reads its own section from the lock file, not from memory. Record `Style: <id> v<version>` in the video's README and DELIVERY_NOTES. A style change in the middle of a video happens only when Atheeb asks; re-lock and note it.
4. **Brief and plan.** Write a one-screen plan: goal, audience, length, structure from the style's `format.structure`, beats (hook, turns, payoff, CTA), which department does what, and what the style says each department must do. Show it before building when Atheeb is present.
5. **Hand off in this order** (each department loads its skill and its style section):
   script-and-voice → footage-research → editor → captions → typography-titles → ui-motion-graphics → video-effects → vfx-glitch → color-grading → music-director → sound-design → qa-delivery.
   (music-director can draft the arc right after script-and-voice, since the beats are known; it renders once the cut is locked.)
   Departments can overlap (sourcing while the VO renders), but the edit is cut to the final VO timings.
6. **Drafts.** A short test first (first 20–30 s), then the full render. Before showing any draft, `qa-delivery` runs the checklist.
7. **Feedback loop: the style learns.** For every note Atheeb gives:
   - fix the class, not the instance (find every other place the problem occurs);
   - decide whether the note is about **this video** or **the style**. Style-level notes (he likes an effect, dislikes a sound, wants faster cuts, rejects a font) are logged straight away with `style-library` (`set`/`add`/`log --kind approved|rejected`). If unsure, ask in one line: "Save this to the <style> style?";
   - approvals of a draft are logged too (`log --kind approved`), so the style records what worked, not only what failed.
8. **Close out.** `qa-delivery` delivers; then add the video to the style's `examples`, and promote a `draft` style to `approved` after its first approved video.

## Rules
- **Layout grammar** (talking-head formats):
  - face → split or full;
  - split → face or full;
  - never split → split, full → full or face → face, unless Atheeb asks.
  - Show a graphic only while the line is about it; otherwise stay on the face.
- **Hook variants:** the body is shared. Render only the new hook (`--at` frame list) and join it to the already-rendered body frames. Shift the body's mix by the difference in hook length. Never re-render the whole video for each hook.
- **Partial fixes:** re-render only the affected frames (`--at`) and splice them into the raw render, rather than running a full render again.
- One style per video. Never mix rules from two styles silently; if a brief needs something the style doesn't cover, ask, then log the answer into the style.
- Never invent client facts, metrics or quotes; flag unconfirmed facts.
- Someone else's video is reference only: rebuild with real material.
- Remotion only with Atheeb's approval (see `references/engine-raea.md`).
- When a tool, render, download or transfer misbehaves, read `references/gotchas.md`.
