/* ════════════════════════════════════════════════════════════
   LogicFlow — Experiment 02: Virtual CRO & Function Generator
   Correct physics, dual-channel, wiring simulation
   ════════════════════════════════════════════════════════════ */

'use strict';

// ── Calibrated TIME/DIV steps (seconds per division) ─────────
const TIME_STEPS = [
  1e-6, 2e-6, 5e-6,           // µs range
  1e-5, 2e-5, 5e-5,           // 10µs, 20µs, 50µs
  1e-4, 2e-4, 5e-4,           // 0.1ms, 0.2ms, 0.5ms
  1e-3, 2e-3, 5e-3,           // 1ms, 2ms, 5ms
  1e-2, 2e-2, 5e-2,           // 10ms, 20ms, 50ms
  1e-1, 2e-1, 5e-1, 1         // 0.1s, 0.2s, 0.5s, 1s
];

// Calibrated VOLTS/DIV steps (V per division)
const VOLT_STEPS = [
  0.005, 0.01, 0.02, 0.05, 0.1,
  0.2, 0.5, 1, 2, 5, 10, 20, 50
];

// ── Formatting helpers ────────────────────────────────────────
function fmtTime(sec) {
  if (sec >= 1)     return sec.toFixed(2) + ' s';
  if (sec >= 1e-3)  return (sec * 1e3).toPrecision(3) + ' ms';
  if (sec >= 1e-6)  return (sec * 1e6).toPrecision(3) + ' µs';
  return (sec * 1e9).toPrecision(3) + ' ns';
}
function fmtFreq(hz) {
  if (hz >= 1e6)   return (hz / 1e6).toPrecision(4) + ' MHz';
  if (hz >= 1e3)   return (hz / 1e3).toPrecision(4) + ' kHz';
  return hz.toPrecision(4) + ' Hz';
}
function fmtVolt(v) {
  if (Math.abs(v) >= 1000) return (v / 1000).toPrecision(4) + ' kV';
  if (Math.abs(v) >= 1)    return v.toPrecision(4) + ' V';
  if (Math.abs(v) >= 1e-3) return (v * 1e3).toPrecision(4) + ' mV';
  return v.toPrecision(4) + ' V';
}
function fmtVStep(v) {
  if (v >= 1)    return v + ' V';
  if (v >= 0.001) return (v * 1000) + ' mV';
  return v + ' V';
}

// ── Waveform sample function ──────────────────────────────────
// Returns voltage at time t (seconds)
function sampleWave(waveType, freq, amp, offset, phase, t, coupling) {
  const omega = 2 * Math.PI * freq;
  const phi = phase * Math.PI / 180;
  let v = 0;
  const arg = omega * t + phi;
  switch (waveType) {
    case 'sine':
      v = amp * Math.sin(arg);
      break;
    case 'square':
      v = amp * (Math.sin(arg) >= 0 ? 1 : -1);
      break;
    case 'triangle': {
      // Correct triangle: linear ramp, phase-aligned with sine
      const phase_norm = ((arg / (2 * Math.PI)) % 1 + 1) % 1;
      if (phase_norm < 0.5) v = amp * (4 * phase_norm - 1);
      else v = amp * (3 - 4 * phase_norm);
      break;
    }
    case 'sawtooth': {
      const phase_norm = ((arg / (2 * Math.PI)) % 1 + 1) % 1;
      v = amp * (2 * phase_norm - 1);
      break;
    }
    default:
      v = 0;
  }
  // Apply DC offset and coupling
  if (coupling === 'dc') {
    return v + offset;
  } else if (coupling === 'ac') {
    return v; // AC coupling blocks DC offset
  } else { // GND
    return 0;
  }
}

// Vrms of waveform (analytical)
function calcVrms(waveType, amp) {
  switch (waveType) {
    case 'sine':      return amp / Math.sqrt(2);
    case 'square':    return amp;
    case 'triangle':  return amp / Math.sqrt(3);
    case 'sawtooth':  return amp / Math.sqrt(3);
    default:          return 0;
  }
}

