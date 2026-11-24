import React from "react";
import { AbsoluteFill, Composition, Img, registerRoot, staticFile, useCurrentFrame } from "raea";

// Showcase-reel kit, look-dev version (Nov 21 2026). Each scene is one effect at its hero frame.
const Y = "#F2E279"; // accent yellow sampled from the references (242,226,121)
const F = "InterD";
const W = 1080, H = 1920;
const fonts = `
@font-face{font-family:InterD;src:url(${staticFile("InterDisplay-ExtraBold.otf")});font-weight:800}
@font-face{font-family:InterB;src:url(${staticFile("InterDisplay-SemiBold.otf")});font-weight:600}
@font-face{font-family:Anton;src:url(${staticFile("Anton-Regular.ttf")})}
@font-face{font-family:Archivo;src:url(${staticFile("ArchivoBlack-Regular.ttf")})}
@font-face{font-family:Crimson;src:url(${staticFile("CrimsonText-Bold.ttf")})}
@font-face{font-family:Cardo;src:url(${staticFile("Cardo-Bold.ttf")})}`;
const abs: React.CSSProperties = { position: "absolute" };
const shadow = "0 3px 14px rgba(0,0,0,.45)";
const Plate = ({ src = "plateA.jpg", style = {} as React.CSSProperties }) => (
  <Img src={staticFile(src)} style={{ ...abs, left: 0, top: 0, width: W, height: H, ...style }} />
);
const Cut = ({ style = {} as React.CSSProperties }) => <Img src={staticFile("cutA.png")} style={{ ...abs, left: 0, top: 0, width: W, height: H, ...style }} />;

