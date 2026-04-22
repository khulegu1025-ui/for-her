/* ══════════════════════════════════════════════
   KHULEGU & INGA — script.js
   ══════════════════════════════════════════════ */


/* ─────────────────────────────────────────────
   1. DAYS COUNTER
   Change the year if needed (2024 or 2025)
   ───────────────────────────────────────────── */
function updateDaysCounter() {
  // ← Change the year here if your start date is different!
  const startDate = new Date('2024-10-16T00:00:00');
  const today     = new Date();

  // Calculate difference in full days
  const msPerDay  = 1000 * 60 * 60 * 24;
  const days      = Math.floor((today - startDate) / msPerDay);

  // Animate the counter counting up
  const el = document.getElementById('daysCount');
  if (!el) return;

  let current = 0;
  const duration = 1800;              // animation time in ms
  const steps    = Math.min(days, 80); // number of frames
  const increment = days / steps;
  const interval  = duration / steps;

  const timer = setInterval(() => {
    current += increment;
    if (current >= days) {
      current = days;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current).toLocaleString();
  }, interval);
}


/* ─────────────────────────────────────────────
   2. HEART RAIN
   Creates falling hearts on page load
   ───────────────────────────────────────────── */
function createHeartRain() {
  const container = document.getElementById('heart-rain');
  if (!container) return;

  const hearts    = ['♥', '❤', '♡', '💕', '💗'];
  const totalHearts = 38;   // how many hearts fall
  const rainDuration = 4200; // ms — how long the effect lasts

  for (let i = 0; i < totalHearts; i++) {
    const delay = Math.random() * rainDuration * 0.85; // stagger start times

    setTimeout(() => {
      const heart = document.createElement('span');
      heart.classList.add('heart-drop');
      heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];

      // Random position, size, speed
      const xPos     = Math.random() * 100;    // % from left
      const size     = 14 + Math.random() * 18; // px
      const duration = 2.8 + Math.random() * 2.4; // seconds to fall

      heart.style.cssText = `
        left: ${xPos}%;
        font-size: ${size}px;
        animation-duration: ${duration}s;
        animation-delay: 0s;
        opacity: 0;
      `;

      container.appendChild(heart);

      // Remove heart from DOM after it finishes falling
      setTimeout(() => {
        heart.remove();
      }, (duration + 0.5) * 1000);

    }, delay);
  }

  // Fully stop the rain container after everything is done
  setTimeout(() => {
    container.style.display = 'none';
  }, rainDuration + 4000);
}


/* ─────────────────────────────────────────────
   3. LETTER REVEAL TOGGLE
   ───────────────────────────────────────────── */
function toggleLetter(id) {
  const card = document.getElementById(id);
  if (!card) return;

  const isOpen = card.classList.contains('open');

  // Close all other letters first
  document.querySelectorAll('.letter-card').forEach(c => {
    c.classList.remove('open');
  });

  // Toggle the clicked one
  if (!isOpen) {
    card.classList.add('open');
  }
}


/* ─────────────────────────────────────────────
   4. BACKGROUND MUSIC TOGGLE
   ───────────────────────────────────────────── */
function setupMusic() {
  const btn   = document.getElementById('musicBtn');
  const audio = document.getElementById('bgMusic');
  const icon  = document.getElementById('musicIcon');

  if (!btn || !audio) return;

  // Set initial volume low so it's gentle
  audio.volume = 0.25;

  let isPlaying = false;

  btn.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      icon.textContent = '♪';
      btn.classList.remove('playing');
      btn.title = 'Play music';
    } else {
      audio.play().then(() => {
        icon.textContent = '♫';
        btn.classList.add('playing');
        btn.title = 'Pause music';
      }).catch(() => {
        // If browser blocks autoplay, show a friendly note
        console.log('Music ready — click the ♪ button to play');
      });
    }
    isPlaying = !isPlaying;
  });
}


/* ─────────────────────────────────────────────
   5. MOBILE NAV TOGGLE
   ───────────────────────────────────────────── */
function setupMobileNav() {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
  });
}

// Called by onclick on each nav link (closes menu after tap)
function closeMenu() {
  const links = document.getElementById('navLinks');
  if (links) links.classList.remove('open');
}


/* ─────────────────────────────────────────────
   6. SCROLL FADE-IN for sections
   Sections gently appear as you scroll down
   ───────────────────────────────────────────── */
function setupScrollFade() {
  const sections = document.querySelectorAll(
    '.chapters, .timeline-section, .gallery-section, .letters-section'
  );

  // Add initial invisible state
  sections.forEach(s => {
    s.style.opacity = '0';
    s.style.transform = 'translateY(22px)';
    s.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target); // animate only once
      }
    });
  }, { threshold: 0.08 });

  sections.forEach(s => observer.observe(s));
}


/* ─────────────────────────────────────────────
   INIT — run everything when page loads
   ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  createHeartRain();    // falling hearts effect
  updateDaysCounter();  // animated day counter
  setupMusic();         // music button
  setupMobileNav();     // hamburger menu
  setupScrollFade();    // scroll reveal
});