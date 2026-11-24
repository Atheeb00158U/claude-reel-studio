# Showcase-reel bible: "N effects Claude can create" (learned Nov 21 2026)

Learned from 4 creator reels Atheeb uploaded (720x1280, 30 fps; one at 23.976), analysed frame by frame at 30 fps, with whisper word timings, cut detection from frame differences, UVR voice/bed separation and ebur128 loudness. They are reference only: rebuild the format with our own footage, never republish them.

| # | Reel | Length | Format |
| --- | --- | --- | --- |
| R1 | "16 video effects Claude can create" | 23.8 s | effects applied to the talking head itself |
| R2 | "17 video effects…" (comment STUDIO → waitlist) | 27.3 s | held card showing each example |
| R3 | "16 new video effects…" | 34.9 s | held card showing each example |
| R4 | "20 movie color grades Claude can create" | 34.4 s | the whole frame regraded/relit per film, reference card on the lap |

## 1. The format (one sentence)

A talking head reads a numbered list out loud, one item per ~1 s, while a **title + numbered ledger** sits on top, the current item turns yellow, and the item itself is shown (on him, on a held card, or as a full-frame grade). Then a 5–10 s **comment-keyword CTA** ("comment STUDIO") with a mocked comment and reply.

### Timing (measured)
- Items land on the spoken item name: the effect, card swap or grade cut happens **on the first frame of the name** (0–1 f early). Mean item length: R1 1.0 s, R2 0.95 s, R3 1.2 s, R4 1.15 s. Nothing over 1.6 s.
- Optional hook: R1 opens with a 1.5 s question ("Claude, can you make all of these effects?"); R2–R4 start straight on item 01 at frame 0.
- List ends at 63–68% of the runtime, CTA after it: offer ("if you want all 46 / 26 / 16…") → keyword ("comment studio") → follow line.

### Title + ledger (the signature)
- Title, centred above the head, 2 lines: "**16** video effects / claude can create". Heavy grotesk, all lowercase, tight tracking (≈ −4.5%), leading ≈0.95, white with a soft shadow; the number in accent yellow **#F2E279** (sampled 242,226,121). At 1080 wide: ≈62–66 px.
- Ledger: two dark-glass panels left and right just under the title (rgba(28,28,28,.42) + backdrop blur ≈16 px, radius ≈20 px at 1080), 8–10 rows each: small grey number "01" (≈18 px, semibold, 55% white) + item name (≈28 px heavy). The current item turns yellow; earlier items stay white.
- Two ledger modes: **full list visible from the start** (R1–R3) or **progressive** (R4: empty numbered slots, each name appears as it is spoken). Progressive suits lists where the names are the payoff.
- Title and ledger blur-fade out (~6 f) when the CTA starts and come back for the comment UI (R1).

### Captions
- Same heavy lowercase grotesk, white; the key word in yellow and ~1.5× bigger ("all of these / **effects?**", "to get all / **46**", "comment **studio**", "so they **stand out**").
- Each word **blur-reveals**: appears blurred at ~50% for 2–3 f, then sharp. Exit: blur + fade over 3 f. Lower-centre (y ≈0.55–0.62 over the chest), never over the face.
- During the list the item name is the caption only in R4 ("01 blade runner 2049", small yellow number + white name, y ≈0.82); in R1–R3 the ledger replaces captions.

