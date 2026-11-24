const io = new IntersectionObserver(es => {
  for (const e of es) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}, { threshold: .12 });
document.querySelectorAll('section.blk .wrap > *, .prose > *, .page .pool, table.tok, .ticker').forEach((el, i) => {
  el.classList.add('rv'); if (i % 3 === 1) el.classList.add('d1'); if (i % 3 === 2) el.classList.add('d2');
  io.observe(el);
});
document.querySelectorAll('.sec-head').forEach(el => io.observe(el));
const cio = new IntersectionObserver(es => {
  for (const e of es) {
    if (!e.isIntersecting) continue;
    const el = e.target, m = el.textContent.match(/([0-9,]+)/);
    if (m) {
      const target = parseInt(m[1].replace(/,/g, '')), t0 = performance.now(), dur = 1100;
      (function step(t) {
        const p = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - p, 3);
        el.textContent = el.textContent.replace(/[0-9,]+/, Math.round(target * ease).toLocaleString('en-US'));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }
    cio.unobserve(el);
  }
}, { threshold: .4 });
document.querySelectorAll('.lrow .amt').forEach(el => cio.observe(el));
if (matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('.pl').forEach(card => {
    card.addEventListener('mousemove', ev => {
      const r = card.getBoundingClientRect();
      const x = (ev.clientX - r.left) / r.width - .5, y = (ev.clientY - r.top) / r.height - .5;
      card.style.transform = 'perspective(800px) rotateY(' + (x * 5) + 'deg) rotateX(' + (-y * 5) + 'deg)';
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}
