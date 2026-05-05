/* ================================================================
   exp1_components.js — Enhanced Experiment 1: Component Lab
   LogicFlow Virtual Electronics Laboratory
   ================================================================ */

'use strict';

// Safety timeout: show error if initialization hangs
const _expSafetyTimer = setTimeout(function() {
  if (document.body) {
    var err = document.createElement('div');
    err.style.cssText = 'position:fixed;inset:0;background:rgba(255,255,255,0.95);z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;font-family:sans-serif;';
    err.innerHTML = '<h2 style="color:#dc3545;margin:0 0 12px;">This experiment failed to load</h2><p style="color:#424848;margin:0 0 24px;">Please refresh or go back.</p><a href="index.html" style="padding:10px 20px;background:#1a56db;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Go Back</a>';
    document.body.appendChild(err);
  }
}, 8000);

// ================================================================
// 1. TAB SWITCHING
// ================================================================
document.getElementById('tabBar').addEventListener('click', function (e) {
  const btn = e.target.closest('.tab-btn');
  if (!btn) return;
  const name = btn.dataset.tab;

  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  btn.classList.add('active');
});


// ================================================================
// 2. RESISTOR MODULE
// ================================================================
const BAND_META = {
  black:  { digit: 0, mult: 1,          tol: null, hex: '#1a1a1a', tc: '250 ppm/°K' },
  brown:  { digit: 1, mult: 10,         tol: 1,    hex: '#92400e', tc: '100 ppm/°K' },
  red:    { digit: 2, mult: 100,        tol: 2,    hex: '#dc2626', tc: '50 ppm/°K'  },
  orange: { digit: 3, mult: 1000,       tol: null, hex: '#ea580c', tc: '15 ppm/°K'  },
  yellow: { digit: 4, mult: 10000,      tol: null, hex: '#ca8a04', tc: '25 ppm/°K'  },
  green:  { digit: 5, mult: 100000,     tol: 0.5,  hex: '#16a34a', tc: '20 ppm/°K'  },
  blue:   { digit: 6, mult: 1000000,    tol: 0.25, hex: '#2563eb', tc: '10 ppm/°K'  },
  violet: { digit: 7, mult: 10000000,   tol: 0.1,  hex: '#7c3aed', tc: '5 ppm/°K'   },
  gray:   { digit: 8, mult: 100000000,  tol: 0.05, hex: '#6b7280', tc: '1 ppm/°K'   },
  white:  { digit: 9, mult: 1000000000, tol: null, hex: '#f1f5f9', tc: '—'           },
  gold:   { digit: null, mult: 0.1,     tol: 5,    hex: '#b45309', tc: '—'           },
  silver: { digit: null, mult: 0.01,    tol: 10,   hex: '#9ca3af', tc: '—'           },
};

const TOLS = { brown:1, red:2, green:0.5, blue:0.25, violet:0.1, gray:0.05, gold:5, silver:10 };

function fmtRes(val) {
  if (!isFinite(val) || val < 0) return '—';
  if (val >= 1e9) return parseFloat((val / 1e9).toPrecision(3)) + ' GΩ';
  if (val >= 1e6) return parseFloat((val / 1e6).toPrecision(3)) + ' MΩ';
  if (val >= 1e3) return parseFloat((val / 1e3).toPrecision(3)) + ' kΩ';
  return parseFloat(val.toPrecision(3)) + ' Ω';
}

window.updateBands = function () {
  const c1 = document.getElementById('b1').value;
  const c2 = document.getElementById('b2').value;
  const c3 = document.getElementById('b3').value;
  const c4 = document.getElementById('b4').value;
  const c5 = document.getElementById('b5').value;

  // Update SVG band colors
  const bandIds  = ['rB1','rB2','rB3','rB4','rB5'];
  const indIds   = ['bi1','bi2','bi3','bi4','bi5'];
  const colors   = [c1, c2, c3, c4, c5];
  colors.forEach(function (c, i) {
    var hex = (BAND_META[c] || {}).hex || '#888';
    document.getElementById(bandIds[i]).setAttribute('fill', hex);
    document.getElementById(indIds[i]).style.background = hex;
  });

  // Calculate resistance
  var d1 = BAND_META[c1] ? BAND_META[c1].digit : null;
  var d2 = BAND_META[c2] ? BAND_META[c2].digit : null;
  var d3 = BAND_META[c3] ? BAND_META[c3].digit : null;
  var mult = BAND_META[c4] ? BAND_META[c4].mult : 1;
  var tol  = TOLS[c5] || 5;

  if (d1 === null || d2 === null || d3 === null) {
    document.getElementById('resValue').textContent = '— Invalid band selection';
    document.getElementById('resRange').textContent = 'Gold/Silver cannot be digit bands';
    return;
  }

  var resistance = (d1 * 100 + d2 * 10 + d3) * mult;
  var err = resistance * tol / 100;
  document.getElementById('resValue').textContent = fmtRes(resistance) + ' ± ' + tol + '%';
  document.getElementById('resRange').textContent  = 'Range: ' + fmtRes(resistance - err) + ' — ' + fmtRes(resistance + err);
};

