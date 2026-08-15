// Matrix-rain background. Configurable via localStorage and live
// events from the theme dashboard. Uses requestAnimationFrame so it
// pauses when the tab is hidden.
//
// Settings (localStorage):
//   lt.theme        - "cyberpunk" | "synthwave" | "solarized" | "terminal"
//   lt.rain.enabled - "1" | "0"
//   lt.rain.speed   - number 0.2 .. 3 (default 1)
//   lt.rain.opacity - number 0 .. 0.5 (default 0.1)
//   lt.rain.charset - "binary" | "ascii" | "kana" | "hex"

(function () {
  'use strict';

  // ---------- Boot guard -------------------------------------------
  // Read the enabled flag synchronously before mounting the canvas so
  // a visitor who has turned the rain off doesn't pay the cost of a
  // single paint frame before it disappears.
  var bootEnabled = true;
  try {
    bootEnabled = localStorage.getItem('lt.rain.enabled') !== '0';
  } catch (e) { /* localStorage blocked; defaults to enabled */ }

  if (!bootEnabled) {
    // Still wire the cross-tab listener so turning the rain back on
    // in another tab actually mounts it here.
    window.addEventListener('lt:settings-change', function () {
      try {
        if (localStorage.getItem('lt.rain.enabled') === '1') {
          // Reload is the simplest way to re-init the canvas; the
          // saved enabled state will then let it run on next mount.
          window.location.reload();
        }
      } catch (e) {}
    });
    return;
  }

  // ---------- Canvas setup ----------------------------------------
  var canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.zIndex = '-1';
  canvas.style.pointerEvents = 'none';
  document.body.prepend(canvas);

  var ctx = canvas.getContext('2d');
  var width = window.innerWidth;
  var height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  var fontSize = 14;

  // Drops are floats so fractional speeds (step < 1) drop correctly.
  function makeDrops(n) {
    var out = new Array(n);
    var max = height / fontSize;
    for (var i = 0; i < n; i++) out[i] = Math.random() * max;
    return out;
  }

  var columns = Math.ceil(width / fontSize);
  var drops = makeDrops(columns);

  // ---------- Settings (live) -------------------------------------
  var enabled = true;
  var speed = 1.0;
  var opacity = 0.1;
  var charset = 'binary';

  var CHARSETS = {
    binary: '01',
    ascii:  '01アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEF$#@',
    kana:   'アイウエオカキクケコサシスセソタチツテトナニヌネノ',
    hex:    '0123456789ABCDEF'
  };

  // Cached glyph colour. --neon-blue only changes when the dashboard
  // switches themes or when extend_head.html applies a saved theme,
  // both of which fire `lt:settings-change` or set the attribute via
  // a synchronous script. Reading it every frame was 60 forced reflows
  // per second; caching eliminates that.
  var cachedGlyph = '#00f3ff';
  function refreshGlyph() {
    try {
      var v = getComputedStyle(document.documentElement)
        .getPropertyValue('--neon-blue').trim();
      if (v) cachedGlyph = v;
    } catch (e) { /* keep previous */ }
  }
  refreshGlyph();

  function pickChar() {
    var set = CHARSETS[charset] || CHARSETS.binary;
    return set.charAt(Math.floor(Math.random() * set.length));
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    columns = Math.ceil(width / fontSize);
    drops = makeDrops(columns);
  }

  function applyVisibility() {
    canvas.style.display = enabled ? 'block' : 'none';
  }

  function applyOpacity() {
    canvas.style.opacity = String(opacity);
  }

  // ---------- Animation loop --------------------------------------
  // `running` plus a single rAF guard. The previous version queued a
  // second rAF inside the visibilitychange handler on every tab flip
  // — each visibility toggle added another self-perpetuating loop.
  var running = true;
  var rafId = 0;
  var speedAcc = 0; // accumulator for sub-1 speeds

  function frame() {
    rafId = 0;
    if (!running) return;

    // Fade trail: clear with translucent overlay.
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = cachedGlyph;
    ctx.font = fontSize + 'px monospace';

    // Accumulate fractional speed and step only when it crosses 1.
    speedAcc += speed;
    var step = Math.floor(speedAcc);
    if (step < 1) step = 1;
    speedAcc -= step;

    for (var i = 0; i < drops.length; i++) {
      ctx.fillText(pickChar(), i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i] += step;
    }

    rafId = requestAnimationFrame(frame);
  }
  function start() {
    if (!running || rafId) return;
    rafId = requestAnimationFrame(frame);
  }
  function stop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) start(); else stop();
  });

  // Debounce resize: the previous version re-built the drop array on
  // every pixel of a window drag (often >100 events/sec on a macOS
  // trackpad). 150 ms feels instant to a user but cuts the resize
  // work ~95% on a typical drag.
  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resizeTimer = 0;
      resize();
    }, 150);
  });

  function readSettings() {
    try {
      var en = localStorage.getItem('lt.rain.enabled');
      enabled = en === null ? true : en === '1';
      var sp = parseFloat(localStorage.getItem('lt.rain.speed'));
      speed = isFinite(sp) ? Math.max(0.2, Math.min(3, sp)) : 1.0;
      var op = parseFloat(localStorage.getItem('lt.rain.opacity'));
      opacity = isFinite(op) ? Math.max(0, Math.min(0.5, op)) : 0.1;
      var cs = localStorage.getItem('lt.rain.charset');
      charset = cs && CHARSETS[cs] ? cs : 'binary';
    } catch (e) { /* localStorage may be blocked -- keep defaults */ }
    refreshGlyph();
    applyVisibility();
    applyOpacity();
  }

  // Cross-tab updates.
  window.addEventListener('storage', function (e) {
    if (e.key && e.key.indexOf('lt.') === 0) readSettings();
  });

  // Same-tab updates from the dashboard and from the extend_head
  // boot script when it sets data-theme.
  window.addEventListener('lt:settings-change', readSettings);
  window.addEventListener('lt:theme-change', refreshGlyph);

  readSettings();
  if (running) start();
})();