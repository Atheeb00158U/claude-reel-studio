---
name: captions
description: "Builds the spoken-word caption track in the locked style: picks the caption mode, chunks the words (how many per caption and per line), breaks lines, decides when a jigsaw stack is allowed and spaces it optically, times every word to the voice, places captions away from faces and platform UI, and proves contrast on the real frames. Use for captions, subtitles, text stacking, word-by-word captions, \"captions are hard to read\", caption placement, or caption timing."
---

# Captions

The department for every word that is spoken and also shown. Titles, headlines, CTAs and type animation are the `typography-titles` skill; this skill owns running captions and caption stacks.

Read the style first: `style.lock.json` → `captions` (mode, words per chunk, faces, sizes, case, ink, accent, treatment, reveal, position, stack settings, rules). The style's numbers win over the defaults below. Research and measured references behind every default: `references/research.md`.

## 1. Pick the mode (one per section, never two in the same moment)
| Mode | What it is | Words per chunk | Lines | Typical style |
| --- | --- | --- | --- | --- |
| `word` | one word at a time, switching on each spoken word | 1 | 1 | talking-head commentary (artzen) |
| `phrase` | running caption, words switch on as spoken, chunk replaced by the next | 1–4 (5 max) | 1 | MMH, showcase reels |
| `stack` | designed jigsaw lockup for a key line, only when it interlocks cleanly | 3–8 with exactly one big word | 2–3 | MMH key lines, ~1 per 5–7 s |
| `block` | subtitle block shown whole (interviews, accessibility deliverables) | up to ~14 | 1–2 | only when the style asks |

## 2. Chunk the words
1. Split at grammatical seams: after punctuation; before conjunctions (and, but, so, because), prepositions and relative words (that, which, who).
2. Never split a name, a number from its unit ("₹1.7 crore"), an adjective from its noun, an article from its noun, a verb from a short particle, or a fixed phrase ("old Dutch film").
3. Per line ≤ 32 characters in 9:16 (≤ 37 in 16:9); per chunk within the mode's word range. A 1-word chunk is fine for a punch word; avoid orphan function words ("the", "a") as a chunk of their own.
4. Meaning words get the emphasis (names, places, numbers, brands, the verdict, the punchline verb): 1–2 per phrase at most, in the style's accent (face, colour or size). Function words never.
5. Write the chunks to `src/data/captions.json` (word indices, mode, lines, emphasis, position, treatment), which the picture, the SFX ticks and the checker all read.

## 3. Stack only when it earns it
Default to one line. Stack only when the chunk has 3–8 words, exactly one meaning word worth making big, real whitespace for a block, and **a clean jigsaw fit**: each small line tucked into a notch of the big word (e.g. "about it." under "writin", ending before the g), a visible air channel everywhere, no stray dots or ascenders between the small line's words, gaps tight and even. **If no clean pattern exists, don't stack.** Rules and numbers: `references/stacking.md`. Lay out every stack with `scripts/stack_layout.py` (it searches for the notch and rejects stacks that don't fit cleanly) and look at its sheet before rendering.

## 4. Time to the voice
- Build the chunk's layout from its first frame (invisible), and switch each word on at `wf(i)` (its spoken frame) so lines never re-centre. Reveal per the style (e.g. 50 → 100% over 2 f; L/XL scale 1.15 → 1 over 4 f; showcase blur-reveal 2–3 f).
- A chunk stays until one frame before the next chunk starts, or until `endCut` when the shot changes first; never a 1-frame gap between chunks (flicker), never lingering into a new shot or a voiceless beat.
- Synced chunks: ≥ 0.2 s on screen and ≥ 0.15 s per word. Block subtitles: 0.83–7 s, ≤ 17 characters/s, ≥ 2-frame gaps.
- Hand every word's frame to `sound-design` (ticks on caption words only when the style explicitly asks; Atheeb rejected per-word ticks as too much).
- When a word shown as a big or behind-the-head word is removed, put it back into the caption chunk; never leave a spoken word uncaptioned.

## 5. Place and protect
- Inside the platform safe zone; default y per mode; never over eyes, mouths, key numbers or real lower thirds; no corners; two caption layers never share a spot. Numbers and rules: `references/contrast-and-placement.md`.
- Contrast is measured, not eyeballed: render a clean pass (caption text hidden, scrims/boxes visible) and run `scripts/caption_check.py captions.json --video clean_pass.mp4`. It checks words per chunk, characters per line, lines, durations, reading speed, gaps, safe zone, contrast per treatment, and face overlap at the start/middle/end of each chunk. Fix every failure (strengthen the treatment, move the chunk, re-break it) before the draft goes to QA.

## 6. Build notes
- Fonts load with `@font-face` + `staticFile` in raea; render one still to confirm the face (SVG `<text>` ignores system font names).
- The MMH caption engine (chunk types `line`/`sOverL`/`spread`/`ghost`, the reveal code, sizes S/L/XL, spread captions around an object): `references/caption-engine.md`.

## Learn
Any note about caption length, stacking, spacing, size, colour, treatment, position or timing that should hold for this client → `style-library set/add/log` on `captions` (e.g. `set <id> captions.words_per_chunk '[1,3]' --note "Atheeb: shorter chunks"`). Approved stack shapes go in `captions.stack.shapes`.
