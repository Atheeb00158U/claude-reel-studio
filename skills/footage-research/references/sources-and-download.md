# Sourcing pictures: source mechanics

Full source list with rights per mode: `archives.md`. YouTube: `youtube-sourcing.md`. Rights mode and quality bar: `rights-and-quality.md`.

Every phrase needs a picture whose subject, setting and background all fit what is being said — never just a shot that happens to contain the named person or object. Search more than one source; the better version of a shot is often elsewhere.

**Named people and characters are shown as themselves** — the real Tony Soprano (Gandolfini), the real Thiel, Levchin cropped from the actual photo holding the cards. An archive stand-in for a named person (an old man holding cards for "Tony Soprano") is the failure the user rejected. Archive footage is for generic actions, objects and places only.

| Source | What it is | Use it for | Rights |
| --- | --- | --- | --- |
| YouTube (ytmp4.store) | 4K B-roll of anything; the original ad, film or interview; songs | B-roll for most lines; the clip a story is about | CC filter → CC BY (credit); otherwise copyrighted, commentary use only (`copyrighted_ok` mode). See `youtube-sourcing.md` and `rights-and-quality.md` |
| Moving Image Archive (movingimagearchive.com) | public-domain archive film and video clips, searchable | primary footage for every line | public domain, safe to publish |
| FILMGRAB (film-grab.com) | film-still galleries per film, browsable by director, cinematographer, genre, aspect ratio, year | the exact film a line references; framing and grade references | copyrighted, shared as "fair dealing for educational and research purposes"; publish only as a small credited commentary insert (print or card), flagged to the user |
| Frame Set (frameset.app) | stills from films, commercials and music videos; natural-language and image search, colour, light and composition filters; free tier ≈10 searches | finding a precise shot idea or look, matching lighting and colour | "intended for inspiration and pitch decks"; reference by default |
| Eyecandy (eyecannndy.com) | technique library: GIF examples of datamosh, split screen, match cut, whip pan, slit scan, scale shift, freeze frame, typography, x-ray and ~100 more | choosing and agreeing how a transition or effect should look, then rebuilding it in raea | reference only, never footage |
| Fashion Gone Rogue (fashiongonerogue.com) | fashion editorials, magazine covers, campaigns and celebrity shoots, with photographer credits | fashion, lifestyle and celebrity beats; styling and lighting references | copyrighted; reference by default, a credited commentary insert only when the user agrees |

List every copyrighted still or clip that reaches a render, with its source, in the delivery notes.

Real clips, stills, pages and headlines (via Chrome):
- **YouTube:** on ytmp4.store:
  - set `#yt-url`, then call `form.requestSubmit()`. Override `window.open` first; clicking the page triggers ad redirects.
  - Wait for the `api/download/<id>/<v360|v720|v1080|mp3>` links and fetch them.
  - **Run lookup + fetch one video at a time.** Parallel fetches all timed out at 480 s.
  - A fetch takes 10–280 s. Links expire (HTTP 410), so look the video up again just before fetching it.
  - Video downloads stream without a content-length, so `blob()` fails with "Failed to fetch": read `r.body.getReader()` chunk by chunk instead.
  - Variants now go up to v2160/v1440 (tested Nov 21 2026: v2160 and v1080 both returned real 3840×2160 / 1920×1080 files). Take the highest the shot needs, probe its real size first, step down only if a fetch fails or returns 0 bytes. Full workflow: `youtube-sourcing.md`. Check every file's duration and size with ffprobe.
- **X / Twitter videos:** open `cdn.syndication.twimg.com/tweet-result?id=<tweet id>&token=x` in a tab. Read `mediaDetails[].video_info.variants` (mp4s, often 640x360 at most) and `quoted_tweet` for the quoted post. Fetch the mp4 from a video.twimg.com tab.
- **Tweet and profile cards:** while logged in, clone the `article` into a fixed black overlay with zoom, move the mouse away, and screenshot at scale 1. Crop out the user's own UI (verification banners, extension buttons).
- **Instagram reels (references only):**
  - **Single post:** open it in a logged-in tab, play the video, and read the `.mp4` resource URLs from `performance.getEntriesByType('resource')`. Delete the `bytestart`/`byteend` params and fetch each full file. The one at 1080x1920 is the video; the one with no width is the audio.
  - **Many reels:** collect `/reel/<code>` links by scrolling, then convert each shortcode to a media id (base64url alphabet `A–Z a–z 0–9 - _` → BigInt). Call `/api/v1/media/<id>/info/` with header `x-ig-app-id: 936619743392459`, 1.2 s apart. `items[0].video_versions` holds the mp4 URLs.
