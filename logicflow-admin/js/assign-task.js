/* ============================================================
   LogicFlow Admin — Assign Task
   Dynamic form handling with localStorage integration
   ============================================================ */

(function () {
  'use strict';

  // Real experiments data matching the actual experiment files
  const experiments = [
    { id: 'exp1', name: '1. Electronic Components Lab', file: 'exp1_components.html' },
    { id: 'exp2', name: '2. Basic Equipments Lab', file: 'exp2_equipments.html' },
    { id: 'exp3', name: '3. Diode Lab', file: 'exp3_diode.html' },
    { id: 'exp4', name: '4. Zener Diode Lab', file: 'exp4_zener.html' },
    { id: 'exp5', name: '5. Rectifier Circuits Lab', file: 'exp5_rectifier.html' },
    { id: 'exp6', name: '6. Flip-Flops Lab', file: 'exp6_flipflops.html' },
    { id: 'exp7', name: '7. BCD Decoder Lab', file: 'exp7_bcd_decoder.html' },
    { id: 'exp8', name: '8. Multiplexer & Demultiplexer', file: 'exp8_mux_demux.html' },
    { id: 'exp9', name: '9. Motherboard Anatomy', file: 'exp9_motherboard.html' },
    { id: 'exp10', name: '10. ALU Simulation', file: 'exp10_alu.html' }
  ];

  let selectedTarget = null; // { type: 'batch'|'student', id, name, count/roll }
  let selectedExperiment = null;

  // ─── Initialize on Load ─────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    populateExperiments();
    initAssignmentTypeToggle();
    initTargetSearch();
    initExperimentSelect();
    initPriorityRadios();
    initDeadlineInput();
    initNotificationToggle();
    initAssignButton();
    loadRecentAssignments();
  });

  // ─── Populate Experiments Dropdown ───────────────────────────
  function populateExperiments() {
    const select = document.getElementById('exp-select');
    if (!select) return;

    experiments.forEach(exp => {
      const option = document.createElement('option');
      option.value = exp.id;
      option.textContent = exp.name;
      option.dataset.file = exp.file;
      select.appendChild(option);
    });
  }

  // ─── Init Assignment Type Toggle ────────────────────────────
  function initAssignmentTypeToggle() {
    const typeBatch = document.getElementById('type-batch');
    const typeIndividual = document.getElementById('type-individual');
    const targetSearch = document.getElementById('target-search');

    if (!typeBatch || !typeIndividual || !targetSearch) return;

    const updatePlaceholder = () => {
      if (typeBatch.checked) {
        targetSearch.placeholder = 'e.g., Batch B2024…';
      } else {
        targetSearch.placeholder = 'e.g., John Doe…';
      }
      // Clear selection when type changes
      selectedTarget = null;
      targetSearch.value = '';
      updateSummaryTarget();
    };

    typeBatch.addEventListener('change', updatePlaceholder);
    typeIndividual.addEventListener('change', updatePlaceholder);
  }

  // ─── Init Target Search Dropdown ─────────────────────────────
  function initTargetSearch() {
    const targetSearch = document.getElementById('target-search');
    const targetDropdown = document.getElementById('target-dropdown');

    if (!targetSearch || !targetDropdown) return;

    targetSearch.addEventListener('focus', () => {
      renderTargetDropdown();
      targetDropdown.style.display = 'block';
    });

    targetSearch.addEventListener('input', () => {
      renderTargetDropdown(targetSearch.value);
      targetDropdown.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
      if (!targetSearch.closest('.card').contains(e.target)) {
        targetDropdown.style.display = 'none';
      }
    });
  }

  // ─── Render Target Dropdown ─────────────────────────────────
  function renderTargetDropdown(filter = '') {
    const targetDropdown = document.getElementById('target-dropdown');
    const typeBatch = document.getElementById('type-batch');
    if (!targetDropdown) return;

    const isBatch = typeBatch.checked;
    filter = filter.toLowerCase();

    let items = [];

    if (isBatch) {
      // Show batches
      const batches = getBatches() || [];
      items = batches
        .filter(b => b.batchName.toLowerCase().includes(filter))
        .map(b => ({
          type: 'batch',
          id: b.batchId,
          name: b.batchName,
          sub: `${b.studentCount || 0} students`,
          icon: 'grid_view'
        }));
    } else {
      // Show students
      const students = getStudents() || [];
      items = students
        .filter(s => s.name.toLowerCase().includes(filter) || s.rollNo?.toLowerCase().includes(filter))
        .map(s => ({
          type: 'student',
          id: s.studentId,
          name: s.name,
          sub: s.rollNo || 'N/A',
          icon: 'person'
        }));
    }

    if (items.length === 0) {
      targetDropdown.innerHTML = `
        <div style="padding:14px;text-align:center;color:#737879;font-family:'Space Grotesk',sans-serif;font-size:13px;">
          No ${isBatch ? 'batches' : 'students'} found
        </div>
      `;
      return;
    }

    targetDropdown.innerHTML = items.map(item => `
      <div class="search-dropdown-item" onclick="selectTarget('${item.type}', '${item.id}', '${item.name}', '${item.sub}')">
        <span class="material-symbols-outlined" style="font-size:16px;color:#737879;">${item.icon}</span>
        ${item.name} <span style="color:#737879;margin-left:auto;font-size:11px;">${item.sub}</span>
      </div>
    `).join('');
  }

  // ─── Select Target (Global function for onclick) ─────────────
  window.selectTarget = function (type, id, name, sub) {
    const targetSearch = document.getElementById('target-search');
    const targetDropdown = document.getElementById('target-dropdown');

    selectedTarget = { type, id, name, sub };
    targetSearch.value = name;
    targetDropdown.style.display = 'none';

    updateSummaryTarget();
  };

  // ─── Update Summary Target ───────────────────────────────────
  function updateSummaryTarget() {
    const sumTarget = document.getElementById('sum-target');
    const sumTargetSub = document.getElementById('sum-target-sub');

    if (!sumTarget || !sumTargetSub) return;

    if (!selectedTarget) {
      sumTarget.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:#516353;display:inline-block;"></span> No target selected`;
      sumTargetSub.textContent = '—';
      return;
    }

    const icon = selectedTarget.type === 'batch' ? 'grid_view' : 'person';
    sumTarget.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:#516353;display:inline-block;"></span> ${selectedTarget.name}`;
    sumTargetSub.textContent = selectedTarget.sub;
  }

  // ─── Init Experiment Select ─────────────────────────────────
  function initExperimentSelect() {
    const expSelect = document.getElementById('exp-select');
    if (!expSelect) return;

    expSelect.addEventListener('change', () => {
      const option = expSelect.options[expSelect.selectedIndex];
      if (option && option.value) {
        selectedExperiment = {
          id: option.value,
          name: option.textContent,
          file: option.dataset.file
        };
      } else {
        selectedExperiment = null;
      }
      updateSummaryExperiment();
    });
  }

  // ─── Update Summary Experiment ──────────────────────────────
  function updateSummaryExperiment() {
    const sumExperiment = document.getElementById('sum-experiment');
    const sumTags = document.getElementById('sum-tags');

    if (!sumExperiment || !sumTags) return;

    if (!selectedExperiment) {
      sumExperiment.textContent = 'No experiment selected';
      return;
    }

    sumExperiment.textContent = selectedExperiment.name;
  }

  // ─── Init Priority Radios ─────────────────────────────────────
  function initPriorityRadios() {
    const radios = document.querySelectorAll('.priority-radio');
    const sumTags = document.getElementById('sum-tags');

    if (!sumTags) return;

    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        const labels = { low: 'Low Priority', medium: 'Medium Priority', high: 'High Priority' };
        const colors = {
          low: 'background:#d3e8d4;color:#394b3c;',
          medium: 'background:#d7e5e7;color:#334042;',
          high: 'background:#ffd9de;color:#673a42;'
        };
        const v = radio.value;
        sumTags.innerHTML = `<span style="padding:2px 8px;border-radius:4px;font-size:11px;font-family:'Space Grotesk',sans-serif;border:1px solid rgba(195,199,200,0.4);${colors[v]}">${labels[v]}</span>`;
      });
    });
  }

  // ─── Init Deadline Input ─────────────────────────────────────
  function initDeadlineInput() {
    const deadline = document.getElementById('deadline');
    const dlBlock = document.getElementById('sum-deadline-block');
    const sumDeadline = document.getElementById('sum-deadline');

    if (!deadline || !dlBlock || !sumDeadline) return;

    deadline.addEventListener('change', () => {
      const dl = deadline.value;
      if (dl) {
        dlBlock.style.display = 'block';
        const d = new Date(dl);
        sumDeadline.textContent = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      } else {
        dlBlock.style.display = 'none';
      }
    });
  }

  // ─── Init Notification Toggle ───────────────────────────────
  function initNotificationToggle() {
    const toggle = document.getElementById('notify-toggle');
    const track = document.getElementById('toggle-track');
    const thumb = document.getElementById('toggle-thumb');
    const note = document.getElementById('notify-note');

    if (!toggle || !track || !thumb || !note) return;

    toggle.addEventListener('change', () => {
      track.style.background = toggle.checked ? '#4a5759' : '#c3c7c8';
      thumb.style.transform = toggle.checked ? 'translateX(20px)' : 'translateX(0)';
      note.textContent = toggle.checked ? 'Notification will be shown on student login.' : 'No notification will be shown.';
    });
  }

  // ─── Init Assign Button ───────────────────────────────────────
  function initAssignButton() {
    const assignBtn = document.getElementById('assign-btn');
    if (!assignBtn) return;

    assignBtn.addEventListener('click', handleAssignTask);
  }

  // ─── Handle Assign Task ───────────────────────────────────────
  function handleAssignTask() {
    // Validation
    if (!selectedTarget) {
      window.showToast('Please select a target', 'error');
      return;
    }

    if (!selectedExperiment) {
      window.showToast('Please select an experiment', 'error');
      return;
    }

    const deadline = document.getElementById('deadline').value;
    if (!deadline) {
      window.showToast('Please set a deadline', 'error');
      return;
    }

    const priority = document.querySelector('.priority-radio:checked')?.value || 'medium';
    const instructions = document.getElementById('instructions').value;
    const notify = document.getElementById('notify-toggle').checked;

    const currentUser = getCurrentUser();

    // Build task object
    const task = {
      taskId: Date.now() + Math.random(),
      assignmentType: selectedTarget.type,
      targetId: selectedTarget.id,
      targetName: selectedTarget.name,
      targetCount: selectedTarget.type === 'batch' ? parseInt(selectedTarget.sub) || 0 : 1,
      experimentId: selectedExperiment.id,
      experimentName: selectedExperiment.name,
      experimentUrl: selectedExperiment.file,
      deadline: new Date(deadline).toISOString(),
      priority: priority,
      instructions: instructions,
      assignedAt: new Date().toISOString(),
      assignedBy: currentUser?.email || 'admin@lab.edu',
      status: 'active'
    };

    // Save to localStorage
    const tasks = getTasks() || [];
    tasks.push(task);
    setStorage(STORAGE_KEYS.TASKS, tasks);

    // Create notification if enabled
    if (notify) {
      createNotification(task);
    }

    // Show success
    window.showToast('Task assigned successfully!', 'success');

    // Reset form
    resetForm();

    // Refresh recent assignments
    loadRecentAssignments();
  }

  // ─── Create Notification ───────────────────────────────────────
  function createNotification(task) {
    const notifications = getStorage('lf_notifications') || [];
    
    let studentIds = [];
    if (task.assignmentType === 'batch') {
      const students = getStudents() || [];
      studentIds = students
        .filter(s => s.batchId === task.targetId)
        .map(s => s.studentId);
    } else {
      studentIds = [task.targetId];
    }

    const notification = {
      notificationId: Date.now() + Math.random(),
      studentIds: studentIds,
      message: `New task assigned: ${task.experimentName}`,
      taskId: task.taskId,
      seen: false,
      createdAt: new Date().toISOString()
    };

    notifications.push(notification);
    setStorage('lf_notifications', notifications);
  }

  // ─── Reset Form ───────────────────────────────────────────────
  function resetForm() {
    document.getElementById('target-search').value = '';
    document.getElementById('exp-select').value = '';
    document.getElementById('deadline').value = '';
    document.getElementById('instructions').value = '';
    document.getElementById('prio-med').checked = true;
    document.getElementById('notify-toggle').checked = true;
    
    // Reset toggle visual
    const track = document.getElementById('toggle-track');
    const thumb = document.getElementById('toggle-thumb');
    const note = document.getElementById('notify-note');
    track.style.background = '#4a5759';
    thumb.style.transform = 'translateX(20px)';
    note.textContent = 'Notification will be shown on student login.';

    // Reset state
    selectedTarget = null;
    selectedExperiment = null;

    // Reset summary
    updateSummaryTarget();
    updateSummaryExperiment();
    document.getElementById('sum-deadline-block').style.display = 'none';
    document.getElementById('sum-tags').innerHTML = `<span style="padding:2px 8px;border-radius:4px;font-size:11px;font-family:'Space Grotesk',sans-serif;background:#d7e5e7;color:#334042;border:1px solid rgba(187,201,203,0.4);">Medium Priority</span>`;
  }

  // ─── Load Recent Assignments ─────────────────────────────────
  function loadRecentAssignments() {
    const recentContainer = document.getElementById('recent-assignments');
    const noAssignments = document.getElementById('no-assignments');

    if (!recentContainer || !noAssignments) return;

    const tasks = getTasks() || [];
    
    if (tasks.length === 0) {
      recentContainer.innerHTML = '';
      noAssignments.style.display = 'block';
      return;
    }

    noAssignments.style.display = 'none';

    // Sort by assignedAt descending, take last 5
    const recent = tasks
      .sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt))
      .slice(0, 5);

    recentContainer.innerHTML = recent.map(task => {
      const timeAgo = getTimeAgo(task.assignedAt);
      const expNum = task.experimentName.match(/^\d+/)?.[0] || 'EXP';
      return `
        <div style="display:flex;align-items:center;gap:10px;font-size:13px;">
          <span class="material-symbols-outlined" style="font-size:16px;color:#516353;">check_circle</span>
          <span style="flex:1;color:#191c20;">${expNum} → ${task.targetName}</span>
          <span style="font-family:'Space Grotesk',sans-serif;font-size:11px;color:#737879;">${timeAgo}</span>
        </div>
      `;
    }).join('');
  }

  // ─── Helper: Time Ago ─────────────────────────────────────────
  function getTimeAgo(isoString) {
    const now = Date.now();
    const then = new Date(isoString).getTime();
    const diff = now - then;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

})();
