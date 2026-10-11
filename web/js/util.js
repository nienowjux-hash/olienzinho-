'use strict';
// ---------- base: constantes, matematica, canvas, glow, entrada, save ----------
const W = 1280, H = 720, TAU = Math.PI * 2;
const FONT = '"Nunito","Segoe UI",Arial,sans-serif';
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const pick = a => a[Math.floor(Math.random() * a.length)];
const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const cv = document.getElementById('c'), ctx = cv.getContext('2d');
let K = 1;
const bloom = document.createElement('canvas'), bctx = bloom.getContext('2d');
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = innerWidth, h = innerHeight;
  if (w / h > W / H) w = h * W / H; else h = w * H / W;
  cv.style.width = w + 'px'; cv.style.height = h + 'px';
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  K = cv.width / W;
  bloom.width = Math.round(cv.width / 4); bloom.height = Math.round(cv.height / 4);
}
addEventListener('resize', resize); resize();

// brilho (sprites radiais em cache por cor)
const glowCache = {};
function glow(color) {
  if (glowCache[color]) return glowCache[color];
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, color); gr.addColorStop(0.25, color + 'aa'); gr.addColorStop(1, color + '00');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return glowCache[color] = c;
}
function drawGlow(x, y, r, color, a = 1) {
  ctx.globalAlpha = a; ctx.drawImage(glow(color), x - r, y - r, r * 2, r * 2);
}

// ---------- entrada ----------
const Input = {
  keys: {}, hit: {},
  mouse: { x: W / 2, y: H / 2, down: false, click: false, moved: 0 },
  down(k) { return !!this.keys[k]; },
  pressed(k) { return !!this.hit[k]; },
  any() { return Object.keys(this.hit).length > 0; },
  endFrame() { this.hit = {}; this.mouse.click = false; },
};
addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (!e.repeat) Input.hit[k] = true;
  Input.keys[k] = true;
  if (k.startsWith('arrow') || k === ' ' || k === 'tab') e.preventDefault();
  Snd.init();
});
addEventListener('keyup', e => { Input.keys[e.key.toLowerCase()] = false; });
addEventListener('blur', () => { Input.keys = {}; });
function mpos(e) {
  const r = cv.getBoundingClientRect();
  Input.mouse.x = (e.clientX - r.left) / r.width * W;
  Input.mouse.y = (e.clientY - r.top) / r.height * H;
}
cv.addEventListener('pointermove', e => { mpos(e); Input.mouse.moved = performance.now(); });
cv.addEventListener('pointerdown', e => { mpos(e); Input.mouse.down = true; Input.mouse.click = true; Snd.init(); });
addEventListener('pointerup', () => { Input.mouse.down = false; });

// ---------- save ----------
const Save = (() => {
  const KEY = 'olienzinho_save_v1';
  const def = () => ({ coins: 0, unlocked: 1, best: {}, shop: {}, settings: { sfx: .8, music: .55 }, runs: 0 });
  let d = def();
  function load() {
    try {
      const o = JSON.parse(localStorage.getItem(KEY) || '{}');
      d = Object.assign(def(), o);
      d.settings = Object.assign(def().settings, o.settings || {});
    } catch (e) { d = def(); }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* sem storage */ } }
  function reset() { d = def(); save(); }
  return { get data() { return d; }, load, save, reset };
})();
