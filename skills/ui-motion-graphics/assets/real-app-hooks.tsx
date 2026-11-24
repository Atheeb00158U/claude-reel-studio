// ======================= hook variants =======================
// H1: Google Pay thread with Papa: the first payment request in 10 years lands on "pehli baar"
const GPay = () => {
  const fr = useCurrentFrame(); const s = "h1pay";
  const aReq = rel(s, HKo(4.08)), aAmt = rel(s, HKo(4.98));
  const k = ramp(fr, aReq, 8, pop); const hl = ramp(fr, aAmt, 8, Easing.inOut(Easing.cubic));
  const keys: Key[] = [[0, 540, 380, 1.3], [aReq - 6, 540, 380, 1.3], [aReq + 6, 520, 760, 1.3], [200, 520, 780, 1.3]];
  const BLUE = "#0B57D0";
  return <Cam vw={W} vh={SEAM} keys={keys}>
    <Phone>
      <div style={{ ...abs, left: 0, top: 0, width: SW, height: 250, background: "#fff", borderBottom: "1px solid #E3E3E3" }}>
        <StatusBar />
        <svg style={{ ...abs, left: 26, top: 150 }} width={34} height={34} viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="#1F1F1F" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" /></svg>
        <div style={{ ...abs, left: 82, top: 132, width: 72, height: 72, borderRadius: 36, background: "#8D6E63", color: "#fff", fontFamily: RBM, fontSize: 34, textAlign: "center", lineHeight: "72px" }}>P</div>
        <div style={{ ...abs, left: 176, top: 130, fontFamily: RBM, fontSize: 36, color: "#1F1F1F" }}>Papa</div>
        <div style={{ ...abs, left: 176, top: 176, fontFamily: RB, fontSize: 25, color: "#5F6368" }}>+91 98250 •••10</div>
        <svg style={{ ...abs, left: 740, top: 150 }} width={36} height={36} viewBox="0 0 24 24"><circle cx={12} cy={12} r={10} fill="none" stroke="#1F1F1F" strokeWidth={2} /><path d="M12 11v6M12 7.5v.5" stroke="#1F1F1F" strokeWidth={2.2} strokeLinecap="round" /></svg>
      </div>
      <div style={{ ...abs, left: SW / 2 - 60, top: 300, width: 120, height: 44, borderRadius: 22, background: "#F1F3F4", fontFamily: RB, fontSize: 24, color: "#5F6368", textAlign: "center", lineHeight: "44px" }}>Today</div>
      {fr >= aReq && <div style={{ ...abs, left: 40, top: 520, width: 560, height: 470, borderRadius: 32, border: "2px solid #DADCE0", background: "#fff", transformOrigin: "0 100%", transform: `scale(${0.85 + 0.15 * k})`, opacity: Math.min(1, k * 1.5) }}>
        <div style={{ ...abs, left: 40, top: 36, fontFamily: RB, fontSize: 27, color: "#5F6368" }}>Payment request</div>
        <div style={{ ...abs, left: 30, top: 92, width: 360 * hl, height: 92, background: "rgba(255,214,0,.6)", borderRadius: 6 }} />
        <div style={{ ...abs, left: 40, top: 82, fontFamily: RBM, fontSize: 92, color: "#1F1F1F", letterSpacing: "-0.01em" }}>₹10,000</div>
        <div style={{ ...abs, left: 40, top: 210, fontFamily: RB, fontSize: 30, color: "#3C4043" }}>dawai ke liye, beta <Em n="pray" s={32} /></div>
        <div style={{ ...abs, left: 40, top: 300, width: 220, height: 84, borderRadius: 42, border: `2px solid #747775`, fontFamily: RBM, fontSize: 30, color: BLUE, textAlign: "center", lineHeight: "80px" }}>Decline</div>
        <div style={{ ...abs, left: 290, top: 300, width: 220, height: 84, borderRadius: 42, background: BLUE, fontFamily: RBM, fontSize: 30, color: "#fff", textAlign: "center", lineHeight: "84px" }}>Pay</div>
        <div style={{ ...abs, left: 40, top: 412, fontFamily: RB, fontSize: 22, color: "#80868B" }}>10:42 am</div>
      </div>}
      <div style={{ ...abs, left: 0, top: 1620, width: SW, height: 156, background: "#fff", borderTop: "1px solid #E3E3E3" }}>
        {["Pay", "Request"].map((b, i) => <div key={b} style={{ ...abs, left: 30 + i * 170, top: 24, width: 150, height: 72, borderRadius: 36, background: i ? "#fff" : BLUE, border: i ? "2px solid #747775" : undefined, fontFamily: RBM, fontSize: 28, color: i ? BLUE : "#fff", textAlign: "center", lineHeight: "70px" }}>{b}</div>)}
        <div style={{ ...abs, left: 380, top: 24, width: 410, height: 72, borderRadius: 36, background: "#F1F3F4", fontFamily: RB, fontSize: 26, color: "#5F6368", lineHeight: "72px", paddingLeft: 30, boxSizing: "border-box" }}>Message…</div>
      </div>
    </Phone>
  </Cam>;
};
// H2: the family WhatsApp group — the two brothers argue about who keeps Maa; later Maa replies
const familyMsgs = (s: keyof typeof SEG, pre: boolean): Msg[] => {
  const t = (x: number) => (pre ? -99 : rel(s, HKo(x)));
  return [
    { at: -99, h: 120, el: () => <Bubble who="Maa" color="#1F7AEC" w={520} time="9:02">Sab theek ho beta? <Em n="pray" s={40} /></Bubble> },
    { at: t(2.03), h: 120, el: () => <Bubble who="Rahul" color="#D3396D" w={640} time="10:40">Maa mere saath Pune chalegi</Bubble> },
    { at: t(2.77), h: 162, el: () => <Bubble who="Amit" color="#C45A00" w={600} time="10:41">Tere ghar mein jagah kahan hai? Kharcha kaun dega?</Bubble> },
    { at: t(3.69), h: 120, el: () => <Bubble who="Rahul" color="#D3396D" w={700} time="10:41">Toh tu rakh le. Main akela kyun?</Bubble> },
    { at: t(4.67), h: 120, el: () => <Bubble who="Amit" color="#C45A00" w={470} time="10:42">Har baar main hi? <Em n="angry" s={40} /></Bubble> },
  ];
};
const FamilyChat = () => {
  const fr = useCurrentFrame(); void fr;
  const a1 = rel("h2chat", HKo(2.03));
  return <WAChat msgs={familyMsgs("h2chat", false)} camKeys={[[0, 540, 330, 1.3], [a1 - 6, 540, 330, 1.3], [a1 + 6, 540, 1460, 1.3], [200, 540, 1480, 1.3]]}
    title={<>Family <Em n="heart" s={32} /></>} members="Maa, Rahul, Amit, You" typing={[2, a1, "Rahul is typing…"]} />;
};
const FamilyChat2 = () => {
  const aMaa = rel("h2chat2", HKo(8.57));
  const msgs = [...familyMsgs("h2chat2", true), { at: aMaa, h: 162, el: () => <Bubble who="Maa" color="#1F7AEC" w={640} time="10:43">Bas karo dono. Tumhare papa hote toh… <Em n="sad" s={40} /></Bubble> }];
  return <WAChat msgs={msgs} camKeys={[[0, 540, 1480, 1.3], [200, 540, 1480, 1.3]]} title={<>Family <Em n="heart" s={32} /></>} members="Maa, Rahul, Amit, You" typing={[0, aMaa, "Maa is typing…"]} />;
};
