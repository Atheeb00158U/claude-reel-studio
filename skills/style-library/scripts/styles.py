#!/usr/bin/env python3
"""Style library for Reel Studio.

Styles live in one folder (default: the folder this script sits in, i.e.
"Claude video work/_Global library/styles/"). Each style is a folder:

    <style-id>/style.json     machine-readable rules every department reads
    <style-id>/STYLE.md       the same rules in prose, with the reasons
    <style-id>/CHANGELOG.md   dated history of every change and why

The library keeps INDEX.md (generated table of styles) and LOG.md (the
learning log: every rule added, approved or rejected, newest last).

Commands
  list                                   table of styles
  show ID [--section S]                  print style.json (or one section)
  new ID --name N --client C [--from ID] create a style (copy of another, or the template)
  set ID PATH VALUE --note TEXT          set a field (dot path, VALUE is JSON or text) and log it
  add ID PATH VALUE --note TEXT          append VALUE to a list field and log it
  log ID --dept D --kind K --note TEXT   log a lesson without changing fields (K: approved|rejected|learned|used)
  lock ID DEST_DIR                       copy style.json into a video folder as style.lock.json
  index                                  rebuild INDEX.md
  validate [ID]                          check required fields
Every change bumps the version (minor for set/add of rules, patch for logs
with --bump patch) and appends to CHANGELOG.md and LOG.md.
"""
import argparse, datetime, json, os, shutil, sys

ROOT = os.environ.get("STYLES_ROOT", os.path.dirname(os.path.abspath(__file__)))
REQUIRED = ["id", "name", "version", "status", "client", "use_for", "format", "edit", "captions", "typography",
            "ui_motion", "video_effects", "vfx_glitch", "color", "sound", "end_card", "approved", "rejected"]
DEPTS = ["producer", "script_voice", "footage", "edit", "captions", "typography", "ui_motion", "video_effects",
         "vfx_glitch", "color", "sound", "end_card", "qa", "format"]

TEMPLATE = {
    "id": "", "name": "", "version": "0.1.0", "status": "draft", "client": "", "brand": "",
    "use_for": "", "not_for": "", "references": [],
    "format": {"aspect": "9:16", "width": 1080, "height": 1920, "fps": 30, "length_s": [30, 60], "platform": "reels",
               "structure": ["hook", "body", "cta"]},
    "script_voice": {"voice": "", "speed": 1.0, "tone": "", "hook_rule": "", "cta": ""},
    "footage": {"rights": None, "rights_default": "", "sources": [], "min_height": 1080, "rules": []},
    "edit": {"cut_rule": "", "median_shot_s": None, "max_shot_s": None,
             "transitions": {"default": "hard cut", "vocabulary": []}, "rules": []},
    "captions": {"mode": "phrase", "words_per_chunk": [1, 4], "max_chars_per_line": 32, "fonts": {},
                 "sizes_px": {}, "case": "", "tracking": "", "ink": "", "accent": "", "emphasis_per_phrase": 1,
                 "treatment": "", "reveal": "", "position": "",
                 "stack": {"allowed": True, "shapes": [], "small_cap": 0.36, "g_start": 0.30, "min_clear": 0.16, "per_min": None},
                 "rules": []},
    "typography": {"display_face": "", "accent_face": "", "scale": "", "accent_colour": "", "animations": [],
                   "placement": "", "rules": []},
    "ui_motion": {"easing": "bezier(0.65, 0, 0.35, 1) camera; ease-out cubic entries", "durations_f": {"bubble_pop": 6, "notification_drop": 9, "highlighter": 10, "counter": 12, "chart_draw": 22, "camera_move": 10},
                  "palette": {}, "components": ["real-app-kit (ui-motion-graphics/assets/real-app-kit.tsx)"],
                  "rules": ["Real app screens rebuilt 1:1 with example content; never invented dashboards, product cards or text-only plates",
                            "Each graphic opens pre-zoomed and the camera only pans to follow the action (one zoom per beat)",
                            "Few words on screen; no drop shadows on invented elements",
                            "Brand/claim lines stay on the speaker with the animation behind him; no PPT-style chart plates",
                            "Typed searches are phrased how people really search",
                            "Stacks get their own clean screen, never over a blurred app"]},
    "video_effects": {"vocabulary": [], "budget": "", "rules": []},
    "vfx_glitch": {"default": "ShapeGlitch", "types": [], "budget": "", "rules": []},
    "color": {"look": "", "lut": None, "reference_frames": [], "grain": None, "vignette": None, "rules": []},
    "sound": {"music": {"rule": "", "rights": None, "tracks": [], "level_vs_vo_db": None, "duck_db": None,
                        "arc": {"mode": "arc", "template": "", "max_switches_per_min": 4, "min_section_s": 5,
                                "transitions": ["stop_drop", "echo_out", "filter_blend", "hard_cut"], "moods": []}},
              "sfx": {"events_per_min": None, "palette": []},
              "master": {"lufs": -14, "true_peak_db": -1.5}, "rules": []},
    "end_card": {"rule": ""},
    "kit": [], "examples": [], "approved": [], "rejected": [],
}


