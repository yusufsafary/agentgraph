// AgentGraph board: countdown, hero constellation, live on-chain reads,
// cutting-room canvas. Reads race several BSC RPCs; page works without them.
const FACETS = "0x3c34E1D8137DB14A3E97c1B8F174Cac66504070f";
const CLAIM = "0x812A7C87857494F03Be64FFAB66Bb1E1D65fE1Be";
const RPCS = ["https://bsc-dataseed.binance.org", "https://bsc-dataseed1.defibit.io", "https://bsc.publicnode.com", "https://bsc-dataseed.bnbchain.org", "https://bsc-dataseed1.ninicoin.io"];
const SEL = {
  totalFacets: "0x7037a74c", currentGraph: "0x87f38529", facetsInGraph: "0x8be7a2c7",
  participantsOf: "0xe200c857", verdictOf: "0xbcaa6cf7", mintOpen: "0x24bbd049",
  totalClaimed: "0xd54ad2a1", claimOpen: "0x4b8bcb58",
};
const pad64 = (n) => BigInt(n).toString(16).padStart(64, "0");
async function rpc(method, params) {
  const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method, params });
  const tries = RPCS.map((u) => fetch(u, { method: "POST", headers: { "Content-Type": "application/json" }, body })
    .then((r) => r.json()).then((j) => { if (j.error) throw new Error("rpc"); return j.result; }));
  return Promise.any(tries);
}
async function readUint(addr, data) {
  const r = await rpc("eth_call", [{ to: addr, data }, "latest"]);
  return Number(BigInt(r));
}
const $ = (id) => document.getElementById(id);
const JA = document.documentElement.lang === "ja";
const pad3 = (n) => String(n).padStart(3, "0");

// ---------- countdown to next 07:00 UTC seal ----------
function nextSeal() {
  const n = new Date(); const s = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate(), 7, 0, 0));
  if (n >= s) s.setUTCDate(s.getUTCDate() + 1);
  return s;
}
function tickClock() {
  const t = Math.max(0, nextSeal() - new Date());
  const h = Math.floor(t / 36e5), m = Math.floor(t / 6e4) % 60, s = Math.floor(t / 1e3) % 60;
  const txt = [h, m, s].map((x) => String(x).padStart(2, "0")).join(":");
  for (const id of ["st-count", "cr-count"]) { const el = $(id); if (el) el.textContent = txt; }
}
tickClock(); setInterval(tickClock, 1000);

// ---------- hero constellation canvas ----------
const sky = $("sky");
if (sky) {
  const ctx = sky.getContext("2d");
  let W, H, nodes = [], edges = [], t0 = performance.now();
  function seed() {
    W = sky.width = sky.offsetWidth * devicePixelRatio;
    H = sky.height = sky.offsetHeight * devicePixelRatio;
    nodes = []; edges = [];
    const N = innerWidth < 700 ? 42 : 74;
    let s = 1234567;
    const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    for (let i = 0; i < N; i++) nodes.push({ x: rnd() * W, y: rnd() * H, r: (rnd() * 2.2 + 1.4) * devicePixelRatio, p: rnd() * 6.28 });
    for (let i = 1; i < N; i++) edges.push([i - 1, i]);
    for (let i = 7; i < N; i += 9) edges.push([i - 7, i]);
  }
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(201,162,39,.34)"; ctx.lineWidth = devicePixelRatio * .8;
    for (const [a, b] of edges) { ctx.beginPath(); ctx.moveTo(nodes[a].x, nodes[a].y); ctx.lineTo(nodes[b].x, nodes[b].y); ctx.stroke(); }
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i], tw = .55 + .45 * Math.sin(t / 900 + n.p);
      ctx.save(); ctx.translate(n.x, n.y); ctx.rotate(Math.PI / 4);
      const r = n.r * (i === nodes.length - 1 ? 1.9 : 1) * tw;
      ctx.fillStyle = i === nodes.length - 1 ? "rgba(255,205,84,.95)" : "rgba(237,234,226,.85)";
      ctx.fillRect(-r / 1.4, -r / 1.4, r * 1.4, r * 1.4); ctx.restore();
    }
    requestAnimationFrame(draw);
  }
  seed(); addEventListener("resize", seed); requestAnimationFrame(draw);
  addEventListener("scroll", () => { sky.style.transform = "translateY(" + Math.min(60, scrollY * .08) + "px)"; }, { passive: true });
}
// countdown pop each second
let lastSec = "";
setInterval(() => {
  const el = $("st-count");
  if (el && el.textContent !== lastSec) { lastSec = el.textContent; el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); }
}, 250);

