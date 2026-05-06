// ══════════════════════════════════════════════════════════════════════════════
//  LogicFlow — Exp 4: Zener Diode Voltage Regulator
//  Wireless Sim mode + Wired Sandbox (uses CircuitSandbox engine)
// ══════════════════════════════════════════════════════════════════════════════

// ── Physics ───────────────────────────────────────────────────────────────────
const VZ_DEFAULT = 5.1;
const P_MAX_MW   = 500;

function solveZener(vin, rs, rl, vz) {
  let vout = vin * (rl / (rs + rl));
  let iz = 0;
  if (vout > vz) {
    vout = vz;
    iz = ((vin - vz) / rs) - (vz / rl);
  }
  const il  = vout / rl;
  const pz  = vout * Math.max(0, iz) * 1000;
  return { vout, iz: Math.max(0, iz), il, pz, openVout: vin * (rl / (rs + rl)) };
}

// ── State ─────────────────────────────────────────────────────────────────────
let activeMode4 = 'wireless';
let sandbox4    = null;
let regChart    = null;
let electronsAnimated = false;

// ── DOMContentLoaded ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildRegChart();
  initSliders4();
  updateLab();

  sandbox4 = new CircuitSandbox({
    svgId:      'circuit-canvas-4',
    readingsId: 'circuit-readings-4',
    experiment: 'zener'
  });

  buildPalette4();
  setTimeout(() => sandbox4.loadTemplate(ZENER_TEMPLATES['basic-regulator']), 100);

  switchMode4('wireless');
});

// ── Mode switch ────────────────────────────────────────────────────────────────
function switchMode4(mode) {
  activeMode4 = mode;
  document.getElementById('btn4-wireless')?.classList.toggle('active', mode === 'wireless');
  document.getElementById('btn4-wired')?.classList.toggle('active',   mode === 'wired');
  document.getElementById('panel4-wireless').style.display = mode === 'wireless' ? '' : 'none';
  document.getElementById('panel4-wired').style.display    = mode === 'wired'    ? '' : 'none';
}

// ── Palette ────────────────────────────────────────────────────────────────────
function buildPalette4() {
  const grid = document.getElementById('palette-grid-4');
  if (!grid) return;
  const items = ['dcSource','resistor','zener','diode','ammeter','voltmeter','ground'];
  const labels = { dcSource:'DC Src', resistor:'Resistor', zener:'Zener', diode:'Diode', ammeter:'Ammeter', voltmeter:'Voltmeter', ground:'Ground' };
  grid.innerHTML = items.map(type => `
    <div class="component-item" draggable="true" data-csb-component="${type}">
      <svg width="46" height="46" viewBox="0 0 50 50">${sandbox4.defs[type]?.icon || ''}</svg>
      <span>${labels[type]}</span>
    </div>
  `).join('');
  grid.querySelectorAll('[data-csb-component]').forEach(item => {
    item.addEventListener('dragstart', e => {
      e.dataTransfer.setData('csb-type', item.dataset.csbComponent);
      e.dataTransfer.effectAllowed = 'copy';
    });
  });
}

