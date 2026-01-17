/* ============================================
   LUMINOUS knowledge base - JavaScript
   ============================================ */

// ============================================
// パスワード設定（初期値）
// ============================================
const DEFAULT_MEMBER_PASSWORD = 'luminous2025';
const DEFAULT_ADMIN_PASSWORD = 'admin2025';

// LocalStorageキー
const STORAGE_KEYS = {
  memberPassword: 'luminous_member_password',
  adminPassword: 'luminous_admin_password',
  history: 'luminous_password_history',
  memo: 'luminous_admin_memo'
};

// 認証モード
let isAdminMode = false;
let isAdminLoggedIn = false;


// ============================================
// パスワード取得・設定
// ============================================
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


// ============================================
// DOM Elements
// ============================================
const loadingScreen = document.getElementById('loading');
const authScreen = document.getElementById('auth-screen');
const authForm = document.getElementById('auth-form');
const passwordInput = document.getElementById('password-input');
const authError = document.getElementById('auth-error');
const mainContent = document.getElementById('main-content');
const header = document.getElementById('header');
const logoutBtn = document.getElementById('logout-btn');
const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const adminLoginToggle = document.getElementById('admin-login-toggle');
const adminPanelBtn = document.getElementById('admin-panel-btn');
const mobileAdminPanelBtn = document.getElementById('mobile-admin-panel-btn');
const adminPanel = document.getElementById('admin-panel');
const adminPanelClose = document.getElementById('admin-panel-close');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');


// ============================================
// Loading Screen
// ============================================
window.addEventListener('load', () => {
  setTimeout(() => {
    loadingScreen.classList.add('fade-out');

    // Check if already authenticated
    if (sessionStorage.getItem('authenticated') === 'true') {
      isAdminLoggedIn = sessionStorage.getItem('isAdmin') === 'true';
      showMainContent();
    }
  }, 1800);
});


// ============================================
// Admin Mode Toggle
// ============================================
adminLoginToggle.addEventListener('click', () => {
  isAdminMode = !isAdminMode;

  if (isAdminMode) {
    authForm.classList.add('admin-mode');
    passwordInput.placeholder = '管理者パスワードを入力';
    adminLoginToggle.innerHTML = '<i class="fas fa-users"></i> メンバーログイン';

    // Add admin mode label
    if (!document.querySelector('.admin-mode-label')) {
      const label = document.createElement('span');
      label.className = 'admin-mode-label';
      label.textContent = '管理者モード';
      authForm.insertBefore(label, authForm.firstChild);
    }
  } else {
    authForm.classList.remove('admin-mode');
    passwordInput.placeholder = 'パスワードを入力';
    adminLoginToggle.innerHTML = '<i class="fas fa-user-shield"></i> 管理者ログイン';

    // Remove admin mode label
    const label = document.querySelector('.admin-mode-label');
    if (label) label.remove();
  }

  passwordInput.value = '';
  authError.textContent = '';
  passwordInput.focus();
});


// ============================================
// Password Authentication
// ============================================
authForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const enteredPassword = passwordInput.value;
  const correctPassword = isAdminMode ? getAdminPassword() : getMemberPassword();

  if (enteredPassword === correctPassword) {
    // Success
    sessionStorage.setItem('authenticated', 'true');
    sessionStorage.setItem('isAdmin', isAdminMode ? 'true' : 'false');
    isAdminLoggedIn = isAdminMode;

    authScreen.classList.add('fade-out');

    setTimeout(() => {
      showMainContent();
    }, 500);
  } else {
    // Error
    authError.textContent = 'パスワードが正しくありません';
    passwordInput.value = '';
    passwordInput.focus();

    // Shake animation
    authForm.style.animation = 'shake 0.5s ease';
    setTimeout(() => {
      authForm.style.animation = '';
    }, 500);
  }
});