// Build color code reference table
(function buildColorTable() {
  var rows = [
    ['black',  '0','0','0','× 1 Ω',    '—',     '250 ppm/°K'],
    ['brown',  '1','1','1','× 10 Ω',   '±1%',   '100 ppm/°K'],
    ['red',    '2','2','2','× 100 Ω',  '±2%',   '50 ppm/°K' ],
    ['orange', '3','3','3','× 1 kΩ',   '—',     '15 ppm/°K' ],
    ['yellow', '4','4','4','× 10 kΩ',  '—',     '25 ppm/°K' ],
    ['green',  '5','5','5','× 100 kΩ', '±0.5%', '20 ppm/°K' ],
    ['blue',   '6','6','6','× 1 MΩ',   '±0.25%','10 ppm/°K' ],
    ['violet', '7','7','7','× 10 MΩ',  '±0.1%', '5 ppm/°K'  ],
    ['gray',   '8','8','8','× 100 MΩ', '±0.05%','1 ppm/°K'  ],
    ['white',  '9','9','9','× 1 GΩ',   '—',     '—'         ],
    ['gold',   '—','—','—','× 0.1 Ω',  '±5%',   '—'         ],
    ['silver', '—','—','—','× 0.01 Ω', '±10%',  '—'         ],
    ['none',   '—','—','—','—',         '±20%',  '—'         ],
  ];
  var hexMap = {
    black:'#1a1a1a', brown:'#92400e', red:'#dc2626', orange:'#ea580c',
    yellow:'#ca8a04', green:'#16a34a', blue:'#2563eb', violet:'#7c3aed',
    gray:'#6b7280', white:'#f1f5f9', gold:'#b45309', silver:'#9ca3af', none:'transparent'
  };
  var tbody = document.getElementById('colorTblBody');
  if (!tbody) return;
  rows.forEach(function (row) {
    var color = row[0];
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td><span class="cdot" style="background:' + hexMap[color] + '"></span>' +
      color.charAt(0).toUpperCase() + color.slice(1) + '</td>' +
      '<td>' + row[1] + '</td><td>' + row[2] + '</td><td>' + row[3] + '</td>' +
      '<td>' + row[4] + '</td><td>' + row[5] + '</td><td>' + row[6] + '</td>';
    tbody.appendChild(tr);
  });
})();

// Initialise resistor display
updateBands();


// ================================================================
// 3. CAPACITOR MODULE
// ================================================================
var capCharged = false;
var capPolOk   = true;

