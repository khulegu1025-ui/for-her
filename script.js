/* ══════════════════════════════════════════════
   KHULEGU & INGA — script.js
   ══════════════════════════════════════════════ */


/* ─────────────────────────────────────────────
   1. MEMORY FLASH — triggered by button click
   ─────────────────────────────────────────────
   Images are lazy-loaded, so running this on
   page load means blank frames. Instead the
   user clicks the button after scrolling the
   gallery — by then every photo is in memory.
   ───────────────────────────────────────────── */
function runMemoryFlash() {
  const overlay  = document.getElementById('memory-flash');
  const photoA   = document.getElementById('mfPhotoA');
  const photoB   = document.getElementById('mfPhotoB');
  const edgeGlow = document.getElementById('mfEdgeGlow');
  const mfFinal  = document.getElementById('mfFinal');
  const skipBtn  = document.getElementById('mfSkip');
  const trigBtn  = document.getElementById('flashTriggerBtn');

  if (!overlay || !photoA || !photoB) return;

  // gather every gallery photo src (already loaded by now)
  const seen = new Set();
  const srcs = [];
  document.querySelectorAll('.m-cell img, .polaroid img').forEach(img => {
    const s = img.getAttribute('src');
    if (s && !seen.has(s)) { seen.add(s); srcs.push(s); }
  });

  if (srcs.length === 0) return;

  // shuffle for variety
  for (let i = srcs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [srcs[i], srcs[j]] = [srcs[j], srcs[i]];
  }

  // show overlay — use rAF so display:flex is painted before opacity kicks in
  overlay.setAttribute('aria-hidden', 'false');
  overlay.classList.add('mf-active');
  document.body.style.overflow = 'hidden';

  // reset state from any previous run
  photoA.classList.remove('mf-visible');
  photoB.classList.remove('mf-visible');
  photoA.style.zIndex = '1';
  photoB.style.zIndex = '1';
  mfFinal.classList.remove('mf-show');
  overlay.classList.remove('mf-done');

  // ── consistent timing — same speed for every photo ──
  const HOLD_MS  = 520;   // how long each photo is fully visible
  const FADE_MS  = 380;   // crossfade duration — matches CSS transition
  const CYCLE_MS = HOLD_MS + FADE_MS;

  let activeSlot = 'A';
  let photoIndex = 0;
  let stopped    = false;

  function getActive()   { return activeSlot === 'A' ? photoA : photoB; }
  function getInactive() { return activeSlot === 'A' ? photoB : photoA; }

  function triggerGlow() {
    if (!edgeGlow) return;
    edgeGlow.classList.remove('pulse');
    void edgeGlow.offsetWidth; // force reflow to restart animation
    edgeGlow.classList.add('pulse');
  }

  function showNextPhoto() {
    if (stopped) return;
    if (photoIndex >= srcs.length) { holdFinalPhoto(); return; }

    const incoming = getInactive();
    const outgoing = getActive();

    // very subtle scale per photo — barely noticeable, just alive
    incoming.style.transform = `scale(${1 + Math.random() * 0.03})`;
    incoming.src             = srcs[photoIndex];
    incoming.style.zIndex    = '2';
    outgoing.style.zIndex    = '1';

    triggerGlow();

    requestAnimationFrame(() => {
      incoming.classList.add('mf-visible');
      outgoing.classList.remove('mf-visible');
    });

    activeSlot = activeSlot === 'A' ? 'B' : 'A';
    photoIndex++;

    setTimeout(showNextPhoto, CYCLE_MS);
  }

  function holdFinalPhoto() {
    // straighten the final photo gently
    const current = getActive();
    current.style.transition = 'transform 1.2s ease, opacity 0.9s ease';
    current.style.transform  = 'scale(1)';

    setTimeout(() => { mfFinal.classList.add('mf-show'); }, 500);
    setTimeout(endFlash, 2800);
  }

  function endFlash() {
    stopped = true;
    overlay.classList.add('mf-done');

    setTimeout(() => {
      overlay.classList.remove('mf-active', 'mf-done');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      mfFinal.classList.remove('mf-show');
    }, 1400);
  }

  if (skipBtn) {
    // remove old listener if any, then add fresh one
    const newSkip = skipBtn.cloneNode(true);
    skipBtn.parentNode.replaceChild(newSkip, skipBtn);
    newSkip.addEventListener('click', () => { stopped = true; endFlash(); });
  }

  setTimeout(showNextPhoto, 120);
}