// ---------- cutting-room canvas ----------
const gc = $("graphCanvas");
let gNodes = [], gCount = 0, gGraph = 1;
function layoutGraph() {
  if (!gc) return;
  const W = gc.width, H = gc.height;
  let s = gGraph * 7919 + 17;
  const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const n = gCount === 0 ? 26 : Math.min(gCount, 160);
  gNodes = [];
  for (let i = 0; i < n; i++) {
    const a = i * 2.39996, r = 26 + Math.sqrt(i / Math.max(1, n)) * (Math.min(W, H) / 2 - 44);
    gNodes.push({ x: W / 2 + Math.cos(a) * r * (W / H) * .82, y: H / 2 + Math.sin(a) * r * .86, ghost: gCount === 0, p: rnd() * 6.28 });
  }
}
layoutGraph();
if (gc) {
  const g2 = gc.getContext("2d");
  (function drawG(t) {
    const W = gc.width, H = gc.height;
    g2.clearRect(0, 0, W, H);
    g2.strokeStyle = "rgba(201,162,39,.4)"; g2.lineWidth = 1.1;
    for (let i = 1; i < gNodes.length; i++) { g2.beginPath(); g2.moveTo(gNodes[i - 1].x, gNodes[i - 1].y); g2.lineTo(gNodes[i].x, gNodes[i].y); g2.stroke(); }
    gNodes.forEach((n, i) => {
      const tw = .6 + .4 * Math.sin(t / 800 + n.p);
      const last = i === gNodes.length - 1 && !n.ghost;
      g2.save(); g2.translate(n.x, n.y); g2.rotate(Math.PI / 4);
      const r = (last ? 9 : 5.2) * (n.ghost ? 1.15 + .3 * tw : 1);
      g2.fillStyle = n.ghost ? "rgba(237,234,226," + (.55 * tw) + ")" : last ? "rgba(255,205,84,.98)" : "rgba(233,201,106,.9)";
      g2.fillRect(-r / 1.4, -r / 1.4, r * 1.4, r * 1.4); g2.restore();
      if (last) { g2.beginPath(); g2.arc(n.x, n.y, 17 + 3 * Math.sin(t / 300), 0, 6.29); g2.strokeStyle = "rgba(255,205,84,.5)"; g2.stroke(); }
    });
    requestAnimationFrame(drawG);
  })(0);
}

// ---------- live reads ----------
async function refresh() {
  try {
    const g = await readUint(FACETS, SEL.currentGraph);
    const [facets, agents, claimed, mintOpen, claimOpen] = await Promise.all([
      readUint(FACETS, SEL.facetsInGraph + pad64(g)),
      readUint(FACETS, SEL.participantsOf + pad64(g)),
      readUint(CLAIM, SEL.totalClaimed),
      readUint(FACETS, SEL.mintOpen),
      readUint(CLAIM, SEL.claimOpen),
    ]);
    gGraph = g;
    if (facets !== gCount || gNodes.length === 0) { gCount = facets; layoutGraph(); }
    const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
    set("st-facets", facets); set("st-agents", agents);
    set("cr-facets", facets); set("cr-agents", agents); set("cr-claimed", claimed);
    const gl = $("cr-graph"); if (gl) gl.textContent = JA ? "グラフ Nº " + pad3(g) + " · 形成中" : "GRAPH Nº " + pad3(g) + " · FORMING";
    const bl = $("board-graph"); if (bl) bl.textContent = "GRAPH Nº " + pad3(g) + " · FORMING";
    const needle = $("bs-needle");
    if (needle) needle.style.left = Math.min(100, (agents / 120) * 100) + "%";
    const pm = $("stamp-mint"); if (pm) { pm.classList.toggle("off", !mintOpen); const st = $("stamp-state"); if (st) st.textContent = mintOpen ? "OPEN" : "PAUSED"; }
    const pc = $("pill-claim");
    if (pc) {
      const firstSealPassed = Date.now() / 1000 >= 1795503600;
      pc.textContent = JA ? (claimOpen && firstSealPassed ? "クレーム受付中" : "シール時にオープン") : (claimOpen && firstSealPassed ? "CLAIM OPEN" : "CLAIM OPENS AT SEAL");
      pc.classList.toggle("off", !(claimOpen && firstSealPassed));
    }
  } catch (e) { /* reads retry on next cycle */ }
}
refresh(); setInterval(refresh, 45000);