// ══════════════════════════════════════════════════════════════
//  SIMPLE MODE STATE
// ══════════════════════════════════════════════════════════════
const S = {
  waveType: 'sine',
  freq: 1000,
  amp: 5,
  offset: 0,
  phase: 0,
  vdivIdx: 4,   // index into VOLT_STEPS → 2V
  tdivIdx: 9,   // index into TIME_STEPS → 0.5ms
  yPos: 0,      // divisions
  xPos: 0,      // divisions
  trigger: 'auto',
  coupling: 'ac',
  inverted: false,
  trigLevel: 0, // V
};

let sCanvas, sCtx;
let sAnimId = null;

function initSimple() {
  sCanvas = document.getElementById('s-croCanvas');
  sCtx = sCanvas.getContext('2d');
  resizeCanvas(sCanvas);
  window.addEventListener('resize', () => resizeCanvas(sCanvas));
  drawSimple();
}

function resizeCanvas(canvas) {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function getSimpleState() {
  const freq  = parseFloat(document.getElementById('s-sid-freq').value);
  const amp   = parseFloat(document.getElementById('s-sid-amp').value);
  const off   = parseFloat(document.getElementById('s-sid-offset').value);
  const phase = parseFloat(document.getElementById('s-sid-phase').value);
  const vdivIdx = parseInt(document.getElementById('s-sid-vdiv').value);
  const tdivIdx = parseInt(document.getElementById('s-sid-tdiv').value);
  const yPos  = parseFloat(document.getElementById('s-sid-ypos').value);
  const xPos  = parseFloat(document.getElementById('s-sid-xpos').value);
  return { freq, amp, off, phase, vdivIdx, tdivIdx, yPos, xPos };
}

function updateSimple() {
  const { freq, amp, off, phase, vdivIdx, tdivIdx, yPos, xPos } = getSimpleState();

  // Labels
  document.getElementById('s-lbl-freq').textContent = fmtFreq(freq);
  document.getElementById('s-lbl-amp').textContent = amp.toFixed(1) + ' V';
  document.getElementById('s-lbl-offset').textContent = off.toFixed(1) + ' V';
  document.getElementById('s-lbl-phase').textContent = phase + '°';
  document.getElementById('s-lbl-ypos').textContent = yPos.toFixed(1) + ' div';
  document.getElementById('s-lbl-xpos').textContent = xPos.toFixed(1) + ' div';

  const vdiv = VOLT_STEPS[Math.min(vdivIdx, VOLT_STEPS.length - 1)];
  const tdiv = TIME_STEPS[Math.min(tdivIdx, TIME_STEPS.length - 1)];
  document.getElementById('s-lbl-vdiv').textContent = fmtVStep(vdiv);
  document.getElementById('s-lbl-tdiv').textContent = fmtTime(tdiv);
  document.getElementById('s-cro-ch1').textContent = 'CH1: ' + fmtVStep(vdiv) + '/DIV';
  document.getElementById('s-cro-time').textContent = 'TIME: ' + fmtTime(tdiv) + '/DIV';
  document.getElementById('s-cro-freq-meas').textContent = '~' + fmtFreq(freq);

  // Measurements
  const period = 1 / freq;
  const vrms = calcVrms(S.waveType, amp);
  document.getElementById('s-meas-freq').textContent = fmtFreq(freq);
  document.getElementById('s-meas-period').textContent = fmtTime(period);
  document.getElementById('s-meas-vpp').textContent = (2 * amp).toFixed(3) + ' V';
  document.getElementById('s-meas-vrms').textContent = vrms.toFixed(4) + ' V';

  // Info card
  document.getElementById('s-info-period').textContent = fmtTime(period);
  document.getElementById('s-info-vpp').textContent = (2 * amp).toFixed(3) + ' V';
  document.getElementById('s-info-vrms').textContent = vrms.toFixed(4) + ' V';
  const omega = 2 * Math.PI * freq;
  document.getElementById('s-info-omega').textContent = omega < 1e6 ? omega.toFixed(1) : (omega / 1e6).toFixed(3) + 'M';
}

function setWave(type, mode) {
  // mode: 's' = simple, 'w1' = wired ch1, 'w2' = wired ch2
  const prefix = mode === 's' ? 's' : mode;
  const waveTypes = ['sine', 'square', 'triangle', 'sawtooth'];
  waveTypes.forEach(w => {
    const btn = document.getElementById(`${prefix}-btn-${w}`);
    if (btn) btn.classList.toggle('active', w === type);
  });
  if (mode === 's') {
    S.waveType = type;
    updateSimple();
  } else if (mode === 'w1') {
    W.ch1Wave = type;
    updateWired();
  } else if (mode === 'w2') {
    W.ch2Wave = type;
    updateWired();
  }
}

function setTrigger(mode, which) {
  if (which === 's') {
    S.trigger = mode;
    ['auto', 'normal', 'single'].forEach(m => {
      const btn = document.getElementById(`s-trig-${m}`);
      if (btn) btn.classList.toggle('active', m === mode);
    });
    document.getElementById('s-trig-status').textContent = 'TRIG: ' + mode.toUpperCase();
  } else {
    W.trigger = mode;
    ['auto', 'normal'].forEach(m => {
      const btn = document.getElementById(`w-trig-${m}`);
      if (btn) btn.classList.toggle('active', m === mode);
    });
    document.getElementById('w-trig-status').textContent = 'TRIG: ' + mode.toUpperCase();
  }
}

function setCoupling(mode, which) {
  if (which === 's') {
    S.coupling = mode;
    ['ac', 'dc', 'gnd'].forEach(m => {
      const btn = document.getElementById(`s-coup-${m}`);
      if (btn) btn.classList.toggle('active', m === mode);
    });
  }
}

function toggleInvert(which) {
  if (which === 's') {
    S.inverted = !S.inverted;
    const btn = document.getElementById('s-inv-btn');
    btn.textContent = S.inverted ? 'ON' : 'OFF';
    btn.classList.toggle('active', S.inverted);
  }
}

// ── CRO Drawing Engine ────────────────────────────────────────
// Draws a single trace on ctx
function drawTrace(ctx, W_px, H_px, tdiv, vdiv, numTdivs, numVdivs,
                   waveType, freq, amp, offset, phase, coupling, yPos, xPos, color, inverted) {
  const totalTime = numTdivs * tdiv;
  const midY = H_px / 2;
  const pixPerSec = W_px / totalTime;
  const pixPerVolt = (H_px / numVdivs) / vdiv;

  // Trigger: find first rising zero crossing
  let tOffset = 0;
  if (freq > 0 && coupling !== 'gnd') {
    const period = 1 / freq;
    // Find phase offset for trigger at 0V rising edge (within one period)
    // Analytical: for sine, zero crossing at t=0 by definition
    // Just use time=0 start; visually stable
    tOffset = 0;
  }

  // X position shift (in pixels)
  const xShift = xPos * (W_px / numTdivs);

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 6;
  ctx.shadowColor = color;

  for (let px = 0; px <= W_px; px++) {
    const t = (px - xShift) / pixPerSec + tOffset;
    let v = sampleWave(waveType, freq, amp, offset, phase, t, coupling);
    if (inverted) v = -v;
    const py = midY - ((v + yPos * vdiv) * pixPerVolt);
    if (px === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawGrid(ctx, W_px, H_px, numTdivs, numVdivs) {
  // Background
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, W_px, H_px);

  const divW = W_px / numTdivs;
  const divH = H_px / numVdivs;

  // Minor grid (5 subdivisions per div)
  ctx.strokeStyle = 'rgba(16,185,129,0.08)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= numTdivs * 5; i++) {
    ctx.beginPath();
    ctx.moveTo(i * divW / 5, 0);
    ctx.lineTo(i * divW / 5, H_px);
    ctx.stroke();
  }
  for (let i = 0; i <= numVdivs * 5; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * divH / 5);
    ctx.lineTo(W_px, i * divH / 5);
    ctx.stroke();
  }

  // Major grid
  ctx.strokeStyle = 'rgba(16,185,129,0.22)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= numTdivs; i++) {
    ctx.beginPath();
    ctx.moveTo(i * divW, 0);
    ctx.lineTo(i * divW, H_px);
    ctx.stroke();
  }
  for (let i = 0; i <= numVdivs; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * divH);
    ctx.lineTo(W_px, i * divH);
    ctx.stroke();
  }

  // Axes (brighter center lines)
  ctx.strokeStyle = 'rgba(16,185,129,0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W_px / 2, 0); ctx.lineTo(W_px / 2, H_px);
  ctx.moveTo(0, H_px / 2); ctx.lineTo(W_px, H_px / 2);
  ctx.stroke();

  // Tick marks on axes
  ctx.strokeStyle = 'rgba(16,185,129,0.55)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= numTdivs * 5; i++) {
    const x = i * divW / 5;
    ctx.beginPath(); ctx.moveTo(x, H_px / 2 - 3); ctx.lineTo(x, H_px / 2 + 3); ctx.stroke();
  }
  for (let i = 0; i <= numVdivs * 5; i++) {
    const y = i * divH / 5;
    ctx.beginPath(); ctx.moveTo(W_px / 2 - 3, y); ctx.lineTo(W_px / 2 + 3, y); ctx.stroke();
  }

  // Screen glow effect (vignette)
  const grd = ctx.createRadialGradient(W_px / 2, H_px / 2, 0, W_px / 2, H_px / 2, Math.max(W_px, H_px) / 2);
  grd.addColorStop(0, 'rgba(0,0,0,0)');
  grd.addColorStop(1, 'rgba(0,0,30,0.35)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W_px, H_px);
}

