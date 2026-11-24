// Reel Studio real-app kit (approved Wealthometry Script 3, Nov 2026). raea 0.1.8 composition: copy, then restyle tokens.
// Media expected in src/media/: Inter/Roboto/LiberationSans/InterDisplay fonts, google_logo.png, sheets_icon.png, em_*.png (Noto emoji), keyed footage, master.wav.
import React from "react";
import { AbsoluteFill, Audio, Composition, Easing, Img, interpolate, registerRoot, Sequence, staticFile, useCurrentFrame, Video } from "raea";
import { Q, QX } from "./data_typing";
import { ShapeGlitch } from "./ShapeGlitch";

// Script 3 (Wealthometry) — storyboard test v4 (first ~30 s). Style: wealthometry-talking-head-ad (draft).
// Motion graphics = REAL app screens rebuilt in code (WhatsApp, iOS Calendar + notification, Google, Google Sheets,
// Google Calendar) on white, with a Vox camera that follows the action (newest bubble, caret, active cell, new date line).
// Fonts: Inter Display (from the R1 reference) for captions and titles; Garamond-style italic (Pagella stand-in) for accents.
const FPS = 30, W = 1080, H = 1920, SEAM = 960;
const f = (s: number) => Math.round(s * FPS);
const T = { ink: "#09090B", muted: "#71717A", plate: "#FFFFFF" };
const IOS = "SF", IOSM = "SFM", IOSS = "SFS", IOSB = "SFB", RB = "Rob", RBM = "RobM", ARIAL = "Ar", CAP = "CapInter", BIG = "BigInter", SER = "Pagella";
const fonts = `
@font-face{font-family:${IOS};src:url(${staticFile("Inter-Regular.otf")})}
@font-face{font-family:${IOSM};src:url(${staticFile("Inter-Medium.otf")})}
@font-face{font-family:${IOSS};src:url(${staticFile("Inter-SemiBold.otf")})}
@font-face{font-family:${IOSB};src:url(${staticFile("Inter-Bold.otf")})}
@font-face{font-family:${RB};src:url(${staticFile("Roboto-Regular.ttf")})}
@font-face{font-family:${RBM};src:url(${staticFile("Roboto-Medium.ttf")})}
@font-face{font-family:${ARIAL};src:url(${staticFile("LiberationSans-Regular.ttf")})}
@font-face{font-family:${CAP};src:url(${staticFile("InterDisplay-Bold.otf")})}
@font-face{font-family:${BIG};src:url(${staticFile("InterDisplay-ExtraBold.otf")})}
@font-face{font-family:${SER};src:url(${staticFile("texgyrepagella-italic.otf")})}
@font-face{font-family:Morn;src:url(${staticFile("wm_morn.woff2")})}`;
const abs: React.CSSProperties = { position: "absolute" };
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const out = Easing.out(Easing.cubic);
const io = Easing.bezier(0.65, 0, 0.35, 1);
const pop = Easing.bezier(0.34, 1.5, 0.64, 1);
const ramp = (fr: number, a: number, d = 7, e = out) => interpolate(fr, [a, a + d], [0, 1], { ...clamp, easing: e });

// ---------- timeline ----------
const SEG = { full1: [0, 3.55], chat: [3.55, 5.88], faceB1: [5.88, 7.60], years: [7.60, 11.235], faceB1b: [11.235, 12.58], stack: [12.58, 14.93], plate: [14.93, 17.655], saved: [17.655, 22.85], full2: [22.85, 25.1], chairs: [25.1, 29.835],
  site: [29.835, 33.885], form: [33.885, 43.245], pdf: [43.245, 51.38], face6: [51.38, 53.28], sms: [53.28, 58.48], market: [58.48, 62.17], review: [62.17, 70.6], cta: [70.6, 75.45], end: [75.45, 78.45] };
const LAYOUT: Record<string, "face" | "split" | "full"> = { full1: "face", chat: "split", faceB1: "face", years: "split", faceB1b: "face", stack: "full", plate: "full", saved: "split", full2: "face", chairs: "split", site: "face", form: "split", pdf: "full", face6: "face", sms: "split", market: "full", review: "split", cta: "face", end: "full" };
const TOTAL = 78.45;
const H3o = (t: number) => t - 24.01, B1o = (t: number) => 5.88 + (t - 2.745), B2o = (t: number) => 17.655 + (t - 7.73);
const B3o = (t: number) => 29.835 + t, B4o = (t: number) => 33.885 + t, B5o = (t: number) => 43.245 + t, B6o = (t: number) => 51.38 + t, B7o = (t: number) => 62.17 + t, CTo = (t: number) => 70.6 + t;
const rel = (k: keyof typeof SEG, t: number) => f(t - SEG[k][0]);

