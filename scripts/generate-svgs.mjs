// Generates the animated SVGs used in the profile README.
// Usage (from the repo root): node scripts/generate-svgs.mjs   writes ./assets/*.svg
// Edit the text in this file, never the generated SVGs.
import { writeFileSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), "..", "assets");
mkdirSync(OUT, { recursive: true });

const C = {
  bg: "#0d1117", bg2: "#111821", panel: "#161b22", line: "#21262d", border: "#30363d",
  text: "#f0f6fc", body: "#9da7b3", mute: "#6e7681", teal: "#00d4b4", teal2: "#00a08a", teal3: "#0a5c52",
};
const SANS = "'Segoe UI',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Inter,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,'Liberation Mono',monospace";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const kt = (a) => a.map((v) => (+v).toFixed(3)).join(";");

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function svg(W, H, css, defs, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<style>
.sans{font-family:${SANS}}
.mono{font-family:${MONO}}
.up{animation:up .9s cubic-bezier(.2,.8,.2,1) both}
@keyframes up{from{opacity:0;transform:translateY(10px)}}
${css}
</style>
<defs>
<clipPath id="clip"><rect width="${W}" height="${H}" rx="18"/></clipPath>
<pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="${C.line}"/></pattern>
<filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
${defs}
</defs>
<g clip-path="url(#clip)">
${body}
</g>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="18" fill="none" stroke="${C.border}"/>
</svg>
`;
}

/* ================================================================ HERO */
function hero() {
  const W = 1000, H = 340;
  const r = rng(11);
  const defs = `
<linearGradient id="bgg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1015"/><stop offset="1" stop-color="#0d1117"/></linearGradient>
<radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${C.teal}" stop-opacity="0.20"/><stop offset="1" stop-color="${C.teal}" stop-opacity="0"/></radialGradient>
<linearGradient id="name" x1="0" x2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#c9f5ee"/></linearGradient>`;
  let b = `<rect width="${W}" height="${H}" fill="url(#bgg)"/>
<rect width="${W}" height="${H}" fill="url(#dots)" opacity="0.7"/>
<ellipse cx="790" cy="170" rx="260" ry="190" fill="url(#glow)" class="breathe"/>`;

  // neural network on the right
  const layers = [4, 6, 6, 3];
  const lx = [660, 750, 840, 930];
  const nodes = layers.map((n, li) =>
    Array.from({ length: n }, (_, i) => [lx[li], 170 + (i - (n - 1) / 2) * 42]));
  for (let li = 0; li < layers.length - 1; li++)
    for (const a of nodes[li]) for (const c of nodes[li + 1])
      b += `<line x1="${a[0]}" y1="${a[1]}" x2="${c[0]}" y2="${c[1]}" stroke="#1d2a33" stroke-width="1"/>`;
  // signals travelling input -> output
  for (let k = 0; k < 16; k++) {
    const route = nodes.map((L) => L[Math.floor(r() * L.length)]);
    const d = "M" + route.map((p) => p.join(" ")).join(" L");
    const dur = 2.6, begin = (k * 0.37).toFixed(2);
    b += `<path d="${d}" fill="none" stroke="${C.teal}" stroke-width="1.6" stroke-opacity="0" stroke-linecap="round">
<animate attributeName="stroke-opacity" values="0;0.55;0" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/></path>
<circle r="3.2" fill="${C.teal}" opacity="0"><animateMotion dur="${dur}s" begin="${begin}s" repeatCount="indefinite" path="${d}"/>
<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/></circle>`;
  }
  nodes.forEach((L, li) => L.forEach(([x, y]) => {
    const out = li === layers.length - 1;
    b += `<circle cx="${x}" cy="${y}" r="9" fill="${C.teal}" opacity="0" filter="url(#blur)" class="ping" style="animation-delay:${(r() * 3).toFixed(2)}s"/>
<circle cx="${x}" cy="${y}" r="7" fill="${out ? C.teal : C.bg}" stroke="${out ? C.teal : "#2f4450"}" stroke-width="1.5"/>`;
  }));

  // left column
  b += `<g class="up" style="animation-delay:.05s">
<rect x="48" y="44" width="262" height="30" rx="15" fill="${C.teal}" fill-opacity="0.10" stroke="${C.teal}" stroke-opacity="0.45"/>
<circle cx="68" cy="59" r="4" fill="${C.teal}"/><circle cx="68" cy="59" r="4" fill="none" stroke="${C.teal}" class="ring"/>
<text x="82" y="64" class="sans" font-size="13.5" font-weight="600" fill="${C.teal}">Open to full-time AI/ML roles</text></g>
<text x="46" y="140" class="sans up" style="animation-delay:.15s" font-size="62" font-weight="700" fill="url(#name)" letter-spacing="-1">Mayukh Banerjee</text>
<text x="48" y="184" class="sans up" style="animation-delay:.3s" font-size="25" font-weight="600" fill="${C.teal}">AI/ML Engineer<tspan fill="${C.mute}" font-weight="400">  ·  </tspan><tspan fill="${C.text}" font-weight="500">LLM Systems, RAG and Agents</tspan></text>
<text class="sans up" style="animation-delay:.45s" font-size="17" fill="${C.body}">
<tspan x="48" y="230">I build retrieval and agent systems where the model handles</tspan>
<tspan x="48" y="256">language, and tested code handles everything that must be right.</tspan></text>
<text x="48" y="304" class="mono up" style="animation-delay:.6s" font-size="13" fill="${C.mute}">Bangalore, India  ·  B.Tech IT, VIT (2027)</text>
<text x="${W - 40}" y="${H - 26}" class="mono" font-size="11" fill="#3b4752" text-anchor="end">input → hidden → hidden → output</text>`;

  const css = `
.breathe{animation:breathe 6s ease-in-out infinite}
@keyframes breathe{0%,100%{opacity:.6}50%{opacity:1}}
.ping{animation:ping 3s ease-out infinite}
@keyframes ping{0%,70%,100%{opacity:0}78%{opacity:.8}}
.ring{transform-box:fill-box;transform-origin:center;animation:ring 2s ease-out infinite}
@keyframes ring{0%{transform:scale(1);opacity:.9}100%{transform:scale(3.2);opacity:0}}`;
  return svg(W, H, css, defs, b);
}