function setupFlashButton() {
  const btn = document.getElementById('flashTriggerBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    // brief loading state in case any images are still fetching
    btn.classList.add('loading');
    btn.disabled = true;

    // small delay so any in-flight images can settle, then launch
    setTimeout(() => {
      btn.classList.remove('loading');
      btn.disabled = false;
      runMemoryFlash();
    }, 300);
  });
}


/* ─────────────────────────────────────────────
   2. DAYS COUNTER
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
   3. LIGHTBOX
   ───────────────────────────────────────────── */
let lightboxPhotos = [];
let currentIndex   = 0;

function buildPhotoList() {
  lightboxPhotos = [];
  document.querySelectorAll('.m-cell[data-index]').forEach(cell => {
    const img = cell.querySelector('img');
    if (!img) return;
    lightboxPhotos[parseInt(cell.dataset.index)] = {
      src: img.src, alt: img.alt, caption: cell.dataset.caption || ''
    };
  });
  document.querySelectorAll('.polaroid[data-index]').forEach(cell => {
    const img = cell.querySelector('img');
    if (!img) return;
    lightboxPhotos[parseInt(cell.dataset.index)] = {
      src: img.src, alt: img.alt,
      caption: cell.querySelector('.polaroid-caption')?.textContent || ''
    };
  });
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
    img.src = photo.src; img.alt = photo.alt; img.style.opacity = '1';
  }, 150);
  counter.textContent = `${index + 1} of ${lightboxPhotos.length}`;
}

function setupLightbox() {
  buildPhotoList();
  document.querySelectorAll('.m-cell[data-index]').forEach(cell => {
    cell.addEventListener('click', () => openLightbox(parseInt(cell.dataset.index)));
  });
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
  let touchStartX = 0;
  const lbEl = document.getElementById('lightbox');
  lbEl.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
  lbEl.addEventListener('touchend',   (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? showPhoto(currentIndex + 1) : showPhoto(currentIndex - 1);
  });
}


/* ─────────────────────────────────────────────
   4. HEART RAIN
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
      el.style.cssText = `left:${xPos}%;font-size:${size}px;color:hsl(${10+Math.random()*15},70%,${55+Math.random()*15}%);animation-duration:${duration}s;`;
      container.appendChild(el);
      setTimeout(() => el.remove(), (duration + 0.5) * 1000);
    }, delay);
  }
  setTimeout(() => { container.style.display = 'none'; }, rainEnd + 4500);
}


/* ─────────────────────────────────────────────
   5. LETTER REVEAL
   ───────────────────────────────────────────── */
function toggleLetter(id) {
  const card   = document.getElementById(id);
  if (!card) return;
  const isOpen = card.classList.contains('open');
  document.querySelectorAll('.letter-card').forEach(c => c.classList.remove('open'));
  if (!isOpen) card.classList.add('open');
}


/* ─────────────────────────────────────────────
   6. CD PLAYER
   ───────────────────────────────────────────── */
