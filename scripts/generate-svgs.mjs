// Generates the animated SVGs for the GitHub profile README.
// Usage (from the repo root): node scripts/generate-svgs.mjs   writes ./assets/*.svg
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), "..", "assets");
mkdirSync(OUT, { recursive: true });

const C = {
  bg: "#0d1117", panel: "#161b22", border: "#30363d", text: "#e6edf3",
  mute: "#8b949e", dim: "#484f58", teal: "#00d4b4", tealMid: "#00a08a", tealDim: "#0a6b5e",
};
const MONO = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,'Liberation Mono',monospace";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// deterministic PRNG so the output is stable between runs
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function frame(W, H, css, body, { card = true } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${MONO}">
<style>
text{font-family:${MONO}}
${css}
</style>
<defs>
  <clipPath id="card"><rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14"/></clipPath>
  <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="${C.border}"/></pattern>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
</defs>
${card ? `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="${C.bg}" stroke="${C.border}"/>` : ""}
<g clip-path="url(#card)">
${body}
</g>
</svg>
`;
}

/* ------------------------------------------------------------------ header */
function header() {
  const W = 1000, H = 360;
  const r = rng(7);
  const glyphs = "01<>/{}#$%&*+=?λΣΔ∇∂";
  let b = "";
  // dot grid, drifting
  b += `<rect x="-22" y="-22" width="${W + 44}" height="${H + 44}" fill="url(#dots)" opacity="0.55">
  <animateTransform attributeName="transform" type="translate" values="0 0;22 22" dur="7s" repeatCount="indefinite"/></rect>`;
  // breathing glow behind the name
  b += `<defs><radialGradient id="hg" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${C.teal}" stop-opacity="0.22"/><stop offset="1" stop-color="${C.teal}" stop-opacity="0"/></radialGradient></defs>
<ellipse cx="250" cy="150" rx="300" ry="130" fill="url(#hg)" class="breathe"/>`;
  // scanner line
  b += `<rect x="0" y="-4" width="${W}" height="2" fill="${C.teal}" opacity="0.22">
  <animateTransform attributeName="transform" type="translate" values="0 0;0 ${H + 8};0 ${H + 8}" keyTimes="0;0.45;1" dur="9s" repeatCount="indefinite"/></rect>`;

  // prompt line
  b += `<text x="44" y="46" font-size="13" fill="${C.mute}">$ python -m mayukh.generate --temperature 0.2</text>
<rect x="436" y="35" width="8" height="14" fill="${C.teal}" class="blink"/>`;

  // name, decoded letter by letter
  const words = [["MAYUKH", 128], ["BANERJEE", 202]];
  let idx = 0;
  for (const [word, y] of words) {
    [...word].forEach((ch, i) => {
      const x = 66 + i * 44;
      const start = 0.25 + idx * 0.06;
      for (let k = 0; k < 3; k++) {
        const g = glyphs[Math.floor(r() * glyphs.length)];
        b += `<text x="${x}" y="${y}" font-size="64" font-weight="800" fill="${C.teal}" text-anchor="middle" class="g" style="animation-delay:${(start + k * 0.07).toFixed(2)}s">${esc(g)}</text>`;
      }
      b += `<text x="${x}" y="${y}" font-size="64" font-weight="800" fill="${C.text}" text-anchor="middle" class="f" style="animation-delay:${start.toFixed(2)}s">${ch}</text>`;
      idx++;
    });
  }
  b += `<text x="46" y="246" font-size="15" fill="${C.mute}">ai/ml engineer <tspan fill="${C.teal}">·</tspan> retrieval <tspan fill="${C.teal}">·</tspan> agents <tspan fill="${C.teal}">·</tspan> llm systems <tspan fill="${C.teal}">·</tspan> bangalore</text>`;

  // next-token panel
  const px = 600, py = 30, pw = 370, ph = 222;
  b += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="10" fill="${C.panel}" stroke="${C.border}"/>
<text x="${px + 18}" y="${py + 26}" font-size="12" fill="${C.mute}">p(next token | context)</text>
<text x="${px + pw - 18}" y="${py + 26}" font-size="12" fill="${C.dim}" text-anchor="end">top_p=0.9</text>
<line x1="${px}" y1="${py + 38}" x2="${px + pw}" y2="${py + 38}" stroke="${C.border}"/>`;
  const ctxs = [
    ["the model parses, the code", [["validates", 0.52], ["ranks", 0.24], ["decides", 0.17], ["guesses", 0.07]]],
    ["retrieve, rerank, then", [["generate", 0.41], ["ground", 0.33], ["cite", 0.19], ["hallucinate", 0.07]]],
    ["i learned it from the", [["bottom", 0.47], ["paper", 0.26], ["docs", 0.18], ["stack trace", 0.09]]],
  ];
  ctxs.forEach(([ctx, opts], ci) => {
    const d = `animation-delay:${ci * 4}s`;
    b += `<g class="ctx${ci === 0 ? " first" : ""}" style="${d}">
<text x="${px + 18}" y="${py + 64}" font-size="15" fill="${C.text}">${esc(ctx)}</text>
<text x="${px + 18}" y="${py + 86}" font-size="15" fill="${C.teal}" class="tok${ci === 0 ? " first" : ""}" style="${d}">→ ${esc(opts[0][0])}</text>`;
    opts.forEach(([w, p], i) => {
      const y = py + 112 + i * 26;
      const bw = 150;
      b += `<text x="${px + 18}" y="${y + 4}" font-size="13" fill="${i === 0 ? C.text : C.mute}">${esc(w)}</text>
<rect x="${px + 150}" y="${y - 7}" width="${bw}" height="12" rx="3" fill="${C.border}" opacity="0.5"/>
<rect x="${px + 150}" y="${y - 7}" width="${(bw * p / 0.55).toFixed(1)}" height="12" rx="3" fill="${i === 0 ? C.teal : C.tealDim}" class="bar${ci === 0 ? " first" : ""}" style="${d}"/>
<text x="${px + pw - 18}" y="${y + 4}" font-size="13" fill="${i === 0 ? C.teal : C.mute}" text-anchor="end">${p.toFixed(2)}</text>`;
    });
    b += `</g>`;
  });

  // attention arcs over a token row
  const toks = ["&lt;bos&gt;", "query", "embed", "retrieve", "rerank", "ground", "generate", "verify", "&lt;eos&gt;"];
  const tx = (i) => 70 + i * 107.5;
  const ty = 338;
  const pairs = [[1, 3, 2.2], [1, 6, 1.4], [3, 5, 2.6], [4, 6, 1.8], [5, 7, 2.4], [2, 3, 1.2], [6, 7, 2], [1, 8, 1], [3, 6, 1.6], [0, 1, 1]];
  pairs.forEach(([a, c, w], i) => {
    const x1 = tx(a), x2 = tx(c);
    const h = Math.min(58, 16 + (c - a) * 8);
    b += `<path d="M${x1} ${ty - 16} Q${(x1 + x2) / 2} ${ty - 16 - h * 2} ${x2} ${ty - 16}" fill="none" stroke="${C.teal}" stroke-width="${w}" stroke-linecap="round" class="att" style="animation-delay:${(-i * 0.73).toFixed(2)}s"/>`;
  });
  toks.forEach((t, i) => {
    b += `<text x="${tx(i)}" y="${ty}" font-size="12" fill="${C.mute}" text-anchor="middle">${t}</text>`;
  });
  b += `<text x="${W - 26}" y="${ty - 62}" font-size="10" fill="${C.dim}" text-anchor="end">attn · head 3/8</text>`;

  const css = `
.g{opacity:0;animation:g 10s linear infinite}
.f{animation:f 10s linear infinite}
@keyframes g{0%{opacity:1}0.65%{opacity:1}0.7%{opacity:0}100%{opacity:0}}
@keyframes f{0%{opacity:0}2.05%{opacity:0}2.1%{opacity:1}100%{opacity:1}}
.blink{animation:blink 1.1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.breathe{animation:breathe 6s ease-in-out infinite}
@keyframes breathe{0%,100%{opacity:.55}50%{opacity:1}}
.ctx{opacity:0;animation:ctx 12s infinite}
@keyframes ctx{0%{opacity:0}2%{opacity:1}31%{opacity:1}33.3%{opacity:0}100%{opacity:0}}
.bar{transform-box:fill-box;transform-origin:left center;transform:scaleX(0);animation:bar 12s cubic-bezier(.2,.8,.2,1) infinite}
@keyframes bar{0%,3%{transform:scaleX(0)}11%{transform:scaleX(1)}31%{transform:scaleX(1)}33.3%,100%{transform:scaleX(0)}}
.tok{opacity:0;animation:tok 12s infinite}
@keyframes tok{0%,12%{opacity:0}14%{opacity:1}31%{opacity:1}33.3%,100%{opacity:0}}
.ctx.first,.tok.first{opacity:1}
.bar.first{transform:none}
.att{stroke-opacity:.08;animation:att 6s ease-in-out infinite}
@keyframes att{0%,100%{stroke-opacity:.08}50%{stroke-opacity:.85}}
`;
  return frame(W, H, css, b);
}