/* ================================================================ CARDS */
const CW = 600, CH = 350, VH = 160;

function card({ kicker, title, lines, chips, visual, css = "", defs = "" }) {
  let b = `<rect width="${CW}" height="${CH}" fill="${C.bg}"/>
<rect width="${CW}" height="${VH}" fill="${C.bg2}"/>
<rect width="${CW}" height="${VH}" fill="url(#dots)" opacity="0.8"/>
<line x1="0" y1="${VH}" x2="${CW}" y2="${VH}" stroke="${C.line}"/>
${visual}
<text x="32" y="194" class="mono" font-size="12" font-weight="600" fill="${C.teal}" letter-spacing="1.5">${esc(kicker)}</text>
<text x="31" y="228" class="sans" font-size="28" font-weight="700" fill="${C.text}">${esc(title)}</text>
<text class="sans" font-size="15.5" fill="${C.body}">${lines.map((l, i) => `<tspan x="32" y="${258 + i * 22}">${esc(l)}</tspan>`).join("")}</text>`;
  let x = 32;
  for (const c of chips) {
    const w = c.length * 7.4 + 22;
    b += `<rect x="${x}" y="306" width="${w}" height="24" rx="12" fill="${C.panel}" stroke="${C.border}"/>
<text x="${x + w / 2}" y="322" class="mono" font-size="12" fill="#c9d1d9" text-anchor="middle">${esc(c)}</text>`;
    x += w + 8;
  }
  return svg(CW, CH, css, defs, b);
}