// ---------- Vox camera: keys = [frame, x, y, zoom]; (x, y) is the world point centred in the view ----------
type Key = [number, number, number, number];
const camAt = (fr: number, keys0: Key[]) => {
  const keys: Key[] = []; for (const k of keys0) { const p = keys.length ? keys[keys.length - 1][0] : -1e9; keys.push([Math.max(k[0], p + 1), k[1], k[2], k[3]]); }
  const fs = keys.map((k) => k[0]);
  const g = (i: number) => interpolate(fr, fs, keys.map((k) => k[i]), { ...clamp, easing: io });
  return { x: g(1), y: g(2), z: g(3) };
};
const Cam = ({ keys, vw, vh, children, x0, y0 }: { keys: Key[]; vw: number; vh: number; children: React.ReactNode; x0?: number; y0?: number }) => {
  const fr = useCurrentFrame(); const c = camAt(fr, keys);
  const x = x0 ?? c.x, y = y0 ?? c.y;
  return <div style={{ ...abs, left: 0, top: 0, width: vw, height: vh, overflow: "hidden" }}>
    <div style={{ ...abs, left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${vw / 2 - x * c.z}px, ${vh / 2 - y * c.z}px) scale(${c.z})` }}>{children}</div>
  </div>;
};

// ---------- iPhone ----------
const PX = 130, PY = 60, SW = 820, SH = 1776;
const StatusBar = ({ bg = "transparent" }: { bg?: string }) => (
  <div style={{ ...abs, left: 0, top: 0, width: SW, height: 118, background: bg }}>
    <div style={{ ...abs, left: 86, top: 40, fontFamily: IOSS, fontSize: 35, color: "#000" }}>10:42</div>
    <div style={{ ...abs, left: SW / 2 - 125, top: 22, width: 250, height: 74, borderRadius: 37, background: "#000" }} />
    <svg style={{ ...abs, left: 590, top: 46 }} width={180} height={30} viewBox="0 0 180 30">
      {[0, 1, 2, 3].map((i) => <rect key={i} x={i * 11} y={20 - i * 6} width={8} height={8 + i * 6} rx={2} fill="#000" />)}
      <path d="M62 12a22 22 0 0 1 30 0l-3.5 3.6a17 17 0 0 0-23 0z M68 18a13 13 0 0 1 18 0l-3.6 3.6a8 8 0 0 0-10.8 0z M74 24a4.4 4.4 0 0 1 6 0l-3 3z" fill="#000" />
      <rect x={106} y={5} width={50} height={23} rx={7} fill="none" stroke="#000" strokeOpacity={0.4} strokeWidth={2} />
      <rect x={110} y={9} width={36} height={15} rx={4} fill="#000" /><rect x={158} y={12} width={3} height={9} rx={1.5} fill="#000" fillOpacity={0.4} />
    </svg>
  </div>
);
const Phone = ({ children, bg = "#fff" }: { children: React.ReactNode; bg?: string }) => (
  <div style={{ ...abs, left: PX - 18, top: PY - 18, width: SW + 36, height: SH + 36, borderRadius: 104, background: "#1C1C1E" }}>
    <div style={{ ...abs, left: 18, top: 18, width: SW, height: SH, borderRadius: 88, overflow: "hidden", background: bg }}>{children}</div>
  </div>
);
const Em = ({ n, s }: { n: string; s: number }) => <Img src={staticFile(`em_${n}.png`)} style={{ display: "inline-block", height: s, verticalAlign: `-${s * 0.18}px` }} />;

// ---------- 1. WhatsApp group "Office": bubbles land on the words, camera follows the newest ----------
type Msg = { at: number; h: number; el: (k: number) => React.ReactNode };
const Tick = () => <svg width={34} height={20} viewBox="0 0 34 20" style={{ marginLeft: 6, verticalAlign: "-2px" }}><path d="M2 11l5 5L18 4M14 14l2 2L28 4" fill="none" stroke="#53BDEB" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" /></svg>;
const Bubble = ({ who, color, out: o, children, time, w }: { who?: string; color?: string; out?: boolean; children: React.ReactNode; time: string; w: number }) => (
  <div style={{ ...abs, [o ? "right" : "left"]: 24, bottom: 0, width: w, background: o ? "#D9FDD3" : "#fff", borderRadius: 18, padding: "12px 20px 12px", boxSizing: "border-box" }}>
    {who && <div style={{ fontFamily: IOSS, fontSize: 28, color, marginBottom: 2 }}>{who}</div>}
    <div style={{ fontFamily: IOS, fontSize: 35, lineHeight: "45px", color: "#111B21" }}>{children}
      <span style={{ display: "inline-block", width: o ? 128 : 90 }} /></div>
    <div style={{ ...abs, right: 16, bottom: 10, fontFamily: IOS, fontSize: 22, color: "#667781" }}>{time}{o && <Tick />}</div>
  </div>
);
type ChatCfg = { msgs: Msg[]; camKeys: Key[]; title: React.ReactNode; members: string; typing?: [number, number, string]; react?: [number, number] };
const WhatsApp = () => {
  const fr = useCurrentFrame(); const s = "chat";
  const a2 = rel(s, H3o(28.38)) - 2, a3 = rel(s, H3o(28.68)), a4 = rel(s, H3o(29.14)), aR = rel(s, H3o(29.50));
  void fr;
  const msgs: Msg[] = [
    { at: -99, h: 162, el: () => <Bubble out w={640} time="10:41">Guys, aaj se maine retirement planning shuru ki <Em n="muscle" s={40} /></Bubble> },
    { at: a2, h: 120, el: () => <Bubble who="Rohit" color="#D3396D" w={600} time="10:42">40 mein retirement?? <Em n="laugh" s={40} /></Bubble> },
    { at: a3, h: 120, el: () => <Bubble who="Neha" color="#1F7AEC" w={560} time="10:42">pagal ho gaya hai kya</Bubble> },
    { at: a4, h: 140, el: () => <Bubble who="Vikas" color="#C45A00" w={330} time="10:42"><Em n="laugh" s={62} /><Em n="laugh" s={62} /><Em n="laugh" s={62} /></Bubble> },
  ];
  return <WAChat msgs={msgs} camKeys={[[0, 540, 330, 1.3], [a2 - 4, 540, 330, 1.3], [a2 + 8, 540, 1480, 1.3], [80, 540, 1500, 1.3]]} title={<>Office <Em n="office" s={34} /></>} members="Rohit, Neha, Vikas, You" typing={[4, a2, "Rohit is typing…"]} react={[0, aR]} />;
};
const WAChat = ({ msgs, camKeys, title, members, typing: ty, react }: ChatCfg) => {
  const fr = useCurrentFrame();
  const BOT = 1560, GAP = 14;
  const ys = msgs.map((m, i) => BOT - msgs.slice(i + 1).reduce((acc, n) => acc + (n.h + GAP) * ramp(fr, n.at, 4), 0));
  const typing = !!ty && fr >= ty[0] && fr < ty[1];
  const aR = react ? react[1] : 1e9;
  return <Cam vw={W} vh={SEAM} keys={camKeys}>
    <Phone bg="#EFEAE2">
      <div style={{ ...abs, left: 0, top: 0, width: SW, height: 236, background: "#F6F6F6", borderBottom: "1px solid #D1D1D6" }}>
        <StatusBar />
        <svg style={{ ...abs, left: 22, top: 140 }} width={26} height={44} viewBox="0 0 26 44"><path d="M22 4 4 22l18 18" fill="none" stroke="#007AFF" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" /></svg>
        <div style={{ ...abs, left: 64, top: 128, width: 76, height: 76, borderRadius: 38, background: "#DFE5E7", overflow: "hidden" }}>
          <svg width={76} height={76} viewBox="0 0 76 76"><circle cx={38} cy={30} r={13} fill="#fff" /><path d="M14 72c2-16 12-24 24-24s22 8 24 24z" fill="#fff" /></svg>
        </div>
        <div style={{ ...abs, left: 160, top: 128, fontFamily: IOSS, fontSize: 35, color: "#000" }}>{title}</div>
        <div style={{ ...abs, left: 160, top: 172, fontFamily: IOS, fontSize: 25, color: typing ? "#25D366" : "#8E8E93" }}>{typing ? ty![2] : members}</div>
        <svg style={{ ...abs, left: 640, top: 148 }} width={150} height={40} viewBox="0 0 150 40">
          <rect x={2} y={8} width={34} height={24} rx={6} fill="none" stroke="#007AFF" strokeWidth={3.4} /><path d="M38 16l12-7v22l-12-7z" fill="none" stroke="#007AFF" strokeWidth={3.4} strokeLinejoin="round" />
          <path d="M108 8c3 0 5 6 5 8s-3 3-3 4 4 8 9 10c1 0 2-3 4-3s7 3 7 5-2 6-6 6c-10 0-22-12-22-22 0-4 3-8 6-8z" fill="none" stroke="#007AFF" strokeWidth={3.2} strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ ...abs, left: SW / 2 - 60, top: 262, width: 120, height: 44, borderRadius: 14, background: "#fff", fontFamily: IOSM, fontSize: 24, color: "#54656F", textAlign: "center", lineHeight: "44px" }}>Today</div>
      {msgs.map((m, i) => {
        if (fr < m.at) return null;
        const k = ramp(fr, m.at + 3, 6, pop);
        return <div key={i} style={{ ...abs, left: 0, top: ys[i] - m.h, width: SW, height: m.h, opacity: i === 0 ? 1 : ramp(fr, m.at + 3, 3), transformOrigin: i === 0 ? "100% 100%" : "0 100%", transform: `scale(${0.82 + 0.18 * k})` }}>
          {m.el(k)}
          {react && i === react[0] && fr >= aR && <div style={{ ...abs, right: 60, bottom: -34, height: 46, padding: "0 14px", borderRadius: 23, background: "#fff", border: "2px solid #EFEAE2", fontFamily: IOSM, fontSize: 26, color: "#54656F", lineHeight: "44px", transform: `scale(${ramp(fr, aR, 6, pop)})` }}><Em n="laugh" s={30} /> 3</div>}
        </div>;
      })}
      <div style={{ ...abs, left: 0, top: 1620, width: SW, height: 156, background: "#F6F6F6", borderTop: "1px solid #D1D1D6" }}>
        <div style={{ ...abs, left: 28, top: 14, fontFamily: IOS, fontSize: 52, color: "#007AFF", lineHeight: "52px" }}>+</div>
        <div style={{ ...abs, left: 96, top: 16, width: 520, height: 54, borderRadius: 27, background: "#fff", border: "1px solid #D1D1D6" }} />
        <svg style={{ ...abs, left: 650, top: 22 }} width={140} height={44} viewBox="0 0 140 44"><rect x={2} y={10} width={40} height={30} rx={6} fill="none" stroke="#007AFF" strokeWidth={3.4} /><circle cx={22} cy={25} r={8} fill="none" stroke="#007AFF" strokeWidth={3.4} /><rect x={96} y={4} width={18} height={26} rx={9} fill="none" stroke="#007AFF" strokeWidth={3.4} /><path d="M90 24a15 15 0 0 0 30 0M105 39v4" fill="none" stroke="#007AFF" strokeWidth={3.4} strokeLinecap="round" /></svg>
      </div>
    </Phone>
  </Cam>;
};

// ---------- 2. iOS Calendar year view: scroll 20 years ahead to Retirement, notification drops, snaps back to today ----------
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YB = 1500, MW = 246, MH = 296;
const MonthBlock = ({ y, m, today, ringK }: { y: number; m: number; today?: number; ringK?: number }) => {
  const first = new Date(y, m, 1).getDay(); const n = new Date(y, m + 1, 0).getDate();
  const cells = []; for (let d = 1; d <= n; d++) { const c = (first + d - 1) % 7, r = Math.floor((first + d - 1) / 7); cells.push({ d, x: c * 33 + 16, y: 64 + r * 36 }); }
  const cur = today !== undefined;
  return <div style={{ ...abs, left: 40 + (m % 3) * MW, top: 270 + Math.floor(m / 3) * MH, width: MW, height: MH }}>
    <div style={{ ...abs, left: 4, top: 0, fontFamily: IOSB, fontSize: 34, color: cur ? "#FF3B30" : "#000" }}>{MON[m]}</div>
    {cells.map((c) => <div key={c.d} style={{ ...abs, left: c.x - 16, top: c.y - 2, width: 32, height: 32, borderRadius: 16, background: c.d === today ? "#FF3B30" : "transparent", fontFamily: IOSM, fontSize: 19, lineHeight: "32px", textAlign: "center", color: c.d === today ? "#fff" : "#000" }}>{c.d}</div>)}
    {ringK !== undefined && ringK > 0 && cells.filter((c) => c.d === 21).map((c) => <svg key="r" style={{ ...abs, left: c.x - 30, top: c.y - 16, overflow: "visible" }} width={60} height={60}><circle cx={30} cy={30} r={25} fill="none" stroke="#FF3B30" strokeWidth={4} strokeDasharray={160} strokeDashoffset={160 * (1 - ringK)} transform="rotate(-90 30 30)" /></svg>)}
  </div>;
};
const YearBlock = ({ y, top, ringK }: { y: number; top: number; ringK: number }) => (
  <div style={{ ...abs, left: 0, top, width: SW, height: YB }}>
    <div style={{ ...abs, left: 40, top: 150, fontFamily: IOSB, fontSize: 74, letterSpacing: "-0.01em", color: y === 2026 ? "#FF3B30" : "#000" }}>{y}</div>
    <div style={{ ...abs, left: 40, top: 250, width: SW - 80, height: 1, background: "#D1D1D6" }} />
    {MON.map((_, m) => <MonthBlock key={m} y={y} m={m} today={y === 2026 && m === 10 ? 21 : undefined} ringK={y === 2046 && m === 10 ? ringK : undefined} />)}
  </div>
);
const Calendar = () => {
  const fr = useCurrentFrame(); const s = "years";
  const aDoor = rel(s, B1o(4.51)) + 3, aLand = rel(s, B1o(5.20)) + 3, aNeed = rel(s, B1o(6.61)), aNow = rel(s, B1o(7.05));
  const scroll = fr < aNeed ? interpolate(fr, [aDoor, aLand], [0, 20 * YB], { ...clamp, easing: Easing.bezier(0.7, 0, 0.2, 1) })
    : interpolate(fr, [aNow, aNow + 9], [20 * YB, 0], { ...clamp, easing: Easing.bezier(0.6, 0, 0.2, 1) });
  const v = Math.abs(scroll - (fr < aNeed ? interpolate(fr - 1, [aDoor, aLand], [0, 20 * YB], { ...clamp, easing: Easing.bezier(0.7, 0, 0.2, 1) }) : interpolate(fr - 1, [aNow, aNow + 9], [20 * YB, 0], { ...clamp, easing: Easing.bezier(0.6, 0, 0.2, 1) })));
  const cy = Math.floor(scroll / YB); const years = [cy - 1, cy, cy + 1, cy + 2].filter((i) => i >= 0 && i <= 20);
  const ringK = ramp(fr, aLand + 8, 10, io);
  const chipK = ramp(fr, aLand + 14, 8, pop);
  const nov = { x: PX + 40 + MW * 1.5, y: PY + 270 + 3 * MH + 140 };
  const keys: Key[] = [[0, 540, nov.y - 60, 1.3], [aNeed - 2, 540, nov.y - 60, 1.3], [aNeed + 8, 540, PY + 330, 1.3], [200, 540, PY + 330, 1.3]];
  const nK = ramp(fr, aNeed, 9, Easing.bezier(0.2, 1.2, 0.4, 1));
  return <Cam vw={W} vh={SEAM} keys={keys}>
    <Phone>
      <div style={{ ...abs, left: 0, top: 0, width: SW, height: SH, filter: v > 40 ? `blur(${Math.min(10, v / 120)}px)` : undefined }}>
        {years.map((i) => <YearBlock key={i} y={2026 + i} top={i * YB - scroll} ringK={ringK} />)}
      </div>
      {fr >= aLand && scroll > 19 * YB && <div style={{ ...abs, left: 40 + MW - 10, top: 270 + 3 * MH + MH - 20 - (scroll - 20 * YB), padding: "10px 18px 10px 22px", borderRadius: 12, background: "rgba(255,59,48,.14)", borderLeft: "6px solid #FF3B30", fontFamily: IOSS, fontSize: 28, color: "#C4251C", transformOrigin: "0 0", transform: `scale(${chipK})`, whiteSpace: "nowrap" }}>Retirement <Em n="party" s={30} /> · 60 saal</div>}
      <div style={{ ...abs, left: 0, top: 0, width: SW, height: 118, background: "#fff" }}><StatusBar /></div>
      {fr >= aNeed && <div style={{ ...abs, left: 22, top: 20 + (1 - nK) * -220, width: SW - 44, height: 168, borderRadius: 46, background: "rgba(236,236,240,.97)", border: "1px solid rgba(0,0,0,.05)" }}>
        <div style={{ ...abs, left: 26, top: 38, width: 92, height: 92, borderRadius: 22, background: "linear-gradient(180deg,#67F27D,#0BBF2E)" }}>
          <svg width={92} height={92} viewBox="0 0 92 92"><ellipse cx={46} cy={44} rx={30} ry={25} fill="#fff" /><path d="M26 58c-2 8-6 12-10 14 8 0 14-3 18-7z" fill="#fff" /></svg>
        </div>
        <div style={{ ...abs, left: 142, top: 36, fontFamily: IOSS, fontSize: 32, color: "#000" }}>Papa</div>
        <div style={{ ...abs, right: 34, top: 38, fontFamily: IOS, fontSize: 26, color: "#6C6C70" }}>now</div>
        <div style={{ ...abs, left: 142, top: 80, width: 600, fontFamily: IOS, fontSize: 30, lineHeight: "38px", color: "#000" }}>Beta, thode paise bhej doge? <Em n="pray" s={32} /></div>
      </div>}
    </Phone>
  </Cam>;
};

// ---------- 3. Google: "ek simple sa sawaal" stack over the blurred page, then the question types and the camera rides the caret ----------
const GX = 70, GY = 840, GW = 940, GH = 96;
const SUG: [string, string][] = [["how to plan retirement at 40", ""], ["how to plan retirement at 40", " in india"], ["how much money do i need", " to retire"], ["retirement planning", " calculator india"], ["best retirement plan for", " 40 year old"]];
const Google = () => {
  const fr = useCurrentFrame(); const s = "plate"; const t = fr / FPS + SEG.plate[0];
  const sd = [B1o(9.49), B1o(9.81), B1o(10.33), B1o(10.47), B1o(10.79), B1o(11.13), B1o(11.41)];
  const stackOn = false;
  const blurK = 0;
  // word-synced typing: each word types fast from its spoken time
  const wt = [B1o(11.83), B1o(12.47), B1o(12.72), B1o(12.99), B1o(13.31), B1o(13.65)].map((x) => rel(s, x) - 1);
  const words = Q.split(" "); let n = 0; let start = 0;
  words.forEach((w, i) => { const typed = Math.max(0, Math.min(w.length + (i < words.length - 1 ? 1 : 0), (fr - wt[i]) * 1.6)); if (fr >= wt[i]) n = start + Math.floor(typed); start += w.length + 1; });
  n = Math.min(n, Q.length);
  const caretX = GX + 96 + QX[n];
  const focus = fr >= wt[0] - 4;
  const ddK = ramp(fr, wt[0] + 3, 6);
  const zOut = rel(s, B1o(14.11)) + 6;
  const follow = Math.max(500, Math.min(caretX - 100, GX + GW - 360));
  const keys: Key[] = [[0, 500, 860, 1.5], [zOut, 560, 860, 1.5], [zOut + 12, 540, 900, 1.5], [200, 540, 900, 1.5]];
  const camFollow = fr <= zOut ? follow : undefined;
  const c = camAt(fr, keys);
  const x0 = camFollow;
  return <AbsoluteFill style={{ background: "#fff" }}>
    <div style={{ ...abs, left: 0, top: 0, width: W, height: H, filter: blurK > 0.01 ? `blur(${18 * blurK}px)` : undefined, opacity: 1 - 0.6 * blurK, transform: `scale(${1 - 0.05 * blurK})` }}>
      <Cam vw={W} vh={H} keys={keys} x0={x0}>
        <div style={{ ...abs, left: 0, top: 0, width: W, height: H, background: "#fff" }}>
          <div style={{ ...abs, left: 40, top: 40, fontFamily: ARIAL, fontSize: 26, color: "#1F1F1F" }}>About&nbsp;&nbsp;&nbsp;&nbsp;Store</div>
          <div style={{ ...abs, right: 150, top: 40, fontFamily: ARIAL, fontSize: 26, color: "#1F1F1F" }}>Gmail&nbsp;&nbsp;&nbsp;&nbsp;Images</div>
          <svg style={{ ...abs, right: 96, top: 38 }} width={30} height={30} viewBox="0 0 30 30">{[0, 1, 2].flatMap((r) => [0, 1, 2].map((q) => <circle key={`${r}${q}`} cx={5 + q * 10} cy={5 + r * 10} r={3.2} fill="#5F6368" />))}</svg>
          <div style={{ ...abs, right: 30, top: 28, width: 50, height: 50, borderRadius: 25, background: "#7B5E57", color: "#fff", fontFamily: RBM, fontSize: 26, textAlign: "center", lineHeight: "50px" }}>P</div>
          <Img src={staticFile("google_logo.png")} style={{ ...abs, left: 540 - 204, top: 560, width: 408, height: 138 }} />
          <div style={{ ...abs, left: GX, top: GY, width: GW, height: focus ? GH + (5 * 66 + 24) * ddK : GH, borderRadius: focus && ddK > 0.05 ? 34 : 48, background: "#fff", border: "1px solid #DADCE0", boxShadow: focus ? "0 2px 10px 1px rgba(64,60,67,.22)" : undefined, overflow: "hidden" }}>
            <div style={{ ...abs, left: 30, top: 18, fontFamily: ARIAL, fontSize: 50, lineHeight: "56px", color: "#1F1F1F" }}>+</div>
            <div style={{ ...abs, left: 96, top: 28, fontFamily: ARIAL, fontSize: 34, color: "#1F1F1F", whiteSpace: "pre" }}>
              {Q.split("").map((ch, i) => <span key={i} style={{ opacity: i < n ? 1 : 0 }}>{ch}</span>)}
            </div>
            {focus && <div style={{ ...abs, left: 96 + QX[n], top: 24, width: 2, height: 44, background: "#1F1F1F", opacity: Math.floor(fr / 8) % 2 && n === Q.length ? 0 : 1 }} />}
            <div style={{ ...abs, right: 18, top: 18, height: 60, padding: "0 22px", borderRadius: 30, background: "#F1F3F4", fontFamily: ARIAL, fontSize: 26, color: "#1F1F1F", lineHeight: "60px" }}>AI Mode →</div>
            {focus && <div style={{ ...abs, left: 0, top: GH, width: GW, opacity: ddK }}>
              <div style={{ margin: "0 30px", height: 1, background: "#E8EAED" }} />
              {SUG.map(([a, b], i) => {
                const show = true;
                return <div key={i} style={{ height: 66, display: "flex", alignItems: "center", opacity: show ? 1 : 0.0 }}>
                  <svg style={{ marginLeft: 34, marginRight: 30 }} width={26} height={26} viewBox="0 0 24 24"><circle cx={10} cy={10} r={6.5} fill="none" stroke="#9AA0A6" strokeWidth={2.2} /><path d="m15 15 6 6" stroke="#9AA0A6" strokeWidth={2.2} strokeLinecap="round" /></svg>
                  <span style={{ fontFamily: ARIAL, fontSize: 30, color: "#1F1F1F" }}>{a}<b style={{ fontWeight: 700 }}>{b}</b></span>
                </div>;
              })}
            </div>}
          </div>
          <div style={{ ...abs, left: 0, top: GY + 170, width: W, textAlign: "center", opacity: focus ? 0 : 1 }}>
            {["Google Search", "I'm Feeling Lucky"].map((b) => <span key={b} style={{ display: "inline-block", margin: "0 10px", padding: "16px 28px", borderRadius: 8, background: "#F8F9FA", fontFamily: ARIAL, fontSize: 26, color: "#3C4043" }}>{b}</span>)}
          </div>
          <div style={{ ...abs, left: 0, top: GY + 290, width: W, textAlign: "center", fontFamily: ARIAL, fontSize: 24, color: "#4D5156", opacity: focus ? 0 : 1 }}>Google offered in: <span style={{ color: "#1A0DAB" }}>हिन्दी&nbsp; বাংলা&nbsp; తెలుగు&nbsp; मराठी&nbsp; தமிழ்</span></div>
        </div>
      </Cam>
    </div>
    {stackOn && <div style={{ ...abs, left: 90, top: 750, width: 900, height: 420, transform: `scale(${1 + 0.0012 * (fr - rel(s, sd[0]))})`, opacity: 1 - ramp(fr, rel(s, B1o(11.80)) - 4, 4) }}>
      {sd.map((w, i) => { const k = ramp(fr, rel(s, w) - 1, i === 3 ? 8 : 6, Easing.out(Easing.cubic)); if (k <= 0) return null;
        return <Img key={i} src={staticFile(`stack_w_${i}.png`)} style={{ ...abs, left: 0, top: 0, width: 900, height: 420, opacity: k, transform: `translateY(${(1 - k) * (i === 3 ? 40 : 24)}px)`, filter: k < 1 ? `blur(${(1 - k) * 8}px)` : undefined }} />; })}
    </div>}
  </AbsoluteFill>;
};

// ---------- 4. Google Sheets savings tracker: rows fill as the camera walks down, total counts up + highlighter, chart draws ----------
const AGES = [30, 31, 32, 33, 34, 35, 36, 37, 38];
const SAVE = [240000, 300000, 360000, 420000, 480000, 540000, 600000, 660000, 720000];
const CUM = SAVE.map((_, i) => SAVE.slice(0, i + 1).reduce((a, b) => a + b, 0));
const inr = (v: number) => { const s = Math.round(v).toString(); if (s.length <= 3) return s; const last = s.slice(-3); const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ","); return `${rest},${last}`; };
const COLS = [{ l: "A", w: 120 }, { l: "B", w: 130 }, { l: "C", w: 230 }, { l: "D", w: 250 }, { l: "E", w: 150 }, { l: "F", w: 150 }, { l: "G", w: 150 }, { l: "H", w: 150 }, { l: "I", w: 150 }];
const RX = 60, RH = 52, GTOP = 300; // grid origin (after row-number column), row height, grid top (column header)
const colX = (i: number) => RX + COLS.slice(0, i).reduce((a, c) => a + c.w, 0);
const Sheets = () => {
  const fr = useCurrentFrame(); const s = "saved";
  const r0 = rel(s, B2o(9.10)), r1 = rel(s, B2o(10.86)), aTot = rel(s, B2o(11.00)), aHl = rel(s, B2o(11.48)), aOut = rel(s, B2o(11.76));
  const rowAt = AGES.map((_, i) => r0 + Math.round(((r1 - r0) * i) / (AGES.length - 1)));
  const filled = rowAt.filter((a) => fr >= a).length;
  const active = fr >= aTot ? 11 : Math.max(2, filled + 1);
  const totK = ramp(fr, aTot, 10, Easing.out(Easing.quad));
  const hlK = ramp(fr, aHl, 8, Easing.inOut(Easing.cubic));
  const chK = ramp(fr, aOut + 4, 20, Easing.inOut(Easing.cubic));
  const rowY = (r: number) => GTOP + 34 + (r - 1) * RH; // r = 1-based sheet row
  const cellX = colX(3) + COLS[3].w / 2;
  const followY = rowY(active) + RH / 2;
  const keys: Key[] = [[0, 430, 400, 1.42], [r0 - 4, 430, 430, 1.42], [r1, 440, rowY(10), 1.42], [aTot, 470, rowY(11) + 10, 1.42], [aOut, 480, rowY(11) - 40, 1.42], [aOut + 12, colX(4) + 380, rowY(1) + 245, 1.42], [160, colX(4) + 390, rowY(1) + 250, 1.42]];
  const yFollow = fr > r0 - 4 && fr < r1 ? interpolate(fr, [r0 - 4, r0 + 4], [430, followY], clamp) : undefined;
  const sel = { x: colX(3), y: rowY(active), w: COLS[3].w, h: RH };
  const chart = { x: colX(4) + 40, y: rowY(1) + 10, w: 680, h: 470 };
  const pts = CUM.map((v, i) => [40 + (i * (chart.w - 80)) / 8, chart.h - 60 - (v / 4800000) * (chart.h - 130)]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  const area = `${line} L${pts[8][0]},${chart.h - 60} L${pts[0][0]},${chart.h - 60} Z`;
  return <Cam vw={W} vh={SEAM} keys={keys} y0={yFollow}>
    <div style={{ ...abs, left: -400, top: -400, width: 2600, height: 2000, background: "#F9FBFD" }} />
    <div style={{ ...abs, left: 0, top: 0, width: 1620, height: 1100, background: "#F9FBFD" }}>
      <Img src={staticFile("sheets_icon.png")} style={{ ...abs, left: 24, top: 22, width: 44, height: 60 * 44 / 48 }} />
      <div style={{ ...abs, left: 86, top: 18, fontFamily: RB, fontSize: 28, color: "#1F1F1F" }}>Savings tracker</div>
      <div style={{ ...abs, left: 86, top: 58, fontFamily: RB, fontSize: 21, color: "#444746", wordSpacing: 14 }}>File Edit View Insert Format Data Tools Extensions Help</div>
      <div style={{ ...abs, right: 40, top: 22, height: 56, padding: "0 30px", borderRadius: 28, background: "#C2E7FF", fontFamily: RBM, fontSize: 24, color: "#001D35", lineHeight: "56px" }}>Share</div>
      <div style={{ ...abs, left: 16, top: 104, width: 1590, height: 56, borderRadius: 28, background: "#EDF2FA", fontFamily: RB, fontSize: 22, color: "#444746", lineHeight: "56px", paddingLeft: 30, boxSizing: "border-box", wordSpacing: 22 }}>↶ ↷ 100% ▾ ₹ % .0 .00 123 Default ▾ − 10 + <b>B</b> <i>I</i> S A</div>
      <div style={{ ...abs, left: 0, top: 176, width: 1620, height: 52, background: "#fff", borderTop: "1px solid #C7C7C7", borderBottom: "1px solid #C7C7C7" }}>
        <div style={{ ...abs, left: 16, top: 10, width: 120, fontFamily: RB, fontSize: 22, color: "#1F1F1F" }}>D{active}</div>
        <div style={{ ...abs, left: 150, top: 8, fontFamily: RB, fontSize: 22, color: "#5F6368", fontStyle: "italic" }}>fx</div>
        <div style={{ ...abs, left: 200, top: 10, fontFamily: RB, fontSize: 22, color: "#1F1F1F" }}>{active === 11 ? "=SUM(C2:C10)" : active - 1 <= 9 && fr >= rowAt[Math.min(8, active - 2)] ? `=D${active - 1}+C${active}` : ""}</div>
      </div>
      {/* grid */}
      <div style={{ ...abs, left: 0, top: GTOP, width: 1620, height: 800, background: "#fff" }} />
      <div style={{ ...abs, left: 0, top: GTOP, width: 1620, height: 34, background: "#F8F9FA", borderBottom: "1px solid #C7C7C7" }} />
      {COLS.map((c, i) => <div key={c.l} style={{ ...abs, left: colX(i), top: GTOP, width: c.w, height: 34, borderLeft: "1px solid #C7C7C7", fontFamily: RB, fontSize: 19, color: i === 3 ? "#0B57D0" : "#444746", background: i === 3 ? "#D3E3FD" : undefined, textAlign: "center", lineHeight: "34px" }}>{c.l}</div>)}
      {Array.from({ length: 14 }, (_, r) => <div key={r} style={{ ...abs, left: 0, top: rowY(r + 1), width: RX, height: RH, background: r + 1 === active ? "#D3E3FD" : "#F8F9FA", borderBottom: "1px solid #E1E1E1", borderRight: "1px solid #C7C7C7", fontFamily: RB, fontSize: 19, color: r + 1 === active ? "#0B57D0" : "#444746", textAlign: "center", lineHeight: `${RH}px` }}>{r + 1}</div>)}
      {Array.from({ length: 14 }, (_, r) => <div key={r} style={{ ...abs, left: RX, top: rowY(r + 1) + RH - 1, width: 1560, height: 1, background: "#E1E1E1" }} />)}
      {COLS.map((c, i) => <div key={c.l} style={{ ...abs, left: colX(i) + c.w - 1, top: rowY(1), width: 1, height: 14 * RH, background: "#E1E1E1" }} />)}
      {/* header row */}
      {["Age", "Year", "Saved (₹)", "Total (₹)"].map((h, i) => <div key={h} style={{ ...abs, left: colX(i) + 12, top: rowY(1), width: COLS[i].w - 24, height: RH, fontFamily: RBM, fontSize: 23, color: "#1F1F1F", lineHeight: `${RH}px`, textAlign: i >= 2 ? "right" : "left" }}>{h}</div>)}
      {AGES.map((a, i) => {
        if (fr < rowAt[i]) return null; const k = ramp(fr, rowAt[i], 3);
        const cell = (col: number, v: string, right: boolean) => <div style={{ ...abs, left: colX(col) + 12, top: rowY(i + 2), width: COLS[col].w - 24, height: RH, fontFamily: RB, fontSize: 23, color: "#1F1F1F", lineHeight: `${RH}px`, textAlign: right ? "right" : "left", opacity: k }}>{v}</div>;
        return <React.Fragment key={a}>{cell(0, `${a}`, true)}{cell(1, `${2016 + i}`, true)}{cell(2, inr(SAVE[i]), true)}{cell(3, inr(CUM[i]), true)}</React.Fragment>;
      })}
      {fr >= aTot && <>
        <div style={{ ...abs, left: colX(0) + 12, top: rowY(11), height: RH, fontFamily: RBM, fontSize: 23, color: "#1F1F1F", lineHeight: `${RH}px` }}>Total</div>
        <div style={{ ...abs, left: colX(3) + 6, top: rowY(11) + 8, width: (COLS[3].w - 12) * hlK, height: RH - 16, background: "rgba(255,221,0,.75)", borderRadius: 3 }} />
        <div style={{ ...abs, left: colX(3) + 12, top: rowY(11), width: COLS[3].w - 24, height: RH, fontFamily: RBM, fontSize: 24, color: "#1F1F1F", lineHeight: `${RH}px`, textAlign: "right" }}>₹{inr(CUM[8] * totK)}</div>
      </>}
      <div style={{ ...abs, left: sel.x - 1, top: sel.y - 1, width: sel.w, height: sel.h, border: "3px solid #1A73E8", boxSizing: "border-box" }}>
        <div style={{ ...abs, right: -6, bottom: -6, width: 9, height: 9, background: "#1A73E8", border: "2px solid #fff" }} />
      </div>
      {/* embedded chart (Sheets style) */}
      {fr >= aOut && <div style={{ ...abs, left: chart.x, top: chart.y, width: chart.w, height: chart.h, background: "#fff", border: "1px solid #DADCE0", opacity: ramp(fr, aOut, 5) }}>
        <div style={{ ...abs, left: 24, top: 16, fontFamily: RB, fontSize: 24, color: "#1F1F1F" }}>Total savings by age</div>
        <svg width={chart.w} height={chart.h} style={{ ...abs, left: 0, top: 0 }}>
          {[0, 1, 2, 3].map((g) => { const y = chart.h - 60 - g * ((chart.h - 130) / 3); return <g key={g}><line x1={40} x2={chart.w - 30} y1={y} y2={y} stroke="#E8EAED" strokeWidth={1.5} /><text x={30} y={y + 6} fontSize={19} fill="#5F6368" textAnchor="end" fontFamily={RB}>{["0", "16L", "32L", "48L"][g]}</text></g>; })}
          {AGES.map((a, i) => <text key={a} x={pts[i][0]} y={chart.h - 32} fontSize={19} fill="#5F6368" textAnchor="middle" fontFamily={RB}>{a}</text>)}
          <clipPath id="clip"><rect x={0} y={0} width={40 + (chart.w - 70) * chK} height={chart.h} /></clipPath>
          <g clipPath="url(#clip)"><path d={area} fill="#4285F4" fillOpacity={0.22} /><path d={line} fill="none" stroke="#4285F4" strokeWidth={4} strokeLinejoin="round" /></g>
        </svg>
      </div>}
    </div>
  </Cam>;
};

// ---------- 5. Google Calendar event: "Retirement planning", rescheduled for years, only the organiser ----------
const DATES = ["Saturday, 16 March 2019", "Sunday, 14 March 2021", "Saturday, 18 March 2023", "Sunday, 16 March 2025"];
const Ico = ({ d }: { d: string }) => <svg width={34} height={34} viewBox="0 0 24 24"><path d={d} fill="none" stroke="#444746" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" /></svg>;
const GCal = () => {
  const fr = useCurrentFrame(); const s = "chairs";
  const strikeAt = [rel(s, B2o(15.91)), rel(s, B2o(16.61)), rel(s, B2o(17.29)), rel(s, B2o(17.75))];
  const showAt = [0, strikeAt[0] + 5, strikeAt[1] + 5, strikeAt[2] + 5];
  const aOut = rel(s, B2o(18.07));
  const n = showAt.filter((a) => fr >= a).length;
  const LH = 52, top0 = 300;
  const keys: Key[] = [[0, 520, 330, 1.3], [showAt[1], 520, top0 + LH + 30, 1.3], [showAt[2], 520, top0 + 2 * LH + 30, 1.3], [showAt[3], 520, top0 + 3 * LH + 30, 1.3], [aOut, 520, top0 + 3 * LH + 40, 1.3], [aOut + 16, 520, 520, 1.3], [120, 520, 520, 1.3]];
  return <Cam vw={W} vh={SEAM} keys={keys}>
    <div style={{ ...abs, left: -500, top: -500, width: 2100, height: 2000, background: "#fff" }} />
    <div style={{ ...abs, left: 90, top: 90, width: 900, height: 230 + n * LH + 330, borderRadius: 28, background: "#F0F4F9" }}>
      <div style={{ ...abs, right: 30, top: 26, display: "flex", gap: 34 }}>
        {["M4 20h4L19 9l-4-4L4 16z", "M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13", "M3 6h18v12H3zM3 6l9 7 9-7", "M12 5v.01M12 12v.01M12 19v.01", "M6 6l12 12M18 6 6 18"].map((d) => <Ico key={d} d={d} />)}
      </div>
      <div style={{ ...abs, left: 48, top: 112, width: 30, height: 30, borderRadius: 7, background: "#039BE5" }} />
      <div style={{ ...abs, left: 110, top: 96, fontFamily: RB, fontSize: 48, color: "#1F1F1F" }}>Retirement planning</div>
      {DATES.map((d, i) => {
        if (fr < showAt[i]) return null; const k = ramp(fr, showAt[i], 6);
        const sk = fr >= strikeAt[i] ? ramp(fr, strikeAt[i], 6, Easing.inOut(Easing.cubic)) : 0;
        const txt = `${d}  ·  11:00 – 12:00pm`;
        return <div key={i} style={{ ...abs, left: 110, top: 176 + i * LH + (1 - k) * 20, opacity: (sk > 0.99 ? 0.42 : 1) * k, fontFamily: RB, fontSize: 30, color: "#444746", whiteSpace: "nowrap" }}>
          {txt}
          <div style={{ ...abs, left: -4, top: 19, width: `${sk * 103}%`, height: 4, background: "#D93025", borderRadius: 2 }} />
        </div>;
      })}
      <div style={{ ...abs, left: 110, top: 176 + n * LH + 4, fontFamily: RB, fontSize: 26, color: "#444746", opacity: n >= 2 ? 1 : 0 }}>Rescheduled {Math.max(0, n - 1)}×</div>
      {[["M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6zM10 19a2 2 0 0 0 4 0", "30 minutes before"], ["M4 5h16v15H4zM4 9h16M9 3v4M15 3v4", "Prashant"], ["M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a7 7 0 0 1 14 0v1", "1 guest  ·  Prashant (organiser)"]].map(([d, l], i) => (
        <div key={l} style={{ ...abs, left: 40, top: 250 + n * LH + i * 76, display: "flex", alignItems: "center", gap: 34 }}><Ico d={d} /><span style={{ fontFamily: RB, fontSize: 30, color: "#1F1F1F" }}>{l}</span></div>
      ))}
    </div>
  </Cam>;
};


// ======================= v5: rest of the script (lines 6–12 + CTA) =======================
const MORN = "Morn";
const Safari = ({ children, url, overlay }: { children: React.ReactNode; url: string; overlay?: React.ReactNode }) => (
  <Phone>
    <div style={{ ...abs, left: 0, top: 0, width: SW, height: SH, background: "#fff" }}>{children}</div>
    <div style={{ ...abs, left: 0, top: 0, width: SW, height: 118, background: "#fff" }}><StatusBar /></div>
    <div style={{ ...abs, left: 0, top: SH - 190, width: SW, height: 190, background: "#F7F7F8", borderTop: "1px solid #D8D8DC" }}>
      <div style={{ ...abs, left: 30, top: 18, width: SW - 60, height: 80, borderRadius: 24, background: "#fff", border: "1px solid #DADADF", textAlign: "center", fontFamily: IOS, fontSize: 30, lineHeight: "80px", color: "#111" }}>
        <svg width={22} height={26} viewBox="0 0 22 26" style={{ marginRight: 10, verticalAlign: "-3px" }}><rect x={2} y={11} width={18} height={14} rx={3} fill="#555" /><path d="M6 11V8a5 5 0 0 1 10 0v3" fill="none" stroke="#555" strokeWidth={2.6} /></svg>{url}
      </div>
    </div>
    {overlay}
  </Phone>
);
// Wealthometry mobile site (rebuilt from wealthometry.in: Morn type, black/white, beige band)
const WmSite = ({ hlK = 0, press = 0 }: { hlK?: number; press?: number }) => (
  <Safari url="wealthometry.in">
    <Img src={staticFile("wm_logo_t.png")} style={{ ...abs, left: 34, top: 132, width: 190, height: 190 * 909 / 1576 }} />
    <svg style={{ ...abs, left: 716, top: 172 }} width={56} height={40} viewBox="0 0 56 40"><path d="M4 6h48M4 20h48M4 34h48" stroke="#111" strokeWidth={4.4} strokeLinecap="round" /></svg>
    <div style={{ ...abs, left: 32, top: 316, width: 560 * Math.min(1, hlK * 2), height: 82, background: "rgba(255,214,0,.75)", borderRadius: 4 }} />
    <div style={{ ...abs, left: 32, top: 406, width: 505 * Math.max(0, hlK * 2 - 1), height: 82, background: "rgba(255,214,0,.75)", borderRadius: 4 }} />
    <div style={{ ...abs, left: 40, top: 300, width: 740, fontFamily: MORN, fontSize: 76, lineHeight: "90px", color: "#111", letterSpacing: "-0.01em" }}>
Crafting Wealth With Discipline For Leaders of the Future
    </div>
    <div style={{ ...abs, left: 40, top: 760, width: 740, height: 92, borderRadius: 14, background: press > 0.5 ? "#111" : "#fff", border: "2.5px solid #111", boxSizing: "border-box", fontFamily: MORN, fontSize: 32, color: press > 0.5 ? "#fff" : "#111", textAlign: "center", lineHeight: "88px", transform: `scale(${1 - 0.04 * Math.sin(Math.PI * Math.min(1, press))})` }}>Schedule My Appointment</div>
  </Safari>
);
const Site = () => {
  const fr = useCurrentFrame(); const s = "site";
  const aBrand = rel(s, B3o(0.90)), aFirm = rel(s, B3o(2.72));
  const keys: Key[] = [[0, 540, 740, 1.3], [aBrand, 540, 740, 1.3], [aBrand + 12, 540, 800, 1.3], [130, 540, 820, 1.3]];
  return <AbsoluteFill style={{ background: "#fff" }}><Cam vw={W} vh={H} keys={keys}><WmSite hlK={ramp(fr, aFirm, 12, Easing.inOut(Easing.cubic))} /></Cam></AbsoluteFill>;
};
// typed text with a caret (per-character spans keep raea's layout fixed)
const Typed = ({ text, at, cps = 1.4, font, size, color = "#202124", caret = true }: { text: string; at: number; cps?: number; font: string; size: number; color?: string; caret?: boolean }) => {
  const fr = useCurrentFrame(); const n = Math.max(0, Math.min(text.length, Math.floor((fr - at) * cps)));
  return <span style={{ fontFamily: font, fontSize: size, color, whiteSpace: "pre" }}>{text.split("").map((c, i) => <span key={i} style={{ opacity: i < n ? 1 : 0 }}>{c}</span>)}
    {caret && fr >= at - 6 && fr < at + text.length / cps + 18 && <span style={{ ...abs, marginLeft: -0, width: 3, height: size * 1.1, background: "#673AB7" }} />}</span>;
};
// Google Forms intake (fields fill on the words; the camera pans down at one zoom)
const Form = () => {
  const fr = useCurrentFrame(); const s = "form";
  const q1 = rel(s, B4o(2.60)), q2 = rel(s, B4o(4.22)), q3 = rel(s, B4o(6.80)), sub = rel(s, B4o(8.80));
  const QS: [string, string, number][] = [["Ab tak kitna save kiya hai?", "₹ 45,00,000", q1], ["Current monthly expenses?", "₹ 85,000", q2], ["Kis umar mein kaam band karna chahte ho?", "55", q3]];
  const cardY = (i: number) => 330 + i * 270;
  const keys: Key[] = [[0, 540, 330, 1.3], [q1 - 8, 540, 360, 1.3], [q2 - 6, 540, cardY(1) + 110, 1.3], [q3 - 6, 540, cardY(2) + 110, 1.3], [sub - 6, 540, cardY(2) + 230, 1.3], [300, 540, cardY(2) + 240, 1.3]];
  const subK = ramp(fr, sub + 8, 6);
  return <Cam vw={W} vh={SEAM} keys={keys}>
    <div style={{ ...abs, left: -300, top: -300, width: 1700, height: 2000, background: "#F0EBF8" }} />
    <div style={{ ...abs, left: 90, top: 40, width: 900, height: 260, borderRadius: 16, background: "#fff", border: "1px solid #DADCE0", overflow: "hidden" }}>
      <div style={{ height: 14, background: "#673AB7" }} />
      <div style={{ padding: "26px 40px", fontFamily: RB, fontSize: 52, color: "#202124" }}>Retirement planning: intake</div>
      <div style={{ padding: "0 40px", fontFamily: RB, fontSize: 26, color: "#5F6368" }}>Wealthometry · 2 minute form · <span style={{ color: "#D93025" }}>* Required</span></div>
    </div>
    {QS.map(([q, a, at], i) => {
      const act = fr >= at - 6 && (i === 2 ? fr < sub : fr < QS[i + 1][2] - 6);
      return <div key={q} style={{ ...abs, left: 90, top: cardY(i), width: 900, height: 240, borderRadius: 16, background: "#fff", border: "1px solid #DADCE0", borderLeft: act ? "8px solid #4285F4" : "1px solid #DADCE0", boxSizing: "border-box" }}>
        <div style={{ ...abs, left: 40, top: 34, fontFamily: RB, fontSize: 32, color: "#202124" }}>{q} <span style={{ color: "#D93025" }}>*</span></div>
        <div style={{ ...abs, left: 40, top: 120, width: 520, height: 60 }}><Typed text={a} at={at} font={RB} size={34} /></div>
        <div style={{ ...abs, left: 40, top: 178, width: 520, height: act ? 3 : 1.5, background: act ? "#673AB7" : "#BDC1C6" }} />
      </div>;
    })}
    <div style={{ ...abs, left: 90, top: cardY(3) + 10, width: 170, height: 76, borderRadius: 8, background: subK > 0.5 ? "#5E35B1" : "#673AB7", fontFamily: RBM, fontSize: 30, color: "#fff", textAlign: "center", lineHeight: "76px", transform: `scale(${1 - 0.06 * Math.sin(Math.PI * subK)})` }}>Submit</div>
    {fr >= sub + 8 && <div style={{ ...abs, left: 175 - 60 * subK, top: cardY(3) + 48 - 60 * subK, width: 120 * subK, height: 120 * subK, borderRadius: 999, background: `rgba(255,255,255,${0.45 * (1 - subK)})` }} />}
  </Cam>;
};
// The written plan as a PDF in Chrome's viewer: camera walks the three numbers, a highlighter on each
const Pdf = () => {
  const fr = useCurrentFrame(); const s = "pdf";
  const aPlan = rel(s, B5o(1.23)), aNum = rel(s, B5o(2.69)), aDate = rel(s, B5o(3.76)), aMon = rel(s, B5o(5.61));
  const rowY = [640, 900, 1160];
  const keys: Key[] = [[0, 540, 760, 1.1], [aPlan, 540, 770, 1.1], [aNum - 6, 540, rowY[0] + 240, 1.1], [aDate - 6, 540, rowY[1] + 240, 1.1], [aMon - 6, 540, rowY[2] + 200, 1.1], [260, 540, rowY[2] + 220, 1.1]];
  const ST: [string, string, string, number][] = [["Your number", "₹3.2 Cr", "the corpus you need to retire", aNum], ["Your date", "April 2041", "you can stop working at 55", aDate], ["Every month, after tax", "₹1,45,000", "what you can safely withdraw", aMon]];
  const monK = ramp(fr, aMon, 14, Easing.out(Easing.quad));
  return <AbsoluteFill style={{ background: "#525659" }}>
    <Cam vw={W} vh={H} keys={keys}>
      <div style={{ ...abs, left: -400, top: -400, width: 1900, height: 2900, background: "#525659" }} />
      <div style={{ ...abs, left: -400, top: 0, width: 1900, height: 110, background: "#323639" }} />
      <div style={{ ...abs, left: 40, top: 32, fontFamily: RB, fontSize: 30, color: "#F1F3F4" }}>Retirement_Plan_Prashant.pdf</div>
      <div style={{ ...abs, left: 70, top: 160, width: 940, height: 1260, background: "#fff" }}>
        <Img src={staticFile("wm_logo_t.png")} style={{ ...abs, left: 60, top: 54, width: 150, height: 150 * 909 / 1576 }} />
        <div style={{ ...abs, left: 60, top: 200, fontFamily: MORN, fontSize: 64, color: "#111" }}>Your Retirement Plan</div>
        <div style={{ ...abs, left: 60, top: 310, width: 820, height: 2, background: "#111" }} />
        {ST.map(([l, v, d, a], i) => {
          const hl = ramp(fr, a + 2, 9, Easing.inOut(Easing.cubic)); const y = rowY[i] - 160;
          return <div key={l} style={{ ...abs, left: 60, top: y, width: 820, height: 230, borderBottom: "1px solid #DADCE0" }}>
            <div style={{ ...abs, left: 0, top: 26, fontFamily: RB, fontSize: 26, color: "#5F6368", letterSpacing: "0.04em" }}>{l.toUpperCase()}</div>
            <div style={{ ...abs, left: -8, top: 74, height: 96, width: 560 * hl, background: "rgba(255,214,0,.7)", borderRadius: 4 }} />
            <div style={{ ...abs, left: 0, top: 70, fontFamily: MORN, fontSize: 86, color: "#111" }}>{i === 2 && fr >= aMon ? `₹${inr(145000 * monK)}` : v}</div>
          </div>;
        })}
      </div>
    </Cam>
  </AbsoluteFill>;
};
// iOS Messages: monthly credits from the Safe Bucket arrive one after another
const SMS: [string, string, number][] = [["Thu, 1 May at 9:00 AM", "May", -99]];
const Sms = () => {
  const fr = useCurrentFrame(); const s = "sms";
  const at = [-99, rel(s, B6o(3.36)), rel(s, B6o(4.46)), rel(s, B6o(5.22)), rel(s, B6o(6.12))];
  const mon = ["May", "Jun", "Jul", "Aug", "Sep"]; const day = ["Thu", "Sun", "Tue", "Fri", "Mon"];
  const H0 = 230, BOT = 1560;
  const ys = at.map((_, i) => BOT - at.slice(i + 1).reduce((acc, a) => acc + H0 * ramp(fr, a, 4), 0));
  const keys: Key[] = [[0, 540, 1350, 1.3], [at[1], 540, 1380, 1.3], [200, 540, 1400, 1.3]];
  void SMS;
  return <Cam vw={W} vh={SEAM} keys={keys}>
    <Phone>
      {at.map((a, i) => {
        if (fr < a) return null; const k = ramp(fr, a + 2, 6, pop);
        return <div key={i} style={{ ...abs, left: 0, top: ys[i] - H0, width: SW, height: H0, opacity: i === 0 ? 1 : ramp(fr, a + 2, 3), transformOrigin: "0 100%", transform: `scale(${i === 0 ? 1 : 0.85 + 0.15 * k})` }}>
          <div style={{ ...abs, left: 0, top: 0, width: SW, textAlign: "center", fontFamily: IOS, fontSize: 22, color: "#8E8E93" }}><b style={{ fontFamily: IOSS }}>{day[i]}, 1 {mon[i]}</b> at 9:00 AM</div>
          <div style={{ ...abs, left: 30, top: 40, width: 600, padding: "18px 26px", borderRadius: 34, background: "#E9E9EB", fontFamily: IOS, fontSize: 30, lineHeight: "40px", color: "#000", boxSizing: "border-box" }}>
            <b style={{ fontFamily: IOSS }}>₹1,45,000 credited</b> to A/c XX4821. Monthly income from your Safe Bucket. -Wealthometry
          </div>
        </div>;
      })}
      <div style={{ ...abs, left: 0, top: 0, width: SW, height: 300, background: "#F6F6F6", borderBottom: "1px solid #D1D1D6" }}>
        <StatusBar />
        <svg style={{ ...abs, left: 22, top: 140 }} width={26} height={44} viewBox="0 0 26 44"><path d="M22 4 4 22l18 18" fill="none" stroke="#007AFF" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" /></svg>
        <div style={{ ...abs, left: SW / 2 - 50, top: 124, width: 100, height: 100, borderRadius: 50, background: "linear-gradient(180deg,#A5ABB8,#858B98)", fontFamily: IOSS, fontSize: 40, color: "#fff", textAlign: "center", lineHeight: "100px" }}>W</div>
        <div style={{ ...abs, left: 0, top: 236, width: SW, textAlign: "center", fontFamily: IOS, fontSize: 26, color: "#000" }}>AD-WMSAFE ›</div>
      </div>
      <div style={{ ...abs, left: 0, top: 1620, width: SW, height: 156, background: "#fff" }}>
        <div style={{ ...abs, left: 30, top: 20, width: SW - 60, height: 70, borderRadius: 35, border: "1.5px solid #C7C7CC", fontFamily: IOS, fontSize: 28, color: "#8E8E93", lineHeight: "70px", paddingLeft: 30, boxSizing: "border-box" }}>This sender does not accept replies</div>
      </div>
    </Phone>
  </Cam>;
};
const Banner = ({ k, title, body }: { k: number; title: string; body: React.ReactNode }) => (
  <div style={{ ...abs, left: 22, top: 20 + (1 - k) * -230, width: SW - 44, height: 168, borderRadius: 46, background: "rgba(236,236,240,.97)", border: "1px solid rgba(0,0,0,.05)" }}>
    <div style={{ ...abs, left: 26, top: 38, width: 92, height: 92, borderRadius: 22, background: "linear-gradient(180deg,#67F27D,#0BBF2E)" }}>
      <svg width={92} height={92} viewBox="0 0 92 92"><ellipse cx={46} cy={44} rx={30} ry={25} fill="#fff" /><path d="M26 58c-2 8-6 12-10 14 8 0 14-3 18-7z" fill="#fff" /></svg>
    </div>
    <div style={{ ...abs, left: 142, top: 36, fontFamily: IOSS, fontSize: 32, color: "#000" }}>{title}</div>
    <div style={{ ...abs, right: 34, top: 38, fontFamily: IOS, fontSize: 26, color: "#6C6C70" }}>now</div>
    <div style={{ ...abs, left: 142, top: 80, width: 600, fontFamily: IOS, fontSize: 30, lineHeight: "38px", color: "#000", whiteSpace: "nowrap" }}>{body}</div>
  </div>
);
// Google (phone): "sensex today" — the market card falls; the Safe Bucket credit still lands
const Market = () => {
  const fr = useCurrentFrame(); const s = "market";
  const aFall = rel(s, B6o(7.88)), aSell = rel(s, B6o(9.30));
  const chK = ramp(fr, aFall - 4, 26, Easing.inOut(Easing.quad));
  const P = Array.from({ length: 40 }, (_, i) => { const x = i / 39; return 73458 - 2213 * Math.pow(x, 1.4) + 260 * Math.sin(i * 1.7) * (1 - x * 0.5); });
  const cw = 740, ch = 300; const mn = 71000, mx = 73800;
  const pts = P.map((v, i) => [ (i / 39) * cw, ch - ((v - mn) / (mx - mn)) * ch ]);
  const n = Math.max(2, Math.ceil(chK * 40));
  const line = pts.slice(0, n).map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const cur = P[n - 1]; const chg = cur - 73458;
  const keys: Key[] = [[0, 540, 760, 1.25], [aSell - 6, 540, 760, 1.25], [aSell + 4, 540, 520, 1.25], [140, 540, 520, 1.25]];
  return <AbsoluteFill style={{ background: "#fff" }}><Cam vw={W} vh={H} keys={keys}>
    <Safari url="google.com" overlay={fr >= aSell ? <Banner k={ramp(fr, aSell, 9, Easing.bezier(0.2, 1.2, 0.4, 1))} title="AD-WMSAFE" body={<><b style={{ fontFamily: IOSS }}>₹1,45,000 credited</b> · Safe Bucket</>} /> : null}>
      <Img src={staticFile("google_logo.png")} style={{ ...abs, left: SW / 2 - 110, top: 140, width: 220, height: 74 }} />
      <div style={{ ...abs, left: 30, top: 240, width: SW - 60, height: 92, borderRadius: 46, border: "1px solid #DADCE0", fontFamily: ARIAL, fontSize: 32, lineHeight: "90px", paddingLeft: 40, boxSizing: "border-box", color: "#202124" }}>sensex today</div>
      <div style={{ ...abs, left: 30, top: 380, fontFamily: ARIAL, fontSize: 26, color: "#5F6368" }}>Market Summary › <span style={{ color: "#202124" }}>BSE SENSEX</span></div>
      <div style={{ ...abs, left: 30, top: 440, fontFamily: ARIAL, fontSize: 82, color: "#202124" }}>{Math.round(cur).toLocaleString("en-IN")}<span style={{ fontSize: 30, color: "#5F6368" }}> INR</span></div>
      <div style={{ ...abs, left: 30, top: 548, fontFamily: ARIAL, fontSize: 30, color: "#D93025" }}>{chg.toFixed(2)} ({(chg / 734.58).toFixed(2)}%) ↓ today</div>
      <svg style={{ ...abs, left: 40, top: 640 }} width={cw} height={ch + 40}>
        <line x1={0} x2={cw} y1={ch - ((73458 - mn) / (mx - mn)) * ch} y2={ch - ((73458 - mn) / (mx - mn)) * ch} stroke="#9AA0A6" strokeDasharray="6 8" strokeWidth={2} />
        <path d={`${line} L${pts[n - 1][0]},${ch} L0,${ch} Z`} fill="#D93025" fillOpacity={0.1} />
        <path d={line} fill="none" stroke="#D93025" strokeWidth={4} strokeLinejoin="round" />
      </svg>
      <div style={{ ...abs, left: 40, top: 1010, width: cw, display: "flex", justifyContent: "space-between", fontFamily: ARIAL, fontSize: 26, color: "#5F6368" }}>{["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y", "Max"].map((t, i) => <span key={t} style={{ color: i === 0 ? "#1A73E8" : undefined, borderBottom: i === 0 ? "3px solid #1A73E8" : undefined, paddingBottom: 6 }}>{t}</span>)}</div>
    </Safari>
  </Cam></AbsoluteFill>;
};
// Google Calendar: the annual review that actually happens (callback to the rescheduled card)
const Review = () => {
  const fr = useCurrentFrame(); const s = "review";
  const aApr = rel(s, B7o(0.66)), aWith = rel(s, B7o(1.72)), aRev = rel(s, B7o(2.90)), aTrack = rel(s, B7o(6.60));
  const keys: Key[] = [[0, 520, 250, 1.3], [aWith - 4, 520, 260, 1.3], [aWith + 8, 520, 470, 1.3], [aTrack - 10, 520, 520, 1.3], [aTrack + 4, 520, 600, 1.3], [300, 520, 610, 1.3]];
  const gK = ramp(fr, aWith, 6, pop); const tK = ramp(fr, aTrack, 7, pop);
  return <Cam vw={W} vh={SEAM} keys={keys}>
    <div style={{ ...abs, left: -500, top: -500, width: 2100, height: 2200, background: "#fff" }} />
    <div style={{ ...abs, left: 90, top: 70, width: 900, height: 760, borderRadius: 28, background: "#F0F4F9" }}>
      <div style={{ ...abs, right: 30, top: 26, display: "flex", gap: 34 }}>
        {["M4 20h4L19 9l-4-4L4 16z", "M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13", "M3 6h18v12H3zM3 6l9 7 9-7", "M12 5v.01M12 12v.01M12 19v.01", "M6 6l12 12M18 6 6 18"].map((d) => <Ico key={d} d={d} />)}
      </div>
      <div style={{ ...abs, left: 48, top: 112, width: 30, height: 30, borderRadius: 7, background: "#0B8043" }} />
      <div style={{ ...abs, left: 110, top: 96, fontFamily: RB, fontSize: 48, color: "#1F1F1F" }}>Annual plan review</div>
      <div style={{ ...abs, left: 110, top: 176, fontFamily: RB, fontSize: 30, color: "#444746", opacity: ramp(fr, aApr, 5) }}>Saturday, 3 April 2027  ·  11:00 – 12:00pm</div>
      <div style={{ ...abs, left: 110, top: 222, fontFamily: RB, fontSize: 28, color: "#444746", opacity: ramp(fr, aApr + 4, 5) }}>Annually on the first Saturday of April</div>
      <div style={{ ...abs, left: 40, top: 300, display: "flex", alignItems: "center", gap: 34 }}><Ico d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a7 7 0 0 1 14 0v1M17 11a3 3 0 1 0 0-6M22 21v-1a6 6 0 0 0-4-5.6" /><span style={{ fontFamily: RB, fontSize: 30, color: "#1F1F1F" }}>2 guests  ·  <span style={{ color: "#188038" }}>2 yes</span></span></div>
      {[["P", "#7B5E57", "Prashant", "Organiser"], ["W", "#111", "Advisor · Wealthometry", "Accepted"]].map(([i, c, n, r], j) => (
        <div key={n} style={{ ...abs, left: 108, top: 370 + j * 84, display: "flex", alignItems: "center", gap: 22, opacity: j === 0 ? 1 : gK, transform: j === 0 ? undefined : `translateY(${(1 - gK) * 16}px)` }}>
          <div style={{ width: 58, height: 58, borderRadius: 29, background: c, color: "#fff", fontFamily: RBM, fontSize: 28, textAlign: "center", lineHeight: "58px" }}>{i}</div>
          <div><div style={{ fontFamily: RB, fontSize: 28, color: "#1F1F1F" }}>{n}</div><div style={{ fontFamily: RB, fontSize: 22, color: "#5F6368" }}>{r}</div></div>
          <svg width={30} height={30} viewBox="0 0 24 24" style={{ marginLeft: 8 }}><circle cx={12} cy={12} r={11} fill="#188038" /><path d="M7 12.5l3 3 7-7" stroke="#fff" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>))}
      <div style={{ ...abs, left: 40, top: 560, display: "flex", alignItems: "center", gap: 34, opacity: ramp(fr, aRev, 5) }}><Ico d="M4 6h16M4 12h16M4 18h10" /><span style={{ fontFamily: RB, fontSize: 30, color: "#1F1F1F" }}>Review last year's plan · update numbers</span></div>
      <div style={{ ...abs, left: 40, top: 640, display: "flex", alignItems: "center", gap: 34 }}><Ico d="M12 3v18M5 10l7-7 7 7" /><span style={{ fontFamily: RB, fontSize: 30, color: "#1F1F1F" }}>Plan status:</span>
        {fr >= aTrack && <span style={{ display: "inline-block", padding: "8px 22px", borderRadius: 24, background: "#E6F4EA", color: "#137333", fontFamily: RBM, fontSize: 30, transform: `scale(${tK})` }}>On track ✓</span>}</div>
    </div>
  </Cam>;
};
// End card: the real logo builds (mark wipes in, wordmark rises), the CTA under it
const EndCard = () => {
  const fr = useCurrentFrame();
  const m = ramp(fr, 0, 12, io), w = ramp(fr, 8, 10), c = ramp(fr, 18, 8);
  return <AbsoluteFill style={{ background: "#fff" }}>
    <div style={{ ...abs, left: 540 - 300, top: 560, width: 600, height: 600 * 909 / 1576, overflow: "hidden", clipPath: `inset(0 ${(1 - m) * 100}% 0 0)` }}>
      <Img src={staticFile("wm_logo_t.png")} style={{ width: 600, height: 600 * 909 / 1576, opacity: 1, transform: `translateY(${(1 - w) * 20}px)` }} />
    </div>
    <div style={{ ...abs, left: 0, top: 1010, width: W, textAlign: "center", fontFamily: CAP, fontSize: 64, letterSpacing: "-0.035em", color: T.ink, opacity: c, transform: `translateY(${(1 - c) * 24}px)` }}>Pehli call <span style={{ fontFamily: SER, fontSize: 80, letterSpacing: 0 }}>free</span> hai</div>
    <div style={{ ...abs, left: 290, top: 1130, width: 500, height: 96, borderRadius: 14, background: "#111", fontFamily: MORN, fontSize: 32, color: "#fff", textAlign: "center", lineHeight: "96px", opacity: c }}>Schedule My Appointment</div>
    <div style={{ ...abs, left: 0, top: 1262, width: W, textAlign: "center", fontFamily: MORN, fontSize: 30, color: "#5F6368", opacity: c }}>wealthometry.in</div>
  </AbsoluteFill>;
};

// Brand reveal (replaces the site beat): the mark wipes in diagonally, the wordmark rises, then the logo lifts
// and a growth line draws underneath on "wealth planning firm"
const Brand = () => {
  const fr = useCurrentFrame(); const s = "site";
  const aBrand = rel(s, B3o(0.90)), aFirm = rel(s, B3o(2.16));
  const m = ramp(fr, 1, 16, io), wd = ramp(fr, 12, 10), up = ramp(fr, aFirm, 14, io), ln = ramp(fr, aFirm + 6, 26, Easing.inOut(Easing.cubic));
  const LW = 700, LH = LW * 909 / 1576, markH = LH * 0.47;
  const y0 = 960 - LH / 2 - 120 * up;
  const pts = [[0, 300], [120, 270], [240, 285], [360, 220], [480, 190], [600, 120], [720, 70], [820, 20]];
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  const L = 1150; const end = (() => { let acc = 0, seg = 0; const tot = L * ln; for (let i = 1; i < pts.length; i++) { const dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1], l = Math.hypot(dx, dy); if (acc + l >= tot) { const k = (tot - acc) / l; return [pts[i - 1][0] + dx * k, pts[i - 1][1] + dy * k]; } acc += l; seg = i; } return pts[seg]; })();
  return <AbsoluteFill style={{ background: "#fff" }}>
    <div style={{ ...abs, left: 540 - LW / 2, top: y0, width: LW, height: markH, overflow: "hidden", clipPath: `polygon(0 0, ${m * 220}% 0, ${m * 220 - 120}% 100%, 0 100%)` }}>
      <Img src={staticFile("wm_logo_t.png")} style={{ width: LW, height: LH }} />
    </div>
    <div style={{ ...abs, left: 540 - LW / 2, top: y0 + markH, width: LW, height: LH - markH, overflow: "hidden" }}>
      <Img src={staticFile("wm_logo_t.png")} style={{ ...abs, left: 0, top: -markH + (1 - wd) * 80, width: LW, height: LH, opacity: wd }} />
    </div>
    {fr >= aFirm + 6 && <svg style={{ ...abs, left: 130, top: 1060 }} width={840} height={330} viewBox="-10 0 840 330">
      {[0, 1, 2].map((g) => <line key={g} x1={0} x2={820} y1={100 + g * 100} y2={100 + g * 100} stroke="#EDEDED" strokeWidth={2} />)}
      <path d={`${d} L820,330 L0,330 Z`} fill="#111" fillOpacity={0.05} clipPath="url(#bclip)" />
      <clipPath id="bclip"><rect x={-10} y={0} width={end[0] + 10} height={330} /></clipPath>
      <path d={d} fill="none" stroke="#111" strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - ln)} />
      <circle cx={end[0]} cy={end[1]} r={13} fill="#111" />
      <circle cx={end[0]} cy={end[1]} r={13 + 14 * ((fr % 24) / 24)} fill="none" stroke="#111" strokeOpacity={0.35 * (1 - (fr % 24) / 24)} strokeWidth={3} />
    </svg>}
  </AbsoluteFill>;
};

// ======================= v7 beats =======================
// Stack as its own clean white screen (no page behind it)
const Stack = () => {
  const fr = useCurrentFrame(); const s = "stack";
  const sd = [B1o(9.49), B1o(9.81), B1o(10.33), B1o(10.47), B1o(10.79), B1o(11.13), B1o(11.41)];
  return <AbsoluteFill style={{ background: "#fff" }}>
    <div style={{ ...abs, left: 90, top: 720, width: 900, height: 420, transform: `scale(${1 + 0.0010 * fr})` }}>
      {sd.map((w, i) => { const k = ramp(fr, rel(s, w) - 1, i === 3 ? 8 : 6, Easing.out(Easing.cubic)); if (k <= 0) return null;
        return <Img key={i} src={staticFile(`stack_w_${i}.png`)} style={{ ...abs, left: 0, top: 0, width: 900, height: 420, opacity: k, transform: `translateY(${(1 - k) * (i === 3 ? 40 : 24)}px)`, filter: k < 1 ? `blur(${(1 - k) * 8}px)` : undefined }} />; })}
    </div>
  </AbsoluteFill>;
};
// Brand beat: wealth builds as bars (counter climbs), then on "ek wealth planning firm" the bars drop into two buckets
const INK = "#111", TERRA = "#C9836A";
const Bars = () => {
  const fr = useCurrentFrame(); const s = "site";
  const aFirm = rel(s, B3o(2.16));
  const n = 8, bw = 64, gap = 26, x0 = 540 - (n * bw + (n - 1) * gap) / 2, base = 1000;
  const hs = Array.from({ length: n }, (_, i) => 70 + i * 36 + (i * i) * 1.6);
  const cK = interpolate(fr, [4, 52], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const bucket = [{ x: 330, label: "Safe" }, { x: 750, label: "Growth" }];
  const bY = 1110, bH = 200, bW = 250;
  const bk = ramp(fr, aFirm - 4, 8, io);
  return <AbsoluteFill style={{ background: "#fff" }}>
    <Img src={staticFile("wm_logo_t.png")} style={{ ...abs, left: 540 - 170, top: 190, width: 340, height: 340 * 909 / 1576, opacity: ramp(fr, 0, 8), transform: `translateY(${(1 - ramp(fr, 0, 10)) * 20}px)` }} />
    <div style={{ ...abs, left: 0, top: 520, width: W, textAlign: "center", fontFamily: BIG, fontSize: 92, letterSpacing: "-0.04em", color: INK, opacity: 1 - 0.25 * bk }}>₹{inr(32000000 * cK)}</div>
    {hs.map((h, i) => {
      const up = ramp(fr, 4 + i * 5, 10, Easing.out(Easing.cubic));
      const side = i < 4 ? 0 : 1, j = i % 4;
      const d = ramp(fr, aFirm + 2 + i * 2, 12, io);
      const bx = x0 + i * (bw + gap), by = base - h * up;
      const tx = bucket[side].x - (bW - 34) / 2, ty = bY + bH - 12 - (j + 1) * 44;
      const x = bx + (tx - bx) * d, y = by + (ty - by) * d, w = bw + (bW - 34 - bw) * d, hh = h * up + (38 - h * up) * d;
      return <div key={i} style={{ ...abs, left: x, top: y, width: w, height: Math.max(0, hh), borderRadius: 10, background: side ? TERRA : INK }} />;
    })}
    {bk > 0 && bucket.map((b) => <React.Fragment key={b.label}>
      <svg style={{ ...abs, left: b.x - bW / 2, top: bY, opacity: bk }} width={bW} height={bH + 8}><path d={`M4 0 V${bH - 18} a14 14 0 0 0 14 14 H${bW - 18} a14 14 0 0 0 14 -14 V0`} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" /></svg>
      <div style={{ ...abs, left: b.x - 150, top: bY + bH + 26, width: 300, textAlign: "center", fontFamily: CAP, fontSize: 46, letterSpacing: "-0.03em", color: INK, opacity: bk }}>{b.label}</div>
    </React.Fragment>)}
  </AbsoluteFill>;
};
// CTA end card (cleaner version of the client's layout): dark warm plate, headline, free-call pill, logo, contact, disclaimer
const CREAM = "#F4EFE6";
const EndCardCTA = () => {
  const fr = useCurrentFrame();
  const r = (a: number, d = 9) => ramp(fr, a, d, Easing.out(Easing.cubic));
  const rise = (a: number): React.CSSProperties => ({ opacity: r(a), transform: `translateY(${(1 - r(a)) * 28}px)` });
  const pill = ramp(fr, 14, 9, pop);
  return <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 45% at 50% 46%, #2A1D17 0%, #0D0B0A 70%)" }}>
    <div style={{ ...abs, left: 0, top: 300, width: W, textAlign: "center", fontFamily: BIG, fontSize: 104, letterSpacing: "-0.045em", lineHeight: "104px", color: CREAM, ...rise(0) }}>Know your</div>
    <div style={{ ...abs, left: 0, top: 398, width: W, textAlign: "center", fontFamily: SER, fontSize: 132, lineHeight: "140px", color: TERRA, ...rise(4) }}>real return</div>
    <div style={{ ...abs, left: 0, top: 552, width: W, textAlign: "center", fontFamily: CAP, fontSize: 42, letterSpacing: "-0.02em", color: "#9B928A", ...rise(8) }}>not the fund's</div>
    <div style={{ ...abs, left: 0, top: 720, width: W, textAlign: "center", fontFamily: BIG, fontSize: 84, letterSpacing: "-0.045em", color: CREAM, ...rise(11) }}>First call</div>
    <div style={{ ...abs, left: 540 - 175, top: 820, width: 350, height: 128, borderRadius: 64, background: TERRA, textAlign: "center", fontFamily: SER, fontSize: 96, lineHeight: "122px", color: "#140E0B", opacity: Math.min(1, pill * 1.5), transform: `scale(${0.7 + 0.3 * pill})` }}>is free</div>
    <div style={{ ...abs, left: 540 - 200, top: 1050, width: 400, height: 400 * 909 / 1576, clipPath: `inset(0 ${(1 - ramp(fr, 20, 14, io)) * 100}% 0 0)` }}>
      <Img src={staticFile("wm_logo_cream.png")} style={{ width: 400, height: 400 * 909 / 1576 }} />
    </div>
    <div style={{ ...abs, left: 0, top: 1350, width: W, textAlign: "center", fontFamily: CAP, fontSize: 40, letterSpacing: "-0.02em", color: CREAM, ...rise(30) }}>wealthometry.in  ·  +91 99792 90029</div>
    <div style={{ ...abs, left: 110, top: 1470, width: 860, textAlign: "center", fontFamily: IOS, fontSize: 23, lineHeight: "34px", color: "#7E7670", ...rise(34) }}>AMFI-registered Mutual Fund Distributor · ARN-310044<br />Mutual fund investments are subject to market risks, read all scheme related documents carefully.</div>
  </AbsoluteFill>;
};

// Brand beat v2 (data-viz): corpus counter + columns rising year by year; on "ek wealth planning firm" every column
// splits into a Safe (ink) and a Growth (terracotta) part and the legend lands — wealth built, then arranged in buckets
const Bars2 = () => {
  const fr = useCurrentFrame(); const s = "site";
  const aFirm = rel(s, B3o(2.16));
  const n = 12, cw = 48, gap = 26, X0 = 100, BASE = 1290, TOPH = 560;
  const vals = Array.from({ length: n }, (_, i) => Math.pow((i + 1) / n, 1.6));
  const cK = interpolate(fr, [6, 6 + n * 4 + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const push = 1 + 0.05 * interpolate(fr, [0, 120], [0, 1], clamp);
  const lineK = ramp(fr, 6 + n * 4, 16, Easing.inOut(Easing.cubic));
  const tops = vals.map((v, i) => [X0 + i * (cw + gap) + cw / 2, BASE - v * TOPH]);
  const path = tops.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + (p[1] - 26).toFixed(1)).join(" ");
  return <AbsoluteFill style={{ background: "#fff" }}>
    <div style={{ ...abs, left: 0, top: 0, width: W, height: H, transformOrigin: "50% 60%", transform: `scale(${push})` }}>
      <Img src={staticFile("wm_logo_t.png")} style={{ ...abs, left: X0, top: 250, width: 190, height: 190 * 909 / 1576, opacity: ramp(fr, 0, 8) }} />
      <div style={{ ...abs, left: X0 - 6, top: 400, fontFamily: BIG, fontSize: 150, letterSpacing: "-0.05em", lineHeight: "150px", color: INK }}>₹{(3.2 * cK).toFixed(1)} Cr</div>
      <div style={{ ...abs, left: X0, top: 565, fontFamily: CAP, fontSize: 34, letterSpacing: "-0.02em", color: "#8A8A8A", opacity: ramp(fr, 4, 8) }}>your planned retirement corpus</div>
      {[0, 1, 2, 3].map((g) => <div key={g} style={{ ...abs, left: X0, top: BASE - g * (TOPH / 3), width: W - 2 * X0, height: 2, background: g ? "#F0F0F0" : "#D9D9D9" }} />)}
      {vals.map((v, i) => {
        const up = ramp(fr, 6 + i * 4, 12, Easing.out(Easing.cubic)); const h = v * TOPH * up;
        const sp = ramp(fr, aFirm + i * 1.5, 10, io); const safeShare = 0.25 + 0.25 * (i / (n - 1));
        const hs = h * (1 - sp * (1 - safeShare));                          // ink part shrinks to the safe share
        return <React.Fragment key={i}>
          <div style={{ ...abs, left: X0 + i * (cw + gap), top: BASE - h, width: cw, height: h - hs, background: TERRA, borderRadius: "10px 10px 0 0" }} />
          <div style={{ ...abs, left: X0 + i * (cw + gap), top: BASE - hs, width: cw, height: hs, background: INK, borderRadius: sp > 0.02 ? 0 : "10px 10px 0 0" }} />
        </React.Fragment>;
      })}
      <svg style={{ ...abs, left: 0, top: 0 }} width={W} height={1400}><path d={path} fill="none" stroke={INK} strokeWidth={3} strokeDasharray="1600" strokeDashoffset={1600 * (1 - lineK)} strokeLinecap="round" strokeLinejoin="round" opacity={0.35} /></svg>
      {["40", "45", "50", "55"].map((a, i) => <div key={a} style={{ ...abs, left: X0 + i * (W - 2 * X0 - 40) / 3, top: BASE + 18, fontFamily: CAP, fontSize: 26, color: "#9A9A9A" }}>{a}</div>)}
      {[["Safe", INK], ["Growth", TERRA]].map(([l, c], i) => { const k = ramp(fr, aFirm + 6 + i * 4, 8, pop);
        return <div key={l} style={{ ...abs, left: X0 + i * 230, top: 690, display: "flex", alignItems: "center", gap: 16, opacity: Math.min(1, k * 1.4), transform: `translateY(${(1 - k) * 16}px)` }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: c }} /><span style={{ fontFamily: CAP, fontSize: 40, letterSpacing: "-0.03em", color: INK }}>{l}</span></div>; })}
    </div>
  </AbsoluteFill>;
};

// ---------- InvertGlitch: backdrop-invert bands/blocks for a few frames, new layout every frame, overlaps invert back ----------
const rnd = (x: number) => { const v = Math.sin(x * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
const InvertGlitch = ({ at, dur = 4, seed = 1, full = false }: { at: number; dur?: number; seed?: number; full?: boolean }) => {
  const fr = useCurrentFrame() - at; if (fr < 0 || fr >= dur) return null;
  const n = 3 + Math.floor(rnd(seed * 31 + fr) * 4);
  return <AbsoluteFill>
    {full && fr === 1 && <div style={{ ...abs, left: 0, top: 0, width: W, height: H, backdropFilter: "invert(1)" }} />}
    {Array.from({ length: n }, (_, i) => { const s = seed * 100 + fr * 17 + i * 5.3; const wide = rnd(s) < 0.6;
      const w = wide ? W * (0.5 + 0.5 * rnd(s + 1)) : W * (0.15 + 0.3 * rnd(s + 1)); const h = wide ? H * (0.02 + 0.07 * rnd(s + 2)) : H * (0.06 + 0.14 * rnd(s + 2));
      return <div key={i} style={{ ...abs, left: rnd(s + 3) * (W - w * 0.5) - w * 0.2, top: rnd(s + 4) * (H - h), width: w, height: h, backdropFilter: "invert(1)" }} />; })}
  </AbsoluteFill>;
};

// ---------- captions (Inter Display Bold; seam chunks have a tight translucent backing; dark ink on white plates) ----------
type Chunk = { w: [string, number][]; where: "chest" | "seam" | "plate" };
const segAt = (t: number) => (Object.keys(SEG) as (keyof typeof SEG)[]).find((k) => t >= SEG[k][0] - 0.02 && t < SEG[k][1] - 0.02) ?? "end";
const C = (...w: [string, number][]): Chunk => { const L = LAYOUT[segAt(w[0][1])]; return { w, where: L === "split" ? "seam" : L === "full" ? "plate" : "chest" }; };
const CAPS: Chunk[] = [
  C(["chalis", H3o(24.12)], ["ki", H3o(24.62)], ["umar", H3o(24.82)], ["mein", H3o(25.04)]),
  C(["retirement", H3o(25.32)], ["planning", H3o(25.70)]), C(["ke", H3o(26.02)], ["baare", H3o(26.26)], ["mein", H3o(26.48)]),
  C(["soch", H3o(26.58)], ["raha", H3o(26.84)], ["hoon,", H3o(27.08)]),
  C(["office", H3o(27.62)], ["wale", H3o(28.12)], ["mujhe", H3o(28.38)]),
  C(["pagal", H3o(28.68)]), C(["bol", H3o(29.14)], ["rahe", H3o(29.36)], ["hain", H3o(29.56)]),
  C(["retirement", B1o(2.79)], ["planning", B1o(3.43)]),
  C(["tab", B1o(3.87)], ["tak", B1o(4.31)]), C(["door", B1o(4.51)], ["ki", B1o(4.73)], ["baat", B1o(4.87)]), C(["lagti hai,", B1o(5.11)]),
  C(["jab", B1o(5.61)], ["tak", B1o(5.99)]), C(["uski", B1o(6.19)], ["zarurat", B1o(6.61)]),
  C(["saamne", B1o(7.05)], ["nahi", B1o(7.37)]), C(["aa", B1o(7.57)], ["jaati.", B1o(7.67)]),
  C(["aur", B1o(8.23)], ["yahin", B1o(8.81)], ["se", B1o(9.27)]),
  C(["kya", B1o(11.83)], ["aapka", B1o(12.47)]), C(["retirement", B1o(12.99)], ["plan", B1o(13.31)]), C(["tayaar", B1o(13.65)], ["hai?", B1o(14.11)]),
  C(["zyadatar", B2o(7.88)], ["log", B2o(8.80)]), C(["late", B2o(9.10)], ["thirties", B2o(9.70)], ["tak", B2o(10.22)]),
  C(["aate-aate", B2o(10.36)], ["kaafi", B2o(11.00)], ["save", B2o(11.48)]), C(["kar", B2o(11.76)], ["chuke", B2o(11.94)]), C(["hote", B2o(12.16)], ["hain.", B2o(12.44)]),
  C(["phir", B2o(12.96)], ["bhi", B2o(13.36)], ["unko", B2o(13.52)]), C(["confidence", B2o(13.88)]), C(["nahi", B2o(14.30)], ["hota.", B2o(14.74)]),
  C(["kyunki", B2o(15.41)], ["kisi", B2o(15.91)], ["ne", B2o(16.33)]), C(["unke", B2o(16.61)], ["saath", B2o(17.01)], ["baithkar", B2o(17.29)]),
  C(["kabhi", B2o(17.75)], ["retirement", B2o(18.07)], ["planning", B2o(18.55)]),
  C(["ki", B2o(18.87)], ["hi", B2o(19.23)], ["nahi.", B2o(19.35)]),
  C(["yahi", B3o(0.08)], ["toh", B3o(0.74)]), C(["Wealthometry", B3o(0.90)], ["karti hai.", B3o(1.36)]),
  C(["ek", B3o(2.16)], ["wealth", B3o(2.72)], ["planning", B3o(3.22)], ["firm.", B3o(3.50)]),
  C(["wo", B4o(0.04)], ["dekhte", B4o(0.22)], ["hain", B4o(0.48)], ["ki", B4o(0.66)]), C(["aapne", B4o(0.84)], ["ab", B4o(1.30)], ["tak", B4o(1.56)]),
  C(["kitna", B4o(2.28)], ["save", B4o(2.68)], ["kiya hai,", B4o(2.92)]), C(["current", B4o(4.22)], ["expenses", B4o(4.58)]), C(["kya hai,", B4o(5.14)]),
  C(["aur", B4o(5.46)], ["aap", B4o(6.44)], ["kab", B4o(6.80)]), C(["kaam", B4o(7.20)], ["karna", B4o(7.50)], ["band", B4o(7.92)]), C(["karna", B4o(8.48)], ["chahte", B4o(8.76)], ["ho.", B4o(9.10)]),
  C(["phir", B4o(9.22)], ["aapko", B5o(0.45)]), C(["milta hai", B5o(0.73)]), C(["ek", B5o(1.23)], ["written", B5o(1.41)], ["plan:", B5o(1.54)]),
  C(["aapka", B5o(2.30)], ["number,", B5o(2.69)]), C(["aapki", B5o(3.29)], ["date,", B5o(3.76)]), C(["aur", B5o(4.08)], ["tax ke baad", B5o(4.73)]),
  C(["har", B5o(5.61)], ["mahine", B5o(5.96)]), C(["aap", B5o(6.42)], ["kitna", B5o(6.81)]), C(["nikaal", B5o(7.21)], ["sakte ho.", B5o(7.50)]),
  C(["aur", B6o(0.36)], ["itna", B6o(0.74)], ["hi", B6o(1.02)], ["nahi!", B6o(1.14)]),
  C(["aapki", B6o(1.94)], ["savings", B6o(2.46)]), C(["aise", B6o(2.78)], ["arrange", B6o(3.36)]), C(["hoti hain", B6o(3.60)], ["ki", B6o(4.26)]),
  C(["monthly", B6o(4.46)], ["income", B6o(4.76)]), C(["hamesha", B6o(5.22)]), C(["ek", B6o(5.94)], ["safe", B6o(6.12)], ["bucket", B6o(6.44)]), C(["se aaye,", B6o(6.72)]),
  C(["aur", B6o(7.14)], ["market", B6o(7.88)]), C(["girne", B6o(8.36)], ["par bhi", B6o(8.74)]), C(["kuch", B6o(9.30)], ["bechna", B6o(9.84)]), C(["na pade.", B6o(10.24)]),
  C(["aur", B7o(0.30)], ["har", B7o(0.66)], ["April", B7o(0.98)]), C(["wo", B7o(1.30)], ["aapke", B7o(1.72)], ["saath", B7o(2.16)]), C(["plan ka", B7o(2.38)], ["review", B7o(2.90)]), C(["karte hain,", B7o(3.26)]),
  C(["taaki", B7o(3.76)], ["aapko", B7o(4.38)]), C(["hamesha", B7o(4.86)], ["pata", B7o(5.38)], ["rahe", B7o(5.74)]), C(["ki aap", B7o(5.98)], ["on track", B7o(6.60)]), C(["ho ya nahi.", B7o(7.10)]),
  C(["sochna", CTo(0.11)], ["band karo,", CTo(0.87)]), C(["plan", CTo(1.53)], ["banana", CTo(1.95)]), C(["shuru karo.", CTo(2.35)]), C(["pehli", CTo(3.17)], ["call", CTo(3.59)]), C(["free", CTo(3.95)], ["hai.", CTo(4.33)]),
];
const cutsAt = Object.values(SEG).map(([a]) => a).slice(1);
const ends = CAPS.map((c, i) => {
  let e = i + 1 < CAPS.length ? CAPS[i + 1].w[0][1] - 1 / FPS : 99;
  if (c.w[0][0] === "aur") e = B1o(9.49) - 1 / FPS;
  for (const k of cutsAt) if (c.w[0][1] < k && k < e) e = k - 1 / FPS;
  return e;
});
const Captions = () => {
  const fr = useCurrentFrame(); const t = fr / FPS;
  return <>{CAPS.map((c, i) => {
    if (t < c.w[0][1] || t > ends[i]) return null;
    const words = c.w.map(([w, at], j) => <span key={j} style={{ opacity: fr < f(at) ? 0 : interpolate(fr, [f(at), f(at) + 2], [0.5, 1], clamp) }}>{w}{j < c.w.length - 1 ? " " : ""}</span>);
    const base: React.CSSProperties = { display: "inline-block", fontFamily: CAP, fontSize: 68, letterSpacing: "-0.035em", lineHeight: 1.05 };
    if (c.where === "seam") { const k = ramp(fr, f(c.w[0][1]), 3); return <div key={i} style={{ ...abs, left: 0, top: SEAM - 50, width: W, textAlign: "center" }}><span style={{ ...base, color: "#fff", padding: "4px 22px 9px", borderRadius: 16, background: "rgba(24,24,27,.55)", backdropFilter: "blur(10px)", opacity: k, transform: `scale(${0.94 + 0.06 * k})` }}>{c.w.map(([w]) => w).join(" ")}</span></div>; }
    if (c.where === "plate") return <div key={i} style={{ ...abs, left: 0, top: 1560, width: W, textAlign: "center" }}><span style={{ ...base, color: T.ink, padding: "4px 22px 9px", borderRadius: 16, background: "rgba(255,255,255,.96)" }}>{words}</span></div>;
    return <div key={i} style={{ ...abs, left: 0, top: 1060, width: W, textAlign: "center" }}><span style={{ ...base, color: "#fff", textShadow: "0 3px 18px rgba(0,0,0,.55)" }}>{words}</span></div>;
  })}</>;
};

// ---------- footage ----------
const Face = ({ src, from, crop = false }: { src: string; from: number; crop?: boolean }) =>
  <Video src={staticFile(src)} startFrom={f(from)} style={{ ...abs, left: 0, top: crop ? SEAM - 300 : 0, width: W, height: H }} />;
const Split = ({ children, face, from }: { children: React.ReactNode; face: string; from: number }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Face src={face} from={from} crop />
    <div style={{ ...abs, left: 0, top: 0, width: W, height: SEAM, background: T.plate, overflow: "hidden" }}>{children}</div>
  </AbsoluteFill>
);

const SHOT: Record<keyof typeof SEG, () => React.ReactNode> = {
  full1: () => <Face src="H3.mp4" from={0} />, chat: () => <Split face="H3.mp4" from={SEG.chat[0]}><WhatsApp /></Split>,
  faceB1: () => <Face src="B1.mp4" from={0} />, years: () => <Split face="B1.mp4" from={SEG.years[0] - SEG.faceB1[0]}><Calendar /></Split>, faceB1b: () => <Face src="B1.mp4" from={SEG.faceB1b[0] - SEG.faceB1[0]} />, stack: () => <Stack />, plate: () => <Google />,
  saved: () => <Split face="B2.mp4" from={0}><Sheets /></Split>, full2: () => <Face src="B2.mp4" from={SEG.full2[0] - SEG.saved[0]} />,
  chairs: () => <Split face="B2.mp4" from={SEG.chairs[0] - SEG.saved[0]}><GCal /></Split>,
  site: () => <Face src="B3g.mp4" from={0} />, form: () => <Split face="B4.mp4" from={0}><Form /></Split>, pdf: () => <Pdf />,
  face6: () => <Face src="B6.mp4" from={0} />, sms: () => <Split face="B6.mp4" from={SEG.sms[0] - SEG.face6[0]}><Sms /></Split>, market: () => <Market />,
  review: () => <Split face="B7.mp4" from={0}><Review /></Split>, cta: () => <Face src="CTA.mp4" from={0} />, end: () => <EndCardCTA />,
};
const at = (k: keyof typeof SEG) => <Sequence from={f(SEG[k][0])} layout="none">{SHOT[k]()}</Sequence>;
// glitch schedule (the mix reads the same list): ShapeGlitch on the big layout changes, InvertGlitch on others + the "zarurat" hit
export const GLITCH = {
  shape: [["full1", "chat"], ["years", "faceB1b"], ["saved", "full2"], ["chairs", "site"], ["form", "pdf"], ["sms", "market"], ["review", "cta"]] as [keyof typeof SEG, keyof typeof SEG][],
  invert: [[SEG.faceB1[0], 4, false], [B1o(6.61), 3, true], [SEG.saved[0], 4, false], [SEG.chairs[0], 4, false], [SEG.form[0], 4, false], [SEG.face6[0], 3, false], [SEG.review[0], 4, false], [SEG.end[0], 3, false]] as [number, number, boolean][],
};
const seq = (k: keyof typeof SEG, el: React.ReactNode) => <Sequence from={f(SEG[k][0])} durationInFrames={f(SEG[k][1]) - f(SEG[k][0])}>{el}</Sequence>;
export const Script3Test = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <style>{fonts}</style>
    {(Object.keys(SEG) as (keyof typeof SEG)[]).map((k) => <React.Fragment key={k}>{seq(k, SHOT[k]())}</React.Fragment>)}
    <Captions />
    {GLITCH.shape.map(([a, b], i) => <ShapeGlitch key={i} at={f(SEG[b][0]) - 6} seed={i + 2} outgoing={at(a)} incoming={at(b)} />)}
    {GLITCH.invert.map(([t, d, full], i) => <InvertGlitch key={i} at={f(t) - 1} dur={d} seed={i + 7} full={full} />)}
    <Audio src={staticFile("master.wav")} />
  </AbsoluteFill>
);
registerRoot(() => <Composition id="Script3Test" component={Script3Test} durationInFrames={f(TOTAL)} fps={FPS} width={W} height={H} />);
