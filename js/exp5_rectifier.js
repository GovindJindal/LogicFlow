// ══════════════════════════════════════════════════════════════════════════════
//  LogicFlow — Exp 5: Rectifier & Filter Circuits
//  Wireless Sim mode + Wired Sandbox (uses CircuitSandbox engine)
// ══════════════════════════════════════════════════════════════════════════════

// ── Constants ─────────────────────────────────────────────────────────────────
const RECT_F         = 50;   // Hz mains frequency
const RECT_VM        = 10;   // Peak input voltage
const RECT_VD_DROP   = 0.7;  // Single diode drop
const RECT_VD_BRIDGE = 1.4;  // Bridge = 2 diodes

// ── State ─────────────────────────────────────────────────────────────────────
let activeMode5 = 'wireless';
let sandbox5    = null;
let chartIn5    = null;
let chartOut5   = null;
let topo5       = 'hw';

// ── DOMContentLoaded ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildCharts5();
  initSliders5();
  updateLab5();

  sandbox5 = new CircuitSandbox({
    svgId:      'circuit-canvas-5',
    readingsId: 'circuit-readings-5',
    experiment: 'rectifier'
  });

  buildPalette5();
  setTimeout(() => sandbox5.loadTemplate(RECT_TEMPLATES['half-wave']), 100);

  switchMode5('wireless');
});

// ── Mode switch ────────────────────────────────────────────────────────────────
function switchMode5(mode) {
  activeMode5 = mode;
  document.getElementById('btn5-wireless')?.classList.toggle('active', mode === 'wireless');
  document.getElementById('btn5-wired')?.classList.toggle('active',   mode === 'wired');
  document.getElementById('panel5-wireless').style.display = mode === 'wireless' ? '' : 'none';
  document.getElementById('panel5-wired').style.display    = mode === 'wired'    ? '' : 'none';
}

