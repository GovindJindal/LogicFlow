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

  // ── Logic ──────────────────────────────────────────
  let ffType = 'D';
  let state = { CLK: 0, D: 0, J: 0, K: 0, PRE: 0, CLR: 0, Q: 0 };
  
  function setFF(t) {
    ffType = t;
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-${t.toLowerCase()}`).classList.add('active');
    
    // Update inputs
    const grid = document.getElementById('inputGrid');
    if (t === 'D') {
      grid.innerHTML = `
        <div class="logic-switch" id="sw-D" onclick="toggle('D')"><span class="sw-label">D (Data)</span><div class="sw-track"><div class="sw-thumb"></div></div></div>
        <div class="logic-switch" style="opacity:0;pointer-events:none"></div>
      `;
      document.getElementById('wrap-D').style.display = 'block';
      document.getElementById('wrap-JK').style.display = 'none';
      if(typeof resizeTiming === 'function') resizeTiming();
    } else {
      grid.innerHTML = `
        <div class="logic-switch" id="sw-J" onclick="toggle('J')"><span class="sw-label">J</span><div class="sw-track"><div class="sw-thumb"></div></div></div>
        <div class="logic-switch" id="sw-K" onclick="toggle('K')"><span class="sw-label">K</span><div class="sw-track"><div class="sw-thumb"></div></div></div>
      `;
      document.getElementById('wrap-D').style.display = 'none';
      document.getElementById('wrap-JK').style.display = 'block';
      if(typeof resizeTiming === 'function') resizeTiming();
    }
    state = { CLK:0, D:0, J:0, K:0, PRE:0, CLR:0, Q:0 };
    updateLEDs();
  }

  function toggle(pin) {
    state[pin] = 1 - state[pin];
    const sw = document.getElementById(`sw-${pin}`);
    if (state[pin]) sw.classList.add('on'); else sw.classList.remove('on');
    evalLogic(false); // Evaluate asynchronous inputs
  }

  function pulseClock(val) {
    if (state.CLK === val) return;
    const isRisingEdge = (state.CLK === 0 && val === 1);
    state.CLK = val;
    evalLogic(isRisingEdge);
    if(val) document.getElementById('clockBtn').style.background = 'rgba(26,86,219,0.3)';
    else document.getElementById('clockBtn').style.background = '';
  }

  function evalLogic(clockRisingEdge) {
    // Asynchronous Overrides
    if (state.CLR) { state.Q = 0; }
    else if (state.PRE) { state.Q = 1; }
    // Synchronous clocked actions
    else if (clockRisingEdge) {
      if (ffType === 'D') {
        state.Q = state.D;
      } else if (ffType === 'JK') {
        if (state.J === 0 && state.K === 0) { /* No change */ }
        else if (state.J === 1 && state.K === 0) state.Q = 1;
        else if (state.J === 0 && state.K === 1) state.Q = 0;
        else if (state.J === 1 && state.K === 1) state.Q = 1 - state.Q; // Toggle
      }
    }
    updateLEDs();
  }

  function updateLEDs() {
    const qLed = document.getElementById('led-Q');
    const qnLed = document.getElementById('led-Qn');
    if (state.Q) {
      qLed.classList.add('on'); qnLed.classList.remove('on');
    } else {
      qLed.classList.remove('on'); qnLed.classList.add('on');
    }
  }

  // ── Timing Diagram Canvas ──────────────────────────────────────────
  const tCavD = document.getElementById('timingCanvasD');
  const tCtxD = tCavD.getContext('2d');
  const tCavJK = document.getElementById('timingCanvasJK');
  const tCtxJK = tCavJK.getContext('2d');
  
  function resizeTiming() { 
    tCavD.width = tCavD.offsetWidth; tCavD.height = tCavD.offsetHeight; 
    tCavJK.width = tCavJK.offsetWidth; tCavJK.height = tCavJK.offsetHeight;
  }
  window.addEventListener('resize', resizeTiming);

  // History buffers
  const histD = [];
  const histJK = [];
  const maxHist = 200;

  function renderTiming() {
    // Poll state
    if (ffType === 'D') {
      histD.push({ clk: state.CLK, d: state.D, q: state.Q, qn: 1 - state.Q });
      if (histD.length > maxHist) histD.shift();
      
      tCtxD.clearRect(0,0,tCavD.width,tCavD.height);
      tCtxD.strokeStyle = '#334155'; tCtxD.lineWidth = 1; tCtxD.beginPath();
      for(let i=1;i<=3;i++) { tCtxD.moveTo(0, i*(tCavD.height/4)); tCtxD.lineTo(tCavD.width, i*(tCavD.height/4)); }
      tCtxD.stroke();

      const dx = tCavD.width / maxHist;
      const h = tCavD.height;
      drawWave(tCtxD, histD.map(x=>x.clk), 0, h/4, '#1A56DB', dx); // CLK
      drawWave(tCtxD, histD.map(x=>x.d), h/4, h/4, '#10B981', dx); // D
      drawWave(tCtxD, histD.map(x=>x.q), 2*(h/4), h/4, '#F59E0B', dx); // Q
      drawWave(tCtxD, histD.map(x=>x.qn), 3*(h/4), h/4, '#F43F5E', dx); // Qn
    } else {
      histJK.push({ clk: state.CLK, j: state.J, k: state.K, q: state.Q, qn: 1 - state.Q });
      if (histJK.length > maxHist) histJK.shift();
      
      tCtxJK.clearRect(0,0,tCavJK.width,tCavJK.height);
      tCtxJK.strokeStyle = '#334155'; tCtxJK.lineWidth = 1; tCtxJK.beginPath();
      for(let i=1;i<=4;i++) { tCtxJK.moveTo(0, i*(tCavJK.height/5)); tCtxJK.lineTo(tCavJK.width, i*(tCavJK.height/5)); }
      tCtxJK.stroke();

      const dx = tCavJK.width / maxHist;
      const h = tCavJK.height;
      drawWave(tCtxJK, histJK.map(x=>x.clk), 0, h/5, '#1A56DB', dx); // CLK
      drawWave(tCtxJK, histJK.map(x=>x.j), h/5, h/5, '#10B981', dx); // J
      drawWave(tCtxJK, histJK.map(x=>x.k), 2*(h/5), h/5, '#10B981', dx); // K
      drawWave(tCtxJK, histJK.map(x=>x.q), 3*(h/5), h/5, '#F59E0B', dx); // Q
      drawWave(tCtxJK, histJK.map(x=>x.qn), 4*(h/5), h/5, '#F43F5E', dx); // Qn
    }

    requestAnimationFrame(renderTiming);
  }

  function drawWave(ctx, data, yOffset, laneHeight, color, dx) {
    if(!data.length) return;
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineJoin = 'round';
    ctx.beginPath();
    const padY = 15;
    const yHigh = yOffset + padY;
    const yLow = yOffset + laneHeight - padY;

    // Start
    ctx.moveTo(0, data[0] ? yHigh : yLow);
    for(let i=1; i<data.length; i++) {
      const prevV = data[i-1];
      const curV = data[i];
      const x = i * dx;
      
      if (prevV !== curV) {
        ctx.lineTo(x, prevV ? yHigh : yLow);
        ctx.lineTo(x, curV  ? yHigh : yLow);
      } else {
        ctx.lineTo(x, curV ? yHigh : yLow);
      }
    }
    ctx.stroke();
  }

  // Init
  setFF('D'); // Starts with D FF
  resizeTiming();
  renderTiming();