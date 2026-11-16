/* FARREL.OS - certificate lightbox
   Opens any [data-cert] thumbnail in a pixel window instead of a new tab. */
(function () {
  'use strict';

  var shots = document.querySelectorAll('[data-cert]');
  if (!shots.length) return;

  var box = document.createElement('div');
  box.className = 'certlb';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Certificate preview');
  box.innerHTML =
    '<div class="certlb__panel">' +
      '<div class="certlb__bar">' +
        '<span class="certlb__title"></span>' +
        '<button class="certlb__close" type="button" aria-label="Close certificate">X</button>' +
      '</div>' +
      '<img class="certlb__img" alt="">' +
    '</div>';
  document.body.appendChild(box);

  var img = box.querySelector('.certlb__img');
  var title = box.querySelector('.certlb__title');
  var closeBtn = box.querySelector('.certlb__close');
  var lastFocus = null;

  function isOpen() { return box.classList.contains('is-on'); }

  function open(el) {
    var thumb = el.querySelector('img');
    lastFocus = el;
    img.src = el.getAttribute('data-cert');
    img.alt = (thumb && thumb.alt) || 'Certificate';
    title.textContent = el.getAttribute('data-cert-title') || 'CERTIFICATE';
    box.classList.add('is-on');
    document.documentElement.classList.add('is-certlb');
    if (window.__lenis) window.__lenis.stop();
    closeBtn.focus();
  }

  function close() {
    if (!isOpen()) return;
    box.classList.remove('is-on');
    document.documentElement.classList.remove('is-certlb');
    img.removeAttribute('src');
    if (window.__lenis) window.__lenis.start();
    if (lastFocus) lastFocus.focus();
  }

  Array.prototype.forEach.call(shots, function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      open(el);
    });
  });

  closeBtn.addEventListener('click', close);
  box.addEventListener('click', function (e) {
    if (e.target === box) close();
  });
  document.addEventListener('keydown', function (e) {
    if (!isOpen()) return;
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      closeBtn.focus();
    }
  }, true);
})();