/* ------------------------------------------------------------- agent graph */
function agent() {
  const W = 1000, H = 300, cy = 150, nw = 118, nh = 56, dur = 4.2;
  const nodes = [
    ["message", "user text", false],
    ["parse", "→ Intent(json)", true],
    ["frame", "missing? ask", false],
    ["retrieve", "indexed query", false],
    ["rank", "score(prefs)", false],
    ["verify", "slot ∈ free", false],
    ["reply", "→ text", true],
  ];
  const cx = (i) => 89 + i * 135;
  const span = cx(6) - cx(0);
  let b = `<rect width="${W}" height="${H}" fill="url(#dots)" opacity="0.35"/>
<text x="28" y="34" font-size="13" fill="${C.mute}">// the model sits at the edges. everything that has to be right is code.</text>`;
  // edges
  for (let i = 0; i < 6; i++) {
    b += `<line x1="${cx(i) + nw / 2}" y1="${cy}" x2="${cx(i + 1) - nw / 2 - 4}" y2="${cy}" stroke="${C.dim}" stroke-width="1.5" marker-end="url(#arr)"/>`;
  }
  b = `<defs><marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" fill="${C.dim}"/></marker>
<marker id="arrT" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" fill="${C.tealMid}"/></marker></defs>` + b;
  // back edges
  b += `<path d="M${cx(5)} ${cy - nh / 2} C${cx(5)} ${cy - 92} ${cx(3)} ${cy - 92} ${cx(3)} ${cy - nh / 2 - 4}" fill="none" stroke="${C.tealMid}" stroke-dasharray="4 4" marker-end="url(#arrT)" class="dash"/>
<text x="${(cx(3) + cx(5)) / 2}" y="${cy - 80}" font-size="11" fill="${C.mute}" text-anchor="middle">slot taken → search again</text>
<path d="M${cx(2)} ${cy + nh / 2} C${cx(2)} ${cy + 92} ${cx(0)} ${cy + 92} ${cx(0)} ${cy + nh / 2 + 4}" fill="none" stroke="${C.tealMid}" stroke-dasharray="4 4" marker-end="url(#arrT)" class="dash"/>
<text x="${(cx(0) + cx(2)) / 2}" y="${cy + 88}" font-size="11" fill="${C.mute}" text-anchor="middle">field missing → ask, don't guess</text>`;
  // edge labels for model zones
  b += `<text x="${cx(1)}" y="${cy - 44}" font-size="11" fill="${C.teal}" text-anchor="middle">language in</text>
<text x="${cx(6)}" y="${cy - 44}" font-size="11" fill="${C.teal}" text-anchor="middle">language out</text>`;
  // packets (under nodes)
  for (let k = 0; k < 3; k++) {
    b += `<circle r="4.5" fill="${C.teal}"><animateMotion dur="${dur}s" begin="${(-k * dur / 3).toFixed(2)}s" repeatCount="indefinite" path="M${cx(0)} ${cy} L${cx(6)} ${cy}"/></circle>`;
  }
  // nodes
  nodes.forEach(([name, sub, model], i) => {
    const x = cx(i) - nw / 2, y = cy - nh / 2;
    const t = ((cx(i) - cx(0)) / span) * dur;
    b += `<rect x="${x - 3}" y="${y - 3}" width="${nw + 6}" height="${nh + 6}" rx="12" fill="none" stroke="${C.teal}" stroke-width="3" filter="url(#glow)" class="halo" style="animation-delay:${(t - 0.25).toFixed(2)}s"/>
<rect x="${x}" y="${y}" width="${nw}" height="${nh}" rx="10" fill="${model ? C.teal : C.panel}" stroke="${model ? C.teal : C.border}" stroke-width="1.5"/>
<text x="${cx(i)}" y="${cy - 4}" font-size="14" font-weight="700" fill="${model ? C.bg : C.text}" text-anchor="middle">${esc(name)}</text>
<text x="${cx(i)}" y="${cy + 15}" font-size="11" fill="${model ? C.bg : C.mute}" text-anchor="middle" opacity="${model ? 0.8 : 1}">${esc(sub)}</text>`;
  });
  // legend
  b += `<rect x="28" y="${H - 34}" width="12" height="12" rx="3" fill="${C.teal}"/>
<text x="48" y="${H - 24}" font-size="12" fill="${C.mute}">llm call</text>
<rect x="128" y="${H - 34}" width="12" height="12" rx="3" fill="${C.panel}" stroke="${C.mute}"/>
<text x="148" y="${H - 24}" font-size="12" fill="${C.mute}">plain code over typed state</text>
<text x="${W - 28}" y="${H - 24}" font-size="12" fill="${C.dim}" text-anchor="end">langgraph · StateGraph · 2 of 7 nodes call a model</text>`;
  const css = `
.halo{opacity:0;animation:halo ${dur}s ease-out infinite}
@keyframes halo{0%{opacity:0}5%{opacity:.9}16%{opacity:0}100%{opacity:0}}
.dash{animation:dash 1.2s linear infinite}
@keyframes dash{to{stroke-dashoffset:-16}}
`;
  return frame(W, H, css, b);
}

