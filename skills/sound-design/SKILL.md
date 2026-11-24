---
name: sound-design
description: "Designs the full soundtrack in the locked style: SFX for transitions, UI elements, motion, glitches and captions (from the library, Openverse CC audio, or made with earshot); ducking, levels, mixing and mastering to −14 LUFS with an offline numpy mixer; measured and, with earshot's models, listened QA. Use for SFX, sound design, whooshes, clicks, glitch sounds, risers, impacts, mixing, mastering, loudness, or \"the music is too loud\"."
---

# Sound design (SFX, music, mix)

Read the style first: `style.lock.json` → `sound` (music rule, approved tracks, level vs voice, duck, things to avoid; SFX palette with events and dB; events per minute; master targets; rules).

## SFX
1. Build a cue list from the other departments' frame lists: cuts and transitions (editor), UI typing/clicks/card moves (ui-motion-graphics), effect entrances (video-effects), every glitch burst (`src/data/glitch.json`), caption words and big words (captions), end-card builds.
2. Map each event to the style's `sfx.palette` (sound and level). Files: `_Global library/sfx/normalized/*_n.wav` (transient at t=0, −1 dBFS: place at the frame) and the earshot starter pack `_Global library/sfx/earshot/` (place by its peak time). Check the library before downloading; add new sounds there. The library is the private team repo **github.com/Atheeb00158U/claude-reel-studio-sfx** (Git LFS), cloned as `_Global library/sfx`; if the folder is missing on a teammate's Mac, clone it there (see the plugin README), and after adding sounds commit and push them to that repo.
2b. **Missing a sound?** In order: real recordings (Mixkit, Pixabay, **Openverse** CC0/CC BY via the browser), then **earshot make / sfx** (made from public-domain recordings, ours to use), then `earshot build`. Mechanics, licences, peak-time placement and the starter pack: `references/sfx-tools.md`. For launch films and logo stings follow the `earshot:real-sound` method.
2c. **Default event map** (approved Nov 2026): one sound per *meaningful* on-screen event, varied samples, nothing on plain cuts.
   - **No tick on every caption word.** That was rejected as "WAY too much". Caption ticks only when the style explicitly asks for them.
   - Glitch hits (`essential_sfx_pack/Glitch Sound/Glitch 1/02, 08`) on shape glitches; quiet blips (−27 dB) on a few invert flashes.
   - Pop 1/3/5 rotated on bubbles; earshot `notification.wav` on notifications; earshot `highlight_click.wav` on highlights and strike-throughs.
   - `Zoom` on big scrolls; short `editor_drive_pack/Typing` bursts on typed text; `DATA 05/08` under data building; `Money-1` when a corpus lands; `TING` on a positive status.
   - The user's mouse click only on real button presses.
   - One riser-and-hit (`CORPORATE RISER/Corporate Rise and Hit 01`, hit at 1.44 s) landing on the end-card CTA.
   - About 28 events/min. Map in `ui-motion-graphics/references/real-app-motion-grammar.md` §5.
3. Hit the style's events per minute; no two whooshes within 1.5 s; whooshes peak on the cut; at most one impact per video unless the style says otherwise. Anything in `sfx.never` is never used.

## Music
0. **Music choice, arc and switches belong to `music-director`** (moods per beat, track + start bar per section, transitions, one-track strip-backs). It hands over `music_bus.wav` + `music_plan.json`; this skill adds its `cues[]` (riser before a stop-drop, impact on a drop), ducks the bus under the VO and masters. The steps below apply when picking a single track by hand.
1. Follow `music.rule` (one popular track under everything, or section-based beds that switch on cuts and downbeats).
2. Respect `sound.music.rights`: `copyrighted_ok` allows popular tracks (flag them in the notes); `copyright_free` allows only CC BY originals (YouTube CC filter, uploader = artist), YouTube Audio Library, Pixabay (non-AI, no Content ID), Mixkit or purchased licences. Covers/remixes/"no copyright versions" of popular songs are not cleared (the composition is still owned): only with Atheeb's per-video OK, never in a paid ad. Sourcing music from YouTube: `footage-research/references/youtube-sourcing.md` §4. Credit every CC BY track.
3. Use an approved track when one fits; otherwise offer 3–8 options mixed on the same picture. Avoid everything in `music.avoid`. Check the track for its own silences before picking the start offset; line cuts up with beats where possible.

## Mix and master
- Offline numpy mixer reading the same data files as the picture; VO at its offset, music segments with `srcStart`/fades/duck, SFX at frames. Music at `level_vs_vo_db` under the voice in talky parts, sidechain duck `duck_db`; small SFX on a bus that dips 5 dB under the voice; reveals and glitches at full level; +3 dB music in voiceless beats and on the end card.
- Master two-pass loudnorm to the style's `master` (default −14 LUFS / −1.5 dBTP); mux onto the picture (`-c:v copy`, re-encode delivery with libx264 + AAC).
- Check: always `earshot measure` on the master (installed in the cloud per `references/sfx-tools.md`). With the listening models: `earshot timeline --video` and `critique`. Without them, say the mix was measured, not listened to. ASR the master against the script (every word should align).
- Full lessons (track starts, ducking values that clouded words, Pixabay/Mixkit licence rules, CLAP ranking, mix measurements from reference reels): `references/sfx-music-mix.md`.

## Learn
Tracks approved for a client, sounds he loves or hates, level changes → `style-library add <id> sound.music.tracks …`, `add sound.sfx.palette …`, `set sound.music.level_vs_vo_db …`, `log --kind rejected`.