window.updateCap = function () {
  var rated   = parseFloat(document.getElementById('capRated').value)   || 16;
  var applied = parseFloat(document.getElementById('capApplied').value) || 0;
  var capUF   = parseFloat(document.getElementById('capVal').value)     || 100;

  document.getElementById('capRatedVal').textContent   = rated + 'V';
  document.getElementById('capAppliedVal').textContent = applied + 'V';

  // Charge level
  var chargePC = capCharged ? Math.min((applied / rated) * 100, 100) : 0;
  document.getElementById('capChargePC').textContent = Math.round(chargePC) + '%';

  // Stored energy
  var capF   = capUF * 1e-6;
  var energy = 0.5 * capF * applied * applied;
  var eStr;
  if (energy < 1e-6)      eStr = (energy * 1e9).toFixed(3) + ' nJ';
  else if (energy < 1e-3) eStr = (energy * 1e6).toFixed(3) + ' µJ';
  else if (energy < 1)    eStr = (energy * 1e3).toFixed(3) + ' mJ';
  else                    eStr = energy.toFixed(4) + ' J';
  document.getElementById('capEnergy').textContent = eStr;

  // Charge rectangle inside SVG (fills upward from y=128, max height=106)
  var fillH = Math.round((chargePC / 100) * 106);
  var rect  = document.getElementById('capChargeRect');
  rect.setAttribute('height', fillH);
  rect.setAttribute('y', 128 - fillH);
  document.getElementById('capVLabel').textContent = capCharged ? applied.toFixed(1) + 'V' : '0V';

  // Status
  var sb = document.getElementById('capStatusBox');
  if (!capPolOk) {
    sb.className = 'status-box err';
    sb.textContent = '⚠ ERROR: Reverse polarity! Capacitor may rupture or explode.';
  } else if (applied > rated * 1.05) {
    sb.className = 'status-box err';
    sb.textContent = '🔥 DANGER: Applied (' + applied.toFixed(1) + 'V) exceeds rated (' + rated + 'V) — risk of rupture!';
  } else if (applied > rated * 0.85) {
    sb.className = 'status-box warn';
    sb.textContent = '⚠ WARNING: Operating near maximum rated voltage — reduce if possible.';
  } else if (capCharged) {
    sb.className = 'status-box ok';
    sb.textContent = '✓ Safe — Charged to ' + applied.toFixed(1) + 'V (rated ' + rated + 'V)';
  } else {
    sb.className = 'status-box info';
    sb.textContent = 'ℹ Click "Charge Capacitor" to apply voltage.';
  }
};

window.chargeCapacitor = function () {
  capCharged = !capCharged;
  document.getElementById('capChargeBtn').textContent = capCharged
    ? '⚡ Discharge Capacitor'
    : '⚡ Charge Capacitor';
  updateCap();
};

window.toggleCapPolarity = function () {
  capPolOk = !capPolOk;
  var track    = document.getElementById('capPolTrack');
  var lbl      = document.getElementById('capPolLbl');
  var polText  = document.getElementById('capPolText');
  var polStripe = document.getElementById('capPolStripe');

  if (!capPolOk) {
    track.classList.add('err-on');
    lbl.textContent = 'REVERSED Polarity! (+ to −)';
    lbl.style.color = 'var(--rose)';
    polText.textContent = '+';
    polStripe.setAttribute('fill', 'rgba(220,38,38,0.4)');
  } else {
    track.classList.remove('err-on');
    lbl.textContent = 'Correct Polarity (+ to +)';
    lbl.style.color = '';
    polText.textContent = '−';
    polStripe.setAttribute('fill', 'rgba(0,0,0,0.25)');
  }
  updateCap();
};

updateCap();


// ================================================================
// 4. INDUCTOR MODULE
// ================================================================
window.updateInductor = function () {
  var Lmh  = parseFloat(document.getElementById('indVal').value)  || 10;
  var Ima  = parseFloat(document.getElementById('indCurr').value) || 100;
  document.getElementById('indValDisp').textContent  = Lmh.toFixed(1) + ' mH';
  document.getElementById('indCurrDisp').textContent = Ima.toFixed(0) + ' mA';

  // Energy: E = ½LI²
  var L = Lmh * 1e-3, I = Ima * 1e-3;
  var E = 0.5 * L * I * I;
  var eStr;
  if (E < 1e-9)      eStr = (E * 1e12).toFixed(2) + ' pJ';
  else if (E < 1e-6) eStr = (E * 1e9).toFixed(2)  + ' nJ';
  else if (E < 1e-3) eStr = (E * 1e6).toFixed(2)  + ' µJ';
  else               eStr = (E * 1e3).toFixed(3)  + ' mJ';
  document.getElementById('indEnergy').textContent = eStr;

  // Reactance XL = 2πfL at 1kHz
  var XL = 2 * Math.PI * 1000 * L;
  var xlStr;
  if (XL < 1)    xlStr = (XL * 1000).toFixed(2) + ' mΩ';
  else if (XL < 1000) xlStr = XL.toFixed(2) + ' Ω';
  else           xlStr = (XL / 1000).toFixed(2) + ' kΩ';
  document.getElementById('indReact').textContent = xlStr;

  // Core label
  var coreNames = { '1': 'Air Core', '200': 'Ferrite Core', '5000': 'Iron Core' };
  var coreVal   = document.getElementById('indCore').value;
  var coreLbl   = document.getElementById('indCoreLbl');
  if (coreLbl) coreLbl.textContent = coreNames[coreVal] || '';
};