function cardScheduler() {
  const names = ["Parse", "Frame", "Search", "Rank", "Verify", "Reply"];
  const cx = (i) => 75 + i * 90, y = 78, dur = 3.6;
  let v = `<defs><marker id="ah" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L8 4L0 8z" fill="${C.teal2}"/></marker></defs>`;
  for (let i = 0; i < 5; i++) v += `<line x1="${cx(i) + 20}" y1="${y}" x2="${cx(i + 1) - 20}" y2="${y}" stroke="${C.border}" stroke-width="2"/>`;
  v += `<path d="M${cx(4)} ${y - 22} C${cx(4)} ${y - 62} ${cx(2)} ${y - 62} ${cx(2)} ${y - 25}" fill="none" stroke="${C.teal2}" stroke-dasharray="4 4" marker-end="url(#ah)" class="dash"/>
<text x="${cx(3)}" y="${y - 62}" class="mono" font-size="11" fill="${C.mute}" text-anchor="middle">slot taken: search again</text>`;
  for (let k = 0; k < 2; k++)
    v += `<circle r="5" fill="${C.teal}"><animateMotion dur="${dur}s" begin="${-k * dur / 2}s" repeatCount="indefinite" path="M${cx(0)} ${y} L${cx(5)} ${y}"/></circle>`;
  names.forEach((n, i) => {
    const llm = i === 0 || i === 5;
    const t = (i / 5) * dur;
    v += `<circle cx="${cx(i)}" cy="${y}" r="24" fill="${C.teal}" filter="url(#blur)" opacity="0" class="halo" style="animation-delay:${(t - 0.2).toFixed(2)}s"/>
<circle cx="${cx(i)}" cy="${y}" r="19" fill="${llm ? C.teal : C.panel}" stroke="${llm ? C.teal : "#3d4a55"}" stroke-width="2"/>
<text x="${cx(i)}" y="${y + 4.5}" class="mono" font-size="12" font-weight="700" fill="${llm ? C.bg : C.body}" text-anchor="middle">${llm ? "LLM" : "fn"}</text>
<text x="${cx(i)}" y="${y + 42}" class="sans" font-size="12.5" fill="${llm ? C.teal : C.body}" text-anchor="middle">${n}</text>`;
  });
  v += `<text x="${CW - 24}" y="146" class="mono" font-size="11" fill="${C.mute}" text-anchor="end">LangGraph StateGraph · 2 of 6 nodes call a model</text>`;
  return card({
    kicker: "AGENTIC AI · BOOKING", title: "Scheduler AI",
    lines: ["A booking agent where the LLM only reads the request and", "writes the reply. Plain code finds, ranks and verifies slots."],
    chips: ["LangGraph", "FastAPI", "Next.js", "MongoDB"],
    visual: v,
    css: `.halo{animation:halo ${dur}s ease-out infinite}@keyframes halo{0%{opacity:0}6%{opacity:.75}20%,100%{opacity:0}}
.dash{animation:dash 1.2s linear infinite}@keyframes dash{to{stroke-dashoffset:-16}}`,
  });
}

