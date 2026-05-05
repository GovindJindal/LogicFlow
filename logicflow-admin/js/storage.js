// ─── LOGICFLOW STORAGE UTILITIES ───────────────────────────────────────

const STORAGE_KEYS = {
  BATCHES: 'lf_batches',
  STUDENTS: 'lf_students',
  FACULTY: 'lf_faculty',
  SESSIONS: 'lf_sessions',
  SUBMISSIONS: 'lf_submissions',
  TASKS: 'lf_tasks',
  CURRENT_USER: 'lf_currentUser'
};

// ─── Initialize Storage ───────────────────────────────────────────────
function initializeStorage() {
  // Seed default faculty if not exists
  if (!localStorage.getItem(STORAGE_KEYS.FACULTY)) {
    const defaultFaculty = [{
      facultyId: 1,
      name: 'Faculty',
      email: 'faculty@chitkara.edu.in',
      password: 'CUFaculty',
      instCode: 'CHIT2026',
      protected: true,
      createdAt: new Date().toISOString()
    }];
    localStorage.setItem(STORAGE_KEYS.FACULTY, JSON.stringify(defaultFaculty));
  }

  // Initialize empty arrays if not exists
  if (!localStorage.getItem(STORAGE_KEYS.BATCHES)) {
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
  }
  if (!localStorage.getItem('lf_notifications')) {
    localStorage.setItem('lf_notifications', JSON.stringify([]));
  }
}

// ─── Generic Storage Operations ───────────────────────────────────────
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

// ─── Batch Operations ─────────────────────────────────────────────────
function getBatches() {
  return getStorage(STORAGE_KEYS.BATCHES) || [];
}

function saveBatch(batchData) {
  const batches = getBatches();
  const newBatch = {
    batchId: Date.now(),
    ...batchData,
    createdAt: new Date().toISOString()
  };
  batches.push(newBatch);
  setStorage(STORAGE_KEYS.BATCHES, batches);
  return newBatch;
}

function updateBatch(batchId, batchData) {
  const batches = getBatches();
  const index = batches.findIndex(b => b.batchId === batchId);
  if (index !== -1) {
    batches[index] = { ...batches[index], ...batchData, updatedAt: new Date().toISOString() };
    setStorage(STORAGE_KEYS.BATCHES, batches);
    return batches[index];
  }
  return null;
}

function deleteBatch(batchId) {
  const batches = getBatches();
  const filtered = batches.filter(b => b.batchId !== batchId);
  setStorage(STORAGE_KEYS.BATCHES, filtered);

  // Update students in this batch to have null batchId
  const students = getStudents();
  const updatedStudents = students.map(s => 
    s.batchId === batchId ? { ...s, batchId: null } : s
  );
  setStorage(STORAGE_KEYS.STUDENTS, updatedStudents);
}

function getBatchById(batchId) {
  const batches = getBatches();
  return batches.find(b => b.batchId === batchId) || null;
}

function getBatchStudentCount(batchId) {
  const students = getStudents();
  return students.filter(s => s.batchId === batchId).length;
}

// ─── Student Operations ───────────────────────────────────────────────
function getStudents() {
  return getStorage(STORAGE_KEYS.STUDENTS) || [];
}

function saveStudent(studentData) {
  const students = getStudents();
  const newStudent = {
    studentId: Date.now(),
    ...studentData,
    createdAt: new Date().toISOString()
  };
  students.push(newStudent);
  setStorage(STORAGE_KEYS.STUDENTS, students);
  return newStudent;
}

function updateStudent(studentId, studentData) {
  const students = getStudents();
  const index = students.findIndex(s => s.studentId === studentId);
  if (index !== -1) {
    students[index] = { ...students[index], ...studentData, updatedAt: new Date().toISOString() };
    setStorage(STORAGE_KEYS.STUDENTS, students);
    return students[index];
  }
  return null;
}

function deleteStudent(studentId) {
  const students = getStudents();
  const filtered = students.filter(s => s.studentId !== studentId);
  setStorage(STORAGE_KEYS.STUDENTS, filtered);

  // Remove student sessions
  const sessions = getSessions();
  const filteredSessions = sessions.filter(s => s.studentId !== studentId);
  setStorage(STORAGE_KEYS.SESSIONS, filteredSessions);
}

function getStudentById(studentId) {
  const students = getStudents();
  return students.find(s => s.studentId === studentId) || null;
}

function getStudentsByBatch(batchId) {
  const students = getStudents();
  return students.filter(s => s.batchId === batchId);
}

function bulkAssignStudentsToBatch(studentIds, batchId) {
  const students = getStudents();
  const updatedStudents = students.map(s => 
    studentIds.includes(s.studentId) ? { ...s, batchId } : s
  );
  setStorage(STORAGE_KEYS.STUDENTS, updatedStudents);
}

// ─── Faculty Operations ───────────────────────────────────────────────
function getFaculty() {
  return getStorage(STORAGE_KEYS.FACULTY) || [];
}

function saveFaculty(facultyData) {
  const faculty = getFaculty();
  const newFaculty = {
    facultyId: Date.now(),
    ...facultyData,
    protected: false,
    createdAt: new Date().toISOString()
  };
  faculty.push(newFaculty);
  setStorage(STORAGE_KEYS.FACULTY, faculty);
  return newFaculty;
}

