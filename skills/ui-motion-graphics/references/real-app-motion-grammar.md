# Real-app motion grammar (approved, Wealthometry Script 3, Nov 2026)

## How we got here
- **Rejected (do not repeat):**
  - MG v2/v3, made of shadcn "product cards" with drop shadows, small dark caption pills on the split seam, Lucide chairs and a white plate with only text;
  - bars dropping into buckets, and white data-viz columns ("looks like a PPT");
  - a highlighter on the client's own website;
  - a typed search that pasted the spoken line;
  - a jigsaw stack over a blurred Google page ("looks like an overlay");
  - zoom-out/zoom-in camera moves between beats;
  - a tick on every caption word.
- **Loved:** the final v7 cut with real apps, camera following the action, the Safe Bucket notification over a falling Sensex, and the bars rising on the wall behind the speaker.
- **References that taught it** (studied at 25–30 fps, copies in `_Global library/references/wealthometry-talking-head-ad/`):

| Reference | What it shows |
| --- | --- |
| SpeakON reel, 17–26 s | A glass box over live footage. The text types and the camera rides the caret; filler words turn red and dissolve; a spinner becomes a ✓. Notion at 38 s, Gmail with "Ready for approval" at 40–42 s. |
| "Comment AUDIT" reel | Phone mock-ups on white with scrolling content; reels orbiting with view counters (5 s); the Claude UI rebuilt; the connector flow (14 s); highlighter cascades on a zoomed chat table (29–32 s); data → psychology tiles (35 s); a blurred phone with three labelled rows (43 s). |
| R2 "content machine" | A typed prompt → output, then a phone where the feed blurs and labelled rows appear (10–14 s). |
| Cold brew, Wakefit, Mahindra, Seeit | Real artefacts on light plates, a tilted headline that swings in over 3 f, a highlighter, counters, shape glitches, a small sans line plus one big serif-italic word. |

## 1. Pick the artefact (for each line)
Ask: what would this person actually see on their phone or laptop at this moment? Examples from Script 3:

| Line (Hinglish) | Real artefact | Action → landing word |
| --- | --- | --- |
| office wale mujhe pagal bol rahe hain | WhatsApp group "Office 🏢" | Hold on the header ("Rohit is typing…"), pan down; bubbles land on "mujhe", "pagal", "bol"; 😂 reaction on "hain" |
| …door ki baat… jab tak zarurat saamne nahi aa jaati | iOS Calendar year view | Open on today (Nov 2026), scroll 20 years on "door", ring + "Retirement · 60 saal" chip on 2046; Messages notification from Papa on "zarurat"; snap back on "saamne" |
| ek simple sa sawaal saamne aata hai | Own white screen: jigsaw stack | Each word rises in with blur (24 px / 6 f; the big word 40 px / 8 f); then cut to the app |
| kya aapka retirement plan tayaar hai? | Google search | Type "how to plan retirement at 40", word-synced; the camera rides the caret; realistic autocomplete |
| late thirties tak kaafi save kar chuke | Google Sheets "Savings tracker" | Rows fill as the active cell walks down; ₹43,20,000 total counts up; highlighter on "save"; the embedded chart draws |
| kisi ne baithkar kabhi planning ki hi nahi | Google Calendar event "Retirement planning" | Date struck through and rescheduled 2019 → 2025; "1 guest · Prashant (organiser)" |
| Yahi toh Wealthometry karti hai | **Speaker A-roll** + graphic behind him | Bars rise on the wall, ₹3.2 Cr counter above his head, growth line (see `video-effects`) |
| kitna save, current expenses, kab kaam band | Google Forms intake | Each answer types on its word; Submit with a mouse click |
| written plan: number, date, har mahine | PDF in Chrome's viewer | Highlight each number on its word; the monthly figure counts up |
| monthly income safe bucket se | iOS Messages bank SMS | "₹1,45,000 credited … Safe Bucket" month after month |
| market girne par bhi kuch bechna na pade | Google "sensex today" card on a phone | Red line falls; the credit notification still drops in on "bechna" |
| har April review… on track | Google Calendar event "Annual plan review" | Repeats every April; advisor accepted; "On track ✓" chip on "on track" (callback to the rescheduled card) |
| Papa ne pehli baar paise maange (hook) | Google Pay thread with Papa | ₹10,000 request "dawai ke liye, beta 🙏" lands on "pehli baar"; amount highlighted on "paise" |
| Dono bhai lad rahe hain (hook) | WhatsApp "Family ❤️" | Brothers argue bubble by bubble; later Maa replies |

## 2. Camera (Vox style)
- One zoom per beat: about **1.25–1.5** for phone UIs, about **1.3** for a phone at full screen width in a split top, **1.4–1.5** for desktop UIs.
- Start pre-zoomed on what the first word is about (the header, today's date, the logo + search box).
- Follow the action by panning: caret x − 100 (clamped so the left edge of the text stays in view), the newest bubble, the active row, the newest date line.
- Moves: bezier (0.65, 0, 0.35, 1), 8–14 f, landing about 4 f before the word.
- Sanitize keys so frames strictly increase (raea's `interpolate` throws on equal frames).

## 3. Timing and motion values
| Element | Entry |
| --- | --- |
| Chat bubble | Older bubbles shift up over 4 f; the new one fades in 3 f and scales from 0.82 with an overshoot of (0.34, 1.5, 0.64, 1) over 6 f, starting 3 f after the shift |
| iOS notification | Drops from −230 px over 9 f, ease (0.2, 1.2, 0.4, 1); held ≥ 1.5 s and readable (body text ≥ 38 px on screen) |
| Typing | 1–1.6 chars/f from each word's time; caret 2–3 px; per-character spans (raea needs a fixed layout) |
| Highlighter | rgba(255,214,0,.7), 8–12 f, in-out cubic, drawn behind the text |
| Counter | 10–14 f ease-out quad, Indian commas |
| Chart in app | Clip-reveal left to right over 20–26 f |
| Strike-through | Red #D93025, 4 px, 6 f |
| Status chip | Pops with overshoot over 7 f |

## 4. Accuracy checklist
- iOS: Inter as the SF stand-in, status bar 10:42, Dynamic Island, real WhatsApp colours (#EFEAE2 wallpaper, #D9FDD3 outgoing bubble, #F6F6F6 header, #007AFF icons).
- Google: Liberation Sans (Arial) for Search, Roboto for Sheets, Forms and Calendar, and the official logos from Google's CDN, fetched in the browser.
- Emoji: Noto Color Emoji rendered to PNG (raea can't draw colour-emoji fonts).
- Draw overlays (notifications) **after** the status bar, or they hide under it.
- Bubble widths must fit their text plus the timestamp.

## 5. Sound for these elements (with `sound-design`)
| Element | Sound | Level |
| --- | --- | --- |
| Bubbles | Pop 1/3/5, varied | −19 to −21 dB |
| Notification | earshot `notification.wav` | −14 dB |
| Typing | short `Typing_n.wav` bursts (0.3 s) on 2–3 words | — |
| Highlights and strike-throughs | earshot `highlight_click.wav` | — |
| Big scroll | `Zoom/zoom_n.wav` | — |
| Data building | `DATA 05/08` | under −20 dB |
| Corpus lands | `Money-1` | — |
| Positive status | `TING` | — |
| Real button presses | Atheeb's mouse click (Universfield) | — |
| End card | `Corporate Rise and Hit 01`, its hit (1.44 s) on the CTA pill | — |

- Never a tick on every caption word.
- Overall about 28 events/min, plus small key runs.
