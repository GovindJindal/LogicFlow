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

    const UNI_NAMES = {
      aktu: 'Dr. APJ Abdul Kalam Technical University',
      vtu: 'Visvesvaraya Technological University',
      anna: 'Anna University, Chennai',
      mumbai: 'University of Mumbai'
    };

    const EXPERIMENTS = [
      {
        title: 'Exp 1: Electronic Components', module: 'Fundementals', href: 'exp1_components.html', icon: '🔌', color: 'var(--blue)',
        tagColor: 'rgba(26,86,219,.15)', tagBorder: 'rgba(26,86,219,.3)', tagText: '#1A56DB',
        record: { aim: 1, circuit: 1, obs: 1, conc: 1, viva: 1 },
        map: { aktu: { paper: 'KEC-301', sem: 'III', topic: 'Unit I — Lab Intro', co: 'CO1' }, vtu: { paper: '18EC32', sem: 'III', topic: 'Module 1', co: 'CO1' }, anna: { paper: 'EC3251', sem: 'III', topic: 'Unit 1', co: 'CO1' }, mumbai: { paper: 'BECOC301', sem: 'III', topic: 'Lab Intro', co: 'CO1' } }
      },

      {
        title: 'Exp 2: Basic Equipments (CRO)', module: 'Fundementals', href: 'exp2_equipments.html', icon: '📺', color: 'var(--amber)',
        tagColor: 'rgba(245,158,11,.15)', tagBorder: 'rgba(245,158,11,.3)', tagText: '#d97706',
        record: { aim: 1, circuit: 1, obs: 1, conc: 1, viva: 1 },
        map: { aktu: { paper: 'KEC-301', sem: 'III', topic: 'Unit I — Measurement', co: 'CO1' }, vtu: { paper: '18EC32', sem: 'III', topic: 'Module 1', co: 'CO1' }, anna: { paper: 'EC3251', sem: 'III', topic: 'Unit 1', co: 'CO1' }, mumbai: { paper: 'BECOC301', sem: 'III', topic: 'Measurement', co: 'CO1' } }
      },

      {
        title: 'Exp 3: PN Junction Diode', module: 'Analog Electronics', href: 'exp3_diode.html', icon: '🧪', color: 'var(--green)',
        tagColor: 'rgba(16,185,129,.15)', tagBorder: 'rgba(16,185,129,.3)', tagText: '#059669',
        record: { aim: 1, circuit: 1, obs: 1, conc: 1, viva: 1 },
        map: { aktu: { paper: 'KEC-301', sem: 'III', topic: 'Unit II — Diode Theory', co: 'CO2' }, vtu: { paper: '18EC32', sem: 'III', topic: 'Module 2', co: 'CO1' }, anna: { paper: 'EC3251', sem: 'III', topic: 'Unit 1', co: 'CO2' }, mumbai: { paper: 'BECOC301', sem: 'III', topic: 'Chapter 2', co: 'CO1' } }
      },

      {
        title: 'Exp 4: Zener Diode Regulator', module: 'Analog Electronics', href: 'exp4_zener.html', icon: '⚡', color: 'var(--rose)',
        tagColor: 'rgba(244,63,94,.15)', tagBorder: 'rgba(244,63,94,.3)', tagText: '#e11d48',
        record: { aim: 1, circuit: 1, obs: 1, conc: 1, viva: 1 },
        map: { aktu: { paper: 'KEC-301', sem: 'III', topic: 'Unit II — Zener Diodes', co: 'CO2' }, vtu: { paper: '18EC32', sem: 'III', topic: 'Module 2', co: 'CO1' }, anna: { paper: 'EC3251', sem: 'III', topic: 'Unit 1', co: 'CO2' }, mumbai: { paper: 'BECOC301', sem: 'III', topic: 'Chapter 2', co: 'CO1' } }
      },

      {
        title: 'Exp 5: Continuous Evaluation 1.1', module: 'Evaluation', href: 'eval1.html', icon: '📝', color: 'var(--purple)',
        tagColor: 'rgba(124,58,237,.15)', tagBorder: 'rgba(124,58,237,.3)', tagText: '#6d28d9',
        record: { aim: 1, circuit: 1, obs: 1, conc: 1, viva: 1 },
        map: { aktu: { paper: 'KEC-301', sem: 'III', topic: 'Internal Assessment', co: 'ALL' }, vtu: { paper: '18EC32', sem: 'III', topic: 'Evaluation', co: 'ALL' }, anna: { paper: 'EC3251', sem: 'III', topic: 'Test', co: 'ALL' }, mumbai: { paper: 'BECOC301', sem: 'III', topic: 'Test', co: 'ALL' } }
      },

      {
        title: 'Exp 6: Rectifier Circuits', module: 'Analog Electronics', href: 'exp5_rectifier.html', icon: '🔌', color: 'var(--cyan)',
        tagColor: 'rgba(6,182,212,.15)', tagBorder: 'rgba(6,182,212,.3)', tagText: '#0891b2',
        record: { aim: 1, circuit: 1, obs: 1, conc: 1, viva: 1 },
        map: { aktu: { paper: 'KEC-301', sem: 'III', topic: 'Unit II — Power Supplies', co: 'CO2' }, vtu: { paper: '18EC32', sem: 'III', topic: 'Module 2', co: 'CO1' }, anna: { paper: 'EC3251', sem: 'III', topic: 'Unit 1', co: 'CO2' }, mumbai: { paper: 'BECOC301', sem: 'III', topic: 'Chapter 3', co: 'CO1' } }
      },

      {
        title: 'Exp 7: D & J-K Flip-Flop', module: 'Digital Logic', href: 'exp6_flipflops.html', icon: '🔄', color: 'var(--blue)',
        tagColor: 'rgba(26,86,219,.15)', tagBorder: 'rgba(26,86,219,.3)', tagText: '#1A56DB',
        record: { aim: 1, circuit: 1, obs: 1, conc: 1, viva: 0 },
        map: { aktu: { paper: 'KEC-401', sem: 'IV', topic: 'Unit III — Sequential Logic', co: 'CO3' }, vtu: { paper: '18EC33', sem: 'III', topic: 'Module 3', co: 'CO3' }, anna: { paper: 'EC3352', sem: 'IV', topic: 'Unit 4', co: 'CO3' }, mumbai: { paper: 'BECOC401', sem: 'IV', topic: 'Chapter 4', co: 'CO3' } }
      },

      {
        title: 'Exp 8: BCD to 7-Segment', module: 'Digital Logic', href: 'exp7_bcd_decoder.html', icon: '🔢', color: 'var(--rose)',
        tagColor: 'rgba(244,63,94,.15)', tagBorder: 'rgba(244,63,94,.3)', tagText: '#e11d48',
        record: { aim: 1, circuit: 1, obs: 1, conc: 1, viva: 0 },
        map: { aktu: { paper: 'KEC-401', sem: 'IV', topic: 'Unit II — Comb. Logic', co: 'CO2' }, vtu: { paper: '18EC33', sem: 'III', topic: 'Module 2', co: 'CO2' }, anna: { paper: 'EC3352', sem: 'IV', topic: 'Unit 3', co: 'CO2' }, mumbai: { paper: 'BECOC401', sem: 'IV', topic: 'Chapter 3', co: 'CO2' } }
      },

      {
        title: 'Exp 9: MUX & DEMUX', module: 'Digital Logic', href: '#', dev: true, icon: '🔀', color: 'var(--amber)',
        tagColor: 'rgba(245,158,11,.15)', tagBorder: 'rgba(245,158,11,.3)', tagText: '#d97706',
        record: { aim: 1, circuit: 1, obs: 0, conc: 0, viva: 0 },
        map: { aktu: { paper: 'KEC-401', sem: 'IV', topic: 'Unit II — Multiplexers', co: 'CO2' }, vtu: { paper: '18EC33', sem: 'III', topic: 'Module 2', co: 'CO2' }, anna: { paper: 'EC3352', sem: 'IV', topic: 'Unit 3', co: 'CO2' }, mumbai: { paper: 'BECOC401', sem: 'IV', topic: 'Chapter 3', co: 'CO2' } }
      },

      {
        title: 'Exp 10: COA Hardware', module: 'Computer Architecture', href: '#', dev: true, icon: '🖥️', color: 'var(--green)',
        tagColor: 'rgba(16,185,129,.15)', tagBorder: 'rgba(16,185,129,.3)', tagText: '#059669',
        record: { aim: 1, circuit: 1, obs: 1, conc: 1, viva: 0 },
        map: { aktu: { paper: 'KCS-501', sem: 'V', topic: 'Unit I — Arch Basics', co: 'CO1' }, vtu: { paper: '18CS42', sem: 'IV', topic: 'Module 1', co: 'CO1' }, anna: { paper: 'CS3551', sem: 'V', topic: 'Unit 1', co: 'CO1' }, mumbai: { paper: 'BECOCS501', sem: 'V', topic: 'Module 1', co: 'CO1' } }
      },

      {
        title: 'Exp 11: ALU Implementation', module: 'Computer Architecture', href: '#', dev: true, icon: '⚙️', color: 'var(--purple)',
        tagColor: 'rgba(124,58,237,.15)', tagBorder: 'rgba(124,58,237,.3)', tagText: '#6d28d9',
        record: { aim: 1, circuit: 1, obs: 0, conc: 0, viva: 0 },
        map: { aktu: { paper: 'KCS-501', sem: 'V', topic: 'Unit II — ALU Design', co: 'CO2' }, vtu: { paper: '18CS42', sem: 'IV', topic: 'Module 2', co: 'CO2' }, anna: { paper: 'CS3551', sem: 'V', topic: 'Unit 2', co: 'CO2' }, mumbai: { paper: 'BECOCS501', sem: 'V', topic: 'Module 2', co: 'CO2' } }
      },

      {
        title: 'Exp 12: Continuous Eval 1.2', module: 'Evaluation', href: 'eval2.html', icon: '📝', color: 'var(--blue)',
        tagColor: 'rgba(26,86,219,.15)', tagBorder: 'rgba(26,86,219,.3)', tagText: '#1A56DB',
        record: { aim: 0, circuit: 0, obs: 0, conc: 0, viva: 0 },
        map: { aktu: { paper: 'KCS-501', sem: 'V', topic: 'Assessment', co: 'ALL' }, vtu: { paper: '18CS42', sem: 'IV', topic: 'Assessment', co: 'ALL' }, anna: { paper: 'CS3551', sem: 'V', topic: 'Test', co: 'ALL' }, mumbai: { paper: 'BECOCS501', sem: 'V', topic: 'Test', co: 'ALL' } }
      }
    ];

    let activeUni = 'aktu';

    function setUni(uni, el) {
      activeUni = uni;
      document.querySelectorAll('.uni-tab').forEach(t => t.classList.remove('active'));
      el.classList.add('active');
      document.getElementById('uniFullName').textContent = UNI_NAMES[uni];
      renderExps();
    }

    function renderExps() {
      const modules = [...new Set(EXPERIMENTS.map(e => e.module))];
      let html = '';
      modules.forEach(mod => {
        const exps = EXPERIMENTS.filter(e => e.module === mod);
        const done = exps.filter(e => Object.values(e.record).every(v => v || v === 0)).length;
        html += `<div class="module-section">
      <div class="module-header">
        <span class="module-label">${mod}</span>
        <div class="module-line"></div>
        <span class="module-count">${exps.length} exps</span>
      </div>`;
        exps.forEach(exp => {
          const m = exp.map[activeUni];
          const rec = exp.record;
          const filled = Object.values(rec).filter(v => v).length;
          const total = Object.keys(rec).length;
          const pct = Math.round(filled / total * 100);
          html += `<a ${exp.href !== '#' ? `href="${exp.href}"` : 'href="#" onclick="return false;" style="cursor:not-allowed"'} class="exp-row">
        <div class="exp-icon" style="background:${exp.tagColor};border:1px solid ${exp.tagBorder}">${exp.icon}</div>
        <div class="exp-main">
          <div class="exp-title">
            <span>${exp.title}</span>
            <span class="exp-tag" style="background:${exp.tagColor};border:1px solid ${exp.tagBorder};color:${exp.tagText}">${exp.module}</span>
            ${exp.dev ? `<span class="exp-tag" style="background:rgba(234,179,8,.15);border:1px solid rgba(234,179,8,.4);color:#b45309">Under Development</span>` : ''}
          </div>
          <div class="exp-meta">
            <span style="color:${exp.tagText};font-weight:700">${m.paper}</span>
            <span class="meta-sep">·</span>
            <span>Sem ${m.sem}</span>
            <span class="meta-sep">·</span>
            <span title="${m.topic}">${m.topic.length > 52 ? m.topic.slice(0, 52) + '…' : m.topic}</span>
            <span class="meta-sep">·</span>
            <span class="exp-co">${m.co}</span>
          </div>
        </div>
        <div class="exp-progress">
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
          <div class="progress-label">${filled}/${total}</div>
        </div>
        <div class="arrow">›</div>
      </a>`;
        });
        html += '</div>';
      });
      document.getElementById('expList').innerHTML = html;
    }

    renderExps();