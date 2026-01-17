/* ============================================
   LUMINOUS knowledge base - JavaScript
   ============================================ */

// ============================================
// パスワード設定
// ※管理者ページから変更可能（LocalStorageに保存）
// ※LocalStorageにない場合はこの初期値を使用
// ============================================
const DEFAULT_PASSWORD = 'luminous2025';
const STORAGE_KEY = 'luminous_member_password';

// パスワードを取得（LocalStorage優先）
function getSitePassword() {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_PASSWORD;
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


// ============================================
// Loading Screen
// ============================================
window.addEventListener('load', () => {
  setTimeout(() => {
    loadingScreen.classList.add('fade-out');

    // Check if already authenticated
    if (sessionStorage.getItem('authenticated') === 'true') {
      showMainContent();
    }
  }, 1800);
});


// ============================================
// Password Authentication
// ============================================
authForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const enteredPassword = passwordInput.value;
  const correctPassword = getSitePassword();

  if (enteredPassword === correctPassword) {
    // Success
    sessionStorage.setItem('authenticated', 'true');
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

// Shake animation keyframes (add dynamically)
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

  // Initialize GSAP animations after content is visible
  setTimeout(() => {
    initScrollAnimations();
  }, 100);
}


// ============================================
// Logout
// ============================================
function logout() {
  sessionStorage.removeItem('authenticated');
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
// Accordion (Room Toggle)
// ============================================
document.querySelectorAll('.room-header').forEach(header => {
  header.addEventListener('click', () => {
    const room = header.parentElement;

    // Close other rooms (optional - remove if you want multiple open)
    // document.querySelectorAll('.room').forEach(r => {
    //   if (r !== room) r.classList.remove('active');
    // });

    // Toggle current room
    room.classList.toggle('active');
  });
});


// ============================================
// GSAP Scroll Animations
// ============================================
function initScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // Hero content animation
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

  // Room animations
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

  // Card animations (when room is opened)
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
// Smooth Scroll for Anchor Links
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