/* --------------------------------------------------------------- retrieval */
function rag() {
  const W = 1000, H = 330, D = 9; // cycle seconds
  const r = rng(42);
  const kt = (a) => a.map((v) => v.toFixed(3)).join(";");
  let b = `<text x="28" y="34" font-size="13" fill="${C.mute}">// retrieval: what the model reads before it writes</text>`;
  const panel = (x, title) =>
    `<rect x="${x}" y="52" width="296" height="250" rx="10" fill="${C.panel}" stroke="${C.border}"/>
<text x="${x + 16}" y="76" font-size="12" fill="${C.text}">${title}</text>`;

  // A: embedding space
  b += panel(26, `<tspan fill="${C.teal}">1</tspan> embed → ANN top-k`);
  const q = [174, 192];
  const pts = [];
  while (pts.length < 44) {
    const p = [44 + r() * 260, 98 + r() * 170];
    if (Math.hypot(p[0] - q[0], p[1] - q[1]) > 12) pts.push(p);
  }
  // put a few points near the query so top-k is a tight cluster
  [[150, 176], [199, 205], [160, 222], [205, 168], [186, 228]].forEach((p) => pts.push(p));
  const withD = pts.map((p) => ({ p, d: Math.hypot(p[0] - q[0], p[1] - q[1]) })).sort((a, b) => a.d - b.d);
  const K = 5, R = withD[K - 1].d + 8;
  const ringEnd = 0.25;
  withD.forEach(({ p, d }, i) => {
    const hit = i < K;
    if (hit) {
      const t = Math.min(ringEnd, (d / R) * ringEnd);
      b += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4" fill="${C.dim}">
<animate attributeName="fill" values="${C.dim};${C.dim};${C.teal};${C.teal};${C.dim}" keyTimes="${kt([0, t, t + 0.01, 0.95, 1])}" dur="${D}s" repeatCount="indefinite"/>
<animate attributeName="r" values="4;4;6;5;5;4" keyTimes="${kt([0, t, t + 0.02, t + 0.05, 0.95, 1])}" dur="${D}s" repeatCount="indefinite"/></circle>`;
    } else {
      b += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="${C.dim}" opacity="0.8"/>`;
    }
  });
  b += `<circle cx="${q[0]}" cy="${q[1]}" r="0" fill="${C.teal}" fill-opacity="0.07" stroke="${C.teal}" stroke-dasharray="3 3">
<animate attributeName="r" values="0;${R.toFixed(1)};${R.toFixed(1)};0" keyTimes="0;${ringEnd};0.95;1" dur="${D}s" repeatCount="indefinite"/></circle>
<path d="M${q[0]} ${q[1] - 8}l2.4 5.2 5.6.6-4.2 3.8 1.2 5.5-5-2.9-5 2.9 1.2-5.5-4.2-3.8 5.6-.6z" fill="${C.text}"/>
<text x="42" y="290" font-size="11" fill="${C.mute}">cosine · hnsw · k=5</text>`;

  // B: rerank
  const bx = 352;
  b += panel(bx, `<tspan fill="${C.teal}">2</tspan> rerank against the query`);
  const chunks = [
    ["c03", 0.82, 0.64, 2], ["c12", 0.8, 0.91, 0], ["c07", 0.79, 0.86, 1], ["c21", 0.77, 0.41, 3], ["c09", 0.74, 0.22, 4],
  ];
  const rowY = (i) => 100 + i * 38;
  const t0 = 0.3, t1 = 0.42; // reorder window
  chunks.forEach(([id, s0, s1, to], i) => {
    const dy = rowY(to) - rowY(i);
    const keep = to < 3;
    b += `<g>
<animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 ${dy};0 ${dy};0 0" keyTimes="${kt([0, t0, t1, 0.95, 1])}" dur="${D}s" repeatCount="indefinite"/>
<rect x="${bx + 14}" y="${rowY(i) - 13}" width="268" height="28" rx="6" fill="${C.bg}" stroke="${C.border}">
${keep ? "" : `<animate attributeName="opacity" values="1;1;0.35;0.35;1" keyTimes="${kt([0, t1, t1 + 0.04, 0.95, 1])}" dur="${D}s" repeatCount="indefinite"/>`}
</rect>
<text x="${bx + 28}" y="${rowY(i) + 5}" font-size="12" fill="${C.text}">${id}</text>
<rect x="${bx + 70}" y="${rowY(i) - 4}" width="${(150 * s0).toFixed(1)}" height="8" rx="3" fill="${C.tealDim}">
<animate attributeName="width" values="${(150 * s0).toFixed(1)};${(150 * s0).toFixed(1)};${(150 * s1).toFixed(1)};${(150 * s1).toFixed(1)};${(150 * s0).toFixed(1)}" keyTimes="${kt([0, t0 - 0.06, t0, 0.95, 1])}" dur="${D}s" repeatCount="indefinite"/>
<animate attributeName="fill" values="${C.tealDim};${C.tealDim};${keep ? C.teal : C.dim};${keep ? C.teal : C.dim};${C.tealDim}" keyTimes="${kt([0, t1, t1 + 0.04, 0.95, 1])}" dur="${D}s" repeatCount="indefinite"/></rect>
<text x="${bx + 270}" y="${rowY(i) + 5}" font-size="12" fill="${C.mute}" text-anchor="end">${s0.toFixed(2)}<animate attributeName="opacity" values="1;1;0;0;1" keyTimes="${kt([0, t0 - 0.06, t0 - 0.05, 0.95, 1])}" dur="${D}s" repeatCount="indefinite"/></text>
<text x="${bx + 270}" y="${rowY(i) + 5}" font-size="12" fill="${keep ? C.teal : C.dim}" text-anchor="end" opacity="0">${s1.toFixed(2)}<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="${kt([0, t0 - 0.05, t0 - 0.04, 0.95, 1])}" dur="${D}s" repeatCount="indefinite"/></text>
</g>`;
  });
  b += `<text x="${bx + 16}" y="290" font-size="11" fill="${C.mute}">keep top 3 · drop the rest</text>`;

  // C: pack + generate
  const cx = 678;
  b += panel(cx, `<tspan fill="${C.teal}">3</tspan> pack the window, then write`);
  const segs = [["sys", 34, C.dim], ["c12", 54, C.teal], ["c07", 48, C.tealMid], ["c03", 40, C.tealDim], ["q", 22, C.mute]];
  let sx = cx + 16;
  const cw = 264;
  b += `<text x="${cx + 16}" y="104" font-size="11" fill="${C.mute}">context window</text>
<text x="${cx + 280}" y="104" font-size="11" fill="${C.dim}" text-anchor="end">token budget</text>
<rect x="${cx + 16}" y="112" width="${cw}" height="26" rx="5" fill="none" stroke="${C.border}" stroke-dasharray="3 3"/>`;
  segs.forEach(([lab, w, col], i) => {
    const t = 0.5 + i * 0.04;
    b += `<g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="${kt([0, t, t + 0.02, 0.95, 1])}" dur="${D}s" repeatCount="indefinite"/>
<rect x="${sx + 1}" y="113" width="${w - 2}" height="24" rx="4" fill="${col}"/>
<text x="${sx + w / 2}" y="129" font-size="10" fill="${C.bg}" text-anchor="middle" font-weight="700">${lab}</text></g>`;
    sx += w;
  });
  b += `<text x="${sx + (cx + 16 + cw - sx) / 2}" y="129" font-size="10" fill="${C.dim}" text-anchor="middle">headroom</text>`;
  const lines = [
    [`generate(ctx, temperature=0.2)`, C.text],
    [`claims ⊂ retrieved chunks  ✓`, C.teal],
    [`cites [c12, c07]`, C.mute],
    [`nothing found → say so`, C.mute],
  ];
  lines.forEach(([l, col], i) => {
    const t = 0.72 + i * 0.05;
    b += `<text x="${cx + 16}" y="${176 + i * 26}" font-size="12" fill="${col}" opacity="0">${esc(l)}<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="${kt([0, t, t + 0.02, 0.95, 1])}" dur="${D}s" repeatCount="indefinite"/></text>`;
  });
  b += `<text x="${cx + 16}" y="290" font-size="11" fill="${C.mute}">grounded or silent</text>`;
  // connectors with packets
  [[322, 352], [648, 678]].forEach(([a, c], i) => {
    b += `<line x1="${a}" y1="177" x2="${c}" y2="177" stroke="${C.dim}" stroke-width="1.5"/>
<circle r="3.5" fill="${C.teal}"><animateMotion dur="1.4s" begin="${i * 0.7}s" repeatCount="indefinite" path="M${a} 177 L${c} 177"/></circle>`;
  });
  return frame(W, H, "", b);
}