// ── Templates ─────────────────────────────────────────────────────────────────
const ZENER_TEMPLATES = {
  'basic-regulator': {
    components: [
      { id:1, type:'dcSource',  x:60,  y:150, values:{ voltage:9 } },
      { id:2, type:'resistor',  x:175, y:150, values:{ resistance:220 } },
      { id:3, type:'zener',     x:320, y:220, values:{ vz:5.1 } },
      { id:4, type:'resistor',  x:430, y:150, values:{ resistance:1000 } },
      { id:5, type:'voltmeter', x:510, y:220, values:{} },
      { id:6, type:'ground',    x:540, y:310, values:{} }
    ],
    connections: [
      { fromComp:1, fromPort:0, toComp:2, toPort:0 },
      { fromComp:2, fromPort:1, toComp:3, toPort:0 },
      { fromComp:2, fromPort:1, toComp:4, toPort:0 },
      { fromComp:4, fromPort:1, toComp:6, toPort:0 },
      { fromComp:3, fromPort:1, toComp:6, toPort:0 },
      { fromComp:1, fromPort:1, toComp:6, toPort:0 },
      { fromComp:4, fromPort:0, toComp:5, toPort:0 },
      { fromComp:6, fromPort:0, toComp:5, toPort:1 }
    ]
  },
  'line-regulation': {
    components: [
      { id:1, type:'dcSource',  x:60,  y:160, values:{ voltage:12 } },
      { id:2, type:'resistor',  x:175, y:160, values:{ resistance:470 } },
      { id:3, type:'zener',     x:310, y:240, values:{ vz:5.1 } },
      { id:4, type:'ammeter',   x:420, y:160, values:{} },
      { id:5, type:'ground',    x:470, y:300, values:{} }
    ],
    connections: [
      { fromComp:1, fromPort:0, toComp:2, toPort:0 },
      { fromComp:2, fromPort:1, toComp:4, toPort:0 },
      { fromComp:4, fromPort:1, toComp:5, toPort:0 },
      { fromComp:2, fromPort:1, toComp:3, toPort:0 },
      { fromComp:3, fromPort:1, toComp:5, toPort:0 },
      { fromComp:1, fromPort:1, toComp:5, toPort:0 }
    ]
  },
  'load-regulation': {
    components: [
      { id:1, type:'dcSource',  x:60,  y:160, values:{ voltage:9 } },
      { id:2, type:'resistor',  x:175, y:160, values:{ resistance:220 } },
      { id:3, type:'zener',     x:310, y:240, values:{ vz:5.1 } },
      { id:4, type:'resistor',  x:420, y:160, values:{ resistance:500 } },
      { id:5, type:'voltmeter', x:500, y:220, values:{} },
      { id:6, type:'ground',    x:540, y:310, values:{} }
    ],
    connections: [
      { fromComp:1, fromPort:0, toComp:2, toPort:0 },
      { fromComp:2, fromPort:1, toComp:3, toPort:0 },
      { fromComp:2, fromPort:1, toComp:4, toPort:0 },
      { fromComp:4, fromPort:1, toComp:6, toPort:0 },
      { fromComp:3, fromPort:1, toComp:6, toPort:0 },
      { fromComp:1, fromPort:1, toComp:6, toPort:0 },
      { fromComp:4, fromPort:0, toComp:5, toPort:0 },
      { fromComp:6, fromPort:0, toComp:5, toPort:1 }
    ]
  }
};

function buildExampleCircuit4(name) { const t = ZENER_TEMPLATES[name]; if (t) sandbox4.loadTemplate(t); }
function clearCanvas4()             { sandbox4.clearAll(); }
function runSimulation4()           { sandbox4.runSimulation(); }

// ── Eraser (long press) ────────────────────────────────────────────────────────
let _eraserTimer4 = null;
document.addEventListener('mousedown', e => {
  if (e.button !== 0 || activeMode4 !== 'wired') return;
  if (e.target.closest('button,input,select,textarea,.component-item')) return;
  _eraserTimer4 = setTimeout(() => {
    sandbox4.activateEraser();
    document.addEventListener('mouseup', () => setTimeout(() => sandbox4.deactivateEraser(), 800), { once: true });
    document.addEventListener('keydown', e2 => { if (e2.key === 'Escape') sandbox4.deactivateEraser(); }, { once: true });
  }, 600);
});
document.addEventListener('mouseup', () => { clearTimeout(_eraserTimer4); _eraserTimer4 = null; });