updateInductor();


// ================================================================
// 5. DIODE MODULE
// ================================================================
var diodeFwd = true;

window.setBias = function (mode) {
  diodeFwd = (mode === 'forward');
  document.getElementById('btnFwd').className = 'bias-btn' + (diodeFwd  ? ' active-fwd' : '');
  document.getElementById('btnRev').className = 'bias-btn' + (!diodeFwd ? ' active-rev' : '');

  var flowEl     = document.getElementById('diodeFlow');
  flowEl.classList.toggle('flow-active', diodeFwd);
  updateDiode();
};

window.updateDiode = function () {
  var Vin = parseFloat(document.getElementById('diodeVin').value) || 0;
  var Vf  = parseFloat(document.getElementById('diodeType').value) || 0.7;
  document.getElementById('diodeVinVal').textContent = Vin.toFixed(1) + 'V';

  var status = document.getElementById('diodeStatus');
  if (diodeFwd) {
    var Vout = Math.max(0, Vin - Vf);
    document.getElementById('diodeVf').textContent   = Vf.toFixed(2) + 'V';
    document.getElementById('diodeVout').textContent = Vout.toFixed(2) + 'V';
    if (Vin >= Vf) {
      status.className = 'status-box ok';
      status.textContent = '⚡ Forward Biased — Current flows. Voltage drop = ' + Vf.toFixed(2) + 'V';
    } else {
      status.className = 'status-box warn';
      status.textContent = '⚠ Vin (' + Vin.toFixed(2) + 'V) < Vf (' + Vf.toFixed(2) + 'V) — diode not yet conducting.';
    }
  } else {
    document.getElementById('diodeVf').textContent   = '< 1 µA';
    document.getElementById('diodeVout').textContent = '~0V';
    status.className = 'status-box err';
    status.textContent = '🚫 Reverse Biased — Current blocked. Only leakage current flows.';
  }
};

setBias('forward');
updateDiode();


// ================================================================
// 6. LED MODULE
// ================================================================
var LED_COLORS = {
  red:      { hex:'#ef4444', glow:'#ef4444', vf:'1.6–2.0V', wave:'610–760 nm', mat:'AlGaAs, GaAsP, AlGaInP',         info:'AlGaAs, GaAsP — red LEDs, most common, efficient'        },
  orange:   { hex:'#f97316', glow:'#f97316', vf:'2.0–2.1V', wave:'590–610 nm', mat:'GaAsP, AlGaInP, GaP',            info:'GaAsP — orange/amber LEDs, indicator use'                 },
  yellow:   { hex:'#eab308', glow:'#eab308', vf:'2.1–2.2V', wave:'570–590 nm', mat:'GaAsP, AlGaInP, GaP',            info:'GaAsP — yellow LEDs, signal and indicator'                },
  green:    { hex:'#22c55e', glow:'#22c55e', vf:'1.9–4.0V', wave:'500–570 nm', mat:'GaP, AlGaInP, AlGaP',            info:'GaP — classic green; AlGaInP for high-brightness'         },
  blue:     { hex:'#3b82f6', glow:'#3b82f6', vf:'2.5–3.7V', wave:'450–500 nm', mat:'InGaN, SiC',                     info:'InGaN — Nobel Prize discovery by Nakamura (1994)'         },
  violet:   { hex:'#a855f7', glow:'#a855f7', vf:'2.8–4.0V', wave:'400–450 nm', mat:'InGaN',                          info:'InGaN — near-UV violet LEDs, high photon energy'          },
  white:    { hex:'#f1f5f9', glow:'#e2e8f0', vf:'3.0–3.5V', wave:'Broadband',  mat:'InGaN + YAG Phosphor (Ce:Y3Al5O12)', info:'Blue InGaN chip + Yttrium Aluminium Garnet phosphor' },
  infrared: { hex:'#7f1d1d', glow:'#dc2626', vf:'1.2–1.9V', wave:'> 760 nm',   mat:'GaAs, AlGaAs',                   info:'GaAs — infrared LEDs, invisible to human eye'            },
};

var ledPowered = false;
var ledColor   = 'red';

