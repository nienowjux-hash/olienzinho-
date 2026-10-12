'use strict';
// ---------- videos da historia refeitos: camera em movimento, camadas de profundidade, cenas com acontecimentos de verdade ----------
// (so usados para gerar os arquivos em /video; cada clipe e uma funcao do tempo)
const C4 = { cam: { x: 0, y: 0, z: 1 } };
const h4 = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const cl4 = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ez = x => { x = cl4(x); return x * x * (3 - 2 * x); };
const hx4 = c => (typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c)) ? c : '#ffb340';
const mix4 = (a, b, k) => lerp(a, b, k);

// camera: tudo o que for desenhado dentro de C4.world() sofre pan/zoom; layer(d) aplica paralaxe
C4.world = function (cam, fn) { ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(cam.z || 1, cam.z || 1); ctx.translate(-W / 2 - (cam.x || 0) * .0, -H / 2); C4.cam = cam; fn(); ctx.restore(); };
C4.layer = function (d, fn) { ctx.save(); ctx.translate(-C4.cam.x * d, -C4.cam.y * d); fn(); ctx.restore(); };

C4.sky = function (t, c0, c1, c2, o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, c0); g.addColorStop(.55, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) { const d = .05 + i * .02, x = h4(i + (o.seed || 0)) * W + Math.sin(t * .08 + i) * 80, y = h4(i + 20 + (o.seed || 0)) * H * .8 + Math.cos(t * .06 + i) * 40; C4.layer(d, () => drawGlow(x, y, 380 + h4(i + 9) * 300, o.neb ? o.neb[i % o.neb.length] : '#6a3ad8', (o.nebA ?? .16))); }
  ctx.restore();
  const n = o.stars ?? 140;
  for (let i = 0; i < n; i++) { const d = .08 + (i % 3) * .14, x = ((h4(i) * (W + 400) - t * (2 + d * 10) * (o.drift ?? 1)) % (W + 400) + W + 400) % (W + 400) - 200, y = h4(i + 50) * H, r = .8 + h4(i + 9) * (1.2 + d * 3), tw = .5 + .5 * Math.sin(t * (1 + h4(i + 3) * 3) + i); C4.layer(d, () => { ctx.globalAlpha = (.35 + .65 * tw) * (o.starA ?? 1); ctx.fillStyle = i % 7 === 0 ? '#ffe9a8' : '#e8e0ff'; ctx.fillRect(x, y, r, r); }); }
  ctx.globalAlpha = 1;
};
C4.planet = function (x, y, r, c0, c1, ring, d = .3) { C4.layer(d, () => { const g = ctx.createRadialGradient(x - r * .35, y - r * .35, r * .1, x, y, r * 1.05); g.addColorStop(0, c0); g.addColorStop(1, c1); if (ring) { ctx.strokeStyle = 'rgba(230,215,255,.45)'; ctx.lineWidth = r * .09; ctx.beginPath(); ctx.ellipse(x, y, r * 1.7, r * .42, -.3, Math.PI, TAU); ctx.stroke(); } ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(0,0,20,.35)'; ctx.beginPath(); ctx.arc(x + r * .3, y + r * .25, r, 0, TAU); ctx.globalCompositeOperation = 'source-atop'; ctx.fill(); ctx.globalCompositeOperation = 'source-over'; if (ring) { ctx.strokeStyle = 'rgba(230,215,255,.6)'; ctx.lineWidth = r * .09; ctx.beginPath(); ctx.ellipse(x, y, r * 1.7, r * .42, -.3, 0, Math.PI); ctx.stroke(); } }); };
C4.ridge = function (d, base, amp, col, seed, t = 0) { C4.layer(d, () => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-400, H + 300); for (let x = -400; x <= W + 400; x += 40) ctx.lineTo(x, base - Math.abs(Math.sin(x * .004 + seed) * amp) - Math.sin(x * .013 + seed * 2) * amp * .35); ctx.lineTo(W + 400, H + 300); ctx.closePath(); ctx.fill(); }); };
C4.dust = function (t, n, col, a = .5) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < n; i++) { const x = (h4(i * 3) * W + Math.sin(t * .3 + i) * 40 + t * (6 + h4(i) * 10)) % W, y = H - ((t * (8 + h4(i + 4) * 16) + h4(i + 8) * H) % H); ctx.globalAlpha = a * (.4 + .6 * Math.sin(t + i)); drawGlow(x, y, 3 + h4(i + 2) * 5, col, .8); } ctx.restore(); };
C4.rays = function (x, y, t, n, len, col, a, spin = .15) { ctx.save(); ctx.translate(x, y); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < n; i++) { ctx.save(); ctx.rotate(i / n * TAU + t * spin); const g = ctx.createLinearGradient(0, 0, 0, -len); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha = a * (.5 + .5 * Math.sin(t * 1.3 + i * 1.7)); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(12, 0); ctx.lineTo(4, -len); ctx.lineTo(-4, -len); ctx.fill(); ctx.restore(); } ctx.restore(); };
C4.ring = function (x, y, r, col, a, w = 4) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.restore(); };
C4.glow = (x, y, r, col, a) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(x, y, r, col, a); ctx.restore(); };
C4.starPt = function (x, y, r, rot, col, a) { Cine.star(x, y, r, rot, col, a); };

