# Compositing recipes and the kit (learned on the MMH videos)

- Most of them are one move: **duplicate the shot, mask the subject on top, put something between** (text, glow, streaks, a frame). Make mattes with MediaPipe selfie/multiclass segmentation (installed in the cloud; the model is in `_Global library/models/`) per frame → feather 2–4 px → PNG sequence, and check 3–4 frames at full size. Hand-roto objects, or pick another shot when the matte fails.
- Budget per reel: one hook effect (text behind subject, crop open, film-frame walk-out, glitch lines), at most 2 hero effects in the body (glow outline + strobe, pixel stretch, radial blur with a sharp subject, beat clone trail, corner-pin text on a real surface), and one payoff effect (white silhouette flash into the end card). Each needs a reason in the story; leave 3–5 s of plain footage between effects.
- **MMH reference vocabulary.** From DclpjyxhKF6, built in the Mahindra project's `src/Mah.tsx`:
  - **Cutout:** the subject cut out with the background swapped, plus a white streak on entry. Accepts a video or a still; `dx` shifts the subject.
  - **Halftone:** a colour plate with dots, for a name beside the head.
  - **Mosaic:** pull-out from the hero to a 5×5 feed. Tiles are **stills**; the centre tile turns into a plate for words.
  - **DocPull:** a document full screen with highlight wipes, then pull-back into a phone on a plate.
  - **Split:** two shots side by side, with the right one sliding in. Each side takes `rate`.
  - **Mono:** desaturate to B/W.
  - **StripGlitch:** a horizontal strip shatter.
  - **StretchIn:** a pixel-stretch transition into the shot.
  - **Flicker:** a 2–3-frame face montage.
  - From `Wake.tsx`: Wall (a tilted 3D wall of screens), Slam (a card collage), FramedPrint (a gold frame on a white wall), InvertPunch.
- **Mattes:** erode the alpha 2–3 px (MinFilter 5) and feather 1 px, or blue/green spill shows as a rim around the cut-out. Check the matte frames for cuts and pans inside the range.
  - When a clean range is shorter than the shot, make a dedicated clip with `ffmpeg -ss … -t … -vf setpts=PTS*k,fps=30`. Matte that clip frame for frame, so the matte and the picture stay in sync.
- Built components (written for Remotion; port each to `_Global library/raea_kit` on first use and check it on a still) (Fevicol project, `_Global library/remotion_kit/src/Fx.tsx`, `Story.tsx`): WhipIn, RGBSplit, OldFilm, Shake, PunchAt, DropIn, LightLeak, VHS, MarkerCircle, CardToFull, InvertFlash, BlurBloom, ShrinkToPrint, TVFrame, Freeze, GriddCard. Cold brew project (`src/Mmh9.tsx`, `src/Ui.tsx`): TitleLockup (small sans + giant condensed serif italic word), pill/glow Captions, NumberPlate, WhyPlate, Scribble, Tilt (3D panel over a blurred bg), LinkedIn Composer/Feed/FeedPost, TestCard (✓/✕), WindowStack (XP), Carousel. Build these when first needed and add them to the kit: SubjectMatte, TextBehind, ZoomBlur, GlowOutline, PixelStretch, FilmFrame, CropOpen, CloneTrail, CornerPin (matrix3d homography), Boil (feTurbulence seed stepped every 3–4 f, also for marker circles), GlitchLines, WhiteSilhouette.


## Listicle showcase effects (measured at 30 fps from 4 reels, Nov 21 2026)
(frames measured at 30 fps)

Effects applied to the talking head (R1); R2/R3 show the same family on cards. Durations are the time each holds before the next item cuts in.

| Effect | What happens | Build (raea) |
| --- | --- | --- |
| headline wall | torn newspaper clippings ("claude can now edit your videos") fly in with heavy motion blur (8 f), stick around the head; then a zoom-blur push into one headline with a light burst → white flash (4 f) → cut | clipping PNGs (serif headline, yellow highlighter on a word, torn edge), each Sequence with translate+rotate and a directional blur during flight; ZoomBlur + white flash on exit |
| zoom-through cut | camera pushes through the frame with radial blur into the next shot | scale 1→3 over 4 f with radial blur, cut on the blurriest frame |
| vertigo | background scales while the subject stays the same size (dolly zoom) | matte; scale the clean plate 1→1.15 behind the cut-out |
| green screen | light-leak wipe (2 f), background replaced (R1: a music video) behind the subject | matte + new background + edge colour spill |
| phone mockup | a phone flips in at the side (spin + blur, 6 f), shows a screen, flips to a second screen, flips out | 3D card (rotateY) with screen content, motion blur on flips |
| digital zoom | punch-in with a camera-app UI: zoom readout "1.27×→1.30×" ticking at the bottom | scale 1.3 + overlay readout text that counts |
| paper cut | subject cut out with a thick white sticker border on graph paper with a yellow tape strip; ransom-note letters "PAPER" / "CUT" drop in one per 2 f; a torn-paper line sweeps down to exit | matte → dilate 20 px white border; CSS grid paper; letter blocks in mixed fonts/colours |
| ui world | room darkens; editor UI panels (timeline, clip card, chat "edit my reel") slide in with motion blur around him | glass panels, 4–6 f slide with blur |
| orbit | a ring of reel cards orbits him in 3D, passing behind and in front | cards on an ellipse; z<0 drawn before the cut-out, z>0 after |
| frame break | frame shrinks into a reel card (IG icons, handle) on a blurred dark copy; his head breaks out over the card's top edge | card with the plate inside (overflow hidden) + the cut-out drawn again unclipped above the card's top line |
| doodle boil | white hand-drawn outline around him + yellow zigzags/circles, all boiling (redrawn every 2–3 f) | matte edge stroke from a displaced matte, 3 variants cycled every 3 f; SVG doodles with seeded jitter |
| sticky text | a yellow sticker label flies in (motion trail) and then **sticks to his body**, following its motion | track a body point (MediaPipe pose shoulder/chest) per frame; sticker translates with it |
| before + after | a vertical light bar with a flare sweeps left→right; left side ungraded, right side graded; "before"/"after" pills | two plates, clipped at x; bar = white core + glow + horizontal flare streak |
| pull-back reveal | zoom out with blur (3 f) to reveal the shot is a clip inside a video-editor timeline | scale 1→0.45 into an editor UI mock |
| depth scatter | giant word "depth" behind his head, "scatter" in yellow in front; letters scatter into particles | text between plate and cut-out; per-letter offsets + blur + particles |
| comment bubble | see CTA | |
| R2/R3 extras | couch wall, checklist, chart grow, cover story, glass type, type wall (repeated outline text behind the subject), the stack (UI cards stacked), rack focus (foreground word in/out of focus), spatial glass (floating glass panels), scene text (word wallpaper "YAPPING YAPPING" behind subject), freeze sticker, clone, blackout, freeze + label (callout with leader line to the head: "01 sucks at design"), shatter 3d (frame splits into tiles), chip row (pills "brand colors" "fonts"), serif flow (dark plate, italic serif "five variations"), spotlight (dark plate, spotlight, big word behind/in front), prompt box (typed prompt "edit in my style") | same building blocks: matte, text layers, glass cards, type-on |

Look-dev notes: paper cut, depth scatter, sticky text, before/after, frame break and green screen read well as built; doodle boil needs darker footage or a dark edge under the outline; orbit needs bigger front cards overlapping the body.