// Build color palette
(function buildLEDPalette() {
  var palette = document.getElementById('ledPalette');
  if (!palette) return;
  Object.keys(LED_COLORS).forEach(function (name, idx) {
    var data = LED_COLORS[name];
    var btn  = document.createElement('button');
    btn.className = 'led-swatch' + (name === 'red' ? ' active' : '');
    btn.style.background = (name === 'infrared')
      ? 'linear-gradient(135deg,#7f1d1d,#991b1b)'
      : data.hex;
    btn.title = name.charAt(0).toUpperCase() + name.slice(1);
    btn.onclick = function () { setLEDColor(name); };
    palette.appendChild(btn);
  });
})();

// Build LED material table
(function buildLEDTable() {
  var tbody = document.getElementById('ledTblBody');
  if (!tbody) return;
  Object.keys(LED_COLORS).forEach(function (name) {
    var data = LED_COLORS[name];
    var tr   = document.createElement('tr');
    tr.innerHTML =
      '<td><span class="led-dot" style="background:' + data.hex + ';border:1.5px solid rgba(0,0,0,.2)"></span>' +
      name.charAt(0).toUpperCase() + name.slice(1) + '</td>' +
      '<td>' + data.wave + '</td>' +
      '<td>' + data.vf   + '</td>' +
      '<td>' + data.mat  + '</td>';
    tbody.appendChild(tr);
  });
})();

function setLEDColor(name) {
  ledColor = name;
  var data  = LED_COLORS[name];

  // Update palette active state
  document.querySelectorAll('.led-swatch').forEach(function (btn, i) {
    btn.classList.toggle('active', Object.keys(LED_COLORS)[i] === name);
  });

  // Update SVG body color
  var body = document.getElementById('ledBodyEllipse');
  var base = document.getElementById('ledBase');
  if (body) body.setAttribute('fill', data.hex);
  if (base) base.setAttribute('fill', data.hex);

  // Apply glow if powered
  if (ledPowered) applyLEDGlow(data);

  // Update readings
  document.getElementById('ledVf').textContent   = data.vf;
  document.getElementById('ledWave').textContent  = data.wave;
  var mi = document.getElementById('ledMaterialInfo');
  if (mi) mi.textContent = data.info;
}

function applyLEDGlow(data) {
  var glowBg = document.getElementById('ledGlowBg');
  var rays   = document.getElementById('ledRays');
  if (glowBg) {
    glowBg.style.background = 'radial-gradient(circle at 50% 40%,' + data.glow + '55 0%, transparent 70%)';
    glowBg.style.opacity = '1';
  }
  if (rays) {
    rays.setAttribute('opacity', '0.9');
    rays.querySelectorAll('line').forEach(function (l) {
      l.setAttribute('stroke', data.hex);
    });
  }
}

window.toggleLED = function () {
  ledPowered = !ledPowered;
  var btn   = document.getElementById('ledPowerBtn');
  var badge = document.getElementById('ledStatusBadge');
  var ind   = document.getElementById('ledPowerInd');
  var data  = LED_COLORS[ledColor];

  if (ledPowered) {
    btn.classList.add('on');
    btn.textContent    = '⚡ Power ON';
    badge.className    = 'status-badge s-ok';
    badge.textContent  = 'LED ON ●';
    if (ind) { ind.style.opacity = '1'; ind.style.color = data.hex; ind.textContent = '● ON'; }
    applyLEDGlow(data);
  } else {
    btn.classList.remove('on');
    btn.textContent    = '⚡ Power OFF';
    badge.className    = 'status-badge s-err';
    badge.textContent  = 'LED OFF';
    if (ind) { ind.style.opacity = '0'; }
    var glowBg = document.getElementById('ledGlowBg');
    var rays   = document.getElementById('ledRays');
    if (glowBg) glowBg.style.opacity = '0';
    if (rays)   rays.setAttribute('opacity', '0');
  }
};

// Init LED
setLEDColor('red');


// ================================================================
// 7. MULTIMETER MODULE
// ================================================================
var mDial = 'off';
var mJack = 'vohm';

var NEEDLE_ANGLES = {
  off:  135, dcv: -60, acv: -30, ohm:  0,
  dca:   90, diode: 60, cont: 110, hz: 30, cap: -90
};

