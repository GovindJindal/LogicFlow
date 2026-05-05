/**
 * Shared app chrome: Experiments dropdown, student-only "My tasks", current-page nav highlight.
 * Skips landing (nav.site-nav) — index.js owns that shell.
 */
(function () {
  const SESSION_KEY = 'logicflow_session';

  function pageFile() {
    const seg = (window.location.pathname.split('/').pop() || '').toLowerCase();
    return seg || 'index.html';
  }

  function initDropdown() {
    const expBtn = document.getElementById('experimentDropdownBtn');
    const expDropdown = document.getElementById('experimentDropdown');
    if (!expBtn || !expDropdown) return;
    expBtn.addEventListener('click', (e) => {
      e.preventDefault();
      expDropdown.classList.toggle('show');
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown')) expDropdown.classList.remove('show');
    });
    // Close dropdown instantly on experiment link click
    expDropdown.querySelectorAll('a[href]').forEach((link) => {
      link.addEventListener('click', () => {
        expDropdown.classList.remove('show');
      });
    });
  }

  function isAuthed() {
    const role = sessionStorage.getItem(SESSION_KEY);
    return role === 'guest' || role === 'student' || role === 'faculty';
  }

  function syncSignOutButton() {
    const btn = document.getElementById('btnSignOut');
    if (!btn) return;
    btn.hidden = !isAuthed();
  }

  function initSignOut() {
    const btn = document.getElementById('btnSignOut');
    if (!btn || btn.dataset.lfBound === '1') return;
    btn.dataset.lfBound = '1';
    btn.addEventListener('click', () => {
      localStorage.removeItem('lf_currentUser');
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem('logicflow_student_email');
      sessionStorage.removeItem('logicflow_student_display');
      window.location.href = 'index.html';
    });
  }

  function syncStudentNavItem() {
    const tasksItem = document.getElementById('navTasksItem');
    if (!tasksItem) return;
    const role = sessionStorage.getItem(SESSION_KEY);
    tasksItem.hidden = role !== 'student';
  }

  function highlightCurrentNav() {
    const file = pageFile();
    const nav = document.querySelector('nav:not(.site-nav)');
    if (!nav) return;

    nav.querySelectorAll('.nav-links a[href]').forEach((a) => {
      a.classList.remove('active');
      a.removeAttribute('aria-current');
    });
    nav.querySelectorAll('.dropdown-menu a[href]').forEach((a) => {
      a.classList.remove('active');
    });
    const trigger = document.getElementById('experimentDropdownBtn');
    if (trigger) trigger.classList.remove('active');

    const topLinks = nav.querySelectorAll('.nav-links > li > a[href]');
    topLinks.forEach((a) => {
      const href = (a.getAttribute('href') || '').trim();
      if (!href || href === '#' || href.startsWith('#')) return;
      const target = href.split('/').pop().toLowerCase();
      if (target === file) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
    });

    let matchedExperiment = false;
    nav.querySelectorAll('.dropdown-menu a[href]').forEach((a) => {
      const href = (a.getAttribute('href') || '').trim();
      if (!href) return;
      const target = href.split('/').pop().toLowerCase();
      if (target === file) {
        a.classList.add('active');
        matchedExperiment = true;
      }
    });
    if (matchedExperiment && trigger) {
      trigger.classList.add('active');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('nav.site-nav')) return;
    initDropdown();
    syncSignOutButton();
    initSignOut();
    syncStudentNavItem();
    highlightCurrentNav();
  });
})();