// ── Wireless sliders ───────────────────────────────────────────────────────────
function initSliders4() {
  const track = (id, colorVar) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      const pct = ((el.value - el.min) / (el.max - el.min)) * 100;
      el.style.background = `linear-gradient(to right,var(${colorVar}) ${pct}%,rgba(0,0,0,0.1) ${pct}%)`;
    });
    el.dispatchEvent(new Event('input'));
  };
  ['sid-vin','sid-rs','sid-rl'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateLab);
  });
  track('sid-vin', '--rose');
  track('sid-rs',  '--amber');
  track('sid-rl',  '--blue');
}

// ── Wireless simulation ────────────────────────────────────────────────────────
function updateLab() {
  const vin = parseFloat(document.getElementById('sid-vin').value);
  const rs  = parseFloat(document.getElementById('sid-rs').value);
  const rl  = parseFloat(document.getElementById('sid-rl').value);

  document.getElementById('lbl-vin').textContent = vin.toFixed(1) + ' V';
  document.getElementById('lbl-rs').textContent  = rs + ' Ω';
  document.getElementById('lbl-rl').textContent  = rl >= 1000 ? (rl/1000).toFixed(1)+' kΩ' : rl+' Ω';

  // Slider fill tracks
  const vinEl = document.getElementById('sid-vin');
  const rsEl  = document.getElementById('sid-rs');
  const rlEl  = document.getElementById('sid-rl');
  if (vinEl) vinEl.style.background = `linear-gradient(to right,#F43F5E ${(vin/15)*100}%,rgba(0,0,0,0.1) ${(vin/15)*100}%)`;
  if (rsEl)  rsEl.style.background  = `linear-gradient(to right,#F59E0B ${((rs-50)/950)*100}%,rgba(0,0,0,0.1) ${((rs-50)/950)*100}%)`;
  if (rlEl)  rlEl.style.background  = `linear-gradient(to right,#1A56DB ${((rl-100)/9900)*100}%,rgba(0,0,0,0.1) ${((rl-100)/9900)*100}%)`;

  const state = solveZener(vin, rs, rl, VZ_DEFAULT);

  document.getElementById('m-vout').textContent  = state.vout.toFixed(2)           + ' V';
  document.getElementById('m-iz').textContent    = (state.iz * 1000).toFixed(2)    + ' mA';
  document.getElementById('m-il').textContent    = (state.il * 1000).toFixed(2)    + ' mA';
  document.getElementById('m-power').textContent = state.pz.toFixed(1)             + ' mW';

  // Status card
  const sc = document.getElementById('statusCard');
  if (sc) {
    if (state.pz > P_MAX_MW) {
      sc.style.cssText = 'background:rgba(244,63,94,0.1);border-color:rgba(244,63,94,0.4);color:#e11d48;margin-top:1.25rem;padding:1rem;border-radius:10px;border:1px solid;font-family:var(--font-mono);font-size:.85rem;font-weight:600';
      sc.innerHTML = '🔥 WARNING: Zener power dissipation exceeded! Diode will burn out.';
    } else if (state.iz > 0.001) {
      sc.style.cssText = 'background:rgba(16,185,129,0.1);border-color:rgba(16,185,129,0.4);color:#059669;margin-top:1.25rem;padding:1rem;border-radius:10px;border:1px solid;font-family:var(--font-mono);font-size:.85rem;font-weight:600';
      sc.innerHTML = '✅ REGULATING: Zener in breakdown — output clamped at ~' + VZ_DEFAULT + 'V.';
    } else {
      sc.style.cssText = 'background:rgba(100,116,139,0.1);border-color:rgba(100,116,139,0.3);color:#475569;margin-top:1.25rem;padding:1rem;border-radius:10px;border:1px solid;font-family:var(--font-mono);font-size:.85rem;font-weight:600';
      sc.innerHTML = '⭕ OFF: Vin too low to reach Zener breakdown voltage (' + VZ_DEFAULT + 'V).';
    }
  }

  // Chart update
  if (regChart) {
    const pts = [], idealPts = [];
    for (let v = 0; v <= 15; v += 0.2) {
      const s = solveZener(v, rs, rl, VZ_DEFAULT);
      pts.push({ x: v, y: s.vout });
      idealPts.push({ x: v, y: s.openVout });
    }
    regChart.data.datasets[0].data = pts;
    regChart.data.datasets[1].data = [{ x: vin, y: state.vout }];
    regChart.data.datasets[2].data = idealPts;
    regChart.update();
  }

  // Update live circuit SVG
  updateLiveCircuit(vin, state);
}

