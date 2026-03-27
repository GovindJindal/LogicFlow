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

  // ── Physics ────────────────────────────────────────────────────────
  const VZ = 5.1;
  const P_MAX = 500; // mW
  
  // ── Chart setup ──────────────────────────────────────────────
  const ctxChart = document.getElementById('regChart').getContext('2d');
  const chart = new Chart(ctxChart, {
    type: 'line',
    data: {
      datasets: [
        { label: 'Vout', data: [], borderColor: '#10B981', borderWidth: 2.5, pointRadius: 0, tension: 0 },
        { label: 'Op Point', data: [], borderColor: '#F43F5E', backgroundColor: '#F43F5E', pointRadius: 6, pointHoverRadius: 8, showLine: false },
        { label: 'Ideal Unregulated', data: [], borderColor: 'rgba(0,0,0,0.1)', borderWidth: 1.5, borderDash: [5,5], pointRadius: 0, tension: 0 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false, animation: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { type: 'linear', min: 0, max: 15, title: { display: true, text: 'Vin (V)', color: '#475569', font:{family:'JetBrains Mono',size:10,weight:600} },
             ticks:{color:'#64748B',font:{family:'JetBrains Mono',size:9}}, grid:{color:'rgba(0,0,0,0.05)'}, border:{color:'rgba(0,0,0,0.1)'} },
        y: { min: 0, max: 8, title: { display: true, text: 'Vout (V)', color: '#475569', font:{family:'JetBrains Mono',size:10,weight:600} },
             ticks:{color:'#64748B',font:{family:'JetBrains Mono',size:9}}, grid:{color:'rgba(0,0,0,0.05)'}, border:{color:'rgba(0,0,0,0.1)'} }
      }
    }
  });

  function solveCircuit(vin, rs, rl) {
    // If Zener is OFF, it acts as an open circuit. Voltage divider controls Vout.
    let vout = vin * (rl / (rs + rl));
    let iz = 0;
    
    // If voltage divider voltage exceeds VZ, Zener turns ON and clamps voltage.
    if (vout > VZ) {
      vout = VZ;
      // KCL at node Vout: (Vin - Vz)/Rs = Iz + Vz/RL  =>  Iz = (Vin - Vz)/Rs - Vz/RL
      iz = ((vin - VZ) / rs) - (VZ / rl);
    }
    
    const il = vout / rl;
    const pz = vout * iz * 1000; // mW
    
    return { vout, iz, il, pz, openVout: vin * (rl/(rs+rl)) };
  }

  function updateLab() {
    const vin = parseFloat(document.getElementById('sid-vin').value);
    const rs = parseFloat(document.getElementById('sid-rs').value);
    const rl = parseFloat(document.getElementById('sid-rl').value);
    
    // UI Updates
    document.getElementById('lbl-vin').textContent = vin.toFixed(1) + ' V';
    document.getElementById('lbl-rs').textContent = rs + ' Ω';
    document.getElementById('lbl-rl').textContent = rl >= 1000 ? (rl/1000).toFixed(1) + ' kΩ' : rl + ' Ω';
    
    // Slider tracks
    document.getElementById('sid-vin').style.background = `linear-gradient(to right, #F43F5E ${(vin/15)*100}%, rgba(0,0,0,0.1) ${(vin/15)*100}%)`;
    document.getElementById('sid-rs').style.background = `linear-gradient(to right, #F59E0B ${((rs-50)/950)*100}%, rgba(0,0,0,0.1) ${((rs-50)/950)*100}%)`;
    document.getElementById('sid-rl').style.background = `linear-gradient(to right, #1A56DB ${((rl-100)/9900)*100}%, rgba(0,0,0,0.1) ${((rl-100)/9900)*100}%)`;

    // Calculation
    const state = solveCircuit(vin, rs, rl);
    
    document.getElementById('m-vout').textContent = state.vout.toFixed(2) + ' V';
    document.getElementById('m-iz').textContent = (state.iz * 1000).toFixed(2) + ' mA';
    document.getElementById('m-il').textContent = (state.il * 1000).toFixed(2) + ' mA';
    document.getElementById('m-power').textContent = state.pz.toFixed(1) + ' mW';
    
    // Status Card
    const sc = document.getElementById('statusCard');
    if (state.pz > P_MAX) {
      sc.style.background = 'rgba(244,63,94,0.1)'; sc.style.borderColor = 'rgba(244,63,94,0.4)'; sc.style.color = '#e11d48';
      sc.innerHTML = '🔥 WARNING: Zener power dissipation exceeded! Diode will burn out.';
    } else if (state.iz > 0.001) {
      sc.style.background = 'rgba(16,185,129,0.1)'; sc.style.borderColor = 'rgba(16,185,129,0.4)'; sc.style.color = '#059669';
      sc.innerHTML = '✅ REGULATING: Zener is in breakdown region maintaining ~5.1V.';
    } else {
      sc.style.background = 'rgba(100,116,139,0.1)'; sc.style.borderColor = 'rgba(100,116,139,0.3)'; sc.style.color = '#475569';
      sc.innerHTML = '⭕ OFF: Input voltage too low to reach breakdown voltage (Open circuit).';
    }

    // Chart Update
    const pts = [], idealPts = [];
    for (let v = 0; v <= 15; v += 0.5) {
      const s = solveCircuit(v, rs, rl);
      pts.push({x: v, y: s.vout});
      idealPts.push({x: v, y: s.openVout});
    }
    chart.data.datasets[0].data = pts;
    chart.data.datasets[1].data = [{x: vin, y: state.vout}];
    chart.data.datasets[2].data = idealPts;
    chart.update();
  }

  updateLab();