/* ------------------------------------------------------------------- stack */
function stack() {
  const layers = [
    ["regression & classification", "least squares · logistic · gradient descent · bias/variance"],
    ["neural networks", "backprop · activations · regularisation · overfitting"],
    ["transformers", "self-attention · positional encoding · encoder/decoder"],
    ["embeddings & vector search", "cosine · ann indexes · hybrid tf-idf + dense"],
    ["next-token prediction", "n-grams · softmax · temperature · top-p"],
    ["small language models", "size vs quality · local inference · fine-tuning"],
    ["memory & caching", "prompt caching · repeated-data cache · redis"],
    ["system architecture", "batch jobs · retries · idempotency · queues"],
  ];
  const W = 1000, rh = 32, gap = 7, top = 52;
  const H = top + layers.length * (rh + gap) + 22;
  let b = `<rect width="${W}" height="${H}" fill="url(#dots)" opacity="0.3"/>
<text x="28" y="32" font-size="13" fill="${C.mute}">// training data, read bottom up</text>
<text x="${W - 28}" y="32" font-size="12" fill="${C.dim}" text-anchor="end">abstraction ↑</text>`;
  const n = layers.length;
  const axisTop = top, axisBot = top + n * (rh + gap) - gap;
  b += `<line x1="44" y1="${axisTop}" x2="44" y2="${axisBot}" stroke="${C.border}" stroke-width="2"/>
<circle r="4" fill="${C.teal}"><animateMotion dur="5s" repeatCount="indefinite" path="M44 ${axisBot} L44 ${axisTop}"/></circle>`;
  layers.forEach(([name, kw], i) => {
    const lvl = n - 1 - i; // index 0 drawn at bottom
    const y = top + lvl * (rh + gap);
    const d = `animation-delay:${(i * 0.45).toFixed(2)}s`;
    b += `<rect x="64" y="${y}" width="${W - 92}" height="${rh}" rx="7" fill="${C.panel}" stroke="${C.border}"/>
<rect x="64" y="${y}" width="${W - 92}" height="${rh}" rx="7" fill="${C.teal}" stroke="${C.teal}" class="lit" style="${d}"/>
<text x="80" y="${y + 21}" font-size="11" fill="${C.dim}">${String(i + 1).padStart(2, "0")}</text>
<text x="110" y="${y + 21}" font-size="14" font-weight="700" fill="${C.text}" class="lab" style="${d}">${esc(name)}</text>
<text x="${W - 44}" y="${y + 21}" font-size="12" fill="${C.mute}" text-anchor="end">${esc(kw)}</text>`;
  });
  const css = `
.lit{fill-opacity:0;stroke-opacity:0;animation:lit 9s ease-out infinite}
@keyframes lit{0%{fill-opacity:0;stroke-opacity:0}4%{fill-opacity:.16;stroke-opacity:1}12%{fill-opacity:.07;stroke-opacity:.6}62%{fill-opacity:.07;stroke-opacity:.6}70%,100%{fill-opacity:0;stroke-opacity:0}}
.lab{animation:lab 9s ease-out infinite}
@keyframes lab{0%{fill:${C.text}}4%{fill:${C.teal}}62%{fill:${C.teal}}70%,100%{fill:${C.text}}}
`;
  return frame(W, H, css, b);
}

