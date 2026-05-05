(function () {
  const SESSION_KEY = 'logicflow_session';
  const SUBMISSIONS_KEY = 'lf_submissions';
  const CURRENT_USER_KEY = 'lf_currentUser';
  const STUDENTS_KEY = 'lf_students';
  const BATCHES_KEY = 'lf_batches';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function getStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error(`Error reading ${key}:`, e);
      return null;
    }
  }

  function setStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error(`Error writing ${key}:`, e);
      return false;
    }
  }

  function getCurrentUser() {
    return getStorage(CURRENT_USER_KEY);
  }

  function getInitials(name) {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  function handleTaskSubmit(button) {
    const taskId = button.dataset.taskId;
    const taskTitle = button.dataset.taskTitle;
    const deadline = button.dataset.deadline ? new Date(button.dataset.deadline).getTime() : null;
    
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.studentId) {
      alert('Please sign in to submit tasks.');
      return;
    }

    // Check if already submitted
    const submissions = getStorage(SUBMISSIONS_KEY) || [];
    const alreadySubmitted = submissions.find(s => s.studentId === currentUser.studentId && s.taskId === taskId);
    if (alreadySubmitted) {
      alert('You have already submitted this task.');
      return;
    }

    // Get student details
    const students = getStorage(STUDENTS_KEY) || [];
    const student = students.find(s => s.studentId === currentUser.studentId);
    
    // Get batch details
    const batches = getStorage(BATCHES_KEY) || [];
    const batch = batches.find(b => b.batchId === (student?.batchId || currentUser.batchId));

    // Check if late
    const isLate = deadline && Date.now() > deadline;

    // Build submission object
    const submission = {
      submissionId: Date.now() + Math.random(),
      studentId: currentUser.studentId,
      studentName: currentUser.name || student?.name || 'Student',
      studentInitials: getInitials(currentUser.name || student?.name),
      rollNo: student?.rollNo || 'N/A',
      batchId: student?.batchId || currentUser.batchId || null,
      batchName: batch?.batchName || 'Unknown',
      taskTitle: taskTitle,
      taskId: taskId,
      submittedAt: new Date().toISOString(),
      deadline: deadline,
      isLate: isLate,
      score: null,
      gradeStatus: 'Pending Review',
      comments: ''
    };

    // Save to localStorage
    submissions.push(submission);
    setStorage(SUBMISSIONS_KEY, submissions);

    // Update UI
    button.textContent = 'Submitted ✓';
    button.disabled = true;
    button.style.background = '#d3e8d4';
    button.style.color = '#394b3c';
    button.style.borderColor = '#b8ccb9';

    // Show success message
    alert('Submission received!');
  }

  function initSubmitButtons() {
    document.querySelectorAll('.st-btn--submit').forEach(button => {
      button.addEventListener('click', () => handleTaskSubmit(button));
    });
  }

  function applyProfile() {
    const role = sessionStorage.getItem(SESSION_KEY);
    const display = sessionStorage.getItem('logicflow_student_display');
    const email = sessionStorage.getItem('logicflow_student_email');
    const nameEl = document.getElementById('stDisplayName');
    const subEl = document.getElementById('stSubtitle');
    const av = document.getElementById('stAvatar');

    if (nameEl) {
      nameEl.textContent = display || (role === 'student' ? 'Student' : 'Student');
    }

    if (subEl) {
      if (role === 'student' && email) {
        subEl.innerHTML = `University session · <span class="st-email-hint">${escapeHtml(email)}</span>`;
      } else {
        subEl.textContent =
          'Electronics lab · Sign in as a university student on the home page to show your name and email here.';
      }
    }

    if (av) {
      const base = display || 'S';
      av.textContent = base.charAt(0).toUpperCase();
    }
  }

  const role = sessionStorage.getItem(SESSION_KEY);
  const demoParam = new URLSearchParams(window.location.search).get('demo');
  const banner = document.getElementById('stPreviewBanner');
  if (banner && role !== 'student' && demoParam !== '1') {
    banner.hidden = false;
  }

  function animateMetric() {
    const el = document.getElementById('stOverallPct');
    if (!el) return;
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    if (prefersReducedMotion) {
      el.textContent = String(target);
      return;
    }
    const start = performance.now();
    const dur = 900;
    function frame(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(eased * target));
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function fillProgressBars() {
    document.querySelectorAll('.st-progress-fill[data-width]').forEach((bar) => {
      const w = bar.getAttribute('data-width');
      const apply = () => {
        bar.style.width = `${w}%`;
      };
      if (prefersReducedMotion) {
        apply();
        return;
      }
      const row = bar.closest('.st-task-card');
      if (!row || !('IntersectionObserver' in window)) {
        apply();
        return;
      }
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              apply();
              io.disconnect();
            }
          });
        },
        { threshold: 0.2 }
      );
      io.observe(row);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyProfile();
    animateMetric();
    fillProgressBars();
    initSubmitButtons();
  });
})();
