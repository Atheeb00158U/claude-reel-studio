# YouTube: the main B-roll source

YouTube is a must-search source for every video: it has the highest-quality B-roll (4K drone, timelapse, product, city, nature, archive restorations), the original ads/films/interviews a story is about, and music. The cloud workspace and the Mac's shell can't reach YouTube, so everything runs in the browser (Claude in Chrome, or the built-in browser), and files land in Downloads (then stage → file into the video folder, project instructions §0).

Tested end to end on Nov 21 2026 (search parse, watch-page licence/heights, ytmp4.store variants up to 2160, header probe for real dimensions).

## 1. Search

**Copyright-free mode → Creative Commons filter.** Add `sp=EgIwAQ%253D%253D` to the results URL (same as Filters → Features → Creative Commons):

```
https://www.youtube.com/results?search_query=<words>&sp=EgIwAQ%253D%253D
```

**Copyrighted-OK mode →** the same URL without `sp`.

Write literal queries per line (object, action, setting, period) and add quality words: `4k`, `drone`, `stock footage`, `b roll`, `timelapse`, `slow motion`, `cinematic`. Run 2–4 queries per line; the better shot is often on page 2 or under another wording.

Read results from the page instead of screenshots (wait ~3 s after load):

```js
const out=[]; const walk=o=>{ if(!o||typeof o!=='object')return;
  if(o.videoRenderer){const v=o.videoRenderer; out.push({id:v.videoId, t:v.title?.runs?.[0]?.text,
    len:v.lengthText?.simpleText, ch:v.ownerText?.runs?.[0]?.text,
    badges:(v.badges||[]).map(b=>b.metadataBadgeRenderer?.label)});}   // "4K" badge
  for(const k in o) walk(o[k]); };
walk(window.ytInitialData); out
```

Some results come as `lockupViewModel` (only `contentId`); run them through the watch-page check below.

## 2. Check before downloading (watch page, same origin)

```js
async function info(id){ const h=await (await fetch('/watch?v='+id)).text();
  const pr=JSON.parse(h.split('ytInitialPlayerResponse = ')[1].split(';</script>')[0].replace(/;var meta.*$/s,''));
  const f=pr.streamingData?.adaptiveFormats||[];
  return {id, title:pr.videoDetails?.title, ch:pr.videoDetails?.author, secs:+pr.videoDetails?.lengthSeconds,
    heights:[...new Set(f.map(x=>x.height).filter(Boolean))].sort((a,b)=>b-a),
    fps:[...new Set(f.map(x=>x.fps).filter(Boolean))],
    ccby:/Creative Commons Attribution licen[cs]e \(reuse allowed\)/.test(h),
    desc:(pr.videoDetails?.shortDescription||'').slice(0,300)}; }
```

- `ccby` must be true in copyright-free mode. Match that exact phrase: a loose "Creative Commons" match also hits tags/keywords (tested: a keyword list matched).
- `heights[0]` is the best available. The CC filter happily returns 720p uploads; skip them for full-frame shots.
- Read `desc` and the channel: re-uploads, compilations, "credit to…" lines and other channels' bugs are not the uploader's to license.
- Then make a contact sheet from the downloaded file (SKILL.md step 4); the thumbnail is not the shot.

## 3. Download (ytmp4.store)

1. Open `https://ytmp4.store/` and override `window.open=()=>null` first (clicks redirect to ads; never click the page).
2. Set `#yt-url` to the watch URL, dispatch `input`, call `form.requestSubmit()`. The page navigates to `/download/?q=…`; re-override `window.open` there.
3. Poll for `a[href*="api/download"]`: variants `v2160 v1440 v1080 v720 v480 v360 v240 v144 mp3 m4a` (only those that exist).
4. **Take the highest variant** the shot needs (rights-and-quality.md): v2160/v1440 for 16:9 → 9:16 crops, v1080 at least for full-frame. Step down only if a fetch fails or returns 0 bytes.
5. **Probe before the full download.** The files are progressive MP4 with `moov` first, so the first 200 KB hold the real dimensions. Read them and stop:

```js
async function dims(url){ const ac=new AbortController(); const r=await fetch(url,{signal:ac.signal});
  const rd=r.body.getReader(); let parts=[],n=0; while(n<200000){const {done,value}=await rd.read(); if(done)break; parts.push(value); n+=value.length;}
  ac.abort(); const b=new Uint8Array(n); let o=0; for(const p of parts){b.set(p,o);o+=p.length;} const dv=new DataView(b.buffer), res=[];
  for(let i=0;i<n-4;i++) if(b[i]==0x74&&b[i+1]==0x6b&&b[i+2]==0x68&&b[i+3]==0x64){const base=i+(b[i+4]?92:80); res.push([dv.getUint32(base)/65536, dv.getUint32(base+4)/65536]);}
  return res; }   // e.g. [[3840,2160],[0,0]] = 4K video track + audio track
```

   A "4K" variant that probes at a lower size is rejected.
6. Full fetch, **one video at a time** (parallel fetches time out). The stream has no content-length, so read `r.body.getReader()` chunk by chunk into an array and build a `Blob` from the chunks (not one big ArrayBuffer). Links expire (HTTP 410): look the video up again right before fetching.
7. Save: `URL.createObjectURL(blob)` on an injected `<a download="<id>_<height>.mp4">`, clicked with the computer tool (programmatic repeat downloads get blocked). Over ~500 MB (long 4K videos), save as `blob.slice()` parts of ~200 MB (`<id>.part01`…) and `cat` them back together on the Mac.
8. **Trim on the Mac before staging** (the Mac's shell has ffmpeg): cut only the needed range plus 0.5 s handles, then stage that small file:
   `ffmpeg -ss <in-0.5> -to <out+0.5> -i <id>.mp4 -c:v libx264 -crf 16 -preset slow -an 01_source/clips/<name>.mp4`
   Record id, variant, in/out and licence in `sources.json`; delete the full download from Downloads once trimmed (with permission).

Short clips (< 2 min) can go straight into an in-page tar with others (≤ 150 MB per tar) as before.

## 4. Music from YouTube

- **Copyrighted-OK:** search the song (or "<song> instrumental"), download `m4a` (better than the 128 kbps-ish `mp3`), file into `_Global library/music/songs (popular, instrumental)/` with a README line.
- **Copyright-free:** in order of safety:
  1. YouTube CC BY originals (CC filter + `ccby` check; search "<mood> background music", "<genre> instrumental"; the uploader must be the composer/artist);
  2. YouTube Audio Library (studio.youtube.com → Audio Library, logged in; note each track's attribution requirement);
  3. Pixabay (non-AI, no Content ID) and Mixkit (sound-design references).
  
  CC "remixes", covers or "no copyright versions" of popular songs: see rights-and-quality.md. They are not cleared; use only with Atheeb's per-video OK, never in a paid ad.
- Credit every CC BY track (artist, title, link, "CC BY") in the post caption and DELIVERY_NOTES.
