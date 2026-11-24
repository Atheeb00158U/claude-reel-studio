---
name: footage-research
description: Sources every picture and track a video needs from the internet (YouTube B-roll and originals, Creative Commons results, public-domain archives, stock sites, real stills, documents, old pages, logos, music) in the rights mode the video allows (copyright-free for ads, copyrighted OK for organic commentary), downloads the highest quality available, clips what's needed, checks quality and rights, and records source and licence of each. Use when a video needs B-roll, clips, stills, screenshots, logos, music or reference reels, when asked to "find footage", "source B-roll", "get this from YouTube", or where a shot came from.
---

# Footage research

Read the style first: `style.lock.json` → `footage` (`rights`, `rights_default`, preferred sources, rules) and `format`.

## Steps
0. **Rights mode.** `footage.rights` in the lock decides what may be used: `copyright_free` (ads, client work: CC BY, public domain, stock licences, client-owned) or `copyrighted_ok` (organic commentary: any YouTube, film, news, popular music). If it isn't set, the producer asks at intake; when unattended use the style's `rights_default`, else `copyright_free`, and say so. Rules, the CC-remix trap and the quality bar: `references/rights-and-quality.md`.
1. **Shot list.** From the script and beats, one picture per phrase: subject, setting and background that fit what is said. Abstract lines get one concrete, story-specific object; facts get the real document.
2. **Search wide, YouTube always.** Check `_Global library` first (logos, music, SFX, fonts, plates). Then read the live registry `_Global library/references/footage_sources.md` (seed: `references/archives.md`) and search every source allowed in the mode:
   - **YouTube in every video** (CC filter in copyright-free mode, any video otherwise): search, licence/height check, ytmp4.store download at the highest variant, header probe, trim on the Mac → `references/youtube-sourcing.md`.
   - Public-domain and stock archives (Moving Image Archive, Prelinger, NASA, Wikimedia, Pexels, Pixabay…), X, Bing stills, Wayback, FILMGRAB and the in-page tar → Downloads → stage → file workflow → `references/sources-and-download.md`.
   - Run 2–4 literal queries per line; compare candidates from more than one source before picking.
3. **Highest quality.** Take the best variant offered (4K/1440p for 16:9 → 9:16 crops, 1080p minimum full frame), probe real dimensions before the full download, reject upscaled fakes, starved bitrates, burnt-in subs and unhideable bugs.
4. **Check every pick.** Contact sheet (8–10 frames); scan the in-point range at 5–10 fps for cuts, pans, the source's own supers, channel bugs and subjects drifting under captions; full-size look at what it really shows.
5. **Clip.** Cut only the needed range plus 0.5 s handles (on the Mac with ffmpeg before staging), one re-encode at CRF 16.
6. **Record.** `01_source/sources.json` per asset: file, kind, use, line, source, url, id, title, creator, licence, variant, in/out (schema in `scripts/check_assets.py`).
7. **Gate.** `python3 scripts/check_assets.py <video folder> --credits`: fails anything below the quality floor, without a licence the mode allows, missing a CC BY creator, or reusing a source moment. Fix every FAIL before the edit; paste the credits into DELIVERY_NOTES and the post caption.
8. **Grow the registry.** A new source that worked → add a row to `footage_sources.md` (good for, rights, mechanics, date) and `style-library add <id> footage.sources …`.

## Rules
- Named people are shown as themselves, from footage captioned or confirmed as them. Never a lookalike or archive stand-in.
- Never the same source moment twice.
- Someone else's edited reel is reference only.
- "No copyright" in a title is not a licence; only the watch page's CC BY line or a stock licence counts. Re-uploads of other people's footage are rejected even under the CC filter.
- Covers, remixes and "free versions" of popular songs are not cleared: copyright-free mode uses them only with Atheeb's per-video OK (`risk_accepted`), never in a paid ad.
- In `copyrighted_ok` mode, every copyrighted asset that reaches a render is listed in DELIVERY_NOTES.
- Downloads go through the browser (Claude in Chrome, or the built-in browser when Chrome isn't connected; its downloads land as a hidden `.Q6L2SF6YDW…claudefordesktop.*` file of the blob's byte size). The cloud and the Mac shell can't reach YouTube.

## Learn
Rights defaults per client, sources the client prefers or forbids, quality complaints → `style-library set <id> footage.rights_default …`, `add <id> footage.sources|footage.rules … --note`.