### Held card (R2, R3)
- A 9:16 rounded card (≈31% of frame width, radius ≈26 px at 1080, 4–5 px cream border #F4F0E6, soft drop shadow) composited **in front of** his hands at chest height; he gestures as if holding it. It drifts a few px with the hands. Fingers never overlap it, so it is an overlay, not a tracked prop.
- Counter pill top-left inside the card: "06/16" (dark pill, white heavy numerals).
- Content swaps with a **hard cut** on the item name; each card plays a 1 s example of the effect (with its own captions, at card scale).

### Full-frame grade mode (R4)
- One locked-off seated shot (armchair, room), regraded per film with a hard cut on each title. The grades include **relighting** (coloured window light on walls, light pools, rim light). That is AI relighting, not a LUT; we can't reproduce it convincingly in code (see section 4).
- A 16:9 "REFERENCE" card (≈45% width, cream border, small "REFERENCE" tag) floats at lap height with the film still.
- End: back to the ungraded original ("just like this") after a **grade strobe recap**: 2–3 frames per look across ~1.5 s with a sub hit.

### CTA (R1–R3)
- Comment input pill slides up (dark glass, avatar, placeholder "Add a comment…"); "STUDIO" types letter by letter (~2 f a letter, caret visible); the send button turns yellow; the input morphs into a posted comment bubble (white pill + red notification dot); a reply bubble "Sent you the link" with a yellow "Open link" button appears 6–8 f later.
- R2/R3 also show the creator's profile card (avatar, handle, grid of posts) for "follow for more…".

## 2. Effect catalogue (frames measured at 30 fps)

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

## 3. Sound (measured)

- Loudness: all four master at **−14.1 LUFS** integrated, LRA 2–5 LU.
- After separation: voice −15.2 to −15.6 LUFS; the non-voice layer −30 (R1, R4) to −36 (R2, R3). So the bed sits **15–21 LU under the voice**: almost a dry voice reel.
- R1: no continuous music; low-end whoosh/impact SFX on the big effects (headline wall flash, green screen, orbit, before/after, depth scatter).
- R2/R3: nearly dry voice, faint SFX on card swaps.
- R4: a quiet bass-heavy music bed throughout, plus one long sub hit under the grade strobe recap (~1.8 s).
- Rule for our versions: voice first; one SFX per effect at most (whoosh on fly-ins, a soft click on card swaps, a sub hit on the recap); music optional and ≥15 dB under the voice.

## 4. Our versions (look-dev, Nov 21 2026)

Built on two free Unsplash photos (`_Global library/references/stock_plates_unsplash/`, meta.json has the sources), rendered in raea 0.1.8. Kit: `_Global library/raea_kit/showcase/` (`Lab.tsx` + `media/`), grade engine `_Global library/tools/grading/` (`grade.py`, `refgrade.py`).

- **Effects that read well as they are:** held card + ledger, paper cut, depth scatter, sticky text, before/after, frame break, green screen, digital zoom, comment CTA, grade ledger. Doodle boil needs darker footage or a dark edge on the outline. Orbit needs bigger front cards overlapping the body.
- **Colour grades: v1 was rejected ("relighting looks fake").** v1 added coloured light pools, window slats and rim light from a 2D person matte; without real depth and normals the light can't wrap the face or fall off with distance, so it reads as stickers. **Don't fake relighting in code.**
- **v2 (accepted as the method): reference-matched grades.** `refgrade.py`: luminance histogram match (strength 0.4–0.75; use 0.4 for bright references like Dune, Barbie and Grand Budapest so blacks don't go grey) + zone-wise LAB colour transfer (Pitié-Kokaram MKL per shadows/mids/highlights, so split-toning carries over) + skin protected by YCbCr locus (keep 45% of the original skin chroma) + light vignette and grain. Sin City = filmic B/W (S-curve, highlight glow), no selective red unless the scene has a red object.
- `bake_cube(img, ref, path)` bakes the colour part into a 33³ `.cube`; apply to footage with ffmpeg `lut3d=x.cube:interp=tetrahedral` before compositing (verified: matches the direct grade except vignette/grain, which go in the composition).
- **Real relighting** (coloured light on walls and faces, like R4) needs an AI relight model, which this cloud workspace can't run (2 CPUs, no GPU; Hugging Face blocked). Options to put to Atheeb: an AI relight tool in the browser on his account (Higgsfield relight/Nano Banana image edit; our Higgsfield connector can only read the catalog, not generate), or shoot with practical coloured lights. Never present code relighting as real.

## 5. raea notes found on the way (0.1.8)

- `staticFile()` reads **`<composition folder>/media/`**, not `public/`.
- `loadFont` is not exported from `"raea"` (bundle refused). Load fonts with a `<style>` `@font-face` block using `staticFile("Font.otf")`; Inter Display, Anton, Archivo Black, Crimson, Cardo all rendered correctly.
- `backdropFilter: blur()`, `drop-shadow` filters, CSS gradients, `perspective() rotateY()` all render.
- The Vulkan driver was missing although `libvulkan1` was installed: raea fell back to GLES and refused every frame ("Downlevel flags VIEW_FORMATS…"). `apt-get install -y mesa-vulkan-drivers` fixed it (≈0.6 s a still at 1080x1920).
- Built-in browser downloads land in Downloads as a hidden `.Q6L2SF6YDW….com.anthropic.claudefordesktop.*` temp file; it holds the full tar and can be extracted directly.