function updateLiveCircuit(vin, state) {
  // Update current animation dots
  const dots = document.querySelectorAll('.z-current-dot');
  const conducting = state.iz > 0.001;
  dots.forEach((dot, i) => { dot.style.opacity = conducting ? '1' : '0'; });
  
  // Add simple electron flow animation when there's input voltage
  if (vin > 0 && !electronsAnimated) {
    const svg = document.getElementById('zener-circuit-svg');
    if (svg) {
      // Create animated electron dots along wires
      const wirePaths = [
        [{x: 80, y: 70}, {x: 150, y: 70}],
        [{x: 200, y: 70}, {x: 265, y: 70}],
        [{x: 370, y: 70}, {x: 500, y: 70}],
        [{x: 500, y: 70}, {x: 500, y: 155}],
        [{x: 500, y: 155}, {x: 80, y: 155}],
        [{x: 80, y: 155}, {x: 80, y: 70}]
      ];
      
      wirePaths.forEach((path, index) => {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('r', '3');
        dot.setAttribute('fill', conducting ? '#10B981' : '#F59E0B');
        svg.appendChild(dot);
        
        let progress = index * 0.2;
        const animate = () => {
          progress += 0.015;
          if (progress > 1) progress = 0;
          
          const x = path[0].x + (path[1].x - path[0].x) * progress;
          const y = path[0].y + (path[1].y - path[0].y) * progress;
          dot.setAttribute('cx', x);
          dot.setAttribute('cy', y);
          
          if (dot.parentNode) {
            requestAnimationFrame(animate);
          }
        };
        setTimeout(animate, index * 200);
      });
      
      electronsAnimated = true;
    }
  }
  
  // Update voltage display on circuit
  const voutLabel = document.getElementById('z-vout-label');
  if (voutLabel) voutLabel.textContent = state.vout.toFixed(2) + 'V';
}

// ── Chart ──────────────────────────────────────────────────────────────────────
function buildRegChart() {
  const ctx = document.getElementById('regChart')?.getContext('2d');
  if (!ctx) return;
  regChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        { label:'Vout',       data:[], borderColor:'#10B981', borderWidth:2.5, pointRadius:0, tension:0, fill:true, backgroundColor:'rgba(16,185,129,0.08)' },
        { label:'Op Point',   data:[], borderColor:'#F43F5E', backgroundColor:'#F43F5E', pointRadius:8, pointHoverRadius:10, showLine:false },
        { label:'Unregulated',data:[], borderColor:'rgba(0,0,0,0.12)', borderWidth:1.5, borderDash:[5,5], pointRadius:0, tension:0 }
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      animation:{ duration:1200, easing:'easeOutQuart' },
      plugins:{ legend:{display:false}, tooltip:{enabled:false} },
      scales:{
        x:{ type:'linear', min:0, max:15, title:{display:true,text:'Vin (V)',color:'#475569',font:{family:'JetBrains Mono',size:10,weight:600}}, ticks:{color:'#64748B',font:{family:'JetBrains Mono',size:9}}, grid:{color:'rgba(0,0,0,.05)'} },
        y:{ min:0, max:8, title:{display:true,text:'Vout (V)',color:'#475569',font:{family:'JetBrains Mono',size:10,weight:600}}, ticks:{color:'#64748B',font:{family:'JetBrains Mono',size:9}}, grid:{color:'rgba(0,0,0,.05)'} }
      }
    }
  });
}