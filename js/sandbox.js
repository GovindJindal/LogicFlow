// ── Dropdown Logic ──────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    const expBtn = document.getElementById('experimentDropdownBtn');
    const expDropdown = document.getElementById('experimentDropdown');
    if (expBtn && expDropdown) {
      expBtn.addEventListener('click', (e) => { e.preventDefault(); expDropdown.classList.toggle('show'); });
      document.addEventListener('click', (e) => { if (!e.target.closest('.dropdown')) expDropdown.classList.remove('show'); });
    }
  });

(function () {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return; // bgCanvas removed, skip old animation
  const ctx = canvas.getContext('2d');
  let W, H;
  const blobs = [
    { xf: .15, yf: .15, rf: .45, color: [120, 100, 255], speed: 0.00018, phase: 0 },
    { xf: .78, yf: .10, rf: .40, color: [90, 140, 255], speed: 0.00013, phase: 1.2 },
    { xf: .50, yf: .55, rf: .38, color: [160, 80, 240], speed: 0.00021, phase: 2.4 },
    { xf: .08, yf: .68, rf: .33, color: [200, 160, 255], speed: 0.00016, phase: 0.7 },
    { xf: .88, yf: .72, rf: .32, color: [100, 120, 255], speed: 0.00019, phase: 3.1 },
    { xf: .42, yf: .85, rf: .28, color: [130, 90, 255], speed: 0.00014, phase: 4.5 },
  ];
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  function draw(ts) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#eceeff'; ctx.fillRect(0, 0, W, H);
    for (const b of blobs) {
      const angle = ts * b.speed + b.phase;
      const cx = (b.xf + Math.sin(angle * 1.3) * 0.12) * W;
      const cy = (b.yf + Math.cos(angle * 0.9) * 0.10) * H;
      const r  = b.rf * Math.min(W, H) * (0.9 + 0.1 * Math.sin(angle * 2.1));
      const [R, G, B] = b.color;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0,   `rgba(${R},${G},${B},0.58)`);
      g.addColorStop(0.5, `rgba(${R},${G},${B},0.20)`);
      g.addColorStop(1,   `rgba(${R},${G},${B},0)`);
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
    }
    const vx = ctx.createRadialGradient(W/2, H/2, Math.min(W,H)*.3, W/2, H/2, Math.min(W,H)*.9);
    vx.addColorStop(0, 'rgba(255,255,255,0)');
    vx.addColorStop(1, 'rgba(255,255,255,0.30)');
    ctx.fillStyle = vx; ctx.fillRect(0, 0, W, H);
    requestAnimationFrame(draw);
  }
  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(draw);
})();