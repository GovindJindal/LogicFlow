/* ============================================================
   LogicFlow Admin — Evaluation Board
   Loads submissions dynamically from localStorage
   ============================================================ */

(function () {
  'use strict';

  let allSubmissions = [];
  let currentBatchFilter = 'all';
  const ITEMS_PER_PAGE = 5;
  let currentPage = 1;

  // ─── Initialize on Load ─────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    loadBatches();
    loadSubmissions();
    initBatchFilter();
    initSaveAllButton();
  });

  // ─── Load Batches for Filter Dropdown ───────────────────────
  function loadBatches() {
    const batches = getBatches();
    const filterSelect = document.getElementById('batch-filter');
    if (!filterSelect) return;

    // Clear existing options except "All Batches"
    filterSelect.innerHTML = '<option value="all">All Batches</option>';

    // Add batch options
    batches.forEach(batch => {
      const option = document.createElement('option');
      option.value = batch.batchId;
      option.textContent = batch.batchName || `Batch ${batch.batchId}`;
      filterSelect.appendChild(option);
    });
  }

  // ─── Load Submissions from localStorage ───────────────────────
  function loadSubmissions() {
    allSubmissions = getSubmissions();
    renderSubmissions();
    updateStats();
  }

  // ─── Render Submissions Table ────────────────────────────────
  function renderSubmissions() {
    const tbody = document.getElementById('submissions-tbody');
    const showingText = document.getElementById('showing-text');
    if (!tbody) return;

    // Filter by batch
    let filtered = allSubmissions;
    if (currentBatchFilter !== 'all') {
      filtered = allSubmissions.filter(s => s.batchId === parseInt(currentBatchFilter));
    }

    // Sort by submittedAt (newest first)
    filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    // Pagination
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    if (currentPage > totalPages) currentPage = Math.max(1, totalPages);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageData = filtered.slice(startIndex, endIndex);

    // Empty state
    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;padding:40px;color:#737879;font-family:'Space Grotesk',sans-serif;">
            No submissions yet. Students will appear here once they submit tasks from their panel.
          </td>
        </tr>
      `;
      if (showingText) showingText.textContent = 'No submissions yet';
      return;
    }

    // Render rows
    tbody.innerHTML = pageData.map(sub => renderSubmissionRow(sub)).join('');

    // Update showing text
    if (showingText) {
      showingText.textContent = `Showing ${startIndex + 1}–${Math.min(endIndex, filtered.length)} of ${filtered.length} submissions`;
    }

    // Update pagination
    updatePagination(totalPages);
  }

  // ─── Render Single Submission Row ────────────────────────────
  function renderSubmissionRow(sub) {
    const student = getStudentById(sub.studentId);
    const batch = getBatchById(sub.batchId);
    const initials = getInitials(sub.studentName);
    const timeAgo = getTimeAgo(sub.submittedAt);
    const isLate = sub.isLate ? '⚠ ' : '';
    const lateText = sub.isLate ? `Late (+${getLateHours(sub.submittedAt, sub.deadline)}hrs)` : '';

    const statusClass = getStatusClass(sub.gradeStatus);
    const scoreValue = sub.score !== null ? sub.score : '';

    return `
      <tr class="eval-row ${sub.isLate ? 'flagged' : ''}" data-submission-id="${sub.submissionId}">
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="avatar-fallback" style="background:#d7e5e7;color:#334042;font-size:12px;font-weight:700;flex-shrink:0;">${initials}</div>
            <div>
              <div style="font-weight:600;font-size:14px;color:#191c20;">${sub.studentName}</div>
              <div style="font-size:11px;color:#737879;font-family:'Space Grotesk',sans-serif;">${student?.rollNo || 'N/A'}</div>
            </div>
          </div>
        </td>
        <td>
          <div style="font-weight:600;font-size:13px;color:#4a5759;cursor:pointer;margin-bottom:3px;" onclick="window.showToast('Opening file preview…','info')">${sub.taskTitle || 'Task Submission'}</div>
          <div style="font-size:11px;color:${sub.isLate ? '#ba1a1a' : '#737879'};font-family:'Space Grotesk',sans-serif;">${isLate}Submitted: ${timeAgo} ${lateText}</div>
        </td>
        <td style="text-align:center;">
          <input class="grade-input score-input" type="number" min="0" max="100" value="${scoreValue}" placeholder="—" data-submission-id="${sub.submissionId}" onchange="handleScoreChange(this)" />
        </td>
        <td>
          <select class="grade-select ${statusClass}" onchange="handleStatusChange(this)" data-submission-id="${sub.submissionId}">
            <option value="Pending Review" data-cls="pending" ${sub.gradeStatus === 'Pending Review' ? 'selected' : ''}>Pending Review</option>
            <option value="Needs Review" data-cls="warn" ${sub.gradeStatus === 'Needs Review' ? 'selected' : ''}>Needs Review</option>
            <option value="Graded — Pass" data-cls="pass" ${sub.gradeStatus === 'Graded — Pass' ? 'selected' : ''}>Graded — Pass</option>
            <option value="Graded — Fail" data-cls="fail" ${sub.gradeStatus === 'Graded — Fail' ? 'selected' : ''}>Graded — Fail</option>
          </select>
        </td>
        <td>
          <textarea class="comment-area" rows="2" placeholder="Add comments…" data-submission-id="${sub.submissionId}" onchange="handleCommentChange(this)">${sub.comments || ''}</textarea>
        </td>
      </tr>
    `;
  }

  // ─── Update Stats Cards ────────────────────────────────────────
  function updateStats() {
    let filtered = allSubmissions;
    if (currentBatchFilter !== 'all') {
      filtered = allSubmissions.filter(s => s.batchId === parseInt(currentBatchFilter));
    }

    const total = filtered.length;
    const graded = filtered.filter(s => s.gradeStatus && s.gradeStatus.includes('Graded')).length;
    const needsReview = filtered.filter(s => s.gradeStatus === 'Needs Review').length;
    const pending = filtered.filter(s => s.gradeStatus === 'Pending Review').length;
    
    const scores = filtered.filter(s => s.score !== null).map(s => s.score);
    const average = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '0';

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-graded').textContent = graded;
    document.getElementById('stat-needs-review').textContent = needsReview;
    document.getElementById('stat-pending').textContent = pending;
    document.getElementById('stat-average').textContent = average;
  }

  // ─── Handle Score Change ───────────────────────────────────────
  function handleScoreChange(input) {
    const submissionId = parseFloat(input.dataset.submissionId);
    const value = input.value ? parseInt(input.value) : null;
    
    // Update color based on score
    if (value !== null) {
      input.style.color = value >= 85 ? '#516353' : value >= 60 ? '#8b6508' : '#ba1a1a';
    }

    // Update localStorage
    updateSubmission(submissionId, { score: value });
  }

  // ─── Handle Status Change ───────────────────────────────────────
  function handleStatusChange(select) {
    const submissionId = parseFloat(select.dataset.submissionId);
    const status = select.value;
    const cls = select.options[select.selectedIndex].dataset.cls;
    
    select.className = `grade-select ${cls}`;
    
    // Update localStorage
    updateSubmission(submissionId, { gradeStatus: status });
    
    // Recalculate stats
    updateStats();
  }

  // ─── Handle Comment Change ─────────────────────────────────────
  function handleCommentChange(textarea) {
    const submissionId = parseFloat(textarea.dataset.submissionId);
    const comments = textarea.value;
    
    // Update localStorage
    updateSubmission(submissionId, { comments });
  }

  // ─── Init Batch Filter ─────────────────────────────────────────
  function initBatchFilter() {
    const filterSelect = document.getElementById('batch-filter');
    if (!filterSelect) return;

    filterSelect.addEventListener('change', (e) => {
      currentBatchFilter = e.target.value;
      currentPage = 1;
      renderSubmissions();
      updateStats();
    });
  }

  // ─── Init Save All Button ─────────────────────────────────────
  function initSaveAllButton() {
    const saveBtn = document.querySelector('[data-action="export"]')?.nextElementSibling;
    if (!saveBtn) return;

    saveBtn.addEventListener('click', () => {
      window.showToast('All grades saved successfully', 'success');
    });
  }

  // ─── Update Pagination ─────────────────────────────────────────
  function updatePagination(totalPages) {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;

    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let html = `
      <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
        <span class="material-symbols-outlined" style="font-size:18px;">chevron_left</span>
      </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }

    html += `
      <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
        <span class="material-symbols-outlined" style="font-size:18px;">chevron_right</span>
      </button>
    `;

    pagination.innerHTML = html;
  }

  // ─── Change Page ───────────────────────────────────────────────
  window.changePage = function (page) {
    currentPage = page;
    renderSubmissions();
  };

  // ─── Helper Functions ───────────────────────────────────────────
  function getInitials(name) {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  function getTimeAgo(isoString) {
    const now = Date.now();
    const then = new Date(isoString).getTime();
    const diff = now - then;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  function getLateHours(submittedAt, deadline) {
    if (!deadline) return 0;
    const diff = new Date(submittedAt).getTime() - deadline;
    return Math.floor(diff / 3600000);
  }

  function getStatusClass(status) {
    switch (status) {
      case 'Graded — Pass': return 'pass';
      case 'Graded — Fail': return 'fail';
      case 'Needs Review': return 'warn';
      default: return 'pending';
    }
  }

})();
