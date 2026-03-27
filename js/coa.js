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

// ── Data ──────────────────────────────────────────────────────
const STAGES = ['Fetch','Decode','Execute','WriteBack'];
const STAGE_META = {
  Fetch:     { color:'#1A56DB', desc:'PC → MAR → MDR → IR. The Program Counter sends the next instruction address to memory. The instruction word is fetched into the Instruction Register.', regs:['pc','mar','mdr','ir'] },
  Decode:    { color:'#7C3AED', desc:'The Control Unit decodes the opcode in IR. It identifies the operation type, extracts the operand address, and routes control signals to the correct units.', regs:['ir','mar'] },
  Execute:   { color:'#10B981', desc:'The ALU performs the operation. For arithmetic instructions, the Accumulator is updated. This is where the Half Adder logic you built lives.', regs:['acc','mdr'] },
  WriteBack: { color:'#F59E0B', desc:'The result is written to the destination register or memory. The Program Counter is incremented to point to the next instruction.', regs:['pc','acc'] },
};
const PROGRAM = [
  { mnemonic:'LOAD',  operand:'0x10', desc:'Load value from address 0x10 into Accumulator' },
  { mnemonic:'ADD',   operand:'0x11', desc:'Add value at address 0x11 to Accumulator' },
  { mnemonic:'STORE', operand:'0x20', desc:'Store Accumulator into memory address 0x20' },
  { mnemonic:'JUMP',  operand:'0x00', desc:'Jump to 0x00 if Zero flag is set' },
  { mnemonic:'HALT',  operand:null,   desc:'Stop execution' },
];
const REG_META = {
  pc:{ abbr:'PC', full:'Program Counter', color:'#1A56DB' },
  ir:{ abbr:'IR', full:'Instruction Register', color:'#7C3AED' },
  mar:{ abbr:'MAR', full:'Memory Address Register', color:'#06b6d4' },
  mdr:{ abbr:'MDR', full:'Memory Data Register', color:'#10B981' },
  acc:{ abbr:'ACC', full:'Accumulator', color:'#F59E0B' },
};
const FLAGS = ['ZERO','CARRY','OVER','SIGN'];

// ── State ────────────────────────────────────────────────────
let state = { stage:0, instr:0, done:false, regs:{pc:0,ir:0,mar:0,mdr:0,acc:0}, flags:{ZERO:false,CARRY:false,OVER:false,SIGN:false}, prevRegs:{pc:0,ir:0,mar:0,mdr:0,acc:0} };
let playing = false, timer = null;

function toHex(n){ return '0x'+n.toString(16).toUpperCase().padStart(2,'0'); }
function toBin(n){ return (n>>>0).toString(2).padStart(8,'0'); }

