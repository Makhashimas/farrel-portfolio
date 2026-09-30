/* ============================================================
   FARREL.OS - interactions
   1. Boot sequence (typewriter, skippable)
   2. Starfield canvas (GPU friendly, reduced-motion aware)
   3. Taskbar clock
   4. Scroll reveal
   5. Sunset / night theme toggle (click the moon)
   6. Command palette (RUN.EXE, Ctrl+K)
   7. Toasts
   8. Interactive terminal
   9. Scroll progress + cursor spotlight + card spotlight
   10. Animated counters
   11. Text scramble on section titles
   12. Copy site link, Konami code
   13. Lightning strikes (night theme ambient)
   14. MP3 player + GNR theme + mini player
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

  var BOOT_LINES = [
    'FARREL.OS v2.0  (c) 2026',
    '',
    'Detecting hardware .......... ESP32-S3 OK',
    'Checking display ............ 1.3" OLED OK',
    'Loading audio stack ......... PCM5102A / NE5532 OK',
    'Verifying grounding ......... Star Ground OK',
    'Mounting storage ............ microSD OK',
    '',
    'Starting AI runtime ......... Multi-Node LLM Router OK',
    'Loading agent modules ....... OK',
    '',
    'Profile loaded: Farrel Fayzul Haqqi',
    'Electrical Engineering, ITS Surabaya',
    'Status: Applying to Anargya EV Team',
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
      boot.setAttribute('aria-hidden', 'true');
    }, 520);
    try {
      window.sessionStorage.setItem('farrel-booted', '1');
    } catch (e) { /* storage blocked, no problem */ }
    startStarfield();
    // hand focus back to the page so keyboard users are not stranded
    var firstNav = document.querySelector('.bar__link');
    if (firstNav) firstNav.focus();
  }

  // Keep keyboard focus inside the boot dialog while it is on screen
  function trapBootFocus(e) {
    if (e.key !== 'Tab' || !boot || boot.hasAttribute('hidden')) return;
    var focusables = boot.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // Skip boot if already seen this session, or if motion is reduced
  var alreadyBooted = false;
  try { alreadyBooted = window.sessionStorage.getItem('farrel-booted') === '1'; } catch (e) {}

  if (!boot) {
    startStarfield();
  } else if (reduced || alreadyBooted) {
    boot.setAttribute('hidden', '');
    boot.setAttribute('aria-hidden', 'true');
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
      trapBootFocus(e);
      if (e.key === 'Enter' || e.key === ' ') {
        if (boot.hasAttribute('hidden')) return;
        if (e.target === bootBtn) return;
        e.preventDefault();
        if (!finished) {
          window.clearTimeout(typingTimer);
          finishBootLog();
        } else {
          dismissBoot();
        }
      }
      if (e.key === 'Escape') {
        if (boot.hasAttribute('hidden')) return;
        dismissBoot();
      }
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

  var NIGHT_COLORS  = ['#e8ecf7', '#3de8c4', '#ffd34d', '#4fc3e8'];
  var SUNSET_COLORS = ['#fff1e4', '#ff9a5c', '#ffd93d', '#ff4d6d'];
  var GNR_COLORS    = ['#f5e7cd', '#ffb347', '#ffd34d', '#d32f2f'];

  function drawStars(t) {
    if (!ctx) return;
    var w = window.innerWidth;
    var h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    var themeNow = document.documentElement.getAttribute('data-theme');
    var cols = themeNow === 'sunset' ? SUNSET_COLORS : themeNow === 'gnr' ? GNR_COLORS : NIGHT_COLORS;
    var alphaMult = themeNow === 'sunset' ? 0.4 : themeNow === 'gnr' ? 0.8 : 1;

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var flicker = 0.55 + 0.45 * Math.sin(t * 0.0011 * s.speed + s.phase);
      ctx.globalAlpha = Math.max(0.08, Math.min(1, s.base * flicker * alphaMult));
      ctx.fillStyle = cols[i % cols.length];
      ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
    }

    // shooting stars
    for (var j = shootingStars.length - 1; j >= 0; j--) {
      var m = shootingStars[j];
      m.x += m.vx;
      m.y += m.vy;
      m.life -= 1;
      ctx.globalAlpha = Math.max(0, (m.life / m.maxLife) * alphaMult);
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
    '.quest, .now__item, .inv__group, .win--award, .cert, .win, .sect__head'
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

  /* ==========================================================
     5. THEME SYSTEM (night / sunset / gnr)
     ========================================================== */
  var moonBtn = document.getElementById('moonBtn');
  var themeMeta = document.getElementById('themeColor');
  var gnrActive = false;   // true while the GNR theme should be on screen

  // the base theme is where the site returns to when the song pauses
  var baseTheme = 'night';
  try {
    if (localStorage.getItem('farrel-theme') === 'sunset') baseTheme = 'sunset';
  } catch (e) {}

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'night';
  }

  function updateThemeMeta() {
    var th = currentTheme();
    var colors = { night: '#0a0e27', sunset: '#1c0b2e', gnr: '#070608' };
    if (themeMeta) themeMeta.setAttribute('content', colors[th] || colors.night);
    if (moonBtn) {
      var isSunset = baseTheme === 'sunset';
      moonBtn.setAttribute('aria-pressed', isSunset ? 'true' : 'false');
      moonBtn.setAttribute('aria-label', isSunset ? 'Switch to night theme' : 'Switch to sunset theme');
      moonBtn.setAttribute('title', isSunset ? 'Night mode' : 'Sunset mode');
    }
  }

  // cross-fade between themes; fadeMs controls how soft the gradient feels
  function applyTheme(name, fadeMs) {
    var doc = document.documentElement;
    var ms = fadeMs || 460;
    var cls = ms >= 700 ? 'theme-fading--slow' : 'theme-fading';
    // a soft gradient sweep rides along with the cross-fade
    if (!reduced && themewashEl) {
      themewashEl.classList.remove('is-on');
      void themewashEl.offsetWidth;
      themewashEl.classList.add('is-on');
    }
    doc.classList.add(cls);
    if (name === 'night') {
      doc.removeAttribute('data-theme');
    } else {
      doc.setAttribute('data-theme', name);
    }
    updateThemeMeta();
    if (reduced) {
      doc.classList.remove(cls);
    } else {
      window.setTimeout(function () { doc.classList.remove(cls); }, ms);
    }
  }

  function setBaseTheme(name) {
    baseTheme = name;
    try { localStorage.setItem('farrel-theme', name); } catch (e) {}
    if (!gnrActive) applyTheme(name, 460);
    else updateThemeMeta(); // song on screen: remember it, apply when the music stops
  }

  function setTheme(sunset) {
    setBaseTheme(sunset ? 'sunset' : 'night');
  }

  updateThemeMeta();

  if (moonBtn) {
    moonBtn.addEventListener('click', function () {
      setBaseTheme(baseTheme === 'sunset' ? 'night' : 'sunset');
    });
  }

  /* ==========================================================
     6. TOASTS
     ========================================================== */
  var toastWrap = document.getElementById('toasts');
  function showToast(title, name, desc, cyan) {
    if (!toastWrap) return;
    var toast = document.createElement('div');
    toast.className = 'toast';

    var bar = document.createElement('div');
    bar.className = 'toast__bar' + (cyan ? ' toast__bar--cyan' : '');
    var t = document.createElement('span');
    t.className = 'toast__title';
    t.textContent = title;
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'toast__close';
    close.setAttribute('aria-label', 'Dismiss notification');
    close.textContent = '\u00D7';
    bar.appendChild(t);
    bar.appendChild(close);

    var body = document.createElement('div');
    body.className = 'toast__body';
    var nm = document.createElement('p');
    nm.className = 'toast__name';
    nm.textContent = name;
    var ds = document.createElement('p');
    ds.className = 'toast__desc';
    ds.textContent = desc;
    body.appendChild(nm);
    body.appendChild(ds);

    toast.appendChild(bar);
    toast.appendChild(body);
    toastWrap.appendChild(toast);

    function dismiss() {
      if (toast.classList.contains('toast--out')) return;
      toast.classList.add('toast--out');
      window.setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 260);
    }

    close.addEventListener('click', dismiss);
    window.requestAnimationFrame(function () { toast.classList.add('toast--in'); });
    window.setTimeout(dismiss, 6000);
  }


  /* ==========================================================
     7. COMMAND PALETTE (RUN.EXE)
     ========================================================== */
  var pal = document.getElementById('pal');
  var palInput = document.getElementById('palInput');
  var palList = document.getElementById('palList');
  var palBack = document.getElementById('palBack');
  var runBtn = document.getElementById('runBtn');
  var palActive = -1;
  var palFiltered = [];

  var COMMANDS = [
    { key: 'about',    label: 'Open profile',        run: function () { go('#about'); } },
    { key: 'projects', label: 'Open quest log',      run: function () { go('#projects'); } },
    { key: 'now',      label: 'Open now building',   run: function () { go('#now'); } },
    { key: 'skills',   label: 'Open inventory',      run: function () { go('#skills'); } },
    { key: 'awards',   label: 'Open achievements',   run: function () { go('#awards'); } },
    { key: 'contact',  label: 'Open contact',        run: function () { go('#contact'); } },
    { key: 'theme',    label: 'Toggle sunset theme', run: function () {
        var nextSunset = document.documentElement.getAttribute('data-theme') !== 'sunset';
        setTheme(nextSunset);
      } },
    { key: 'copy',     label: 'Copy site link',      run: copySiteLink },
    { key: 'github',   label: 'Open GitHub profile', run: function () {
        window.open('https://github.com/makhashimas', '_blank', 'noopener');
      } },
    { key: 'linkedin', label: 'Open LinkedIn profile', run: function () {
        window.open('https://www.linkedin.com/in/farrel-fayzul-haqqi-26a31b29b', '_blank', 'noopener');
      } },
    { key: 'top',      label: 'Scroll to top',       run: function () {
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      } }
  ];

  function go(sel) {
    var el = document.querySelector(sel);
    if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }

  function renderPal() {
    var q = palInput.value.trim().toLowerCase();
    palFiltered = COMMANDS.filter(function (c) {
      return !q || c.key.indexOf(q) === 0 || c.label.toLowerCase().indexOf(q) !== -1;
    });
    palList.innerHTML = '';
    palActive = palFiltered.length ? 0 : -1;

    palFiltered.forEach(function (c, idx) {
      var li = document.createElement('li');
      li.className = 'pal__item' + (idx === palActive ? ' pal__item--active' : '');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', idx === palActive ? 'true' : 'false');
      var lbl = document.createElement('span');
      lbl.className = 'pal__item-label';
      lbl.textContent = c.label;
      var k = document.createElement('span');
      k.className = 'pal__item-key';
      k.textContent = c.key.toUpperCase();
      li.appendChild(lbl);
      li.appendChild(k);
      li.addEventListener('click', function () { runPalItem(idx); });
      li.addEventListener('mousemove', function () { setPalActive(idx); });
      palList.appendChild(li);
    });
  }

  function setPalActive(idx) {
    if (idx < 0 || idx >= palFiltered.length) return;
    palActive = idx;
    var items = palList.children;
    for (var i = 0; i < items.length; i++) {
      var on = i === idx;
      items[i].classList.toggle('pal__item--active', on);
      items[i].setAttribute('aria-selected', on ? 'true' : 'false');
    }
  }

  function runPalItem(idx) {
    var c = palFiltered[idx];
    if (!c) return;
    closePal();
    c.run();
  }

  function openPal() {
    if (!pal) return;
    pal.removeAttribute('hidden');
    palInput.value = '';
    renderPal();
    palInput.focus();
  }

  function closePal() {
    if (!pal) return;
    pal.setAttribute('hidden', '');
    if (runBtn) runBtn.focus();
  }

  if (pal) {
    if (runBtn) runBtn.addEventListener('click', openPal);
    if (palBack) palBack.addEventListener('click', closePal);

    palInput.addEventListener('input', renderPal);

    palInput.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setPalActive((palActive + 1) % Math.max(palFiltered.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setPalActive((palActive - 1 + palFiltered.length) % Math.max(palFiltered.length, 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        runPalItem(palActive);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closePal();
      }
    });

    document.addEventListener('keydown', function (e) {
      var isK = (e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K');
      if (isK) {
        e.preventDefault();
        if (pal.hasAttribute('hidden')) openPal();
        else closePal();
      }
      if (e.key === 'Escape' && !pal.hasAttribute('hidden')) closePal();
    });
  }

  /* ==========================================================
     8. INTERACTIVE TERMINAL
     ========================================================== */
  var termInput = document.getElementById('termInput');
  var termHist = document.getElementById('termHist');

  var TERM_HELP = [
    'help      this list',
    'whoami    who runs this site',
    'projects  list projects',
    'skills    list skill groups',
    'awards    competitions and certificates',
    'contact   ways to reach me',
    'theme     toggle sunset / night',
    'date      current local date',
    'clear     clear this history'
  ];

  function termLine(text, cls) {
    if (!termHist) return;
    var p = document.createElement('p');
    p.className = cls || 'term__out';
    p.textContent = text;
    termHist.appendChild(p);
    termHist.scrollTop = termHist.scrollHeight;
  }

  function termEcho(cmd) {
    if (!termHist) return;
    var p = document.createElement('p');
    p.className = 'term__line';
    var span = document.createElement('span');
    span.className = 'term__p';
    span.textContent = 'C:\\> ';
    p.appendChild(span);
    p.appendChild(document.createTextNode(cmd));
    termHist.appendChild(p);
  }

  function runTermCmd(raw) {
    var cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    termEcho(cmd);

    switch (cmd) {
      case 'help':
        TERM_HELP.forEach(function (l) { termLine(l); });
        break;
      case 'whoami':
        termLine('Farrel Fayzul Haqqi. Electrical Engineering, ITS Surabaya.');
        break;
      case 'projects':
        termLine('Offline MP3 Player / Step-Down Converter LM2575 / Laptop Cooling Pad');
        termLine('Wall of Dream / Agentic AI Assistant / MKH Player / EcoMeth & FLOBRIC');
        break;
      case 'skills':
        termLine('Hardware: embedded, ESP32, KiCad PCB, analog, power, soldering, harness');
        termLine('Research: surveys, quantitative analysis, literature, technical writing');
        termLine('AI & software: LLM routing, agents, automation, Python, C/C++, Kotlin');
        break;
      case 'awards':
        termLine('Semifinalist ELECTRA 14 (2025) & ELECTRA 13 (2024), Dept. Electrical Engineering ITS');
        termLine('3x OpenAI Academy certificates; TEFL ITP score 593');
        break;
      case 'contact':
        termLine('LinkedIn: linkedin.com/in/farrel-fayzul-haqqi-26a31b29b');
        termLine('GitHub: github.com/makhashimas');
        break;
      case 'theme':
        var nextSunset = document.documentElement.getAttribute('data-theme') !== 'sunset';
        setTheme(nextSunset);
        termLine(nextSunset ? 'Theme set to sunset.' : 'Theme set to night.', 'term__out--ok');
        break;
      case 'date':
        termLine(new Date().toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' }));
        break;
      case 'clear':
        termHist.innerHTML = '';
        break;
      case 'sudo':
      case 'sudo su':
        termLine('Permission denied. Nice try.', 'term__out--err');
        break;
      case 'ls':
        termLine('about  projects  now  skills  awards  contact');
        break;
      case 'konami':
        termLine('Hint: arrows, arrows, B, A. On a keyboard.');
        break;
      default:
        termLine('Command not found: ' + cmd + '. Type help.', 'term__out--err');
    }
  }

  if (termInput) {
    termInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        runTermCmd(termInput.value);
        termInput.value = '';
      }
    });
  }

  /* ==========================================================
     9. SCROLL PROGRESS + CURSOR SPOTLIGHT + CARD SPOTLIGHT
     ========================================================== */
  var scrollBar = document.getElementById('scrollBar');
  var glow = document.getElementById('glow');

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      if (scrollBar) scrollBar.style.width = pct.toFixed(2) + '%';
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer && !reduced && glow) {
    var glowX = 0, glowY = 0, gx = 0, gy = 0, glowRaf = null;

    function glowLoop() {
      gx += (glowX - gx) * 0.16;
      gy += (glowY - gy) * 0.16;
      glow.style.transform = 'translate(' + gx.toFixed(1) + 'px,' + gy.toFixed(1) + 'px)';
      glowRaf = window.requestAnimationFrame(glowLoop);
    }

    window.addEventListener('mousemove', function (e) {
      glowX = e.clientX;
      glowY = e.clientY;
      if (!document.body.classList.contains('glow-on')) {
        document.body.classList.add('glow-on');
      }
      if (!glowRaf) glowRaf = window.requestAnimationFrame(glowLoop);
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      document.body.classList.remove('glow-on');
      if (glowRaf) { window.cancelAnimationFrame(glowRaf); glowRaf = null; }
    });

    // card spotlight: feed --mx/--my to the hovered card
    document.addEventListener('mousemove', function (e) {
      var card = e.target.closest ? e.target.closest('.quest') : null;
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ==========================================================
     10. ANIMATED COUNTERS
     ========================================================== */
  var counters = document.querySelectorAll('.qstat__v[data-count]');

  function padNum(n, pad) {
    var s = String(n);
    while (pad && s.length < pad) s = '0' + s;
    return s;
  }

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var pad = parseInt(el.getAttribute('data-pad'), 10) || 0;

    if (reduced) {
      el.textContent = padNum(target, pad);
      return;
    }

    var start = null;
    var dur = 1100;

    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      // stepped easing keeps the pixel feel
      var stepped = Math.round(p * 10) / 10;
      el.textContent = padNum(Math.round(target * stepped), pad);
      if (p < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = padNum(target, pad);
      }
    }
    window.requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    for (var c = 0; c < counters.length; c++) cio.observe(counters[c]);
  } else {
    for (var c2 = 0; c2 < counters.length; c2++) animateCounter(counters[c2]);
  }

  /* ==========================================================
     11. TEXT SCRAMBLE ON SECTION TITLES
     ========================================================== */
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&@$*+-<>[]{}';

  function scramble(el) {
    var finalText = el.getAttribute('data-final') || el.textContent;
    el.setAttribute('data-final', finalText);
    if (reduced) { el.textContent = finalText; return; }

    var len = finalText.length;
    var revealAt = 0;
    var frame = 0;

    function tick() {
      var out = '';
      for (var i = 0; i < len; i++) {
        var ch = finalText.charAt(i);
        if (ch === ' ') { out += ' '; continue; }
        if (i < revealAt) { out += ch; continue; }
        out += GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
      }
      el.textContent = out;
      frame++;
      if (frame % 2 === 0) revealAt++;
      if (revealAt <= len) {
        window.setTimeout(tick, 34);
      } else {
        el.textContent = finalText;
      }
    }
    tick();
  }

  var scrambleTargets = document.querySelectorAll('[data-scramble]');
  if ('IntersectionObserver' in window && !reduced) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          scramble(entry.target);
          sio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    for (var s = 0; s < scrambleTargets.length; s++) sio.observe(scrambleTargets[s]);
  }

  /* ==========================================================
     12. COPY SITE LINK + KONAMI CODE
     ========================================================== */
  var copyBtn = document.getElementById('copyBtn');

  function copySiteLink() {
    var url = 'https://makhashimas.github.io/farrel-portfolio/';
    function done() {
      showToast('SYSTEM', 'Link copied', 'The site URL is on your clipboard.', true);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, function () {
        window.prompt('Copy the link:', url);
      });
    } else {
      window.prompt('Copy the link:', url);
      done();
    }
  }

  if (copyBtn) copyBtn.addEventListener('click', copySiteLink);


  // Konami code
  var KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  var konamiPos = 0;

  document.addEventListener('keydown', function (e) {
    var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === KONAMI[konamiPos]) {
      konamiPos++;
      if (konamiPos === KONAMI.length) {
        konamiPos = 0;
        document.documentElement.classList.add('konami');
        showToast('CHEAT ACCEPTED', '30 lives granted', 'Konami mode on. It will settle after a while.', true);
        window.setTimeout(function () {
          document.documentElement.classList.remove('konami');
        }, 12000);
      }
    } else {
      konamiPos = (key === KONAMI[0]) ? 1 : 0;
    }
  });

  /* ==========================================================
     13. LIGHTNING (night theme ambient storm)
     ========================================================== */
  var boltEls = [].slice.call(document.querySelectorAll('.bolt'));
  var stormEl = document.getElementById('storm');
  var boltTimer = null;

  function strikeBolt() {
    if (reduced || currentTheme() !== 'night' || document.hidden) return;
    var bolt = boltEls[Math.floor(Math.random() * boltEls.length)];
    if (!bolt) return;
    bolt.classList.remove('is-strike');
    void bolt.offsetWidth; // restart the animation
    bolt.classList.add('is-strike');
    if (stormEl && Math.random() < 0.75) {
      stormEl.classList.remove('is-flash');
      void stormEl.offsetWidth;
      stormEl.classList.add('is-flash');
    }
  }

  function scheduleStrike() {
    window.clearTimeout(boltTimer);
    // ambient: roughly one strike every 6-14 seconds
    var delay = 6000 + Math.random() * 8000;
    boltTimer = window.setTimeout(function () {
      strikeBolt();
      scheduleStrike();
    }, delay);
  }

  if (boltEls.length) {
    // first strike shortly after the visitor settles in
    boltTimer = window.setTimeout(function () {
      strikeBolt();
      scheduleStrike();
    }, 2800);
  }

  /* ==========================================================
     14. MP3 PLAYER - Sweet Child O' Mine + GNR theme + mini player
     ========================================================== */
  var audio = null;
  var audioCtx = null;
  var analyser = null;
  var analyserData = null;
  var beatRaf = null;
  var lastBeatPaint = 0;
  var beatAvg = 120;        // slow-moving energy baseline, adapts to the song
  var isPlaying = false;

  var cartEl = document.getElementById('cart');
  var cartPlay = document.getElementById('cartPlay');
  var cartCover = document.getElementById('cartCover');
  var cartGlyph = document.getElementById('cartGlyph');
  var cartLabel = document.getElementById('cartLabel');
  var cartTrack = document.getElementById('cartTrack');
  var cartTrackTxt = document.getElementById('cartTrackTxt');
  var cartEq = document.getElementById('cartEq');
  var cartProg = document.getElementById('cartProg');
  var cartProgTrack = document.getElementById('cartProgTrack');
  var cartProgFill = document.getElementById('cartProgFill');
  var cartTime = document.getElementById('cartTime');
  var flashEl = document.getElementById('flash');
  var themewashEl = document.getElementById('themewash');

  var mini = document.getElementById('mini');
  var miniBtn = document.getElementById('miniBtn');
  var miniFill = document.getElementById('miniFill');
  var miniClose = document.getElementById('miniClose');
  var miniHidden = false;

  var AUDIO_SRC = 'assets/audio/sweet-child-o-mine.mp3';
  var GNR_TRACK = "SWEET CHILD O' MINE";
  var GNR_ARTIST = "Guns N' Roses";

  // ticker original text is captured so the GNR swap can be reverted
  var tickerItems = [].slice.call(document.querySelectorAll('.ticker__item'));
  var tickerBackup = tickerItems.map(function (el) { return el.innerHTML; });

  // section command lines get a temporary GNR flavour
  var sectCmds = [].slice.call(document.querySelectorAll('.sect__cmd'));
  var sectCmdsBackup = sectCmds.map(function (el) { return el.innerHTML; });

  var GNR_TICKER = [
    '<b>NOW:</b> SWEET CHILD O&#39; MINE &#9835; GUNS N&#39; ROSES',
    '<b>PLAYING:</b> APPETITE FOR DESTRUCTION &#9733; 1987',
    '<b>RIFF:</b> SHE&#39;S GOT A SMILE THAT SEEMS TO ME',
    'WHERE DO WE GO NOW &#9835; WHERE DO WE GO'
  ];

  var GNR_CMDS = {
    '#projects': 'C:\\> open quest_log --gnr',
    '#now':      'C:\\> tail -f appetite_for_destruction.log',
    '#skills':   'C:\\> inventory --equipped --rock',
    '#awards':   'C:\\> achievements --unlocked --gnr'
  };

  function fmtTime(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function ensureAudio() {
    if (audio) return audio;
    audio = new Audio();
    audio.preload = 'none';           // no download until the play button is pressed
    audio.src = AUDIO_SRC;
    audio.loop = true;                // loop, so the GNR theme never dies mid-song

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    return audio;
  }

  function setupAnalyser() {
    if (audioCtx || !audio) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      audioCtx = new AC();
      var src = audioCtx.createMediaElementSource(audio);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.82;
      src.connect(analyser);
      analyser.connect(audioCtx.destination);
      analyserData = new Uint8Array(analyser.frequencyBinCount);
    } catch (e) {
      audioCtx = null;
      analyser = null;
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(function () {});
    }
  }

  function beatLoop(t) {
    if (!analyser || !analyserData) return;
    analyser.getByteFrequencyData(analyserData);
    var sum = 0;
    var bins = Math.min(analyserData.length, 24); // bass + low mids carry the beat
    for (var i = 0; i < bins; i++) sum += analyserData[i];
    var inst = sum / bins;                      // 0..255, current energy
    // pulse on transients (kick hits) instead of raw loudness:
    // a slow baseline follows the song, the level is the deviation above it
    beatAvg = beatAvg * 0.96 + inst * 0.04;
    var level = Math.max(0, Math.min(1, (inst - beatAvg) / 70 + 0.3));
    // paint at ~30fps, the CSS var does the rest
    if (t - lastBeatPaint > 33) {
      document.documentElement.style.setProperty('--beat', level.toFixed(3));
      drawViz();
      lastBeatPaint = t;
    }
    beatRaf = window.requestAnimationFrame(beatLoop);
  }

  /* ---------- spectrum visualizer: chunky pixel bars, bottom of screen ---------- */
  var viz = document.getElementById('viz');
  var vizCtx = viz ? viz.getContext('2d') : null;

  function drawViz() {
    if (!vizCtx || !analyserData || !gnrActive) return;
    var W = viz.width;
    var H = viz.height;
    vizCtx.clearRect(0, 0, W, H);
    var bars = 32;
    var bw = Math.floor(W / bars);       // 10px column
    var step = Math.max(1, Math.floor(analyserData.length / bars));
    var blockH = 6;
    for (var i = 0; i < bars; i++) {
      var v = analyserData[i * step] / 255;
      var h = Math.pow(v, 0.85) * H;      // gentle curve, bass-heavy mix
      var blocks = Math.max(1, Math.round(h / blockH));
      for (var b = 0; b < blocks; b++) {
        var y = H - (b + 1) * blockH;
        if (y < 0) break;
        // gold at the base, orange mid, red at the peak
        var col = b < blocks * 0.5 ? '#ffd34d' : (b < blocks * 0.8 ? '#ff8a3d' : '#d32f2f');
        vizCtx.fillStyle = col;
        vizCtx.fillRect(i * bw + 1, y + 1, bw - 2, blockH - 2);
      }
    }
  }

  function clearViz() {
    if (vizCtx) vizCtx.clearRect(0, 0, viz.width, viz.height);
  }

  function startBeat() {
    if (!analyser) return;
    if (beatRaf) window.cancelAnimationFrame(beatRaf);
    beatAvg = 120;                // fresh baseline for each playback start
    beatRaf = window.requestAnimationFrame(beatLoop);
  }

  function stopBeat() {
    if (beatRaf) window.cancelAnimationFrame(beatRaf);
    beatRaf = null;
    document.documentElement.style.setProperty('--beat', '0');
    clearViz();
  }

  /* ---------- theme swap ---------- */
  function enterGnrTheme() {
    gnrActive = true;
    applyTheme('gnr', 380);           // fast, soft cross-fade
    swapTicker(true);
    swapSectCmds(true);
  }

  function leaveGnrTheme() {
    gnrActive = false;
    applyTheme(baseTheme, 900);       // slow, gentle return to the base theme
    swapTicker(false);
    swapSectCmds(false);
    stopBeat();
  }

  function swapTicker(on) {
    tickerItems.forEach(function (el, i) {
      if (on) el.innerHTML = GNR_TICKER[i % GNR_TICKER.length];
      else el.innerHTML = tickerBackup[i];
    });
  }

  function swapSectCmds(on) {
    sectCmds.forEach(function (el, i) {
      var id = el.closest('section') ? '#' + el.closest('section').id : '';
      if (on && GNR_CMDS[id]) el.innerHTML = GNR_CMDS[id];
      else el.innerHTML = sectCmdsBackup[i];
    });
  }

  /* ---------- player UI ---------- */
  var hasStarted = false;   // true once the song has been started at least once

  // the LCD is narrow: long titles scroll across it like a real deck display
  function fitTrackTitle() {
    if (!cartTrack || !cartTrackTxt) return;
    cartTrack.classList.remove('is-scroll');
    cartTrackTxt.style.transform = '';
    var avail = cartTrack.clientWidth;
    var need = cartTrackTxt.offsetWidth;
    if (need > avail + 2) {
      var shift = need - avail;
      cartTrack.style.setProperty('--lcd-shift', '-' + shift + 'px');
      cartTrack.style.setProperty('--lcd-steps', Math.max(16, Math.min(64, Math.round(shift / 2))));
      cartTrack.style.setProperty('--lcd-dur', Math.max(6, Math.round(shift / 9)) + 's');
      cartTrack.classList.add('is-scroll');
    }
  }
  window.addEventListener('resize', fitTrackTitle);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTrackTitle);

  function paintPlaying(on) {
    if (on) hasStarted = true;
    isPlaying = on;
    if (cartEl) cartEl.classList.toggle('is-playing', on);
    if (cartCover) cartCover.hidden = !hasStarted;
    if (cartGlyph) cartGlyph.hidden = hasStarted;
    if (cartEq) cartEq.hidden = !on;
    if (cartProg) cartProg.hidden = !hasStarted;
    if (miniBtn) miniBtn.classList.toggle('is-paused', !on);
    if (cartPlay) {
      cartPlay.setAttribute('aria-label', on
        ? "Pause Sweet Child O' Mine"
        : "Play Sweet Child O' Mine by Guns N' Roses");
      cartPlay.title = on ? 'Pause' : "Play Sweet Child O' Mine";
    }
    if (miniBtn) miniBtn.setAttribute('aria-label', on ? 'Pause' : 'Play');
    if (cartLabel) cartLabel.textContent = on ? 'NOW PLAYING' : (hasStarted ? 'PAUSED' : 'NOW PLAYING');
    if (cartTrackTxt && hasStarted) cartTrackTxt.textContent = GNR_TRACK;
    window.requestAnimationFrame(fitTrackTitle);
  }

  function onPlay() {
    paintPlaying(true);
    enterGnrTheme();
    startBeat();
    miniHidden = false;
    updateMini();
  }

  function onPause() {
    paintPlaying(false);
    updateMini(); // keep the mini reachable so resume is one tap away
    // gentle gradient back to whatever theme was set before the song
    if (!audio || audio.ended) return;
    leaveGnrTheme();
  }

  function onEnded() {
    // loop is on, so 'ended' only fires if loop is unsupported; treat like pause
    paintPlaying(false);
    leaveGnrTheme();
  }

  function onTimeUpdate() {
    if (!audio) return;
    var pct = 0;
    if (audio.duration) pct = (audio.currentTime / audio.duration) * 100;
    if (cartProgFill) cartProgFill.style.width = pct + '%';
    if (miniFill) miniFill.style.width = pct + '%';
    if (cartTime) cartTime.textContent = fmtTime(audio.currentTime);
    if (cartProgTrack) cartProgTrack.setAttribute('aria-valuenow', Math.round(pct));
    updateMini();
  }

  function seekToPct(pct) {
    if (!audio || !audio.duration) return;
    audio.currentTime = Math.max(0, Math.min(1, pct)) * audio.duration;
  }

  /* ---------- mini player visibility ---------- */
  function updateMini() {
    if (!mini || !cartEl) return;
    // stays on screen once the song has started, even when paused,
    // so the resume button is always reachable while scrolled away
    if (miniHidden || !hasStarted) {
      mini.classList.remove('is-on');
      mini.setAttribute('aria-hidden', 'true');
      return;
    }
    var rect = cartEl.getBoundingClientRect();
    var cartOut = rect.bottom < 0 || rect.top > window.innerHeight;
    mini.classList.toggle('is-on', cartOut);
    mini.setAttribute('aria-hidden', cartOut ? 'false' : 'true');
  }

  /* ---------- the big moment: boot flash, then the riff ---------- */
  function startPlayback(withBoot) {
    var a = ensureAudio();
    setupAnalyser();

    function go() {
      var p = a.play();
      if (p && p.catch) {
        p.catch(function () {
          paintPlaying(false);
          showToast('SYSTEM', 'Audio blocked', 'The browser refused playback. Press play once more.', true);
        });
      }
    }

    if (withBoot && !reduced && flashEl) {
      // full boot flash on the very first press;
      // the riff hits right as the theme reveals
      flashEl.classList.remove('is-boot', 'is-short');
      void flashEl.offsetWidth;
      flashEl.classList.add('is-boot');
      window.setTimeout(function () {
        go();
      }, 900);
    } else {
      // resume after a pause: short flash, not the full boot
      if (flashEl && !reduced) {
        flashEl.classList.remove('is-boot', 'is-short');
        void flashEl.offsetWidth;
        flashEl.classList.add('is-short');
      }
      go();
    }
  }

  if (cartPlay) {
    cartPlay.addEventListener('click', function () {
      var a = ensureAudio();
      if (a.paused) {
        // boot flash only on the very first press; resume gets a short flash
        startPlayback(a.currentTime === 0);
      } else {
        a.pause();
      }
    });
  }

  if (miniBtn) {
    miniBtn.addEventListener('click', function () {
      if (!audio) return;
      if (audio.paused) {
        // resume: short flash, not the full boot
        if (flashEl && !reduced) {
          flashEl.classList.remove('is-boot', 'is-short');
          void flashEl.offsetWidth;
          flashEl.classList.add('is-short');
        }
        var p = audio.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        audio.pause();
      }
    });
  }

  if (miniClose) {
    miniClose.addEventListener('click', function () {
      miniHidden = true;
      if (mini) mini.classList.remove('is-on');
    });
  }

  // scrubbing on the cartridge progress bar
  function scrubFromEvent(e) {
    var rect = cartProgTrack.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    seekToPct(x / rect.width);
  }

  if (cartProgTrack) {
    cartProgTrack.addEventListener('click', function (e) {
      if (audio) scrubFromEvent(e);
    });
    cartProgTrack.addEventListener('keydown', function (e) {
      if (!audio || !audio.duration) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        audio.currentTime = Math.max(0, audio.currentTime - 10);
      } else if (e.key === 'Home') {
        e.preventDefault();
        audio.currentTime = 0;
      }
    });
  }

  window.addEventListener('scroll', updateMini, { passive: true });
  window.addEventListener('resize', updateMini);

  // pause the audio when the tab is hidden for a long time? No: keep playing,
  // it is the user's music. But if the page unloads nothing to clean up.

})();
