/* ══════════════════════════════════════════════
   KHULEGU & INGA — script.js
   ══════════════════════════════════════════════ */


/* ─────────────────────────────────────────────
   1. DAYS COUNTER
   ───────────────────────────────────────────── */
function updateDaysCounter() {
  const startDate = new Date('2025-10-16T00:00:00');
  const today     = new Date();
  const msPerDay  = 1000 * 60 * 60 * 24;
  const days      = Math.floor((today - startDate) / msPerDay);

  const el = document.getElementById('daysCount');
  if (!el) return;

  let current     = 0;
  const steps     = Math.min(days, 80);
  const increment = days / steps;
  const interval  = 1800 / steps;

  const timer = setInterval(() => {
    current += increment;
    if (current >= days) { current = days; clearInterval(timer); }
    el.textContent = Math.floor(current).toLocaleString();
  }, interval);
}


/* ─────────────────────────────────────────────
   2. LIGHTBOX
   Handles both mosaic (.m-cell) and polaroid (.polaroid)
   ───────────────────────────────────────────── */
let lightboxPhotos = [];
let currentIndex   = 0;

function buildPhotoList() {
  lightboxPhotos = [];

  // --- First 19: mosaic cells ---
  document.querySelectorAll('.m-cell[data-index]').forEach(cell => {
    const img = cell.querySelector('img');
    if (!img) return;
    lightboxPhotos[parseInt(cell.dataset.index)] = {
      src:     img.src,
      alt:     img.alt,
      caption: cell.dataset.caption || ''
    };
  });

  // --- Next 20: polaroid cells (indices 19–38) ---
  document.querySelectorAll('.polaroid[data-index]').forEach(cell => {
    const img = cell.querySelector('img');
    if (!img) return;
    lightboxPhotos[parseInt(cell.dataset.index)] = {
      src:     img.src,
      alt:     img.alt,
      caption: cell.querySelector('.polaroid-caption')?.textContent || ''
    };
  });

  // remove any gaps (undefined slots)
  lightboxPhotos = lightboxPhotos.filter(Boolean);
}

