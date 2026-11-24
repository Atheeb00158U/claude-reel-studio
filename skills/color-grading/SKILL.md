---
name: color-grading
description: "Colour-grades footage in the locked style: corrects exposure and white balance, matches a reference frame or film look, compares several looks on one labelled sheet, bakes the chosen look into a .cube LUT, and applies it before compositing. Never paints fake relighting. Use for colour grading, film looks (\"make it look like Blade Runner\"), LUTs, matching one shot to another, fixing a cast, or a grade that looks wrong."
---

# Colour grading

Read the style first: `style.lock.json` → `color` (look, LUT path, reference frames, grain, vignette, rules). If the style has a `lut`, apply it; build a new look only when asked or when the style has none.

Our method (Nov 21 2026) borrows ideas from public Claude skills (MIT): isaacrowntree/color-grade-ai (measure then correct, log-vs-display check, shot matching, emit .cube) and agamm/video-agent color-grade (several looks on one sheet, user picks, apply as LUT). Their scripts are not used; ours is bundled as `scripts/refgrade.py` (`${CLAUDE_PLUGIN_ROOT}/skills/color-grading/scripts/refgrade.py`; copy also in `_Global library/tools/grading/`). Needs numpy, opencv-python, Pillow.

## Steps
1. **Log or display?** Lifted blacks near 0.09, no highlights near 1.0, low saturation = log. Convert with the camera LUT first, or ask.
2. **Correct** only what's clearly off: median luminance ≈0.45, black point ≈0.02, neutral white balance.
3. **Representative frame** with skin, a bright and a dark area.
4. **Reference frame per look** (film still for internal reference only, or a frame Atheeb supplies; store it in the style's `color.reference_frames`).
5. **Match:** `ref_grade(img, ref)` — luminance histogram match (0.75; 0.4 for bright references so blacks don't go grey), zone-wise LAB colour transfer (MKL per shadows/mids/highlights so split toning carries over), skin keeps 45% of its own chroma (YCbCr locus), vignette 0.18, grain 0.012. B/W: filmic S-curve + highlight glow; selective colour only for a real red object.
6. **Sheet:** the same frame through 6–12 looks, original first, each labelled with its reference thumbnail. Let Atheeb pick.
7. **Bake and apply:** `bake_cube(frame, ref, look.cube)` (33³; 65³ if skies band). Apply with ffmpeg `-vf "lut3d=look.cube:interp=tetrahedral"` to the clips before compositing, so captions and UI keep their colours; vignette and grain go in the composition. Save the LUT to `_Global library/styles/<id>/` and `set color.lut`.
8. **Check:** skin reads as skin, blacks not grey, no banding, nothing glows that wasn't lit.

## Never
- Never paint new light in code (coloured pools, window slats, rim light from a 2D matte): rejected as fake (`references/relighting-lessons.md`). Real relighting needs an AI relight model, which the cloud workspace can't run; ask before using one in the browser and label it AI in the notes.
- Never run scripts from freshly cloned third-party repos.

## Learn
Approved looks → `style-library set <id> color.lut …` and `log --kind approved`; rejected looks → `log --kind rejected`.
