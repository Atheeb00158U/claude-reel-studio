# Rights mode and quality bar

## 1. Rights mode (decided once per video, before any search)

Every video runs in one of two modes, stored in `style.lock.json` → `footage.rights` (and copied to `sound.music.rights`):

| Mode | When | Pictures | Music |
| --- | --- | --- | --- |
| `copyright_free` | paid ads, client deliverables, anything boosted or run on a brand's ad account, anything the client must own | YouTube **Creative Commons** (CC BY) results, public-domain archives, Pexels/Pixabay/Mixkit, the client's own material, footage we shoot or generate | YouTube CC BY originals, YouTube Audio Library, Pixabay (non-AI, no Content ID), Mixkit, purchased licences |
| `copyrighted_ok` | organic commentary reels (Gridd AI ad stories, MMH-style essays) where the story is about the source | anything: any YouTube video via the downloader, films, news, ads, X, Instagram | popular commercial tracks (flag them in the notes) |

**How the mode is chosen:**
- The producer asks at intake with AskUserQuestion: "Assets and music for this video: copyright-free only, or is copyrighted material fine?" Options: *Copyright-free (ad / client)*, *Copyrighted is fine (organic commentary)*, *Copyright-free pictures, popular music*.
- A style may set a default (`footage.rights_default`): Gridd AI ad-story reels default to `copyrighted_ok`; Berribot client explainers and any ad default to `copyright_free`. A default still gets one line of confirmation when Atheeb is present ("Using copyrighted material as usual for Gridd — say if this one is an ad").
- Unattended: use the style default; with no default, use `copyright_free` (the safe one) and say so at the top of the reply.
- A mixed mode (third option) is recorded as `footage.rights = copyright_free`, `sound.music.rights = copyrighted_ok`.

**In `copyright_free` mode:**
- Every asset needs a licence that allows commercial reuse, recorded in `sources.json`.
- CC BY means **credit the creator**: the credit goes in the post caption/description and DELIVERY_NOTES (`check_assets.py --credits` writes the text).
- YouTube's CC filter is self-declared by uploaders and is sometimes wrong. Before using a CC result, reject:
  - re-uploads of TV, films, ads, music videos or other channels' footage (watermarks or bugs from another channel, "full episode", news idents);
  - compilations of other people's clips;
  - anything with recognisable commercial music baked into the audio (we strip audio anyway, but it signals a re-upload).
- **"No copyright" in a title is not a licence.** Only the licence line on the watch page ("Creative Commons Attribution licence (reuse allowed)") or a stock site's licence counts.
- **Remixes, covers and "copyright-free versions" of popular songs are not cleared.** YouTube allows the CC licence only on 100% original content; the song's composition still belongs to its writer/publisher even when the uploader re-recorded it, so a CC tag on a cover or remix is not valid and Content ID can still claim it. In `copyright_free` mode they are allowed only if Atheeb accepts the risk for that video (ask once; record `rights: "cc-remix, composition not cleared"`); never in a paid ad. Original CC BY tracks are the safe pick.

**In `copyrighted_ok` mode:** everything is allowed, but every copyrighted clip, still and track that reaches a render is listed in DELIVERY_NOTES with its source (commentary use). Someone else's edited reel is still reference only.

## 2. Quality bar (both modes)

Measure, don't trust the label. `scripts/check_assets.py <video folder>` runs ffprobe on every clip and still in `01_source/` and fails anything below the floor.

| Use | Minimum source | Notes |
| --- | --- | --- |
| Full-frame hero / B-roll in a 1080×1920 reel | **1080p** (short side ≥ 1080 after the crop), H.264 ≥ 4 Mbps, or 4K | 9:16 crops from 16:9 use only the centre 608 px of a 1080p frame — **prefer 4K/1440p sources for 16:9 → 9:16 crops** |
| Card, print, split-screen or inset ≤ 60% of the frame | 720p | |
| Archive / historic footage that only exists low-res | whatever exists | pre-upscale with lanczos (`scale=1440:-2:flags=lanczos,unsharp=5:5:0.6`), treat as archive (grain, VHS/CRT, card), flag in notes |
| Stills | short side ≥ 1600 px for full frame; ≥ 1000 px for prints | Bing `turl` thumbnails never |
| Music | 44.1/48 kHz, ≥ 192 kbps (mp3) or m4a/wav | no YouTube 128 kbps rips when a better copy exists |

- **Pick the highest variant offered**, then step down only if the download fails or returns 0 bytes. On YouTube, read the available heights before downloading (`references/youtube-sourcing.md`).
- Reject: upscaled fakes (a "4K" file whose detail looks like 480p: check a 100% crop), heavy compression blocking, burnt-in subtitles, watermarks/bugs that a 1.16 push can't hide, frame-rate judder (25↔30 conversions), interlacing combs.
- Clip to the part you need plus 0.5 s handles, re-encode once (`-c:v libx264 -crf 16 -preset slow -an`), and keep the original's id + in/out in `sources.json` so it can be re-fetched at higher quality later.
