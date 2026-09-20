/* ============================================================
   FARREL.OS — interactions
   1. Boot sequence (typewriter, skippable)
   2. Starfield canvas (GPU friendly, reduced-motion aware)
   3. Taskbar clock
   4. Scroll reveal
   ============================================================ */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================
     1. BOOT SEQUENCE
     ========================================================== */
  var boot     = document.getElementById('boot');
  var bootLog  = document.getElementById('bootLog');
  var bootBtn  = document.getElementById('bootBtn');
  var bootWrap = document.getElementById('bootStart');

  var BOOT_LINES = [
    'FARREL.OS v1.0  (c) 2026',
    '',
    'Detecting hardware .......... ESP32-S3 OK',
    'Checking display ............ 1.3" OLED OK',
    'Loading audio stack ......... PCM5102 / NE5532 OK',
    'Mounting storage ............ microSD OK',
    '',
    'Starting AI runtime ......... Gemini API OK',
    'Loading agent modules ....... OK',
    '',
    'Profile loaded: Farrel Fayzul Haqqi',
    'Electrical Engineering, ITS Surabaya',
    '',
    'Ready.'
  ];

  var lineIndex = 0;
  var charIndex = 0;
  var typingTimer = null;
  var finished = false;

  function typeStep() {
    if (lineIndex >= BOOT_LINES.length) {
      finishBootLog();
      return;
    }
    var current = BOOT_LINES[lineIndex];
    if (charIndex < current.length) {
      bootLog.textContent += current.charAt(charIndex);
      charIndex++;
      typingTimer = window.setTimeout(typeStep, 12);
    } else {
      bootLog.textContent += '\n';
      lineIndex++;
      charIndex = 0;
      typingTimer = window.setTimeout(typeStep, 60);
    }
  }

  function finishBootLog() {
    finished = true;
    bootLog.textContent = BOOT_LINES.join('\n') + '\n';
    if (bootBtn) bootBtn.focus();
  }

  function dismissBoot() {
    if (!boot || boot.classList.contains('boot--out')) return;
    boot.classList.add('boot--out');
    window.setTimeout(function () {
      boot.setAttribute('hidden', '');
    }, 520);
    try {
      window.sessionStorage.setItem('farrel-booted', '1');
    } catch (e) { /* storage blocked, no problem */ }
    startStarfield();
  }

  // Skip boot if already seen this session, or if motion is reduced
  var alreadyBooted = false;
  try { alreadyBooted = window.sessionStorage.getItem('farrel-booted') === '1'; } catch (e) {}

  if (!boot) {
    startStarfield();
  } else if (reduced || alreadyBooted) {
    boot.setAttribute('hidden', '');
    startStarfield();
  } else {
    typingTimer = window.setTimeout(typeStep, 260);
    if (bootBtn) bootBtn.addEventListener('click', dismissBoot);
    // clicking anywhere skips the log, second click enters
    boot.addEventListener('click', function (e) {
      if (e.target === bootBtn) return;
      if (!finished) {
        window.clearTimeout(typingTimer);
        finishBootLog();
      }
    });
    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        if (!finished) {
          window.clearTimeout(typingTimer);
          finishBootLog();
        } else {
          dismissBoot();
        }
      }
      if (e.key === 'Escape') dismissBoot();
    });
  }

  /* ==========================================================
     2. STARFIELD
     ========================================================== */
  var canvas = document.getElementById('sky');
  var ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  var stars = [];
  var shootingStars = [];
  var rafId = null;
  var running = false;
  var dpr = 1;

  function sizeCanvas() {
    if (!canvas || !ctx) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.floor(window.innerWidth  * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width  = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
  }

  function buildStars() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    var count = Math.round((w * h) / 9000);
    count = Math.max(50, Math.min(count, 190));
    stars = [];
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() < 0.82 ? 2 : 3,
        base: 0.25 + Math.random() * 0.55,
        speed: 0.4 + Math.random() * 1.3,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  var COLORS = ['#e8ecf7', '#3de8c4', '#ffd34d', '#4fc3e8'];

  function drawStars(t) {
    if (!ctx) return;
    var w = window.innerWidth;
    var h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var flicker = 0.55 + 0.45 * Math.sin(t * 0.0011 * s.speed + s.phase);
      ctx.globalAlpha = Math.max(0.08, Math.min(1, s.base * flicker));
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
    }

    // shooting stars
    for (var j = shootingStars.length - 1; j >= 0; j--) {
      var m = shootingStars[j];
      m.x += m.vx;
      m.y += m.vy;
      m.life -= 1;
      ctx.globalAlpha = Math.max(0, m.life / m.maxLife);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(m.x), Math.round(m.y), 3, 3);
      ctx.fillRect(Math.round(m.x - m.vx * 2), Math.round(m.y - m.vy * 2), 2, 2);
      if (m.life <= 0 || m.x > w + 40 || m.y > h + 40) shootingStars.splice(j, 1);
    }

    ctx.globalAlpha = 1;
  }

  var lastShoot = 0;

  function loop(t) {
    if (!running) return;
    drawStars(t);
    if (t - lastShoot > 4200 && shootingStars.length < 2 && Math.random() < 0.5) {
      shootingStars.push({
        x: Math.random() * window.innerWidth * 0.5,
        y: Math.random() * window.innerHeight * 0.35,
        vx: 3.4 + Math.random() * 2.2,
        vy: 1.5 + Math.random() * 1.1,
        life: 68,
        maxLife: 68
      });
      lastShoot = t;
    }
    rafId = window.requestAnimationFrame(loop);
  }

  function startStarfield() {
    if (!canvas || !ctx) return;
    if (reduced) {
      sizeCanvas();
      drawStars(0);
      return;
    }
    if (running) return;
    running = true;
    sizeCanvas();
    rafId = window.requestAnimationFrame(loop);
  }

  function stopStarfield() {
    running = false;
    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = null;
  }

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      if (running || reduced) {
        sizeCanvas();
        if (reduced) drawStars(0);
      }
    }, 140);
  });

  // Pause when tab is hidden, resume when visible
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stopStarfield();
    } else if (!reduced) {
      startStarfield();
    }
  });

  /* ==========================================================
     3. CLOCK
     ========================================================== */
  var clock = document.getElementById('clock');

  function tickClock() {
    if (!clock) return;
    var d = new Date();
    var hh = String(d.getHours()).padStart(2, '0');
    var mm = String(d.getMinutes()).padStart(2, '0');
    clock.textContent = hh + ':' + mm;
  }

  tickClock();
  window.setInterval(tickClock, 15000);

  /* ==========================================================
     4. SCROLL REVEAL
     ========================================================== */
  var revealTargets = document.querySelectorAll(
    '.quest, .inv__group, .win--award, .cert, .win, .sect__head'
  );

  if (reduced || !('IntersectionObserver' in window)) {
    for (var i = 0; i < revealTargets.length; i++) {
      revealTargets[i].classList.add('reveal', 'is-in');
    }
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    for (var k = 0; k < revealTargets.length; k++) {
      revealTargets[k].classList.add('reveal');
      io.observe(revealTargets[k]);
    }
  }

})();
