/* ============================================================
   HORIZON BACKDROP - pixel far landscape
   The starfield canvas keeps the sky; this canvas draws the far
   horizon: a distant lit city skyline and a village in front of
   it, utility poles and two SUTET transmission towers with
   sagging cables (electrical engineering nod). The sunset theme
   swaps the sky for drifting evening clouds.
   Windows twinkle slowly and rarely, like distant lamps.
   Static layers are cached per theme; per frame only lights,
   clouds and (when there is no starfield canvas) stars move.
   ============================================================ */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cv = document.getElementById('horizon');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var base = document.createElement('canvas');
  var bctx = base.getContext('2d');

  var W = 0, H = 0, dpr = 1;
  var hasSky = !!document.getElementById('sky'); // false on project.html
  var themeKey = 'night';
  var baseTheme = null;
  var dirty = true;
  var raf = null;
  var running = false;

  var lights = [];
  var clouds = [];
  var ownStars = [];
  var shoot = [];
  var lastShoot = 0;
  var sc = {};

  var PAL = {
    night: {
      far: '#1b2552', mid: '#101636', fg: '#070a1b', ground: '#050712',
      wire: '#31406e', lamp: '#ffd34d', halo: 'rgba(255,211,77,.13)',
      starC: ['#e8ecf7', '#3de8c4', '#ffd34d', '#4fc3e8'], starA: 1,
      cloud: null
    },
    sunset: {
      far: '#6e3a63', mid: '#472047', fg: '#2b1030', ground: '#1f0b24',
      wire: '#8a5a86', lamp: '#ffd34d', halo: 'rgba(255,211,77,.15)',
      starC: ['#fff1e4', '#ff9a5c', '#ffd93d', '#ff4d6d'], starA: 0.4,
      cloud: ['#6b3363', '#8a4477', '#b25a6a', '#e07a52']
    },
    gnr: {
      far: '#452024', mid: '#231012', fg: '#120608', ground: '#0b0405',
      wire: '#5a2a30', lamp: '#ffd34d', halo: 'rgba(255,211,77,.15)',
      starC: ['#f5e7cd', '#ffb347', '#ffd34d', '#d32f2f'], starA: 0.8,
      cloud: null
    }
  };

  function themeNow() {
    var t = document.documentElement.getAttribute('data-theme');
    return PAL[t] ? t : 'night';
  }

  /* seeded rng so the scene layout survives resizes */
  var seed = 1;
  function srand(s) { seed = s >>> 0; }
  function rnd() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  function ri(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
  function rf(a, b) { return a + rnd() * (b - a); }

  function px(g, x, y, w, h, c) {
    g.fillStyle = c;
    g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  /* stair-stepped pixel line: 2x2 squares along a segment */
  function pxLine(g, x0, y0, x1, y1, c) {
    g.fillStyle = c;
    var dx = x1 - x0, dy = y1 - y0;
    var n = Math.max(1, Math.round(Math.max(Math.abs(dx), Math.abs(dy))));
    for (var i = 0; i <= n; i++) {
      var t = i / n;
      g.fillRect(Math.round(x0 + dx * t), Math.round(y0 + dy * t), 2, 2);
    }
  }

  /* sagging catenary cable between two anchor points */
  function cable(g, x0, y0, x1, y1, sag, c) {
    g.fillStyle = c;
    var n = Math.max(2, Math.round(Math.abs(x1 - x0) / 5));
    for (var i = 0; i <= n; i++) {
      var t = i / n;
      var x = x0 + (x1 - x0) * t;
      var y = y0 + (y1 - y0) * t + sag * 4 * t * (1 - t);
      g.fillRect(Math.round(x), Math.round(y), 2, 2);
    }
  }

  function addLight(x, y, w, h, c, mode) {
    lights.push({
      x: Math.round(x), y: Math.round(y), w: w, h: h, c: c,
      mode: mode || 'slow',
      phase: rnd(), period: rf(11, 30), onR: rf(0.58, 0.94),
      halo: mode === 'lamp'
    });
  }

  /* ---------- scene geometry (built once per resize) ---------- */
  function buildScene() {
    srand(91731);
    lights = [];
    clouds = [];
    ownStars = [];
    shoot = [];
    lastShoot = 0;

    var k = Math.max(0.62, Math.min(1.35, W / 1440));
    var farY = Math.round(H - H * 0.075);
    var midY = Math.round(H - H * 0.055);
    var fgY  = Math.round(H - H * 0.030);
    sc = { farY: farY, midY: midY, fgY: fgY, skyline: [], houses: [], trees: [], poles: [], sutet: [] };

    /* --- distant city skyline, clustered to the right --- */
    var warm = '#ffd34d', cool = '#a8e4ff';
    var clusters = [
      { x0: 0.60, x1: 1.02, hMin: 16, hMax: 64 },
      { x0: 0.28, x1: 0.44, hMin: 12, hMax: 34 }
    ];
    for (var ci = 0; ci < clusters.length; ci++) {
      var cl = clusters[ci];
      var bx = cl.x0 * W;
      while (bx < cl.x1 * W) {
        var bw = Math.round(ri(10, 26) * k);
        var bh = Math.round(ri(cl.hMin, cl.hMax) * k);
        var bld = { x: Math.round(bx), w: bw, h: bh, ant: bh > 44 * k && rnd() < 0.5 };
        sc.skyline.push(bld);
        /* window grid */
        var cols = Math.max(1, Math.floor((bw - 4) / 5));
        var rows = Math.max(1, Math.floor((bh - 5) / 6));
        for (var c2 = 0; c2 < cols; c2++) {
          for (var r2 = 0; r2 < rows; r2++) {
            if (rnd() < 0.4) {
              addLight(bld.x + 2 + c2 * 5, farY - bh + 3 + r2 * 6, 2, 2, rnd() < 0.85 ? warm : cool);
            }
          }
        }
        bx += bw + Math.round(rf(3, 14) * k);
      }
    }

    /* --- village houses along the middle band --- */
    var hx = [];
    for (var hi = 0; hi < 15; hi++) {
      hx.push(rf(0.02, 0.97) * W);
    }
    hx.sort(function (a, b) { return a - b; });
    for (var hj = 0; hj < hx.length; hj++) {
      var hw = Math.round(ri(16, 30) * k);
      var hh = Math.round(ri(12, 22) * k);
      var roof = Math.round(ri(6, 10) * k);
      sc.houses.push({ x: Math.round(hx[hj]), w: hw, h: hh, roof: roof });
      var nWin = rnd() < 0.7 ? 2 : 1;
      for (var wi = 0; wi < nWin; wi++) {
        addLight(hx[hj] + 4 + wi * Math.max(7, hw * 0.4), midY - hh + 5 + (wi % 2) * 6, 3, 3, warm);
      }
    }

    /* --- trees between village and foreground --- */
    for (var tj = 0; tj < 20; tj++) {
      sc.trees.push({
        x: Math.round(rf(0.01, 0.99) * W),
        h: Math.round(ri(10, 22) * k),
        base: Math.round(rf(midY + 2, fgY + 8))
      });
    }

    /* --- distribution poles with crossarms --- */
    var poleRatios = [0.06, 0.20, 0.33, 0.46, 0.58, 0.70, 0.84, 0.95];
    for (var pj = 0; pj < poleRatios.length; pj++) {
      var ph = Math.round(rf(52, 76) * k);
      var pole = { x: Math.round(poleRatios[pj] * W), h: ph, lamp: pj % 3 === 0 };
      sc.poles.push(pole);
      if (pole.lamp) addLight(pole.x - 2, fgY + 6 - ph - 3, 4, 4, warm, 'lamp');
    }

    /* --- two big SUTET lattice towers at the sides --- */
    var tH = Math.round(Math.max(150, Math.min(300, H * 0.30)));
    sc.sutet = [
      { x: Math.round(0.13 * W), h: tH },
      { x: Math.round(0.83 * W), h: tH }
    ];
    for (var sj = 0; sj < sc.sutet.length; sj++) {
      /* red aviation beacon at the top */
      addLight(sc.sutet[sj].x - 1, fgY + 6 - tH - 5, 3, 3, '#ff4d5e', 'beacon');
    }

    /* --- evening clouds (sunset only) --- */
    for (var cj = 0; cj < 7; cj++) {
      clouds.push({
        x: rf(-120, W + 60),
        y: rf(H * 0.05, H * 0.52),
        s: rf(0.6, 1.5),
        speed: rf(2, 7),
        tone: ri(0, 2)
      });
    }

    /* --- own starfield for pages without the star canvas --- */
    if (!hasSky) {
      var count = Math.max(40, Math.min(150, Math.round((W * H) / 11000)));
      for (var si = 0; si < count; si++) {
        ownStars.push({
          x: Math.random() * W,
          y: Math.random() * (farY - 8),
          size: Math.random() < 0.82 ? 2 : 3,
          base: 0.25 + Math.random() * 0.55,
          speed: 0.4 + Math.random() * 1.3,
          phase: Math.random() * Math.PI * 2
        });
      }
    }
  }

  /* ---------- static layers, cached per theme ---------- */
  function drawTower(g, x, h, p) {
    var baseY = sc.fgY + 6;
    var topY = baseY - h;
    var col = p.fg;
    var wBase = Math.max(26, h * 0.15);
    var wTop = Math.max(8, h * 0.05);

    /* legs */
    pxLine(g, x - wBase / 2, baseY, x - wTop / 2, topY, col);
    pxLine(g, x + wBase / 2, baseY, x + wTop / 2, topY, col);

    /* horizontal braces + X pattern */
    for (var y = baseY - 6; y > topY + 6; y -= 16) {
      var f = (baseY - y) / h;
      var hw = (wBase + (wTop - wBase) * f) / 2;
      px(g, x - hw, y, hw * 2, 2, col);
      pxLine(g, x - hw, y, x + hw, y - 14, col);
      pxLine(g, x + hw, y, x - hw, y - 14, col);
    }

    /* three crossarms */
    var arms = [4, h * 0.15, h * 0.30];
    var armLen = wBase * 1.6;
    for (var a = 0; a < arms.length; a++) {
      var ay = topY + arms[a];
      px(g, x - armLen, ay, armLen * 2, 3, col);
      /* insulator stubs at the tips */
      px(g, x - armLen, ay - 4, 3, 5, col);
      px(g, x + armLen - 3, ay - 4, 3, 5, col);
      /* small struts */
      pxLine(g, x - armLen * 0.6, ay, x - wTop / 2, ay + 14, col);
      pxLine(g, x + armLen * 0.6, ay, x + wTop / 2, ay + 14, col);
    }
    /* crown */
    px(g, x - 2, topY - 6, 4, 7, col);
    return { topY: topY, arms: arms, armLen: armLen };
  }

  function drawPole(g, pole, p) {
    var baseY = sc.fgY + 6;
    var topY = baseY - pole.h;
    var col = p.fg;
    px(g, pole.x - 2, topY, 4, pole.h, col);
    px(g, pole.x - 12, topY + 4, 24, 3, col);
    px(g, pole.x - 9, topY + 15, 18, 3, col);
    /* insulators */
    px(g, pole.x - 12, topY + 1, 2, 4, col);
    px(g, pole.x + 10, topY + 1, 2, 4, col);
    return { armY: topY + 5 };
  }

  function drawBase(p) {
    bctx.clearRect(0, 0, W, H);
    var farY = sc.farY, midY = sc.midY, fgY = sc.fgY;

    /* far band + skyline */
    px(bctx, 0, farY, W, H - farY, p.far);
    for (var i = 0; i < sc.skyline.length; i++) {
      var b = sc.skyline[i];
      px(bctx, b.x, farY - b.h, b.w, b.h, p.far);
      if (b.ant) px(bctx, b.x + Math.floor(b.w / 2), farY - b.h - 7, 2, 7, p.far);
    }

    /* middle band + village houses */
    px(bctx, 0, midY, W, H - midY, p.mid);
    for (var j = 0; j < sc.houses.length; j++) {
      var hs = sc.houses[j];
      var bodyTop = midY - hs.h;
      px(bctx, hs.x, bodyTop, hs.w, hs.h, p.mid);
      /* stepped gable roof */
      var steps = 4;
      var stepW = Math.ceil(hs.w / (steps * 2));
      for (var s = 0; s < steps; s++) {
        px(bctx, hs.x - (steps - s) * stepW * 0.5, bodyTop - (steps - s) * (hs.roof / steps),
           hs.w + (steps - s) * stepW * 0.5 * 2 - stepW * 0.5, Math.ceil(hs.roof / steps) + 1, p.mid);
      }
    }

    /* foreground field */
    px(bctx, 0, fgY, W, H - fgY, p.fg);
    /* field texture rows (dashes) */
    srand(4477);
    bctx.fillStyle = p.ground;
    for (var d = 0; d < 46; d++) {
      var dx = Math.round(rf(0, W));
      var dy = Math.round(fgY + 6 + d * Math.max(3, (H - fgY) / 12) * 0.9);
      if (dy > H - 4) break;
      bctx.fillRect(dx, dy, Math.round(rf(6, 22)), 2);
    }

    /* trees */
    for (var t = 0; t < sc.trees.length; t++) {
      var tr = sc.trees[t];
      var tCol = tr.base > (midY + fgY) / 2 ? p.fg : p.mid;
      px(bctx, tr.x - 1, tr.base - 5, 3, 6, tCol);
      var cw = Math.round(tr.h * 0.8);
      px(bctx, tr.x - cw / 2, tr.base - 5 - tr.h * 0.6, cw, Math.round(tr.h * 0.55), tCol);
      px(bctx, tr.x - cw / 2 + 3, tr.base - 5 - tr.h, cw - 6, Math.round(tr.h * 0.45), tCol);
      px(bctx, tr.x - 2, tr.base - 5 - tr.h - 4, 5, 5, tCol);
    }

    /* distribution wires between pole arm heights */
    var poleTips = [];
    for (var q = 0; q < sc.poles.length; q++) {
      var dp = drawPole(bctx, sc.poles[q], p);
      poleTips.push({ x: sc.poles[q].x, y: dp.armY });
    }
    var wireY = sc.fgY + 6 - 60;
    for (var w2 = 0; w2 < poleTips.length - 1; w2++) {
      var a1 = poleTips[w2], b1 = poleTips[w2 + 1];
      cable(bctx, a1.x, a1.y, b1.x, b1.y, 7, p.wire);
      cable(bctx, a1.x, a1.y - 10, b1.x, b1.y - 10, 7, p.wire);
    }
    cable(bctx, -40, wireY, poleTips[0].x, poleTips[0].y, 9, p.wire);
    cable(bctx, poleTips[poleTips.length - 1].x, poleTips[poleTips.length - 1].y, W + 40, wireY, 9, p.wire);

    /* SUTET towers */
    var geo = [];
    for (var s2 = 0; s2 < sc.sutet.length; s2++) {
      geo.push(drawTower(bctx, sc.sutet[s2].x, sc.sutet[s2].h, p));
    }

    /* high voltage cables between the towers and off both edges */
    var t1 = sc.sutet[0], t2 = sc.sutet[1];
    var g1 = geo[0], g2 = geo[1];
    for (var la = 0; la < g1.arms.length; la++) {
      var y1 = g1.topY + g1.arms[la] + 4;
      var y2 = g2.topY + g2.arms[la] + 4;
      var sag1 = 12 + Math.abs(t2.x - t1.x) * 0.014;
      cable(bctx, -60, y1 + 8, t1.x - g1.armLen, y1, 8, p.wire);
      cable(bctx, t1.x + g1.armLen, y1, t2.x - g2.armLen, y2, sag1, p.wire);
      cable(bctx, t2.x + g2.armLen, y2, W + 60, y2 + 8, 8, p.wire);
    }
  }

  /* ---------- per frame pieces ---------- */
  function drawOwnStars(t) {
    var p = PAL[themeKey];
    for (var i = 0; i < ownStars.length; i++) {
      var s = ownStars[i];
      var flicker = 0.55 + 0.45 * Math.sin(t * 0.0011 * s.speed + s.phase);
      ctx.globalAlpha = Math.max(0.08, Math.min(1, s.base * flicker * p.starA));
      ctx.fillStyle = p.starC[i % p.starC.length];
      ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
    }
    ctx.globalAlpha = 1;

    /* shooting stars, same rhythm as the main starfield */
    if (t - lastShoot > 5200 && shoot.length < 1 && Math.random() < 0.6) {
      shoot.push({
        x: Math.random() * W * 0.5,
        y: Math.random() * H * 0.35,
        vx: 3.4 + Math.random() * 2.2,
        vy: 1.5 + Math.random() * 1.1,
        life: 68, maxLife: 68
      });
      lastShoot = t;
    }
    for (var j = shoot.length - 1; j >= 0; j--) {
      var m = shoot[j];
      m.x += m.vx; m.y += m.vy; m.life -= 1;
      ctx.globalAlpha = Math.max(0, (m.life / m.maxLife) * p.starA);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(m.x), Math.round(m.y), 3, 3);
      ctx.fillRect(Math.round(m.x - m.vx * 2), Math.round(m.y - m.vy * 2), 2, 2);
      if (m.life <= 0 || m.x > W + 40 || m.y > H + 40) shoot.splice(j, 1);
    }
    ctx.globalAlpha = 1;
  }

  /* pixel cumulus, drifts slowly across the evening sky */
  function drawClouds(t) {
    var tones = PAL.sunset.cloud;
    for (var i = 0; i < clouds.length; i++) {
      var C = clouds[i];
      var x = ((C.x + (C.speed * t) / 1000) % (W + 420)) - 210;
      var y = C.y, s = C.s;
      var cBase = tones[C.tone];
      var cTop = tones[Math.min(tones.length - 1, C.tone + 1)];
      var rows = [[0, 0, 66], [7, -8, 54], [15, -16, 42], [23, -24, 28]];
      px(ctx, x + 4 * s, y + 9 * s, 56 * s, 4 * s, tones[0]);
      for (var r = 0; r < rows.length; r++) {
        var row = rows[r];
        px(ctx, x + row[0] * s, y + row[1] * s, row[2] * s, 9 * s, r < 2 ? cBase : cTop);
      }
    }
  }

  function drawLights(p, t, force) {
    for (var i = 0; i < lights.length; i++) {
      var L = lights[i];
      var a = 1;
      if (!force) {
        if (L.mode === 'beacon') {
          a = (t % 2400) < 420 ? 1 : 0;
        } else {
          var loc = ((t / L.period) + L.phase) % 1;
          a = loc < L.onR ? 0.72 + 0.28 * Math.sin(t * 0.003 + L.phase * 12) : 0;
        }
      }
      if (a <= 0.03) continue;
      if (L.halo) {
        ctx.globalAlpha = 0.45 * a;
        px(ctx, L.x - 5, L.y - 5, L.w + 10, L.h + 10, p.halo);
      }
      ctx.globalAlpha = Math.min(1, a);
      px(ctx, L.x, L.y, L.w, L.h, L.c);
      ctx.globalAlpha = 1;
    }
  }

  /* ---------- lifecycle ---------- */
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = Math.floor(W * dpr);
    cv.height = Math.floor(H * dpr);
    cv.style.width = W + 'px';
    cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    base.width = cv.width;
    base.height = cv.height;
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildScene();
    dirty = true;
  }

  function drawStatic() {
    themeKey = themeNow();
    baseTheme = themeKey;
    ctx.clearRect(0, 0, W, H);
    if (!hasSky) drawOwnStars(0);
    if (themeKey === 'sunset') drawClouds(0);
    drawBase(PAL[themeKey]);
    dirty = false;
    ctx.drawImage(base, 0, 0, W, H);
    drawLights(PAL[themeKey], 0, true);
  }

  function frame(t) {
    if (!running) return;
    themeKey = themeNow();
    if (themeKey !== baseTheme) { baseTheme = themeKey; dirty = true; }
    ctx.clearRect(0, 0, W, H);
    if (!hasSky) drawOwnStars(t);
    if (themeKey === 'sunset') drawClouds(t);
    if (dirty) { drawBase(PAL[themeKey]); dirty = false; }
    ctx.drawImage(base, 0, 0, W, H);
    drawLights(PAL[themeKey], t, false);
    raf = window.requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduced) return;
    running = true;
    raf = window.requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (raf) window.cancelAnimationFrame(raf);
    raf = null;
  }

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      size();
      if (reduced) drawStatic();
    }, 140);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else if (!reduced) start();
  });

  /* repaint on theme change even in reduced mode */
  if (window.MutationObserver) {
    new MutationObserver(function () {
      if (reduced && running === false) drawStatic();
      else dirty = true;
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  size();
  if (reduced) drawStatic();
  else start();
})();