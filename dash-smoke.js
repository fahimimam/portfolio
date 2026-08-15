// Stripped once verified — kept temporarily for one-off smoke test.
const fs = require('fs');
const code = fs.readFileSync(__dirname + '/static/js/theme-dashboard.js', 'utf8');

function mkNode() {
  const n = {
    setAttribute: () => {}, getAttribute: () => null,
    appendChild: () => {}, addEventListener: () => {},
    classList: { toggle: () => {}, add: () => {}, remove: () => {} },
    set hidden(v) { this._h = v; }, get hidden() { return this._h; },
    set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html; },
    set textContent(v) {}, get textContent() { return ''; },
    set tabIndex(v) {}, get tabIndex() { return 0; },
    set id(v) {}, get id() { return ''; },
    set role(v) {}, get role() { return ''; },
    querySelector: () => mkNode(),
    querySelectorAll: () => [],
    contains: () => false, focus: () => {},
  };
  return n;
}

const fakeDoc = {
  documentElement: { setAttribute: () => {}, getAttribute: () => null },
  createElement: () => mkNode(),
  body: { appendChild: () => {}, prepend: () => {} },
  head: { appendChild: () => {} },
  querySelector: () => null,
  addEventListener: () => {},
  readyState: 'complete',
  hidden: false,
};

global.document = fakeDoc;
global.window = { innerWidth: 1024, innerHeight: 768, addEventListener: () => {},
  dispatchEvent: () => {}, setTimeout: setTimeout, clearTimeout: clearTimeout };
global.localStorage = { _s: {}, getItem(k){ return this._s[k] || null; }, setItem(k,v){ this._s[k] = String(v); } };
global.Event = function () {};
global.requestAnimationFrame = () => {};

try {
  eval(code);
  console.log('boot ok');
  process.exit(0);
} catch (e) {
  console.error('FAIL:', e.stack || e.message);
  process.exit(1);
}
