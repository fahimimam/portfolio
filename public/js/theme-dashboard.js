// Theme + rain dashboard. Floating, collapsible panel that lets you
// tweak the active palette, rain speed/opacity/charset, and toggle
// the rain entirely. All settings persist in localStorage and are
// live-applied.
//
// Theme palettes are defined as CSS variable overrides on
// :root[data-theme="X"] in assets/css/extended/custom.css — that
// file is the single source of truth. This script keeps only what
// the dashboard UI needs: a label, a one-line description, and
// three swatch colours per theme for the picker card. The actual
// palette tokens come from CSS so the two can never drift apart.

(function () {
  'use strict';

  // ---------- Theme metadata ---------------------------------------
  // Palette tokens live in custom.css :root[data-theme="X"] blocks.
  // This object holds only what the dashboard UI renders. To add a
  // theme: append a :root[data-theme="X"] block in custom.css, then
  // add a row here with matching key + label + desc + 3 swatches.
  var THEMES = {
    cyberpunk: {
      label: 'Cyberpunk',
      desc:  'Neon blue on midnight. The default.',
      swatch: ['#00f3ff', '#ff6b35', '#bf40bf']
    },
    synthwave: {
      label: 'Synthwave',
      desc:  'Magenta + cyan on deep purple. 80s arcade.',
      swatch: ['#22d3ee', '#ff2e93', '#a855f7']
    },
    solarized: {
      label: 'Solarized',
      desc:  'Warm cream + muted teal. Readable.',
      swatch: ['#2aa198', '#cb4b16', '#8a3fa6']
    },
    terminal: {
      label: 'Terminal',
      desc:  'Amber phosphor on near-black. CRT vibes.',
      swatch: ['#ffb000', '#ff5e1a', '#cc7722']
    },
    nord: {
      label: 'Nord',
      desc:  'Arctic, bluish, calm. Late-night reading.',
      swatch: ['#88c0d0', '#ebcb8b', '#b48ead']
    },
    monokai: {
      label: 'Monokai',
      desc:  'Hot pink + lime + amber. Classic editor.',
      swatch: ['#f92672', '#a6e22e', '#fd971f']
    }
  };

  // ---------- localStorage helpers ---------------------------------
  function get(key, fallback) {
    try { var v = localStorage.getItem(key); return v === null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function set(key, value) {
    try { localStorage.setItem(key, String(value)); } catch (e) { /* ignore */ }
  }

  // ---------- Theme application -------------------------------------
  // Theme palettes live as :root[data-theme="X"] blocks in
  // assets/css/extended/custom.css. Switching the data-theme attribute
  // is the entire application step. We also dispatch both
  // `lt:theme-change` (cheap, no localStorage involved) so matrix.js
  // can re-read its glyph colour, and `lt:settings-change` so any
  // listener on rain settings also wakes up.
  function applyTheme(name) {
    if (!THEMES[name]) name = 'cyberpunk';
    document.documentElement.setAttribute('data-theme', name);
    set('lt.theme', name);
    window.dispatchEvent(new Event('lt:theme-change'));
    window.dispatchEvent(new Event('lt:settings-change'));
  }

  function notify() {
    window.dispatchEvent(new Event('lt:settings-change'));
  }

  // ---------- Dashboard UI ------------------------------------------
  function buildPanel() {
    var panel = document.createElement('aside');
    panel.className = 'lt-dash';
    panel.setAttribute('aria-label', 'Theme and rain dashboard');

    // Toggle button (always visible)
    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'lt-dash-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'lt-dash-body');
    toggle.setAttribute('title', 'Open design dashboard (press T)');
    toggle.innerHTML = '<span aria-hidden="true">⚙</span>';
    panel.appendChild(toggle);

    // Body — uses [data-open] for smooth transitions instead of `hidden`.
    var body = document.createElement('div');
    body.id = 'lt-dash-body';
    body.className = 'lt-dash-body';
    body.setAttribute('role', 'dialog');
    body.setAttribute('aria-modal', 'false');
    body.setAttribute('aria-labelledby', 'lt-dash-title');
    body.setAttribute('aria-hidden', 'true');
    body.setAttribute('data-open', 'false');
    panel.appendChild(body);

    // Header
    var header = document.createElement('div');
    header.className = 'lt-dash-header';
    header.innerHTML =
      '<span id="lt-dash-title">Design Dashboard</span>' +
      '<span class="lt-dash-hint" aria-hidden="true">' +
        '<kbd>T</kbd> toggle · <kbd>[</kbd>/<kbd>]</kbd> speed · <kbd>−</kbd>/<kbd>=</kbd> opacity' +
      '</span>' +
      '<button type="button" class="lt-dash-close" aria-label="Close (Esc)">×</button>';
    body.appendChild(header);

    // ---- Theme picker --------------------------------------------
    var themeSection = document.createElement('section');
    themeSection.className = 'lt-dash-section';
    themeSection.innerHTML = '<h4>Theme</h4>';
    var themeList = document.createElement('div');
    themeList.className = 'lt-dash-themes';
    themeList.setAttribute('role', 'radiogroup');
    themeList.setAttribute('aria-label', 'Color theme');
    Object.keys(THEMES).forEach(function (key) {
      var t = THEMES[key];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lt-dash-theme';
      btn.setAttribute('data-theme-key', key);
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      btn.tabIndex = 0;
      btn.innerHTML =
        '<span class="lt-dash-theme-swatch">' +
          '<i style="background:' + t.swatch[0] + '"></i>' +
          '<i style="background:' + t.swatch[1] + '"></i>' +
          '<i style="background:' + t.swatch[2] + '"></i>' +
        '</span>' +
        '<span class="lt-dash-theme-meta">' +
          '<strong>' + t.label + '</strong>' +
          '<small>' + t.desc + '</small>' +
        '</span>' +
        '<span class="lt-dash-theme-pill" aria-hidden="true">CURRENT</span>';
      btn.addEventListener('click', function () {
        applyTheme(key);
        updateActiveStates();
      });
      themeList.appendChild(btn);
    });
    themeSection.appendChild(themeList);
    body.appendChild(themeSection);

    // ---- Rain controls -------------------------------------------
    var rainSection = document.createElement('section');
    rainSection.className = 'lt-dash-section';
    rainSection.innerHTML =
      '<h4>Matrix rain</h4>' +
      '<label class="lt-dash-row">' +
        '<span>Enabled</span>' +
        '<input type="checkbox" id="lt-dash-rain-enabled"> ' +
      '</label>' +
      '<label class="lt-dash-row">' +
        '<span>Speed</span>' +
        '<input type="range" id="lt-dash-rain-speed" min="0.2" max="3" step="0.1">' +
        '<output id="lt-dash-rain-speed-out"></output>' +
      '</label>' +
      '<label class="lt-dash-row">' +
        '<span>Opacity</span>' +
        '<input type="range" id="lt-dash-rain-opacity" min="0" max="0.5" step="0.01">' +
        '<output id="lt-dash-rain-opacity-out"></output>' +
      '</label>' +
      '<label class="lt-dash-row">' +
        '<span>Characters</span>' +
        '<select id="lt-dash-rain-charset">' +
          '<option value="binary">0 / 1</option>' +
          '<option value="ascii">  ASCII mix</option>' +
          '<option value="kana">  Japanese katakana</option>' +
          '<option value="hex">  Hex digits</option>' +
        '</select>' +
      '</label>';
    body.appendChild(rainSection);

    // ---- Reset ----------------------------------------------------
    var resetSection = document.createElement('section');
    resetSection.className = 'lt-dash-section';
    var resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'lt-dash-reset';
    resetBtn.textContent = 'Reset to defaults';
    resetBtn.addEventListener('click', function () {
      applyTheme('cyberpunk');
      set('lt.rain.enabled', '1');
      set('lt.rain.speed', '1');
      set('lt.rain.opacity', '0.1');
      set('lt.rain.charset', 'binary');
      readForm();
      notify();
      updateActiveStates();
    });
    resetSection.appendChild(resetBtn);
    body.appendChild(resetSection);

    // ---- Wire up controls -----------------------------------------
    function readForm() {
      var enabledEl = body.querySelector('#lt-dash-rain-enabled');
      var speedEl   = body.querySelector('#lt-dash-rain-speed');
      var speedOut  = body.querySelector('#lt-dash-rain-speed-out');
      var opEl      = body.querySelector('#lt-dash-rain-opacity');
      var opOut     = body.querySelector('#lt-dash-rain-opacity-out');
      var charEl    = body.querySelector('#lt-dash-rain-charset');

      enabledEl.checked = get('lt.rain.enabled', '1') === '1';
      speedEl.value     = parseFloat(get('lt.rain.speed', '1'));
      speedOut.value    = speedEl.value + '×';
      opEl.value        = parseFloat(get('lt.rain.opacity', '0.1'));
      opOut.value       = opEl.value;
      charEl.value      = get('lt.rain.charset', 'binary');

      enabledEl.addEventListener('change', function () {
        set('lt.rain.enabled', enabledEl.checked ? '1' : '0');
        notify();
      });
      speedEl.addEventListener('input', function () {
        speedOut.value = speedEl.value + '×';
        set('lt.rain.speed', speedEl.value);
        notify();
      });
      opEl.addEventListener('input', function () {
        opOut.value = opEl.value;
        set('lt.rain.opacity', opEl.value);
        notify();
      });
      charEl.addEventListener('change', function () {
        set('lt.rain.charset', charEl.value);
        notify();
      });
    }

    function updateActiveStates() {
      var cur = get('lt.theme', 'cyberpunk');
      body.querySelectorAll('.lt-dash-theme').forEach(function (b) {
        var on = b.getAttribute('data-theme-key') === cur;
        b.classList.toggle('active', on);
        b.setAttribute('aria-checked', on ? 'true' : 'false');
      });
    }

    // ---- Open / close with smooth transition ----------------------
    function open() {
      body.setAttribute('data-open', 'true');
      body.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      window.setTimeout(function () {
        var first = body.querySelector('input,select,button');
        if (first) first.focus({ preventScroll: true });
      }, 120);
    }
    function close() {
      body.setAttribute('data-open', 'false');
      body.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      // Only re-focus the toggle if the user closed via Esc/T. If they
      // clicked the × button, that button is already focused and we
      // shouldn't yank focus away.
      if (document.activeElement && document.activeElement !== toggle &&
          !body.contains(document.activeElement)) {
        toggle.focus({ preventScroll: true });
      }
    }
    function isOpen() { return body.getAttribute('data-open') === 'true'; }

    toggle.addEventListener('click', function () {
      if (isOpen()) close(); else open();
    });
    header.querySelector('.lt-dash-close').addEventListener('click', close);

    // Arrow-key navigation across theme cards.
    themeList.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' &&
          e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      var btns = Array.prototype.slice.call(themeList.querySelectorAll('.lt-dash-theme'));
      var i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      var next = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? i + 1 : i - 1;
      if (next < 0) next = btns.length - 1;
      if (next >= btns.length) next = 0;
      btns[next].focus();
    });

    // ---- Global keyboard shortcuts --------------------------------
    function nudge(key, delta, min, max, fallback, decimals) {
      var cur = parseFloat(get(key, fallback));
      if (!isFinite(cur)) cur = parseFloat(fallback);
      var v = Math.max(min, Math.min(max, +(cur + delta).toFixed(decimals)));
      set(key, v);
      readForm();
      notify();
    }
    function toggleRain() {
      var next = get('lt.rain.enabled', '1') === '1' ? '0' : '1';
      set('lt.rain.enabled', next);
      readForm();
      notify();
    }
    function cycleTheme(dir) {
      var keys = Object.keys(THEMES);
      var cur = get('lt.theme', 'cyberpunk');
      var i = keys.indexOf(cur);
      if (i < 0) i = 0;
      var next = (i + dir + keys.length) % keys.length;
      applyTheme(keys[next]);
      updateActiveStates();
    }

    function isTypingTarget(t) {
      if (!t) return false;
      var tag = t.tagName || '';
      return tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || t.isContentEditable;
    }

    document.addEventListener('keydown', function (e) {
      if (isTypingTarget(e.target)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // T toggles the panel open/closed.
      if (e.key === 't' || e.key === 'T') {
        if (isOpen()) close(); else open();
        e.preventDefault();
        return;
      }
      // Esc closes; arrow-left/right cycles theme (when panel open).
      if (e.key === 'Escape' && isOpen()) { close(); e.preventDefault(); return; }
      if (!isOpen()) return;

      switch (e.key) {
        case '[':
          nudge('lt.rain.speed', -0.1, 0.2, 3, '1', 2); e.preventDefault(); break;
        case ']':
          nudge('lt.rain.speed',  0.1, 0.2, 3, '1', 2); e.preventDefault(); break;
        case '-':
        case '_':
          nudge('lt.rain.opacity', -0.02, 0, 0.5, '0.1', 3); e.preventDefault(); break;
        case '=':
        case '+':
          nudge('lt.rain.opacity',  0.02, 0, 0.5, '0.1', 3); e.preventDefault(); break;
        case 'r':
        case 'R':
          toggleRain(); e.preventDefault(); break;
        case 'ArrowLeft':
          cycleTheme(-1); e.preventDefault(); break;
        case 'ArrowRight':
          cycleTheme(1); e.preventDefault(); break;
      }
    });

    readForm();
    updateActiveStates();
    return panel;
  }

  // ---------- Boot --------------------------------------------------
  function boot() {
    // Apply saved theme before the panel mounts so the first paint
    // already uses the chosen palette.
    var themeName = get('lt.theme', 'cyberpunk');
    applyTheme(themeName);

    // Inject the dashboard CSS once.
    if (!document.querySelector('style[data-lt-dashboard]')) {
      var s = document.createElement('style');
      s.setAttribute('data-lt-dashboard', '');
      s.textContent = DASHBOARD_CSS;
      document.head.appendChild(s);
    }

    document.body.appendChild(buildPanel());
  }

  // CSS injected alongside the dashboard. Uses its own scoped
  // variable names so it doesn't fight with the rest of the site.
  var DASHBOARD_CSS = ''
    // Container — fixed top-right anchor.
    + '.lt-dash{'
    +   'position:fixed;top:14px;right:14px;z-index:2147483600;'
    +   'font-family:"JetBrains Mono","Fira Code","Monaco","Courier New",monospace;'
    +   'font-size:13px;color:var(--text-primary);'
    +   '}'
    // Toggle button.
    + '.lt-dash-toggle{'
    +   'width:42px;height:42px;border-radius:50%;border:1px solid var(--cyber-border);'
    +   'background:var(--cyber-surface);color:var(--neon-blue);'
    +   'cursor:pointer;font-size:20px;display:flex;align-items:center;justify-content:center;'
    +   'box-shadow:var(--cyber-glow);backdrop-filter:blur(8px);transition:transform .25s ease,'
    +   'border-color .2s ease,color .2s ease,box-shadow .2s ease;'
    +   '}'
    + '.lt-dash-toggle:hover,'
    + '.lt-dash-toggle:focus-visible{'
    +   'transform:rotate(45deg);border-color:var(--neon-orange);color:var(--neon-orange);'
    +   'box-shadow:0 0 18px rgba(255,107,53,.45);outline:none;'
    +   '}'
    // Body — animated open/close via [data-open].
    + '.lt-dash-body{'
    +   'position:absolute;top:54px;right:0;width:320px;max-width:calc(100vw - 28px);'
    +   'background:var(--cyber-surface);border:1px solid var(--cyber-border);'
    +   'border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.5),var(--cyber-glow);'
    +   'backdrop-filter:blur(10px);padding:1rem 1.1rem;'
    +   'display:flex;flex-direction:column;gap:1rem;'
    +   'transform-origin:top right;'
    +   'opacity:0;transform:translateY(-8px) scale(.96);pointer-events:none;'
    +   'transition:opacity .18s ease,transform .22s cubic-bezier(.2,.8,.3,1);'
    +   '}'
    + '.lt-dash-body[data-open="true"]{'
    +   'opacity:1;transform:translateY(0) scale(1);pointer-events:auto;'
    +   '}'
    // Header.
    + '.lt-dash-header{'
    +   'display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap;'
    +   'border-bottom:1px solid var(--cyber-border);padding-bottom:.55rem;margin-bottom:.1rem;'
    +   'font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--neon-blue);font-size:.78rem;'
    +   '}'
    + '.lt-dash-header > #lt-dash-title{flex:1 1 auto;min-width:0;}'
    + '.lt-dash-hint{'
    +   'flex:1 1 100%;font-weight:400;font-size:.66rem;letter-spacing:.5px;'
    +   'color:var(--text-secondary);text-transform:none;opacity:.75;'
    +   'margin:.35rem 0 0;line-height:1.5;'
    +   '}'
    + '.lt-dash-hint kbd{'
    +   'font-family:inherit;font-size:.66rem;background:var(--code-bg);'
    +   'border:1px solid var(--cyber-border);border-radius:4px;padding:0 .35rem;'
    +   'margin:0 1px;color:var(--neon-blue);'
    +   '}'
    + '.lt-dash-close{'
    +   'background:transparent;border:none;color:var(--text-secondary);font-size:1.3rem;'
    +   'cursor:pointer;line-height:1;padding:0 .25rem;flex:0 0 auto;'
    +   '}'
    + '.lt-dash-close:hover,'
    + '.lt-dash-close:focus-visible{color:var(--neon-orange);outline:none;}'
    // Sections.
    + '.lt-dash-section{display:flex;flex-direction:column;gap:.55rem;}'
    + '.lt-dash-section h4{margin:0;font-size:.7rem;color:var(--neon-orange);letter-spacing:1.5px;'
    +   'text-transform:uppercase;font-weight:700;}'
    // Theme cards.
    + '.lt-dash-themes{display:flex;flex-direction:column;gap:.4rem;}'
    + '.lt-dash-theme{'
    +   'position:relative;display:flex;align-items:center;gap:.7rem;background:transparent;'
    +   'cursor:pointer;border:1px solid var(--cyber-border);border-radius:8px;'
    +   'padding:.45rem .6rem .45rem .55rem;text-align:left;width:100%;'
    +   'color:var(--text-primary);font-family:inherit;transition:all .2s ease;'
    +   '}'
    + '.lt-dash-theme:hover{'
    +   'border-color:var(--neon-blue);box-shadow:0 0 12px rgba(0,243,255,.18);'
    +   'transform:translateX(2px);'
    +   '}'
    + '.lt-dash-theme:focus-visible{outline:none;'
    +   'border-color:var(--neon-blue);box-shadow:0 0 0 2px rgba(0,243,255,.4);'
    +   '}'
    + '.lt-dash-theme.active{'
    +   'border-color:var(--neon-blue);background:rgba(0,243,255,.06);'
    +   'box-shadow:0 0 14px rgba(0,243,255,.25);'
    +   '}'
    + '.lt-dash-theme-swatch{display:inline-flex;gap:3px;flex:0 0 auto;}'
    + '.lt-dash-theme-swatch i{display:block;width:14px;height:14px;border-radius:50%;'
    +   'border:1px solid rgba(255,255,255,.12);}'
    + '.lt-dash-theme-meta{display:flex;flex-direction:column;gap:.1rem;line-height:1.25;flex:1 1 auto;'
    +   'min-width:0;}'
    + '.lt-dash-theme-meta strong{color:var(--neon-blue);font-size:.85rem;font-weight:600;}'
    + '.lt-dash-theme-meta small{color:var(--text-secondary);font-size:.7rem;opacity:.85;}'
    + '.lt-dash-theme-pill{'
    +   'flex:0 0 auto;font-size:.58rem;font-weight:700;letter-spacing:.7px;'
    +   'padding:.18rem .42rem;border-radius:999px;border:1px solid var(--neon-blue);'
    +   'color:var(--neon-blue);background:rgba(0,243,255,.08);opacity:0;'
    +   'transition:opacity .2s ease;align-self:center;text-transform:uppercase;'
    +   '}'
    + '.lt-dash-theme.active .lt-dash-theme-pill{opacity:1;}'
    // Rain control rows.
    + '.lt-dash-row{display:flex;align-items:center;gap:.55rem;font-size:.8rem;}'
    + '.lt-dash-row > span{flex:0 0 90px;color:var(--text-secondary);}'
    + '.lt-dash-row input[type=range],'
    + '.lt-dash-row select{'
    +   'flex:1;accent-color:var(--neon-blue);background:var(--code-bg);color:var(--text-primary);'
    +   'border:1px solid var(--cyber-border);border-radius:6px;padding:.2rem .4rem;'
    +   'font-family:inherit;font-size:.78rem;'
    +   '}'
    + '.lt-dash-row select{cursor:pointer;'
    +   'background-image:linear-gradient(45deg,transparent 50%,var(--neon-blue) 50%),'
    +     'linear-gradient(135deg,var(--neon-blue) 50%,transparent 50%);'
    +   'background-position:calc(100% - 12px) 50%,calc(100% - 7px) 50%;'
    +   'background-size:5px 5px;background-repeat:no-repeat;'
    +   'padding-right:1.4rem;appearance:none;-webkit-appearance:none;'
    +   '}'
    + '.lt-dash-row output{flex:0 0 50px;text-align:right;color:var(--neon-blue);'
    +   'font-variant-numeric:tabular-nums;'
    +   '}'
    + '.lt-dash-row input[type=checkbox]{accent-color:var(--neon-blue);transform:scale(1.2);'
    +   'cursor:pointer;'
    +   '}'
    // Reset button.
    + '.lt-dash-reset{'
    +   'background:transparent;border:1px solid var(--neon-orange);color:var(--neon-orange);'
    +   'border-radius:8px;padding:.45rem .9rem;cursor:pointer;font-family:inherit;font-size:.8rem;'
    +   'font-weight:700;letter-spacing:.5px;transition:all .2s ease;width:100%;'
    +   '}'
    + '.lt-dash-reset:hover,'
    + '.lt-dash-reset:focus-visible{background:var(--neon-orange);color:var(--cyber-bg);'
    +   'box-shadow:0 0 14px rgba(255,107,53,.4);outline:none;'
    +   '}'
    // Mobile — bottom sheet.
    + '@media (max-width: 640px){'
    +   '.lt-dash{top:auto;right:12px;bottom:12px;left:12px;}'
    +   '.lt-dash-toggle{position:fixed;top:auto;right:14px;bottom:14px;width:48px;height:48px;z-index:2147483601;}'
    +   '.lt-dash-body{'
    +     'position:fixed;left:12px;right:12px;bottom:74px;width:auto;max-width:none;'
    +     'transform-origin:bottom right;'
    +     '}'
    +   '.lt-dash-body[data-open="true"]{transform:translateY(0) scale(1);}'
    +   '.lt-dash-hint{font-size:.62rem;}'
    +   '}'
    // Reduced motion — skip the open/close animation.
    + '@media (prefers-reduced-motion: reduce){'
    +   '.lt-dash-body,.lt-dash-toggle{transition:none !important;}'
    +   '}';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();