// ── Simple Mode draw loop ────────────────────────────────────
function drawSimple() {
  if (!sCanvas || !sCtx) return;
  const W_px = sCanvas.width;
  const H_px = sCanvas.height;
  const numTdivs = 10, numVdivs = 8;

  const { freq, amp, off, phase, vdivIdx, tdivIdx, yPos, xPos } = getSimpleState();
  const vdiv = VOLT_STEPS[Math.min(vdivIdx, VOLT_STEPS.length - 1)];
  const tdiv = TIME_STEPS[Math.min(tdivIdx, TIME_STEPS.length - 1)];

  sCtx.clearRect(0, 0, W_px, H_px);
  drawGrid(sCtx, W_px, H_px, numTdivs, numVdivs);

  drawTrace(sCtx, W_px, H_px, tdiv, vdiv, numTdivs, numVdivs,
    S.waveType, freq, amp, off, phase, S.coupling, yPos, xPos,
    '#34d399', S.inverted);

  sAnimId = requestAnimationFrame(drawSimple);
}

// ══════════════════════════════════════════════════════════════
//  WIRING MODE STATE
// ══════════════════════════════════════════════════════════════
const W = {
  ch1Wave: 'sine',
  ch2Wave: 'sine',
  // Connection map: croChannel -> fgChannel (null = not connected)
  connections: { 1: null, 2: null },
  selectedFg: null,  // currently selected FG output (1 or 2)
  selectedCro: null, // currently selected CRO input
  trigger: 'auto',
  trigSrc: 1,
};

