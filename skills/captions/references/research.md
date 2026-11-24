# Caption research (Nov 21 2026)

What the standards say, what short-form practice and our own measurements say, and how we resolved the conflicts. The standards were written for block subtitles on TV and film (whole sentence on screen at once); our reels mostly use **voice-synced** captions (words switch on as spoken), so some numbers translate and some don't.

## 1. Broadcast and streaming standards (block subtitles)

| Rule | Netflix (English) | BBC | DCMP / others | What we take |
| --- | --- | --- | --- | --- |
| Lines per subtitle | max 2 | max 2 | max 2 | 1 line by default; 2 only for block subtitles and 3-line jigsaw stacks |
| Characters per line | 42 | ~37 (68% of a 16:9 width) | 32 | social 9:16: ≤ 32; 16:9: ≤ 37 |
| Reading speed | 17–20 characters/s (adult) | 160–180 wpm (0.33–0.375 s/word) | 130–160 wpm | block subtitles ≤ 17 cps; voice-synced captions follow the voice |
| Minimum duration | 5/6 s (20 f at 24 fps) | ~0.3 s per word (1.2 s for 4 words) | 40 frames (1.33 s) | block: 0.83 s; synced chunk: ≥ 0.2 s on screen and ≥ 0.15 s per word |
| Maximum duration | 7 s | — | 6 s | 7 s |
| Gap between subtitles | ≥ 2 frames | no tiny gaps (jerky) | — | chunks butt (0 f) or ≥ 2 f; never a 1-frame gap (it flickers) |
| Line breaks | at grammatical units | keep the clause together; a break should signal more to come | never split names, articles from nouns | never split a name, number+unit, adjective+noun, fixed phrase; break after punctuation, before conjunctions and prepositions |
| Case and face | sentence case, sans | mixed case | sans serif, mixed case | sentence case or all-lowercase per style; never ALL CAPS for running captions |

Sources: Netflix Timed Text Style Guide (General Requirements; Subtitle Timing Guidelines; English 42 characters), BBC Subtitling Guidelines (summarised by Clevercast; BBC online guidelines v1.1), DCMP Captioning Key (via UCOP and Clevercast summaries), University of Melbourne captioning guide (≤ 180 wpm).

## 2. Contrast and legibility

- **WCAG 2.2 contrast:** 4.5:1 for normal text, 3:1 for large text (AA); 7:1 / 4.5:1 for AAA. Captions over moving video have no fixed background, so measure against the brightest part of the picture behind the text (we use the 90th percentile of luminance under and around the text box, at the start, middle and end of each chunk).
- **Treatment reliability, best to worst:** background box (white on black = 21:1, works on anything) → outline/stroke (3–4 px at 1080 wide holds on most footage) → drop shadow (fails on bright skies, white walls, windows) → nothing. Translucent grey boxes often fall below 4.5:1 when the video behind is bright (W3C WAI discussion).
- **Scrims:** a soft gradient (≈40% black → transparent) behind the text area protects legibility without boxing the text; target only the text area, don't blanket the image (Material Design: don't over-scrim). Radial darkening behind the text keeps the image's tone (NN/g).
- White text, then yellow, have the most luminance headroom on dark-to-mid footage; blue, pink, pastel and dark grey fail on mid backgrounds.

Sources: W3C WCAG 2.2 SC 1.4.3; W3C WAI mailing-list discussion on caption contrast (2017); Smashing Magazine "Designing Accessible Text Over Images" parts 1–2 (2023); Nielsen Norman Group "Text over images"; Material Design imagery guidance; caption-tool comparisons (BlitzCut, captions.ai help).

## 3. Short-form practice (vendor claims: use as direction, not proof)

- Most short-form video is watched without sound at least some of the time (Verizon Media/Publicis survey: 92% of consumers regularly watch with the sound off) — captions carry the hook.
- Common advice across caption-tool vendors: 2–4 (up to 5–7) words per caption phrase; 1–2 emphasised words per phrase at most; animated word-synced captions out-perform static full sentences for engagement (claims of 8–12% lower engagement for full-sentence captions are unverified vendor data).
- Placement advice: just above centre (around 55–60% from the top) where the eye rests, away from faces and the platform UI.

Sources: Opus Clip blog posts on Shorts/TikTok captions (2025), Clamper/DEV posts, Storyblocks (citing Verizon/Publicis). Treat the numbers as soft.

## 4. Platform safe zones (1080x1920)

Published guides disagree by tens of pixels and platforms change their UI; use the conservative values.

| Placement | Keep clear: top / bottom / left / right (px) | Source |
| --- | --- | --- |
| Instagram & Facebook Reels (incl. boosted) | 220 / 450 / 40 / 35, **plus the button rail**: a 100 px column inside the right edge (x ≥ 945) from y ≈ 1150 down | Atheeb's Reels 9:16 reference graphic (Nov 21 2026); earlier Ignite overlay 220 / 420 / 60 / 120 |
| TikTok | 108 / 320 / 60 / 120 (bottom grows with long captions; up to 480) | Ignite, AdaptlyPost, Wild&Free |
| YouTube Shorts | 120 / 300 / 48 / 96 | AdaptlyPost |
| Universal cross-platform | 260 / 450 / 60 / 120, rail x ≥ 930 from y 700 | our merge of the above |

Geometry for all platforms lives in `qa-delivery/scripts/safe_zones.py`; `caption_check.py` checks every chunk box against it and `zone_check.py` OCRs the render so stats, titles and anything undeclared are caught too.

## 5. Our own measurements

| Source | Mode | Words | Size (1080 wide) | Position | Animation |
| --- | --- | --- | --- | --- | --- |
| MMH style bible (20 reels, 1 lakh+ views) | phrase chunks + a few big words | 1–4 per chunk; one big word per 5–7 s | S 49–52 / L 108 / XL 155–160 px | centre y ≈ 0.56; 0.70–0.75 over a person | word switch-on at its spoken frame; L/XL 1.15 → 1 over 4 f |
| @artzenmedia (50 reels) | one word at a time + headline stacks | 1 (subtitles); 1–3 (headlines) | subtitle cap height 2.2–2.8% of frame height | subtitles y 0.70–0.75 on the chest; headlines y 0.08–0.22 or behind the head | 3–4 word changes per second; 2–4 f pops |
| Showcase reels (4, Nov 21 2026) | phrase, 1–2 lines | 2–5 per line, ≤ 8 per chunk | ≈ 64 px; key word ≈ 96 px yellow | lower centre y 0.55–0.62 | blur-reveal 2–3 f per word; exit blur + fade 3 f |
| Atheeb's feedback (Wakefit, Mahindra, Ryan; Nov 21 stack review) | jigsaw stacks | ≤ 4 words on one line; stacks need ≥ 3 words, one big line, a clean interlock, else no stack | big line fitted to block width; small 0.25–0.45× | beside the subject, mid-height; no corners | — |

## 6. Decisions
- Two kinds of caption, never mixed in one moment: **running captions** (voice-synced, small) and **lockups** (designed stacks, a few per minute). The style says which runs where.
- Running captions: 1–4 words per chunk (5 max), one line, ≤ 32 characters, ≥ 0.15 s per word on screen.
- Block subtitles (only when a style asks for them, e.g. interviews or accessibility deliverables): 1–2 lines, ≤ 32/37 characters per line, ≤ 17 cps, 0.83–7 s, ≥ 2-frame gaps.
- Every caption is measured for contrast on the real frames; below threshold → strengthen the treatment (shadow → stroke → scrim → box) or move it.
