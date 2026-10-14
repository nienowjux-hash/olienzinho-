'use strict';
// ---------- 54: impactos por tipo de dano, chefes que mudam com a vida, entrada de chefe em letreiro, luz que reage ao combate,
// progresso da fase na cor, habilidade quase pronta, previas animadas nas armas, bokeh de profundidade, cantoneiras por setor,
// fonte de titulo e elenco nos creditos ----------
const Visual54 = { slashes: [], warm: 0 };
const hh54 = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const hx54 = c => typeof c === 'string' && c.length === 7 && c[0] === '#';

// ================= IMPACTOS: cada arma deixa uma marca com forma propria =================
Visual16.impact = function (x, y, crit) {
  const p = G.player, w0 = p ? p.weapon : 'violet', P = G.parts; let w = w0;
  if (w.startsWith('fz_') && WEAPONS[w] && WEAPONS[w].fz) w = pick(WEAPONS[w].fz);
  const dots = (n, cols, sp, life = .4, r = 3) => { for (let i = 0; i < n; i++) { const a = rand(0, TAU), s = rand(.3, 1) * sp; P.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(.5, 1) * life, max: life, r: rand(r * .6, r * 1.4), c: pick(cols), drag: 3 }); } };
  const big = crit ? 1.6 : 1;
  if (w === 'violet') { shedDebris(x, y, Math.round(3 * big), ['#e2d4ff', '#b98cff', '#ffffff'], 230, 6); dots(Math.round(3 * big), ['#ffffff', '#d8c8ff'], 160, .28, 2.2); P.push({ k: 'flash', x, y, vx: 0, vy: 0, life: .09, max: .09, r: 26 * big, c: '#d8c8ff', drag: 1 }); }
  else if (w === 'fan') { for (let i = 0; i < 5 * big; i++) P.push({ x: x + rand(-6, 6), y, vx: rand(-70, 70), vy: rand(-190, -50), life: rand(.35, .65), max: .65, r: rand(2, 4.4), c: pick(['#ffe9a8', '#ffb340', '#ff7a2a']), drag: 1.4 }); }
  else if (w === 'laser') { for (let i = 0; i < 5; i++) P.push({ x, y, vx: rand(-320, 320), vy: rand(-80, 80), life: .2, max: .2, r: 2, c: pick(['#7fe0ff', '#ffffff']), drag: 4 }); P.push({ k: 'flash', x, y, vx: 0, vy: 0, life: .07, max: .07, r: 38, c: '#7fe0ff', drag: 1 }); }
  else if (w === 'cannon') { shedDebris(x, y, Math.round(5 * big), ['#8a5a40', '#5a3a30', '#ff9a5a'], 280, 9); P.push({ k: 'smoke', x, y, vx: rand(-40, 40), vy: rand(-60, -10), life: .7, max: .7, r: rand(14, 22), c: '#6a4a40', drag: 2 }); if (Math.random() < .4) shockwave(x, y, 64, '#ff9a5a'); }
  else if (w === 'boomerang') { if (Visual54.slashes.length < 8) Visual54.slashes.push({ x, y, t: 0, a: rand(0, TAU) }); dots(3, ['#ffe9a8', '#ffffff'], 190, .3, 2.4); }
  else if (w === 'chain') { sparks(x, y, '#9fe8ff', 5, 280); for (let i = 0; i < 2; i++) { const a = rand(0, TAU), L = rand(30, 60); P.push({ k: 'bolt', x, y, x2: x + Math.cos(a) * L, y2: y + Math.sin(a) * L, vx: 0, vy: 0, life: .14, max: .14, r: 3, c: '#9fe8ff', drag: 1 }); } }
  else if (w === 'flame') { for (let i = 0; i < 3; i++) P.push({ x: x + rand(-8, 8), y, vx: rand(-40, 40), vy: rand(-110, -30), life: rand(.5, .8), max: .8, r: rand(7, 13), c: pick(['#4a3a40', '#6a5058']), k: 'smoke', drag: 1.4 }); for (let i = 0; i < 3; i++) P.push({ x: x + rand(-8, 8), y, vx: rand(-60, 60), vy: rand(-170, -40), life: rand(.3, .55), max: .55, r: rand(2, 4), c: pick(['#ffb340', '#ff6a1a', '#ffe9a8']), drag: 1.2 }); }
  else if (w === 'g_C') { for (let i = 0; i < 5; i++) { const a = rand(0, TAU), s = rand(80, 200); P.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: .35, max: .35, r: rand(3, 5), c: pick(['#ffd36a', '#ffb340']), drag: 3 }); } }
  else if (w === 'g_P') { shedDebris(x, y, 4, ['#c8a0b8', '#5a3a58', '#8a6a88'], 240, 8); P.push({ k: 'smoke', x, y, vx: rand(-30, 30), vy: rand(-40, 0), life: .5, max: .5, r: rand(10, 16), c: '#7a6078', drag: 2 }); }
  else if (w === 'g_E') { shockwave(x, y, 50, '#ff7ac8'); dots(3, ['#ffffff', '#ff7ac8'], 150, .3, 2.5); }
  else if (w === 'g_S') { for (let i = 0; i < 5; i++) P.push({ x: x + rand(-8, 8), y, vx: rand(-60, 60), vy: rand(-170, -40), life: rand(.3, .6), max: .6, r: rand(2, 5), c: pick(['#ffb340', '#ff6a1a', '#ffe9a8']), drag: 1.2 }); }
  else dots(4, ['#b98cff', '#e2d4ff', '#ffffff'], 170, .3, 2.5);
  if (crit) shockwave(x, y, 58, '#ffe9a8');
};
{
  const vd = Visual13.draw;
  Visual13.draw = function () {
    vd.call(this); const S = Visual54.slashes; if (!S.length) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (const s of S) { s.t += 1 / 60; const k = s.t / .22; if (k >= 1) continue; ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.a); ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5 * (1 - k) + 1; ctx.beginPath(); ctx.arc(0, 0, 22 + k * 18, -1, 1); ctx.stroke(); ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 28 + k * 22, -.8, .8); ctx.stroke(); ctx.restore(); }
    ctx.restore(); Visual54.slashes = S.filter(s => s.t < .22);
  };
}

