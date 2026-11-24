# claude-reel-studio

Reel Studio, a Claude Cowork / Claude Code plugin (v0.6.2). Install by zipping this folder as `reel-studio.plugin`, or add the repo as a plugin source.

# Reel Studio — a video production team

Start every video with the **producer**. It asks which saved style to use, plans the video, hands each job to the right department, gates drafts through QA, and logs what you approve or reject back into the style so the next video comes out consistent.

## The team

| Skill | Role |
| --- | --- |
| producer | Brief → choose style → plan → hand-offs → drafts → feedback → delivery |
| style-library | Saved styles per client/format (motion, transitions, glitches, captions, UI, colour, SFX, music, mix), version history and the learning log |
| reference-analyst | Studies reference videos at 30 fps and turns them into a new draft style |
| script-and-voice | Hook, script, beats, Voice Studio VO, word timings |
| footage-research | B-roll and clips from YouTube (CC or any), public archives and stock, in the video's rights mode; highest-quality downloads; quality + rights gate (`check_assets.py`) |
| editor | Cut timing, pacing, shot lengths, transitions |
| captions | Spoken-word captions: words per chunk and line, line breaks, jigsaw stacks with optical spacing, timing, safe zones, measured contrast (tools: stack_layout.py, caption_check.py) |
| typography-titles | Titles, hook headlines, CTA text, lower thirds, kinetic type |
| ui-motion-graphics | UI screens and elements: ledgers, cards, comment/CTA UIs, mock apps, end cards; easing and tokens |
| video-effects | Matte-based compositing: cut-outs, text behind subject, paper cut, orbit, frame break, green screen… |
| vfx-glitch | Engagement punches: invert/shape glitches, RGB split, flashes, strobes |
| color-grading | Reference-matched looks baked to LUTs; never fake relighting |
| music-director | The music arc: moods per story beat, track analysis (tempo, downbeats, key, energy, drops), track + bar per section, DJ-style switches or one track shaped with strip-backs; music bus + energy chart |
| sound-design | SFX for transitions, UI, motion and glitches; music; mixing and mastering |
| qa-delivery | Style compliance and the QA checklist before every draft; delivery |

## Where the styles live
`Claude video work/_Global library/styles/` on the Mac: one folder per style (`style.json`, `STYLE.md`, `CHANGELOG.md`), plus `INDEX.md`, the learning log `LOG.md` and the `styles.py` tool. Each video gets a `style.lock.json`, so it stays consistent even as the style keeps learning. Mirror for other Claude surfaces: the project doc `claude/style-library.md`.

Seeded styles: `gridd-mmh-ad-story`, `berribot-mmh-explainer`, `claude-showcase-listicle` (draft). Default glitch everywhere: ShapeGlitch (from the cold brew v2 reel).

## v0.3
- `captions` split out as its own deep skill (research-backed rules for words per chunk/line, line breaks, reading speed, stacking with optical spacing, safe zones, measured contrast; tools `stack_layout.py` and `caption_check.py`); `typography-titles` holds titles, headlines and kinetic type.
- ShapeGlitch is the default glitch, with a tested raea component.

## Needs
The "Video Editing" Claude project and the connected folder **Claude video work**; raea for rendering (Remotion only with approval); Python with numpy, opencv-python, Pillow and mediapipe.

## Replaces (v0.1)
mmh-video-essay, listicle-showcase-reel and film-look-grading. MMH and the showcase format are now saved styles; grading is the color-grading department.

## v0.6 (Nov 2026): approved motion-graphics defaults
Learned on the Wealthometry Script 3 ad, after two rejected passes:
- **ui-motion-graphics:** real app screens rebuilt 1:1 (WhatsApp, iOS Calendar/notifications/Messages, Google Search/Sheets/Forms/Calendar/Pay, Chrome PDF). Each opens pre-zoomed and the camera pans to follow the action. Few words on screen. Kit: `assets/real-app-kit.tsx`, `assets/real-app-hooks.tsx`. Grammar: `references/real-app-motion-grammar.md`.
- **video-effects:** graphics behind the speaker for brand lines (`scripts/behind_speaker_gfx.py`). Text behind the head is used only on request; no gimbal parallax.
- **producer:** layout grammar (no split→split, full→full or face→face); hook variants render only the hook; partial fixes re-render only the changed frames.
- **sound-design:** no per-word caption ticks; one sound per meaningful event, mapped to the new SFX pack (about 28/min).
- **typography-titles / captions:** stacks get their own clean screen; restore caption words when a big word is removed.
- **style-library:** new styles start with these `ui_motion` rules.

## SFX library (private repo)
The sounds the skills use live in a separate **private** repo, https://github.com/Atheeb00158U/claude-reel-studio-sfx (Git LFS, about 540 MB, invite-only). Clone it into the global library so the paths match:

```sh
brew install git-lfs && git lfs install        # once per Mac
cd ~/Desktop/"Claude video work/_Global library"
git clone https://github.com/Atheeb00158U/claude-reel-studio-sfx.git sfx
```

Keep it private: several sources (Storyblocks, Mixkit, Pixabay, meme audio) allow use in your own videos but not sharing the files publicly. Rights per sound: the repo's README.

## v0.6.2 (Nov 2026): shared SFX library
- **sound-design:** the SFX library is the private `claude-reel-studio-sfx` repo cloned as `_Global library/sfx`; new sounds are pushed there.
- **producer:** the publishing steps say audio never goes in this repo.

## v0.6.1 (Nov 2026): every update is pushed to GitHub
- **producer:** new rule and `references/publishing-plugin-updates.md`. Every plugin change bumps the version, is committed with the noreply author, tagged, repackaged and pushed to this repo.
- **style-library:** a learned rule that becomes a plugin default is published the same way.

## Publishing updates
Repo: https://github.com/Atheeb00158U/claude-reel-studio. The working copy lives in `Claude video work/claude-reel-studio` on the Mac. For each update: bump `.claude-plugin/plugin.json`, add a `## vX.Y.Z` note here, commit as `Atheeb <Atheeb00158U@users.noreply.github.com>`, tag `vX.Y.Z`, then push:

```sh
cd ~/Desktop/"Claude video work"/claude-reel-studio && git push origin main --tags
```

Full steps: `skills/producer/references/publishing-plugin-updates.md`.