// o foguete: trilha calculada pela funcao de posicao (o clipe nao guarda estado)
C4.rocket = function (pos, t, o = {}) {
  const [x, y] = pos(t), [x2, y2] = pos(t + .05), sc = o.s ?? 1.6, ang = o.rot ?? (Math.atan2(y2 - y, x2 - x) + Math.PI / 2);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let q = 1; q <= 14; q++) { const [tx, ty] = pos(t - q * .045); ctx.globalAlpha = (1 - q / 15) * .5 * (o.trail ?? 1); drawGlow(tx, ty + 22 * sc * .4, (16 - q) * sc * .9, o.tc || '#c8a0ff', .7); }
  ctx.restore();
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.noTilt ? 0 : clamp(ang - 0, -.5, .5) * (o.tilt ?? .5)); Art.ship(0, 0, { pal: SKIN_DEFAULT, t, scale: sc, vx: o.vx ?? 0, lookx: o.lookx ?? .4, looky: o.looky ?? -.4, blinkT: 0, inv: 0, boost: o.boost ?? .9, mood: o.mood, noWings: false }); ctx.restore();
  return [x, y];
};
C4.orbi = function (x, y, s, a = 1) { ctx.save(); ctx.globalAlpha = a; try { Art.orbi(x, y, { vx: 0, t: World.t, scale: s * 1.5, lookx: -.5, looky: -.2, blinkT: 0, inv: 0, sx: 1, sy: 1 }); } catch (e) { } ctx.restore(); };

