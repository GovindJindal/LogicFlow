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

  // ── Decoder Logic ──────────────────────────────────────────
  // Bits: [A(LSB), B, C, D(MSB)]
  const swState = [0, 0, 0, 0]; 
  const swIds = ['A', 'B', 'C', 'D'];

  // Segments: a, b, c, d, e, f, g  (1 = ON, 0 = OFF)
  const hexMap = [
    [1,1,1,1,1,1,0], // 0
    [0,1,1,0,0,0,0], // 1
    [1,1,0,1,1,0,1], // 2
    [1,1,1,1,0,0,1], // 3
    [0,1,1,0,0,1,1], // 4
    [1,0,1,1,0,1,1], // 5
    [1,0,1,1,1,1,1], // 6
    [1,1,1,0,0,0,0], // 7
    [1,1,1,1,1,1,1], // 8
    [1,1,1,1,0,1,1], // 9
    // Following 7447 standard for states > 9 (pseudo-hex)
    [0,0,0,1,1,0,1], // 10 (c)
    [0,0,1,1,0,0,1], // 11 (u)
    [0,1,0,0,0,1,1], // 12
    [1,0,0,1,0,1,1], // 13
    [0,0,0,1,1,1,1], // 14
    [0,0,0,0,0,0,0]  // 15 (blank)
  ];

  function toggle(idx) {
    swState[idx] = 1 - swState[idx];
    updateUI();
  }

  function updateUI() {
    // Switches
    for(let i=0; i<4; i++) {
        const sw = document.getElementById(`sw-${swIds[i]}`);
        if(swState[i]) sw.classList.add('on'); else sw.classList.remove('on');
    }

    // Number
    const dec = (swState[3]<<3) | (swState[2]<<2) | (swState[1]<<1) | swState[0];
    document.getElementById('decVal').textContent = dec > 9 ? 'Error' : dec;
    if(dec > 9) document.getElementById('decVal').style.color = '#ef4444'; 
    else document.getElementById('decVal').style.color = '';
    
    document.getElementById('binVal').textContent = `${swState[3]}${swState[2]}${swState[1]}${swState[0]}₂`;

    // 7-Seg
    const segs = hexMap[dec];
    const segIds = ['a','b','c','d','e','f','g'];
    for(let i=0; i<7; i++) {
        const el = document.getElementById(`seg-${segIds[i]}`);
        if(segs[i]) el.classList.add('on'); else el.classList.remove('on');
    }

    // Truth Table
    renderTable(dec);
  }

  function renderTable(activeDec) {
    const tbody = document.querySelector('#truthTable tbody');
    tbody.innerHTML = '';
    for(let i=0; i<16; i++) {
        const D = (i>>3)&1, C = (i>>2)&1, B = (i>>1)&1, A = i&1;
        const s = hexMap[i];
        
        let char = i.toString();
        if(i > 9) char = '-';

        const tr = document.createElement('tr');
        if(i === activeDec) tr.className = 'active';
        
        tr.innerHTML = `
            <td>${D}</td><td>${C}</td><td>${B}</td><td style="border-right:1px solid rgba(0,0,0,.1)">${A}</td>
            <td>${s[0]}</td><td>${s[1]}</td><td>${s[2]}</td><td>${s[3]}</td><td>${s[4]}</td><td>${s[5]}</td><td>${s[6]}</td>
            <td style="font-weight:bold">${char}</td>
        `;
        tbody.appendChild(tr);
    }
  }

  updateUI();