function updateFaculty(facultyId, facultyData) {
  const faculty = getFaculty();
  const index = faculty.findIndex(f => f.facultyId === facultyId);
  if (index !== -1) {
    faculty[index] = { ...faculty[index], ...facultyData, updatedAt: new Date().toISOString() };
    setStorage(STORAGE_KEYS.FACULTY, faculty);
    return faculty[index];
  }
  return null;
}

function deleteFaculty(facultyId) {
  const faculty = getFaculty();
  const target = faculty.find(f => f.facultyId === facultyId);
  if (target && target.protected) {
    return { success: false, message: 'Cannot delete protected faculty account' };
  }
  const filtered = faculty.filter(f => f.facultyId !== facultyId);
  setStorage(STORAGE_KEYS.FACULTY, filtered);
  return { success: true };
}

function getFacultyById(facultyId) {
  const faculty = getFaculty();
  return faculty.find(f => f.facultyId === facultyId) || null;
}

function authenticateFaculty(email, password) {
  const faculty = getFaculty();
  return faculty.find(f => f.email === email && f.password === password) || null;
}

function authenticateStudent(email, password) {
  const students = getStudents();
  return students.find(s => s.email === email && s.password === password) || null;
}

// ─── Session/Submission Operations ───────────────────────────────────
function getSessions() {
  return getStorage(STORAGE_KEYS.SESSIONS) || [];
}

function saveSession(sessionData) {
  const sessions = getSessions();
  const newSession = {
    sessionId: Date.now(),
    ...sessionData,
    submittedAt: new Date().toISOString()
  };
  sessions.push(newSession);
  setStorage(STORAGE_KEYS.SESSIONS, sessions);
  return newSession;
}

function getSessionsByStudent(studentId) {
  const sessions = getSessions();
  return sessions.filter(s => s.studentId === studentId);
}

function getStudentProgress(studentId) {
  const sessions = getSessionsByStudent(studentId);
  const experiments = sessions.filter(s => s.type === 'experiment');
  const labs = sessions.filter(s => s.type === 'lab');
  const avgScore = labs.length > 0 
    ? labs.reduce((sum, lab) => sum + (lab.score || 0), 0) / labs.length 
    : 0;

  return {
    experimentsCompleted: experiments.length,
    labsSubmitted: labs.length,
    averageScore: Math.round(avgScore),
    totalSessions: sessions.length
  };
}

// ─── Submission Operations ───────────────────────────────────────────
function getSubmissions() {
  return getStorage(STORAGE_KEYS.SUBMISSIONS) || [];
}

function saveSubmission(submissionData) {
  const submissions = getSubmissions();
  const newSubmission = {
    submissionId: Date.now() + Math.random(),
    ...submissionData,
    submittedAt: new Date().toISOString()
  };
  submissions.push(newSubmission);
  setStorage(STORAGE_KEYS.SUBMISSIONS, submissions);
  return newSubmission;
}

function updateSubmission(submissionId, submissionData) {
  const submissions = getSubmissions();
  const index = submissions.findIndex(s => s.submissionId === submissionId);
  if (index !== -1) {
    submissions[index] = { ...submissions[index], ...submissionData, updatedAt: new Date().toISOString() };
    setStorage(STORAGE_KEYS.SUBMISSIONS, submissions);
    return submissions[index];
  }
  return null;
}

function getSubmissionsByBatch(batchId) {
  const submissions = getSubmissions();
  return submissions.filter(s => s.batchId === batchId);
}

function getSubmissionsByStudent(studentId) {
  const submissions = getSubmissions();
  return submissions.filter(s => s.studentId === studentId);
}

function getSubmissionsByTask(taskId) {
  const submissions = getSubmissions();
  return submissions.filter(s => s.taskId === taskId);
}

// ─── Task Operations ───────────────────────────────────────────────────
function getTasks() {
  return getStorage(STORAGE_KEYS.TASKS) || [];
}

function saveTask(taskData) {
  const tasks = getTasks();
  const newTask = {
    taskId: Date.now(),
    ...taskData,
    createdAt: new Date().toISOString()
  };
  tasks.push(newTask);
  setStorage(STORAGE_KEYS.TASKS, tasks);
  return newTask;
}

function updateTask(taskId, taskData) {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.taskId === taskId);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...taskData, updatedAt: new Date().toISOString() };
    setStorage(STORAGE_KEYS.TASKS, tasks);
    return tasks[index];
  }
  return null;
}

function getTasksByBatch(batchId) {
  const tasks = getTasks();
  return tasks.filter(t => t.batchId === batchId);
}

// ─── Current User Operations ───────────────────────────────────────────
function getCurrentUser() {
  return getStorage(STORAGE_KEYS.CURRENT_USER);
}

function setCurrentUser(user) {
  setStorage(STORAGE_KEYS.CURRENT_USER, user);
}

function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// ─── Auth Guard ───────────────────────────────────────────────────────
function requireAuth(allowedRole) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = '../index.html';
    return false;
  }
  if (allowedRole && user.role !== allowedRole) {
    window.location.href = '../index.html';
    return false;
  }
  return true;
}

// ─── Initialize on Load ───────────────────────────────────────────────
initializeStorage();