let wCanvas, wCtx;

function initWired() {
  wCanvas = document.getElementById('w-croCanvas');
  wCtx = wCanvas.getContext('2d');
  resizeCanvas(wCanvas);
  window.addEventListener('resize', () => resizeCanvas(wCanvas));

  // Right-click on any terminal to disconnect it
  ['fg-out-1', 'fg-out-2'].forEach((id, i) => {
    const ch = i + 1;
    document.getElementById(id)?.addEventListener('contextmenu', e => {
      e.preventDefault();
      disconnectFg(ch);
    });
  });
  ['cro-in-1', 'cro-in-2'].forEach((id, i) => {
    const ch = i + 1;
    document.getElementById(id)?.addEventListener('contextmenu', e => {
      e.preventDefault();
      disconnectCro(ch);
    });
  });

  // Press Escape to cancel any pending selection
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && (W.selectedFg !== null || W.selectedCro !== null)) {
      clearSelection();
      document.getElementById('wireHint').textContent = '🔌 Selection cancelled. Click a FG output or CRO input to start.';
    }
  });

  updateWired();
  drawWired();
}

function clearSelection() {
  W.selectedFg = null;
  W.selectedCro = null;
  ['fg-out-1', 'fg-out-2', 'cro-in-1', 'cro-in-2'].forEach(id =>
    document.getElementById(id)?.classList.remove('selected')
  );
}