function cardEcoLoop() {
  const cx = 300, cy = 78, rx = 205, ry = 46;
  const loop = `M${cx - rx} ${cy} A${rx} ${ry} 0 1 1 ${cx + rx} ${cy} A${rx} ${ry} 0 1 1 ${cx - rx} ${cy}`;
  let v = `<path d="${loop}" fill="none" stroke="${C.border}" stroke-width="2"/>`;
  for (let k = 0; k < 4; k++)
    v += `<circle r="4.5" fill="${C.teal}"><animateMotion dur="6s" begin="${-k * 1.5}s" repeatCount="indefinite" path="${loop}"/></circle>`;
  const box = (x, y, w, label, sub, hot) => `<rect x="${x - w / 2}" y="${y - 20}" width="${w}" height="40" rx="10" fill="${hot ? C.teal : C.panel}" stroke="${hot ? C.teal : "#3d4a55"}" stroke-width="1.5"/>
<text x="${x}" y="${y - 2}" class="sans" font-size="13" font-weight="700" fill="${hot ? C.bg : C.text}" text-anchor="middle">${label}</text>
<text x="${x}" y="${y + 13}" class="mono" font-size="10" fill="${hot ? C.bg : C.mute}" text-anchor="middle">${sub}</text>`;
  v += box(cx - rx, cy, 130, "Building", "EnergyPlus", false);
  v += box(cx, cy - ry, 130, "LLM agent", "5 MCP tools", true);
  v += box(cx + rx, cy, 130, "Safety clamp", "7 invariants", false);
  v += box(cx, cy + ry, 140, "HVAC + lights", "setpoints", false);
  const pts = Array.from({ length: 30 }, (_, i) => `${cx - 70 + i * 4.8} ${cy - 8 + Math.sin(i / 3) * 6 + Math.sin(i / 1.3) * 2}`).join(" L");
  v += `<path d="M${pts}" fill="none" stroke="${C.teal2}" stroke-width="1.6" pathLength="1" stroke-dasharray="1 1">
<animate attributeName="stroke-dashoffset" values="1;0;0" keyTimes="0;0.6;1" dur="4s" repeatCount="indefinite"/></path>
<text x="${cx}" y="${cy + 14}" class="mono" font-size="10.5" fill="${C.mute}" text-anchor="middle">every 15 simulated minutes</text>`;
  return card({
    kicker: "PHYSICAL AI · HONEYWELL HACKATHON", title: "EcoLoop",
    lines: ["An LLM agent that runs a building's HVAC inside a live", "EnergyPlus simulation, behind a hard safety layer."],
    chips: ["Python", "MCP", "Groq", "Pydantic", "EnergyPlus"],
    visual: v,
  });
}

function cardEvoke() {
  const n = 54, x0 = 40, gap = 9.9;
  const r = rng(5);
  let v = `<defs><linearGradient id="wv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.teal}"/><stop offset="1" stop-color="${C.teal3}"/></linearGradient></defs>`;
  for (let i = 0; i < n; i++) {
    const env = Math.sin((i / (n - 1)) * Math.PI);
    const h = 10 + env * (30 + r() * 40);
    v += `<rect x="${(x0 + i * gap).toFixed(1)}" y="${(76 - h / 2).toFixed(1)}" width="5" height="${h.toFixed(1)}" rx="2.5" fill="url(#wv)" class="bar" style="animation-delay:${(-r() * 1.4).toFixed(2)}s;animation-duration:${(0.9 + r() * 0.8).toFixed(2)}s"/>`;
  }
  const steps = ["Transcribe", "Schema-conditioned RAG", "Humility gate", "Their voice"];
  let x = 40;
  steps.forEach((s, i) => {
    v += `<text x="${x}" y="144" class="mono" font-size="11" fill="${i === 2 ? C.teal : C.mute}">${s}</text>`;
    x += s.length * 6.6 + 10;
    if (i < steps.length - 1) { v += `<text x="${x}" y="144" class="mono" font-size="11" fill="${C.border}">→</text>`; x += 20; }
  });
  return card({
    kicker: "RESEARCH · PUBLISHED PAPER", title: "Evoke",
    lines: ["Models how one person speaks, with a gate that stops it", "from inventing opinions they never held."],
    chips: ["AWS Bedrock", "LangChain", "Serverless", "ElevenLabs"],
    visual: v,
    css: `.bar{transform-box:fill-box;transform-origin:center;animation:wave 1.2s ease-in-out infinite alternate}
@keyframes wave{0%{transform:scaleY(.25)}100%{transform:scaleY(1)}}`,
  });
}

