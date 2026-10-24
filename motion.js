/* ============================================================
   MOTION EFFECTS - Motion library polish layer for FARREL.OS
   Ported from motion.dev example snippets (grid stagger, scroll
   highlight, cursor floating target, press, gallery tilt,
   ticker, command palette, toast stack), adapted to the retro
   pixel shell.

   Integration rules (important):
   - script.js already owns scroll reveal (.reveal/.is-in) and
     section-title scramble. Motion does NOT retouch those
     elements. It adds only complementary effects: cursor
     reticle, magnetic CTA, button press, card tilt, footer
     ticker, section-rule draw, title outline highlight, and the
     palette/toast entrances via window.MotionFX hooks.
   - hero entrance is owned by motion.js but only fired once
     after boot dismissal via window.MotionFX.heroIn().
   - reduced-motion / missing Motion = this file exits early;
     nothing is hidden for those users.
   ============================================================ */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var M = window.Motion;
  if (reduced || !M || typeof M.animate !== 'function') return;

  var EASE = [0.16, 1, 0.3, 1]; /* easeOutExpo: snappy, premium */

  function fin(a) { if (a && a.finished) a.finished.catch(function () {}); }

  /* ==========================================================
     1. HERO STAGGER - after the boot is dismissed the hero
     assembles (motion.dev "stagger from edges"). Hero children
     are NOT in script.js's reveal set, so Motion owns them.
     Fired via window.MotionFX.heroIn() from script.js.
     ========================================================== */
  function heroStagger() {
    var els = document.querySelectorAll(
      '.hero__kicker, .hero__line1, .hero__line2, .hero__sub, ' +
      '.hero__cta, .qstats, .qstat, .cart');
    if (!els.length) return;
    fin(M.animate(els, { opacity: [0, 1], y: [36, 0] }, {
      duration: 0.78,
      delay: M.stagger(0.07, { startDelay: 0.1 }),
      easing: EASE
    }));
  }

  /* ==========================================================
     2. SECTION-RULE DRAW - the terminal rule under each section
     head draws left to right on first view.
     ========================================================== */
  function ruleDraw() {
    var rules = document.querySelectorAll('.sect__rule');
    if (!rules.length) return;
    for (var i = 0; i < rules.length; i++) {
      (function (el) {
        fin(M.animate(el, { scaleX: [0, 1] }, {
          duration: 0.9, delay: 0.18, easing: EASE
        }));
      })(rules[i]);
    }
  }

  /* ==========================================================
     3. SCROLL HIGHLIGHT - the section title fills from outline
     to solid as it crosses the viewport (motion.dev "scroll
     highlight"). Outline drawn in the live theme colour.
     ========================================================== */
  function scrollHighlight() {
    var heads = document.querySelectorAll('.sect__head');
    for (var i = 0; i < heads.length; i++) {
      (function (el) {
        var title = el.querySelector('.sect__title');
        if (!title) return;
        var twin = document.createElement('span');
        twin.setAttribute('aria-hidden', 'true');
        twin.className = 'hl-twin';
        twin.style.cssText = 'position:absolute;left:0;top:0;width:100%;pointer-events:none;' +
          'color:transparent;-webkit-text-stroke:1px var(--cyan);clip-path:inset(100% 0 0 0);';
        twin.textContent = title.getAttribute('data-final') || title.textContent;
        el.appendChild(twin);
        fin(M.scroll(M.animate(twin, {
          clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)']
        }, { ease: 'linear' })));
      })(heads[i]);
    }
  }

  /* ==========================================================
     4. CURSOR RETICLE - four pixel brackets chase the pointer
     with a spring (motion.dev "cursor floating target") and
     snap open over anything clickable.
     ========================================================== */
  function cursorTarget() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    var ring = document.createElement('div');
    ring.className = 'mret';
    ring.setAttribute('aria-hidden', 'true');
    ring.innerHTML = '<i></i><i></i><i></i><i></i>';
    document.body.appendChild(ring);

    var visible = false;
    document.addEventListener('mousemove', function (e) {
      if (!visible) { visible = true; fin(M.animate(ring, { opacity: 1 }, { duration: 0.3 })); }
      fin(M.animate(ring, { left: e.clientX, top: e.clientY }, {
        duration: 0.5, ease: 'spring', stiffness: 250, damping: 24
      }));
    }, { passive: true });

    document.addEventListener('mouseover', function (e) {
      var hot = e.target.closest && e.target.closest('a, button, input, .quest, .sky__moon');
      fin(M.animate(ring, { scale: hot ? 1.7 : 1, rotate: hot ? 45 : 0 },
        { duration: 0.32, easing: EASE }));
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      visible = false;
      fin(M.animate(ring, { opacity: 0 }, { duration: 0.25 }));
    });
  }

  /* ==========================================================
     5. MAGNETIC BUTTONS - CTAs lean toward the cursor
     ========================================================== */
  function magneticButtons() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    var btns = document.querySelectorAll('.btn, .quest__open');
    for (var i = 0; i < btns.length; i++) {
      (function (b) {
        b.addEventListener('mousemove', function (e) {
          var r = b.getBoundingClientRect();
          var dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
          var dy = (e.clientY - (r.top + r.height / 2)) * 0.34;
          fin(M.animate(b, { x: dx, y: dy }, { duration: 0.4, easing: EASE }));
        });
        b.addEventListener('mouseleave', function () {
          fin(M.animate(b, { x: 0, y: 0 },
            { duration: 0.55, ease: 'spring', stiffness: 320, damping: 18 }));
        });
      })(btns[i]);
    }
  }

  /* ==========================================================
     6. PRESS - chunky buttons press in with a Motion spring
     (motion.dev "press")
     ========================================================== */
  function pressFeedback() {
    var SEL = '.btn, .boot__btn, .sky__moon, #runBtn, .quest__open, .foot__copy, .proj__pg';
    document.addEventListener('pointerdown', function (e) {
      var b = e.target.closest && e.target.closest(SEL);
      if (b) fin(M.animate(b, { scale: 0.955 }, { duration: 0.1, easing: 'easeOut' }));
    }, { passive: true });
    document.addEventListener('pointerup', function (e) {
      var b = e.target.closest && e.target.closest(SEL);
      if (b) fin(M.animate(b, { scale: 1 },
        { duration: 0.45, ease: 'spring', stiffness: 430, damping: 15 }));
    }, { passive: true });
  }

  /* ==========================================================
     7. CARD TILT - project cards tip toward the pointer
     (motion.dev "gallery tilt"). Motion composes transforms; the
     CSS uses the individual `translate` property for the hover
     lift so it does not fight rotateX/rotateY.
     ========================================================== */
  function cardTilt() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    var cards = document.querySelectorAll('.quest');
    for (var i = 0; i < cards.length; i++) {
      (function (c) {
        c.addEventListener('mousemove', function (e) {
          var r = c.getBoundingClientRect();
          var rx = ((e.clientY - r.top) / r.height - 0.5) * -5;
          var ry = ((e.clientX - r.left) / r.width - 0.5) * 7;
          fin(M.animate(c, { rotateX: rx, rotateY: ry }, { duration: 0.35, easing: EASE }));
        });
        c.addEventListener('mouseleave', function () {
          fin(M.animate(c, { rotateX: 0, rotateY: 0 },
            { duration: 0.6, ease: 'spring', stiffness: 220, damping: 17 }));
        });
      })(cards[i]);
    }
  }

  /* ==========================================================
     8. FOOTER TICKER - endless status strip (motion.dev "Ticker")
     Content is duplicated for a seamless loop.
     ========================================================== */
  function ticker() {
    var strip = document.querySelector('.foot__ticker');
    if (!strip) return;
    var inner = strip.querySelector('.foot__ticker-in');
    if (!inner) return;
    if (!inner.textContent.trim()) {
      var words = ['FARREL.OS v2.0','ELECTRICAL ENGINEERING','ESP32','KICAD','POWER ELECTRONICS','ANALOG AUDIO','AGENTIC AI','ITS SURABAYA','SOLDERING','SUTET'];
      var out = '';
      for (var i = 0; i < 2; i++) for (var j = 0; j < words.length; j++) out += '<span>' + words[j] + '</span>';
      inner.innerHTML = out;
    }
    var w = inner.scrollWidth / 2;
    if (!w) return;
    strip.style.overflow = 'hidden';
    fin(M.animate(inner, { x: [0, -w] }, {
      duration: Math.max(18, w / 40),
      ease: 'linear',
      repeat: Infinity
    }));
  }

  /* ==========================================================
     Hooks exposed for script.js / project.js integration
     ========================================================== */
  window.MotionFX = {
    /* called once when the boot overlay dismisses */
    heroIn: heroStagger,
    /* project detail page entrance, called after render */
    detailEntrance: function () {
      var els = document.querySelectorAll(
        '.proj__crumb, .proj__cmd, .proj__title, .proj__sub, .proj__hero, .proj__grid, .proj__gal, .proj__pager');
      if (!els.length) return;
      fin(M.animate(els, { opacity: [0, 1], y: [28, 0] }, {
        duration: 0.66, delay: M.stagger(0.08), easing: EASE
      }));
    },
    /* palette entrance + item cascade (motion.dev "Command Palette") */
    openPalette: function () {
      var back = document.querySelector('.pal__back');
      var win = document.querySelector('.pal__win');
      if (back) fin(M.animate(back, { opacity: [0, 1] }, { duration: 0.22 }));
      if (win) fin(M.animate(win, { opacity: [0, 1], y: [20, 0], scale: [0.97, 1] },
        { duration: 0.35, easing: EASE }));
      window.MotionFX.cascadeItems();
      var row = document.querySelector('.pal__row');
      if (row) fin(M.animate(row, { opacity: [0, 1] }, { duration: 0.28, delay: 0.04 }));
    },
    cascadeItems: function () {
      var items = document.querySelectorAll('.pal__item');
      if (items.length) {
        fin(M.animate(items, { opacity: [0, 1], x: [-12, 0] }, {
          duration: 0.26, delay: M.stagger(0.03), easing: EASE
        }));
      }
    },
    /* toast stack (motion.dev "Toast: stacked notifications") */
    toastIn: function (el) {
      fin(M.animate(el, { opacity: [0, 1], x: [44, 0], scale: [0.97, 1] },
        { duration: 0.42, easing: EASE }));
    },
    toastOut: function (el, done) {
      var a = M.animate(el, { opacity: 0, x: 34 }, { duration: 0.26, easing: 'easeIn' });
      if (a.finished) a.finished.then(done).catch(done);
      else window.setTimeout(done, 260);
    }
  };

  /* ==========================================================
     boot - complementary effects only, runs on DOMContentLoaded
     ========================================================== */
  function boot() {
    ruleDraw();
    scrollHighlight();
    cursorTarget();
    magneticButtons();
    pressFeedback();
    cardTilt();
    ticker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