function disconnectFg(fgCh) {
  // Remove all CRO connections that go to this FG channel
  let removed = false;
  [1, 2].forEach(croCh => {
    if (W.connections[croCh] === fgCh) {
      W.connections[croCh] = null;
      removed = true;
    }
  });
  if (removed) {
    clearSelection();
    updateConnectionVisuals();
    document.getElementById('wireHint').textContent = `🔌 FG CH${fgCh} disconnected. Click to start a new connection.`;
  }
}

function disconnectCro(croCh) {
  if (W.connections[croCh] !== null) {
    W.connections[croCh] = null;
    clearSelection();
    updateConnectionVisuals();
    document.getElementById('wireHint').textContent = `🔌 CRO CH${croCh} disconnected. Click to start a new connection.`;
    return true;
  }
  return false;
}

function selectFgOutput(ch) {
  // If this FG is already connected AND nothing is currently being selected → unplug
  const isConnected = [1, 2].some(croCh => W.connections[croCh] === ch);
  if (isConnected && W.selectedFg === null && W.selectedCro === null) {
    disconnectFg(ch);
    return;
  }
  // If clicking the already-selected FG → cancel selection
  if (W.selectedFg === ch) {
    clearSelection();
    document.getElementById('wireHint').textContent = '🔌 Selection cancelled. Click a FG output to start connecting.';
    return;
  }
  // Normal select
  W.selectedFg = ch;
  W.selectedCro = null;
  document.getElementById('fg-out-1').classList.toggle('selected', ch === 1);
  document.getElementById('fg-out-2').classList.toggle('selected', ch === 2);
  document.getElementById('cro-in-1').classList.remove('selected');
  document.getElementById('cro-in-2').classList.remove('selected');
  document.getElementById('wireHint').textContent = `FG CH${ch} selected — now click a CRO channel input to connect. (Click again to cancel)`;
}

function selectCroInput(ch) {
  // If CRO input is already connected AND nothing selected → unplug
  if (W.connections[ch] !== null && W.selectedFg === null && W.selectedCro === null) {
    disconnectCro(ch);
    return;
  }
  if (W.selectedFg !== null) {
    // Complete the connection
    W.connections[ch] = W.selectedFg;
    clearSelection();
    updateConnectionVisuals();
    document.getElementById('wireHint').textContent = '✅ Connected! Click any connected terminal to unplug it.';
  } else {
    // If clicking the already-selected CRO input → cancel
    if (W.selectedCro === ch) {
      clearSelection();
      document.getElementById('wireHint').textContent = '🔌 Selection cancelled. Click a FG output to start connecting.';
      return;
    }
    // Select this CRO input
    W.selectedCro = ch;
    W.selectedFg = null;
    document.getElementById('cro-in-1').classList.toggle('selected', ch === 1);
    document.getElementById('cro-in-2').classList.toggle('selected', ch === 2);
    document.getElementById('fg-out-1').classList.remove('selected');
    document.getElementById('fg-out-2').classList.remove('selected');
    document.getElementById('wireHint').textContent = `CRO CH${ch} selected — now click a FG output to connect. (Click again to cancel)`;
  }
}

function clearAllWires() {
  W.connections = { 1: null, 2: null };
  clearSelection();
  updateConnectionVisuals();
  document.getElementById('wireHint').textContent = '🔌 All wires cleared. Click a FG output to start connecting.';
}

function setTrigSrc(ch) {
  W.trigSrc = ch;
  document.getElementById('w-trig-src1').classList.toggle('active', ch === 1);
  document.getElementById('w-trig-src2').classList.toggle('active', ch === 2);
}