function cardLeBy() {
  const D = 5;
  let v = `<rect x="44" y="34" width="70" height="90" rx="8" fill="${C.panel}" stroke="#3d4a55" stroke-width="1.5"/>`;
  for (let i = 0; i < 6; i++) v += `<rect x="56" y="${50 + i * 11}" width="${i % 3 === 2 ? 30 : 46}" height="4" rx="2" fill="#3d4a55"/>`;
  v += `<text x="79" y="146" class="mono" font-size="11" fill="${C.mute}" text-anchor="middle">PDF</text>`;
  const gx = 252, gy = 44;
  const lit = new Set([1, 6, 8]);
  for (let i = 0; i < 12; i++) {
    const x = gx + (i % 4) * 26, y = gy + Math.floor(i / 4) * 26;
    v += `<circle cx="${x}" cy="${y}" r="6" fill="#26323c">${lit.has(i) ? `<animate attributeName="fill" values="#26323c;#26323c;${C.teal};${C.teal};#26323c" keyTimes="${kt([0, 0.42, 0.46, 0.92, 1])}" dur="${D}s" repeatCount="indefinite"/>` : ""}</circle>`;
  }
  v += `<text x="${gx + 39}" y="146" class="mono" font-size="11" fill="${C.mute}" text-anchor="middle">FAISS index</text>`;
  for (let k = 0; k < 4; k++) {
    const t0 = k * 0.07;
    v += `<rect x="122" y="${58 + k * 12}" width="26" height="8" rx="3" fill="${C.teal2}" opacity="0">
<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="${kt([0, t0, t0 + 0.02, t0 + 0.22, t0 + 0.26, 1])}" dur="${D}s" repeatCount="indefinite"/>
<animateTransform attributeName="transform" type="translate" values="0 0;0 0;100 ${-10 + k * 4};100 ${-10 + k * 4}" keyTimes="${kt([0, t0, t0 + 0.24, 1])}" dur="${D}s" repeatCount="indefinite"/></rect>`;
  }
  v += `<line x1="350" y1="70" x2="398" y2="70" stroke="${C.border}" stroke-width="2"/>
<rect x="402" y="30" width="170" height="92" rx="10" fill="${C.panel}" stroke="#3d4a55" stroke-width="1.5"/>`;
  [[130, 0.5], [150, 0.55], [100, 0.6]].forEach(([w, t], i) => {
    v += `<rect x="418" y="${46 + i * 14}" width="${w}" height="6" rx="3" fill="#56636e" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="${kt([0, t, t + 0.03, 0.92, 1])}" dur="${D}s" repeatCount="indefinite"/></rect>`;
  });
  [["[1]", 418], ["[2]", 452]].forEach(([s, x], i) => {
    const t = 0.68 + i * 0.05;
    v += `<g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="${kt([0, t, t + 0.03, 0.92, 1])}" dur="${D}s" repeatCount="indefinite"/>
<rect x="${x}" y="94" width="28" height="18" rx="5" fill="${C.teal}" fill-opacity="0.15" stroke="${C.teal}"/>
<text x="${x + 14}" y="107" class="mono" font-size="10.5" fill="${C.teal}" text-anchor="middle">${s}</text></g>`;
  });
  v += `<text x="487" y="146" class="mono" font-size="11" fill="${C.mute}" text-anchor="middle">grounded answer</text>`;
  return card({
    kicker: "RAG · LEGAL ASSISTANT", title: "LeBy",
    lines: ["Plain-English answers over Indian law. A router sends", "document questions to RAG and general ones to the LLM."],
    chips: ["FAISS", "Gemini", "LangChain", "FastAPI", "React"],
    visual: v,
  });
}

for (const f of readdirSync(OUT)) if (f.endsWith(".svg")) unlinkSync(join(OUT, f));
const files = {
  "hero.svg": hero(),
  "card-scheduler-ai.svg": cardScheduler(),
  "card-ecoloop.svg": cardEcoLoop(),
  "card-evoke.svg": cardEvoke(),
  "card-leby.svg": cardLeBy(),
};
for (const [f, s] of Object.entries(files)) {
  writeFileSync(join(OUT, f), s);
  console.log(f, (s.length / 1024).toFixed(1) + "KB");
}
