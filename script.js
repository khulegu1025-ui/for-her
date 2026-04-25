/* ══════════════════════════════════════════════
   KHULEGU & INGA — script.js
   ══════════════════════════════════════════════ */


/* ─────────────────────────────────────────────
   1. DAYS COUNTER
   ───────────────────────────────────────────── */
function updateDaysCounter() {
  // Change 2024 to 2025 if your start year is 2025
  const startDate = new Date('2025-10-16T00:00:00');
  const today     = new Date();
  const msPerDay  = 1000 * 60 * 60 * 24;
  const days      = Math.floor((today - startDate) / msPerDay);

  const el = document.getElementById('daysCount');
  if (!el) return;

  let current  = 0;
  const steps    = Math.min(days, 80);
  const increment = days / steps;
  const interval  = 1800 / steps;

  const timer = setInterval(() => {
    current += increment;
    if (current >= days) { current = days; clearInterval(timer); }
    el.textContent = Math.floor(current).toLocaleString();
  }, interval);
}


/* ─────────────────────────────────────────────
   2. LIGHTBOX for 19 photos
   ───────────────────────────────────────────── */
let lightboxPhotos = []; // will be filled from DOM
let currentIndex   = 0;

function buildPhotoList() {
  // Collect all .m-cell elements that have a data-index
  const cells = document.querySelectorAll('.m-cell[data-index]');
  lightboxPhotos = [];

  cells.forEach(cell => {
    const img = cell.querySelector('img');
    if (!img) return;
    lightboxPhotos.push({
      src:     img.src,
      alt:     img.alt,
      caption: cell.dataset.caption || ''
    });
  });
}

function openLightbox(index) {
  currentIndex = index;
  showPhoto(currentIndex);
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden'; // prevent scroll behind lightbox
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function showPhoto(index) {
  if (index < 0) index = lightboxPhotos.length - 1;
  if (index >= lightboxPhotos.length) index = 0;
  currentIndex = index;

  const photo  = lightboxPhotos[index];
  const img    = document.getElementById('lbImg');
  const counter = document.getElementById('lbCounter');

  // Fade out, swap, fade in
  img.style.opacity = '0';
  setTimeout(() => {
    img.src          = photo.src;
    img.alt          = photo.alt;
    img.style.opacity = '1';
  }, 150);

  counter.textContent = `${index + 1} of ${lightboxPhotos.length}`;
}

function setupLightbox() {
  buildPhotoList();

  // Click each photo cell to open lightbox
  document.querySelectorAll('.m-cell[data-index]').forEach(cell => {
    cell.addEventListener('click', () => {
      openLightbox(parseInt(cell.dataset.index));
    });
  });

  // Controls
  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', () => showPhoto(currentIndex - 1));
  document.getElementById('lbNext').addEventListener('click', () => showPhoto(currentIndex + 1));

  // Click backdrop to close
  document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const lb = document.getElementById('lightbox');
    if (!lb.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  showPhoto(currentIndex - 1);
    if (e.key === 'ArrowRight') showPhoto(currentIndex + 1);
    if (e.key === 'Escape')     closeLightbox();
  });

  // Touch/swipe support for mobile
  let touchStartX = 0;
  const lbEl = document.getElementById('lightbox');
  lbEl.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
  lbEl.addEventListener('touchend',   (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? showPhoto(currentIndex + 1) : showPhoto(currentIndex - 1);
    }
  });
}


/* ─────────────────────────────────────────────
   3. HEART RAIN
   ───────────────────────────────────────────── */
function createHeartRain() {
  const container = document.getElementById('heart-rain');
  if (!container) return;

  const hearts      = ['♥', '❤', '♡', '💕', '💗', '💖'];
  const total       = 42;
  const rainEnd     = 4500;

  for (let i = 0; i < total; i++) {
    const delay = Math.random() * rainEnd * 0.85;
    setTimeout(() => {
      const el       = document.createElement('span');
      el.classList.add('heart-drop');
      el.textContent  = hearts[Math.floor(Math.random() * hearts.length)];

      const size     = 13 + Math.random() * 20;
      const duration = 2.6 + Math.random() * 2.6;
      const xPos     = Math.random() * 100;

      el.style.cssText = `
        left: ${xPos}%;
        font-size: ${size}px;
        color: hsl(${10 + Math.random() * 15}, 70%, ${55 + Math.random() * 15}%);
        animation-duration: ${duration}s;
      `;
      container.appendChild(el);
      setTimeout(() => el.remove(), (duration + 0.5) * 1000);
    }, delay);
  }

  setTimeout(() => { container.style.display = 'none'; }, rainEnd + 4500);
}


/* ─────────────────────────────────────────────
   4. LETTER REVEAL
   ───────────────────────────────────────────── */
function toggleLetter(id) {
  const card   = document.getElementById(id);
  if (!card) return;
  const isOpen = card.classList.contains('open');
  document.querySelectorAll('.letter-card').forEach(c => c.classList.remove('open'));
  if (!isOpen) card.classList.add('open');
}


/* ─────────────────────────────────────────────
   5. MUSIC
   ───────────────────────────────────────────── */
function setupMusic() {
  const btn   = document.getElementById('musicBtn');
  const audio = document.getElementById('bgMusic');
  const icon  = document.getElementById('musicIcon');
  if (!btn || !audio) return;

  audio.volume  = 0.22;
  let isPlaying = false;

  btn.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      icon.textContent = '♪';
      btn.classList.remove('playing');
    } else {
      audio.play().then(() => {
        icon.textContent = '♫';
        btn.classList.add('playing');
      }).catch(() => {});
    }
    isPlaying = !isPlaying;
  });
}


/* ─────────────────────────────────────────────
   6. MOBILE NAV
   ───────────────────────────────────────────── */
function setupMobileNav() {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => links.classList.toggle('open'));
}

function closeMenu() {
  const links = document.getElementById('navLinks');
  if (links) links.classList.remove('open');
}


/* ─────────────────────────────────────────────
   7. SCROLL FADE-IN
   ───────────────────────────────────────────── */
function setupScrollFade() {
  const targets = document.querySelectorAll(
    '.chapters, .timeline-section, .gallery-section, .letters-section'
  );
  targets.forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.75s ease, transform 0.75s ease';
  });
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.07 });
  targets.forEach(el => obs.observe(el));
}


/* ─────────────────────────────────────────────
   INIT
   ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  createHeartRain();
  updateDaysCounter();
  setupLightbox();
  setupMusic();
  setupMobileNav();
  setupScrollFade();
});