function updateConnectionVisuals() {
  const svg = document.getElementById('wireSvg');
  if (!svg) return;
  svg.innerHTML = '';

  const c1 = W.connections[1]; // which FG is CRO CH1 connected to
  const c2 = W.connections[2];

  // Update button classes
  ['fg-out-1', 'fg-out-2', 'cro-in-1', 'cro-in-2'].forEach(id => {
    document.getElementById(id)?.classList.remove('connected', 'ch1-wire-connected', 'ch2-wire-connected');
  });

  // Status labels
  const stat1 = document.getElementById('cro-in-1-status');
  const stat2 = document.getElementById('cro-in-2-status');
  if (stat1) stat1.textContent = c1 ? `← FG CH${c1}` : 'Not connected';
  if (stat2) stat2.textContent = c2 ? `← FG CH${c2}` : 'Not connected';
  if (c1) {
    document.getElementById('cro-in-1')?.classList.add('connected');
    document.getElementById(`fg-out-${c1}`)?.classList.add('connected');
  }
  if (c2) {
    document.getElementById('cro-in-2')?.classList.add('connected');
    document.getElementById(`fg-out-${c2}`)?.classList.add('connected');
  }

  // Draw wire paths
  const svgRect = svg.getBoundingClientRect();
  if (svgRect.width === 0) return;

  function drawWire(fgBtnId, croBtnId, color) {
    const fg = document.getElementById(fgBtnId);
    const cro = document.getElementById(croBtnId);
    if (!fg || !cro) return;
    const fgR = fg.getBoundingClientRect();
    const croR = cro.getBoundingClientRect();

    // Convert to SVG coords
    const x1 = fgR.right - svgRect.left;
    const y1 = fgR.top + fgR.height / 2 - svgRect.top;
    const x2 = croR.left - svgRect.left;
    const y2 = croR.top + croR.height / 2 - svgRect.top;
    const cx = (x1 + x2) / 2;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`);
    path.setAttribute('class', 'wire-line');
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.style.filter = `drop-shadow(0 0 4px ${color})`;
    svg.appendChild(path);
  }

  if (c1) drawWire(`fg-out-${c1}`, 'cro-in-1', '#06b6d4');
  if (c2) drawWire(`fg-out-${c2}`, 'cro-in-2', '#F59E0B');

  const numConns = (c1 ? 1 : 0) + (c2 ? 1 : 0);
  document.getElementById('wireStatusLabel').textContent =
    numConns === 0 ? 'No connections' :
    numConns === 1 ? '1 channel connected' : '2 channels connected';
}

function getFgParams(fgCh) {
  if (fgCh === 1) {
    return {
      waveType: W.ch1Wave,
      freq: parseFloat(document.getElementById('w1-freq').value),
      amp:  parseFloat(document.getElementById('w1-amp').value),
      off:  parseFloat(document.getElementById('w1-off').value),
      phase: parseFloat(document.getElementById('w1-phase').value),
    };
  } else {
    return {
      waveType: W.ch2Wave,
      freq: parseFloat(document.getElementById('w2-freq').value),
      amp:  parseFloat(document.getElementById('w2-amp').value),
      off:  parseFloat(document.getElementById('w2-off').value),
      phase: parseFloat(document.getElementById('w2-phase').value),
    };
  }
}

function updateWired() {
  // FG labels
  ['1','2'].forEach(n => {
    const freq = parseFloat(document.getElementById(`w${n}-freq`).value);
    const amp  = parseFloat(document.getElementById(`w${n}-amp`).value);
    const off  = parseFloat(document.getElementById(`w${n}-off`).value);
    const phase = parseFloat(document.getElementById(`w${n}-phase`).value);
    document.getElementById(`w${n}-lbl-freq`).textContent = fmtFreq(freq);
    document.getElementById(`w${n}-lbl-amp`).textContent  = amp.toFixed(1) + ' V';
    document.getElementById(`w${n}-lbl-off`).textContent  = off.toFixed(1) + ' V';
    document.getElementById(`w${n}-lbl-phase`).textContent = phase + '°';
  });

  const tdivIdx = parseInt(document.getElementById('w-sid-tdiv').value);
  const vdivIdx1 = parseInt(document.getElementById('w-sid-vdiv1').value);
  const vdivIdx2 = parseInt(document.getElementById('w-sid-vdiv2').value);
  const yPos1 = parseFloat(document.getElementById('w-sid-ypos1').value);
  const yPos2 = parseFloat(document.getElementById('w-sid-ypos2').value);
  const xPos  = parseFloat(document.getElementById('w-sid-xpos').value);

  const tdiv  = TIME_STEPS[Math.min(tdivIdx, TIME_STEPS.length - 1)];
  const vdiv1 = VOLT_STEPS[Math.min(vdivIdx1, VOLT_STEPS.length - 1)];
  const vdiv2 = VOLT_STEPS[Math.min(vdivIdx2, VOLT_STEPS.length - 1)];

  document.getElementById('w-lbl-tdiv').textContent  = fmtTime(tdiv);
  document.getElementById('w-lbl-vdiv1').textContent = fmtVStep(vdiv1);
  document.getElementById('w-lbl-vdiv2').textContent = fmtVStep(vdiv2);
  document.getElementById('w-lbl-ypos1').textContent = yPos1.toFixed(1);
  document.getElementById('w-lbl-ypos2').textContent = yPos2.toFixed(1);
  document.getElementById('w-lbl-xpos').textContent  = xPos.toFixed(1);

  document.getElementById('w-cro-ch1').textContent = 'CH1: ' + fmtVStep(vdiv1) + '/DIV';
  document.getElementById('w-cro-ch2').textContent = 'CH2: ' + fmtVStep(vdiv2) + '/DIV';
  document.getElementById('w-cro-time').textContent = 'TIME: ' + fmtTime(tdiv) + '/DIV';

  // Measurements
  const c1 = W.connections[1];
  const c2 = W.connections[2];
  if (c1) {
    const p = getFgParams(c1);
    document.getElementById('w-meas-f1').textContent = fmtFreq(p.freq);
    document.getElementById('w-meas-vpp1').textContent = (2 * p.amp).toFixed(3) + ' V';
  } else {
    document.getElementById('w-meas-f1').textContent = '—';
    document.getElementById('w-meas-vpp1').textContent = '—';
  }
  if (c2) {
    const p = getFgParams(c2);
    document.getElementById('w-meas-f2').textContent = fmtFreq(p.freq);
    document.getElementById('w-meas-vpp2').textContent = (2 * p.amp).toFixed(3) + ' V';
  } else {
    document.getElementById('w-meas-f2').textContent = '—';
    document.getElementById('w-meas-vpp2').textContent = '—';
  }
}

// ── Wired Mode draw loop ──────────────────────────────────────
function drawWired() {
  if (!wCanvas || !wCtx) return;
  const W_px = wCanvas.width;
  const H_px = wCanvas.height;
  const numTdivs = 10, numVdivs = 8;

  const tdivIdx  = parseInt(document.getElementById('w-sid-tdiv').value);
  const vdivIdx1 = parseInt(document.getElementById('w-sid-vdiv1').value);
  const vdivIdx2 = parseInt(document.getElementById('w-sid-vdiv2').value);
  const yPos1    = parseFloat(document.getElementById('w-sid-ypos1').value);
  const yPos2    = parseFloat(document.getElementById('w-sid-ypos2').value);
  const xPos     = parseFloat(document.getElementById('w-sid-xpos').value);
  const ch1En    = document.getElementById('w-ch1-en')?.checked ?? true;
  const ch2En    = document.getElementById('w-ch2-en')?.checked ?? true;
  const addMode  = document.getElementById('w-ch-add')?.checked ?? false;

  const tdiv  = TIME_STEPS[Math.min(tdivIdx, TIME_STEPS.length - 1)];
  const vdiv1 = VOLT_STEPS[Math.min(vdivIdx1, VOLT_STEPS.length - 1)];
  const vdiv2 = VOLT_STEPS[Math.min(vdivIdx2, VOLT_STEPS.length - 1)];

  wCtx.clearRect(0, 0, W_px, H_px);
  drawGrid(wCtx, W_px, H_px, numTdivs, numVdivs);

  const c1 = W.connections[1];
  const c2 = W.connections[2];

  if (addMode && c1 && c2) {
    // ADD mode: sum both channels and draw in green
    const p1 = getFgParams(c1);
    const p2 = getFgParams(c2);
    const totalTime = numTdivs * tdiv;
    const midY = H_px / 2;
    const pixPerVolt = (H_px / numVdivs) / vdiv1;
    const xShift = xPos * (W_px / numTdivs);
    wCtx.beginPath();
    wCtx.strokeStyle = '#10B981';
    wCtx.lineWidth = 2;
    wCtx.shadowBlur = 8;
    wCtx.shadowColor = '#10B981';
    for (let px = 0; px <= W_px; px++) {
      const t = (px - xShift) / (W_px / totalTime);
      const v1 = sampleWave(p1.waveType, p1.freq, p1.amp, p1.off, p1.phase, t, 'dc');
      const v2 = sampleWave(p2.waveType, p2.freq, p2.amp, p2.off, p2.phase, t, 'dc');
      const v = v1 + v2;
      const py = midY - ((v + yPos1 * vdiv1) * pixPerVolt);
      if (px === 0) wCtx.moveTo(px, py); else wCtx.lineTo(px, py);
    }
    wCtx.stroke();
    wCtx.shadowBlur = 0;
  } else {
    if (c1 && ch1En) {
      const p = getFgParams(c1);
      drawTrace(wCtx, W_px, H_px, tdiv, vdiv1, numTdivs, numVdivs,
        p.waveType, p.freq, p.amp, p.off, p.phase, 'dc', yPos1, xPos, '#06b6d4', false);
    }
    if (c2 && ch2En) {
      const p = getFgParams(c2);
      drawTrace(wCtx, W_px, H_px, tdiv, vdiv2, numTdivs, numVdivs,
        p.waveType, p.freq, p.amp, p.off, p.phase, 'dc', yPos2, xPos, '#F59E0B', false);
    }
    if (!c1 && !c2) {
      // Draw "no signal" text
      wCtx.fillStyle = 'rgba(16,185,129,0.3)';
      wCtx.font = 'bold 14px "JetBrains Mono", monospace';
      wCtx.textAlign = 'center';
      wCtx.fillText('NO SIGNAL — Connect FG outputs to CRO inputs', W_px / 2, H_px / 2);
    }
  }

  requestAnimationFrame(drawWired);
}

// ══════════════════════════════════════════════════════════════
//  MODE SWITCHING
// ══════════════════════════════════════════════════════════════
let currentMode = 'simple';

function setMode(mode) {
  currentMode = mode;
  document.getElementById('modeSimple').style.display = mode === 'simple' ? '' : 'none';
  document.getElementById('modeWired').style.display  = mode === 'wired'  ? '' : 'none';
  document.getElementById('modeBtnSimple').classList.toggle('active', mode === 'simple');
  document.getElementById('modeBtnWired').classList.toggle('active', mode === 'wired');

  if (mode === 'wired') {
    // Force redraw wires after layout settles
    setTimeout(() => {
      resizeCanvas(wCanvas);
      updateConnectionVisuals();
    }, 100);
  }
}

// ══════════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Init both modes
  initSimple();
  initWired();

  // Initial slider track fill
  updateSimple();
  updateWired();

  // Sync styled slider tracks (blue fill for all sliders)
  document.querySelectorAll('input[type=range]').forEach(inp => {
    inp.addEventListener('input', function () {
      const min = parseFloat(this.min || 0);
      const max = parseFloat(this.max || 100);
      const pct = ((parseFloat(this.value) - min) / (max - min)) * 100;
      this.style.background = `linear-gradient(to right, #1A56DB ${pct}%, rgba(0,0,0,0.12) ${pct}%)`;
    });
    // Initial state
    const min = parseFloat(inp.min || 0);
    const max = parseFloat(inp.max || 100);
    const pct = ((parseFloat(inp.value) - min) / (max - min)) * 100;
    inp.style.background = `linear-gradient(to right, #1A56DB ${pct}%, rgba(0,0,0,0.12) ${pct}%)`;
  });
});

// Handle window resize for wiring mode
window.addEventListener('resize', () => {
  if (currentMode === 'wired') {
    setTimeout(() => updateConnectionVisuals(), 150);
  }
});