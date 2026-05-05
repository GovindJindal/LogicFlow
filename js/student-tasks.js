(function () {
  const SESSION_KEY = 'logicflow_session';
  const SUBMISSIONS_KEY = 'lf_submissions';
  const TASKS_KEY = 'lf_tasks';
  const CURRENT_USER_KEY = 'lf_currentUser';
  const STUDENTS_KEY = 'lf_students';
  const BATCHES_KEY = 'lf_batches';
  const NOTIFICATIONS_KEY = 'lf_notifications';
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

  function getPriorityColor(priority) {
    switch (priority) {
      case 'low': return '#394b3c';
      case 'medium': return '#334042';
      case 'high': return '#ba1a1a';
      default: return '#737879';
    }
  }

  function getPriorityBadge(priority) {
    switch (priority) {
      case 'low': return 'Low priority';
      case 'medium': return 'Medium priority';
      case 'high': return 'High priority';
      default: return 'Normal';
    }
  }

  function formatDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function isTaskSubmitted(taskId, studentId) {
    const submissions = getStorage(SUBMISSIONS_KEY) || [];
    return submissions.some(s => s.taskId === taskId && s.studentId === studentId);
  }

  function loadTasks() {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.studentId) {
      showNoTasks();
      return;
    }

    const tasks = getStorage(TASKS_KEY) || [];
    const students = getStorage(STUDENTS_KEY) || [];
    const student = students.find(s => s.studentId === currentUser.studentId);

    // Filter tasks for this student
    const myTasks = tasks.filter(task => {
      if (task.assignmentType === 'batch') {
        return task.targetId === (student?.batchId || currentUser.batchId);
      } else if (task.assignmentType === 'individual') {
        return task.targetId === currentUser.studentId;
      }
      return false;
    });

    if (myTasks.length === 0) {
      showNoTasks();
      return;
    }

    renderTasks(myTasks, currentUser.studentId);
  }

  function showNoTasks() {
    const taskStack = document.getElementById('task-stack');
    const noTasks = document.getElementById('no-tasks');
    if (taskStack) taskStack.innerHTML = '';
    if (noTasks) noTasks.style.display = 'block';
  }

  function renderTasks(tasks, studentId) {
    const taskStack = document.getElementById('task-stack');
    const noTasks = document.getElementById('no-tasks');
    if (!taskStack) return;

    noTasks.style.display = 'none';

    taskStack.innerHTML = tasks.map(task => {
      const submitted = isTaskSubmitted(task.taskId, studentId);
      const priorityColor = getPriorityColor(task.priority);
      const priorityBadge = getPriorityBadge(task.priority);
      const deadline = formatDate(task.deadline);
      const expNum = task.experimentName.match(/^\d+/)?.[0] || '';

      return `
        <article class="st-task-card">
          <div class="st-task-top">
            <h3>${escapeHtml(task.experimentName)}</h3>
            <span class="st-pill st-pill--lab">Lab</span>
          </div>
          <div class="st-task-meta">
            <div>
              <span class="st-meta-k">Due</span>
              <span class="st-meta-v">${deadline}</span>
            </div>
            <div>
              <span class="st-meta-k">Assigned by</span>
              <span class="st-meta-v">${escapeHtml(task.assignedBy)}</span>
            </div>
          </div>
          <div class="st-progress-wrap">
            <div class="st-progress-track" role="progressbar" aria-valuenow="${submitted ? 100 : 0}" aria-valuemin="0" aria-valuemax="100">
              <div class="st-progress-fill" style="width: ${submitted ? '100' : '0'}%" data-width="${submitted ? 100 : 0}"></div>
            </div>
            <span class="st-progress-pct">${submitted ? '100' : '0'}%</span>
          </div>
          <span class="st-pill st-pill--priority" style="color:${priorityColor};">${priorityBadge}</span>
          ${task.instructions ? `<div style="font-size:12px;color:#737879;margin-top:8px;font-family:'Space Grotesk',sans-serif;">${escapeHtml(task.instructions)}</div>` : ''}
          <div class="st-task-actions">
            <a href="${task.experimentUrl}" class="st-btn st-btn--primary">Open experiment</a>
            ${submitted 
              ? `<button type="button" class="st-btn st-btn--ghost" disabled style="background:#d3e8d4;color:#394b3c;cursor:default;">Submitted ✓</button>`
              : `<button type="button" class="st-btn st-btn--ghost st-btn--submit" data-task-id="${task.taskId}" data-task-title="${escapeHtml(task.experimentName)}" data-deadline="${task.deadline}">Submit Task</button>`
            }
          </div>
        </article>
      `;
    }).join('');

    // Re-initialize submit buttons
    initSubmitButtons();
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

    // Reload tasks to update UI
    loadTasks();

    // Show success message
    alert('Submission received!');
  }

  function initSubmitButtons() {
    document.querySelectorAll('.st-btn--submit').forEach(button => {
      button.addEventListener('click', () => handleTaskSubmit(button));
    });
  }

  function checkNotifications() {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.studentId) return;

    const notifications = getStorage(NOTIFICATIONS_KEY) || [];
    const unseen = notifications.filter(n => 
      !n.seen && n.studentIds.includes(currentUser.studentId)
    );

    if (unseen.length > 0) {
      // Show notification toast
      const notification = unseen[0];
      showToast(`New task assigned: ${notification.message} — Due ${formatDate(notification.message.match(/Due: ([^—]+)/)?.[1] || 'soon')}`, 'info');

      // Mark as seen
      notification.seen = true;
      setStorage(NOTIFICATIONS_KEY, notifications);
    }
  }

  function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'info' ? '#4a5759' : '#516353'};
      color: #fff;
      padding: 16px 24px;
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      z-index: 10000;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 14px;
      animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Remove after 5 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
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
    loadTasks();
    checkNotifications();
  });
})();