// ── Render ───────────────────────────────────────────────────
function render() {
  const s = state;
  const sm = STAGE_META[STAGES[s.stage]];
  const instr = PROGRAM[Math.min(s.instr, PROGRAM.length-1)];

  // Banner
  document.getElementById('instrNum').textContent = `Instruction ${Math.min(s.instr+1,PROGRAM.length)} / ${PROGRAM.length}`;
  document.getElementById('instrText').textContent = instr.mnemonic + (instr.operand?' '+instr.operand:'');
  document.getElementById('instrDesc').textContent = instr.desc;
  const banner = document.getElementById('instrBanner');
  const stageName = document.getElementById('stageName');
  if (s.done) {
    banner.style.borderColor='rgba(16,185,129,.4)'; banner.style.background='rgba(16,185,129,.05)';
    document.getElementById('instrText').textContent='✓ Program Complete — all 5 instructions executed';
    document.getElementById('instrText').style.color='#059669';
    document.getElementById('instrDesc').textContent='';
    stageName.textContent='DONE'; stageName.style.color='#059669';
  } else {
    banner.style.borderColor=sm.color+'50'; banner.style.background=sm.color+'0a';
    document.getElementById('instrText').style.color='var(--text)';
    stageName.textContent=STAGES[s.stage].toUpperCase(); stageName.style.color=sm.color;
  }

  // Stages
  const row = document.getElementById('stagesRow');
  row.innerHTML = STAGES.map((st,i) => {
    const m = STAGE_META[st];
    const isActive = !s.done && i===s.stage;
    const isDone   = s.done || i<s.stage;
    return `<div class="stage-box ${isActive?'active':''} ${isDone?'done':''}"
      style="border-color:${isActive?m.color+'70':isDone?m.color+'40':'var(--border)'}; background:${isActive?m.color+'0a':isDone?m.color+'05':'var(--surface)'}">
      <div class="stage-num" style="background:${isActive?m.color:isDone?m.color+'30':'rgba(0,0,0,0.08)'}; color:${isActive?'#fff':isDone?m.color:'#64748b'}">
        ${isDone&&!isActive?'✓':i+1}</div>
      <div class="stage-name" style="color:${isActive?m.color:isDone?m.color+'99':'#64748B'}">${st.toUpperCase()}</div>
      <div class="stage-desc" style="color:${isActive?'var(--text)':'var(--muted)'}">${m.desc.split('.')[0]}.</div>
    </div>`;
  }).join('');

  // Detail
  document.getElementById('stageLabel').textContent = s.done ? 'Execution Complete' : STAGES[s.stage]+' Stage';
  document.getElementById('detailText').textContent = s.done
    ? 'All 5 instructions completed the full Fetch → Decode → Execute → WriteBack cycle in 20 clock cycles.'
    : sm.desc;

  // Registers
  const activeRegs = s.done ? [] : sm.regs;
  document.getElementById('regBank').innerHTML = Object.keys(s.regs).map(k=>{
    const m = REG_META[k];
    const val = s.regs[k];
    const prev = s.prevRegs[k];
    const changed = val!==prev;
    const isActive = activeRegs.includes(k);
    const bin = toBin(val);
    return `<div class="reg-row ${isActive?'active':''}">
      <span class="reg-abbr" style="color:${isActive?m.color:'var(--muted)'}">${m.abbr}</span>
      <span class="reg-hex" style="color:${isActive?m.color:'var(--text)'}">${toHex(val)}</span>
      <div class="reg-bits">${bin.split('').map(b=>`<div class="bit ${b==='1'?'hi':'lo'}">${b}</div>`).join('')}</div>
      ${changed?`<span class="updated-tag">updated</span>`:''}
    </div>`;
  }).join('');

  // Flags
  document.getElementById('flagsRow').innerHTML = `<div style="font-family:var(--font-mono);font-size:.65rem;font-weight:700;color:var(--muted);width:100%;margin-bottom:.3rem">FLAG REGISTER</div>`
    +FLAGS.map(f=>`<span class="flag-badge ${s.flags[f]?'active':'inactive'}">${f.slice(0,2)}</span>`).join('');

  // Program
  document.getElementById('progList').innerHTML = PROGRAM.map((p,i)=>{
    const isActive = !s.done && i===s.instr;
    const isDone   = s.done || i<s.instr;
    return `<div class="prog-row ${isActive?'active-prog':''} ${isDone?'done-prog':''}">
      <span class="prog-addr">${toHex(i)}</span>
      <span class="prog-mnem" style="color:${isActive?'var(--blue)':isDone?'#059669':'var(--muted)'}">${p.mnemonic}</span>
      <span class="prog-oper" style="color:${isActive?'var(--amber)':isDone?'#059669':'var(--muted)'}">${p.operand||''}</span>
      ${isDone&&!isActive?'<span class="prog-check">✓</span>':''}
      ${isActive?'<span style="margin-left:auto;color:var(--blue);animation:blink 1s infinite">●</span>':''}
    </div>`;
  }).join('');

  // Next button
  const nb = document.getElementById('nextBtn');
  if (s.done) { nb.textContent='Program Complete'; nb.style.opacity='.4'; nb.style.cursor='not-allowed'; }
  else { nb.style.opacity='1'; nb.style.cursor='pointer'; nb.textContent=`Next Stage ›`; }

  // Bridge feature — show on Execute
  document.getElementById('bridgePanel').style.display = (STAGES[s.stage]==='Execute'||s.done) ? 'block' : 'none';

  // Style blink
  if (!document.getElementById('blinkStyle')) {
    const st = document.createElement('style');
    st.id='blinkStyle'; st.textContent='@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}';
    document.head.appendChild(st);
  }
}

// ── Logic ────────────────────────────────────────────────────
function nextStage() {
  const s = state;
  if (s.done) return;
  const prev = {...s.regs};
  const stName = STAGES[s.stage];

  if (stName==='Fetch')     { s.regs.ir=(s.instr*17+42)%256; s.regs.mar=s.instr*4; s.regs.mdr=(s.instr*13+8)%256; }
  if (stName==='Decode')    { s.regs.mar=(s.instr*8)%256; }
  if (stName==='Execute')   { s.regs.acc=(s.regs.acc+s.instr*7+3)%256; s.flags.ZERO=s.regs.acc===0; }
  if (stName==='WriteBack') { const ni=s.stage===3?s.instr+1:s.instr; s.regs.pc=ni; }

  s.prevRegs = prev;
  const nextStageIdx = (s.stage+1)%4;
  if (s.stage===3) {
    s.instr++;
    if (s.instr>=PROGRAM.length) { s.done=true; s.stage=0; render(); return; }
  }
  s.stage = nextStageIdx;
  render();
}

function resetPipeline() {
  clearInterval(timer); playing=false;
  document.getElementById('playBtn').textContent='▶ Auto-play';
  document.getElementById('playBtn').style.color='var(--blue)';
  state={stage:0,instr:0,done:false,regs:{pc:0,ir:0,mar:0,mdr:0,acc:0},flags:{ZERO:false,CARRY:false,OVER:false,SIGN:false},prevRegs:{pc:0,ir:0,mar:0,mdr:0,acc:0}};
  render();
}

function togglePlay() {
  if (state.done) return;
  playing=!playing;
  const btn=document.getElementById('playBtn');
  if (playing) {
    btn.textContent='⏸ Pause'; btn.style.color='#d97706';
    timer=setInterval(()=>{ if(state.done){clearInterval(timer);playing=false;btn.textContent='▶ Auto-play';btn.style.color='var(--blue)';}else nextStage(); },1200);
  } else {
    clearInterval(timer); btn.textContent='▶ Auto-play'; btn.style.color='var(--blue)';
  }
}

render();