/* ----------------------------------------------------------------- divider */
function divider() {
  const W = 1000, H = 18;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><linearGradient id="p" x1="0" x2="1"><stop offset="0" stop-color="${C.teal}" stop-opacity="0"/><stop offset="0.8" stop-color="${C.teal}"/><stop offset="1" stop-color="${C.teal}" stop-opacity="0"/></linearGradient></defs>
<line x1="0" y1="9" x2="${W}" y2="9" stroke="${C.border}" stroke-width="1"/>
<rect x="-160" y="8" width="160" height="2" fill="url(#p)"><animateTransform attributeName="transform" type="translate" values="0 0;${W + 160} 0" dur="3.6s" repeatCount="indefinite"/></rect>
<circle cx="-14" cy="9" r="2.5" fill="${C.teal}"><animateTransform attributeName="transform" type="translate" values="0 0;${W + 160} 0" dur="3.6s" repeatCount="indefinite"/></circle>
</svg>
`;
}

/* ------------------------------------------------------------- loss footer */
function loss() {
  const W = 1000, H = 220, x0 = 70, x1 = 930, y0 = 40, y1 = 170, D = 8;
  const r = rng(3);
  const N = 120;
  const tr = [], va = [];
  for (let e = 0; e <= N; e++) {
    const x = x0 + (e / N) * (x1 - x0);
    const base = 1 - Math.exp(-e / 17);
    const noise = (r() - 0.5) * 14 * (1 - e / (N * 1.25));
    tr.push([x, y0 + 8 + 112 * base + noise]);
    va.push([x, y0 + 14 + 100 * (1 - Math.exp(-e / 21)) + (r() - 0.5) * 5]);
  }
  const path = (pts) => "M" + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L");
  const pT = path(tr), pV = path(va);
  let b = `<rect width="${W}" height="${H}" fill="url(#dots)" opacity="0.3"/>
<line x1="${x0}" y1="${y1 + 8}" x2="${x1}" y2="${y1 + 8}" stroke="${C.border}"/>
<line x1="${x0}" y1="${y0 - 10}" x2="${x0}" y2="${y1 + 8}" stroke="${C.border}"/>
<text x="${x0 - 12}" y="${y0}" font-size="11" fill="${C.mute}" text-anchor="end">loss</text>
<text x="${x1}" y="${y1 + 28}" font-size="11" fill="${C.mute}" text-anchor="end">epoch →</text>
<path d="${pV}" fill="none" stroke="${C.mute}" stroke-width="1.5" stroke-dasharray="4 5" opacity="0.7"/>
<path d="${pT}" fill="none" stroke="${C.teal}" stroke-width="2.2" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1">
<animate attributeName="stroke-dashoffset" values="1;0;0" keyTimes="0;0.7;1" dur="${D}s" repeatCount="indefinite"/></path>
<circle r="5" fill="${C.teal}"><animateMotion dur="${D}s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;0.7;1" calcMode="linear" path="${pT}"/></circle>
<line x1="${x1 - 190}" y1="${y0 - 4}" x2="${x1 - 166}" y2="${y0 - 4}" stroke="${C.teal}" stroke-width="2.2"/>
<text x="${x1 - 158}" y="${y0}" font-size="11" fill="${C.mute}">train</text>
<line x1="${x1 - 108}" y1="${y0 - 4}" x2="${x1 - 84}" y2="${y0 - 4}" stroke="${C.mute}" stroke-width="1.5" stroke-dasharray="4 5"/>
<text x="${x1 - 76}" y="${y0}" font-size="11" fill="${C.mute}">val</text>
<text x="${x0}" y="${H - 14}" font-size="12" fill="${C.tealMid}">epochs=∞ · lr &gt; 0 · early_stopping=False</text>`;
  return frame(W, H, "", b);
}

const files = { "header.svg": header(), "agent.svg": agent(), "retrieval.svg": rag(), "stack.svg": stack(), "divider.svg": divider(), "loss.svg": loss() };
for (const [f, s] of Object.entries(files)) {
  writeFileSync(join(OUT, f), s);
  console.log(f, (s.length / 1024).toFixed(1) + "KB");
}
