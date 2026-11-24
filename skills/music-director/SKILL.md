---
name: music-director
description: "Scores a video emotionally with one or more background tracks: maps each story beat to a mood and energy (calm, curious, tense, intense, triumphant, silence…), analyses tracks (tempo, downbeats, phrases, key/Camelot, energy curve, drops, breaks), picks the track and bar for every section, and switches on story turns with DJ transitions (stop-drop, echo-out, filter blend with bass swap, hard cut on the downbeat), or shapes a single track with strip-backs. Renders the music bus and an arc-vs-measured energy chart. Use when a video needs music that changes with the mood, several beds, \"make the music build here\", \"switch the music at the payoff\", intense/calm sections, DJ-style transitions, or picking where a song should start."
---

# Music director

Owns the **music arc**: which music plays when, and how it changes, so the soundtrack pulls the viewer through the story. `sound-design` still owns SFX, the VO duck, the full mix and the master; this skill hands it a finished music bus and an SFX cue list.

Read the style first: `style.lock.json` → `sound.music` (`rule`, `rights`, `arc` settings, approved tracks, `avoid`). Rights follow `sound.music.rights` (copyright-free → royalty-free / CC BY / licensed only).

## Steps
1. **Arc from the story.** From `beats.json` and the script, give every section a mood and, where it matters, an energy and shape (`build` / `fall`). Use `references/emotion-map.md` (vocabulary, families, rules) and pick a template from `references/arc-and-transitions.md`. Mark voiced vs voiceless sections, the payoff, and any deliberate stop (`silence`). Write `03_project/scripts/arc.json`, with picture cut times and the path to `words.json`.
   - Style rule "one popular track under everything" → `"mode": "one_track"`: the arc becomes a shape on one song (best start offset, its drop on the payoff, strip-backs under talky parts).
   - Section-based styles (Berribot, replicas, anything that asks for emotional switches) → `"mode": "arc"`.
2. **Candidates.** Approved tracks from the style first, then `_Global library/music/` (beds = royalty-free, songs = commercial), then new sourcing (`footage-research/references/youtube-sourcing.md` §4, Pixabay/Mixkit in sound-design). Instrumentals only under VO.
3. **Analyse** (cached; the library cache lives in `_Global library/music/analysis/`):
   `python3 scripts/analyze_track.py <tracks…> --out-dir <library>/music/analysis --root <library>/music --rights royalty-free|commercial|cc-by`
   (paths are stored relative to the library's music folder, so the cache works on the Mac and in the cloud; 10 library tracks are already analysed)
   Check the printout: BPM (and `bpm_alt`), key/Camelot and its confidence, energy range, breaks, moods.
4. **Plan:** `python3 scripts/plan_music.py arc.json '<analysis>/*.json' --out music_plan.json`
   It scores every track × downbeat window per section (energy distance, build/fall shape, mood tags, no breaks under VO, phrase starts, drop-on-the-turn), then runs a Viterbi pass over sections: switches cost a little, key/tempo compatibility matters for blends, a track may carry several sections. It picks a transition per switch, snaps switches to cuts and word ends, and writes SFX cues (riser, impact). Read the table it prints; `pin` a track/start or `allow_tracks` to steer it.
5. **Render:** `python3 scripts/score_mix.py music_plan.json --music-root <library>/music --out 02_voice/music_bus.wav --plot 04_renders/drafts/music_arc.png [--vo vo_assembled.wav]`
   It writes a level-matched bus (bed −20 dBFS RMS, peaks ≤ −1 dBFS) plus an energy chart of target vs measured. `--vo` adds a quick ducked preview.
6. **Check** (`references/arc-and-transitions.md` → checks): chart, switch points (downbeat + cut, never inside a word), breaks, vocals, rights. Listen with earshot if available, otherwise say it was measured only.
7. **Hand off** `music_bus.wav` and `music_plan.json` (`cues[]`) to `sound-design`: it adds the cue SFX (riser before a stop-drop, impact on the drop), ducks the bus under the VO and masters.
8. When the music isn't approved yet, render 2–3 plans (different pins or `allow_tracks`) on the same picture and let Atheeb pick.

## Rules
- Switch only on story turns: ≤ 3–4 per minute, sections ≥ 5 s, on a downbeat and a picture cut.
- Every arc has a rise into the payoff and a dip or stop before it; the voiceless payoff gets the biggest music.
- Never a vocal track under the VO, never a track's own break under a voiced line.
- Loudness changes are deliberate (±3 dB around the bed), never accidental jumps between tracks.
- Popular/commercial tracks only when `sound.music.rights` is `copyrighted_ok`; list them in DELIVERY_NOTES.

## Learn
Moods or transitions Atheeb likes for a client, tracks approved for a mood, arcs that worked → `style-library add <id> sound.music.arc.* …`, `add <id> sound.music.tracks …` (with mood + start offset), `log --kind approved|rejected`. New tracks analysed → keep their JSON in `_Global library/music/analysis/`.
