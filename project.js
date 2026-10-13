/* ============================================================
   FARREL.OS - project detail page renderer
   Reads ?p=<slug>, renders the matching entry from
   projects-data.js, wires the theme toggle and prev/next nav.
   ============================================================ */
(function () {
  'use strict';

  var PROJECTS = window.PROJECTS || [];

  /* ---------- theme (same rules as the home page) ---------- */
  var themeMeta = document.getElementById('themeColor');
  var moonBtn = document.getElementById('moonBtn');
  var baseTheme = 'night';
  try {
    if (localStorage.getItem('farrel-theme') === 'sunset') baseTheme = 'sunset';
  } catch (e) {}

  function applyTheme(name) {
    var doc = document.documentElement;
    if (name === 'night') doc.removeAttribute('data-theme');
    else doc.setAttribute('data-theme', name);
    if (themeMeta) {
      var colors = { night: '#0a0e27', sunset: '#1c0b2e' };
      themeMeta.setAttribute('content', colors[name] || colors.night);
    }
    if (moonBtn) {
      var isSunset = name === 'sunset';
      moonBtn.setAttribute('aria-pressed', isSunset ? 'true' : 'false');
      moonBtn.setAttribute('aria-label', isSunset ? 'Switch to night theme' : 'Switch to sunset theme');
      moonBtn.setAttribute('title', isSunset ? 'Night mode' : 'Sunset mode');
    }
  }

  applyTheme(baseTheme);

  if (moonBtn) {
    moonBtn.addEventListener('click', function () {
      baseTheme = baseTheme === 'sunset' ? 'night' : 'sunset';
      try { localStorage.setItem('farrel-theme', baseTheme); } catch (e) {}
      applyTheme(baseTheme);
    });
  }

  /* ---------- find the project ---------- */
  var slug = '';
  try {
    slug = new URLSearchParams(window.location.search).get('p') || '';
  } catch (e) {}
  var idx = -1;
  for (var i = 0; i < PROJECTS.length; i++) {
    if (PROJECTS[i].slug === slug) { idx = i; break; }
  }

  var root = document.getElementById('projRoot');

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function notFound() {
    document.title = 'Project not found | Farrel Fayzul Haqqi';
    root.innerHTML =
      '<div class="win proj__missing">' +
        '<div class="win__bar"><span class="win__title">ERROR.EXE</span>' +
        '<span class="win__ctrls" aria-hidden="true"><i></i><i></i><i></i></span></div>' +
        '<div class="win__body">' +
          '<p class="proj__misscode">404</p>' +
          '<p>That project entry does not exist. It may have been renamed.</p>' +
          '<p><a class="btn btn--primary" href="index.html#projects">BACK TO QUEST LOG</a></p>' +
        '</div>' +
      '</div>';
  }

  if (idx < 0) { notFound(); return; }

  var p = PROJECTS[idx];
  var prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
  var next = PROJECTS[(idx + 1) % PROJECTS.length];

  document.title = p.name + ' | Farrel Fayzul Haqqi';
  var descEl = document.querySelector('meta[name="description"]');
  if (descEl) descEl.setAttribute('content', p.sub);

  /* ---------- art block ---------- */
  var artHTML;
  if (p.art && p.art.type === 'photo') {
    artHTML =
      '<div class="shot proj__hero">' +
        '<img src="' + esc(p.art.src) + '" alt="' + esc(p.art.alt || p.name) + '" width="1600" height="900">' +
      '</div>';
  } else if (p.art && p.art.type === 'pixel') {
    artHTML = '<div class="quest__art ' + esc(p.art.cls) + ' proj__hero proj__hero--pixel" aria-hidden="true">' + (p.art.html || '') + '</div>';
  } else {
    artHTML = '';
  }

  /* ---------- body copy ---------- */
  var bodyHTML = '';
  (p.body || []).forEach(function (par) {
    bodyHTML += '<p class="proj__para">' + esc(par) + '</p>';
  });

  /* ---------- specs ---------- */
  var specsHTML = '';
  (p.specs || []).forEach(function (row) {
    specsHTML += '<div class="proj__spec"><dt>' + esc(row[0]) + '</dt><dd>' + esc(row[1]) + '</dd></div>';
  });

  /* ---------- chips ---------- */
  var chipsHTML = '';
  (p.chips || []).forEach(function (c) {
    chipsHTML += '<li>' + esc(c) + '</li>';
  });

  /* ---------- gallery ---------- */
  var galleryHTML = '';
  if ((p.gallery || []).length) {
    galleryHTML =
      '<section class="proj__gal" aria-label="Project photos">' +
        '<h2 class="proj__h2">SCREENSHOTS</h2>' +
        '<div class="proj__galgrid">' +
          p.gallery.map(function (g) {
            return '<figure class="proj__fig">' +
              '<div class="shot"><img src="' + esc(g.src) + '" alt="' + esc(g.cap) + '" loading="lazy"></div>' +
              '<figcaption>' + esc(g.cap) + '</figcaption>' +
            '</figure>';
          }).join('') +
        '</div>' +
      '</section>';
  }

  root.innerHTML =
    '<nav class="proj__crumb" aria-label="Breadcrumb">' +
      '<a href="index.html">FARREL.OS</a><span aria-hidden="true">/</span>' +
      '<a href="index.html#projects">QUEST LOG</a><span aria-hidden="true">/</span>' +
      '<span aria-current="page">' + esc(p.name) + '</span>' +
    '</nav>' +

    '<header class="proj__head">' +
      '<p class="sect__cmd" aria-hidden="true">' + esc(p.cmd) + '</p>' +
      '<div class="quest__tag">' + esc(p.tag) + '</div>' +
      '<h1 class="proj__title">' + esc(p.name) + '</h1>' +
      '<p class="proj__sub">' + esc(p.sub) + '</p>' +
    '</header>' +

    artHTML +

    '<div class="proj__grid">' +
      '<div class="proj__body">' + bodyHTML + '</div>' +
      '<aside class="proj__aside" aria-label="Specifications">' +
        '<div class="win">' +
          '<div class="win__bar"><span class="win__title">SPECS.TXT</span>' +
          '<span class="win__ctrls" aria-hidden="true"><i></i><i></i><i></i></span></div>' +
          '<dl class="proj__specs">' + specsHTML + '</dl>' +
        '</div>' +
        '<ul class="chips proj__chips">' + chipsHTML + '</ul>' +
      '</aside>' +
    '</div>' +

    galleryHTML +

    '<nav class="proj__pager" aria-label="More projects">' +
      '<a class="proj__pg" href="project.html?p=' + esc(prev.slug) + '">' +
        '<span class="proj__pgdir" aria-hidden="true">&larr; PREV</span>' +
        '<span class="proj__pgname">' + esc(prev.name) + '</span>' +
      '</a>' +
      '<a class="proj__pg proj__pg--all" href="index.html#projects">ALL PROJECTS</a>' +
      '<a class="proj__pg proj__pg--next" href="project.html?p=' + esc(next.slug) + '">' +
        '<span class="proj__pgdir" aria-hidden="true">NEXT &rarr;</span>' +
        '<span class="proj__pgname">' + esc(next.name) + '</span>' +
      '</a>' +
    '</nav>';
})();