window.setDial = function (mode) {
  mDial = mode;
  document.querySelectorAll('.dial-btn').forEach(function (b) { b.classList.remove('active'); });
  var btn = document.getElementById('dial-' + mode);
  if (btn) btn.classList.add('active');

  var needle = document.getElementById('meterNeedle');
  if (needle) needle.style.transform = 'rotate(' + (NEEDLE_ANGLES[mode] || 0) + 'deg)';

  var modeEl = document.getElementById('meterDispMode');
  if (modeEl) modeEl.textContent = 'MODE: ' + mode.toUpperCase();
  document.getElementById('meterModeLbl').textContent = 'MODE: ' + mode.toUpperCase();

  updateMeterReading();
};

window.selectJack = function (j) {
  mJack = j;
  var map = { com:'COM', vohm:'VOhm', amp:'Amp' };
  document.querySelectorAll('.probe-jack').forEach(function (el) { el.classList.remove('selected'); });
  var el = document.getElementById('pj' + map[j]);
  if (el) el.classList.add('selected');
  updateMeterReading();
};

window.updateMeterReading = function () {
  var red  = document.getElementById('meterConnRed').value;
  var blk  = document.getElementById('meterConnBlk').value;
  var errEl  = document.getElementById('meterError');
  var infoEl = document.getElementById('meterInfo');
  var valEl  = document.getElementById('meterReadVal');
  var unitEl = document.getElementById('meterReadUnit');
  var svgVal  = document.getElementById('meterDispVal');
  var svgUnit = document.getElementById('meterDispUnit');

  errEl.style.display  = 'none';
  infoEl.style.display = 'none';

  function showErr(msg) {
    errEl.style.display  = 'block';
    errEl.textContent    = '⚠ ' + msg;
    valEl.textContent    = 'Err';
    unitEl.textContent   = '';
    svgVal.textContent   = 'Err';
    svgUnit.textContent  = '';
  }

  function showVal(v, u, info) {
    valEl.textContent    = v;
    unitEl.textContent   = u;
    svgVal.textContent   = v;
    svgUnit.textContent  = u;
    if (info) { infoEl.style.display = 'block'; infoEl.textContent = info; }
  }

  function showInfo(msg) { infoEl.style.display = 'block'; infoEl.textContent = msg; }

  // ── Meter is off ──
  if (mDial === 'off') {
    showVal('---', '', '⏻ Meter is OFF. Rotate the dial to begin measuring.');
    return;
  }

  // ── Jack mismatch errors ──
  if (mDial === 'dca' && mJack !== 'amp') {
    showErr('Move Red Probe to the mA/A jack before measuring current!');
    return;
  }
  if (mDial !== 'dca' && mJack === 'amp') {
    showErr('Red probe is in mA/A jack! Move to V/Ω jack for voltage or resistance.');
    return;
  }

  // ── Resistance on live circuit ──
  if ((mDial === 'ohm' || mDial === 'cont') && (red === 'bat_pos' || blk === 'bat_neg')) {
    showErr('Remove power before measuring resistance! This will damage the meter.');
    return;
  }

  // ── DC Voltage ──
  if (mDial === 'dcv') {
    if (red === 'bat_pos' && blk === 'bat_neg') {
      showVal('9.000', 'V DC', '✓ Battery voltage: 9.000 V DC — Red probe at +, Black at −.');
    } else if (red === 'cap_pos' && blk === 'bat_neg') {
      var cv = parseFloat(document.getElementById('capApplied').value) || 0;
      showVal(cv.toFixed(3), 'V DC', '✓ Voltage across capacitor: ' + cv.toFixed(3) + 'V DC');
    } else if (red === 'led_a' && blk === 'bat_neg') {
      showVal('2.000', 'V DC', '✓ Voltage at LED anode: 2.000V DC');
    } else if (red === 'diode_a' && blk === 'bat_neg') {
      showVal('4.300', 'V DC', '✓ Voltage at diode anode: 4.3V DC (9V − 0.7V × circuit)');
    } else if (red === 'none' || blk === 'none' || red === blk) {
      showVal('0.000', 'V DC', 'ℹ Probes not connected or both in the same node.');
    } else {
      showVal('OL', '', '⚠ Overload or wrong connection — check probe placement.');
    }
  }

  // ── AC Voltage ──
  else if (mDial === 'acv') {
    showVal('0.000', 'V AC', 'ℹ No AC source present in this simulation. AC reading = 0.');
  }

  // ── Resistance ──
  else if (mDial === 'ohm') {
    if (red === 'res_a' && blk === 'res_b') {
      showVal('1.000', 'kΩ', '✓ Resistance = 1.000 kΩ');
    } else if (red === 'short' && blk === 'short') {
      showVal('0.000', 'Ω', '✓ Short circuit — 0Ω (should trigger continuity beep)');
    } else if (red === 'none' || blk === 'none') {
      showVal('OL', '', 'ℹ Open circuit — probes not connected.');
    } else {
      showVal('OL', '', 'ℹ Cannot measure resistance here. Connect across a resistor (power off).');
    }
  }

  // ── Diode Test ──
  else if (mDial === 'diode') {
    if (red === 'diode_a' && blk === 'diode_k') {
      showVal('0.700', 'V', '✓ Silicon diode Vf = 0.700V — Good. LED will glow faintly during test.');
    } else if (red === 'diode_k' && blk === 'diode_a') {
      showVal('OL', '', 'ℹ Probes reversed — reverse biased diode reads OL (normal behaviour).');
    } else if (red === 'led_a') {
      showVal('2.000', 'V', '✓ LED forward voltage ≈ 2.000V. LED flickers faintly during test.');
    } else {
      showVal('OL', '', 'ℹ Connect Red→Anode, Black→Cathode for diode test.');
    }
  }

  // ── Continuity ──
  else if (mDial === 'cont') {
    if (red === 'short' && blk === 'short') {
      showVal('000', 'Ω 🔔', '✓ BEEP! Continuity confirmed — conductors are connected.');
    } else if (red === 'none' || blk === 'none') {
      showVal('OL', '', 'ℹ No continuity — open circuit.');
    } else {
      showVal('OL', '', 'ℹ No continuous path detected at this connection.');
    }
  }

  // ── Capacitance ──
  else if (mDial === 'cap') {
    if (red === 'cap_pos' && blk === 'cap_neg') {
      var capMu = parseFloat(document.getElementById('capVal').value) || 100;
      showVal(capMu.toFixed(1), 'µF', '✓ Capacitance = ' + capMu.toFixed(1) + ' µF (power must be off).');
    } else {
      showVal('0.000', 'µF', 'ℹ Connect probes across capacitor terminals (power off).');
    }
  }

  // ── Frequency ──
  else if (mDial === 'hz') {
    showVal('0.000', 'Hz', 'ℹ No AC / oscillating signal detected in this simulation.');
  }

  // ── DC Current ──
  else if (mDial === 'dca') {
    showVal('0.000', 'mA',
      'ℹ For current: break the circuit and insert the meter in series (Red in mA/A jack).');
  }
};