- **Before using any clip, check its in-point range on a contact sheet at 5–10 fps.** Look for:
  - cuts and whip-pans inside the range: talk recordings pan between framings;
  - the source's own supers and lower thirds: the Bolero ad's "Advanced ride & handling", BBC's Marathi captions;
  - channel bugs: the BBC box at top-left and its bottom strap, btTV and the date at the top, Historicano at the bottom-right;
  - the subject drifting into where a caption will sit.
  
  Hide bugs with a push of ≥1.16 about the centre. Bugs at the top can also go with a push about an origin near 72% height. Where neither works, use a different moment or a cut-out.
- **Never use the same source moment twice.** Keep a list of every clip and in-point. A second appearance of the same person needs a different moment (pose, angle, framing), not just a new background.
- **Identity:** use only footage that is captioned or confirmed as the named person. In a vlog, the person on camera may be the vlogger, not the subject.
- **Image search as a locator:** on bing.com run `fetch('/images/search?q=…&qft=+filterui:imagesize-large')` and parse each `a.iusc` element's `m` attribute (JSON: `murl` full image, `turl` thumbnail, `t` page title). Render all candidates as a numbered grid over the page, screenshot it, pick by number. Fetch `murl` (works when the host allows CORS, e.g. colliderimages); otherwise open the image URL in a tab of its own and fetch it same-origin there (e.g. the Fortune photo from a fortune.com tab). The `turl` fallback (`&w=1600&h=1600&c=7`) is smart-cropped square and low-res — never for hero shots.
- **Old pages and headlines:** the Wayback Machine (`web.archive.org/web/<year>/<url>`; follow redirects, remove `#wm-ipp-base`), zoom the page with `document.body.style.zoom='2.4'` and screenshot with `save_to_disk` (it lands in the container under `/tmp/claude-chrome-screenshots-*`). Web Design Museum has captures of early homepages.
- **FILMGRAB:** galleries load by ajax. Navigate to the film page, wait ~4 s, read the full-size `wp-content/uploads/photo-gallery/<name>.jpg` URLs from the DOM (not `/thumb/`), keep lists in sessionStorage across navigations, fetch them same-origin into a tar. Stills are ~1000 px wide: fine under VHS/CRT treatments, not as clean full-frame heroes.
- **Logos:** turn a logo on black into a transparent PNG (alpha from luminance, cropped to its bbox) and add the RGB fringe with `drop-shadow` filters; a JPG with `mix-blend-mode: screen` leaves a visible box.
- **Finding a line inside a jingle-heavy old ad:** ASR mostly fails on sung or music-covered lines. Transcribe short windows (2–4 s, language `hi` for Hindi ads), use the contact sheet (who is on screen and speaking), and give the user the exact seconds to confirm by ear.
- Keep the source page title and host of every pick (a `meta.json` in the tar) for the delivery notes.

Moving Image Archive mechanics (via Chrome on movingimagearchive.com):
- Search: `fetch('/api/search', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({query:'…'})})` returns `clips[]` with `id`, `videoUrl`, `thumbnailUrl`, `sourceTitle`, `sourceYear`, `durationSeconds`. Each query takes several seconds, so run the whole query list as a background promise and poll it; one tool call times out at ~45 s.
- Write literal queries per line: the object, the action, the setting, the period ("man holding playing cards close to his chest", "bank vault door", "switching off power lever"). Named people rarely hit, but check anyway (NASA's *America's New Paths in Space* has Elon Musk).
- Thumbnails are CORS-blocked and lazy-load slowly, so don't judge from the page grid. Download the top 3–4 clips per query in in-page tars (fetch each `videoUrl`, build a ustar tar in JS, inject an `<a download>` button and click it with the computer tool; Chrome blocks repeated programmatic downloads). Keep each tar ≤ ~150 MB or the tab crashes. Stage from ~/Downloads into the container and make local contact sheets (6–10 timestamped frames per clip).
- Check every pick at full size for what it really shows (heaped "ice cream" cups turned out to be popcorn; a "whiskey" clip was a vacuum tube) and for stray branding that contradicts the line (a Budweiser label on "Maker's Mark").
- Many archive sources are 320×240. Pre-upscale them once with `scale=1440:-2:flags=lanczos,unsharp=5:5:0.6:5:5:0.0` (≈10 min for 50 clips on 2 CPUs; run it in the background), and prefer higher-resolution clips for full-frame hero shots.
- Keep period artefacts, grain and bugs. Grade lightly (contrast 1.1, saturation 0.9; B/W stays B/W), radial vignette, dim 0.1–0.3 only where captions need it (more over busy crowds). Push 1.00 → 1.04 over the shot, and use the crop origin to frame out what doesn't belong; no other camera tricks.
