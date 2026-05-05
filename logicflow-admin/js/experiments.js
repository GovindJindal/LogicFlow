/* ============================================================
   LogicFlow Admin — Experiments Library
   Dynamically loads real experiments from the project
   ============================================================ */

(function () {
  'use strict';

  // Real experiments data based on actual experiment files
  const experiments = [
    {
      id: 'exp1',
      file: 'exp1_components.html',
      title: 'Electronic Components Lab',
      description: 'Identify and work with basic electronic components including resistors, capacitors, inductors, and diodes.',
      difficulty: 'beginner',
      duration: '40 mins',
      icon: 'electrical_services',
      color: '#516353',
      bgColor: '#d3e8d4',
      iconColor: '#394b3c'
    },
    {
      id: 'exp2',
      file: 'exp2_equipments.html',
      title: 'Basic Equipments Lab',
      description: 'Learn to use essential lab equipment including multimeters, function generators, and power supplies.',
      difficulty: 'beginner',
      duration: '45 mins',
      icon: 'construction',
      color: '#334042',
      bgColor: '#d7e5e7',
      iconColor: '#334042'
    },
    {
      id: 'exp3',
      file: 'exp3_diode.html',
      title: 'Diode Lab',
      description: 'Study PN junction diode characteristics, I-V curves, and load line analysis with interactive plotting.',
      difficulty: 'beginner',
      duration: '45 mins',
      icon: 'battery_charging_full',
      color: '#516353',
      bgColor: '#d3e8d4',
      iconColor: '#394b3c'
    },
    {
      id: 'exp4',
      file: 'exp4_zener.html',
      title: 'Zener Diode Lab',
      description: 'Explore Zener diode voltage regulation characteristics and build simple voltage regulator circuits.',
      difficulty: 'intermediate',
      duration: '60 mins',
      icon: 'bolt',
      color: '#8b6508',
      bgColor: '#d7e5e7',
      iconColor: '#334042'
    },
    {
      id: 'exp5',
      file: 'exp5_rectifier.html',
      title: 'Rectifier Circuits Lab',
      description: 'Build and analyze half-wave, full-wave, and bridge rectifier circuits with real-time waveform visualization.',
      difficulty: 'intermediate',
      duration: '60 mins',
      icon: 'waves',
      color: '#8b6508',
      bgColor: '#d7e5e7',
      iconColor: '#334042'
    },
    {
      id: 'exp6',
      file: 'exp6_flipflops.html',
      title: 'Flip-Flops Lab',
      description: 'Study sequential logic circuits including SR, D, JK, and T flip-flops with timing diagrams.',
      difficulty: 'intermediate',
      duration: '60 mins',
      icon: 'toggle_on',
      color: '#8b6508',
      bgColor: '#d7e5e7',
      iconColor: '#334042'
    },
    {
      id: 'exp7',
      file: 'exp7_bcd_decoder.html',
      title: 'BCD Decoder Lab',
      description: 'Design and implement BCD to seven-segment decoder circuits with truth table verification.',
      difficulty: 'advanced',
      duration: '75 mins',
      icon: 'pin',
      color: '#5c3139',
      bgColor: '#ffd9de',
      iconColor: '#330f17'
    },
    {
      id: 'exp8',
      file: 'exp8_mux_demux.html',
      title: 'Multiplexer & Demultiplexer',
      description: 'Understand data routing with multiplexers and demultiplexers, implement logic functions using MUX.',
      difficulty: 'advanced',
      duration: '75 mins',
      icon: 'call_split',
      color: '#5c3139',
      bgColor: '#ffd9de',
      iconColor: '#330f17'
    },
    {
      id: 'exp9',
      file: 'exp9_motherboard.html',
      title: 'Motherboard Anatomy',
      description: 'Explore computer motherboard components, architecture, and interconnections with 3D visualization.',
      difficulty: 'advanced',
      duration: '90 mins',
      icon: 'memory',
      color: '#5c3139',
      bgColor: '#ffd9de',
      iconColor: '#330f17'
    },
    {
      id: 'exp10',
      file: 'exp10_alu.html',
      title: 'ALU Simulation',
      description: 'Build and simulate an Arithmetic Logic Unit performing arithmetic and logical operations on binary data.',
      difficulty: 'advanced',
      duration: '90 mins',
      icon: 'calculate',
      color: '#5c3139',
      bgColor: '#ffd9de',
      iconColor: '#330f17'
    }
  ];

  let currentFilter = 'all';
  let searchQuery = '';

  // ─── Initialize on Load ─────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    renderExperiments();
    initSearch();
    initFilter();
  });

  // ─── Render Experiments ───────────────────────────────────────
  function renderExperiments() {
    const grid = document.getElementById('experiments-grid');
    const noResults = document.getElementById('no-results');
    if (!grid) return;

    // Filter by difficulty and search
    let filtered = experiments.filter(exp => {
      const matchesDifficulty = currentFilter === 'all' || exp.difficulty === currentFilter;
      const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           exp.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDifficulty && matchesSearch;
    });

    // Show empty state if no results
    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (noResults) noResults.style.display = 'block';
      return;
    }

    if (noResults) noResults.style.display = 'none';

    // Render cards
    grid.innerHTML = filtered.map(exp => renderExperimentCard(exp)).join('');

    // Update assigned counts
    updateAssignedCounts();
  }

  // ─── Render Single Experiment Card ────────────────────────────
  function renderExperimentCard(exp) {
    const diffClass = `diff-${exp.difficulty}`;
    const diffLabel = exp.difficulty.charAt(0).toUpperCase() + exp.difficulty.slice(1);

    return `
      <div class="exp-card stagger-item fade-in" data-experiment-id="${exp.id}">
        <div style="height:3px;background:${exp.color};"></div>
        <div style="padding:22px;flex:1;display:flex;flex-direction:column;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
            <div style="width:48px;height:48px;border-radius:10px;background:${exp.bgColor};display:flex;align-items:center;justify-content:center;">
              <span class="material-symbols-outlined icon-fill" style="font-size:24px;color:${exp.iconColor};">${exp.icon}</span>
            </div>
            <span class="diff-badge ${diffClass}">${diffLabel}</span>
          </div>
          <div class="exp-title" style="font-size:16px;font-weight:800;color:#191c20;margin-bottom:8px;transition:color 0.2s;">${exp.title}</div>
          <div style="font-family:'Space Grotesk',sans-serif;font-size:13px;color:#737879;line-height:1.6;flex:1;margin-bottom:16px;">${exp.description}</div>
          <div style="display:flex;gap:16px;font-family:'Space Grotesk',sans-serif;font-size:12px;color:#737879;margin-bottom:18px;">
            <span style="display:flex;align-items:center;gap:4px;"><span class="material-symbols-outlined" style="font-size:14px;">schedule</span>${exp.duration}</span>
            <span style="display:flex;align-items:center;gap:4px;"><span class="material-symbols-outlined" style="font-size:14px;">group</span><span class="assigned-count" data-experiment-id="${exp.id}">0</span> Assigned</span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid #f2f3f9;padding-top:16px;">
            <a href="../${exp.file}" target="_blank" style="background:none;border:none;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;color:#4a5759;cursor:pointer;display:flex;align-items:center;gap:4px;text-decoration:none;">Preview <span class="material-symbols-outlined" style="font-size:14px;">visibility</span></a>
            <a href="assign-task.html?experiment=${exp.id}" class="btn-primary" style="font-size:12px;padding:7px 14px;text-decoration:none;">Assign</a>
          </div>
        </div>
        <div style="position:absolute;bottom:0;right:0;width:80px;height:80px;background:${exp.bgColor}33;filter:blur(24px);border-radius:50%;pointer-events:none;"></div>
      </div>
    `;
  }

  // ─── Update Assigned Counts from localStorage ───────────────────
  function updateAssignedCounts() {
    const tasks = getTasks() || [];
    
    experiments.forEach(exp => {
      const countEl = document.querySelector(`.assigned-count[data-experiment-id="${exp.id}"]`);
      if (countEl) {
        const assignedCount = tasks.filter(task => task.experimentId === exp.id).length;
        countEl.textContent = assignedCount;
      }
    });
  }

  // ─── Init Search ───────────────────────────────────────────────
  function initSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderExperiments();
    });
  }

  // ─── Init Filter ───────────────────────────────────────────────
  function initFilter() {
    const filterSelect = document.getElementById('difficulty-filter');
    if (!filterSelect) return;

    filterSelect.addEventListener('change', (e) => {
      currentFilter = e.target.value;
      renderExperiments();
    });
  }

})();
