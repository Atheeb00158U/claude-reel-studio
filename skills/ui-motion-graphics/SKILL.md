---
name: ui-motion-graphics
description: "Designs and animates UI motion graphics in the locked style: real app screens rebuilt in code (WhatsApp, iOS Calendar and notifications, Google Search, Sheets, Forms, Calendar, Pay, Chrome PDF, Messages), typed searches and prompts, highlights, counters, charts inside their app, phone mock-ups, ledgers, comment/DM bubbles, CTA UIs and end cards, with a Vox-style camera that follows the action. Use for UI animation, app mockups, motion graphics on split screens, interface elements, typed text, or a \"comment KEYWORD\" CTA."
---

# UI motion graphics

Read the style first: `style.lock.json` → `ui_motion` (easing, durations in frames, palette, components, rules) and `end_card`. Then read **`references/real-app-motion-grammar.md`**: it is the default grammar Atheeb approved, after two rejected passes. Follow it even when no references are given.

## The default grammar (approved Nov 2026)
1. **Show the real thing, rebuilt accurately.** Every graphic is the real app or artefact the line talks about, rebuilt 1:1 in code: layout, fonts, colours, icons and spacing, with example content. Examples:
   - an office or family WhatsApp group;
   - an iOS Calendar year view;
   - a notification from Papa;
   - a Google search;
   - a Sheets savings tracker;
   - a Google Form intake;
   - a PDF plan;
   - bank SMS;
   - a Sensex card;
   - a Google Calendar event;
   - a Google Pay request.

   Never invent dashboards, "feature cards", shadcn tiles or icon-and-text slides.
2. **The camera tells the story, one zoom per beat.**
   - Open **already zoomed in** on the subject and then only **pan** to follow the action: the newest bubble, the caret, the active cell, the next date line.
   - Never zoom out then in again, and never zoom-out → cut → zoom-in.
   - Moves use bezier (0.65, 0, 0.35, 1) over 8–14 f, with holds between.
3. **Few words on screen.** Only the words the line needs. No paragraphs, sub-captions, explanatory labels or toolbars full of text ("too wordy" was a rejection).
4. **Graphics move with the speech.**
   - Each element lands on its spoken word: bubbles pop in 6 f, notifications drop in 9 f, a highlighter wipe takes 8–12 f.
   - Typing runs at 1–1.6 characters per frame, synced to the words, with a caret.
   - Counters climb over 10–14 f in Indian format; a chart draws left to right over about 20 f **inside the app it belongs to**.
5. **Searches are phrased the way people really type them** ("how to plan retirement at 40"), never the spoken line pasted in.
6. **Stacks and titles get their own clean screen.** Never put them over a blurred app (that reads as an overlay). Cut back to the app afterwards.
7. **Brand or claim lines stay on the speaker.**
   - Put the animation *behind* him in the room (bars rising on the wall, a counter above his head, a growth line), composited before the grade: `video-effects`.
   - A white data-viz plate with bars, buckets or columns reads as a PowerPoint slide (rejected twice).
8. **The client's own website is not a motion graphic.** Highlighting your own homepage means nothing.
9. **No drop shadows** on invented elements. Real UIs keep their own subtle borders.
10. **Layout grammar** (with `editor`):
    - face can go to split or full;
    - split goes back to face or full;
    - never split → split, full → full or face → face, unless Atheeb asks.
    - Show a graphic only while the line is about it.

## Component library
- **Real-app kit (approved):** `assets/real-app-kit.tsx` (raea 0.1.8), the full Wealthometry Script 3 composition. It contains:
  - `Cam` (keys → pan/zoom, monotonic-safe), `Phone` + `StatusBar`, `Safari`, `Banner` (iOS notification), `Typed`;
  - `WAChat` (generic WhatsApp thread: title, members, typing indicator, bubbles, reaction);
  - iOS Calendar year view with a 20-year scroll;
  - Google homepage + caret-following search + autocomplete;
  - Google Sheets (rows fill, active cell, total counter + highlighter, embedded chart);
  - Google Calendar event card (strike-through reschedules / accepted guests + status chip);
  - Google Forms intake;
  - Chrome PDF viewer with highlighted numbers;
  - iOS Messages SMS credits;
  - Google finance card on a phone;
  - the dark CTA end card.
- **Hook variants:** `assets/real-app-hooks.tsx` (Google Pay payment request; family WhatsApp group).
- Fonts and logos: Inter (iOS-like), Roboto (Google), Liberation Sans (Arial, Google Search), Noto Color Emoji rendered to PNG (raea can't draw colour-emoji fonts). Get official logos from the brand CDN through the browser, then file them in `_Global library/brand/`.
- Older starter code: `assets/showcase-lab.tsx` (ledgers, held cards, comment pills, glass panels). MMH components (LinkedIn composer, TestCard, WindowStack, Carousel) are in `_Global library/remotion_kit`, to port on first use.

## Steps
1. For every line, write: *what real app or artefact would show this?* → the screen, the action on it, the word each element lands on, and what the camera follows. Write it down before building.
2. Build from `real-app-kit.tsx`, restyled with the style's tokens. Render a sheet of stills (`--at`) at each landing word and check:
   - is it pre-zoomed;
   - nothing clipped;
   - few words;
   - nothing hidden under the status bar (draw overlays such as notifications *after* the status bar);
   - text fits inside its bubbles.
3. Hand typing, pops, highlights and notifications to `sound-design` with their frames.

## Learn
New components, easing or timing Atheeb approves → `style-library add <id> ui_motion.components …` / `set ui_motion.durations_f.<name>`. Rejections → `log --kind rejected` with the reason.

## Rules
- Add every UI element that carries meaning (counters, stats, prompts, comment/CTA bubbles, ledger rows) to `src/data/elements.json` with its box and time. `zone_check.py` fails anything under the platform UI (Reels: top 220, bottom 450, right rail from y ≈ 1150).
- Third-party UIs in a client's paid ad are rebuilt with example content. Flag them in DELIVERY_NOTES for the client to approve.