setDial('off');


// ================================================================
// 8. BREADBOARD MODULE
// ================================================================
var BB_COLS = 30;
var bbTool  = 'wire-red';
var bbState = {}; // key: "rowLabel-col"

var TOOL_CLASS = {
  'wire-red': 'h-red',
  'wire-blk': 'h-blk',
  'wire-yel': 'h-yel',
  'wire-grn': 'h-grn',
  'led':      'h-led',
  'res':      'h-res',
  'erase':    '',
};

window.selectBBTool = function (t) {
  bbTool = t;
  document.querySelectorAll('.bb-tool').forEach(function (el) { el.classList.remove('active'); });
  var el = document.getElementById('tool-' + t);
  if (el) el.classList.add('active');
};

function bbClick(rowKey, col) {
  var key    = rowKey + '-' + col;
  var holeEl = document.getElementById('bbh-' + key);
  if (!holeEl) return;

  if (bbTool === 'erase') {
    holeEl.className = 'bb-hole';
    delete bbState[key];
  } else {
    var cls = TOOL_CLASS[bbTool] || '';
    holeEl.className = 'bb-hole' + (cls ? ' ' + cls : '');
    bbState[key] = cls;
  }
}

function buildRailRow(containerId, rowKey, isPlus) {
  var row = document.getElementById(containerId);
  if (!row) return;
  row.innerHTML = '';

  var lbl = document.createElement('div');
  lbl.className = 'bb-row-lbl';
  lbl.style.color = isPlus ? '#f87171' : '#93c5fd';
  lbl.textContent = isPlus ? '+' : '−';
  row.appendChild(lbl);

  for (var c = 1; c <= BB_COLS; c++) {
    (function (col) {
      var h = document.createElement('div');
      h.className = 'bb-hole';
      var key = rowKey + '-' + col;
      h.id    = 'bbh-' + key;
      h.onclick = function () { bbClick(rowKey, col); };
      row.appendChild(h);
    })(c);
  }
}

