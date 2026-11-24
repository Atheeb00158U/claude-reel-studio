import React from "react";
import { AbsoluteFill, useCurrentFrame } from "raea";

/**
 * ShapeGlitch — the Metro Media House block glitch (ref editbymmh DaXuhxvBQw_), rebuilt for raea.
 * Default glitch for every style that uses glitches (Atheeb, Nov 21 2026: "this should be the default",
 * from the cold brew v2 reel).
 *
 * For `dur` frames (default 12) the frame breaks into rectangles: offset and rescaled copies of the
 * outgoing shot, blocks of the incoming shot, and dark and white solid blocks. The layout re-rolls every
 * `reroll` frames (default 2) and is densest mid-burst (3 + 6·sin envelope tiles). Place it above the
 * shots and captions, below grain. Pair every burst with an electric glitch SFX (~ -15 dB) from its first frame.
 *
 * Usage: <ShapeGlitch at={cutFrame - 6} outgoing={<ShotA/>} incoming={<ShotB/>} seed={3} />
 * `outgoing`/`incoming` are the same elements the timeline renders (freeze the incoming one on its first frames).
 */
export type ShapeGlitchProps = {
  at: number; dur?: number; reroll?: number; seed?: number;
  outgoing: React.ReactNode; incoming?: React.ReactNode;
  width?: number; height?: number; dark?: string; light?: string;
};

const rnd = (s: number) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export const ShapeGlitch: React.FC<ShapeGlitchProps> = ({ at, dur = 12, reroll = 2, seed = 1, outgoing, incoming,
  width = 1080, height = 1920, dark = "#0b0b0c", light = "#f4f4f2" }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f >= dur) return null;
  const step = Math.floor(f / reroll);
  const env = Math.sin(Math.PI * (f + 0.5) / dur);
  const n = Math.round(3 + 6 * env);
  const tiles = [] as React.ReactNode[];
  for (let i = 0; i < n; i++) {
    const s = seed * 1000 + step * 37 + i * 7.13;
    const wide = rnd(s + 1) < 0.55;                       // mostly wide bands, some blocks
    const w = wide ? width * (0.45 + 0.55 * rnd(s + 2)) : width * (0.12 + 0.3 * rnd(s + 2));
    const h = wide ? height * (0.025 + 0.09 * rnd(s + 3)) : height * (0.05 + 0.16 * rnd(s + 3));
    const x = rnd(s + 4) * (width - w * 0.6) - w * 0.2;
    const y = rnd(s + 5) * (height - h);
    const kind = rnd(s + 6);
    const src = kind < 0.5 ? "out" : kind < 0.72 ? (incoming ? "in" : "out") : kind < 0.88 ? "dark" : "light";
    const dx = (rnd(s + 7) - 0.5) * width * 0.35, dy = (rnd(s + 8) - 0.5) * height * 0.06;
    const sc = 1 + (rnd(s + 9) - 0.3) * 0.6;
    tiles.push(
      <div key={i} style={{ position: "absolute", left: x, top: y, width: w, height: h, overflow: "hidden",
        background: src === "dark" ? dark : src === "light" ? light : undefined }}>
        {(src === "out" || src === "in") && (
          <div style={{ position: "absolute", left: -x + dx, top: -y + dy, width, height,
            transform: `scale(${sc})`, transformOrigin: `${x + w / 2}px ${y + h / 2}px` }}>
            {src === "out" ? outgoing : incoming}
          </div>
        )}
      </div>
    );
  }
  return <AbsoluteFill style={{ pointerEvents: "none" }}>{tiles}</AbsoluteFill>;
};