def now():
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M")


def path(sid, f="style.json"):
    return os.path.join(ROOT, sid, f)


def load(sid):
    p = path(sid)
    if not os.path.exists(p):
        sys.exit(f"no style '{sid}' in {ROOT}")
    return json.load(open(p))


def save(st):
    json.dump(st, open(path(st["id"]), "w"), indent=2, ensure_ascii=False)


def bump(v, part):
    a, b, c = (int(x) for x in v.split("."))
    return f"{a}.{b + 1}.0" if part == "minor" else f"{a}.{b}.{c + 1}" if part == "patch" else f"{a + 1}.0.0"


def record(sid, version, dept, kind, note):
    with open(path(sid, "CHANGELOG.md"), "a") as f:
        f.write(f"- {now()} v{version} [{dept}/{kind}] {note}\n")
    with open(os.path.join(ROOT, "LOG.md"), "a") as f:
        f.write(f"- {now()} {sid} v{version} [{dept}/{kind}] {note}\n")


def walk(d, dotted, create=False):
    keys = dotted.split(".")
    for k in keys[:-1]:
        if k not in d:
            if not create:
                sys.exit(f"no field {dotted}")
            d[k] = {}
        d = d[k]
    return d, keys[-1]


def parse(v):
    try:
        return json.loads(v)
    except Exception:
        return v


def index():
    rows = []
    for sid in sorted(os.listdir(ROOT)):
        p = path(sid)
        if os.path.isdir(os.path.join(ROOT, sid)) and os.path.exists(p):
            s = json.load(open(p))
            f = s.get("format", {})
            rows.append(f"| `{s['id']}` | {s['name']} | {s.get('client','')} | {s['status']} | v{s['version']} | "
                        f"{f.get('aspect','')} {f.get('fps','')} fps | {s.get('use_for','')} |")
    out = ("# Style library\n\nGenerated by `styles.py index`. The producer asks which of these to use at the start of every video.\n\n"
           "| ID | Name | Client | Status | Version | Format | Use for |\n| --- | --- | --- | --- | --- | --- | --- |\n"
           + "\n".join(rows) + "\n")
    open(os.path.join(ROOT, "INDEX.md"), "w").write(out)
    return out


