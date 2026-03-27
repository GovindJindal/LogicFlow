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

    // ── Component Data ──────────────────────────────────────────
    const COMPONENTS = [
      {
        id: 'resistor', name: 'Resistor', icon: '〰️', type: 'Passive Component',
        desc: 'A passive two-terminal electrical component that implements electrical resistance as a circuit element. Used to reduce current flow, adjust signal levels, and divide voltages.',
        specs: [
          'Color bands denote resistance value and tolerance (e.g. 1kΩ ±5%).',
          "Follows Ohm's Law: V = I × R.",
          'Power rating (typically ¼W, ½W) dictates maximum heat dissipation.'
        ],
        symbol: `<svg viewBox="0 0 100 40" width="80%"><line x1="10" y1="20" x2="30" y2="20" stroke="#111" stroke-width="2"/><polyline points="30,20 35,10 45,30 55,10 65,30 70,20" fill="none" stroke="#111" stroke-width="2" stroke-linejoin="round"/><line x1="70" y1="20" x2="90" y2="20" stroke="#111" stroke-width="2"/></svg>`,
        art: `<div style="width:120px;height:30px;background:#e5c088;border-radius:15px;position:relative;border:2px solid #b38b59;box-shadow:inset 0 -4px 8px rgba(0,0,0,0.2)">
              <div style="position:absolute;left:-30px;top:13px;width:30px;height:4px;background:#94a3b8"></div>
              <div style="position:absolute;right:-30px;top:13px;width:30px;height:4px;background:#94a3b8"></div>
              <div style="position:absolute;left:20px;top:0;bottom:0;width:8px;background:#8b5cf6"></div>
              <div style="position:absolute;left:40px;top:0;bottom:0;width:8px;background:#10B981"></div>
              <div style="position:absolute;left:60px;top:0;bottom:0;width:8px;background:#111"></div>
              <div style="position:absolute;right:20px;top:0;bottom:0;width:8px;background:#d4af37"></div>
            </div>`
      },
      {
        id: 'capacitor', name: 'Capacitor', icon: '🔋', type: 'Passive Component',
        desc: 'Stores electrical energy in an electric field. Blocks direct current (DC) while allowing alternating current (AC) to pass. Widely used for filtering, smoothing, and decoupling.',
        specs: [
          'Measured in Farads (F), typically µF, nF, or pF.',
          'Electrolytic types are polarized (must be connected correctly).',
          'Ceramic types are non-polarized and used for high-frequency bypass.'
        ],
        symbol: `<svg viewBox="0 0 100 40" width="80%"><line x1="20" y1="20" x2="45" y2="20" stroke="#111" stroke-width="2"/><line x1="45" y1="10" x2="45" y2="30" stroke="#111" stroke-width="2"/><line x1="55" y1="10" x2="55" y2="30" stroke="#111" stroke-width="2"/><line x1="55" y1="20" x2="80" y2="20" stroke="#111" stroke-width="2"/></svg>`,
        art: `<div style="width:50px;height:70px;background:#1A56DB;border-radius:6px;position:relative;box-shadow:inset 8px 0 12px rgba(255,255,255,0.3)">
              <div style="position:absolute;left:15px;bottom:-20px;width:4px;height:20px;background:#94a3b8"></div>
              <div style="position:absolute;right:15px;bottom:-25px;width:4px;height:25px;background:#94a3b8"></div>
              <div style="position:absolute;right:5px;top:10px;bottom:10px;width:12px;background:#fff;border-radius:2px;display:flex;align-items:center;justify-content:center;color:#1A56DB;font-weight:900">-</div>
            </div>`
      },
      {
        id: 'inductor', name: 'Inductor', icon: '🧲', type: 'Passive Component',
        desc: 'Stores energy in a magnetic field when electric current flows through it. Resists changes in current. Used in filters, oscillators, and power supplies.',
        specs: [
          'Measured in Henrys (H), typically mH or µH.',
          'Consists of a coil of wire, often wrapped around a ferrite core.',
          'Acts as a short circuit to steady DC, and blocks high-frequency AC.'
        ],
        symbol: `<svg viewBox="0 0 100 40" width="80%">
                <line x1="10" y1="20" x2="25" y2="20" stroke="#111" stroke-width="2"/>
                <path d="M25,20 A6,6 0 1,1 37,20 A6,6 0 1,1 49,20 A6,6 0 1,1 61,20 A6,6 0 1,1 73,20" fill="none" stroke="#111" stroke-width="2"/>
                <line x1="73" y1="20" x2="90" y2="20" stroke="#111" stroke-width="2"/>
               </svg>`,
        art: `<div style="display:flex;align-items:center;position:relative">
              <div style="width:30px;height:4px;background:#94a3b8"></div>
              <div style="width:60px;height:40px;background:#111;border-radius:8px;position:relative;overflow:hidden">
                <div style="position:absolute;top:0;bottom:0;left:10%;width:4px;background:#b38b59"></div>
                <div style="position:absolute;top:0;bottom:0;left:30%;width:4px;background:#b38b59"></div>
                <div style="position:absolute;top:0;bottom:0;left:50%;width:4px;background:#b38b59"></div>
                <div style="position:absolute;top:0;bottom:0;left:70%;width:4px;background:#b38b59"></div>
                <div style="position:absolute;top:0;bottom:0;left:90%;width:4px;background:#b38b59"></div>
              </div>
              <div style="width:30px;height:4px;background:#94a3b8"></div>
            </div>`
      },
      {
        id: 'diode', name: 'Diode', icon: '🔼', type: 'Semiconductor Component',
        desc: 'Allows current to flow easily in one direction, but severely restricts current from flowing in the opposite direction. Crucial for converting AC to DC in rectification.',
        specs: [
          'Polarized: has an Anode (+) and Cathode (-).',
          'Silicon diodes typically drop ~0.7V when forward biased.',
          'Zener diodes are a special type designed to safely breakdown in reverse bias.'
        ],
        symbol: `<svg viewBox="0 0 100 40" width="80%">
                <line x1="20" y1="20" x2="40" y2="20" stroke="#111" stroke-width="2"/>
                <polygon points="40,10 40,30 60,20" fill="none" stroke="#111" stroke-width="2"/>
                <line x1="60" y1="10" x2="60" y2="30" stroke="#111" stroke-width="2"/>
                <line x1="60" y1="20" x2="80" y2="20" stroke="#111" stroke-width="2"/>
               </svg>`,
        art: `<div style="display:flex;align-items:center">
              <div style="width:30px;height:4px;background:#94a3b8"></div>
              <div style="width:50px;height:24px;background:#111;border-radius:4px;position:relative;box-shadow:inset 0 4px 6px rgba(255,255,255,0.2)">
                <div style="position:absolute;right:8px;top:0;bottom:0;width:6px;background:#cbd5e1"></div>
              </div>
              <div style="width:30px;height:4px;background:#94a3b8"></div>
            </div>`
      },
      {
        id: 'led', name: 'LED', icon: '💡', type: 'Optoelectronic Component',
        desc: 'Light Emitting Diode. Emits light when current flows through it. Used extensively for indicators and lighting.',
        specs: [
          'Longer leg is the Anode (+), shorter leg is Cathode (-).',
          'Forward voltage depends on the color (e.g., Red ~2V, Blue ~3.3V).',
          'Must be used with a current-limiting resistor to prevent burning out.'
        ],
        symbol: `<svg viewBox="0 0 100 50" width="80%">
                <line x1="20" y1="25" x2="40" y2="25" stroke="#111" stroke-width="2"/>
                <polygon points="40,15 40,35 60,25" fill="none" stroke="#111" stroke-width="2"/>
                <line x1="60" y1="15" x2="60" y2="35" stroke="#111" stroke-width="2"/>
                <line x1="60" y1="25" x2="80" y2="25" stroke="#111" stroke-width="2"/>
                <line x1="45" y1="12" x2="55" y2="4" stroke="#eab308" stroke-width="2" marker-end="url(#arrow)"/>
                <line x1="55" y1="12" x2="65" y2="4" stroke="#eab308" stroke-width="2" marker-end="url(#arrow)"/>
                <defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#eab308"/></marker></defs>
               </svg>`,
        art: `<div style="position:relative;width:60px;height:80px">
              <div style="position:absolute;left:20px;bottom:0;width:4px;height:30px;background:#94a3b8"></div>
              <div style="position:absolute;right:20px;bottom:5px;width:4px;height:25px;background:#94a3b8"></div>
              <div style="position:absolute;left:10px;top:10px;width:40px;height:45px;background:rgba(239,68,68,0.8);border-radius:20px 20px 4px 4px;box-shadow:inset -5px 0 10px rgba(0,0,0,0.2), 0 0 20px rgba(239,68,68,0.6);display:flex;justify-content:center;align-items:flex-end">
                <div style="width:20px;height:4px;background:#111;margin-bottom:2px"></div>
              </div>
            </div>`
      },
      {
        id: 'transistor', name: 'Transistor', icon: '🎛️', type: 'Active Component',
        desc: 'A semiconductor device used to amplify or switch electrical signals and power. The fundamental building block of modern electronic devices.',
        specs: [
          'BJT (Bipolar Junction Transistor) has Base, Collector, and Emitter terminals.',
          'MOSFET (Metal-Oxide-Semiconductor Field-Effect Transistor) has Gate, Drain, and Source.',
          'Acts as an electronic switch (digital logic) or an amplifier (analog circuits).'
        ],
        symbol: `<svg viewBox="0 0 100 60" width="80%">
                <circle cx="50" cy="30" r="20" fill="none" stroke="#111" stroke-width="2"/>
                <line x1="20" y1="30" x2="40" y2="30" stroke="#111" stroke-width="2"/>
                <line x1="40" y1="15" x2="40" y2="45" stroke="#111" stroke-width="3"/>
                <line x1="40" y1="20" x2="60" y2="10" stroke="#111" stroke-width="2"/>
                <line x1="40" y1="40" x2="60" y2="50" stroke="#111" stroke-width="2"/>
                <polygon points="56,43 60,50 52,49" fill="#111"/> 
                <line x1="60" y1="10" x2="60" y2="0" stroke="#111" stroke-width="2"/>
                <line x1="60" y1="50" x2="60" y2="60" stroke="#111" stroke-width="2"/>
               </svg>`,
        art: `<div style="position:relative;width:60px;height:80px;display:flex;justify-content:center">
              <div style="position:absolute;left:15px;bottom:0;width:4px;height:30px;background:#94a3b8"></div>
              <div style="position:absolute;left:28px;bottom:0;width:4px;height:35px;background:#94a3b8"></div>
              <div style="position:absolute;right:15px;bottom:0;width:4px;height:30px;background:#94a3b8"></div>
              <div style="width:50px;height:45px;background:#1e293b;border-radius:25px 25px 4px 4px;position:relative;box-shadow:inset -4px -4px 8px rgba(0,0,0,0.4)">
                <div style="position:absolute;top:15px;left:10px;right:10px;height:12px;background:#334155;border-radius:2px;font-family:monospace;font-size:8px;color:#a8a29e;text-align:center;line-height:12px">BC547</div>
              </div>
            </div>`
      },
      {
        id: 'multimeter', name: 'Multimeter', icon: '📟', type: 'Test Equipment',
        desc: 'An electronic measuring instrument that combines several measurement functions in one unit, typically measuring voltage, current, and resistance.',
        specs: [
          'Used to troubleshoot circuits and verify component values.',
          'Voltage is measured in parallel to the component.',
          'Current is measured in series with the component.'
        ],
        symbol: `<svg viewBox="0 0 100 60" width="80%">
                <circle cx="50" cy="30" r="22" fill="none" stroke="#111" stroke-width="2"/>
                <line x1="10" y1="30" x2="28" y2="30" stroke="#111" stroke-width="2"/>
                <line x1="72" y1="30" x2="90" y2="30" stroke="#111" stroke-width="2"/>
                <text x="50" y="34" font-family="monospace" font-weight="bold" font-size="12" fill="#111" text-anchor="middle">V</text>
               </svg>`,
        art: `<div style="width:60px;height:90px;background:#f59e0b;border-radius:6px;padding:5px;box-shadow:0 4px 6px rgba(0,0,0,0.1)">
              <div style="width:100%;height:30px;background:#9ca3af;border-radius:3px;margin-bottom:8px;display:flex;align-items:center;justify-content:center;color:#0f172a;font-family:monospace;font-weight:bold;font-size:12px;box-shadow:inset 0 2px 4px rgba(0,0,0,0.2)">0.00</div>
              <div style="width:24px;height:24px;border-radius:50%;background:#334155;margin:0 auto;position:relative">
                <div style="width:12px;height:4px;background:#cbd5e1;position:absolute;top:10px;left:4px"></div>
              </div>
              <div style="display:flex;justify-content:space-around;margin-top:10px">
                <div style="width:8px;height:8px;border-radius:50%;background:#ef4444"></div>
                <div style="width:8px;height:8px;border-radius:50%;background:#111"></div>
              </div>
            </div>`
      },
      {
        id: 'breadboard', name: 'Breadboard', icon: '🧮', type: 'Prototyping Board',
        desc: 'A solderless construction base used to prototype electronics. Allows quick insertion and removal of components to test circuit designs.',
        specs: [
          'Power rails running vertically along the edges.',
          'Component rows running horizontally in the middle sections.',
          'Internal metal clips secure component leads without soldering.'
        ],
        symbol: `<svg viewBox="0 0 100 60" width="80%">
                <rect x="10" y="10" width="80" height="40" fill="none" stroke="#111" stroke-width="2" rx="4"/>
                <circle cx="20" cy="20" r="2" fill="#111"/><circle cx="30" cy="20" r="2" fill="#111"/><circle cx="40" cy="20" r="2" fill="#111"/>
                <circle cx="20" cy="40" r="2" fill="#111"/><circle cx="30" cy="40" r="2" fill="#111"/><circle cx="40" cy="40" r="2" fill="#111"/>
               </svg>`,
        art: `<div style="width:100px;height:50px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:4px;display:flex;flex-direction:column;justify-content:space-around;padding:4px;box-shadow:0 4px 6px rgba(0,0,0,0.05)">
              <div style="display:flex;gap:4px;justify-content:center"><div style="width:4px;height:4px;background:#94a3b8;border-radius:50%"></div><div style="width:4px;height:4px;background:#94a3b8;border-radius:50%"></div><div style="width:4px;height:4px;background:#94a3b8;border-radius:50%"></div><div style="width:4px;height:4px;background:#94a3b8;border-radius:50%"></div></div>
              <div style="height:2px;background:#e2e8f0;margin:2px 0"></div>
              <div style="display:flex;gap:4px;justify-content:center"><div style="width:4px;height:4px;background:#94a3b8;border-radius:50%"></div><div style="width:4px;height:4px;background:#94a3b8;border-radius:50%"></div><div style="width:4px;height:4px;background:#94a3b8;border-radius:50%"></div><div style="width:4px;height:4px;background:#94a3b8;border-radius:50%"></div></div>
            </div>`
      }
    ];

    const catEl = document.getElementById('catalog');
    const inspEl = document.getElementById('inspector');

    // Render Catalog
    catEl.innerHTML = COMPONENTS.map(c => `
    <div class="comp-card" id="card-${c.id}" onclick="selectComponent('${c.id}')">
      <span class="comp-icon">${c.icon}</span>
      <span class="comp-name">${c.name}</span>
    </div>
  `).join('');

    function selectComponent(id) {
      document.querySelectorAll('.comp-card').forEach(el => el.classList.remove('active'));
      document.getElementById(`card-${id}`).classList.add('active');

      const c = COMPONENTS.find(x => x.id === id);

      let extraHTML = '';
      if (id === 'resistor') {
        extraHTML = `
        <div class="resistor-calc">
          <div class="calc-title">5-Band Resistor Calculator</div>
          <div class="band-controls">
            <div class="band-group">
              <span class="band-label">1st Digit</span>
              <select class="band-select" id="band1" onchange="calcResistor()">
                <option value="0">Black(0)</option><option value="1" selected>Brown(1)</option><option value="2">Red(2)</option><option value="3">Orange(3)</option><option value="4">Yellow(4)</option><option value="5">Green(5)</option><option value="6">Blue(6)</option><option value="7">Violet(7)</option><option value="8">Gray(8)</option><option value="9">White(9)</option>
              </select>
            </div>
            <div class="band-group">
              <span class="band-label">2nd Digit</span>
              <select class="band-select" id="band2" onchange="calcResistor()">
                <option value="0" selected>Black(0)</option><option value="1">Brown(1)</option><option value="2">Red(2)</option><option value="3">Orange(3)</option><option value="4">Yellow(4)</option><option value="5">Green(5)</option><option value="6">Blue(6)</option><option value="7">Violet(7)</option><option value="8">Gray(8)</option><option value="9">White(9)</option>
              </select>
            </div>
            <div class="band-group">
              <span class="band-label">3rd Digit</span>
              <select class="band-select" id="band3" onchange="calcResistor()">
                <option value="0" selected>Black(0)</option><option value="1">Brown(1)</option><option value="2">Red(2)</option><option value="3">Orange(3)</option><option value="4">Yellow(4)</option><option value="5">Green(5)</option><option value="6">Blue(6)</option><option value="7">Violet(7)</option><option value="8">Gray(8)</option><option value="9">White(9)</option>
              </select>
            </div>
            <div class="band-group">
              <span class="band-label">Multiplier</span>
              <select class="band-select" id="band4" onchange="calcResistor()">
                <option value="1">Black(x1)</option><option value="10" selected>Brown(x10)</option><option value="100">Red(x100)</option><option value="1000">Orange(x1k)</option><option value="10000">Yellow(x10k)</option><option value="100000">Green(x100k)</option><option value="1000000">Blue(x1M)</option><option value="10000000">Violet(x10M)</option><option value="100000000">Gray(x100M)</option><option value="1000000000">White(x1G)</option><option value="0.1">Gold(x0.1)</option><option value="0.01">Silver(x0.01)</option>
              </select>
            </div>
            <div class="band-group">
              <span class="band-label">Tolerance</span>
              <select class="band-select" id="band5" onchange="calcResistor()">
                <option value="1">Brown(±1%)</option><option value="2">Red(±2%)</option><option value="0.5">Green(±0.5%)</option><option value="0.25">Blue(±0.25%)</option><option value="0.1">Violet(±0.1%)</option><option value="0.05">Gray(±0.05%)</option><option value="5" selected>Gold(±5%)</option><option value="10">Silver(±10%)</option>
              </select>
            </div>
          </div>
          <div class="calc-result">
            <div class="calc-value" id="resValue">1000 Ω ±5%</div>
            <div class="calc-range" id="resRange">Range: 950 Ω - 1050 Ω</div>
          </div>
        </div>
      `;
      }

      inspEl.innerHTML = `
      <div class="insp-header">
        <div>
          <div class="insp-title">${c.icon} ${c.name}</div>
          <span class="insp-type">${c.type}</span>
        </div>
      </div>
      <div class="insp-desc">${c.desc}</div>
      
      <div class="insp-body">
        <div class="insp-panel">
           <div class="panel-label">Physical Appearance</div>
           <div class="svg-wrap">${c.art}</div>
        </div>
        <div class="insp-panel">
           <div class="panel-label">Schematic Symbol</div>
           <div class="svg-wrap">${c.symbol}</div>
        </div>
      </div>

      <div class="insp-panel">
        <div class="panel-label">Key Specifications & Notes</div>
        <div class="specs-list">
          ${c.specs.map(s => `
            <div class="spec-row">
              <span class="spec-bullet">→</span>
              <span class="spec-text">${s}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ${extraHTML}
    `;

      if (id === 'resistor') {
        calcResistor();
      }
    }

    window.calcResistor = function () {
      const b1 = parseInt(document.getElementById('band1').value);
      const b2 = parseInt(document.getElementById('band2').value);
      const b3 = parseInt(document.getElementById('band3').value);
      const multiplier = parseFloat(document.getElementById('band4').value);
      const tolerance = parseFloat(document.getElementById('band5').value);

      let baseVal = (b1 * 100) + (b2 * 10) + b3;
      let resistance = baseVal * multiplier;

      function formatUnit(val) {
        if (val >= 1e9) return parseFloat((val / 1e9).toFixed(2)) + 'GΩ';
        if (val >= 1e6) return parseFloat((val / 1e6).toFixed(2)) + 'MΩ';
        if (val >= 1e3) return parseFloat((val / 1e3).toFixed(2)) + 'kΩ';
        return parseFloat(val.toFixed(2)) + 'Ω';
      }

      const resResult = formatUnit(resistance) + ' ±' + tolerance + '%';
      document.getElementById('resValue').innerText = resResult;

      const error = resistance * (tolerance / 100);
      const minRes = resistance - error;
      const maxRes = resistance + error;

      document.getElementById('resRange').innerText = 'Range: ' + formatUnit(minRes) + ' - ' + formatUnit(maxRes);
    }