// ================= CHEFES MUDAM COM A VIDA: brilho quente, luzes falhando e faiscas =================
{
  const bd = Visual3.bossDraw;
  Visual3.bossDraw = function (b) {
    bd.call(this, b); if (!b || QL() < 1 || b.state === 'intro' || b.state === 'dying' || G.state === 'photo') return; const r = clamp(b.ratio ?? 1, 0, 1); if (r > .5) return; const t = World.t, rad = b.rad || 100;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const k = (.5 - r) / .5;
    drawGlow(b.x, b.y, rad * 1.5, '#ff3a2a', .12 + k * .22 + Math.sin(t * (6 + k * 8)) * .04 * k);
    if (r < .25) for (let i = 0; i < 3; i++) { if (hh54(Math.floor(t * 7) + i * 5) < .55) continue; const a = hh54(i + 11) * TAU, d = hh54(i + 21) * rad * .75; drawGlow(b.x + Math.cos(a) * d, b.y + Math.sin(a) * d, 26, '#ffffff', .55); }
    ctx.restore();
  };
}

// ================= ENTRADA DO CHEFE: barras de cinema e nome em letreiro =================
{
  const dc = Game.drawCinematic;
  Game.drawCinematic = function () {
    dc.call(this); const b = G.boss; if (!b || b.state !== 'intro' || QL() < 1) return; const it = b.introT || 0; if (it > 3.3) return;
    const env = easeOut(clamp(it / .5, 0, 1)) * clamp((3.3 - it) / .4, 0, 1), bh = 64 * env, c = hx54(b.col) ? b.col : '#ffb340'; ctx.save(); ctx.fillStyle = '#03010b'; ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh);
    ctx.restore();
  };
}

