# Jigsaw stacks: when, shapes, spacing, tightness

The house rules come from Atheeb's notes on Wakefit, Mahindra and Ryan Reynolds (project doc `claude/caption-lockups.md`); the numbers and the tool make them repeatable.

## When to stack (and when not to)
- **Default: one line.** Any phrase of up to about 4 words sits on one line at one size, with the accent face on the key word ("sleep data.", "for a hundred nights.", "only 23").
- **Stack only when** the chunk is **3–8 words** **and** has exactly one meaning word worth making big, **and** the lines interlock cleanly (below), **and** the frame has room for a block (a plate, a dark area, the empty side of a card, a wall beside the subject).
- **If no clean pattern exists, don't stack** (Atheeb, Nov 21 2026). A stack is a pattern that feels good to look at, like jigsaw pieces sitting right; a loose or clashing stack is worse than one line.
- **Never:** fewer than 3 words; two big lines, or two lines at the same size (it doesn't read as a stack); more than 3 lines; mixed sizes within one line; a rule or line under a stack; a stack in a corner; descenders touching or hanging over ascenders below (e.g. the p/y of "they'd pay you a" over the l/k/h of "lakh."); a stray dot, ascender or descender of the big word sitting between the small line's words.
- **Frequency:** stacks are the designed moments: about one per 5–7 s in MMH styles (matching the one-big-word rhythm), ≤ 3 per 60 s in headline-led styles. Everything else is running captions.

## Allowed shapes
1. **small–BIG–small interlock** (the model): "started / **writing** / about it." One small line tucked into a notch above the big word, one tucked into a notch below it ("about it." under "writin", ending before the g), so the three lines lock together. Flush to a block edge only when that is where the notch is.
2. **Long small line over one big word,** fitted to the big word's width, only when it interlocks cleanly. "they'd pay you a / *lakh.*" and "a company once / **paid**" fail in Helvetica + Garamond (p/y descenders over tall letters), so they go on one line.
3. **Big word over a small tail** (rare): "**1.7** / crore a year" when the tail is 2–3 words.
No other shapes without Atheeb's say-so; log new approved shapes to the style.

## Sizes (tightness of scale)
- Big line: fitted to the block width B (ink width = B). B ≈ 55–70% of frame width at 1080 (600–760 px) for a stack beside a subject; up to 80% on an empty plate.
- Small lines: 0.25–0.45 × the big size (default 0.36). Below 0.25 they turn into fine print; above ~0.45 the hierarchy flattens and the stack stops reading as one (two lines at the same size never stack).
- The accent face (e.g. Garamond italic) is set 16% larger than the sans so its x-height matches.
- One line, one size. The accent is a change of face, not of size.

## Spacing and interlock (tightness between lines)
- **Interlock, don't just stack.** Each small line slides along the big word to the notch where it fits tightest: under the big word's x-height letters and beside its descenders, or above its x-height letters and beside its ascenders. Model: "about it." tucks under "writin" and ends before the g's descender, so the g hangs beside it (Atheeb's correction, Nov 21 2026); "at the company's / research / centre." is the reference for a tight, clean fit.
- **Air:** keep a channel of ≥ 0.28 × the small line's cap height between any two pieces of ink, checked column by column on the rendered glyphs.
- **The small line's body is off-limits:** inside the band from its x-height to its baseline, widened by 1 × its cap height on each side, no part of the big word may poke in. That stops i-dots and ascender tips from landing between its words ("it•ran for") or reading as punctuation ("started•").
- **Tight means:** optical gap (baseline → next line's x-height) ≤ 0.55 × the small cap height for every pair, and the two pairs within 1.8× of each other. A small line may shrink from 0.36 down to 0.25 × the big size to find a notch.
- **If the tightest interlock is still loose, don't stack.** Set the chunk on one line (or re-break it into a different stack).
- Tracking: −2% for small lines, −4% for big lines (display type tightens as it grows); never positive tracking on lowercase.
- Leading for multi-line running captions (not stacks): 0.95–1.05 of the font size.

## Whitespace around a stack
- Clear space around the block ≥ 0.5 × the big line's cap height on all sides (nothing else — logos, UI, other captions — inside it).
- Place the block's optical centre, not its box centre, on the layout point: big words carry the visual weight.
- Put stacks in real whitespace: the empty half beside a card, a veiled wall, a dark area, above or behind the head (text-behind-subject). Move a card off-centre to make room rather than shrinking the type.

## Timing
- Lay out the whole stack from its first frame; switch each word on at its spoken frame so lines never re-centre.
- Clear the stack one frame before the next chunk starts; give it an `endCut` when the shot changes first.
- A stack stays at least 0.6 s after its last word appears (so the big word can be read), unless the next spoken chunk forces it off.

## Tool
`scripts/stack_layout.py stacks.json out` (fonts, block width, lines with role small/big and face) measures with the real font files, slides each small line across the block (and down to 0.25× size) to find the tightest clean interlock, enforces the air channel and the no-intrusion band, rejects stacks with fewer than 3 words, without exactly one big line, or with no clean fit, and draws `out.png`, a sheet of every stack. Look at the sheet before rendering; feed `out.json` (sizes, x, baselines) into the composition. Rejected stacks are set on one line.
