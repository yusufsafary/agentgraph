const cv = document.getElementById('sky');
if (cv) {
  const ctx = cv.getContext('2d');
  let W, H, nodes = [], edges = [], tick = 0;
  function size(){ const h = document.querySelector('.hero'); W = cv.width = h.offsetWidth; H = cv.height = h.offsetHeight; }
  size(); addEventListener('resize', size);
  function spawn(){
    const cx = W/2, cy = H*0.30, r = Math.pow(Math.random(), .6) * Math.min(W, 900) * .46, a = Math.random()*Math.PI*2;
    const n = { x: cx + Math.cos(a)*r, y: cy + Math.sin(a)*r*.62, flaw: Math.random() < .03 };
    if (nodes.length){
      edges.push([nodes[nodes.length-1], n]);
      let best=null,bd=1e12; for (const o of nodes){ const d=(o.x-n.x)**2+(o.y-n.y)**2; if(d<bd){bd=d;best=o;} }
      if (best && best !== nodes[nodes.length-1]) edges.push([best, n]);
    }
    nodes.push(n);
    if (nodes.length > 130){ nodes = []; edges = []; }
  }
  function draw(){
    ctx.clearRect(0,0,W,H); ctx.lineWidth = 1;
    for (const [a,b] of edges){ ctx.strokeStyle = 'rgba(201,162,39,.34)'; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }
    for (const n of nodes){
      const s = n.flaw ? 7 : 4.5, pulse = .75 + .25*Math.sin(tick/22 + n.x);
      ctx.save(); ctx.translate(n.x, n.y); ctx.rotate(Math.PI/4); ctx.globalAlpha = pulse;
      if (n.flaw){ ctx.fillStyle = '#e9c96a'; ctx.fillRect(-s/2,-s/2,s,s); }
      else { ctx.strokeStyle = '#edeae2'; ctx.lineWidth = 1.3; ctx.strokeRect(-s/2,-s/2,s,s); }
      ctx.restore();
    }
    tick++; if (tick % 26 === 0) spawn();
    requestAnimationFrame(draw);
  }
  for (let i=0;i<46;i++) spawn();
  draw();
}
function nextSeal(){
  const now = new Date(); const s = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 7, 0, 0));
  if (now >= s) s.setUTCDate(s.getUTCDate() + 1);
  return s;
}
function tickClock(){
  const el = document.getElementById('st-count'); if (!el) return;
  let ms = nextSeal() - new Date(); if (ms < 0) ms = 0;
  const h = String(Math.floor(ms/3600000)).padStart(2,'0'), m = String(Math.floor(ms%3600000/60000)).padStart(2,'0'), sec = String(Math.floor(ms%60000/1000)).padStart(2,'0');
  el.textContent = h + ':' + m + ':' + sec;
}
tickClock(); setInterval(tickClock, 1000);
