/* ============================================================
   FARREL.OS - interactions
   1. Boot sequence (typewriter, skippable)
   2. Starfield canvas (GPU friendly, reduced-motion aware)
   3. Taskbar clock
   4. Scroll reveal
   5. Sunset / night theme toggle (click the moon)
   6. Command palette (RUN.EXE, Ctrl+K)
   7. Achievements + toasts
   8. Interactive terminal
   9. Scroll progress + cursor spotlight + card spotlight
   10. Animated counters
   11. Text scramble on section titles
   12. Copy site link, Konami code
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
    unlock('boot');
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

  function drawStars(t) {
    if (!ctx) return;
    var w = window.innerWidth;
    var h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    var isSunset = document.documentElement.getAttribute('data-theme') === 'sunset';
    var cols = isSunset ? SUNSET_COLORS : NIGHT_COLORS;
    var alphaMult = isSunset ? 0.4 : 1;

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
     5. SUNSET / NIGHT THEME TOGGLE (click the moon)
     ========================================================== */
  var moonBtn = document.getElementById('moonBtn');
  var themeMeta = document.getElementById('themeColor');

  function updateThemeMeta(isSunset) {
    if (themeMeta) themeMeta.setAttribute('content', isSunset ? '#1c0b2e' : '#0a0e27');
    if (moonBtn) {
      moonBtn.setAttribute('aria-pressed', isSunset ? 'true' : 'false');
      moonBtn.setAttribute('aria-label', isSunset ? 'Switch to night theme' : 'Switch to sunset theme');
      moonBtn.setAttribute('title', isSunset ? 'Night mode' : 'Sunset mode');
    }
  }

  function setTheme(sunset) {
    var doc = document.documentElement;
    doc.classList.add('theme-fading');
    if (sunset) {
      doc.setAttribute('data-theme', 'sunset');
      try { localStorage.setItem('farrel-theme', 'sunset'); } catch (e) {}
    } else {
      doc.removeAttribute('data-theme');
      try { localStorage.setItem('farrel-theme', 'night'); } catch (e) {}
    }
    updateThemeMeta(sunset);
    if (reduced || !ctx) {
      doc.classList.remove('theme-fading');
    } else {
      window.setTimeout(function () { doc.classList.remove('theme-fading'); }, 460);
    }
  }

  updateThemeMeta(document.documentElement.getAttribute('data-theme') === 'sunset');

  if (moonBtn) {
    moonBtn.addEventListener('click', function () {
      var nextSunset = document.documentElement.getAttribute('data-theme') !== 'sunset';
      setTheme(nextSunset);
      unlock('theme');
    });
  }

  /* ==========================================================
     6. TOASTS + ACHIEVEMENTS
     ========================================================== */
  var toastWrap = document.getElementById('toasts');
  var achvCountEl = document.getElementById('achvCount');
  var achvBtn = document.getElementById('achvBtn');

  var ACHIEVEMENTS = [
    { id: 'boot',     ico: '\u25B6', name: 'SYSTEM ONLINE',  desc: 'Booted FARREL.OS and pressed start.' },
    { id: 'theme',    ico: '\u25D0', name: 'NIGHT SHIFT',     desc: 'Switched between night and sunset themes.' },
    { id: 'palette',  ico: '\u2318', name: 'POWER USER',      desc: 'Opened RUN.EXE with Ctrl+K.' },
    { id: 'terminal', ico: '\u25B6', name: 'COMMAND LINE',    desc: 'Ran a command in the contact terminal.' },
    { id: 'copy',     ico: '\u29C9', name: 'SHARE',           desc: 'Copied the site link to the clipboard.' },
    { id: 'linkedin', ico: '\u260E', name: 'NETWORKER',       desc: 'Opened LinkedIn from the site.' },
    { id: 'github',   ico: '\u2699', name: 'OPEN SOURCE',     desc: 'Opened GitHub from the site.' },
    { id: 'explorer', ico: '\u2193', name: 'EXPLORER',        desc: 'Scrolled all the way to the bottom.' },
    { id: 'konami',   ico: '\u2605', name: 'CHEAT CODE',      desc: 'Entered the Konami code.' }
  ];

  var unlockedSet = {};
  try {
    var saved = window.localStorage.getItem('farrel-achv');
    if (saved) unlockedSet = JSON.parse(saved) || {};
  } catch (e) { unlockedSet = {}; }

  function saveAchv() {
    try { window.localStorage.setItem('farrel-achv', JSON.stringify(unlockedSet)); } catch (e) {}
  }

  function updateAchvCount() {
    if (!achvCountEl) return;
    var n = 0;
    for (var id in unlockedSet) { if (unlockedSet[id]) n++; }
    achvCountEl.textContent = n + '/' + ACHIEVEMENTS.length;
  }

  function unlock(id) {
    if (unlockedSet[id]) return;
    for (var i = 0; i < ACHIEVEMENTS.length; i++) {
      if (ACHIEVEMENTS[i].id === id) {
        unlockedSet[id] = true;
        saveAchv();
        updateAchvCount();
        showToast('ACHIEVEMENT UNLOCKED', ACHIEVEMENTS[i].name, ACHIEVEMENTS[i].desc);
        return;
      }
    }
  }

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

  updateAchvCount();

  /* ---------- achievements window ---------- */
  var achvWin = null;

  function buildAchvWindow() {
    var wrap = document.createElement('div');
    wrap.className = 'pal';
    wrap.setAttribute('hidden', '');

    var back = document.createElement('div');
    back.className = 'pal__back';

    var win = document.createElement('div');
    win.className = 'pal__win win';
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-modal', 'true');
    win.setAttribute('aria-label', 'Achievements');

    var bar = document.createElement('div');
    bar.className = 'win__bar win__bar--pal';
    var title = document.createElement('span');
    title.className = 'win__title';
    title.textContent = 'ACHV.EXE';
    var ctrls = document.createElement('span');
    ctrls.className = 'win__ctrls';
    ctrls.setAttribute('aria-hidden', 'true');
    ctrls.innerHTML = '<i></i><i></i><i></i>';
    bar.appendChild(title);
    bar.appendChild(ctrls);

    var body = document.createElement('div');
    body.className = 'win__body achv__body';

    var sub = document.createElement('p');
    sub.className = 'achv__sub';
    var list = document.createElement('div');
    list.className = 'achv__list';

    var n = 0;
    for (var id in unlockedSet) { if (unlockedSet[id]) n++; }
    sub.textContent = n + ' of ' + ACHIEVEMENTS.length + ' unlocked. Keep exploring.';

    ACHIEVEMENTS.forEach(function (a) {
      var item = document.createElement('div');
      item.className = 'achv__item' + (unlockedSet[a.id] ? '' : ' achv__item--locked');
      var ico = document.createElement('span');
      ico.className = 'achv__ico';
      ico.textContent = unlockedSet[a.id] ? a.ico : '?';
      var info = document.createElement('div');
      var nm = document.createElement('p');
      nm.className = 'achv__name';
      nm.textContent = unlockedSet[a.id] ? a.name : 'LOCKED';
      var ds = document.createElement('p');
      ds.className = 'achv__desc';
      ds.textContent = a.desc;
      info.appendChild(nm);
      info.appendChild(ds);
      item.appendChild(ico);
      item.appendChild(info);
      list.appendChild(item);
    });

    body.appendChild(sub);
    body.appendChild(list);
    win.appendChild(bar);
    win.appendChild(body);
    wrap.appendChild(back);
    wrap.appendChild(win);
    document.body.appendChild(wrap);

    function close() {
      wrap.setAttribute('hidden', '');
      if (achvBtn) achvBtn.focus();
    }
    back.addEventListener('click', close);
    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    return { wrap: wrap, close: close };
  }

  if (achvBtn) {
    achvBtn.addEventListener('click', function () {
      if (!achvWin) achvWin = buildAchvWindow();
      achvWin.wrap.removeAttribute('hidden');
      achvWin.wrap.setAttribute('tabindex', '-1');
      achvWin.wrap.focus();
    });
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
        unlock('theme');
      } },
    { key: 'achv',     label: 'View achievements',   run: function () {
        if (achvBtn) achvBtn.click();
      } },
    { key: 'copy',     label: 'Copy site link',      run: copySiteLink },
    { key: 'github',   label: 'Open GitHub profile', run: function () {
        window.open('https://github.com/makhashimas', '_blank', 'noopener');
        unlock('github');
      } },
    { key: 'linkedin', label: 'Open LinkedIn profile', run: function () {
        window.open('https://www.linkedin.com/in/farrel-fayzul-haqqi-26a31b29b', '_blank', 'noopener');
        unlock('linkedin');
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
    unlock('palette');
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
        unlock('theme');
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
        unlock('terminal');
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

  // bottom of page achievement
  var explorerHit = false;
  window.addEventListener('scroll', function () {
    if (explorerHit) return;
    var doc = document.documentElement;
    if (window.scrollY + window.innerHeight >= doc.scrollHeight - 80) {
      explorerHit = true;
      unlock('explorer');
    }
  }, { passive: true });

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
      unlock('copy');
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

  // LinkedIn / GitHub unlocks, wherever they are clicked
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('linkedin.com') !== -1) unlock('linkedin');
    if (href.indexOf('github.com') !== -1) unlock('github');
  });

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
        unlock('konami');
        showToast('CHEAT ACCEPTED', '30 lives granted', 'Konami mode on. It will settle after a while.', true);
        window.setTimeout(function () {
          document.documentElement.classList.remove('konami');
        }, 12000);
      }
    } else {
      konamiPos = (key === KONAMI[0]) ? 1 : 0;
    }
  });

})();