C4.cap = function (text, t, a, b) {
  const k = cl4((t - a) / .6) * cl4((b - t) / .6); if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k; ctx.font = `800 34px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const words = text.split(' '), lines = []; let ln = ''; for (const w of words) { const tt = ln ? ln + ' ' + w : w; if (ctx.measureText(tt).width > 1080 && ln) { lines.push(ln); ln = w; } else ln = tt; } if (ln) lines.push(ln);
  const bh = 24 + lines.length * 46, y0 = H - 80 - bh + (1 - k) * 14, bw = Math.min(1180, Math.max(...lines.map(l => ctx.measureText(l).width)) + 80);
  ctx.fillStyle = 'rgba(6,2,22,.72)'; ctx.strokeStyle = 'rgba(255,214,120,.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(W / 2 - bw / 2, y0, bw, bh, 22); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffd36a'; ctx.fillRect(W / 2 - 34, y0 - 3, 68, 4);
  ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 8; ctx.fillStyle = '#fff'; lines.forEach((l, i) => ctx.fillText(l, W / 2, y0 + 12 + 23 + i * 46)); ctx.restore();
};
Cine.cap = C4.cap;
C4.vig = function (a = .6) { const g = ctx.createRadialGradient(W / 2, H / 2, 320, W / 2, H / 2, 930); g.addColorStop(0, 'rgba(2,0,10,0)'); g.addColorStop(1, 'rgba(2,0,10,' + a + ')'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
C4.inout = (t, dur, a = .7) => { Cine.fade(1 - cl4(t / a)); Cine.fade(cl4((t - (dur - a)) / a)); };
C4.heart = function (x, y, s, t, col = '#ffe9a8', beat = 1) { const p = 1 + .06 * Math.sin(t * 6) * beat; ctx.save(); ctx.translate(x, y); ctx.scale(s * p, s * p); C4.glow(0, 0, 150, col, .5); const g = ctx.createRadialGradient(-6, -10, 4, 0, 0, 40); g.addColorStop(0, '#fff'); g.addColorStop(.5, col); g.addColorStop(1, '#ff8a4a'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-52, -4, -34, -46, 0, -22); ctx.bezierCurveTo(34, -46, 52, -4, 0, 30); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2.4; ctx.stroke(); ctx.restore(); };
C4.tendril = function (x0, y0, x1, y1, k, t, seed, w = 16) { if (k <= 0) return; const sx = x0, sy = y0; ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(8,0,22,.95)'; ctx.lineWidth = w; ctx.beginPath(); for (let i = 0; i <= 24; i++) { const u = i / 24 * k, nx = lerp(sx, x1, u) + Math.sin(u * 9 + t * 1.5 + seed) * 22 * u, ny = lerp(sy, y1, u) + Math.cos(u * 7 + t * 1.2 + seed) * 22 * u; i ? ctx.lineTo(nx, ny) : ctx.moveTo(nx, ny); } ctx.stroke(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(160,80,255,.55)'; ctx.lineWidth = 2.2; ctx.stroke(); ctx.restore(); };
const GN = { C: 'COLMEIA', P: 'PÉTREO', E: 'VIGIA', S: 'SOLARIS' };
C4.guards = function (cx, cy, rx, ry, t, t0, step, sc = 1.2, fade = 1) { ['C', 'P', 'E', 'S'].forEach((g, i) => { const [x, y] = GUARD_POS(cx, cy, rx, ry, t, i), al = cl4((t - t0 - i * step) / .8) * fade; if (al <= .02) return; const pop = cl4((t - t0 - i * step) / .5); C4.ring(x, y, 20 + pop * 140, GUARDS[g].c, (1 - pop) * .8, 5); guard(g, x, y, t, sc, al); ctx.save(); ctx.globalAlpha = al * .9; txt(GN[g], x, y + 70 * sc, 15, GUARDS[g].c, 'center', 900); ctx.restore(); }); };

// ============ 1. prologo ============
Cine.clips.v_prologue = { dur: 16, pal: () => STAGES[0].pal, f(t) {
  const cx = W / 2, cy = H * .42, z = 1.3 - .3 * ez(t / 9) + .1 * ez((t - 12) / 4);
  C4.world({ x: Math.sin(t * .25) * 30, y: 0, z }, () => {
    C4.sky(t, '#03010a', '#09031e', '#150838', { stars: 0 });
    // estrelas nascem de cada batida do coracao e voam para o lugar
    for (let i = 0; i < 150; i++) { const tb = 4.8 + i * .05, u = ez((t - tb) / 1.6); if (u <= 0) continue; const fx = h4(i) * W, fy = 70 + h4(i + 50) * (H - 150), d = .1 + (i % 3) * .12, x = lerp(cx, fx, u), y = lerp(cy, fy, u), dim = 1 - cl4((t - 13) / 2) * .8; C4.layer(d, () => { Cine.star(x, y, 3 + h4(i + 9) * 5, t + i, i % 6 ? '#e8e0ff' : '#ffe9a8', u * dim * (.5 + .5 * Math.sin(t * 2 + i))); }); }
    C4.planet(W * .82, H * .72, 90, '#5a8ae8', '#14286a', true, .25); C4.planet(W * .12, H * .28, 46, '#d89a6a', '#4a2a20', false, .2);
    if (t < 5.4) { ctx.save(); ctx.globalAlpha = 1 - cl4((t - 4.2) / 1.2); Screens.sceneVoid(t); ctx.restore(); }
    const k = ez((t - 4.4) / 1.2); if (k > 0) { const beat = 1 + .1 * Math.sin(t * 5.5); C4.rays(cx, cy, t, 14, 520 * k, '#ffe9a8', .35 * k); C4.glow(cx, cy, 260 * k * beat, '#ffcf6b', .6); C4.heart(cx, cy, 2.4 * k, t, '#ffe9a8'); for (let q = 0; q < 3; q++) { const r = ((t * .9 + q / 3) % 1); C4.ring(cx, cy, 60 + r * 420, '#ffe9a8', (1 - r) * .5 * k, 3); } }
    C4.guards(cx, cy, 340, 150, t, 9, .9, 1.3, 1 - cl4((t - 13.5) / 1.4) * .6);
    if (t > 12.6) { const w = ez((t - 12.8) / 2.6); [[-80, -60], [W + 80, -40], [-60, H + 60], [W + 60, H + 80], [W / 2, -100], [W / 2, H + 100], [-100, H * .5], [W + 100, H * .45]].forEach(([x, y], i) => C4.tendril(x, y, cx + Math.sin(i) * 80, cy + Math.cos(i) * 50, w * .85, t, i * 2.3, 22)); ctx.save(); ctx.globalAlpha = w * .35; ctx.fillStyle = '#05010f'; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.restore(); }
  });
  C4.dust(t, 24, '#fff1c0', cl4((t - 5) / 2) * .5);
  Cine.cap('Antes do primeiro céu, havia só o Vazio.', t, .4, 4); Cine.cap('Então nasceu o Coração de Luz. E de cada batida, uma estrela.', t, 4.6, 8.4); Cine.cap('Quatro guardiões protegiam a luz: Colmeia, Pétreo, Vigia e Solaris.', t, 9, 12.3); Cine.cap('Mas o Vazio aprendeu a sussurrar.', t, 12.8, 15.2);
  C4.vig(.6); C4.inout(t, 16);
} };

// ============ 2. fim da parte 2 (Vazio descansa, a luz volta) ============
Cine.clips.v_finale1 = { dur: 14, pal: () => STAGES[5].pal, f(t) {
  const cx = W / 2, cy = H * .44;
  C4.world({ x: Math.sin(t * .2) * 40, y: -20 * ez(t / 14), z: 1.05 + .12 * ez(t / 14) }, () => {
    const lit = ez((t - 3.6) / 3);
    C4.sky(t, mix4s('#03010a', '#0c0630', lit), mix4s('#0a0420', '#2a1058', lit), mix4s('#120630', '#5a2a78', lit), { stars: 120, starA: .35 + lit * .65, neb: ['#6a3ad8', '#d86ad0', '#6aa8ff'], nebA: .1 + lit * .2 });
    C4.planet(W * .2, H * .7, 80, '#8a5ac8', '#241048', true, .3); C4.planet(W * .85, H * .25, 60, '#e8a86a', '#4a2418', false, .25);
    // o Vazio encolhe e dorme
    const sh = 1 - ez(t / 3.4) * .85, vx = W * .5, vy = H * .8; if (sh > .05) { ctx.save(); ctx.translate(vx, vy); ctx.scale(sh, sh); ctx.fillStyle = 'rgba(6,0,18,.95)'; ctx.beginPath(); ctx.ellipse(0, 0, 360, 130, 0, 0, TAU); ctx.fill(); for (let i = 0; i < 7; i++) C4.tendril(0, 0, Math.cos(i * 1.1) * 300, Math.sin(i * 1.1) * 110, 1, t, i, 16); const o = .3 + .7 * (1 - ez(t / 3)); ctx.globalAlpha = o; ctx.fillStyle = '#c9a0ff'; ctx.beginPath(); ctx.ellipse(0, -10, 60, 12 * (1 - ez((t - 2) / 1.4)) + 2, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    // batida: coracao sobe e solta uma onda de luz
    if (t > 3.4) { const rise = ez((t - 3.6) / 2.4); const yy = lerp(H * .7, cy, rise); C4.rays(cx, yy, t, 12, 460 * rise, '#ffe9a8', .3 * rise); C4.heart(cx, yy, 2 * rise, t, '#ffe9a8'); for (let q = 0; q < 4; q++) { const u = ((t - 4.2) * .5 + q * .25); if (u > 0) C4.ring(cx, yy, (u % 1) * 900, '#ffe9a8', (1 - (u % 1)) * .45, 5); } }
    // guardioes acordam
    C4.guards(cx, cy, 380, 160, t, 7, .9, 1.3);
    // o ceu respira: onda sobre as estrelas
    if (t > 10.6) { const u = (t - 10.6) / 2.4; C4.ring(cx, cy, u * 1000, '#fff1c0', (1 - cl4(u)) * .6, 14); }
  });
  C4.dust(t, 30, '#ffe9a8', lit4(t) * .6);
  Cine.cap('O Vazio não foi destruído. Ele aprendeu a descansar.', t, .5, 3.6); Cine.cap('A luz voltou a bater.', t, 3.8, 6.8); Cine.cap('Os guardiões acordaram.', t, 7.2, 10.4); Cine.cap('E o céu inteiro respirou, de novo.', t, 10.6, 13);
  C4.vig(.5); C4.inout(t, 14);
} };
function mix4s(a, b, k) { const p = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)], A = p(a), B = p(b); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',') + ')'; }
const lit4 = t => ez((t - 3.6) / 3);

// ============ 3. a porta de luz ============
Cine.clips.v_door = { dur: 12, pal: () => STAGES[6].pal, f(t) {
  const pos = tt => [lerp(300, 640, ez(tt / 11)) + Math.sin(tt * .8) * 24, lerp(450, 360, ez(tt / 11)) + Math.sin(tt * 1.2) * 10];
  const dk = ez((t - 3.9) / 2.6), px = 640, py = 330;
  C4.world({ x: lerp(0, 60, ez(t / 12)), y: 0, z: 1 + .12 * ez((t - 4) / 7) }, () => {
    C4.sky(t, '#1a0e48', '#3a1a78', '#9a5a98', { stars: 110, neb: ['#8a5ad8', '#ff9ab0', '#6aa8ff'], nebA: .22, seed: 4 });
    C4.planet(W * .16, H * .3, 70, '#9ab8ff', '#22306a', true, .3); C4.planet(W * .9, H * .62, 110, '#e89a6a', '#4a2418', false, .22);
    C4.ridge(.5, H * .86, 70, '#14082e', 1); C4.ridge(.8, H * .94, 60, '#0a031c', 3);
    // porta: arco de luz que cresce do horizonte
    if (dk > 0) { const dw = 170 * dk, dh = 330 * dk; C4.rays(px, py + dh * .45, t, 22, 700 * dk, '#fff1c0', .45 * dk, .08); ctx.save(); ctx.translate(px, py + dh * .5); ctx.beginPath(); ctx.moveTo(-dw, 0); ctx.lineTo(-dw, -dh + dw); ctx.arc(0, -dh + dw, dw, Math.PI, 0); ctx.lineTo(dw, 0); ctx.closePath(); const g = ctx.createRadialGradient(0, -dh * .55, 10, 0, -dh * .45, dh * .75); g.addColorStop(0, '#ffffff'); g.addColorStop(.55, '#ffeeb0'); g.addColorStop(1, '#e8902a'); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#ffe9a8'; ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.restore(); C4.glow(px, py, 420 * dk, '#ffe9a8', .5 * dk); }
    // do outro lado: ceu apagado
    if (t > 7.7) { const u = ez((t - 7.7) / 1.8); ctx.save(); ctx.globalAlpha = u * .85; for (let i = 0; i < 40; i++) { ctx.fillStyle = '#6a6a88'; ctx.fillRect(px - 150 + h4(i) * 300, py - 120 + h4(i + 9) * 300, 3, 3); } ctx.restore(); }
    C4.rocket(pos, t, { s: 1.25 - .25 * ez((t - 5) / 6), mood: t > 5 ? 'shock' : 'happy', tc: '#ffd0ff' });
  });
  C4.dust(t, 26, '#ffe9c0', .5);
  Cine.cap('O céu estava em paz.', t, .4, 3.6); Cine.cap('Até que uma porta de luz se abriu no horizonte.', t, 3.9, 7.4); Cine.cap('Do outro lado... um céu que nunca foi aceso.', t, 7.7, 10.6);
  if (t > 8.6) Cine.fade(cl4((t - 9) / 2.8), '#05010f'); C4.vig(.55); Cine.fade(1 - cl4(t / .7));
} };

// ============ 4. a fenda ============
Cine.clips.v_rift = { dur: 13, pal: () => STAGES[9].pal, f(t) {
  const cx = W / 2, cy = H * .46;
  C4.world({ x: Math.sin(t * .3) * 50, y: Math.cos(t * .2) * 20, z: 1.08 + .1 * ez(t / 13) }, () => {
    C4.sky(t, '#08031a', '#180a42', '#2a1060', { stars: 100, neb: ['#8a4aff', '#ff4aa0', '#4acaff'], nebA: .2, seed: 7 });
    // cacos do espelho caindo
    for (let i = 0; i < 26; i++) { const x = h4(i) * W, y = ((t * (40 + h4(i + 4) * 90) + h4(i + 9) * H * 2) % (H + 200)) - 100, r = 10 + h4(i + 3) * 26; C4.layer(.15 + h4(i) * .4, () => { ctx.save(); ctx.translate(x, y); ctx.rotate(t * (h4(i + 7) - .5) * 2 + i); ctx.fillStyle = 'rgba(200,185,255,.4)'; ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * .7, r * .3); ctx.lineTo(-r * .5, r * .6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }); }
    // a fenda de luz atravessa o ceu
    const prog = ez((t - .8) / 3.4); const pts = []; for (let i = 0; i <= 12; i++) pts.push([lerp(-100, W + 100, i / 12), H * .1 + i / 12 * H * .8 + Math.sin(i * 2.7) * 70 * (i % 2 ? 1 : -1)]);
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; for (const [w, c, a] of [[54, 'rgba(255,214,120,.18)', 1], [22, 'rgba(255,240,200,.5)', 1], [7, '#ffffff', 1]]) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); const n = Math.floor(prog * 12); for (let i = 0; i <= n; i++) i ? ctx.lineTo(pts[i][0], pts[i][1]) : ctx.moveTo(pts[i][0], pts[i][1]); if (n < 12) { const f = prog * 12 - n, a1 = pts[n], b1 = pts[n + 1]; ctx.lineTo(lerp(a1[0], b1[0], f), lerp(a1[1], b1[1], f)); } ctx.stroke(); } ctx.restore();
    // fragmentos coloridos de cada setor flutuando na fenda
    for (let i = 0; i < 9; i++) { const u = (i + .5) / 9, x = lerp(80, W - 80, u), y = lerp(H * .15, H * .8, u) + Math.sin(u * 20) * 60 + Math.sin(t + i) * 10, on = ez((t - 2.2 - i * .25) / 1); if (on <= 0) continue; const c = hx4(STAGES[i % 9].tint); ctx.save(); ctx.translate(x + 40, y - 56); ctx.rotate(t * .6 + i); ctx.scale(on, on); C4.glow(0, 0, 60, c, .5); ctx.fillStyle = c; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(18, -6); ctx.lineTo(10, 24); ctx.lineTo(-14, 18); ctx.lineTo(-18, -8); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
    // algo bate no centro
    if (t > 8.2) { const b = cl4((t - 8.2) / 2); const th = Math.max(0, Math.sin(t * 7)) ** 6; C4.glow(cx, cy, 200 + th * 160, '#ffe9a8', b * (.3 + th * .5)); C4.heart(cx, cy, 1.4 * b, t, '#ffcf6b', 1); C4.ring(cx, cy, th * 300, '#ffe9a8', b * (1 - th) * .5, 5); }
    C4.rocket(tt => [lerp(160, 520, ez(tt / 12)), 440 - Math.sin(ez(tt / 12) * Math.PI) * 70], t, { s: 1.1, mood: 'worry', tc: '#ffd0ff' });
  });
  C4.dust(t, 20, '#d8c8ff', .5);
  Cine.cap('Com o Espelho partido, uma fenda cruzou o céu inteiro.', t, .6, 4.2); Cine.cap('Pedaços de todos os setores flutuavam nela, como lembranças.', t, 4.5, 8.2); Cine.cap('E no centro... algo batia.', t, 8.6, 11.8);
  C4.vig(.6); C4.inout(t, 13);
} };

// ============ 5. o final: todos viram luz ============
Cine.clips.v_end = { dur: 17, pal: () => STAGES[9].pal, f(t) {
  const cx = W / 2, cy = H * .4;
  C4.world({ x: 0, y: -30 * ez(t / 17), z: 1.12 - .12 * ez(t / 17) }, () => {
    const dawn = ez((t - 3) / 6);
    C4.sky(t, mix4s('#080318', '#2a1a68', dawn), mix4s('#150a3a', '#8a4a98', dawn), mix4s('#250e58', '#ffb890', dawn), { stars: 130, neb: ['#8a4aff', '#ff9ab0', '#ffe9a8'], nebA: .12 + dawn * .2, seed: 2 });
    C4.planet(W * .14, H * .66, 85, '#7ab0ff', '#1a2a68', true, .3); C4.planet(W * .88, H * .3, 55, '#ffb86a', '#5a2a1a', false, .22);
    C4.heart(cx, cy, 1.1 + .5 * ez((t - .5) / 3), t, '#ffe9a8'); C4.rays(cx, cy, t, 16, 600, '#ffe9a8', .25 * ez((t - 1) / 3));
    // os quatro chefes viram luz e sobem para o ceu
    [['#ffd36a', 'ARAUTO', -380], ['#33c4ff', 'LEVIATÃ', -130], ['#e8d0ff', 'REFLEXO', 130], ['#ff7aa8', 'CORAÇÃO', 380]].forEach(([c, nm, ox], i) => { const t0 = 4.2 + i * .9, u = ez((t - t0) / 3.2); if (t < t0) return; const x = cx + ox * (1 - u * .2), y = lerp(H * .7, 110 + (i % 2) * 70, u); ctx.save(); const fade = 1 - u; ctx.globalAlpha = Math.max(fade, .0); ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y + 30, 54 * (1 - u * .6), 70 * (1 - u * .6), 0, 0, TAU); ctx.fill(); ctx.restore(); C4.glow(x, y, 80 + u * 80, c, .5 + u * .4); Cine.star(x, y, 14 + u * 14, t + i, c, .6 + u * .4); for (let q = 0; q < 8; q++) { const a = q / 8 * TAU + t, rr = 26 + u * 40; C4.glow(x + Math.cos(a) * rr, y + Math.sin(a) * rr, 8, c, .7); } if (u > .5) { ctx.save(); ctx.globalAlpha = cl4((u - .5) * 2) * .9; txt(nm, x, y + 54, 15, c, 'center', 900); ctx.restore(); } });
    // o foguete e o Orbi
    const pos = tt => [lerp(300, 900, ez((tt - 8) / 9)), lerp(470, 340, ez((tt - 8) / 9)) + Math.sin(tt * 2) * 8]; if (t > 7) { const al = cl4((t - 7) / 1.2); ctx.save(); ctx.globalAlpha = al; const [rx, ry] = C4.rocket(pos, Math.max(8, t), { s: 1.35, mood: 'happy', tc: '#fff1c0' }); C4.orbi(rx - 110, ry + 20 + Math.sin(t * 2.4) * 8, .8, al); ctx.restore();
      // a luz que se divide: faiscas nascem do foguete e acendem estrelas apagadas
      if (t > 10) for (let i = 0; i < 36; i++) { const tt = t - 10 - i * .12; if (tt < 0) continue; const [rx2, ry2] = pos(Math.max(8, t)); const a = h4(i) * TAU, d = ez(Math.min(1, tt / 2.4)) * (160 + h4(i + 5) * 520); Cine.star(rx2 + Math.cos(a) * d, ry2 + Math.sin(a) * d * .7, 5 + h4(i + 2) * 8, tt, i % 3 ? '#fff1c0' : '#c8e8ff', .9); } }
  });
  C4.dust(t, 36, '#ffe9a8', .6 * dawnA(t));
  Cine.cap('O Coração finalmente descansou.', t, .4, 3.8); Cine.cap('O Arauto, o Leviatã, o Reflexo e o Coração viraram luz.', t, 4.1, 8.4); Cine.cap('E o menor foguete da galáxia aprendeu que a maior luz é a que se divide.', t, 9.2, 15);
  C4.vig(.4); C4.inout(t, 17, .9);
} };
const dawnA = t => ez((t - 3) / 6);

// ============ 6. ato II: o cemiterio das estrelas ============
Cine.clips.v_act2 = { dur: 13, pal: () => STAGES[4].pal, f(t) {
  const pos = tt => [lerp(180, W - 300, ez((tt - .8) / 11)), 450 - Math.sin(ez((tt - .8) / 11) * Math.PI) * 60 + Math.sin(tt * 2) * 6];
  C4.world({ x: lerp(-40, 90, ez(t / 13)), y: 0, z: 1.05 + .1 * ez((t - 4) / 8) }, () => {
    const gr = ez((t - 7) / 3);
    C4.sky(t, mix4s('#06102a', '#080814', gr), mix4s('#0e1e48', '#10101c', gr), mix4s('#163a66', '#1a1a2a', gr), { stars: 120, starA: 1 - gr * .6, neb: ['#4a8aff', '#6adad8', '#8a6aff'], nebA: .2 - gr * .12, seed: 5 });
    C4.planet(W * .2, H * .3, 62, '#6a9ae8', '#10285a', true, .25);
    // estrelas apagadas (cinza) e linhas de constelacao partidas no cemiterio
    if (gr > 0) { ctx.save(); ctx.globalAlpha = gr; for (let i = 0; i < 40; i++) { const x = h4(i) * (W + 200) - 100, y = 90 + h4(i + 30) * (H - 220); C4.layer(.3, () => { ctx.fillStyle = '#6a6a88'; ctx.beginPath(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, r = k % 2 ? 4 : 11; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.closePath(); ctx.fill(); if (i % 5 === 0) { ctx.strokeStyle = 'rgba(140,140,170,.4)'; ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 70, y + 40); ctx.stroke(); ctx.setLineDash([]); } }); } ctx.restore(); }
    C4.ridge(.6, H * .92, 50, '#070614', 6, t);
    // fumaca do Vazio vindo da direita
    const sm = ez((t - 4.4) / 3); if (sm > 0) { ctx.save(); ctx.globalAlpha = sm * .85; for (let i = 0; i < 6; i++) C4.tendril(W + 120, 120 + i * 100, W * .45, H * .5 + Math.sin(i) * 80, sm, t, i * 1.7, 30); ctx.restore(); }
    C4.guards(W * .5, H * .38, 300, 120, t, 1.2, .6, 1.1, 1 - gr * .3);
    C4.rocket(pos, t, { s: 1.3, mood: t > 4.4 ? 'determined' : 'happy', tc: '#9fe8ff' });
  });
  C4.dust(t, 22, '#9fe8ff', .4 * (1 - dawnA2(t)));
  Cine.cap('Com os quatro guardiões de volta, o céu respirou fundo.', t, .4, 4.2); Cine.cap('Mas o Vazio não esperou.', t, 4.6, 7.6); Cine.cap('A única rota até o seu coração passava pelo cemitério das estrelas.', t, 8, 12);
  C4.vig(.6); C4.inout(t, 13);
} };
const dawnA2 = t => ez((t - 7) / 3);

// ============ 7. o Vazio chega ao Coracao ============
Cine.clips.v_void = { dur: 13, pal: () => STAGES[5].pal, f(t) {
  const cx = W / 2, cy = H * .42;
  C4.world({ x: Math.sin(t * .5) * 12 * ez((t - 4) / 2), y: 0, z: 1.02 + .14 * ez(t / 13) }, () => {
    C4.sky(t, '#07031a', '#10083a', '#1c0c52', { stars: 0 });
    // estrelas apagando uma a uma
    for (let i = 0; i < 90; i++) { const x = h4(i) * W, y = 80 + h4(i + 40) * (H - 200), off = 3 + i * .06, a = 1 - ez((t - off) / .5); if (a <= .01) continue; const pop = t > off - .3 && t < off ? 1 + (t - off + .3) * 8 : 1; Cine.star(x, y, (3 + h4(i + 9) * 6) * pop, t + i, '#e8e0ff', a * .9); }
    ctx.save(); ctx.globalAlpha = ez((t - .4) / 1.6); Screens.sceneVoid(t); ctx.restore();
    // o Coracao de Luz cercado pelo Vazio
    const fall = ez((t - 5) / 6); C4.heart(cx, cy - 20, 1.7 * (1 - fall * .4), t, '#ffe9a8', 1 - fall * .6); C4.glow(cx, cy, 280 * (1 - fall * .5), '#ffcf6b', .4 * (1 - fall * .5));
    for (let i = 0; i < 10; i++) C4.tendril(W / 2 + Math.cos(i * 0.628) * 760, H / 2 + Math.sin(i * 0.628) * 480, cx, cy, ez((t - .8 - i * .12) / 4) * .95, t, i * 1.3, 24);
    // olhos do Vazio
    const ek = ez((t - 3) / 2); if (ek > 0) { ctx.save(); ctx.globalAlpha = ek * .8; C4.glow(cx - 170, cy - 140, 90, '#c9a0ff', .8); C4.glow(cx + 170, cy - 140, 90, '#c9a0ff', .8); ctx.fillStyle = '#f2e8ff'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + s * 170, cy - 140, 56, 12 + Math.sin(t * 2) * 3, s * -.12, 0, TAU); ctx.fill(); } ctx.restore(); }
    // so resta o foguete: a luz dele cresce
    const k = ez((t - 6) / 6); C4.glow(cx, H * .62, 90 + k * 200, '#ffe9a8', .5 + k * .3);
    C4.rocket(tt => [cx, H * .6 + Math.sin(tt * 2) * 5], t, { s: 1.3 + k * .2, mood: t > 6.4 ? 'determined' : 'worry', noTilt: true, tc: '#ffe9a8' });
  });
  Cine.cap('O Vazio chegou ao Coração de Luz.', t, .6, 4); Cine.cap('Cada estrela que ele tocava se apagava.', t, 4.4, 8); Cine.cap('Só restava um pequeno foguete.', t, 8.4, 11.8);
  C4.vig(.7); C4.inout(t, 13);
} };

// ============ 8. final verdadeiro ============
Cine.clips.v_true = { dur: 9, pal: () => STAGES[9].pal, f(t) {
  const cx = W / 2, cy = H * .44, k = ez((t - 2.5) / 3.5);
  C4.world({ x: 0, y: 0, z: 1.18 - .18 * ez(t / 9) }, () => {
    C4.sky(t, '#07031a', mix4s('#10083a', '#4a2a78', k), mix4s('#1c0c52', '#b86a88', k), { stars: 60, starA: .4 + k * .6, neb: ['#ffd36a', '#ff9ab0', '#8a6aff'], nebA: .1 + k * .25, seed: 9 });
    C4.rays(cx, cy, t, 18, 700 * k, '#ffe9a8', .4 * k, .12);
    for (let f = 0; f < 6; f++) { const a = f / 6 * TAU + t * .5, u = ez((t - .3 - f * .12) / 2.6), r = 420 * (1 - u) + 20, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * .7, c = hx4(STAGES[f].tint); ctx.save(); ctx.translate(x, y); ctx.rotate(t * 1.4 + f); C4.glow(0, 0, 70, c, .6); ctx.fillStyle = c; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(18, -6); ctx.lineTo(10, 24); ctx.lineTo(-14, 18); ctx.lineTo(-18, -8); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
    C4.heart(cx, cy, 2.6 * k, t, '#ffe9a8'); for (let q = 0; q < 3; q++) { const u = ((t - 3) * .6 + q / 3); if (u > 0) C4.ring(cx, cy, (u % 1) * 700, '#ffe9a8', (1 - u % 1) * .5 * k, 4); }
    for (let q = 0; q < 70; q++) { const on = ez((t - 4.5 - q * .05) / .6); if (on > 0) Cine.star(h4(q) * W, 90 + h4(q + 50) * (H - 180), 4 + h4(q + 9) * 9, t + q, '#fff1c0', on * .9); }
    C4.rocket(tt => [cx, H * .62 + Math.sin(tt * 2) * 5], t, { s: 1.2, mood: 'happy', noTilt: true, tc: '#fff1c0' });
  });
  C4.dust(t, 30, '#ffe9a8', .6 * k);
  Cine.cap('Seis fragmentos. Seis luzes.', t, .6, 3.2); Cine.cap('O Coração de Luz bateu de novo.', t, 3.4, 6.2); Cine.cap('E todas as estrelas acenderam.', t, 6.4, 8.6);
  C4.vig(.45); C4.inout(t, 9);
} };

// ============ 9. entre as fases (v_i1..v_i9) ============
{
  const LOOK = [null,
    { sky: ['#0a1a3a', '#1a3a78', '#5a78b8'], neb: ['#6aa8ff', '#ffb86a', '#8a6aff'], rock: true },
    { sky: ['#070a1c', '#141a40', '#2a2a68'], neb: ['#ffe86a', '#6aa8ff', '#8a6aff'], bolt: true },
    { sky: ['#2a0a08', '#6a1a10', '#d86a20'], neb: ['#ff8a3a', '#ff4a2a', '#ffd36a'], sun: true },
    { sky: ['#06060e', '#10101c', '#1c1c2c'], neb: ['#6a6a88', '#4a4a68', '#8a8aa8'], dead: true },
    { sky: ['#0a031c', '#1c0848', '#3a1070'], neb: ['#8a4aff', '#ff4aa0', '#4a2aa8'], void: true },
    { sky: ['#1a0e48', '#4a2a88', '#d89a78'], neb: ['#ffd36a', '#ff9ab0', '#8a8aff'], city: true },
    { sky: ['#041a3a', '#0a4a78', '#1a8ab8'], neb: ['#33c4ff', '#6adad8', '#6a8aff'], sea: true },
    { sky: ['#12082a', '#3a1a68', '#7a5aa8'], neb: ['#e8d0ff', '#8a6aff', '#ff9ab0'], glass: true },
    { sky: ['#080318', '#2a1560', '#c8885a'], neb: ['#ffd36a', '#ff9ab0', '#8a4aff'], last: true },
  ];
  for (let i = 1; i < 10; i++) {
    Cine.clips['v_i' + i] = { dur: 5, pal: () => STAGES[i].pal, f(t) {
      const st = STAGES[i], c = hx4(st.tint), L = LOOK[i], pos = tt => [lerp(140, W - 260, ez((tt - .2) / 4.4)), lerp(H - 250, 250, ez((tt - .2) / 4.4)) + Math.sin(tt * 2.2) * 8];
      C4.world({ x: lerp(0, 120, t / 5), y: 0, z: 1.02 + .08 * ez(t / 5) }, () => {
        C4.sky(t, ...L.sky, { stars: L.dead ? 40 : 120, neb: L.neb, nebA: .22, seed: i * 3, drift: 3 });
        C4.planet(W * .82, H * .3, 80 + i * 4, c, '#10082a', i % 2 === 0, .3);
        if (L.rock) for (let k = 0; k < 5; k++) { const x = h4(k + i) * W, y = 120 + h4(k + 9) * 380; C4.layer(.4, () => { ctx.fillStyle = '#2a3250'; ctx.beginPath(); for (let q = 0; q < 8; q++) { const a = q / 8 * TAU, r = (40 + h4(k + q) * 40); ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * .8); } ctx.closePath(); ctx.fill(); }); }
        if (L.bolt && Math.sin(t * 3) > .7) { ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); let x = h4(Math.floor(t * 3)) * W, y = 0; ctx.moveTo(x, y); while (y < H * .7) { y += 50; x += (h4(y + t) - .5) * 80; ctx.lineTo(x, y); } ctx.stroke(); ctx.restore(); C4.glow(W / 2, H / 2, 700, '#e8f0ff', .15); }
        if (L.sun) { C4.glow(W * .82, H * .3, 420, '#ffcf6b', .5); C4.rays(W * .82, H * .3, t, 18, 380, '#ffe9a8', .4); }
        if (L.city) { C4.ridge(.5, H * .9, 60, '#2a1050', 2); for (let k = 0; k < 18; k++) { const x = k * 76 + 10; C4.layer(.5, () => { ctx.fillStyle = 'rgba(255,214,120,.8)'; ctx.fillRect(x, H * .9 - 40 - h4(k) * 90, 4, 4); }); } }
        if (L.sea) { ctx.save(); ctx.strokeStyle = 'rgba(190,240,255,.25)'; ctx.lineWidth = 2; for (let k = 0; k < 7; k++) { ctx.beginPath(); for (let x = 0; x <= W; x += 30) { const y = H * .7 + k * 22 + Math.sin(x * .02 + t * 1.5 + k) * 8; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); } ctx.restore(); }
        if (L.glass) for (let k = 0; k < 9; k++) { ctx.save(); ctx.translate(h4(k) * W, h4(k + 4) * H); ctx.rotate(t * .3 + k); ctx.strokeStyle = 'rgba(232,208,255,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(20, 10); ctx.lineTo(-16, 18); ctx.closePath(); ctx.stroke(); ctx.restore(); }
        if (L.void) for (let k = 0; k < 6; k++) C4.tendril(W + 40, k * 130, W * .6, H * .5, .5 + .2 * Math.sin(t + k), t, k * 2, 22);
        if (L.last) { C4.heart(W * .82, H * .3, 1.2, t, '#ffe9a8'); C4.rays(W * .82, H * .3, t, 14, 420, '#ffe9a8', .3); }
        // rota tracejada e o destino
        ctx.save(); ctx.setLineDash([4, 14]); ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 4; ctx.beginPath(); for (let k = 0; k <= 1.001; k += .02) { const [x, y] = pos(k * 4.6 + .2); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore();
        C4.glow(W - 260, 250, 120 + 80 * ez(t / 4), c, .5);
        C4.rocket(pos, t, { s: 1.2, mood: i >= 8 ? 'determined' : 'happy', tc: c });
      });
      const ta = cl4((t - .5) / .6) * cl4((4.5 - t) / .5); ctx.save(); ctx.globalAlpha = ta; ctx.translate((1 - ta) * -40, 0); txt('FASE ' + (i + 1), 90, 100, 26, c, 'left', 900); ctx.shadowColor = c; ctx.shadowBlur = 24; txt(st.name.toUpperCase(), 90, 134, 58, '#fff', 'left', 900); ctx.restore();
      Cine.cap(INTER_CAP[i], t, .8, 4.6); C4.vig(.5); C4.inout(t, 5, .5);
    } };
  }
}
