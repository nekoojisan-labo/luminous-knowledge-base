/* ============================================
   LUMINOUS knowledge base - Admin JavaScript
   ============================================ */

// ============================================
// 初期パスワード設定
// ============================================
const DEFAULT_MEMBER_PASSWORD = 'luminous2025';
const DEFAULT_ADMIN_PASSWORD = 'admin2025';

// LocalStorage キー
const STORAGE_KEYS = {
  memberPassword: 'luminous_member_password',
  adminPassword: 'luminous_admin_password',
  history: 'luminous_password_history',
  memo: 'luminous_admin_memo',
  adminAuth: 'luminous_admin_authenticated'
};


// ============================================
// DOM Elements
// ============================================
const adminAuth = document.getElementById('admin-auth');
const adminAuthForm = document.getElementById('admin-auth-form');
const adminPasswordInput = document.getElementById('admin-password-input');
const adminAuthError = document.getElementById('admin-auth-error');
const adminDashboard = document.getElementById('admin-dashboard');
const adminLogout = document.getElementById('admin-logout');

const memberPasswordDisplay = document.getElementById('member-password-display');
const adminPasswordDisplay = document.getElementById('admin-password-display');
const memberPasswordForm = document.getElementById('member-password-form');
const adminPasswordForm = document.getElementById('admin-password-form');
const newMemberPassword = document.getElementById('new-member-password');
const newAdminPassword = document.getElementById('new-admin-password');

const adminMemo = document.getElementById('admin-memo');
const saveMemoBtn = document.getElementById('save-memo');
const memoStatus = document.getElementById('memo-status');

const historyList = document.getElementById('history-list');
const noHistory = document.getElementById('no-history');
const clearHistoryBtn = document.getElementById('clear-history');
const resetAllBtn = document.getElementById('reset-all');

const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');


// ============================================
// Initialize
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Check if already authenticated
  if (sessionStorage.getItem(STORAGE_KEYS.adminAuth) === 'true') {
    showDashboard();
  }

  initializePasswords();
  loadMemo();
  renderHistory();
  setupEventListeners();
});


// ============================================
// Password Management
// ============================================
function initializePasswords() {
  // Set default passwords if not exists
  if (!localStorage.getItem(STORAGE_KEYS.memberPassword)) {
    localStorage.setItem(STORAGE_KEYS.memberPassword, DEFAULT_MEMBER_PASSWORD);
  }
  if (!localStorage.getItem(STORAGE_KEYS.adminPassword)) {
    localStorage.setItem(STORAGE_KEYS.adminPassword, DEFAULT_ADMIN_PASSWORD);
  }
}

function getMemberPassword() {
  return localStorage.getItem(STORAGE_KEYS.memberPassword) || DEFAULT_MEMBER_PASSWORD;
}

function getAdminPassword() {
  return localStorage.getItem(STORAGE_KEYS.adminPassword) || DEFAULT_ADMIN_PASSWORD;
}

function setMemberPassword(newPassword) {
  const oldPassword = getMemberPassword();
  localStorage.setItem(STORAGE_KEYS.memberPassword, newPassword);
  addHistoryEntry('member', oldPassword, newPassword);
}

function setAdminPassword(newPassword) {
  const oldPassword = getAdminPassword();
  localStorage.setItem(STORAGE_KEYS.adminPassword, newPassword);
  addHistoryEntry('admin', oldPassword, newPassword);
}

function updatePasswordDisplays() {
  memberPasswordDisplay.value = getMemberPassword();
  adminPasswordDisplay.value = getAdminPassword();
}


// ============================================
// History Management
// ============================================
function getHistory() {
  const history = localStorage.getItem(STORAGE_KEYS.history);
  return history ? JSON.parse(history) : [];
}

function addHistoryEntry(type, oldPassword, newPassword) {
  const history = getHistory();
  const entry = {
    type: type,
    oldPassword: oldPassword,
    newPassword: newPassword,
    date: new Date().toISOString()
  };
  history.unshift(entry);

  // Keep only last 50 entries
  if (history.length > 50) {
    history.pop();
  }

  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = getHistory();

  if (history.length === 0) {
    historyList.innerHTML = '';
    noHistory.style.display = 'block';
    return;
  }

  noHistory.style.display = 'none';

  historyList.innerHTML = history.map(entry => {
    const date = new Date(entry.date);
    const dateStr = date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    const typeLabel = entry.type === 'member' ? 'メンバー' : '管理者';
    const iconClass = entry.type === 'member' ? 'member' : 'admin';
    const icon = entry.type === 'member' ? 'fa-users' : 'fa-user-shield';

    return `
      <div class="history-item">
        <div class="history-icon ${iconClass}">
          <i class="fas ${icon}"></i>
        </div>
        <div class="history-content">
          <div class="history-title">${typeLabel}パスワードを変更</div>
          <div class="history-date">${dateStr}</div>
        </div>
      </div>
    `;
  }).join('');
}

