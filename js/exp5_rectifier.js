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
  let topo = 'hw'; // hw, fw
  const f = 50; // Hz
  const Vm = 10; // Peak input voltage
  const T = 1 / f;
  const diodeDrop = 0.7;

  // ── Chart setup ──────────────────────────────────────────────
  Chart.defaults.font.family = 'JetBrains Mono';
  Chart.defaults.color = '#64748B';

  const chartIn = new Chart(document.getElementById('chartIn'), {
    type: 'line', data: { datasets: [{ borderColor: '#64748B', borderWidth: 2, pointRadius: 0, tension: 0.4 }] },
    options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { type: 'linear', min: 0, max: 0.04, title: { display: true, text: 'Time (s)' }, ticks: {maxTicksLimit:5} },
                y: { min: -15, max: 15, title: { display: true, text: 'Voltage (V)' } } }
    }
  });

  const chartOut = new Chart(document.getElementById('chartOut'), {
    type: 'line', data: { datasets: [{ borderColor: '#10B981', borderWidth: 2.5, pointRadius: 0, tension: 0, fill: true, backgroundColor: 'rgba(16,185,129,0.1)' }] },
    options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { type: 'linear', min: 0, max: 0.04, title: { display: true, text: 'Time (s)' }, ticks: {maxTicksLimit:5} },
                y: { min: -5, max: 15, title: { display: true, text: 'Voltage (V)' } } }
    }
  });

  function setTopology(t) {
    topo = t;
    document.querySelectorAll('.toggle-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(`btn-${t}`).classList.add('active');
    updateLab();
  }

  function updateLab() {
    const isFilter = document.getElementById('chk-filter').checked;
    const C = parseFloat(document.getElementById('sid-cap').value) * 1e-6; // F
    const RL = parseFloat(document.getElementById('sid-load').value); // Ω
    
    document.getElementById('lbl-cap').textContent = (C * 1e6) + ' µF';
    document.getElementById('lbl-load').textContent = RL >= 1000 ? (RL/1000).toFixed(1) + ' kΩ' : RL + ' Ω';
    
    // Sliders
    document.getElementById('sid-cap').style.background = `linear-gradient(to right, #10B981 ${((C*1e6-1)/99)*100}%, rgba(0,0,0,0.1) ${((C*1e6-1)/99)*100}%)`;
    document.getElementById('sid-load').style.background = `linear-gradient(to right, #1A56DB ${((RL-100)/9900)*100}%, rgba(0,0,0,0.1) ${((RL-100)/9900)*100}%)`;

    // Timeline
    const steps = 500;
    const tMax = 0.04;
    const dt = tMax / steps;
    
    const ptsIn = [];
    const ptsOut = [];
    
    let lastVoutPeak = 0;
    let tDischargeStart = 0;
    let inDischarge = false;

    // Numerical integration for filter
    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      const vsi = Vm * Math.sin(2 * Math.PI * f * t);
      ptsIn.push({x: t, y: vsi});
      
      let vrect = 0;
      if (topo === 'hw') {
        if (vsi > diodeDrop) vrect = vsi - diodeDrop;
      } else {
        if (Math.abs(vsi) > 2 * diodeDrop) vrect = Math.abs(vsi) - 2 * diodeDrop;
      }

      if (!isFilter) {
        ptsOut.push({x: t, y: vrect});
      } else {
        // Capacitor charging/discharging logic
        if (vrect > lastVoutPeak * Math.exp(-(t - tDischargeStart) / (RL * C))) {
          // Charging (diode conducting)
          ptsOut.push({x: t, y: vrect});
          lastVoutPeak = vrect;
          tDischargeStart = t;
        } else {
          // Discharging
          const vdc = lastVoutPeak * Math.exp(-(t - tDischargeStart) / (RL * C));
          ptsOut.push({x: t, y: vdc});
        }
      }
    }

    chartIn.data.datasets[0].data = ptsIn;
    chartOut.data.datasets[0].data = ptsOut;
    chartIn.update();
    chartOut.update();

    // METRICS
    let Vdc = 0, Vrpp = 0, gamma = 0, eff = 0;
    const Vp = topo === 'hw' ? Vm - diodeDrop : Vm - 2*diodeDrop;
    
    if (!isFilter) {
        if (topo === 'hw') {
            Vdc = Vp / Math.PI;
            const Vrms = Vp / 2;
            gamma = Math.sqrt(Math.pow(Vrms/Vdc, 2) - 1) * 100;
            eff = (40.6) / (1 + diodeDrop/Vm); // Theoretical 40.6%
        } else {
            Vdc = 2 * Vp / Math.PI;
            const Vrms = Vp / Math.sqrt(2);
            gamma = Math.sqrt(Math.pow(Vrms/Vdc, 2) - 1) * 100;
            eff = (81.2) / (1 + 2*diodeDrop/Vm); // Theoretical 81.2%
        }
        Vrpp = ptsOut.reduce((max, p) => p.y > max ? p.y : max, 0) - ptsOut.reduce((min, p) => p.y < min ? p.y : min, Vm);
        // Without cap, Vrpp is just Vp
        Vrpp = Vp;
    } else {
        // Ripple approximation: Vrpp = Vp / (f * R * C) for HW, Vrpp = Vp / (2*f*R*C) for FW
        const freqMult = topo === 'hw' ? 1 : 2;
        Vrpp = Vp / (freqMult * f * RL * C);
        if (Vrpp > Vp) Vrpp = Vp; // Limit
        Vdc = Vp - (Vrpp / 2);
        
        const Vrms_ac = Vrpp / (2 * Math.sqrt(3));
        gamma = (Vrms_ac / Vdc) * 100;
        eff = 90; // Approx high efficiency with cap filter
    }

    document.getElementById('m-vdc').textContent = Vdc.toFixed(2) + ' V';
    document.getElementById('m-vrip').textContent = Vrpp.toFixed(2) + ' V';
    document.getElementById('m-gamma').textContent = gamma.toFixed(1) + ' %';
    document.getElementById('m-eff').textContent = eff > 100 ? '≈100%' : eff.toFixed(1) + ' %';
  }

  updateLab();