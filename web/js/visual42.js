'use strict';
// ---------- 42: camada WebGL de particulas luminosas (explosoes mais densas, faiscas e poeira de luz), barata para a placa de video ----------
const VGL = { ok: false, n: 0, MAX: 2800, IMM: 3200, m2: 0, x: null, cv: null, col: {} };
VGL.init = function () {
  try {
    const c = document.createElement('canvas'); c.width = 960; c.height = 540; c.style.cssText = 'position:fixed;pointer-events:none;z-index:5;display:none';
    const gl = c.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false }); if (!gl) return;
    const vs = 'attribute vec2 p;attribute float s;attribute vec4 c;uniform vec2 r;varying vec4 v;void main(){gl_Position=vec4(p.x/r.x*2.-1.,1.-p.y/r.y*2.,0.,1.);gl_PointSize=s;v=c;}';
    const fs = 'precision mediump float;varying vec4 v;void main(){float d=length(gl_PointCoord-.5)*2.;float a=clamp(1.-d,0.,1.);a=a*a;gl_FragColor=vec4(v.rgb*a*v.a,a*v.a);}';
    const mk = (t, src) => { const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram(); gl.attachShader(pr, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
    VGL.cv = c; VGL.gl = gl; VGL.pr = pr; VGL.buf = gl.createBuffer(); VGL.data = new Float32Array((VGL.MAX + VGL.IMM) * 7); VGL.pt = Array.from({ length: VGL.MAX }, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, s: 8, r: 1, g: 1, b: 1, a: 1, d: 1 }));
    VGL.loc = { p: gl.getAttribLocation(pr, 'p'), s: gl.getAttribLocation(pr, 's'), c: gl.getAttribLocation(pr, 'c'), r: gl.getUniformLocation(pr, 'r') };
    const rg = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE); VGL.maxS = rg ? rg[1] : 32; document.body.appendChild(c); VGL.ok = true; VGL.last = performance.now();
  } catch (e) { VGL.ok = false; }
};
VGL.rgb = c => { if (typeof c !== 'string' || c[0] !== '#' || c.length < 7) return [1, 1, 1]; return [parseInt(c.slice(1, 3), 16) / 255, parseInt(c.slice(3, 5), 16) / 255, parseInt(c.slice(5, 7), 16) / 255]; };
VGL.add = function (x, y, vx, vy, life, size, col, a, drag) {
  if (!VGL.ok || VGL.n >= VGL.MAX) return; const p = VGL.pt[VGL.n++], c = VGL.rgb(col); p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = p.max = life; p.s = size; p.r = c[0]; p.g = c[1]; p.b = c[2]; p.a = a; p.d = drag;
};
// brilho imediato: as particulas do jogo (G.parts) entram aqui em vez de uma chamada drawImage cada (muito mais barato na GPU)
VGL.glow = function (x, y, r, color, a) {
  if (!VGL.ok || VGL.m2 >= VGL.IMM || G.state === 'photo') return false; const st = G.state; if (!(st === 'play' || st === 'pause' || st === 'levelup' || st === 'clear' || st === 'over' || st === 'celebrate')) return false;
  let c = VGL.col[color]; if (!c) c = VGL.col[color] = VGL.rgb(color); const d = VGL.data, o = (VGL.MAX + VGL.m2) * 7, sc = 960 / W; d[o] = x * sc; d[o + 1] = y * sc; d[o + 2] = Math.min(VGL.maxS, r * 2 * sc); d[o + 3] = c[0]; d[o + 4] = c[1]; d[o + 5] = c[2]; d[o + 6] = a * GLOW * 1.25; VGL.m2++; return true;
};
const pglow = (x, y, r, c, a) => { if (!VGL.glow(x, y, r, c, a)) drawGlow(x, y, r, c, a); };
VGL.mult = () => (Save.data.settings && Save.data.settings.ultra ? 2.4 : 1.3);
VGL.frame = function () {
  if (!VGL.ok) return; const now = performance.now(), dt = Math.min(.05, (now - VGL.last) / 1000); VGL.last = now; const st = G.state, on = ['play', 'pause', 'levelup', 'clear', 'over', 'celebrate', 'photo'].includes(st) && (QL() >= 2 || VGL.m2 > 0), sim = QL() >= 2;
  const c = VGL.cv; if (!on) { c.style.display = 'none'; VGL.n = 0; VGL.m2 = 0; return; }
  const r = cv.getBoundingClientRect(); c.style.display = 'block'; c.style.left = r.left + 'px'; c.style.top = r.top + 'px'; c.style.width = r.width + 'px'; c.style.height = r.height + 'px';
  const k = VGL.maxS ? 1 : 1, sc = 960 / W;
  // aneis novos viram aneis de particulas
  if (st === 'play' || st === 'celebrate') for (const rg of G.rings) if (!rg._g) { rg._g = 1; const n = Math.min(40, Math.round(rg.max / 12)); for (let i = 0; i < n; i++) { const a = i / n * TAU; VGL.add(rg.x, rg.y, Math.cos(a) * rg.max * 1.6, Math.sin(a) * rg.max * 1.6, .55, 10, hex(rg.c), .7, 3.2); } }
  // poeira de luz ambiente
  if (st === 'play' && Math.random() < dt * (Save.data.settings.ultra ? 22 : 9)) VGL.add(rand(0, W), rand(0, H), rand(-8, 8), rand(-14, -4), rand(3, 6), rand(6, 16), pick(['#c8a0ff', '#9fe8ff', '#ffe9a8']), .35, .1);
  const gl = VGL.gl, d = VGL.data; let m = 0;
  for (let i = 0; i < (sim ? VGL.n : 0); i++) {
    const p = VGL.pt[i]; p.life -= dt; if (p.life <= 0) { VGL.pt[i] = VGL.pt[VGL.n - 1]; VGL.pt[VGL.n - 1] = p; VGL.n--; i--; continue; }
    const f = Math.exp(-p.d * dt); p.vx *= f; p.vy *= f; if (st !== 'pause' && st !== 'levelup' && st !== 'photo') { p.x += p.vx * dt; p.y += p.vy * dt; }
    const t = p.life / p.max, o = m * 7; d[o] = p.x * sc; d[o + 1] = p.y * sc; d[o + 2] = Math.min(VGL.maxS, p.s * (.5 + t * .7) * sc * 1.6); d[o + 3] = p.r; d[o + 4] = p.g; d[o + 5] = p.b; d[o + 6] = p.a * Math.min(1, t * 1.6); m++;
  }
  gl.viewport(0, 0, 960, 540); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
  if (VGL.m2) { d.copyWithin(m * 7, VGL.MAX * 7, (VGL.MAX + VGL.m2) * 7); m += VGL.m2; VGL.m2 = 0; } if (!m) return;
  gl.bindBuffer(gl.ARRAY_BUFFER, VGL.buf); gl.bufferData(gl.ARRAY_BUFFER, d.subarray(0, m * 7), gl.DYNAMIC_DRAW);
  const L = VGL.loc; gl.enableVertexAttribArray(L.p); gl.vertexAttribPointer(L.p, 2, gl.FLOAT, false, 28, 0); gl.enableVertexAttribArray(L.s); gl.vertexAttribPointer(L.s, 1, gl.FLOAT, false, 28, 8); gl.enableVertexAttribArray(L.c); gl.vertexAttribPointer(L.c, 4, gl.FLOAT, false, 28, 12); gl.uniform2f(L.r, 960, 540);
  gl.drawArrays(gl.POINTS, 0, m);
};
const hex = c => (typeof c === 'string' && c[0] === '#' && c.length === 7) ? c : '#ffffff';
// emissores extras ligados as funcoes de efeito do jogo
{
  const bu = burst; burst = function (x, y, colors, n, sp = 260, size = 5) { const r = bu(x, y, colors, n, sp, size); if (VGL.ok && QL() >= 2) { const m = Math.round(n * VGL.mult()); for (let i = 0; i < m; i++) { const a = rand(0, TAU), s = rand(.2, 1.2) * sp * 1.1; VGL.add(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(.4, 1), size * rand(2.2, 4.4), hex(colors[i % colors.length]), .55, 2.4); } } return r; };
  const sp_ = sparks; sparks = function (x, y, c, n, sp = 220) { const r = sp_(x, y, c, n, sp); if (VGL.ok && QL() >= 2) for (let i = 0; i < n * VGL.mult(); i++) { const a = rand(0, TAU), s = rand(.4, 1.4) * sp; VGL.add(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(.25, .6), rand(6, 12), hex(c), .7, 3.5); } return r; };
  const sd = shedDebris; shedDebris = function (x, y, n, cols, sp = 320, size = 11) { const r = sd(x, y, n, cols, sp, size); if (VGL.ok && QL() >= 2) for (let i = 0; i < n * VGL.mult() * 2; i++) { const a = rand(0, TAU), s = rand(.3, 1) * sp; VGL.add(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(.5, 1.1), rand(8, 18), hex(cols[i % cols.length]), .4, 2); } return r; };
}
VGL.init();
addEventListener('load', () => { const rd = render; render = function () { rd(); try { VGL.frame(); } catch (e) { VGL.ok = false; if (VGL.cv) VGL.cv.style.display = 'none'; } }; });