// ── Palette ────────────────────────────────────────────────────────────────────
function buildPalette5() {
  const grid = document.getElementById('palette-grid-5');
  if (!grid) return;
  const items  = ['generator','diode','capacitor','resistor','ammeter','voltmeter','ground'];
  const labels = { generator:'AC Gen', diode:'Diode', capacitor:'Capacitor', resistor:'Resistor', ammeter:'Ammeter', voltmeter:'Voltmeter', ground:'Ground' };
  grid.innerHTML = items.map(type => `
    <div class="component-item" draggable="true" data-csb-component="${type}">
      <svg width="46" height="46" viewBox="0 0 50 50">${sandbox5.defs[type]?.icon || ''}</svg>
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
const RECT_TEMPLATES = {
  'half-wave': {
    components: [
      { id:1, type:'generator', x:55,  y:160, values:{ voltage:10, frequency:50 } },
      { id:2, type:'diode',     x:170, y:160, values:{ vf:0.7 } },
      { id:3, type:'resistor',  x:290, y:160, values:{ resistance:1000 } },
      { id:4, type:'voltmeter', x:380, y:100, values:{} },
      { id:5, type:'ground',    x:430, y:255, values:{} }
    ],
    connections: [
      { fromComp:1, fromPort:0, toComp:2, toPort:0 },
      { fromComp:2, fromPort:1, toComp:3, toPort:0 },
      { fromComp:3, fromPort:1, toComp:5, toPort:0 },
      { fromComp:1, fromPort:1, toComp:5, toPort:0 },
      { fromComp:3, fromPort:0, toComp:4, toPort:0 },
      { fromComp:5, fromPort:0, toComp:4, toPort:1 }
    ]
  },
  'half-wave-filtered': {
    components: [
      { id:1, type:'generator', x:55,  y:160, values:{ voltage:10, frequency:50 } },
      { id:2, type:'diode',     x:160, y:160, values:{ vf:0.7 } },
      { id:3, type:'capacitor', x:280, y:220, values:{ capacitance:100 } },
      { id:4, type:'resistor',  x:390, y:160, values:{ resistance:1000 } },
      { id:5, type:'voltmeter', x:470, y:100, values:{} },
      { id:6, type:'ground',    x:520, y:270, values:{} }
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
  'full-wave-bridge': {
    components: [
      { id:1,  type:'generator', x:55,  y:180, values:{ voltage:10, frequency:50 } },
      { id:2,  type:'diode',     x:165, y:110, values:{ vf:0.7 } },
      { id:3,  type:'diode',     x:260, y:110, values:{ vf:0.7 } },
      { id:4,  type:'diode',     x:165, y:250, values:{ vf:0.7 } },
      { id:5,  type:'diode',     x:260, y:250, values:{ vf:0.7 } },
      { id:6,  type:'resistor',  x:390, y:180, values:{ resistance:1000 } },
      { id:7,  type:'voltmeter', x:470, y:100, values:{} },
      { id:8,  type:'ground',    x:520, y:290, values:{} }
    ],
    connections: [
      { fromComp:1, fromPort:0, toComp:2, toPort:0 },
      { fromComp:1, fromPort:0, toComp:5, toPort:0 },
      { fromComp:1, fromPort:1, toComp:4, toPort:0 },
      { fromComp:1, fromPort:1, toComp:3, toPort:0 },
      { fromComp:2, fromPort:1, toComp:6, toPort:0 },
      { fromComp:3, fromPort:1, toComp:6, toPort:0 },
      { fromComp:4, fromPort:1, toComp:8, toPort:0 },
      { fromComp:5, fromPort:1, toComp:8, toPort:0 },
      { fromComp:6, fromPort:1, toComp:8, toPort:0 },
      { fromComp:6, fromPort:0, toComp:7, toPort:0 },
      { fromComp:8, fromPort:0, toComp:7, toPort:1 }
    ]
  },
  'full-wave-filtered': {
    components: [
      { id:1,  type:'generator', x:50,  y:180, values:{ voltage:10, frequency:50 } },
      { id:2,  type:'diode',     x:155, y:110, values:{ vf:0.7 } },
      { id:3,  type:'diode',     x:250, y:110, values:{ vf:0.7 } },
      { id:4,  type:'diode',     x:155, y:250, values:{ vf:0.7 } },
      { id:5,  type:'diode',     x:250, y:250, values:{ vf:0.7 } },
      { id:6,  type:'capacitor', x:360, y:230, values:{ capacitance:470 } },
      { id:7,  type:'resistor',  x:460, y:160, values:{ resistance:1000 } },
      { id:8,  type:'voltmeter', x:540, y:100, values:{} },
      { id:9,  type:'ground',    x:580, y:300, values:{} }
    ],
    connections: [
      { fromComp:1, fromPort:0, toComp:2, toPort:0 },
      { fromComp:1, fromPort:0, toComp:5, toPort:0 },
      { fromComp:1, fromPort:1, toComp:4, toPort:0 },
      { fromComp:1, fromPort:1, toComp:3, toPort:0 },
      { fromComp:2, fromPort:1, toComp:7, toPort:0 },
      { fromComp:3, fromPort:1, toComp:7, toPort:0 },
      { fromComp:4, fromPort:1, toComp:9, toPort:0 },
      { fromComp:5, fromPort:1, toComp:9, toPort:0 },
      { fromComp:6, fromPort:0, toComp:7, toPort:0 },
      { fromComp:6, fromPort:1, toComp:9, toPort:0 },
      { fromComp:7, fromPort:1, toComp:9, toPort:0 },
      { fromComp:7, fromPort:0, toComp:8, toPort:0 },
      { fromComp:9, fromPort:0, toComp:8, toPort:1 }
    ]
  }
};

function buildExampleCircuit5(name) { const t = RECT_TEMPLATES[name]; if (t) sandbox5.loadTemplate(t); }
function clearCanvas5()             { sandbox5.clearAll(); }
function runSimulation5()           { sandbox5.runSimulation(); }

// ── Eraser ─────────────────────────────────────────────────────────────────────
let _eraserTimer5 = null;
document.addEventListener('mousedown', e => {
  if (e.button !== 0 || activeMode5 !== 'wired') return;
  if (e.target.closest('button,input,select,textarea,.component-item')) return;
  _eraserTimer5 = setTimeout(() => {
    sandbox5.activateEraser();
    document.addEventListener('mouseup', () => setTimeout(() => sandbox5.deactivateEraser(), 800), { once: true });
    document.addEventListener('keydown', e2 => { if (e2.key === 'Escape') sandbox5.deactivateEraser(); }, { once: true });
  }, 600);
});
document.addEventListener('mouseup', () => { clearTimeout(_eraserTimer5); _eraserTimer5 = null; });

// ── Wireless topology toggle ───────────────────────────────────────────────────
function setTopology(t) {
  topo5 = t;
  document.getElementById('btn-hw')?.classList.toggle('active', t === 'hw');
  document.getElementById('btn-fw')?.classList.toggle('active', t === 'fw');
  updateLab5();
}

// ── Wireless sliders ───────────────────────────────────────────────────────────
function initSliders5() {
  ['sid-cap','sid-load','chk-filter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateLab5);
    if (el) el.addEventListener('change', updateLab5);
  });
  const capEl  = document.getElementById('sid-cap');
  const loadEl = document.getElementById('sid-load');
  if (capEl)  { capEl.addEventListener('input',  () => { const p=((capEl.value-1)/99)*100;  capEl.style.background=`linear-gradient(to right,#10B981 ${p}%,rgba(0,0,0,0.1) ${p}%)`; }); capEl.dispatchEvent(new Event('input')); }
  if (loadEl) { loadEl.addEventListener('input', () => { const p=((loadEl.value-100)/9900)*100; loadEl.style.background=`linear-gradient(to right,#1A56DB ${p}%,rgba(0,0,0,0.1) ${p}%)`; }); loadEl.dispatchEvent(new Event('input')); }
}

// ── Wireless simulation ────────────────────────────────────────────────────────
function updateLab5() {
  const isFilter = document.getElementById('chk-filter')?.checked || false;
  const C  = parseFloat(document.getElementById('sid-cap')?.value  || 10) * 1e-6;
  const RL = parseFloat(document.getElementById('sid-load')?.value || 1000);

  const capEl  = document.getElementById('sid-cap');
  const loadEl = document.getElementById('sid-load');
  if (capEl)  document.getElementById('lbl-cap').textContent  = (C * 1e6) + ' µF';
  if (loadEl) document.getElementById('lbl-load').textContent = RL >= 1000 ? (RL/1000).toFixed(1)+' kΩ' : RL+' Ω';
  if (capEl)  capEl.style.background  = `linear-gradient(to right,#10B981 ${((C*1e6-1)/99)*100}%,rgba(0,0,0,0.1) ${((C*1e6-1)/99)*100}%)`;
  if (loadEl) loadEl.style.background = `linear-gradient(to right,#1A56DB ${((RL-100)/9900)*100}%,rgba(0,0,0,0.1) ${((RL-100)/9900)*100}%)`;

  // Build waveforms
  const steps = 500, tMax = 0.04, dt = tMax / steps;
  const ptsIn = [], ptsOut = [];
  let lastPeak = 0, tDischarge = 0;

  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    const vsi = RECT_VM * Math.sin(2 * Math.PI * RECT_F * t);
    ptsIn.push({ x: t, y: vsi });

    let vrect = 0;
    if (topo5 === 'hw') {
      if (vsi > RECT_VD_DROP) vrect = vsi - RECT_VD_DROP;
    } else {
      if (Math.abs(vsi) > RECT_VD_BRIDGE) vrect = Math.abs(vsi) - RECT_VD_BRIDGE;
    }

    if (!isFilter) {
      ptsOut.push({ x: t, y: vrect });
    } else {
      const decay = lastPeak * Math.exp(-(t - tDischarge) / (RL * C));
      if (vrect > decay) {
        ptsOut.push({ x: t, y: vrect });
        lastPeak   = vrect;
        tDischarge = t;
      } else {
        ptsOut.push({ x: t, y: Math.max(0, decay) });
      }
    }
  }

  if (chartIn5)  { chartIn5.data.datasets[0].data  = ptsIn;  chartIn5.update(); }
  if (chartOut5) { chartOut5.data.datasets[0].data = ptsOut; chartOut5.update(); }

  // Add electron flow animation to live circuit
  if (typeof CircuitAnimations !== 'undefined' && CircuitAnimations.animateCurrentFlow) {
    const svg = document.querySelector('#panel5-wireless svg');
    if (svg) {
      CircuitAnimations.animateCurrentFlow(svg, [], '#10B981');
    }
  }

  // Metrics
  const Vp = topo5 === 'hw' ? RECT_VM - RECT_VD_DROP : RECT_VM - RECT_VD_BRIDGE;
  let Vdc = 0, Vrpp = 0, gamma = 0, eff = 0;

  if (!isFilter) {
    if (topo5 === 'hw') {
      Vdc   = Vp / Math.PI;
      const Vrms = Vp / 2;
      gamma = Math.sqrt(Math.pow(Vrms / Vdc, 2) - 1) * 100;
      eff   = (40.6) / (1 + RECT_VD_DROP / RECT_VM);
    } else {
      Vdc   = 2 * Vp / Math.PI;
      const Vrms = Vp / Math.sqrt(2);
      gamma = Math.sqrt(Math.pow(Vrms / Vdc, 2) - 1) * 100;
      eff   = (81.2) / (1 + RECT_VD_BRIDGE / RECT_VM);
    }
    Vrpp = Vp;
  } else {
    const fm = topo5 === 'hw' ? RECT_F : 2 * RECT_F;
    Vrpp  = Math.min(Vp, Vp / (fm * RL * C));
    Vdc   = Vp - Vrpp / 2;
    gamma = (Vrpp / (2 * Math.sqrt(3) * Vdc)) * 100;
    eff   = 90;
  }

  const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  el('m-vdc',   Vdc.toFixed(2)  + ' V');
  el('m-vrip',  Vrpp.toFixed(2) + ' V');
  el('m-gamma', gamma.toFixed(1)+ ' %');
  el('m-eff',   eff > 100 ? '≈100%' : eff.toFixed(1)+' %');
}

// ── Charts ─────────────────────────────────────────────────────────────────────
function buildCharts5() {
  Chart.defaults.font.family = 'JetBrains Mono';
  Chart.defaults.color = '#64748B';

  const mkChart = (id, color, yMin, yMax) => {
    const ctx = document.getElementById(id)?.getContext('2d');
    if (!ctx) return null;
    return new Chart(ctx, {
      type: 'line',
      data: { datasets: [{ borderColor: color, borderWidth: 2.5, pointRadius: 0, tension: 0.3, fill: color !== '#64748B', backgroundColor: color !== '#64748B' ? color.replace(')',',0.08)').replace('rgb','rgba') : 'transparent' }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 1000, easing: 'easeOutQuart' },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { type: 'linear', min: 0, max: 0.04, title: { display: true, text: 'Time (s)', color: '#475569', font: { family: 'JetBrains Mono', size: 10 } }, ticks: { color: '#64748B', font: { family: 'JetBrains Mono', size: 9 }, maxTicksLimit: 5 }, grid: { color: 'rgba(0,0,0,0.05)' } },
          y: { min: yMin, max: yMax, title: { display: true, text: 'Voltage (V)', color: '#475569', font: { family: 'JetBrains Mono', size: 10 } }, ticks: { color: '#64748B', font: { family: 'JetBrains Mono', size: 9 } }, grid: { color: 'rgba(0,0,0,0.05)' } }
        }
      }
    });
  };

  chartIn5  = mkChart('chartIn',  '#64748B', -15, 15);
  chartOut5 = mkChart('chartOut', '#10B981', -2,  12);
}