function clearHistory() {
  if (confirm('変更履歴を全て削除しますか？')) {
    localStorage.removeItem(STORAGE_KEYS.history);
    renderHistory();
    showToast('履歴を削除しました', 'success');
  }
}


// ============================================
// Memo Management
// ============================================
function loadMemo() {
  const memo = localStorage.getItem(STORAGE_KEYS.memo);
  if (memo) {
    adminMemo.value = memo;
  }
}

function saveMemo() {
  localStorage.setItem(STORAGE_KEYS.memo, adminMemo.value);
  memoStatus.textContent = '保存しました';
  showToast('メモを保存しました', 'success');

  setTimeout(() => {
    memoStatus.textContent = '';
  }, 3000);
}


// ============================================
// Authentication
// ============================================
function handleAdminLogin(e) {
  e.preventDefault();

  const enteredPassword = adminPasswordInput.value;
  const correctPassword = getAdminPassword();

  if (enteredPassword === correctPassword) {
    sessionStorage.setItem(STORAGE_KEYS.adminAuth, 'true');
    showDashboard();
  } else {
    adminAuthError.textContent = 'パスワードが正しくありません';
    adminPasswordInput.value = '';
    adminPasswordInput.focus();

    // Shake animation
    adminAuthForm.style.animation = 'shake 0.5s ease';
    setTimeout(() => {
      adminAuthForm.style.animation = '';
    }, 500);
  }
}

function showDashboard() {
  adminAuth.classList.add('fade-out');
  adminDashboard.classList.remove('hidden');
  updatePasswordDisplays();
}

function handleLogout() {
  sessionStorage.removeItem(STORAGE_KEYS.adminAuth);
  location.reload();
}


// ============================================
// Reset All
// ============================================
function resetAll() {
  if (confirm('全ての設定を初期状態に戻しますか？\n（パスワード、履歴、メモが削除されます）')) {
    localStorage.removeItem(STORAGE_KEYS.memberPassword);
    localStorage.removeItem(STORAGE_KEYS.adminPassword);
    localStorage.removeItem(STORAGE_KEYS.history);
    localStorage.removeItem(STORAGE_KEYS.memo);

    initializePasswords();
    updatePasswordDisplays();
    loadMemo();
    renderHistory();

    showToast('初期状態にリセットしました', 'success');
  }
}


// ============================================
// Toast Notification
// ============================================
function showToast(message, type = 'success') {
  toastMessage.textContent = message;
  toast.className = 'toast ' + type + ' show';

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}


// ============================================
// Toggle Password Visibility
// ============================================
function togglePasswordVisibility(targetId) {
  const input = document.getElementById(targetId);
  const button = document.querySelector(`[data-target="${targetId}"]`);
  const icon = button.querySelector('i');

  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}


// ============================================
// Event Listeners
// ============================================
function setupEventListeners() {
  // Admin login
  adminAuthForm.addEventListener('submit', handleAdminLogin);

  // Logout
  adminLogout.addEventListener('click', handleLogout);

  // Member password update
  memberPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newPass = newMemberPassword.value.trim();

    if (newPass.length < 4) {
      showToast('パスワードは4文字以上にしてください', 'error');
      return;
    }

    setMemberPassword(newPass);
    updatePasswordDisplays();
    newMemberPassword.value = '';
    showToast('メンバーパスワードを更新しました', 'success');
  });

  // Admin password update
  adminPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newPass = newAdminPassword.value.trim();

    if (newPass.length < 4) {
      showToast('パスワードは4文字以上にしてください', 'error');
      return;
    }

    setAdminPassword(newPass);
    updatePasswordDisplays();
    newAdminPassword.value = '';
    showToast('管理者パスワードを更新しました', 'success');
  });

  // Toggle visibility buttons
  document.querySelectorAll('.toggle-visibility').forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      togglePasswordVisibility(targetId);
    });
  });

  // Save memo
  saveMemoBtn.addEventListener('click', saveMemo);

  // Clear history
  clearHistoryBtn.addEventListener('click', clearHistory);

  // Reset all
  resetAllBtn.addEventListener('click', resetAll);
}
