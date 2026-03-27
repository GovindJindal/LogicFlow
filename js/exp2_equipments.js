// ── Dropdown Logic ──────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    const expBtn = document.getElementById('experimentDropdownBtn');
    const expDropdown = document.getElementById('experimentDropdown');
    if (expBtn && expDropdown) {
      expBtn.addEventListener('click', (e) => { e.preventDefault(); expDropdown.classList.toggle('show'); });
      document.addEventListener('click', (e) => { if (!e.target.closest('.dropdown')) expDropdown.classList.remove('show'); });
    }
  });

  // ── Animated Background ──────────────────────────────────────────
  (function () {
      const canvas = document.getElementById('bgCanvas');
      if (!canvas) return; // bgCanvas removed, skip old animation
      const ctx = canvas.getContext('2d');
      let W, H;
      const blobs = [
        { xf: .15, yf: .15, rf: .45, color: [120, 100, 255], speed: 0.00018, phase: 0 },
        { xf: .78, yf: .10, rf: .40, color: [90, 140, 255], speed: 0.00013, phase: 1.2 },
        { xf: .50, yf: .55, rf: .38, color: [160, 80, 240], speed: 0.00021, phase: 2.4 },
        { xf: .08, yf: .68, rf: .33, color: [200, 160, 255], speed: 0.00016, phase: 0.7 }
      ];
      function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
      function draw(ts) {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#eceeff'; ctx.fillRect(0, 0, W, H);
        for (const b of blobs) {
          const angle = ts * b.speed + b.phase;
          const cx = (b.xf + Math.sin(angle * 1.3) * 0.12) * W;
          const cy = (b.yf + Math.cos(angle * 0.9) * 0.10) * H;
          const r = b.rf * Math.min(W, H) * (0.9 + 0.1 * Math.sin(angle * 2.1));
          const [R, G, B] = b.color;
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
          g.addColorStop(0, `rgba(${R},${G},${B},0.58)`);
          g.addColorStop(1, `rgba(${R},${G},${B},0)`);
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fillStyle = g; ctx.fill();
        }
        requestAnimationFrame(draw);
      }
      resize();
      window.addEventListener('resize', resize);
      requestAnimationFrame(draw);
  })();

  // ── State ────────────────────────────────────────────────────────
  let waveType = 'sine'; // sine, square, triangle
  let freq = 1000;       // Hz
  let amp = 5;           // V peak-to-peak
  let offset = 0;        // V DC offset
  
  let vdiv = 2;          // Volts per division (Vertical)
  let tdiv = 0.5;        // ms per division (Horizontal)

  function setWave(type) {
    waveType = type;
    document.querySelectorAll('.wave-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('btn-'+type).classList.add('active');
  }

  function updateGen() {
    freq = parseFloat(document.getElementById('sid-freq').value);
    amp = parseFloat(document.getElementById('sid-amp').value);
    offset = parseFloat(document.getElementById('sid-offset').value);
    
    document.getElementById('lbl-freq').textContent = freq + ' Hz';
    document.getElementById('lbl-amp').textContent = amp.toFixed(1) + ' Vpp';
    document.getElementById('lbl-offset').textContent = offset.toFixed(1) + ' V';
  }

  function updateCRO() {
    vdiv = parseFloat(document.getElementById('sid-vdiv').value);
    tdiv = parseFloat(document.getElementById('sid-tdiv').value);
    
    document.getElementById('lbl-vdiv').textContent = vdiv.toFixed(1) + ' V';
    document.getElementById('lbl-tdiv').textContent = tdiv.toFixed(1) + ' ms';
    
    document.getElementById('cro-ch1').textContent = `CH1: ${vdiv.toFixed(1)} V/DIV`;
    document.getElementById('cro-time').textContent = `TIME: ${tdiv.toFixed(1)} ms/DIV`;
  }

  // ── CRO Rendering ──────────────────────────────────────────────────
  const croCanvas = document.getElementById('croCanvas');
  const croCtx = croCanvas.getContext('2d');
  
  function resizeCRO() {
    croCanvas.width = croCanvas.offsetWidth;
    croCanvas.height = croCanvas.offsetHeight;
  }
  window.addEventListener('resize', resizeCRO);
  resizeCRO();

  let timeBase = 0;

  function drawCRO() {
    const W = croCanvas.width;
    const H = croCanvas.height;
    
    // Grid Setup
    // 10 horizontal divisions, 8 vertical divisions
    const divW = W / 10;
    const divH = H / 8;
    const midX = W / 2;
    const midY = H / 2;

    // Background & Glow
    croCtx.fillStyle = '#020617';
    croCtx.fillRect(0, 0, W, H);
    
    // Draw Grid
    croCtx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
    croCtx.lineWidth = 1;
    croCtx.beginPath();
    for(let i=1; i<10; i++) { croCtx.moveTo(i*divW, 0); croCtx.lineTo(i*divW, H); }
    for(let i=1; i<8; i++)  { croCtx.moveTo(0, i*divH); croCtx.lineTo(W, i*divH); }
    croCtx.stroke();
    
    // Draw Axes markers
    croCtx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    croCtx.beginPath();
    croCtx.moveTo(midX, 0); croCtx.lineTo(midX, H);
    croCtx.moveTo(0, midY); croCtx.lineTo(W, midY);
    // Sub-ticks
    for(let i=0; i<50; i++) {
        croCtx.moveTo(i*(W/50), midY-3); croCtx.lineTo(i*(W/50), midY+3);
        croCtx.moveTo(midX-3, i*(H/40)); croCtx.lineTo(midX+3, i*(H/40));
    }
    croCtx.stroke();

    // Signal Calculation
    // Total time across screen = 10 divisions * tdiv (ms)
    const totalTimeMs = 10 * tdiv;
    const totalTimeSec = totalTimeMs / 1000;
    
    timeBase += 0.016; // Realtime ticking (~60fps)

    croCtx.beginPath();
    croCtx.strokeStyle = '#34d399';
    croCtx.lineWidth = 2;
    croCtx.shadowBlur = 8;
    croCtx.shadowColor = '#10B981';

    const Vp = amp / 2;
    const pixelsPerVolt = divH / vdiv;

    // Trigger emulation: find zero-crossing to stabilize wave visually
    const T = 1 / freq; // Period in seconds
    const phaseShift = (timeBase % T) * 2 * Math.PI * freq;
    
    for (let x = 0; x <= W; x++) {
      // Time at this pixel relative to screen start
      const t = (x / W) * totalTimeSec;
      
      let v = 0;
      const omegaT = 2 * Math.PI * freq * t + phaseShift;

      if (waveType === 'sine') {
        v = Vp * Math.sin(omegaT);
      } else if (waveType === 'square') {
        v = Math.sign(Math.sin(omegaT)) * Vp;
      } else if (waveType === 'triangle') {
        v = (2 * Vp / Math.PI) * Math.asin(Math.sin(omegaT));
      }

      v += offset; // apply DC offset

      // Map voltage to pixel Y coordinate
      // Y goes down positively, so subtract from midY
      const py = midY - (v * pixelsPerVolt);
      
      if (x === 0) croCtx.moveTo(x, py);
      else croCtx.lineTo(x, py);
    }
    croCtx.stroke();
    croCtx.shadowBlur = 0;

    requestAnimationFrame(drawCRO);
  }

  // Start
  updateGen();
  updateCRO();
  drawCRO();