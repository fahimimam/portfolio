// Temporary smoke test for the portfolio showcase's inline script.
const fs = require('fs');

function mkNode() {
    const n = {
        setAttribute: () => {
        }, getAttribute: () => null,
        appendChild: () => {
        }, addEventListener: () => {
        },
        classList: {
            toggle: () => {
            }, add: () => {
            }, remove: () => {
            }
        },
        set hidden(v) {
            this._h = v;
        }, get hidden() {
            return this._h;
        },
        set innerHTML(v) {
            this._html = v;
        }, get innerHTML() {
            return this._html;
        },
        set textContent(v) {
        }, get textContent() {
            return '';
        },
        set tabIndex(v) {
        }, get tabIndex() {
            return 0;
        },
        set id(v) {
        }, get id() {
            return '';
        },
        set role(v) {
        }, get role() {
            return '';
        },
        setStyle: () => {
        },
        style: {
            setProperty: () => {
            }, background: ''
        },
        querySelector: () => mkNode(),
        querySelectorAll: () => [],
        contains: () => false, focus: () => {
        },
    };
    return n;
}

const html = fs.readFileSync('/Users/pathaoltd/go/src/github.com/fahimimam/portfolio/public/projects/portfolio-website/index.html', 'utf8');

// Extract the inline <script>...</script> block at the bottom of the
// article (the one with getElementById('pf-live-theme')). Hugo minifies
// the surrounding markup, so we just look for the script that contains
// our token names.
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = scripts.find(s => s.includes('pf-live-theme') || s.includes('pf-token-blue'));
if (!code) {
    console.error('FAIL: no inline showcase script found');
    process.exit(1);
}

const fakeDoc = {
    documentElement: {
        setAttribute: () => {
        },
        getAttribute: (k) => k === 'data-theme' ? 'cyberpunk' : null,
        style: {
            setProperty: () => {
            }
        },
    },
    createElement: () => mkNode(),
    body: {
        appendChild: () => {
        }, prepend: () => {
        }
    },
    head: {
        appendChild: () => {
        }
    },
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => mkNode(),
    addEventListener: () => {
    },
    readyState: 'complete',
    hidden: false,
};

global.document = fakeDoc;
global.window = {
    innerWidth: 1024, innerHeight: 768, addEventListener: () => {
    },
    dispatchEvent: () => {
    }, setTimeout: setTimeout, clearTimeout: clearTimeout
};
global.localStorage = {
    _s: {}, getItem(k) {
        return this._s[k] || null;
    }, setItem(k, v) {
        this._s[k] = String(v);
    }
};
global.Event = function () {
};
global.MutationObserver = function () {
    return {
        observe: () => {
        }
    };
};
global.requestAnimationFrame = () => {
};
global.getComputedStyle = (el) => ({
    getPropertyValue: (n) => {
        const map = {
            '--neon-blue': '#00f3ff',
            '--neon-orange': '#ff6b35',
            '--neon-purple': '#bf40bf',
            '--neon-green': '#4ade80',
            '--cyber-bg': '#050811',
            '--cyber-border': 'rgba(0, 243, 255, 0.35)',
        };
        return map[n] || '';
    },
});

try {
    eval(code);
    console.log('portfolio showcase inline script: OK');
    process.exit(0);
} catch (e) {
    console.error('FAIL:', e.stack || e.message);
    process.exit(1);
}