// ================= LUZ QUE REAGE: clarao quente nas explosoes grandes e cor da fase conforme avanca =================
{
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) { up.call(this, dt); for (const rg of G.rings) if (rg.max >= 300 && !rg._w) { rg._w = 1; Visual54.warm = Math.min(.5, Visual54.warm + .3); } Visual54.warm = Math.max(0, Visual54.warm - dt * 1.1); };
  const ov = Visual.overlay;
  Visual.overlay = function () {
    ov.call(this); if (QL() < 1 || G.state !== 'play' || !G.stage) return;
    if (Visual54.warm > .02) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Visual54.warm * .3; ctx.fillStyle = '#ff9a3a'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    if (!G.boss && !G.bossPending && G.stage.duration < 1e8) { const k = clamp(G.t / G.stage.duration, 0, 1), c0 = [58, 122, 255], c1 = hx54(G.stage.tint) ? [parseInt(G.stage.tint.slice(1, 3), 16), parseInt(G.stage.tint.slice(3, 5), 16), parseInt(G.stage.tint.slice(5, 7), 16)] : [180, 140, 255], c2 = [255, 90, 58], m = k < .6 ? k / .6 : (k - .6) / .4, A = k < .6 ? c0 : c1, B = k < .6 ? c1 : c2; ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .06 + (k > .6 ? (k - .6) * .12 : 0); ctx.fillStyle = `rgb(${Math.round(A[0] + (B[0] - A[0]) * m)},${Math.round(A[1] + (B[1] - A[1]) * m)},${Math.round(A[2] + (B[2] - A[2]) * m)})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  };
}

// ================= HABILIDADE QUASE PRONTA: anel que respira =================
{
  const dh = Game.drawHud;
  Game.drawHud = function () {
    const r = dh.call(this); const p = G.player; if (!p || QL() < 1 || (typeof Visual83 !== 'undefined' && Visual83.hideAb())) return r; const wp = WEAPONS[p.weapon]; if (!wp) return r;
    const list = [[p.pulseT, p.pulseCd, '#ffb340'], [p.dashCd, p.dashCdMax, '#7fe0ff'], [p.specCd, p.specCdMax, wp.c]]; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.translate(0, H); ctx.scale(.62, .62); ctx.translate(0, -H); list.forEach(([cd, mx, col], i) => { if (!(cd > 0 && cd < 1.1 && mx > 1.2) || !hx54(col)) return; const k = 1 - cd / 1.1; ctx.globalAlpha = .25 + k * .55; ctx.strokeStyle = col; ctx.lineWidth = 3 + k * 2; ctx.beginPath(); ctx.arc(56 + i * 112, H - 66, 32 + Math.sin(World.t * 14) * 2 + k * 4, 0, TAU); ctx.stroke(); });
    ctx.restore(); return r;
  };
}

// ================= PREVIA ANIMADA DENTRO DO CARTAO DA ARMA =================
{
  const wg = Screens.weaponGlyph;
  Screens.weaponGlyph = function (id, x, y, c, t) {
    wg.call(this, id, x, y, c, t); if (G.state !== 'hangar' || QL() < 1 || !hx54(c)) return;
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, 31, 0, TAU); ctx.clip(); ctx.globalCompositeOperation = 'lighter'; const speed = id === 'cannon' ? 38 : id === 'flame' ? 60 : 90;
    for (let i = 0; i < 3; i++) { const k = ((t * speed + i * 30) % 90) / 90, yy = y + 30 - k * 66, xx = x + (i - 1) * (id === 'fan' || id === 'flame' ? 14 : 4); ctx.globalAlpha = (1 - k) * .75; ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(xx, yy, id === 'cannon' ? 5 : 2, id === 'cannon' ? 5 : 6, 0, 0, TAU); ctx.fill(); }
    ctx.restore();
  };
}

// ================= RETRATOS PISCAM =================
{
  const pd = Portraits.draw;
  Portraits.draw = function (who, x, y, size, o) {
    if (QL() < 1) return pd.call(this, who, x, y, size, o); const t = World.t + (who.charCodeAt(0) || 0) * .91, bl = (t % 4.3) < .09 ? 1 - Math.abs((t % 4.3) / .045 - 1) : 0;
    if (bl > 0) { ctx.save(); ctx.translate(x, y); ctx.scale(1, 1 - bl * .06); ctx.translate(-x, -y); pd.call(this, who, x, y, size, o); ctx.restore(); } else pd.call(this, who, x, y, size, o);
  };
}

// ================= BOKEH: circulos desfocados que passam por cima, em jogo e nos menus =================
Visual54.bokeh = function (t, n, a) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const cols = ['#b98cff', '#7fe0ff', '#ffb340', '#ff7ac8']; for (let i = 0; i < n; i++) { const x = ((hh54(i) * W + t * (8 + hh54(i + 4) * 14) * (i % 2 ? 1 : -1)) % (W + 200) + W + 200) % (W + 200) - 100, y = ((hh54(i + 9) * H - t * (6 + hh54(i + 2) * 10)) % (H + 160) + H + 160) % (H + 160) - 80; drawGlow(x, y, 34 + hh54(i + 6) * 50, cols[i % 4], a); } ctx.restore(); };
{
  const fg = Visual12.fg; Visual12.fg = function () { fg.call(this); if (QL() >= 2 && G.state === 'play') Visual54.bokeh(World.t, 6, .05); };
  const wd = World.draw; World.draw = function (cx) { wd.call(this, cx); const s = G.state; if (QL() >= 1 && !['play', 'pause', 'levelup', 'clear', 'over', 'celebrate', 'photo', 'cine', 'story', 'title'].includes(s)) Visual54.bokeh(performance.now() / 1000, 7, .045); };
}

// ================= ELENCO PASSANDO NOS CREDITOS =================
{
  const cr = Screens.credits;
  Screens.credits = function () {
    cr.call(this); if (QL() < 1) return; const t = G.credT || 0, ids = ['O', 'B', 'C', 'P', 'E', 'S', 'X', 'V', 'H', 'Y', 'R', 'K', 'L'].filter(k => typeof CHARS !== 'undefined' && CHARS[k] && Portraits['face_' + k]); if (!ids.length) return;
    ctx.save(); ids.forEach((k, i) => { const x = ((t * 55 + i * 190) % (ids.length * 190 + 200)) - 160, y = H - 96; if (x < -100 || x > W + 100) return; ctx.globalAlpha = .55; Portraits.draw(k, x, y, 56, { mood: 'happy', t }); }); ctx.restore();
  };
}
