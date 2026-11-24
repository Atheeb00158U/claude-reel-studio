"""B3 A-roll with a growth graphic behind the speaker: bars rise on the wall either side of him (cream -> terracotta),
a corpus counter climbs above his head, then a growth line joins the bar tops. Drawn on the plate BEFORE the grade."""
import sys, json, math, subprocess
sys.path.insert(0, '/home/claude/s3/comp'); sys.path.insert(0, '/home/claude/sb')
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import keyed6 as K
FPS, W, H = 30, 1080, 1920
F_BIG = ImageFont.truetype('/usr/share/fonts/opentype/inter/InterDisplay-Black.otf', 150)
F_SM = ImageFont.truetype('/usr/share/fonts/opentype/inter/InterDisplay-SemiBold.otf', 38)
CREAM = (244, 239, 230); TERRA = (214, 140, 110)
eo = lambda u: 1 - (1 - min(1, max(0, u))) ** 3
xs = [70, 205, 340, 475, 605, 740, 875]; bw = 110
hts = [150, 220, 300, 390, 480, 580, 690]; BASE = 1000
def gfx(t):
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    tops = []
    for i, (x, h) in enumerate(zip(xs, hts)):
        k = eo((t - 0.10 - i * 0.16) / 0.45); hh = h * k
        c = tuple(int(CREAM[j] + (TERRA[j] - CREAM[j]) * (i / 6)) for j in range(3))
        if hh > 2: d.rounded_rectangle([x, BASE - hh, x + bw, BASE + 40], radius=18, fill=c + (int(215 * min(1, k * 2)),))
        tops.append((x + bw / 2, BASE - hh))
    lk = eo((t - 1.45) / 0.7)
    if lk > 0:
        pts = tops; n = max(2, int(lk * (len(pts) - 1) * 10) + 1); seg = []
        for q in range(n):
            u = q / 10; i0 = min(len(pts) - 2, int(u)); f = u - i0
            seg.append((pts[i0][0] + (pts[i0 + 1][0] - pts[i0][0]) * f, pts[i0][1] - 40 + (pts[i0 + 1][1] - pts[i0][1]) * f))
        d.line(seg, fill=CREAM + (235,), width=7, joint='curve')
        ex, ey = seg[-1]; d.ellipse([ex - 13, ey - 13, ex + 13, ey + 13], fill=CREAM + (255,))
    ck = eo((t - 0.05) / 1.9); val = 3.2 * ck
    txt = f'₹{val:.1f} Cr'; tw = d.textlength(txt, font=F_BIG)
    d.text(((W - tw) / 2, 175), txt, font=F_BIG, fill=CREAM + (int(255 * min(1, t / 0.25)),))
    L = L.filter(ImageFilter.GaussianBlur(1.2))                   # sit on the (slightly soft) plate
    return np.asarray(L).astype(np.float32) / 255

def render(fr, t):
    a, fd = K.key(fr)
    bg = K.BGW[(K.BH - H) // 2:(K.BH - H) // 2 + H, 600:600 + W].copy()
    g = gfx(t); bg = bg * (1 - g[..., 3:]) + g[..., :3] * g[..., 3:]
    fa = K.shift(np.dstack([fd, a]), 0, 0, 1.03); fd2 = fa[..., :3]; a2 = fa[..., 3:]
    edge = np.clip(cv2.GaussianBlur(1 - a2[..., 0], (0, 0), 6) * a2[..., 0], 0, 1)[..., None]
    fg = fd2 * (1 - edge * 0.35) + cv2.GaussianBlur(bg, (0, 0), 8) * edge * 0.35
    out = K.vignette(K.godfather(fg * a2 + bg * (1 - a2), 0.6), 0.2)
    return (np.clip(out, 0, 1) * 255).astype(np.uint8)

if __name__ == '__main__':
    cap = cv2.VideoCapture(K.U + 'log/sb_B3.mp4')
    if len(sys.argv) > 1 and sys.argv[1] == '--still':
        want = [int(float(x) * FPS) for x in sys.argv[2].split(',')]; i = 0
        while want:
            ok, fr = cap.read()
            if not ok: break
            if i in want: Image.fromarray(render(cv2.cvtColor(fr, cv2.COLOR_BGR2RGB), i / FPS)).save(f'b3g_{i}.jpg', quality=88); want.remove(i)
            i += 1
        sys.exit()
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-c:v', 'libx264', '-preset', 'fast', '-crf', '15', '-pix_fmt', 'yuv420p', 'keyed6/B3g.mp4'], stdin=subprocess.PIPE)
    i = 0
    while True:
        ok, fr = cap.read()
        if not ok: break
        p.stdin.write(render(cv2.cvtColor(fr, cv2.COLOR_BGR2RGB), i / FPS).tobytes()); i += 1
    p.stdin.close(); p.wait(); print('done', i)
