# Contrast, legibility and placement

## Contrast targets
- Measure ink against the **brightest 10%** of the picture under and around the text (the darkest 10% for dark ink), at the start, middle and end of every chunk. `scripts/caption_check.py --video clean_pass.mp4` does this on a render with the caption text hidden.
- Minimum ratio of ink vs measured background, by treatment: none 4.5:1 · soft shadow 3:1 · stroke 2:1 · scrim or box: 4.5:1 measured with the scrim/box in the picture.
- Below the target, step up the treatment (shadow → stroke → scrim → box), or move the caption to a calmer part of the frame. Don't just make the text bigger.

## Treatments (values at 1080 wide; scale with width)
| Treatment | Spec | Use when |
| --- | --- | --- |
| Soft shadow (house default for MMH) | `text-shadow: 0 2px 10px rgba(0,0,0,.45)` | footage is mid-to-dark behind the text |
| Strong shadow | `0 0 2px rgba(0,0,0,.6), 0 4px 16px rgba(0,0,0,.5)` | mixed footage; still no visible outline |
| Stroke | 3–4 px dark stroke painted **behind** the fill (SVG `paint-order: stroke`; in CSS duplicate the text underneath with `-webkit-text-stroke` 6–8 px) | bright, busy footage in styles that allow outlines |
| Scrim | gradient from 40–55% black to 0 over ~1.5× the text block height, under the text only; or a radial darkening centred on the block | bright footage in clean styles (no boxes) |
| Box / pill | 60–75% black (or the brand dark), radius 12–16 px, padding 0.35 em × 0.6 em | UI-led styles; accessibility deliverables; when nothing else passes |
| Dark ink | `#111` on paper plates and light walls | light plates |

Rules: the treatment is part of the style (one per video); never a karaoke fill or eyebrow labels unless the style asks; never translucent grey boxes (they fail on bright frames).

## Colour
- White ink by default; one accent colour at most (the style's), on 1–2 words per phrase.
- Yellow (#F2E279-ish) holds on dark and mid footage; check it on bright frames.
- Avoid blue, pink, pastels and mid-grey for running captions; they fail on mid backgrounds.

## Size floors (legibility on a phone)
- Running captions at 1080x1920: cap height ≥ 2.2% of frame height (≈ 42 px cap ≈ 58–64 px font for Inter/Helvetica-like faces). MMH S size (49–52 px) is the smallest allowed and only with a good treatment.
- 16:9 at 1920x1080: S ≈ 52 px font minimum.
- Lockup small lines may go smaller (0.25× of the big word) because they are read with the big word, never alone.

## Placement
- **Platform safe zone first** (9:16, keep clear; geometry in `qa-delivery/scripts/safe_zones.py`, checked by `caption_check.py` and `zone_check.py`): **Reels** (Atheeb's graphic): 220 px top, 450 px bottom, 35 px right, 40 px left, plus the like/comment/share rail, a 100 px column inside the right edge from y ≈ 1150 to the bottom zone, so captions low in the frame must also end before x ≈ 945. TikTok 108 / 320 / 60 / 120 with the rail from y 700; Shorts 120 / 300 / 48 / 96; when one video goes everywhere use `universal` (260 / 450 / 60 / 120, rail from y 700). Stats and key numbers follow the same zones as captions.
- **Default y by mode** (fraction of frame height): running captions 0.55–0.62 (just above or at the chest, where eyes rest); over a talking head 0.66–0.75 on the chest; one-word subtitles 0.70–0.75; headlines/lockups beside the subject at mid-height, or 0.12–0.22 above or behind the head (Reels' top bar ends at 220 px = 0.115); in 9:16 the text's bottom edge stays above y ≈ 1470 (0.765), and anything below y ≈ 1150 (0.6) ends before x ≈ 945 (the button rail).
- 16:9: running captions centred at y 0.56 (MMH), lower when faces fill the middle; never in a fixed lower-third band unless the style says so; stay inside a 5% title-safe margin.
- **Faces:** never over eyes or mouth, checked over the chunk's whole time on screen (people move, cameras pan). Move to the empty side of an off-centre face (columns flush at x 0.06–0.12 or 0.62–0.88).
- **No corners** unless there is truly no other space.
- Two caption layers (running + lockup) never share a spot: clear one before the other appears, or place them clearly apart.
- Never over key numbers, real on-screen lower thirds, or busy text (an article body); fade the document or drop the caption when the picture already says the word.
