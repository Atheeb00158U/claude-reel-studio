# SFX tools: Openverse, earshot, real-sound

Three tools Atheeb pointed to (Nov 21 2026), tested here the same day.

## Order of preference for every cue

1. `_Global library/sfx/` (normalized originals, plus the earshot starter pack in `sfx/earshot/`).
2. **Real recordings** with a licence the video's rights mode allows: Mixkit, Pixabay (non-AI, no Content ID), **Openverse** (CC0 / CC BY, mostly Freesound).
3. **earshot make / sfx** when nothing recorded fits. Its realistic designs are learned from public-domain recordings and its output is ours to use (MIT). Prefer "learned" things (footsteps, paper, camera, keyboard, whoosh, pop, impact); invented designs of real things (magic, game hits) sound less real.
4. `earshot build` for a sound made of recorded parts named in words (needs the listening models to tune it).

Anything new and reusable goes into `_Global library/sfx/` with a README line (source, licence, peak time).

## Openverse (api.openverse.org): CC audio search

- Reachable **only from the browser** (the cloud and the Mac shell are blocked). Run fetches from a tab on `https://api.openverse.org`.
- Search: `/v1/audio/?q=<words>&license=cc0,by&page_size=20&format=json` (anonymous: up to 20 per page). `license=cc0,by` keeps commercial-safe, editable licences. `license_type=` returned an HTML error page and `category=sound_effect` returned 0 results, so don't use either.
- Result fields used: `title`, `creator`, `license` (+ `license_version`), `source` (mostly `freesound`), `duration` (**milliseconds**), `tags[].name`, `url` (the audio file), `foreign_landing_url` (credit link), `filetype`, `bit_rate`.
- `url` points at Freesound's CDN previews (`cdn.freesound.org/previews/…-hq.mp3`, 128 kbps). They are CORS-open from the Openverse tab: fetch as blobs, pack an in-page tar with a `meta.json` (title, creator, licence, landing URL), download, stage, file. 128 kbps previews are fine for short SFX; they are below the bar for music beds (≥ 192 kbps), so music comes from elsewhere.
- CC BY → credit "Title by Creator (Freesound), CC BY 4.0, <landing url>" in DELIVERY_NOTES and the post caption (record it in `sources.json` so `check_assets.py --credits` prints it).
- Pick candidates by ear: `earshot rank` against the cue description, when the listening models are available. Otherwise `earshot measure` each candidate (length, attack, peak time, brightness) and choose by numbers, and say so.

## earshot (github.com/Leonxlnx/earshot, MIT)

Install in the cloud once per session (≈ 1 min): `pip install --break-system-packages "earshot[measure,images] @ git+https://github.com/Leonxlnx/earshot"`. The PyPI name `earshot` belongs to another project; always install from GitHub. The Claude Code skills `earshot:earshot` and `earshot:real-sound` are already installed for Atheeb.

| Command | Models? | Use |
| --- | --- | --- |
| `earshot make "words" -o x.wav` | no | one SFX from the 922-design catalogue (a new take each time); read `clean` and the peak time |
| `earshot sfx list / render` | no | the 252-sound film bank (clicks, whooshes, hits…) with knobs |
| `earshot kit init/render/check/audition` | no | a consistent kit for a whole film |
| `earshot measure x.wav` | no | LUFS, true peak, LRA, attack/decay, brightness, bands, tempo/key |
| `describe`, `match`, `rank`, `find`, `ab`, `realness`, `timeline`, `critique` | **yes** (CLAP + AudioSet tagger, ≈ 1.1 GB from Hugging Face) | hear for us: pick between candidates, find the best moment, check a mix second by second |

The listening models download from huggingface.co. **Decision (Nov 21 2026): Atheeb allows huggingface.co for the cloud** (claude.ai Settings → Capabilities). Session setup once that is live (≈ 5 min):
```sh
pip install --break-system-packages torch --index-url https://download.pytorch.org/whl/cpu   # or plain `pip install torch` from PyPI
pip install --break-system-packages "earshot[listen,measure,images] @ git+https://github.com/Leonxlnx/earshot"
earshot doctor --fetch      # CLAP laion/larger_clap_general + MIT/ast-finetuned-audioset, pinned, ~1.1 GB
```
If the fetch still fails, the model files come from Hugging Face's file hosts (`cdn-lfs.huggingface.co`, `*.hf.co` / `cas-bridge.xethub.hf.co`); those need allowing too. Test first with `curl -s -o /dev/null -w "%{http_code}" https://huggingface.co/api/models/laion/larger_clap_general` (200 = allowed). Until listening works, every mix note says "measured, not listened to".

Peak times matter when placing a sound: `earshot make` prints `peak at …`. Whooshes are placed so the peak lands on the cut, risers so the peak lands on the switch or impact, and clicks and ticks at their transient (≈ 0 s).

Starter pack made with earshot (`_Global library/sfx/earshot/`, Nov 21 2026), mapped to the MMH palette:

| File | Design | Peak | MMH use |
| --- | --- | --- | --- |
| caption_tick | tick/soft | 0.00 s | tick on each caption word (−14 dB) |
| bigword_click | keyboard/mechanical | 0.02 s | click on big words (−9 dB) |
| shutter | camera/shutter | 0.07 s | photo lands |
| paper_slide | paper/card | 0.11 s | print slides in |
| highlight_click | pen/ballpoint | 0.06 s | highlighter / soft click |
| whoosh_fast / whoosh_soft | whoosh/fast, whoosh/soft | 0.04 / 0.24 s | whips, slides |
| marker_draw | marker/whiteboard | 0.70 s | red marker circles |
| glitch_short | glitch/short | 0.05 s | every glitch burst (alt to the electric glitch) |
| logo_click | pop/soft | 0.01 s | end-card blocks |
| riser_air / riser_reverse | rise/air, rise/reverse | 2.45 / 1.34 s | before a stop-drop |
| impact_deep / hit_braam | boom/deep, braam/brass | 0.13 / 0.65 s | the one impact, the payoff |
| tape_stop | stop/tape | 0.08 s | a stop into silence |
| notification / typing | notify/pair, keyboard/mechanical | 0.02 / — | UI beats |

## real-sound (the `earshot:real-sound` skill)

The premium-film method: a cue list from the picture's frames, only real licensed recordings, one music track with its drop on the hero reveal, a JSON sound design rendered by a deterministic mixer, measured QA (clicks, masking, harshness, sync, loudness), a five-lens critique, master, credits, mux. Use it for launch films, product videos and logo stings, where every sound must be caused by something on screen. For reels, keep our MMH palette and the style's events per minute; borrow its measured QA and critique pass.