function buildComponentRows(containerId, labels) {
  var container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  labels.forEach(function (lbl) {
    var row = document.createElement('div');
    row.className = 'bb-row';

    var rowLbl = document.createElement('div');
    rowLbl.className = 'bb-row-lbl';
    rowLbl.textContent = lbl.toUpperCase();
    row.appendChild(rowLbl);

    for (var c = 1; c <= BB_COLS; c++) {
      (function (col) {
        var h   = document.createElement('div');
        h.className = 'bb-hole';
        var key = lbl + '-' + col;
        h.id    = 'bbh-' + key;
        h.onclick = function () { bbClick(lbl, col); };
        row.appendChild(h);
      })(c);
    }
    container.appendChild(row);
  });
}

function buildNumbers() {
  var numRow = document.getElementById('bbNumbers');
  if (!numRow) return;
  numRow.innerHTML = '';
  for (var c = 1; c <= BB_COLS; c++) {
    var d = document.createElement('div');
    d.className = 'bb-num';
    d.textContent = (c === 1 || c % 5 === 0) ? c : '';
    numRow.appendChild(d);
  }
}

function buildBreadboard() {
  buildNumbers();
  buildRailRow('bb-rail-top-plus',  'rail-tp', true);
  buildRailRow('bb-rail-top-minus', 'rail-tm', false);
  buildComponentRows('bb-rows-top', ['a','b','c','d','e']);
  buildComponentRows('bb-rows-bot', ['f','g','h','i','j']);
  buildRailRow('bb-rail-bot-minus', 'rail-bm', false);
  buildRailRow('bb-rail-bot-plus',  'rail-bp', true);
}

window.clearBoard = function () {
  Object.keys(bbState).forEach(function (k) { delete bbState[k]; });
  document.querySelectorAll('.bb-hole').forEach(function (h) { h.className = 'bb-hole'; });
  document.getElementById('bbInfoBox').innerHTML =
    '<strong>How Breadboard Works:</strong><br>' +
    '🔴 Red rails (+) — All holes connected horizontally (power line)<br>' +
    '🔵 Blue rails (−) — All holes connected horizontally (ground line)<br>' +
    '🟢 Rows A–E &amp; F–J — Holes in same row &amp; column are internally connected vertically<br>' +
    '📌 Click a hole with a selected tool to place a component or wire';
};

window.loadDemoCircuit = function () {
  clearBoard();
  var placements = [
    ['rail-tp', 5,  'h-red'],
    ['a',       5,  'h-red'],
    ['b',       5,  'h-red'],
    ['c',       5,  'h-res'],
    ['d',       5,  'h-res'],
    ['e',       5,  'h-res'],
    ['f',       5,  'h-yel'],
    ['g',       5,  'h-led'],
    ['h',       5,  'h-led'],
    ['i',       5,  'h-blk'],
    ['j',       5,  'h-blk'],
    ['rail-bm', 5,  'h-blk'],
    ['rail-tp', 1,  'h-red'],
    ['rail-bm', 1,  'h-blk'],
  ];
  placements.forEach(function (p) {
    var key = p[0] + '-' + p[1];
    var el  = document.getElementById('bbh-' + key);
    if (el) {
      el.className = 'bb-hole ' + p[2];
      bbState[key] = p[2];
    }
  });
  document.getElementById('bbInfoBox').innerHTML =
    '<strong>Demo Circuit: LED + Resistor (Column 5)</strong><br>' +
    '🔴 <strong>Rail +</strong> → Rows A–B (power wire) → Rows C–E (470Ω resistor, brown) → Row F (link wire)<br>' +
    '💜 <strong>Rows G–H</strong> = LED (Anode at G, Cathode at H) → Rows I–J → GND rail<br>' +
    '⚡ <strong>Circuit path:</strong> +9V → 470Ω → LED Anode → LED Cathode → GND<br>' +
    '📐 <strong>R = (9V − 2V) / 20mA = 350Ω → use 470Ω</strong> (nearest standard E24 value)';
};

buildBreadboard();
clearTimeout(_expSafetyTimer);