function setupCDPlayer() {
  const btn      = document.getElementById('musicBtn');
  const icon     = document.getElementById('musicIcon');
  const cdPop    = document.getElementById('cdPop');
  const cdDisc   = document.getElementById('cdDisc');
  const songName = document.getElementById('cdSongName');
  const audios   = [document.getElementById('bgMusic'), document.getElementById('bgMusic2')];
  const songNames = ['Song 1', 'Song 2']; // ← change to your real song titles

  let isPlaying   = false;
  let currentSong = 0;
  audios.forEach(a => { if (a) a.volume = 0.22; });

  function getCurrentAudio() { return audios[currentSong]; }

  function startPlaying() {
    getCurrentAudio().play().then(() => {
      isPlaying = true;
      icon.textContent = '‖';
      cdDisc.classList.add('spinning');
      cdPop.classList.add('visible');
      songName.textContent = songNames[currentSong];
    }).catch(() => { icon.textContent = '♪'; });
  }

  function stopPlaying() {
    getCurrentAudio().pause();
    isPlaying = false;
    icon.textContent = '♪';
    cdDisc.classList.remove('spinning');
    cdPop.classList.remove('visible');
  }

  btn.addEventListener('click', () => { isPlaying ? stopPlaying() : startPlaying(); });

  cdDisc.addEventListener('click', (e) => {
    e.stopPropagation();
    getCurrentAudio().pause();
    currentSong = (currentSong + 1) % audios.length;
    cdDisc.style.opacity = '0.4';
    setTimeout(() => { cdDisc.style.opacity = '1'; }, 180);
    if (isPlaying) {
      getCurrentAudio().play().then(() => { songName.textContent = songNames[currentSong]; }).catch(() => {});
    }
  });

  audios.forEach((audio, i) => {
    if (!audio) return;
    audio.addEventListener('ended', () => {
      audio.currentTime = 0;
      currentSong = (i + 1) % audios.length;
      getCurrentAudio().play().then(() => { songName.textContent = songNames[currentSong]; }).catch(() => {});
    });
  });
}


/* ─────────────────────────────────────────────
   7. POLAROID WALL — scroll reveal + tilt
   ───────────────────────────────────────────── */
function setupPolaroids() {
  const polaroids = document.querySelectorAll('.polaroid');
  if (!polaroids.length) return;
  const flyDirections = [
    'translateX(-60px) translateY(30px)',
    'translateX(60px)  translateY(30px)',
    'translateX(-40px) translateY(60px)',
    'translateX(40px)  translateY(60px)',
    'translateX(0px)   translateY(70px)',
  ];
  polaroids.forEach((p, i) => {
    const tilt   = (Math.random() * 11 - 5.5).toFixed(2);
    const flyDir = flyDirections[i % flyDirections.length];
    p.style.setProperty('--tilt', `${tilt}deg`);
    p.style.transform = `${flyDir} rotate(${tilt}deg)`;
    p.style.opacity   = '0';
    const cap = p.querySelector('.polaroid-caption');
    const txt = cap?.getAttribute('data-caption') || '';
    if (cap) cap.textContent = txt;
  });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const p     = entry.target;
      const idx   = Array.from(polaroids).indexOf(p);
      const tilt  = p.style.getPropertyValue('--tilt');
      const delay = (idx % 4) * 80;
      setTimeout(() => {
        p.style.transition = `transform 0.65s cubic-bezier(0.34,1.3,0.64,1), opacity 0.5s ease`;
        p.style.transform  = `rotate(${tilt})`;
        p.style.opacity    = '1';
        p.classList.add('revealed');
      }, delay);
      observer.unobserve(p);
    });
  }, { threshold: 0.08 });
  polaroids.forEach(p => observer.observe(p));
  polaroids.forEach(p => {
    const tilt = p.style.getPropertyValue('--tilt');
    p.addEventListener('mouseleave', () => { p.style.transform = `rotate(${tilt})`; });
  });
}


/* ─────────────────────────────────────────────
   8. MOBILE NAV
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
   9. SCROLL FADE-IN
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
  setupLightbox();
  setupCDPlayer();
  setupPolaroids();
  setupMobileNav();
  setupScrollFade();
  updateDaysCounter();
  setupFlashButton();   // wire up the "relive our memories" button
  createHeartRain();    // heart rain now runs immediately on load
});