// Shake animation keyframes
const shakeKeyframes = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
`;
const styleSheet = document.createElement('style');
styleSheet.textContent = shakeKeyframes;
document.head.appendChild(styleSheet);


// ============================================
// Show Main Content
// ============================================
function showMainContent() {
  authScreen.classList.add('fade-out');
  mainContent.classList.remove('hidden');

  // Show admin buttons if admin
  if (isAdminLoggedIn) {
    adminPanelBtn.classList.remove('hidden');
    mobileAdminPanelBtn.classList.remove('hidden');
    updateAdminPanel();
  }

  // Initialize GSAP animations
  setTimeout(() => {
    initScrollAnimations();
  }, 100);
}


// ============================================
// Logout
// ============================================
function logout() {
  sessionStorage.removeItem('authenticated');
  sessionStorage.removeItem('isAdmin');
  location.reload();
}

logoutBtn.addEventListener('click', logout);
mobileLogoutBtn.addEventListener('click', logout);


// ============================================
// Header Scroll Effect
// ============================================
window.addEventListener('scroll', () => {
  if (window.scrollY > 100) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});


// ============================================
// Mobile Menu
// ============================================
mobileMenuBtn.addEventListener('click', () => {
  mobileMenuBtn.classList.toggle('active');
  mobileMenu.classList.toggle('active');
});


// ============================================
// Admin Panel
// ============================================
function openAdminPanel() {
  adminPanel.classList.remove('hidden');
  updateAdminPanel();
  document.body.style.overflow = 'hidden';
}

function closeAdminPanel() {
  adminPanel.classList.add('hidden');
  document.body.style.overflow = '';
}

function updateAdminPanel() {
  // Update password displays
  document.getElementById('member-pw-display').value = getMemberPassword();
  document.getElementById('admin-pw-display').value = getAdminPassword();

  // Load memo
  const memo = localStorage.getItem(STORAGE_KEYS.memo) || '';
  document.getElementById('admin-memo').value = memo;

  // Render history
  renderHistory();
}

// Open panel buttons
adminPanelBtn.addEventListener('click', openAdminPanel);
mobileAdminPanelBtn.addEventListener('click', () => {
  mobileMenu.classList.remove('active');
  mobileMenuBtn.classList.remove('active');
  openAdminPanel();
});

// Close panel
adminPanelClose.addEventListener('click', closeAdminPanel);
document.querySelector('.admin-panel-overlay').addEventListener('click', closeAdminPanel);

// Close on escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !adminPanel.classList.contains('hidden')) {
    closeAdminPanel();
  }
});


// ============================================
// Password Toggle Visibility
// ============================================
document.querySelectorAll('.toggle-pw-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-target');
    const input = document.getElementById(targetId);
    const icon = btn.querySelector('i');

    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    } else {
      input.type = 'password';
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  });
});


// ============================================
// Password Update Forms
// ============================================
document.getElementById('member-pw-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const newPw = document.getElementById('new-member-pw').value.trim();

  if (newPw.length < 4) {
    showToast('4文字以上で入力してください', 'error');
    return;
  }

  setMemberPassword(newPw);
  document.getElementById('member-pw-display').value = newPw;
  document.getElementById('new-member-pw').value = '';
  showToast('メンバーパスワードを更新しました', 'success');
  renderHistory();
});

document.getElementById('admin-pw-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const newPw = document.getElementById('new-admin-pw').value.trim();

  if (newPw.length < 4) {
    showToast('4文字以上で入力してください', 'error');
    return;
  }

  setAdminPassword(newPw);
  document.getElementById('admin-pw-display').value = newPw;
  document.getElementById('new-admin-pw').value = '';
  showToast('管理者パスワードを更新しました', 'success');
  renderHistory();
});


// ============================================
// Memo
// ============================================
document.getElementById('save-memo-btn').addEventListener('click', () => {
  const memo = document.getElementById('admin-memo').value;
  localStorage.setItem(STORAGE_KEYS.memo, memo);
  showToast('メモを保存しました', 'success');
});


// ============================================
// History
// ============================================
function getHistory() {
  const history = localStorage.getItem(STORAGE_KEYS.history);
  return history ? JSON.parse(history) : [];
}

function addHistoryEntry(type, oldPassword, newPassword) {
  const history = getHistory();
  history.unshift({
    type: type,
    oldPassword: oldPassword,
    newPassword: newPassword,
    date: new Date().toISOString()
  });

  // Keep only last 50 entries
  if (history.length > 50) history.pop();

  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
}

function renderHistory() {
  const history = getHistory();
  const historyList = document.getElementById('history-list');
  const noHistory = document.getElementById('no-history');

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
          <div class="history-title">${typeLabel}PW変更</div>
          <div class="history-date">${dateStr}</div>
        </div>
      </div>
    `;
  }).join('');
}

document.getElementById('clear-history-btn').addEventListener('click', () => {
  if (confirm('変更履歴を全て削除しますか？')) {
    localStorage.removeItem(STORAGE_KEYS.history);
    renderHistory();
    showToast('履歴を削除しました', 'success');
  }
});


// ============================================
// Toast
// ============================================
function showToast(message, type = 'success') {
  toastMessage.textContent = message;
  toast.className = 'toast ' + type + ' show';

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}


// ============================================
// Accordion (Room Toggle)
// ============================================
document.querySelectorAll('.room-header').forEach(header => {
  header.addEventListener('click', () => {
    const room = header.parentElement;
    room.classList.toggle('active');
  });
});


// ============================================
// GSAP Scroll Animations
// ============================================
function initScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  gsap.from('.hero-title', {
    opacity: 0,
    y: 50,
    duration: 1,
    delay: 0.3,
    ease: 'power3.out'
  });

  gsap.from('.hero-subtitle', {
    opacity: 0,
    y: 30,
    duration: 1,
    delay: 0.6,
    ease: 'power3.out'
  });

  gsap.from('.scroll-indicator', {
    opacity: 0,
    duration: 1,
    delay: 1.2,
    ease: 'power3.out'
  });

  gsap.utils.toArray('.room').forEach((room, index) => {
    gsap.from(room, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      delay: index * 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: room,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  document.querySelectorAll('.room-header').forEach(header => {
    header.addEventListener('click', () => {
      const room = header.parentElement;

      if (!room.classList.contains('animated')) {
        const cards = room.querySelectorAll('.card');

        gsap.from(cards, {
          opacity: 0,
          y: 30,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 0.2
        });

        room.classList.add('animated');
      }
    });
  });
}


// ============================================
// Smooth Scroll
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));

    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});
