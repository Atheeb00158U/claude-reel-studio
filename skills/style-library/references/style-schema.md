# style.json schema

Every key below exists in every style (the tool's template creates them). Departments read only their own section plus `format`. Free-text `rules` lists hold rules that don't fit a field; write them as instructions.

| Key | Owner | What goes in it |
| --- | --- | --- |
| `id`, `name`, `version`, `status` (`draft`/`approved`/`retired`) | style-library | identity; version is bumped by the tool |
| `client`, `brand`, `use_for`, `not_for` | producer | who it is for and when to pick it (shown in the "which style?" question) |
| `references` | reference-analyst | list of `{title, source, notes}` the style was learned from |
| `format` | producer | `aspect`, `width`, `height`, `fps`, `length_s` [min,max], `structure` (ordered beats) |
| `script_voice` | script-and-voice | `voice` (profile id or "on-camera"), `speed`, `tone`, `hook_rule`, `cta`, `rules` |
| `footage` | footage-research | `rights` (per video: `copyright_free` or `copyrighted_ok`, set at intake), `rights_default` (per style), `sources` (preferred, in order), `min_height`, `rules` |
| `edit` | editor | `cut_rule`, `median_shot_s`, `max_shot_s`, `transitions.default`, `transitions.vocabulary` [`{name, frames, detail, sfx}`], `transitions.budget`, `rules` |
| `captions` | captions | `mode` (word/phrase/stack/block, or a map per section), `words_per_chunk` [min,max], `max_chars_per_line`, `fonts` {main, accent}, `sizes_px`, `case`, `tracking`, `ink`, `accent`, `emphasis_per_phrase`, `treatment` (none/shadow/stroke/scrim/box + spec), `reveal`, `position` (y by mode), `stack` {allowed, shapes, small_cap, g_start, min_clear, per_min}, `rules` |
| `typography` | typography-titles | `display_face`, `accent_face`, `scale`, `accent_colour`, `animations` (allowed A-codes), `placement`, `rules` |
| `ui_motion` | ui-motion-graphics | `easing`, `durations_f` {name: frames}, `palette` {name: colour}, `components` (named UI pieces), `rules` |
| `video_effects` | video-effects | `vocabulary` (allowed effects), `budget`, `rules` |
| `vfx_glitch` | vfx-glitch | `default` (ShapeGlitch unless the style says otherwise), `types` [`{name, frames, per_45s/per_min, detail, sfx}`], `budget`, `rules` |
| `color` | color-grading | `look`, `lut` (path to .cube or null), `reference_frames`, `grain`, `vignette`, `rules` |
| `sound` | sound-design + music-director | `music` {rule, rights, tracks (with mood + start offset), level_vs_vo_db, duck_db, avoid, `arc` {mode: arc or one_track, template, max_switches_per_min, min_section_s, transitions, moods}}, `sfx` {events_per_min, palette [`{event, sound, db}`], never}, `master` {lufs, true_peak_db}, `rules` |
| `end_card` | producer / ui-motion-graphics | `rule`, optional `sfx` |
| `kit` | any | paths of reusable components/assets this style uses |
| `examples` | producer | finished videos made in this style |
| `approved`, `rejected` | everyone, via `styles.py log` | dated, department-tagged lessons from Atheeb's feedback |

Extra keys are allowed (the tool keeps them). Add a key to this table when a new kind of rule appears in more than one style.
