# Source registry (seed)

The live registry is `Claude video work/_Global library/references/footage_sources.md` on the Mac. Read it before searching; **when a new source proves useful, add a row there** (what it's good for, rights, mechanics, date tested) and add it to the style with `style-library add <id> footage.sources "<name>" --note`. This file is the seed copy shipped with the plugin.

Modes: **CF** = allowed in copyright-free mode; **C** = copyrighted-OK mode only; **R** = reference only, never in a render.

| Source | Good for | Rights | Mode | Mechanics / status |
| --- | --- | --- | --- | --- |
| **YouTube (CC filter)** | 4K B-roll of anything: drone, city, nature, product, timelapse | CC BY: credit the creator; verify the licence line, reject re-uploads | CF | `youtube-sourcing.md` (tested Nov 21 2026) |
| **YouTube (any)** | the original ad/film/interview/news a story is about; songs | copyrighted; commentary use, listed in notes | C | `youtube-sourcing.md` |
| Moving Image Archive (movingimagearchive.com) | public-domain archive film per line | public domain | CF | `/api/search` (sources-and-download.md) |
| Internet Archive, Prelinger Archives (archive.org/details/prelinger) | mid-century ads, industrial and educational films | mostly public domain; check each item's licence field | CF | item page → "Download options" (MPEG4 / h.264); not yet tested |
| NASA Image and Video Library (images.nasa.gov) | space, launches, Earth, aerial science | NASA media generally not copyrighted; no NASA logo/endorsement implied | CF | site search + API `images-api.nasa.gov/search?q=…&media_type=video`; not yet tested |
| Wikimedia Commons | stills and clips of people, places, historic objects | per file (PD, CC BY, CC BY-SA): read the file page | CF (per file) | file page "Original file"; not yet tested |
| Library of Congress (loc.gov, "Free to use and reuse" sets) | American history photos, posters, film | per item rights statement | CF (per item) | not yet tested |
| Pexels videos (pexels.com/videos) | modern 4K lifestyle/business B-roll | Pexels licence: free commercial use, no credit required; no trademark/identifiable-person endorsement | CF | not yet tested |
| Pixabay videos | generic actions and places | Pixabay Content Licence | CF | `/videos/search/<q>/` → `__BOOTSTRAP_URL__` JSON |
| Vimeo (CC filter) | indie and creator B-roll | per video CC licence (check NC/ND) | CF if not NC/ND | not yet tested |
| Openverse (api.openverse.org) | CC audio (mostly Freesound SFX) and images across many hosts | per item: filter `license=cc0,by` | CF (per item) | audio tested Nov 21 2026, browser only: `sound-design/references/sfx-tools.md` |
| X / Twitter | the post itself, its video | commentary | C | syndication API (sources-and-download.md) |
| Bing images | real stills of people, print ads, logos | per image | C (CF only if the source licence allows) | sources-and-download.md |
| Wayback Machine / Web Design Museum | real old pages and headlines | commentary | C | sources-and-download.md |
| FILMGRAB | the exact film a line references | copyrighted; credited commentary insert only | C | sources-and-download.md |
| Fashion Gone Rogue | fashion/celebrity beats | copyrighted; credited insert only with Atheeb's OK | C | |
| British Pathé / Reuters / AP archive channels | historic news footage | copyrighted (licensable) | C | via YouTube downloader |
| Frame Set (frameset.app) | shot ideas and looks | inspiration | R | |
| Eyecandy (eyecannndy.com) | how a transition/effect looks | technique reference | R | |
| Instagram reels | style references | reference | R | sources-and-download.md |

"Not yet tested" rows: on first use, note what worked (search URL, download path, whether the cloud can reach it or it needs the browser) in the live registry.
