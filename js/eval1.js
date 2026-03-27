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
        { xf: .15, yf: .15, rf: .45, color: [244, 63, 94], speed: 0.00018, phase: 0 },
        { xf: .78, yf: .10, rf: .40, color: [90, 140, 255], speed: 0.00013, phase: 1.2 },
        { xf: .50, yf: .55, rf: .38, color: [160, 80, 240], speed: 0.00021, phase: 2.4 },
        { xf: .08, yf: .68, rf: .33, color: [244, 158, 11], speed: 0.00016, phase: 0.7 }
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
          g.addColorStop(0, `rgba(${R},${G},${B},0.4)`);
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

  // ── Quiz Logic ──────────────────────────────────────────
  const db = [
    {q: 'To measure the voltage drop across a resistor, how should a multimeter be connected?', opts: ['In series with the resistor', 'In parallel with the resistor', 'In series with the power supply', 'Without power in the circuit'], a: 1},
    {q: 'On a Cathode Ray Oscilloscope (CRO), adjusting the TIME / DIV knob changes what visual aspect of the displayed waveform?', opts: ['The vertical height (Amplitude)', 'The DC offset', 'The horizontal width (Time Period)', 'The waveform shape (Sine to Square)'], a: 2},
    {q: 'What is the typical forward voltage drop of a standard silicon PN junction diode?', opts: ['0.3 Volts', '0.7 Volts', '1.2 Volts', '5.1 Volts'], a: 1},
    {q: 'A Zener diode acts as a voltage regulator when operated in which condition?', opts: ['Forward bias region', 'Reverse breakdown region', 'Zero bias', 'Cut-off region'], a: 1},
    {q: 'Which component stores energy in the form of an electric field?', opts: ['Resistor', 'Inductor', 'Diode', 'Capacitor'], a: 3}
  ];

  let curr = 0;
  let score = 0;
  let answered = false;

  const qView = document.getElementById('qView');
  const sView = document.getElementById('sView');
  const qNum = document.getElementById('qNum');
  const pFill = document.getElementById('pFill');
  const qText = document.getElementById('qText');
  const optGrid = document.getElementById('optGrid');

  function renderQ() {
    answered = false;
    const q = db[curr];
    qNum.textContent = `Question ${curr + 1} of ${db.length}`;
    pFill.style.width = `${(curr / db.length) * 100}%`;
    qText.textContent = q.q;
    
    const letters = ['A', 'B', 'C', 'D'];
    optGrid.innerHTML = q.opts.map((opt, i) => `
      <div class="opt-btn" onclick="selectOpt(${i})" id="opt-${i}">
        <div class="opt-idx">${letters[i]}</div>
        <div>${opt}</div>
      </div>
    `).join('');
  }

  function selectOpt(idx) {
    if(answered) return;
    answered = true;
    
    const q = db[curr];
    const isCorrect = (idx === q.a);
    if(isCorrect) score++;

    // Style buttons
    for(let i=0; i<4; i++) {
        const btn = document.getElementById(`opt-${i}`);
        if(i === q.a) btn.classList.add('sel-correct');
        else if (i === idx && !isCorrect) btn.classList.add('sel-wrong');
        else btn.classList.add('disabled');
    }

    setTimeout(() => {
        curr++;
        if(curr < db.length) {
            renderQ();
        } else {
            showScore();
        }
    }, 1500);
  }

  function showScore() {
    qView.style.display = 'none';
    sView.style.display = 'block';
    pFill.style.width = '100%';
    
    document.getElementById('sVal').textContent = score;
    const pct = (score / db.length) * 100;
    
    setTimeout(() => {
        document.getElementById('sCirc').style.setProperty('--pct', `${pct}%`);
    }, 100);

    const t = document.getElementById('sTitle');
    if(score === 5) t.textContent = "Perfect Score! 🏆";
    else if(score >= 3) t.textContent = "Great Job! 🌟";
    else t.textContent = "Keep Studying! 📚";
  }

  // Init
  renderQ();