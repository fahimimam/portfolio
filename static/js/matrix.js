// Matrix-rain background. Uses requestAnimationFrame so it pauses when the tab
// is hidden and stops burning CPU/battery.
const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.zIndex = '-1';
canvas.style.opacity = '0.1';
canvas.style.pointerEvents = 'none';
document.body.prepend(canvas);

const ctx = canvas.getContext('2d');
let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

const chars = '01';
const fontSize = 14;
let columns = Math.ceil(width / fontSize);
let drops = Array(columns).fill(1);

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    columns = Math.ceil(width / fontSize);
    drops = Array(columns).fill(1);
}

let running = true;

function draw() {
    if (!running) return;

    ctx.fillStyle = 'rgba(10, 14, 39, 0.05)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#00f3ff';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }

    requestAnimationFrame(draw);
}

document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(draw);
});

window.addEventListener('resize', resize);

requestAnimationFrame(draw);