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
        { xf: .08, yf: .68, rf: .33, color: [200, 160, 255], speed: 0.00016, phase: 0.7 },
        { xf: .88, yf: .72, rf: .32, color: [100, 120, 255], speed: 0.00019, phase: 3.1 },
        { xf: .42, yf: .85, rf: .28, color: [130, 90, 255], speed: 0.00014, phase: 4.5 },
      ];
      function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
      }
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
          g.addColorStop(0.5, `rgba(${R},${G},${B},0.20)`);
          g.addColorStop(1, `rgba(${R},${G},${B},0)`);
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fillStyle = g; ctx.fill();
        }
        const vx = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.min(W, H) * 0.9);
        vx.addColorStop(0, 'rgba(255,255,255,0)');
        vx.addColorStop(1, 'rgba(255,255,255,0.30)');
        ctx.fillStyle = vx; ctx.fillRect(0, 0, W, H);
        requestAnimationFrame(draw);
      }
      resize();
      window.addEventListener('resize', resize);
      requestAnimationFrame(draw);
  })();

  // ── Physics ──────────────────────────────────────────────────
  const Is = 1e-12, n = 1;
  function vt(t) { return (1.380649e-23 * (t + 273.15)) / 1.602176634e-19; }
  function idiode(v, t) { return Is * (Math.exp(v / (n * vt(t))) - 1); }
  function fmtCurrent(amps) {
    const a = Math.abs(amps);
    if (a < 1e-6) return { v: (amps*1e9).toFixed(2), u: 'nA' };
    if (a < 1e-3) return { v: (amps*1e6).toFixed(2), u: 'µA' };
    return { v: (amps*1e3).toFixed(3), u: 'mA' };
  }

  // ── State ────────────────────────────────────────────────────
  let bias = 'forward', voltage = 0, temperature = 25;

  // ── Chart setup ──────────────────────────────────────────────
  const ctxChart = document.getElementById('viChart').getContext('2d');
  const chart = new Chart(ctxChart, {
    type: 'line',
    data: {
      datasets: [
        { label: 'V-I Curve', data: [], borderColor: '#1A56DB', borderWidth: 2.5, pointRadius: 0, tension: 0.4 },
        { label: 'Q-point',   data: [], borderColor: '#F59E0B', backgroundColor: '#F59E0B', pointRadius: 7, pointHoverRadius: 9, showLine: false },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false, animation: false,
      plugins: { legend: { display: false }, tooltip: {
        backgroundColor: '#fff', titleColor: '#475569', bodyColor: '#0f0f1a', borderColor: 'rgba(0,0,0,0.1)', borderWidth: 1,
        callbacks: { label: (i) => `I = ${fmtCurrent(i.parsed.y/1000).v} ${fmtCurrent(i.parsed.y/1000).u}` }
      }},
      scales: {
        x: { type: 'linear', title: { display: true, text: 'Voltage (V)', color: '#475569', font: { family: 'JetBrains Mono', size: 10, weight: 600 } },
             ticks: { color: '#64748B', font: { family: 'JetBrains Mono', size: 9 } },
             grid: { color: 'rgba(0,0,0,0.05)' }, border: { color: 'rgba(0,0,0,0.1)' } },
        y: { title: { display: true, text: 'Current (mA)', color: '#475569', font: { family: 'JetBrains Mono', size: 10, weight: 600 } },
             ticks: { color: '#64748B', font: { family: 'JetBrains Mono', size: 9 } },
             grid: { color: 'rgba(0,0,0,0.05)' }, border: { color: 'rgba(0,0,0,0.1)' } }
      }
    }
  });

  function buildCurve() {
    const pts = [];
    const isF = bias === 'forward';
    const vMin = isF ? -0.5 : -2.0, vMax = isF ? 1.0 : 0.4;
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const v = vMin + (vMax - vMin) * i / steps;
      const iA = idiode(v, temperature);
      const iMa = Math.max(Math.min(iA * 1000, isF ? 150 : 20), isF ? -5 : -5);
      pts.push({ x: v, y: iMa });
    }
    return pts;
  }

  function updateAll() {
    const pts = buildCurve();
    chart.data.datasets[0].data = pts;

    // Axis domains
    const isF = bias === 'forward';
    chart.options.scales.x.min = isF ? -0.5 : -2;
    chart.options.scales.x.max = isF ? 1.0  : 0.4;
    chart.options.scales.y.min = isF ? -5   : -5;
    chart.options.scales.y.max = isF ? 120  : 20;

    // Q-point
    const iA  = idiode(voltage, temperature);
    const iMa = Math.max(Math.min(iA * 1000, isF ? 150 : 20), isF ? -5 : -5);
    chart.data.datasets[1].data = [{ x: voltage, y: iMa }];

    chart.update();

    // Labels
    document.getElementById('vLabel').textContent = (voltage >= 0 ? '+' : '') + parseFloat(voltage).toFixed(2) + ' V';
    document.getElementById('tLabel').textContent = temperature + ' °C';
    document.getElementById('vtVal').textContent = (vt(temperature)*1000).toFixed(2) + ' mV';
    document.getElementById('qpointLabel').textContent = `Q-point: (${parseFloat(voltage).toFixed(2)} V, ${iMa.toFixed(2)} mA)`;

    // Multimeter
    document.getElementById('mVolt').textContent = parseFloat(voltage).toFixed(3) + ' V';
    const fmt = fmtCurrent(iA);
    document.getElementById('mCurr').textContent = fmt.v + ' ' + fmt.u;
    document.getElementById('mPower').textContent = Math.abs(voltage * iA * 1000).toFixed(3) + ' mW';

    let status = 'CUT-OFF', statusColor = '#64748B';
    if (bias === 'reverse') { status = 'REVERSE BIAS'; statusColor = '#F43F5E'; }
    else if (voltage >= 0.7) { status = 'CONDUCTING'; statusColor = '#10B981'; }
    else if (voltage >= 0.3) { status = 'NEAR THRESHOLD'; statusColor = '#F59E0B'; }
    document.getElementById('mStatus').textContent = status;
    document.getElementById('mStatus').style.color = statusColor;

    // Observation card
    updateObs(voltage, bias);
  }

  function updateObs(v, b) {
    let title, color, borderColor, bgColor, points;
    if (b === 'reverse') {
      title = '⬅ Reverse Bias'; color='#F43F5E'; borderColor='rgba(244,63,94,.35)'; bgColor='rgba(244,63,94,.05)';
      points = ['Depletion region widens — barrier increases.', 'Only tiny leakage current (nA range).', 'Diode acts as open switch.'];
    } else if (v < 0.3) {
      title = '⬜ Cut-off Region'; color='#475569'; borderColor='rgba(0,0,0,.15)'; bgColor='rgba(255,255,255,.6)';
      points = ['Applied voltage below threshold.', 'Depletion barrier not overcome.', 'No significant current flow.'];
    } else if (v < 0.7) {
      title = '🔶 Near Threshold (0.7V knee)'; color='#F59E0B'; borderColor='rgba(245,158,11,.35)'; bgColor='rgba(245,158,11,.05)';
      points = ['Approaching knee voltage for silicon.', 'Current beginning to rise exponentially.', 'Depletion region narrowing.'];
    } else {
      title = '✅ Active Conduction'; color='#10B981'; borderColor='rgba(16,185,129,.35)'; bgColor='rgba(16,185,129,.05)';
      points = ['Knee voltage exceeded — diode conducting.', 'Current rises sharply (exponential).', 'Forward voltage drop ≈ 0.7 V.'];
    }
    const card = document.getElementById('obsCard');
    card.style.borderColor = borderColor; card.style.background = bgColor;
    document.getElementById('obsTitle').textContent = title;
    document.getElementById('obsTitle').style.color = color;
    document.getElementById('obsPoints').innerHTML = points.map(p =>
      `<div class="obs-point"><span style="color:${color};flex-shrink:0;font-weight:700">→</span><span>${p}</span></div>`
    ).join('');
  }

  // ── Event handlers ───────────────────────────────────────────
  function onVChange(v) {
    voltage = parseFloat(v);
    const isF = bias === 'forward';
    document.getElementById('vSlider').style.background =
      `linear-gradient(to right, #1A56DB ${((voltage - (isF?-0.5:-2))/(isF?1.5:2.4)*100)}%, rgba(0,0,0,0.1) ${((voltage-(isF?-0.5:-2))/(isF?1.5:2.4)*100)}%)`;
    updateAll();
  }

  function onTChange(v) {
    temperature = parseInt(v);
    document.getElementById('tSlider').style.background =
      `linear-gradient(to right, #F59E0B ${v}%, rgba(0,0,0,0.1) ${v}%)`;
    updateAll();
  }

  function setBias(mode) {
    bias = mode;
    document.getElementById('fwdBtn').classList.toggle('active', mode === 'forward');
    document.getElementById('revBtn').classList.toggle('active', mode === 'reverse');
    document.getElementById('biasDesc').textContent = mode === 'forward'
      ? 'P-side positive → current flows above 0.7V'
      : 'P-side negative → depletion region widens';
    
    const isF = mode === 'forward';
    document.getElementById('vSlider').min = isF ? -0.5 : -2;
    document.getElementById('vSlider').max = isF ? 1.2 : 0.5;
    document.getElementById('vMin').textContent = isF ? '-0.5V' : '-2.0V';
    document.getElementById('vMax').textContent = isF ? '+1.2V' : '+0.5V';
    voltage = 0;
    document.getElementById('vSlider').value = 0;
    
    // Reset gradient tracks
    document.getElementById('vSlider').style.background = `linear-gradient(to right, #1A56DB ${((0 - (isF?-0.5:-2))/(isF?1.5:2.4)*100)}%, rgba(0,0,0,0.1) ${((0-(isF?-0.5:-2))/(isF?1.5:2.4)*100)}%)`;
    
    updateAll();
  }

  function resetLab() {
    bias = 'forward'; voltage = 0; temperature = 25;
    document.getElementById('vSlider').value = 0;
    document.getElementById('tSlider').value = 25;
    document.getElementById('tSlider').style.background = `linear-gradient(to right, #F59E0B 25%, rgba(0,0,0,0.1) 25%)`;
    setBias('forward');
  }

  function printReport() {
    const iA = idiode(voltage, temperature);
    const iMa = (iA * 1000).toFixed(3);
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>Lab Report — PN Junction Diode</title>
      <style>body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;color:#111}
      h1{color:#1A56DB;border-bottom:2px solid #1A56DB;padding-bottom:8px}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0}
      .box{border:1px solid #ddd;border-radius:6px;padding:12px}
      .box h3{font-size:.8rem;color:#666;margin-bottom:4px}
      .box p{font-size:1.1rem;font-weight:700;color:#111}
      table{width:100%;border-collapse:collapse;margin:16px 0}
      th{background:#1A56DB;color:#fff;padding:8px;text-align:left;font-size:.8rem}
      td{padding:7px 8px;border-bottom:1px solid #eee;font-size:.82rem}
      </style></head><body>
      <h1>LogicFlow — Lab Report</h1>
      <p><strong>Experiment:</strong> PN Junction Diode Characteristics</p>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')} &nbsp; <strong>Bias Mode:</strong> ${bias.toUpperCase()}</p>
      <h2>Current Operating Point</h2>
      <div class="grid">
        <div class="box"><h3>Voltage</h3><p>${parseFloat(voltage).toFixed(3)} V</p></div>
        <div class="box"><h3>Current</h3><p>${iMa} mA</p></div>
        <div class="box"><h3>Power</h3><p>${Math.abs(voltage*iA*1000).toFixed(3)} mW</p></div>
        <div class="box"><h3>Temperature</h3><p>${temperature} °C</p></div>
      </div>
      <h2>Observation Table</h2>
      <table><tr><th>V (Volts)</th><th>I (mA)</th><th>Region</th></tr>
      ${[0,.1,.2,.3,.4,.5,.6,.65,.7,.75].map(v=>{
        const i=(idiode(v,temperature)*1000);
        const r=v<0.3?'Cut-off':v<0.7?'Near Threshold':'Forward Active';
        return `<tr><td>${v.toFixed(2)}</td><td>${Math.min(i,150).toFixed(4)}</td><td>${r}</td></tr>`;
      }).join('')}
      </table>
      <h2>Conclusion</h2>
      <p>The V-I characteristics of the PN junction diode were successfully plotted. The exponential nature of forward conduction confirms the Shockley equation. Knee voltage observed at approximately 0.7V.</p>
      <br><hr><p>Student Signature: _________________ &nbsp; Faculty Signature: _________________</p>
      </body></html>`);
    w.document.close(); w.print();
  }

  // Init
  document.getElementById('tSlider').style.background = `linear-gradient(to right, #F59E0B 25%, rgba(0,0,0,0.1) 25%)`;
  updateAll();