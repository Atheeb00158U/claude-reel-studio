# Caption track (MMH video essay)

Type: **Helvetica** for captions and **Apple Garamond (italic)** as the accent (the user's standing choice). Until the font files are in `_Global library/fonts`, use **TeX Gyre Heros Bold** and **TeX Gyre Pagella Italic** (`/usr/share/texmf/fonts/opentype/public/tex-gyre/`) as stand-ins and say so. Sentence case, tracking −2% (S) / −4% (L, XL), leading 0.9. White with `0 2px 10px rgba(0,0,0,.45)` on footage (a bottom or left scrim gradient on bright footage); #111 on paper. Never a box, outline, karaoke fill or eyebrow.

Sizes at 1080p 16:9: **S 52 px, L 108 px, XL 160 px** (9:16 at 1920 tall: S 49, L 108, XL 155). L ≤ 3× S. One big word per 5–7 s (about 6–8 in 35 s, 12–16 in 90 s); XL only 1–3 times.

One accent per video. Gridd AI: Apple Garamond italic. Earlier Berribot videos chose it from the story's world: Instrument Serif italic (scaled +18% to match the sans x-height) for the "fill" words of a dessert story; a film-title serif in wide-tracked caps (TeX Gyre Termes Bold, +6–8% tracking, scaled 0.92, faint glow) for the mafia-film references of the PayPal story. The accent is a face, not a colour: keep it white/ink so it reads on any footage.

Chunking rules:
- 1–4 spoken words per chunk (up to ~7 small words for a running line), split at grammatical seams. Never split a name, a number from its unit, an adjective from its noun, a fixed phrase ("old Dutch film") or a compound noun.
- Only meaning words go big: names, places, numbers, brands, the verdict word, the punchline verb. Function words never.
- **Stacks are jigsaw lockups** (the user's rules from the Wakefit and Mahindra feedback; the full guide is `claude/caption-lockups.md`):
  - **Short phrases (up to about 4 words) go on one line** at one size ("sleep data.", "for a hundred nights.", "with auto-rickshaw tyres").
  - Never a 2-word stack, never two big lines in a row, never mixed sizes on one line, never a rule or line under a stack.
  - Allowed shapes:
    - small-BIG-small interlock: "started / **writing** / about it.", the user's model;
    - a long small line fitted to the width of one big word: "they'd pay you a / *lakh.*".
  - Z stacks were dropped as messy. A stack is never a centred paragraph.
  - **The gaps must look equal.** Space optically: measure from each line's baseline to the next line's x-height top. Use one value per stack, and raise it for the whole stack only where a descender would come within 0.16 × cap height of an ascender (checked on rendered glyphs, column by column).
    - Don't stack on ink boxes: lines with p/y/g then look further apart. The user caught this on "company's / research / centre.".
  - **Engine** (Mahindra project):
    - `scripts/layout_stacks.py` measures with the real fonts and sizes emphasis lines to block width B. Other lines are capped at `capRatio` × the emphasis size.
    - It writes `stacks_layout.json`, which `src/Lockup.tsx` renders as SVG `<text>`.
    - `scripts/preview_stacks.py` draws every multi-line stack on one sheet. Check it before rendering.
- **Two caption layers never share a spot.** When small one-word captions and big lockups run together, the lockup clears before the next small word appears, or the two sit in clearly different places (Ryan v1: "internet" big and "is talking" small on the same line).
- `spread` chunks put each word at its own x on one baseline over a plain plate ("But · they · fucked · up · the · casting"), or split the sentence around an object ("The names [print] from that photo").
- `ghost` chunks pre-lay the full sentence at ~22% and turn each word solid as it is spoken, for a quiet read-along line.
- Clear a chunk explicitly (`end`/`endCut`) before a quote beat or hold, and whenever the shot changes before the next chunk starts, so it doesn't sit over the next picture. Clear every chunk one frame before the next one starts.
  - Dark text left over a dark shot is invisible until a glitch inverts it, so it still needs clearing.
- Headline animations from `bible-text.md`, only where a beat needs one: type-on (1–2 f per letter, done in ≤ 0.6 s, with typing ticks), stretch (scaleY 1→2.2 from the bottom, ease-in, 8–12 f), a colour shift on the stressed word (6 f), text as a window (video through the letters), a gap cut between overlapping titles, and the CTA stack (a small "follow" / "comment" over a BIG word).

Reveal: lay out the whole chunk from its first frame, invisible, and switch each word on exactly at `wf(i)`, so lines never re-centre. S: 50% → 100% over 2 f. L/XL: scale 1.15 → 1 over 4 f, opacity 0.45 → 1. No bounce, spring, per-letter rotation or exit animation; the next chunk replaces it. Captions follow the voice, not the cuts: one chunk may span 2–3 shots.

Placement: default centre, y ≈ 0.56 (MMH's PayPal reel sits at 0.70–0.74; in 9:16 over a person, chest height y ≈ 0.70–0.75); y 0.80–0.88 when faces or a busy middle fill the frame. Move only for the picture: to the empty side of an off-centre face (columns flush at x 0.06–0.12 or 0.62–0.88), above/below a container, behind the subject's head for a headline, or split around an object. Never over eyes, never in a fixed lower-third band. On plates, text sits on the empty half beside the card.
- **No corners** (lower-left, top-right, top-left) unless there is truly no other space.
- Check every caption against the subject over the **whole** time it is on screen: cameras pan and subjects drift.
- Bottom-centre only directly under a card, or over clothes when faces fill the frame.

Engine sketch (raea; the same code runs in Remotion):
```tsx
type CW = { i: number; size?: 'S'|'L'|'XL'; accent?: boolean; text?: string };
type Chunk = { lines: CW[][]; shape?: 'line'|'sOverL'|'spread'; x: number; y: number;
  xs?: number[]; anchor?: 'left'|'center'|'right'; ink?: 'light'|'dark'; ghost?: boolean; end?: number };
// active chunk = last whose wf(first word) <= frame, until `end` or the next chunk starts
// block: position absolute at (x,y), translate(anchor), inline-flex column; each line a flex row,
//   marginTop = round(max px of the previous line * 0.06); spread: each word absolutely positioned at xs[k]
// each word: inline-block span, opacity 0 (0.22 when ghost) until wf(i), then the entrance above
```
