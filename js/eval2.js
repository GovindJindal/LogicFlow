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
    {q: 'What is the primary function of a bridge rectifier circuit?', opts: ['Convert DC to AC', 'Amplify the input signal', 'Convert AC to DC', 'Regulate voltage'], a: 2},
    {q: 'In a positive edge-triggered D Flip-Flop, what happens to the output Q on the active clock edge?', opts: ['It toggles its previous state', 'It takes the value of the D input', 'It resets to 0', 'It sets to 1'], a: 1},
    {q: 'A BCD to 7-segment decoder typically has how many binary input lines?', opts: ['2', '4', '7', '8'], a: 1},
    {q: 'What input condition results in an invalid or unpredictable state in a basic SR latch?', opts: ['S=0, R=0', 'S=1, R=0', 'S=0, R=1', 'S=1, R=1'], a: 3},
    {q: 'What is the typical ripple frequency of a full-wave rectifier given a 50Hz AC input?', opts: ['25 Hz', '50 Hz', '100 Hz', '200 Hz'], a: 2}
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