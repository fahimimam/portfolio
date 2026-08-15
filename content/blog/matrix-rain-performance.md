---
title: "60 forced reflows a second: fixing the matrix rain"
date: 2026-08-15
draft: false
summary: "The first version of the matrix-rain canvas called getComputedStyle() every animation frame to read the active --neon-blue token. Three small changes turned 60 reflows/sec into zero."
tags: ["JavaScript", "Performance", "Canvas", "Frontend"]
categories: ["Blog", "JavaScript"]
series: ""
series_part: 0
cover: { image: "", alt: "" }
ShowToc: false
hideFromSearch: false
---

The portfolio landing page has a full-screen matrix-rain canvas behind the content — 14 px monospace glyphs falling on a 60 fps loop. It's the kind of feature that looks fine in casual use and turns out to be quietly expensive once you instrument it.

The first version had three perf bugs. Each one would have been invisible in a dev-tool profile snapshot; together, they were enough to make a mid-2020 MacBook's fans spin up on a static page.

## Bug 1: 60 forced reflows per second

The canvas reads the active glyph colour from a CSS custom property — `--neon-blue` — so it stays in sync when the user switches themes. The first implementation did this:

```js
function frame() {
  var colour = getComputedStyle(document.documentElement)
    .getPropertyValue('--neon-blue').trim();
  ctx.fillStyle = colour;
  // ... draw drops ...
}
```

`getComputedStyle()` forces a layout read. Calling it 60 times per second is roughly 60 forced reflows per second on a long-lived page. Chrome's "forced reflow" warning fires constantly.

**The fix:** cache the colour, refresh it on theme change.

```js
var cachedGlyph = '#00f3ff';

function refreshGlyph() {
  try {
    var v = getComputedStyle(document.documentElement)
      .getPropertyValue('--neon-blue').trim();
    if (v) cachedGlyph = v;
  } catch (e) { /* keep previous */ }
}

window.addEventListener('lt:theme-change', refreshGlyph);
```

One read at boot, one read on every theme switch, zero reads in the frame loop. Performance panels go quiet.

## Bug 2: the resize storm

Window resize fires at whatever rate the OS reports it — sometimes 60 Hz, sometimes higher. The naive implementation re-initialised the drop array on every event:

```js
window.addEventListener('resize', function () {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  columns = Math.ceil(width / fontSize);
  drops = makeDrops(columns);   // <- allocates a new array
});
```

A 2-second window-drag on a 4K monitor allocates and discards thousands of small arrays.

**The fix:** debounce at 150 ms.

```js
var resizeTimer = 0;
window.addEventListener('resize', function () {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resize, 150);
});
```

The drop array only rebuilds after the user stops dragging. The visible effect is the same — at 60 fps, 150 ms is below the perceptual threshold for "rain re-initialised."

## Bug 3: the double-rAF self-perpetuating loop

The original `visibilitychange` handler queued a fresh `requestAnimationFrame` every time the tab flipped back into view:

```js
document.addEventListener('visibilitychange', function () {
  if (!document.hidden) {
    requestAnimationFrame(frame);   // <- in addition to the loop's own rAF
  }
});
```

Each visibility flip added another self-perpetuating loop. After 20 tab flips, 20 concurrent `frame()` calls were running. Each one clears the canvas and redraws it, so the visible result was... still a working rain, but with 20x the work.

**The fix:** a single `running` flag plus one rAF guard.

```js
var running = true;
var rafId = 0;

function frame() {
  rafId = 0;                         // <- this rAF is now "consumed"
  if (!running) return;

  // ... draw ...

  rafId = requestAnimationFrame(frame);
}

document.addEventListener('visibilitychange', function () {
  if (document.hidden) {
    running = false;
  } else if (!rafId) {               // <- only restart if not already running
    running = true;
    rafId = requestAnimationFrame(frame);
  }
});
```

The frame loop always re-arms itself; the visibility handler only restarts it if no rAF is currently pending. Tab flips can no longer multiply the work.

## Bonus: the boot guard

One more change worth calling out. The rain is toggleable from the theme dashboard, and the preference is persisted to `localStorage` under `lt.rain.enabled`. If the user has disabled rain, the canvas is never created in the first place:

```js
if (localStorage.getItem('lt.rain.enabled') === '0') return;
```

The boot guard means a disabled-rain user pays exactly zero GPU cost. Reload after re-enabling, and the canvas mounts and starts the loop.

## Why this matters beyond the rain

None of these are exotic fixes. The pattern is the same in every long-lived UI:

- **Cache expensive reads.** Anything inside a frame loop that touches the DOM, the layout, or `getComputedStyle` is a candidate. Read once at boot, refresh on change events.
- **Debounce bursty events.** Resize, scroll, input — any event that fires faster than the user can perceive change.
- **Idempotent event handlers.** A handler should be safe to call any number of times and have the same effect as calling it once. The double-rAF bug is what idempotency violations look like in animation code.

A profile-driven debug session usually finds one of these. The trick is to keep looking after you fix the first one.