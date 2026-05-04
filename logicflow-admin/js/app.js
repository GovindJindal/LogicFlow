/* ============================================================
   LogicFlow Admin — Shared JavaScript
   ============================================================ */

(function () {
  'use strict';

  // ─── Active Navigation ─────────────────────────────────────
  function setActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      link.classList.remove('active');
      if (href === path || (path === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  // ─── Mobile Sidebar ────────────────────────────────────────
  function initSidebar() {
    const toggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (!toggle || !sidebar || !overlay) return;

    function openSidebar() {
      sidebar.classList.add('open');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', () => {
      sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });

    overlay.addEventListener('click', closeSidebar);

    // Close sidebar on nav link click (mobile)
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 768) closeSidebar();
      });
    });

    // Close on resize if desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) closeSidebar();
    });
  }

  // ─── Toast Notifications ───────────────────────────────────
  window.showToast = function (message, type = 'info', icon = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const icons = { success: 'check_circle', error: 'error', info: 'info', warning: 'warning' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="material-symbols-outlined" style="font-size:18px;flex-shrink:0">${icons[type] || 'info'}</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3100);
  };

  // ─── Search Bar Functionality ──────────────────────────────
  function initSearch() {
    const input = document.querySelector('.search-input');
    if (!input) return;

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') input.blur();
      if (e.key === 'Enter' && input.value.trim()) {
        showToast(`Searching for "${input.value}"…`, 'info');
      }
    });

    // Keyboard shortcut: Ctrl+K or /
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
        e.preventDefault();
        input.focus();
        input.select();
      }
    });
  }

  // ─── Notifications Button ─────────────────────────────────
  function initNotifications() {
    document.querySelectorAll('.btn-notification').forEach(btn => {
      btn.addEventListener('click', () => {
        showToast('No new notifications', 'info');
      });
    });
  }

  // ─── Settings Button ──────────────────────────────────────
  function initSettings() {
    document.querySelectorAll('.btn-settings').forEach(btn => {
      btn.addEventListener('click', () => {
        showToast('Settings panel coming soon', 'info');
      });
    });
  }

  // ─── Table Row Click ──────────────────────────────────────
  function initTableRows() {
    document.querySelectorAll('.data-table tbody tr[data-href]').forEach(row => {
      row.addEventListener('click', () => {
        window.location.href = row.dataset.href;
      });
    });
  }

  // ─── Filter / Sort Dropdowns ─────────────────────────────
  function initDropdowns() {
    document.querySelectorAll('[data-filter]').forEach(el => {
      el.addEventListener('change', function () {
        showToast(`Filter applied: ${this.options[this.selectedIndex].text}`, 'success');
      });
    });
  }

  // ─── Confirm Actions ─────────────────────────────────────
  window.confirmAction = function (message, callback) {
    if (window.confirm(message)) callback();
  };

  // ─── Button Actions ───────────────────────────────────────
  function initButtons() {
    // Export buttons
    document.querySelectorAll('[data-action="export"]').forEach(btn => {
      btn.addEventListener('click', () => showToast('Export started — file will download shortly', 'success'));
    });

    // Publish grades
    document.querySelectorAll('[data-action="publish"]').forEach(btn => {
      btn.addEventListener('click', () => {
        confirmAction('Publish grades to all students?', () => {
          showToast('Grades published successfully', 'success');
        });
      });
    });

    // New assignment button
    document.querySelectorAll('[data-action="new-assignment"]').forEach(btn => {
      btn.addEventListener('click', () => {
        window.location.href = 'assign-task.html';
      });
    });

    // Assign task submit
    const assignForm = document.getElementById('assign-form');
    if (assignForm) {
      assignForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Task assigned successfully! Students notified.', 'success');
      });
    }

    // Delete batch/student
    document.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        confirmAction('Are you sure you want to delete this item?', () => {
          const card = btn.closest('[data-deletable]');
          if (card) { card.style.animation = 'fadeOut 0.3s forwards'; setTimeout(() => card.remove(), 300); }
          showToast('Item deleted', 'error');
        });
      });
    });
  }

  // ─── Animate Progress Bars ────────────────────────────────
  function animateProgressBars() {
    const bars = document.querySelectorAll('.progress-fill[data-width]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          bar.style.width = bar.dataset.width;
          observer.unobserve(bar);
        }
      });
    }, { threshold: 0.3 });
    bars.forEach(bar => { bar.style.width = '0'; observer.observe(bar); });
  }

  // ─── Bar Chart Hover Data ─────────────────────────────────
  function initBarChart() {
    const bars = document.querySelectorAll('.bar-wrap');
    bars.forEach(wrap => {
      const bar = wrap.querySelector('.bar');
      if (!bar) return;
      bar.style.height = wrap.dataset.value ? wrap.dataset.value + '%' : '0';
    });
  }

  // ─── Stagger Fade-in ─────────────────────────────────────
  function initFadeIn() {
    const items = document.querySelectorAll('.stagger-item');
    items.forEach((el, i) => {
      el.style.animationDelay = `${i * 0.06}s`;
      el.classList.add('fade-in');
    });
  }

  // ─── Evaluation: Score Color ──────────────────────────────
  function initScoreInputs() {
    document.querySelectorAll('.score-input').forEach(input => {
      const update = () => {
        const val = parseInt(input.value);
        input.style.color = val >= 85 ? '#516353' : val >= 60 ? '#8b6508' : '#ba1a1a';
      };
      input.addEventListener('input', update);
      update();
    });
  }

  // ─── New Batch Modal ──────────────────────────────────────
  function initModals() {
    const modalTriggers = document.querySelectorAll('[data-modal]');
    modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const modalId = trigger.dataset.modal;
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.classList.remove('hidden');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('[role="dialog"]') || btn.closest('.modal');
        if (modal) {
          modal.classList.add('hidden');
          document.body.style.overflow = '';
        }
      });
    });
  }

  // ─── Init All ─────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
    initSidebar();
    initSearch();
    initNotifications();
    initSettings();
    initTableRows();
    initDropdowns();
    initButtons();
    animateProgressBars();
    initBarChart();
    initFadeIn();
    initScoreInputs();
    initModals();
  });

})();