// ---------- the format: title + numbered ledger ----------
const Title = ({ n, rest, top = 250 }: { n: string; rest: string[]; top?: number }) => (
  <div style={{ ...abs, top, width: W, textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: 64, lineHeight: 0.98, letterSpacing: "-0.045em", color: "#fff", textShadow: shadow }}>
    <div><span style={{ color: Y }}>{n}</span> {rest[0]}</div>
    <div>{rest[1]}</div>
  </div>
);
const Ledger = ({ items, x, top, start, active, filled = 99, width = 300 }: { items: string[]; x: number; top: number; start: number; active: number; filled?: number; width?: number }) => (
  <div style={{ ...abs, left: x, top, width, padding: "14px 18px 16px", borderRadius: 20, background: "rgba(28,28,28,.42)", backdropFilter: "blur(16px)" }}>
    {items.map((t, i) => {
      const n = start + i;
      const on = n === active;
      const shown = n <= filled;
      return (
        <div key={i} style={{ display: "flex", alignItems: "baseline", height: 37, fontFamily: F, fontWeight: 800, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>
          <span style={{ width: 34, fontSize: 18, color: "rgba(255,255,255,.55)", fontFamily: "InterB" }}>{String(n).padStart(2, "0")}</span>
          <span style={{ fontSize: 28, color: on ? Y : "rgba(255,255,255,.92)", opacity: shown ? 1 : 0 }}>{t}</span>
        </div>
      );
    })}
  </div>
);
const L1 = ["headline wall", "zoom-through cut", "vertigo", "green screen", "phone mockup", "digital zoom", "paper cut", "ui world"];
const L2 = ["orbit", "frame break", "doodle boil", "sticky text", "before + after", "pull-back reveal", "depth scatter", "comment bubble"];
const Format = ({ active }: { active: number }) => (
  <>
    <Title n="16" rest={["video effects", "claude can create"]} />
    <Ledger items={L1} x={36} top={395} start={1} active={active} />
    <Ledger items={L2} x={744} top={395} start={9} active={active} />
  </>
);
const Cap = ({ children, top = 1180, size = 64 }: { children: React.ReactNode; top?: number; size?: number }) => (
  <div style={{ ...abs, top, width: W, textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: size, letterSpacing: "-0.045em", lineHeight: 0.95, color: "#fff", textShadow: shadow }}>{children}</div>
);

// ---------- 0. held card (v2/v3 format) ----------
const HeldCard = ({ src, label, x = 330, y = 1080, w = 420, rot = -2 }: { src: string; label: string; x?: number; y?: number; w?: number; rot?: number }) => {
  const h = (w * 16) / 9;
  return (
    <div style={{ ...abs, left: x, top: y, width: w, height: h, borderRadius: 26, border: "5px solid #F4F0E6", overflow: "hidden", transform: `rotate(${rot}deg)`, boxShadow: "0 18px 40px rgba(0,0,0,.45)" }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ ...abs, left: 16, top: 16, padding: "5px 14px", borderRadius: 99, background: "rgba(20,20,20,.62)", color: "#fff", fontFamily: F, fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em" }}>{label}</div>
    </div>
  );
};

// ---------- 1. paper cut ----------
const ransom = [
  { c: "p", bg: "#111", fg: "#fff", f: "Anton", r: -6 }, { c: "a", bg: "#F4F0E6", fg: "#111", f: "Cardo", r: 4 }, { c: "p", bg: Y, fg: "#111", f: "Archivo", r: -3 },
  { c: "e", bg: "#fff", fg: "#c22", f: "Crimson", r: 7 }, { c: "r", bg: "#d9cdb4", fg: "#111", f: "Anton", r: -5 },
];
const ransom2 = [{ c: "c", bg: "#1f3fbf", fg: "#fff", f: "Archivo", r: 5 }, { c: "u", bg: "#fff", fg: "#111", f: "Cardo", r: -4 }, { c: "t", bg: "#111", fg: Y, f: "Anton", r: 6 }];
const Letters = ({ set, top }: { set: typeof ransom; top: number }) => (
  <div style={{ ...abs, top, width: W, display: "flex", justifyContent: "center", gap: 6 }}>
    {set.map((l, i) => (
      <div key={i} style={{ background: l.bg, color: l.fg, fontFamily: l.f, fontSize: 120, lineHeight: 1, padding: "8px 16px 14px", transform: `rotate(${l.r}deg) translateY(${(i % 2) * 14}px)`, boxShadow: "0 6px 14px rgba(0,0,0,.35)" }}>{l.c}</div>
    ))}
  </div>
);
const PaperCut = () => (
  <>
    <div style={{ ...abs, inset: 0, background: "#F3F0E8", backgroundImage: "repeating-linear-gradient(0deg, rgba(60,90,160,.16) 0 2px, transparent 2px 54px), repeating-linear-gradient(90deg, rgba(60,90,160,.16) 0 2px, transparent 2px 54px)" }} />
    <div style={{ ...abs, left: -60, top: 640, width: 1200, height: 230, background: Y, transform: "rotate(-4deg)", opacity: 0.95 }} />
    <Img src={staticFile("borderA.png")} style={{ ...abs, left: 0, top: 0, width: W, height: H, filter: "drop-shadow(0 10px 18px rgba(0,0,0,.35))" }} />
    <Cut />
    <Letters set={ransom} top={1230} />
    <Letters set={ransom2} top={1420} />
  </>
);

// ---------- 2. doodle boil ----------
const Doodles = ({ seed }: { seed: number }) => {
  const j = (k: number) => Math.sin(seed * 12.9898 + k * 78.233) * 6;
  const zig = (x: number, y: number, s: number, k: number) => `M${x} ${y} l${30 * s + j(k)} ${-40 + j(k + 1)} l${10 + j(k + 2)} ${45 + j(k + 3)} l${35 * s + j(k + 4)} ${-50 + j(k + 5)} l${8 + j(k + 6)} ${48 + j(k + 7)}`;
  return (
    <svg width={W} height={H} style={{ ...abs, left: 0, top: 0 }}>
      <g fill="none" stroke={Y} strokeWidth={13} style={{ filter: "drop-shadow(0 0 4px rgba(0,0,0,.6))" }} strokeLinecap="round" strokeLinejoin="round">
        <path d={zig(120, 700, 1, 1)} /><path d={zig(800, 640, 1, 9)} /><path d={zig(860, 860, 0.8, 17)} />
        <path d={`M${200 + j(3)} 820 q${-40 + j(4)} 60 ${0 + j(5)} 120 q${40 + j(6)} 60 0 120`} />
      </g>
      <g fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 4px rgba(0,0,0,.6))" }}>
        <circle cx={330 + j(11)} cy={1330 + j(12)} r={26} /><circle cx={385 + j(13)} cy={1300 + j(14)} r={18} /><circle cx={360 + j(15)} cy={1375 + j(16)} r={14} />
        <path d={`M${900 + j(20)} 1040 l28 0 M${914 + j(21)} 1026 l0 28 M${150 + j(22)} 980 l30 0 M${165 + j(23)} 965 l0 30`} />
      </g>
    </svg>
  );
};
const DoodleBoil = ({ k }: { k: number }) => (
  <>
    <Plate style={{ filter: "brightness(.78) contrast(1.05)" }} />
    <Img src={staticFile(`outlineA_${k % 3}.png`)} style={{ ...abs, left: 0, top: 0, width: W, height: H, filter: "drop-shadow(0 0 5px rgba(0,0,0,.7))" }} />
    <Doodles seed={k % 3} />
  </>
);

// ---------- 3. depth scatter (text behind subject) ----------
const DepthScatter = () => (
  <>
    <Plate />
    <div style={{ ...abs, top: 330, width: W, textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: 330, letterSpacing: "-0.06em", color: "#fff", lineHeight: 1, textShadow: "0 6px 30px rgba(0,0,0,.25)" }}>depth</div>
    <Cut />
    <div style={{ ...abs, top: 1150, width: W, textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: 210, letterSpacing: "-0.06em", color: Y, lineHeight: 1, textShadow: shadow }}>
      scatt<span style={{ display: "inline-block", transform: "translate(40px,-60px) rotate(18deg)", filter: "blur(3px)" }}>e</span><span style={{ display: "inline-block", transform: "translate(110px,30px) rotate(-24deg)", filter: "blur(6px)", opacity: 0.85 }}>r</span>
    </div>
    {[...Array(14)].map((_, i) => (
      <div key={i} style={{ ...abs, left: 780 + ((i * 47) % 260), top: 1060 + ((i * 83) % 330), width: 10 + (i % 4) * 8, height: 10 + (i % 3) * 8, background: Y, borderRadius: 3, transform: `rotate(${i * 37}deg)`, filter: `blur(${i % 3}px)`, opacity: 0.9 - (i % 5) * 0.12 }} />
    ))}
  </>
);

// ---------- 4. sticky text (motion-tracked label) ----------
const Sticker = ({ x, y, r, o = 1, blur = 0 }: { x: number; y: number; r: number; o?: number; blur?: number }) => (
  <div style={{ ...abs, left: x, top: y, transform: `rotate(${r}deg)`, opacity: o, filter: blur ? `blur(${blur}px)` : undefined, display: "flex", alignItems: "center", gap: 12, padding: "14px 26px 16px 18px", background: Y, borderRadius: 18, boxShadow: "0 10px 24px rgba(0,0,0,.35)", fontFamily: F, fontWeight: 800, fontSize: 52, letterSpacing: "-0.04em", color: "#111" }}>
    <span style={{ width: 40, height: 40, borderRadius: 99, background: "#111", color: Y, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>12</span>sticky text
  </div>
);
const StickyText = () => (
  <>
    <Plate />
    <Format active={12} />
    <Sticker x={760} y={980} r={-14} o={0.18} blur={10} />
    <Sticker x={650} y={1060} r={-10} o={0.3} blur={6} />
    <Sticker x={520} y={1150} r={-6} />
  </>
);

// ---------- 5. before + after light wipe ----------
const BeforeAfter = () => {
  const x = 560;
  return (
    <>
      <Plate src="plateA_graded.jpg" />
      <div style={{ ...abs, left: 0, top: 0, width: x, height: H, overflow: "hidden" }}><Plate /></div>
      <div style={{ ...abs, left: x - 70, top: 0, width: 140, height: H, background: "linear-gradient(90deg, transparent, rgba(255,250,235,.55), transparent)", filter: "blur(18px)" }} />
      <div style={{ ...abs, left: x - 4, top: 0, width: 8, height: H, background: "#fff", boxShadow: "0 0 30px 10px rgba(255,248,225,.9)" }} />
      <div style={{ ...abs, left: x - 420, top: 760, width: 840, height: 10, borderRadius: 9, background: "radial-gradient(closest-side, rgba(255,255,255,.95), rgba(255,240,200,0))", filter: "blur(2px)" }} />
      <div style={{ ...abs, left: x - 110, top: 700, width: 220, height: 130, borderRadius: 99, background: "radial-gradient(closest-side, rgba(255,255,255,.9), rgba(255,240,210,0))" }} />
      {[["before", 70], ["after", W - 230]].map(([t, l]) => (
        <div key={t as string} style={{ ...abs, left: l as number, top: 1240, padding: "8px 20px", borderRadius: 99, background: "rgba(20,20,20,.55)", backdropFilter: "blur(10px)", color: "#fff", fontFamily: F, fontWeight: 800, fontSize: 34, letterSpacing: "-0.03em" }}>{t as string}</div>
      ))}
    </>
  );
};

// ---------- 6. frame break (subject breaks out of the reel frame) ----------
const Icon = ({ d }: { d: string }) => (
  <svg width={56} height={56} viewBox="0 0 24 24" style={{ display: "block", marginBottom: 26 }}><path d={d} fill="none" stroke="#fff" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" /></svg>
);
const FrameBreak = () => {
  const cx = 210, cy = 640, cw = 660, ch = 900, s = 0.74, ox = (cw - W * 0.74) / 2, dy = -440;
  return (
    <>
      <Plate src="plateA_blur.jpg" style={{ filter: "brightness(.35)" }} />
      <div style={{ ...abs, left: cx, top: cy, width: cw, height: ch, borderRadius: 34, overflow: "hidden", boxShadow: "0 30px 70px rgba(0,0,0,.6)" }}>
        <Plate style={{ width: W * s, height: H * s, top: dy, left: ox }} />
        <div style={{ ...abs, left: 0, bottom: 0, width: cw, height: 300, background: "linear-gradient(transparent, rgba(0,0,0,.65))" }} />
        <div style={{ ...abs, right: 22, bottom: 170 }}>
          <Icon d="M12 21s-7-4.4-9.3-8.6C1.2 9.6 2.9 6 6.4 6c2 0 3.2 1.1 3.6 2 .4-.9 1.6-2 3.6-2 3.5 0 5.2 3.6 3.7 6.4C19 16.6 12 21 12 21z" />
          <Icon d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12z" />
          <Icon d="M22 3 11 14M22 3l-7 19-4-8-8-4z" />
        </div>
        <div style={{ ...abs, left: 26, bottom: 40, display: "flex", alignItems: "center", gap: 14, color: "#fff", fontFamily: F, fontWeight: 800, fontSize: 30 }}>
          <div style={{ width: 52, height: 52, borderRadius: 99, background: "#ddd", border: "3px solid #fff" }} /> yourhandle <span style={{ fontFamily: "InterB", fontSize: 24, padding: "4px 14px", border: "2px solid #fff", borderRadius: 10 }}>Follow</span>
        </div>
      </div>
      {/* the subject above the frame's top edge, drawn outside the card */}
      <div style={{ ...abs, left: cx, top: 0, width: cw, height: cy + 40, overflow: "hidden" }}>
        <Cut style={{ left: ox, width: W * s, height: H * s, top: cy + dy, filter: "drop-shadow(0 12px 18px rgba(0,0,0,.5))" }} />
      </div>
      <Cap top={1640} size={58}>frame break</Cap>
    </>
  );
};

// ---------- 7. orbit ----------
const Orbit = ({ phase }: { phase: number }) => {
  const imgs = ["01_blade_runner_2049.jpg", "06_moonlight.jpg", "02_la_la_land.jpg", "09_drive.jpg", "plateA_graded.jpg", "00_original.jpg", "06_moonlight.jpg", "01_blade_runner_2049.jpg"];
  const cards = imgs.map((src, i) => {
    const a = phase + (i / imgs.length) * Math.PI * 2;
    const z = Math.cos(a); // +1 front
    const x = 540 + Math.sin(a) * 470, y = 1080 - z * 70;
    const s = 0.72 + 0.28 * (z + 1) / 2;
    return { src, z, x, y, s, ry: (-Math.sin(a) * 55) };
  });
  const card = (c: (typeof cards)[0], i: number) => (
    <div key={i} style={{ ...abs, left: c.x - 110 * c.s, top: c.y - 195 * c.s, width: 220 * c.s, height: 390 * c.s, borderRadius: 18, overflow: "hidden", border: "4px solid #F4F0E6", transform: `perspective(1200px) rotateY(${c.ry}deg)`, filter: `brightness(${0.55 + 0.45 * (c.z + 1) / 2}) blur(${c.z < -0.3 ? 2 : 0}px)`, boxShadow: "0 14px 30px rgba(0,0,0,.45)" }}>
      <Img src={staticFile(c.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
  return (
    <>
      <Plate style={{ filter: "brightness(.8)" }} />
      {cards.filter((c) => c.z < 0).sort((a, b) => a.z - b.z).map(card)}
      <Cut />
      {cards.filter((c) => c.z >= 0).sort((a, b) => a.z - b.z).map(card)}
    </>
  );
};

// ---------- 8. green screen (background swap behind the matte) ----------
const GreenScreen = () => (
  <>
    <Plate src="09_drive.jpg" style={{ transform: "scale(1.15)", filter: "blur(2px)" }} />
    <div style={{ ...abs, inset: 0, background: "radial-gradient(ellipse at 50% 60%, transparent 40%, rgba(0,0,0,.5))" }} />
    <Cut style={{ filter: "drop-shadow(-10px 0 24px rgba(255,40,190,.45)) drop-shadow(10px 0 24px rgba(20,200,255,.35))" }} />
    <Format active={4} />
  </>
);

// ---------- 9. digital zoom ----------
const Bracket = ({ x, y, r }: { x: number; y: number; r: number }) => (
  <div style={{ ...abs, left: x, top: y, width: 70, height: 70, borderTop: "5px solid #fff", borderLeft: "5px solid #fff", transform: `rotate(${r}deg)`, opacity: 0.9 }} />
);
const DigitalZoom = () => (
  <>
    <div style={{ ...abs, inset: 0, overflow: "hidden" }}><Plate style={{ transform: "scale(1.38)", transformOrigin: "52% 38%" }} /></div>
    <Bracket x={150} y={430} r={0} /><Bracket x={860} y={430} r={90} /><Bracket x={860} y={1240} r={180} /><Bracket x={150} y={1240} r={270} />
    <div style={{ ...abs, left: 60, top: 120, display: "flex", alignItems: "center", gap: 12, color: "#fff", fontFamily: F, fontWeight: 800, fontSize: 30 }}><div style={{ width: 18, height: 18, borderRadius: 99, background: "#ff3b30" }} />REC 00:07</div>
    <div style={{ ...abs, left: 0, top: 1500, width: W, display: "flex", justifyContent: "center", gap: 26, alignItems: "center" }}>
      {["0.5", "1×", "1.38×", "2", "5"].map((t, i) => (
        <div key={i} style={{ width: i === 2 ? 120 : 70, height: i === 2 ? 120 : 70, borderRadius: 99, background: i === 2 ? "rgba(20,20,20,.7)" : "rgba(20,20,20,.4)", color: i === 2 ? Y : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F, fontWeight: 800, fontSize: i === 2 ? 34 : 24, backdropFilter: "blur(8px)" }}>{t}</div>
      ))}
    </div>
  </>
);

// ---------- 10. comment CTA ----------
const CommentCTA = () => (
  <>
    <Plate />
    <Cap top={1130}>comment <span style={{ color: Y }}>studio</span></Cap>
    <div style={{ ...abs, left: 90, top: 1300, display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 62, height: 62, borderRadius: 99, background: "#c9c2b5", border: "3px solid #fff" }} />
      <div style={{ padding: "14px 30px", borderRadius: 34, background: "#fff", color: "#111", fontFamily: F, fontWeight: 800, fontSize: 46, letterSpacing: "-0.03em", boxShadow: "0 10px 30px rgba(0,0,0,.3)" }}>STUDIO</div>
      <div style={{ width: 26, height: 26, borderRadius: 99, background: "#ff3b6b", marginLeft: -26, marginTop: -60 }} />
    </div>
    <div style={{ ...abs, left: 170, top: 1410, width: 560, padding: "22px 26px", borderRadius: 30, background: "rgba(22,22,22,.72)", backdropFilter: "blur(14px)", color: "#fff", fontFamily: F, fontWeight: 800, fontSize: 36, letterSpacing: "-0.02em" }}>
      Sent you the link
      <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 22px", borderRadius: 99, background: Y, color: "#111", fontSize: 30 }}>↗ Open link</div>
    </div>
    <div style={{ ...abs, left: 70, top: 1690, width: 940, height: 92, borderRadius: 99, background: "rgba(22,22,22,.6)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", padding: "0 16px", gap: 18 }}>
      <div style={{ width: 60, height: 60, borderRadius: 99, background: "#c9c2b5" }} />
      <div style={{ flex: 1, color: "#fff", fontFamily: F, fontWeight: 800, fontSize: 38 }}>STUD<span style={{ opacity: 0.6 }}>|</span></div>
      <div style={{ width: 64, height: 64, borderRadius: 99, background: Y, color: "#111", fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F, fontWeight: 800 }}>↑</div>
    </div>
  </>
);

// ---------- 11. colour-grade ledger (v4 format) ----------
const G1 = ["blade runner 2049", "la la land", "the godfather", "the revenant", "the matrix", "moonlight", "barbie", "sin city", "drive", "joker"];
const G2 = ["mad max: fury road", "the wizard of oz", "", "", "", "", "", "", "", ""];
const GradeFormat = ({ src, n, name }: { src: string; n: number; name: string }) => (
  <>
    <Plate src={src} />
    <Title n="12" rest={["movie color grades", "claude can create"]} top={160} />
    <Ledger items={G1} x={30} top={300} start={1} active={n} filled={n} width={330} />
    <Ledger items={G2} x={700} top={300} start={11} active={n} filled={n} width={350} />
    <div style={{ ...abs, left: 300, top: 1290, width: 480, height: 270, borderRadius: 16, overflow: "hidden", border: "4px solid #F4F0E6", boxShadow: "0 16px 40px rgba(0,0,0,.5)" }}>
      <Img src={staticFile("00_original.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 35%" }} />
      <div style={{ ...abs, left: 12, top: 12, padding: "3px 10px", borderRadius: 6, background: "rgba(0,0,0,.6)", color: "#fff", fontFamily: "InterB", fontSize: 18, letterSpacing: "0.04em" }}>BEFORE</div>
    </div>
    <div style={{ ...abs, top: 1620, width: W, textAlign: "center", color: "#fff", fontFamily: F, fontWeight: 800, letterSpacing: "-0.045em", textShadow: shadow }}>
      <span style={{ fontSize: 30, color: Y, marginRight: 14 }}>{String(n).padStart(2, "0")}</span><span style={{ fontSize: 66 }}>{name}</span>
    </div>
  </>
);

const SCENES: ((t: number) => React.ReactNode)[] = [
  () => (<><Plate /><Format active={6} /><HeldCard src="01_blade_runner_2049.jpg" label="06/16" /></>),
  () => (<><PaperCut /><Title n="16" rest={["video effects", "claude can create"]} /></>),
  (t) => (<><DoodleBoil k={t} /><Format active={11} /></>),
  () => <DepthScatter />,
  () => <StickyText />,
  () => (<><BeforeAfter /><Format active={13} /></>),
  () => <FrameBreak />,
  (t) => (<><Orbit phase={0.35 + t * 0.06} /><Format active={9} /></>),
  () => <GreenScreen />,
  () => (<><DigitalZoom /><Format active={6} /></>),
  () => (<><CommentCTA /><Format active={16} /></>),
  () => <GradeFormat src="06_moonlight.jpg" n={6} name="moonlight" />,
  () => <GradeFormat src="02_la_la_land.jpg" n={2} name="la la land" />,
  () => <GradeFormat src="01_blade_runner_2049.jpg" n={1} name="blade runner 2049" />,
];

const Lab = () => {
  const f = useCurrentFrame();
  const s = Math.min(SCENES.length - 1, Math.floor(f / 10));
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <style>{fonts}</style>
      {SCENES[s](f % 10)}
    </AbsoluteFill>
  );
};
registerRoot(() => <Composition id="lab" width={W} height={H} fps={30} durationInFrames={SCENES.length * 10} component={Lab} />);