function openLightbox(index) {
  currentIndex = index;
  showPhoto(currentIndex);
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function showPhoto(index) {
  if (index < 0) index = lightboxPhotos.length - 1;
  if (index >= lightboxPhotos.length) index = 0;
  currentIndex = index;

  const photo   = lightboxPhotos[index];
  const img     = document.getElementById('lbImg');
  const counter = document.getElementById('lbCounter');

  img.style.opacity = '0';
  setTimeout(() => {
    img.src           = photo.src;
    img.alt           = photo.alt;
    img.style.opacity = '1';
  }, 150);

  counter.textContent = `${index + 1} of ${lightboxPhotos.length}`;
}

function setupLightbox() {
  buildPhotoList();

  // mosaic cells
  document.querySelectorAll('.m-cell[data-index]').forEach(cell => {
    cell.addEventListener('click', () => openLightbox(parseInt(cell.dataset.index)));
  });

  // polaroid cells
  document.querySelectorAll('.polaroid[data-index]').forEach(cell => {
    cell.addEventListener('click', () => openLightbox(parseInt(cell.dataset.index)));
  });

  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', () => showPhoto(currentIndex - 1));
  document.getElementById('lbNext').addEventListener('click', () => showPhoto(currentIndex + 1));

  document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('lightbox').classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  showPhoto(currentIndex - 1);
    if (e.key === 'ArrowRight') showPhoto(currentIndex + 1);
    if (e.key === 'Escape')     closeLightbox();
  });

  // swipe on mobile
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

  const hearts  = ['♥', '❤', '♡', '💕', '💗', '💖'];
  const total   = 42;
  const rainEnd = 4500;

  for (let i = 0; i < total; i++) {
    const delay = Math.random() * rainEnd * 0.85;
    setTimeout(() => {
      const el      = document.createElement('span');
      el.classList.add('heart-drop');
      el.textContent = hearts[Math.floor(Math.random() * hearts.length)];

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
   5. CD PLAYER — two songs, spinning disc
   ─────────────────────────────────────────────
   Files needed in your project folder:
     song.mp3   ← song 1
     song2.mp3  ← song 2
   ─────────────────────────────────────────────*/
function setupCDPlayer() {
  const btn      = document.getElementById('musicBtn');
  const icon     = document.getElementById('musicIcon');
  const cdPop    = document.getElementById('cdPop');
  const cdDisc   = document.getElementById('cdDisc');
  const songName = document.getElementById('cdSongName');

  const audios = [
    document.getElementById('bgMusic'),   // song.mp3
    document.getElementById('bgMusic2')   // song2.mp3
  ];

  // Give your songs nice display names here:
  const songNames = ['Song 1', 'Song 2'];

  let isPlaying    = false;
  let currentSong  = 0;   // 0 or 1

  // set volume low for both
  audios.forEach(a => { if (a) a.volume = 0.22; });

  function getAudio(i) { return audios[i]; }
  function getCurrentAudio() { return getAudio(currentSong); }

  function startPlaying() {
    getCurrentAudio().play().then(() => {
      isPlaying = true;
      icon.textContent = '‖';          // pause icon on button
      cdDisc.classList.add('spinning'); // spin the CD
      cdPop.classList.add('visible');   // pop up the CD
      songName.textContent = songNames[currentSong];
    }).catch(() => {
      // browser blocked autoplay — user still hears nothing but UI resets
      icon.textContent = '♪';
    });
  }

  function stopPlaying() {
    getCurrentAudio().pause();
    getCurrentAudio().currentTime = 0;
    isPlaying = false;
    icon.textContent = '♪';
    cdDisc.classList.remove('spinning');
    cdPop.classList.remove('visible');   // slide CD back down
  }

  // ── Play / Pause button ──
  btn.addEventListener('click', () => {
    if (isPlaying) {
      stopPlaying();
    } else {
      startPlaying();
    }
  });

  // ── Click the CD disc → skip to next song ──
  cdDisc.addEventListener('click', (e) => {
    e.stopPropagation();

    // fade out current
    getCurrentAudio().pause();
    getCurrentAudio().currentTime = 0;

    // switch song
    currentSong = (currentSong + 1) % audios.length;

    // quick visual flash on disc
    cdDisc.style.opacity = '0.4';
    setTimeout(() => { cdDisc.style.opacity = '1'; }, 180);

    // play new song
    if (isPlaying) {
      getCurrentAudio().play().then(() => {
        songName.textContent = songNames[currentSong];
      }).catch(() => {});
    } else {
      songName.textContent = songNames[currentSong];
    }
  });

  // when a song ends naturally, auto-advance to next
  audios.forEach((audio, i) => {
    if (!audio) return;
    audio.addEventListener('ended', () => {
      audio.currentTime = 0;
      currentSong = (i + 1) % audios.length;
      getCurrentAudio().play().then(() => {
        songName.textContent = songNames[currentSong];
      }).catch(() => {});
    });
  });
}


/* ─────────────────────────────────────────────
   6. POLAROID WALL — scroll reveal + tilt
   ───────────────────────────────────────────── */
function setupPolaroids() {
  const polaroids = document.querySelectorAll('.polaroid');
  if (!polaroids.length) return;

  // direction presets for fly-in animation
  const flyDirections = [
    'translateX(-60px) translateY(30px)',   // from left
    'translateX(60px)  translateY(30px)',   // from right
    'translateX(-40px) translateY(60px)',   // from bottom-left
    'translateX(40px)  translateY(60px)',   // from bottom-right
    'translateX(0px)   translateY(70px)',   // from below
  ];

  polaroids.forEach((p, i) => {
    // random tilt between -5.5 and +5.5 degrees
    const tilt   = (Math.random() * 11 - 5.5).toFixed(2);
    const flyDir = flyDirections[i % flyDirections.length];

    // store final tilt as CSS var
    p.style.setProperty('--tilt', `${tilt}deg`);

    // start in fly-in position
    p.style.transform = `${flyDir} rotate(${tilt}deg)`;
    p.style.opacity   = '0';

    // fill caption from data-caption attribute
    const cap = p.querySelector('.polaroid-caption');
    const txt = p.querySelector('.polaroid-caption')?.getAttribute('data-caption') || '';
    if (cap) cap.textContent = txt;
  });

  // IntersectionObserver: reveal each polaroid as it enters view, staggered
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const p     = entry.target;
      const idx   = Array.from(polaroids).indexOf(p);
      const tilt  = p.style.getPropertyValue('--tilt');
      const delay = (idx % 4) * 80; // stagger by column position

      setTimeout(() => {
        p.style.transition = `transform 0.65s cubic-bezier(0.34, 1.3, 0.64, 1),
                               opacity 0.5s ease`;
        p.style.transform  = `rotate(${tilt})`;
        p.style.opacity    = '1';
        p.classList.add('revealed');
      }, delay);

      observer.unobserve(p);
    });
  }, { threshold: 0.08 });

  polaroids.forEach(p => observer.observe(p));

  // hover: straighten out (overriding tilt), handled mostly in CSS
  // but we also set the rotate back on mouse-leave
  polaroids.forEach(p => {
    const tilt = p.style.getPropertyValue('--tilt');
    p.addEventListener('mouseleave', () => {
      p.style.transform = `rotate(${tilt})`;
    });
  });
}


/* ─────────────────────────────────────────────
   7. MOBILE NAV
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
   8. SCROLL FADE-IN for main sections
   ───────────────────────────────────────────── */
function setupScrollFade() {
  const targets = document.querySelectorAll(
    '.chapters, .timeline-section, .gallery-section, .letters-section'
  );
  targets.forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(24px)';
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
  setupCDPlayer();
  setupPolaroids();
  setupMobileNav();
  setupScrollFade();
});