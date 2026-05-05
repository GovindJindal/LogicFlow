// ── Dropdown Logic ───────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
      const expBtn = document.getElementById('experimentDropdownBtn');
      const expDropdown = document.getElementById('experimentDropdown');

      if (expBtn && expDropdown) {
        expBtn.addEventListener('click', (e) => {
          e.preventDefault();
          expDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
          if (!e.target.closest('.dropdown')) {
            expDropdown.classList.remove('show');
          }
        });
      }
    });

    // ── Animated blob background (Codex-style) ───────────────────────────────────
    (function() {
      const canvas = document.getElementById('bgCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let W, H;
      const blobs = [
        { xf:.15, yf:.15, rf:.45, color:[120,100,255], speed:0.00018, phase:0    },
        { xf:.78, yf:.10, rf:.40, color:[90,140,255],  speed:0.00013, phase:1.2  },
        { xf:.50, yf:.55, rf:.38, color:[160,80,240],  speed:0.00021, phase:2.4  },
        { xf:.08, yf:.68, rf:.33, color:[200,160,255], speed:0.00016, phase:0.7  },
        { xf:.88, yf:.72, rf:.32, color:[100,120,255], speed:0.00019, phase:3.1  },
        { xf:.42, yf:.85, rf:.28, color:[130,90,255],  speed:0.00014, phase:4.5  },
      ];
      function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
      }
      function draw(ts) {
        ctx.clearRect(0,0,W,H);
        ctx.fillStyle='#eceeff'; ctx.fillRect(0,0,W,H);
        for(const b of blobs){
          const angle=ts*b.speed+b.phase;
          const cx=(b.xf+Math.sin(angle*1.3)*0.12)*W;
          const cy=(b.yf+Math.cos(angle*0.9)*0.10)*H;
          const r=b.rf*Math.min(W,H)*(0.9+0.1*Math.sin(angle*2.1));
          const [R,G,B]=b.color;
          const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
          g.addColorStop(0,  `rgba(${R},${G},${B},0.58)`);
          g.addColorStop(0.5,`rgba(${R},${G},${B},0.20)`);
          g.addColorStop(1,  `rgba(${R},${G},${B},0)`);
          ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
          ctx.fillStyle=g; ctx.fill();
        }
        // subtle white vignette at edges
        const vx=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*0.3,W/2,H/2,Math.min(W,H)*0.9);
        vx.addColorStop(0,'rgba(255,255,255,0)');
        vx.addColorStop(1,'rgba(255,255,255,0.30)');
        ctx.fillStyle=vx; ctx.fillRect(0,0,W,H);
        requestAnimationFrame(draw);
      }
      resize();
      window.addEventListener('resize',resize);
      requestAnimationFrame(draw);
    })();
    // ─────────────────────────────────────────────────────────────────────────────


    const apps = [
      // Palette: Cherry Blossom #edafb8, Powder Petal #f7e1d7, Dust Grey #dedbd2, Ash Grey #b0c4b1, Iron Grey #4a5759
      // Distributed spatially — no two adjacent icons share a color, dark anchors spread evenly
      { label: 'CRE\nME', bg: '#b0c4b1', textColor: '#4a5759', size: 80, x: 16, y: 24, r: '22%' },
      { label: 'DB', bg: '#edafb8', textColor: '#4a5759', size: 72, x: 34, y: 30, r: '22.37%' },
      { label: 'GPT', bg: '#f7e1d7', textColor: '#4a5759', size: 68, x: 57, y: 22, r: '22.37%' },
      { label: '●●●', bg: '#dedbd2', textColor: '#4a5759', size: 74, x: 65, y: 37, r: '22.37%' },
      { label: 'MC', bg: '#f7e1d7', textColor: '#4a5759', size: 76, x: 22, y: 52, r: '22.37%' },
      { label: 'AIR', bg: '#edafb8', textColor: '#4a5759', size: 78, x: 74, y: 54, r: '22.37%' },
      { label: 'P', bg: '#dedbd2', textColor: '#4a5759', size: 72, x: 5, y: 66, r: '22.37%' },
      { label: '▶️', bg: '#f7e1d7', textColor: '#4a5759', size: 78, x: 93, y: 66, r: '18%' },
      { label: 'TW', bg: '#edafb8', textColor: '#4a5759', size: 68, x: 27, y: 80, r: '22.37%' },
      { label: '47', bg: '#dedbd2', textColor: '#4a5759', size: 70, x: 50, y: 82, r: '22.37%' },
      { label: 'NIKE', bg: '#b0c4b1', textColor: '#4a5759', size: 64, x: 73, y: 83, r: '12px', border: true },

      // Transistor Icon
      { label: '◆', bg: '#4a5759', textColor: '#f7e1d7', size: 64, x: 88, y: 27, r: '22.37%' },

      { label: 'SL', bg: '#b0c4b1', textColor: '#4a5759', size: 66, x: 82, y: 43, r: '22.37%' },
      { label: 'YT', bg: '#4a5759', textColor: '#f7e1d7', size: 70, x: 10, y: 40, r: '22.37%' },

      // Adjusted positions to fix overlaps
      { label: 'SP', bg: '#b0c4b1', textColor: '#4a5759', size: 62, x: 38, y: 75, r: '22.37%' },
      { label: 'NOT', bg: '#4a5759', textColor: '#f7e1d7', size: 58, x: 48, y: 18, r: '14px', border: true },

      { label: 'FB', bg: '#4a5759', textColor: '#f7e1d7', size: 68, x: 60, y: 70, r: '22.37%' },
      { label: 'IG', bg: '#dedbd2', textColor: '#4a5759', size: 66, x: 38, y: 14, r: '22.37%' },
      { label: 'FIG', bg: '#edafb8', textColor: '#4a5759', size: 60, x: 78, y: 15, r: '22.37%' },
    ];

    const electronicIcons = {
      // --- MAPPED GATES ---
      'IG': `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M 16 12 L 32 12 C 44 12 52 20 52 32 C 52 44 44 52 32 52 L 16 52 Z"/><line x1="4" y1="22" x2="16" y2="22"/><line x1="4" y1="42" x2="16" y2="42"/><line x1="52" y1="32" x2="60" y2="32"/></svg>`,
      'YT': `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M 12 12 C 24 12 40 16 52 32 C 40 48 24 52 12 52 C 20 40 20 24 12 12 Z"/><line x1="4" y1="22" x2="14" y2="22"/><line x1="4" y1="42" x2="14" y2="42"/><line x1="52" y1="32" x2="60" y2="32"/></svg>`,
      'DB': `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"><path d="M 20 16 L 44 32 L 20 48 Z"/><circle cx="48" cy="32" r="4"/><line x1="4" y1="32" x2="20" y2="32"/><line x1="52" y1="32" x2="60" y2="32"/></svg>`,
      'FB': `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M 16 12 C 28 12 44 16 56 32 C 44 48 28 52 16 52 C 24 40 24 24 16 12 Z"/><path d="M 8 12 C 16 24 16 40 8 52"/><line x1="0" y1="22" x2="10" y2="22"/><line x1="0" y1="42" x2="10" y2="42"/><line x1="56" y1="32" x2="64" y2="32"/></svg>`,
      'FIG': `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M 12 12 C 24 12 40 16 48 32 C 40 48 24 52 12 52 C 20 40 20 24 12 12 Z"/><circle cx="52" cy="32" r="4"/><line x1="4" y1="22" x2="14" y2="22"/><line x1="4" y1="42" x2="14" y2="42"/><line x1="56" y1="32" x2="64" y2="32"/></svg>`,
      'CRE\nME': `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M 16 12 C 28 12 40 16 48 32 C 40 48 28 52 16 52 C 24 40 24 24 16 12 Z"/><path d="M 8 12 C 16 24 16 40 8 52"/><circle cx="52" cy="32" r="4"/><line x1="0" y1="22" x2="10" y2="22"/><line x1="0" y1="42" x2="10" y2="42"/><line x1="56" y1="32" x2="64" y2="32"/></svg>`,
      'SP': `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4"><circle cx="32" cy="32" r="16"/><line x1="20" y1="20" x2="44" y2="44"/><line x1="44" y1="20" x2="20" y2="44"/><line x1="32" y1="48" x2="32" y2="60"/></svg>`,
      '47': `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M 12 12 L 28 12 C 40 12 48 20 48 32 C 48 44 40 52 28 52 L 12 52 Z"/><circle cx="52" cy="32" r="4"/><line x1="0" y1="22" x2="12" y2="22"/><line x1="0" y1="42" x2="12" y2="42"/><line x1="56" y1="32" x2="64" y2="32"/></svg>`,
      // --- REMAINING COMPONENTS ---
      'GPT': `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4"><line x1="4" y1="32" x2="16" y2="32"/><path d="M 16 32 C 16 16 24 16 24 32 C 24 16 32 16 32 32 C 32 16 40 16 40 32 C 40 16 48 16 48 32"/><line x1="48" y1="32" x2="60" y2="32"/></svg>`,
      '●●●': `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4"><line x1="10" y1="32" x2="28" y2="32"/><line x1="28" y1="16" x2="28" y2="48"/><line x1="36" y1="16" x2="36" y2="48"/><line x1="36" y1="32" x2="54" y2="32"/></svg>`,
      'MC': `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"><line x1="4" y1="32" x2="14" y2="32"/><polyline points="14,32 18,20 26,44 34,20 42,44 46,32"/><line x1="46" y1="32" x2="60" y2="32"/></svg>`,
      'AIR': `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4"><polygon points="20,16 44,32 20,48" stroke-linejoin="round"/><line x1="44" y1="16" x2="44" y2="48"/><line x1="8" y1="32" x2="20" y2="32"/><line x1="44" y1="32" x2="56" y2="32"/></svg>`,
      'P': `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4"><line x1="28" y1="16" x2="28" y2="48"/><line x1="36" y1="24" x2="36" y2="40"/><line x1="12" y1="32" x2="28" y2="32"/><line x1="36" y1="32" x2="52" y2="32"/></svg>`,
      '▶️': `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4"><line x1="32" y1="16" x2="32" y2="36"/><line x1="16" y1="36" x2="48" y2="36"/><line x1="24" y1="44" x2="40" y2="44"/><line x1="30" y1="52" x2="34" y2="52"/></svg>`,
      'TW': `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4"><line x1="8" y1="32" x2="20" y2="32"/><circle cx="22" cy="32" r="2"/><line x1="24" y1="30" x2="40" y2="20"/><circle cx="42" cy="32" r="2"/><line x1="44" y1="32" x2="56" y2="32"/></svg>`,
      'NIKE': `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"><polygon points="20,16 52,32 20,48" /><line x1="4" y1="24" x2="20" y2="24"/><line x1="4" y1="40" x2="20" y2="40"/><line x1="52" y1="32" x2="60" y2="32"/></svg>`,

      // Refined Transistor Symbol 
      '◆': `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="32" cy="32" r="24"/>
          <line x1="24" y1="20" x2="24" y2="44"/>
          <line x1="8" y1="32" x2="24" y2="32"/>
          <line x1="24" y1="26" x2="42" y2="14"/>
          <line x1="24" y1="38" x2="42" y2="50"/>
          <polygon points="44,52 32,48 40,38" fill="currentColor" stroke="none"/>
        </svg>`,

      'SL': `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"><line x1="32" y1="24" x2="32" y2="56"/><polygon points="32,24 16,8 48,8"/><line x1="16" y1="8" x2="48" y2="8"/></svg>`,
      'NOT': `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4"><rect x="20" y="16" width="24" height="32" rx="2"/><line x1="12" y1="22" x2="20" y2="22"/><line x1="12" y1="32" x2="20" y2="32"/><line x1="12" y1="42" x2="20" y2="42"/><line x1="44" y1="22" x2="52" y2="22"/><line x1="44" y1="32" x2="52" y2="32"/><line x1="44" y1="42" x2="52" y2="42"/></svg>`
    };

    const layer = document.getElementById('iconsLayer');

    apps.forEach((app, i) => {
      const el = document.createElement('div');
      el.className = 'app-icon';

      const s = app.size;
      el.style.width = s + 'px';
      el.style.height = s + 'px';
      el.style.left = `calc(${app.x}% - ${s / 2}px)`;
      el.style.top = `calc(${app.y}% - ${s / 2}px)`;

      // This now applies '22.37%' (rounded square) for the transistor, and defaults for others
      el.style.borderRadius = app.r || '22.37%';

      if (app.border) el.style.border = '1px solid rgba(0,0,0,0.1)';

      el.style.background = app.bg;

      // floating animation params (unique per icon)
      const seed = i * 137.508;
      const r = (min, max) => min + ((seed * (i + 1)) % (max - min));
      const dur = 6 + (i % 7) * 1.1;
      const del = (i * 0.35) % 3;

      el.style.setProperty('--duration', dur + 's');
      el.style.setProperty('--delay', del + 's');
      el.style.setProperty('--tx1', (r(-14, 14)).toFixed(1) + 'px');
      el.style.setProperty('--ty1', (r(-14, 14)).toFixed(1) + 'px');
      el.style.setProperty('--tx2', (r(-18, 18)).toFixed(1) + 'px');
      el.style.setProperty('--ty2', (r(-18, 18)).toFixed(1) + 'px');
      el.style.setProperty('--tx3', (r(-12, 12)).toFixed(1) + 'px');
      el.style.setProperty('--ty3', (r(-20, 20)).toFixed(1) + 'px');
      el.style.setProperty('--tx4', (r(-16, 16)).toFixed(1) + 'px');
      el.style.setProperty('--ty4', (r(-16, 16)).toFixed(1) + 'px');
      el.style.setProperty('--r1', (r(-4, 4)).toFixed(1) + 'deg');
      el.style.setProperty('--r2', (r(-6, 6)).toFixed(1) + 'deg');
      el.style.setProperty('--r3', (r(-3, 3)).toFixed(1) + 'deg');
      el.style.setProperty('--r4', (r(-5, 5)).toFixed(1) + 'deg');

      // Content
      const inner = document.createElement('div');
      inner.className = 'icon-inner';
      inner.style.color = app.textColor;
      inner.style.background = app.bg;
      inner.style.borderRadius = 'inherit';

      // Apply mapped electronic symbols if they exist, else default to label
      if (electronicIcons[app.label]) {
        inner.innerHTML = electronicIcons[app.label];
      } else {
        inner.textContent = app.label;
      }

      el.appendChild(inner);

      // Staggered fade-in
      el.style.opacity = '0';
      el.style.animation = `float ${dur}s ${del}s ease-in-out infinite alternate`;
      setTimeout(() => {
        el.style.transition = 'opacity 0.6s ease';
        el.style.opacity = '1';
      }, 100 + i * 80);

      layer.appendChild(el);
    });

    // ── Unified pointer: parallax icons + CSS glow + binary field (code-editor style) ──
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const pointer = {
      x: null,
      y: null,
      vx: 0,
      vy: 0,
      lastX: 0,
      lastY: 0,
      inWindow: true,
    };

    function onPointerMove(e) {
      pointer.inWindow = true;
      pointer.x = e.clientX;
      pointer.y = e.clientY;

      if (!pointer._initialized) {
        pointer._initialized = true;
        pointer.lastX = e.clientX;
        pointer.lastY = e.clientY;
      } else {
        pointer.vx = (e.clientX - pointer.lastX) * 0.45 + pointer.vx * 0.55;
        pointer.vy = (e.clientY - pointer.lastY) * 0.45 + pointer.vy * 0.55;
        pointer.lastX = e.clientX;
        pointer.lastY = e.clientY;
      }

      document.body.style.setProperty('--mouse-x', `${(e.clientX / window.innerWidth) * 100}%`);
      document.body.style.setProperty('--mouse-y', `${(e.clientY / window.innerHeight) * 100}%`);

      if (prefersReducedMotion) return;

      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      document.querySelectorAll('.app-icon').forEach((icon, i) => {
        const depth = 0.5 + (i % 5) * 0.2;
        icon.style.marginLeft = `${dx * depth * 8}px`;
        icon.style.marginTop = `${dy * depth * 8}px`;
      });
    }

    function onPointerLeave() {
      pointer.inWindow = false;
      pointer._initialized = false;
      pointer.x = null;
      pointer.y = null;
      pointer.vx = 0;
      pointer.vy = 0;
      pointer.lastX = 0;
      pointer.lastY = 0;
    }

    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('mouseleave', onPointerLeave);
    window.addEventListener('blur', onPointerLeave);

    // ── Binary field canvas (ChatGPT / code-editor inspired: muted slate grid + indigo spotlight) ──
    (function binaryField() {
      const canvas = document.getElementById('particleCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      const RADIUS = 280;
      const IDLE = { r: 15, g: 23, b: 42, a: 0.038 };
      const ACCENT = { r: 79, g: 70, b: 229 };

      function hashBit(gx, gy) {
        let h = (gx * 374761393 + gy * 668265263 + 981293) >>> 0;
        h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
        return (h & 1) ? '1' : '0';
      }

      function spacingFor(w, h) {
        const est = (w / 28) * (h / 28);
        if (est > 5200) return 34;
        if (est > 4000) return 30;
        return 26;
      }

      let particlesArray = [];
      let gridStep = 26;

      class Particle {
        constructor(x, y, step) {
          this.baseX = x;
          this.baseY = y;
          this.x = x;
          this.y = y;
          const gx = Math.round(x / step);
          const gy = Math.round(y / step);
          this.binary = hashBit(gx, gy);
          this.friction = 0.88;
          this.ease = 0.065;
          this.vx = 0;
          this.vy = 0;
          this.phase = ((gx * 17 + gy * 31) % 1000) * 0.01;
        }

        draw(spot, time) {
          const t = spot * spot;
          const fs = 10.5 + t * 5.5;
          const aIdle = IDLE.a * (0.85 + 0.15 * Math.sin(time + this.phase));
          const a = aIdle + t * 0.52;
          if (a < 0.012 && pointer.x === null) return;

          const r = Math.round(IDLE.r + (ACCENT.r - IDLE.r) * t);
          const g = Math.round(IDLE.g + (ACCENT.g - IDLE.g) * t);
          const b = Math.round(IDLE.b + (ACCENT.b - IDLE.b) * t);

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = `${fs}px "JetBrains Mono", ui-monospace, monospace`;

          if (t > 0.25) {
            ctx.shadowColor = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, ${0.22 * t})`;
            ctx.shadowBlur = 8 * t;
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(0.95, a)})`;
          ctx.fillText(this.binary, this.x, this.y);
          ctx.shadowBlur = 0;
        }

        update() {
          let spotlight = 0;

          if (pointer.x != null && pointer.y != null) {
            const dx = pointer.x - this.x;
            const dy = pointer.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 0.0001;

            if (distance < RADIUS) {
              const falloff = Math.pow(Math.max(0, 1 - distance / RADIUS), 1.75);
              spotlight = falloff;
              const force = falloff * falloff;
              const rdx = dx / distance;
              const rdy = dy / distance;
              this.vx -= rdx * force * 4.2;
              this.vy -= rdy * force * 4.2;
              this.vx += pointer.vx * 0.06 * falloff;
              this.vy += pointer.vy * 0.06 * falloff;
            }
          }

          this._spot = spotlight;

          this.vx += (this.baseX - this.x) * this.ease;
          this.vy += (this.baseY - this.y) * this.ease;
          this.vx *= this.friction;
          this.vy *= this.friction;
          this.x += this.vx;
          this.y += this.vy;
        }
      }

      function init() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvas.width = w;
        canvas.height = h;
        gridStep = spacingFor(w, h);
        particlesArray = [];
        for (let y = gridStep * 0.5; y < h; y += gridStep) {
          for (let x = gridStep * 0.5; x < w; x += gridStep) {
            particlesArray.push(new Particle(x, y, gridStep));
          }
        }
      }

      function drawStatic() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particlesArray.forEach((p) => {
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '11px "JetBrains Mono", ui-monospace, monospace';
          ctx.fillStyle = `rgba(${IDLE.r}, ${IDLE.g}, ${IDLE.b}, ${IDLE.a * 1.1})`;
          ctx.fillText(p.binary, p.baseX, p.baseY);
        });
      }

      function animate() {
        pointer.vx *= 0.94;
        pointer.vy *= 0.94;

        const time = performance.now() * 0.0004;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
          const p = particlesArray[i];
          p.update();
          p.draw(p._spot || 0, time);
        }
        requestAnimationFrame(animate);
      }

      let resizeT;
      window.addEventListener('resize', () => {
        clearTimeout(resizeT);
        resizeT = setTimeout(init, 120);
      });

      init();

      if (prefersReducedMotion) {
        drawStatic();
        return;
      }

      animate();
    })();

    // ── Landing: access dialog, dual navbar, scroll reveals — frontend only ──
    document.addEventListener('DOMContentLoaded', () => {
      const SESSION_KEY = 'logicflow_session';
      const dialog = document.getElementById('accessDialog');
      const closeBtn = document.getElementById('accessDialogClose');
      const steps = {
        pick: document.getElementById('accessStepPick'),
        student: document.getElementById('accessStepStudent'),
        faculty: document.getElementById('accessStepFaculty'),
        guest: document.getElementById('accessStepGuest'),
      };

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function applyNavMode() {
        const role = sessionStorage.getItem(SESSION_KEY);
        const authed = role === 'guest' || role === 'student' || role === 'faculty';
        const isStudent = role === 'student';
        document.body.classList.toggle('has-app-nav', authed);
        const navLanding = document.getElementById('navLinksLanding');
        const navApp = document.getElementById('navLinksApp');
        if (navLanding) navLanding.hidden = authed;
        if (navApp) navApp.hidden = !authed;
        const btnEnterLab = document.getElementById('btnEnterLab');
        const btnSignOut = document.getElementById('btnSignOut');
        const studentNavProfile = document.getElementById('studentNavProfile');
        if (btnEnterLab) btnEnterLab.hidden = authed;
        if (btnSignOut) btnSignOut.hidden = !authed || isStudent;
        if (studentNavProfile) {
          studentNavProfile.hidden = !isStudent;
          studentNavProfile.style.display = isStudent ? 'flex' : 'none';
        }
        const tasksItem = document.getElementById('navTasksItem');
        if (tasksItem) tasksItem.hidden = !isStudent;
        document.getElementById('experimentDropdown')?.classList.remove('show');
        document.getElementById('studentAvatarMenu')?.classList.remove('show');
      }

      function formatStudentDisplay(email) {
        const local = (email || '').split('@')[0] || '';
        const parts = local.split(/[._-]+/).filter(Boolean);
        if (!parts.length) return 'Student';
        return parts
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
          .join(' ');
      }

      function updateStudentNavProfile() {
        const stored = localStorage.getItem('lf_currentUser');
        if (!stored) return;
        try {
          const user = JSON.parse(stored);
          if (user.role !== 'student') return;
          const name = user.name || formatStudentDisplay(user.email);
          const initial = (name || 'S').charAt(0).toUpperCase();
          const avatarLetter = document.getElementById('studentAvatarLetter');
          const navName = document.getElementById('studentNavName');
          const navEmail = document.getElementById('studentNavEmail');
          if (avatarLetter) avatarLetter.textContent = initial;
          if (navName) navName.textContent = name;
          if (navEmail) navEmail.textContent = user.email || '';
        } catch (_) {}
      }

      function completeSession(role) {
        if (role !== 'student') {
          sessionStorage.removeItem('logicflow_student_email');
          sessionStorage.removeItem('logicflow_student_display');
        }
        sessionStorage.setItem(SESSION_KEY, role);
        document.body.classList.add('nav-switching');
        applyNavMode();
        if (role === 'student') updateStudentNavProfile();
        dialog?.close();
        window.setTimeout(() => document.body.classList.remove('nav-switching'), 480);
      }

      // Page-load auth check: sync lf_currentUser into session state
      (function checkStoredAuth() {
        const stored = localStorage.getItem('lf_currentUser');
        if (stored) {
          try {
            const user = JSON.parse(stored);
            if (user.role === 'student') {
              sessionStorage.setItem(SESSION_KEY, 'student');
              sessionStorage.setItem('logicflow_student_email', user.email);
              sessionStorage.setItem('logicflow_student_display', user.name || formatStudentDisplay(user.email));
              updateStudentNavProfile();
            } else if (user.role === 'faculty') {
              window.location.href = 'logicflow-admin/index.html';
              return;
            }
          } catch (_) {}
        }
      })();

      applyNavMode();

      function showAccessStep(name) {
        Object.entries(steps).forEach(([key, el]) => {
          if (!el) return;
          el.hidden = key !== name;
        });
      }

      function resetAccessDialog() {
        showAccessStep('pick');
        const studentNote = document.getElementById('accessStudentNote');
        const facultyNote = document.getElementById('accessFacultyNote');
        if (studentNote) {
          studentNote.hidden = true;
          studentNote.textContent = '';
        }
        if (facultyNote) {
          facultyNote.hidden = true;
          facultyNote.textContent = '';
        }
        document.getElementById('formStudentInst')?.reset();
        document.getElementById('formFaculty')?.reset();
      }

      document.getElementById('btnEnterLab')?.addEventListener('click', () => {
        resetAccessDialog();
        dialog?.showModal();
        closeBtn?.focus();
      });

      closeBtn?.addEventListener('click', () => dialog?.close());

      dialog?.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.close();
      });

      dialog?.addEventListener('close', resetAccessDialog);

      document.querySelectorAll('.access-card').forEach((card) => {
        card.querySelector('.access-card-btn')?.addEventListener('click', () => {
          const path = card.getAttribute('data-access-path');
          if (path && steps[path]) showAccessStep(path);
        });
      });

      document.querySelectorAll('[data-access-back]').forEach((btn) => {
        btn.addEventListener('click', () => showAccessStep('pick'));
      });

      document.getElementById('formStudentInst')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        const emailInput = form.querySelector('[name="studentEmail"]');
        const passwordInput = form.querySelector('[name="studentPassword"]');
        const submitBtn = form.querySelector('.access-submit');
        const email = emailInput?.value?.trim();
        const password = passwordInput?.value?.trim();
        const studentNote = document.getElementById('accessStudentNote');
        
        // Clear previous error
        if (studentNote) {
          studentNote.hidden = true;
          studentNote.textContent = '';
        }
        
        // Disable button and show loading state
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';
        
        // Check hardcoded faculty credentials first
        if (email === 'faculty@chitkara.edu.in' && password === 'CUFaculty') {
          // Faculty login - save to localStorage
          localStorage.setItem('lf_currentUser', JSON.stringify({
            role: 'faculty',
            email: email,
            name: 'Faculty User'
          }));
          
          // Also keep sessionStorage for backward compatibility
          sessionStorage.setItem('logicflow_faculty_email', email);
          
          completeSession('faculty');
          // Redirect to admin overview
          window.location.href = 'logicflow-admin/overview.html';
          return;
        }
        
        // Check against students in localStorage
        const students = JSON.parse(localStorage.getItem('lf_students') || '[]');
        const student = students.find(s => s.email === email && s.password === password);
        
        if (student) {
          // Student login - save to localStorage
          localStorage.setItem('lf_currentUser', JSON.stringify({
            role: 'student',
            email: student.email,
            name: student.name,
            studentId: student.studentId,
            batchId: student.batchId
          }));
          
          // Also keep sessionStorage for backward compatibility
          sessionStorage.setItem('logicflow_student_email', email);
          sessionStorage.setItem('logicflow_student_display', formatStudentDisplay(email));
          
          completeSession('student');
          // Stay on index.html with student navbar
          return;
        } else {
          // Show inline error message
          if (studentNote) {
            studentNote.textContent = 'Invalid email or password. Please try again.';
            studentNote.hidden = false;
            studentNote.style.color = '#dc3545';
          }
          
          // Re-enable button
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      });
      
      // Clear error when user starts typing
      const formStudentInst = document.getElementById('formStudentInst');
      if (formStudentInst) {
        const emailInput = formStudentInst.querySelector('[name="studentEmail"]');
        const passwordInput = formStudentInst.querySelector('[name="studentPassword"]');
        const studentNote = document.getElementById('accessStudentNote');
        
        [emailInput, passwordInput].forEach(input => {
          input?.addEventListener('input', () => {
            if (studentNote) {
              studentNote.hidden = true;
              studentNote.textContent = '';
            }
          });
        });
      }

      document.getElementById('formFaculty')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        const instCode = form.querySelector('[name="instCode"]')?.value?.trim();
        const facultyEmail = form.querySelector('[name="facultyEmail"]')?.value?.trim();
        const facultyPassword = form.querySelector('[name="facultyPassword"]')?.value?.trim();
        const facultyNote = document.getElementById('accessFacultyNote');
        
        // Validate against localStorage
        const faculty = authenticateFaculty(facultyEmail, facultyPassword);
        
        if (faculty && faculty.instCode === instCode) {
          // Set current user in localStorage
          setCurrentUser({
            role: 'faculty',
            id: faculty.facultyId,
            email: faculty.email,
            name: faculty.name,
            instCode: faculty.instCode
          });
          
          // Also keep sessionStorage for backward compatibility
          sessionStorage.setItem('logicflow_faculty_email', facultyEmail);
          
          completeSession('faculty');
          // Redirect to faculty admin dashboard
          window.location.href = 'logicflow-admin/index.html';
        } else {
          // Show error message
          if (facultyNote) {
            facultyNote.textContent = 'Invalid credentials. Please check your institution code, email, and password.';
            facultyNote.hidden = false;
            facultyNote.style.color = '#dc3545';
          }
        }
      });

      document.getElementById('accessStudentGuestBtn')?.addEventListener('click', () => {
        completeSession('guest');
      });

      document.getElementById('accessGuestEnterBtn')?.addEventListener('click', () => {
        completeSession('guest');
      });

      document.getElementById('btnSignOut')?.addEventListener('click', () => {
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem('logicflow_student_email');
        sessionStorage.removeItem('logicflow_student_display');
        applyNavMode();
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });

      // Student avatar dropdown toggle
      const studentAvatarBtn = document.getElementById('studentAvatarBtn');
      const studentAvatarMenu = document.getElementById('studentAvatarMenu');
      if (studentAvatarBtn && studentAvatarMenu) {
        studentAvatarBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          studentAvatarMenu.classList.toggle('show');
        });
        document.addEventListener('click', (e) => {
          if (!e.target.closest('.student-avatar-dropdown')) {
            studentAvatarMenu.classList.remove('show');
          }
        });
      }

      // Student sign-out from avatar dropdown: show confirmation modal
      document.getElementById('studentNavSignOut')?.addEventListener('click', () => {
        document.getElementById('studentAvatarMenu')?.classList.remove('show');
        const modal = document.getElementById('studentSignoutModal');
        if (modal) modal.style.display = 'flex';
      });

      // Back-button interception for student on index.html
      const currentRole = sessionStorage.getItem(SESSION_KEY);
      if (currentRole === 'student') {
        history.pushState({ studentNav: true }, '', window.location.href);
        window.addEventListener('popstate', (e) => {
          if (e.state && e.state.studentNav) {
            // User pressed back — show custom sign-out modal
            const modal = document.getElementById('studentSignoutModal');
            if (modal) modal.style.display = 'flex';
          }
        });
      }

      // Student sign-out modal handlers
      const studentSignoutModal = document.getElementById('studentSignoutModal');
      document.getElementById('studentSignoutCancel')?.addEventListener('click', () => {
        if (studentSignoutModal) {
          studentSignoutModal.style.display = 'none';
          history.pushState({ studentNav: true }, '', window.location.href);
        }
      });
      document.getElementById('studentSignoutConfirm')?.addEventListener('click', () => {
        if (studentSignoutModal) studentSignoutModal.style.display = 'none';
        localStorage.removeItem('lf_currentUser');
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem('logicflow_student_email');
        sessionStorage.removeItem('logicflow_student_display');
        document.body.classList.add('nav-switching');
        applyNavMode();
        window.setTimeout(() => document.body.classList.remove('nav-switching'), 480);
      });
      studentSignoutModal?.addEventListener('click', (e) => {
        if (e.target === studentSignoutModal) {
          studentSignoutModal.style.display = 'none';
          history.pushState({ studentNav: true }, '', window.location.href);
        }
      });

      document.querySelectorAll('.reveal-section').forEach((el) => {
        if (prefersReducedMotion) {
          el.classList.add('is-visible');
          return;
        }
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                io.unobserve(entry.target);
              }
            });
          },
          { rootMargin: '0px 0px -6% 0px', threshold: 0.08 }
        );
        io.observe(el);
      });
    });