def validate(sid):
    s = load(sid)
    miss = [k for k in REQUIRED if k not in s]
    empty = [k for k in ["name", "client", "use_for"] if not s.get(k)]
    for f in ["STYLE.md", "CHANGELOG.md"]:
        if not os.path.exists(path(sid, f)):
            miss.append(f)
    print(f"{sid}: " + ("OK" if not miss and not empty else f"missing {miss} empty {empty}"))
    return not miss and not empty


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("list"); sub.add_parser("index")
    p = sub.add_parser("show"); p.add_argument("id"); p.add_argument("--section")
    p = sub.add_parser("new"); p.add_argument("id"); p.add_argument("--name", required=True)
    p.add_argument("--client", required=True); p.add_argument("--from", dest="src"); p.add_argument("--use-for", default="")
    for c in ("set", "add"):
        p = sub.add_parser(c); p.add_argument("id"); p.add_argument("path"); p.add_argument("value")
        p.add_argument("--note", required=True); p.add_argument("--dept")
    p = sub.add_parser("log"); p.add_argument("id"); p.add_argument("--dept", required=True)
    p.add_argument("--kind", required=True, choices=["approved", "rejected", "learned", "used"])
    p.add_argument("--note", required=True); p.add_argument("--bump", choices=["patch", "minor"])
    p = sub.add_parser("lock"); p.add_argument("id"); p.add_argument("dest")
    p = sub.add_parser("validate"); p.add_argument("id", nargs="?")
    a = ap.parse_args()

    if a.cmd == "list":
        print(index())
    elif a.cmd == "index":
        index(); print("INDEX.md rebuilt")
    elif a.cmd == "show":
        s = load(a.id)
        print(json.dumps(s if not a.section else s.get(a.section), indent=2, ensure_ascii=False))
    elif a.cmd == "new":
        if os.path.exists(os.path.join(ROOT, a.id)):
            sys.exit("exists")
        os.makedirs(os.path.join(ROOT, a.id))
        s = json.loads(json.dumps(load(a.src) if a.src else TEMPLATE))
        s.update(id=a.id, name=a.name, client=a.client, version="0.1.0", status="draft",
                 use_for=a.use_for or s.get("use_for", ""), approved=[], rejected=[], examples=[])
        save(s)
        src_md = path(a.src, "STYLE.md") if a.src else None
        md = open(src_md).read() if src_md and os.path.exists(src_md) else f"# {a.name}\n\nClient: {a.client}\n\n(Write the rules in prose here, department by department, with the reason for each.)\n"
        open(path(a.id, "STYLE.md"), "w").write(md)
        open(path(a.id, "CHANGELOG.md"), "w").write(f"# {a.name} — changelog\n\n")
        record(a.id, s["version"], "producer", "learned", f"created" + (f" from {a.src}" if a.src else " from template"))
        index(); print(f"created {a.id}")
    elif a.cmd in ("set", "add"):
        s = load(a.id); d, k = walk(s, a.path, create=True); v = parse(a.value)
        if a.cmd == "set":
            d[k] = v
        else:
            d.setdefault(k, []); d[k].append(v)
        s["version"] = bump(s["version"], "minor"); save(s)
        dept = a.dept or a.path.split(".")[0]
        record(a.id, s["version"], dept, "learned", f"{a.cmd} {a.path} = {json.dumps(v, ensure_ascii=False)} — {a.note}")
        index(); print(f"{a.id} v{s['version']}")
    elif a.cmd == "log":
        s = load(a.id)
        if a.kind in ("approved", "rejected"):
            s[a.kind].append(f"{now()[:10]} [{a.dept}] {a.note}")
        if a.bump:
            s["version"] = bump(s["version"], a.bump)
        save(s); record(a.id, s["version"], a.dept, a.kind, a.note); index(); print(f"{a.id} v{s['version']} logged")
    elif a.cmd == "lock":
        s = load(a.id); os.makedirs(a.dest, exist_ok=True)
        shutil.copy(path(a.id), os.path.join(a.dest, "style.lock.json"))
        record(a.id, s["version"], "producer", "used", f"locked into {os.path.basename(os.path.abspath(a.dest))}")
        print(f"locked {a.id} v{s['version']} -> {a.dest}/style.lock.json")
    elif a.cmd == "validate":
        ids = [a.id] if a.id else [d for d in sorted(os.listdir(ROOT)) if os.path.exists(path(d))]
        ok = all([validate(i) for i in ids]); sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
